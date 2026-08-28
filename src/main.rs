mod api;
mod game;
use axum::{
    extract::{DefaultBodyLimit, Extension, Request},
    routing::{any, get, get_service, post},
    Router,
};
use axum::{
    http::{header::{CACHE_CONTROL, CONTENT_TYPE, RETRY_AFTER}, HeaderName, HeaderValue, StatusCode},
    middleware::{self, Next},
    response::{IntoResponse, Response},
};
use sqlx::any::AnyPoolOptions;
use std::path::Path as FsPath;
use std::sync::Arc;
use std::time::Instant;
use std::{net::SocketAddr, str::FromStr};
use tokio::sync::Mutex;
use tower_http::{
    catch_panic::CatchPanicLayer,
    services::{ServeDir, ServeFile},
    set_header::SetResponseHeaderLayer,
    trace::TraceLayer,
};

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .json()
        .with_env_filter(
            tracing_subscriber::EnvFilter::from_default_env()
                .add_directive("kitchen_table=info".parse().unwrap()),
        )
        .init();
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite:///data/kitchen-table.db?mode=rwc".into());
    api::install_db_drivers();
    let db = AnyPoolOptions::new()
        .max_connections(8)
        .connect(&database_url)
        .await
        .expect("connect database");
    sqlx::migrate!().run(&db).await.expect("migrate database");
    sqlx::query("DELETE FROM rooms WHERE updated_at < $1")
        .bind(api::now_seconds() - 7_776_000)
        .execute(&db)
        .await
        .expect("expire inactive rooms");
    let cleanup_db = db.clone();
    tokio::spawn(async move {
        let day = tokio::time::Duration::from_secs(86_400);
        let mut interval = tokio::time::interval_at(tokio::time::Instant::now() + day, day);
        loop {
            interval.tick().await;
            if let Err(error) = sqlx::query("DELETE FROM rooms WHERE updated_at < $1")
                .bind(api::now_seconds() - 7_776_000)
                .execute(&cleanup_db)
                .await
            {
                tracing::warn!(%error, "inactive room cleanup failed");
            }
        }
    });
    let state = api::AppState {
        db,
        blob: api::blob_store_from_env(),
        build_sha: std::env::var("BUILD_SHA").unwrap_or_else(|_| "development".into()),
        write_lock: Arc::new(Mutex::new(())),
        rate_limits: api::rate_limits(),
    };
    let port = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(8080);
    let addr = SocketAddr::from_str(&format!("0.0.0.0:{port}")).unwrap();
    tracing::info!(%addr, database = if std::env::var_os("DATABASE_URL").is_some() {"supplied"} else {"generated default"}, blob = if state.blob.is_some() {"supplied"} else {"local default"}, "Kitchen Table listening");
    let app = app_router(state, "frontend/dist");
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown())
        .await
        .unwrap();
}

/// Known browser routes are served as the SPA with an HTTP 200. Unknown paths
/// remain genuine 404s, which keeps typos and broken asset URLs observable.
fn app_router(state: api::AppState, static_dir: impl AsRef<FsPath>) -> Router {
    let static_dir = static_dir.as_ref().to_path_buf();
    let spa = get_service(ServeFile::new(static_dir.join("index.html")));
    Router::new()
        .route("/health", get(api::health))
        .route("/api/rooms", post(api::create))
        .route("/api/rooms/{code}", get(api::get_room))
        .route("/api/rooms/{code}/join", post(api::join))
        .route("/api/rooms/{code}/start", post(api::start))
        .route("/api/rooms/{code}/action", post(api::action))
        .route("/api/{*path}", any(api::not_found))
        .route("/", spa.clone())
        .route("/demo", spa.clone())
        .route("/room/{code}", spa.clone())
        .route("/privacy", spa.clone())
        .route("/terms", spa)
        .nest_service("/assets", ServeDir::new(static_dir.join("assets")))
        .route_service("/robots.txt", ServeFile::new(static_dir.join("robots.txt")))
        .route_service("/sitemap.xml", ServeFile::new(static_dir.join("sitemap.xml")))
        .route_service("/sw.js", ServeFile::new(static_dir.join("sw.js")))
        .route_service("/manifest.webmanifest", ServeFile::new(static_dir.join("manifest.webmanifest")))
        .route_service("/icon.svg", ServeFile::new(static_dir.join("icon.svg")))
        .route_service("/apple-touch-icon.png", ServeFile::new(static_dir.join("apple-touch-icon.png")))
        .route_service("/social-card.jpg", ServeFile::new(static_dir.join("social-card.jpg")))
        .fallback(any(not_found_page))
        .with_state(state.clone())
        .layer(middleware::from_fn_with_state(state, rate_limit))
        .layer(Extension(static_dir))
        .layer(DefaultBodyLimit::max(16 * 1024))
        .layer(SetResponseHeaderLayer::if_not_present(
            HeaderName::from_static("x-content-type-options"),
            HeaderValue::from_static("nosniff"),
        ))
        .layer(SetResponseHeaderLayer::if_not_present(
            HeaderName::from_static("referrer-policy"),
            HeaderValue::from_static("strict-origin-when-cross-origin"),
        ))
        .layer(SetResponseHeaderLayer::if_not_present(
            HeaderName::from_static("content-security-policy"),
            HeaderValue::from_static("default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"),
        ))
        .layer(middleware::from_fn(cache_policy))
        .layer(CatchPanicLayer::new())
        .layer(TraceLayer::new_for_http())
}

/// A small per-client window keeps game endpoints useful under accidental or
/// abusive polling. The ingress supplies the first X-Forwarded-For hop.
async fn rate_limit(
    axum::extract::State(state): axum::extract::State<api::AppState>,
    req: Request,
    next: Next,
) -> Response {
    if req.uri().path() == "/health" {
        return next.run(req).await;
    }
    let client = req
        .headers()
        .get("x-forwarded-for")
        .and_then(|h| h.to_str().ok())
        .and_then(|s| s.split(',').next())
        .unwrap_or("local")
        .trim()
        .to_owned();
    let now = Instant::now();
    let mut limits = state.rate_limits.lock().await;
    let entry = limits.entry(client).or_insert((now, 0));
    if now.duration_since(entry.0).as_secs_f32() >= 1.0 {
        *entry = (now, 0);
    }
    entry.1 += 1;
    if entry.1 > 40 {
        return (
            StatusCode::TOO_MANY_REQUESTS,
            [(RETRY_AFTER, HeaderValue::from_static("1"))],
            "Slow down and try again.",
        )
            .into_response();
    }
    drop(limits);
    next.run(req).await
}

/// Browser routes that are not part of the product still receive the designed
/// SPA recovery screen, while preserving HTTP 404 for links and crawlers.
async fn not_found_page(Extension(static_dir): Extension<std::path::PathBuf>) -> Response {
    match tokio::fs::read(static_dir.join("index.html")).await {
        Ok(html) => (
            StatusCode::NOT_FOUND,
            [(CONTENT_TYPE, HeaderValue::from_static("text/html; charset=utf-8"))],
            html,
        )
            .into_response(),
        Err(_) => StatusCode::NOT_FOUND.into_response(),
    }
}

async fn cache_policy(req: Request, next: Next) -> Response {
    let path = req.uri().path();
    let policy = if path.starts_with("/assets/") {
        // Vite fingerprints every file it emits beneath /assets.
        "public, max-age=31536000, immutable"
    } else if path.starts_with("/api/") || path == "/health" {
        // Room state and seat-specific views must never be replayed from a
        // browser or intermediary cache.
        "no-store"
    } else {
        // The shell, manifest, and worker must be revalidated so updates can
        // take effect promptly.
        "no-cache"
    };
    let mut response = next.run(req).await;
    response
        .headers_mut()
        .insert(CACHE_CONTROL, HeaderValue::from_static(policy));
    response
}
async fn shutdown() {
    let ctrl_c = async { tokio::signal::ctrl_c().await.expect("ctrl-c handler") };
    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("signal handler")
            .recv()
            .await;
    };
    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();
    tokio::select! {_=ctrl_c=>{},_=terminate=>{}}
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{body::Body, http::Request};
    use http_body_util::BodyExt;
    use sqlx::any::AnyPoolOptions;
    use std::{fs, sync::Arc};
    use tokio::sync::Mutex;
    use tower::ServiceExt;

    async fn state(database_url: &str) -> api::AppState {
        api::install_db_drivers();
        let db = AnyPoolOptions::new()
            .max_connections(1)
            .connect(database_url)
            .await
            .unwrap();
        sqlx::migrate!().run(&db).await.unwrap();
        api::AppState {
            db,
            blob: None,
            build_sha: "test".into(),
            write_lock: Arc::new(Mutex::new(())),
            rate_limits: api::rate_limits(),
        }
    }

    fn fixture_dir() -> std::path::PathBuf {
        let path =
            std::env::temp_dir().join(format!("kitchen-table-router-test-{}", std::process::id()));
        let _ = fs::remove_dir_all(&path);
        fs::create_dir_all(path.join("assets")).unwrap();
        fs::write(
            path.join("index.html"),
            "<!doctype html><title>Kitchen Table</title>",
        )
        .unwrap();
        fs::write(path.join("assets/app-123.js"), "console.log('kitchen')").unwrap();
        path
    }

    #[tokio::test]
    async fn direct_spa_routes_return_200_and_unknown_paths_do_not() {
        let assets = fixture_dir();
        let app = app_router(state("sqlite::memory:").await, &assets);
        for path in ["/room/ABC123", "/privacy", "/terms"] {
            let response = app
                .clone()
                .oneshot(Request::builder().uri(path).body(Body::empty()).unwrap())
                .await
                .unwrap();
            assert_eq!(response.status(), axum::http::StatusCode::OK, "{path}");
            assert_eq!(response.headers()[CACHE_CONTROL], "no-cache");
        }
        let missing = app
            .oneshot(
                Request::builder()
                    .uri("/not-a-route")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(missing.status(), axum::http::StatusCode::NOT_FOUND);
        let _ = fs::remove_dir_all(assets);
    }

    #[tokio::test]
    async fn cache_policy_is_immutable_only_for_fingerprinted_assets() {
        let assets = fixture_dir();
        let app = app_router(state("sqlite::memory:").await, &assets);
        let asset = app
            .oneshot(
                Request::builder()
                    .uri("/assets/app-123.js")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(asset.status(), axum::http::StatusCode::OK);
        assert_eq!(
            asset.headers()[CACHE_CONTROL],
            "public, max-age=31536000, immutable"
        );
        let _ = fs::remove_dir_all(assets);
    }

    #[tokio::test]
    async fn malformed_game_json_has_a_product_error_not_an_axum_rejection() {
        let assets = fixture_dir();
        let app = app_router(state("sqlite::memory:").await, &assets);
        let response = app
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/api/rooms")
                    .header("content-type", "application/json")
                    .body(Body::from(r#"{"game":"invalid","nickname":"valid"}"#))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), axum::http::StatusCode::BAD_REQUEST);
        let bytes = response.into_body().collect().await.unwrap().to_bytes();
        assert_eq!(
            serde_json::from_slice::<serde_json::Value>(&bytes).unwrap()["error"],
            "The request body was not valid. Check the game and try again."
        );
        let _ = fs::remove_dir_all(assets);
    }

    #[tokio::test]
    async fn endpoints_rate_limit_by_forwarded_client_and_include_retry_after() {
        let assets = fixture_dir();
        let app = app_router(state("sqlite::memory:").await, &assets);
        for _ in 0..40 {
            let response = app
                .clone()
                .oneshot(
                    Request::builder()
                        .uri("/privacy")
                        .header("x-forwarded-for", "203.0.113.9, 10.0.0.1")
                        .body(Body::empty())
                        .unwrap(),
                )
                .await
                .unwrap();
            assert_ne!(response.status(), axum::http::StatusCode::TOO_MANY_REQUESTS);
        }
        let limited = app
            .oneshot(
                Request::builder()
                    .uri("/privacy")
                    .header("x-forwarded-for", "203.0.113.9, 10.0.0.1")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(limited.status(), axum::http::StatusCode::TOO_MANY_REQUESTS);
        assert_eq!(limited.headers()[RETRY_AFTER], "1");
        let _ = fs::remove_dir_all(assets);
    }
}

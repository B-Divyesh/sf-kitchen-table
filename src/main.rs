mod api;
mod game;
use axum::{
    extract::{DefaultBodyLimit, Request},
    routing::{any, get, get_service, post},
    Router,
};
use axum::{
    http::{header::CACHE_CONTROL, HeaderName, HeaderValue},
    middleware::{self, Next},
    response::Response,
};
use sqlx::sqlite::SqlitePoolOptions;
use std::path::Path as FsPath;
use std::sync::Arc;
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
        .unwrap_or_else(|_| "sqlite://kitchen-table.db?mode=rwc".into());
    let db = SqlitePoolOptions::new()
        // The production database lives on a persistent Azure Files mount.
        // This deployment is intentionally capped at one replica; keeping one
        // connection also makes SQLite's single-writer contract explicit.
        .max_connections(1)
        .connect(&database_url)
        .await
        .expect("connect sqlite");
    sqlx::migrate!().run(&db).await.expect("migrate sqlite");
    sqlx::query("DELETE FROM rooms WHERE updated_at < unixepoch() - 7776000")
        .execute(&db)
        .await
        .expect("expire inactive rooms");
    let cleanup_db = db.clone();
    tokio::spawn(async move {
        let day = tokio::time::Duration::from_secs(86_400);
        let mut interval = tokio::time::interval_at(tokio::time::Instant::now() + day, day);
        loop {
            interval.tick().await;
            if let Err(error) =
                sqlx::query("DELETE FROM rooms WHERE updated_at < unixepoch() - 7776000")
                    .execute(&cleanup_db)
                    .await
            {
                tracing::warn!(%error, "inactive room cleanup failed");
            }
        }
    });
    let state = api::AppState {
        db,
        build_sha: std::env::var("BUILD_SHA").unwrap_or_else(|_| "development".into()),
        write_lock: Arc::new(Mutex::new(())),
    };
    let app = app_router(state, "frontend/dist");
    let port = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(8080);
    let addr = SocketAddr::from_str(&format!("0.0.0.0:{port}")).unwrap();
    tracing::info!(%addr,"Kitchen Table listening");
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
        .route("/room/{code}", spa.clone())
        .route("/privacy", spa.clone())
        .route("/terms", spa)
        .fallback_service(ServeDir::new(static_dir))
        .with_state(state)
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
    use sqlx::sqlite::SqlitePoolOptions;
    use std::{fs, sync::Arc};
    use tokio::sync::Mutex;
    use tower::ServiceExt;

    async fn state(database_url: &str) -> api::AppState {
        let db = SqlitePoolOptions::new()
            .max_connections(1)
            .connect(database_url)
            .await
            .unwrap();
        sqlx::migrate!().run(&db).await.unwrap();
        api::AppState {
            db,
            build_sha: "test".into(),
            write_lock: Arc::new(Mutex::new(())),
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
}

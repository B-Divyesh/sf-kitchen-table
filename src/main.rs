mod api;
mod game;
use axum::http::{HeaderName, HeaderValue};
use axum::{
    extract::DefaultBodyLimit,
    routing::{get, post},
    Router,
};
use sqlx::sqlite::SqlitePoolOptions;
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
        .max_connections(8)
        .connect(&database_url)
        .await
        .expect("connect sqlite");
    sqlx::migrate!().run(&db).await.expect("migrate sqlite");
    let state = api::AppState {
        db,
        build_sha: std::env::var("BUILD_SHA").unwrap_or_else(|_| "development".into()),
        write_lock: Arc::new(Mutex::new(())),
    };
    let static_files = ServeDir::new("frontend/dist")
        .not_found_service(ServeFile::new("frontend/dist/index.html"));
    let app=Router::new().route("/health",get(api::health)).route("/api/rooms",post(api::create)).route("/api/rooms/{code}",get(api::get_room)).route("/api/rooms/{code}/join",post(api::join)).route("/api/rooms/{code}/start",post(api::start)).route("/api/rooms/{code}/action",post(api::action)).fallback_service(static_files).with_state(state).layer(DefaultBodyLimit::max(16 * 1024)).layer(SetResponseHeaderLayer::if_not_present(HeaderName::from_static("x-content-type-options"),HeaderValue::from_static("nosniff"))).layer(SetResponseHeaderLayer::if_not_present(HeaderName::from_static("referrer-policy"),HeaderValue::from_static("strict-origin-when-cross-origin"))).layer(SetResponseHeaderLayer::if_not_present(HeaderName::from_static("content-security-policy"),HeaderValue::from_static("default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"))).layer(CatchPanicLayer::new()).layer(TraceLayer::new_for_http());
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

mod config;
mod routes;
mod agents;
mod models;
mod document_processor;
mod ollama;

use axum::{Router, routing::get};
use tower_http::cors::CorsLayer;
use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let app = Router::new()
        .route("/", get(|| async { "PostGrad API is running" }))
        .route("/health", get(health_check))
        .nest("/api/v1", routes::router())
        .layer(CorsLayer::permissive());

    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));
    println!("PostGrad API running on http://localhost:8000");

    axum::serve(
        tokio::net::TcpListener::bind(&addr).await.unwrap(),
        app.into_make_service()
    )
    .await
    .unwrap();
}

async fn health_check() -> &'static str {
    "Thugin it out"
}
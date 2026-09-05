mod agents;
mod config;
mod document_processor;
mod models;
mod ollama;
mod routes;
use axum::{Router, response::IntoResponse, routing::get};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    if let Err(e) = database_check().await {
        eprintln!("Database setup failed: {}", e);
    }

    let app = Router::new()
        .route("/", get(|| async { "PostGrad API is running" }))
        .route("/health", get(health_check))
        .nest("/api/v1", routes::router())
        .layer(CorsLayer::permissive());

    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));
    println!("PostGrad API running on http://localhost:8000");

    axum::serve(
        tokio::net::TcpListener::bind(&addr).await.unwrap(),
        app.into_make_service(),
    )
    .await
    .unwrap();
}

async fn health_check() -> &'static str {
    "Thugin it out"
}

async fn database_check() -> Result<(), sqlx::Error> {
    let options = sqlx::sqlite::SqliteConnectOptions::new()
        .filename("studentdb.db")
        .create_if_missing(true);

    let pool = sqlx::sqlite::SqlitePoolOptions::new()
        .connect_with(options)
        .await?;

    sqlx::query("CREATE TABLE IF NOT EXISTS student_profile (id INTEGER PRIMARY KEY, name TEXT NOT NULL, surname TEXT, year_completed_or_will_complete INTEGER, programming_languages TEXT)")
        .execute(&pool)
        .await?;

    sqlx::query("CREATE TABLE IF NOT EXISTS Curriculum(id INTEGER PRIMARY KEY, day_number INTEGER, topic TEXT, lesson_content TEXT, difficulty TEXT, completed BOOLEAN)")
        .execute(&pool)
        .await?;

    // need database for point system, MELLO LEAVE THIS ALONE ILL DO THIS PART CHIILL OUT
    Ok(())
}

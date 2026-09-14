mod agents;
mod config;
mod document_processor;
mod models;
mod ollama;
mod routes;

use axum::{routing::get, Router};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() {
    // Load .env locally.
    // On Render, environment variables are provided by Render itself.
    dotenvy::dotenv().ok();

    println!("Starting ProGrad API...");

    // Initialize/check the database before starting the HTTP server.
    if let Err(e) = database_check().await {
        eprintln!("Database setup failed: {}", e);
        std::process::exit(1);
    }

    println!("Database connection successful.");

    // Build the application.
    let app = Router::new()
        .route("/", get(root))
        .route("/health", get(health_check))
        .nest("/api/v1", routes::router())
        .layer(CorsLayer::permissive());

    // Render provides PORT through an environment variable.
    // Locally, fall back to port 8000.
    let port: u16 = std::env::var("PORT")
        .unwrap_or_else(|_| "8000".to_string())
        .parse()
        .unwrap_or_else(|_| {
            eprintln!("Invalid PORT value. Falling back to port 8000.");
            8000
        });

    // IMPORTANT:
    // Bind to 0.0.0.0 so Render/external clients can reach the server.
    let addr = SocketAddr::from(([0, 0, 0, 0], port));

    println!("ProGrad API running on {}", addr);

    // Start the HTTP server.
    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind TCP listener");

    axum::serve(listener, app.into_make_service())
        .await
        .expect("HTTP server failed");
}

/// Root endpoint.
async fn root() -> &'static str {
    "ProGrad API is running"
}

/// Health-check endpoint.
///
/// Used by Render and for manually checking whether
/// the backend is alive.
async fn health_check() -> &'static str {
    "Thugin it out"
}

/// Connect to PostgreSQL and ensure the required tables exist.
async fn database_check() -> Result<(), sqlx::Error> {
    let database_url = std::env::var("DATABASE_URL").map_err(|e| {
        sqlx::Error::Configuration(format!("DATABASE_URL must be set: {}", e).into())
    })?;

    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    println!("Connected to PostgreSQL.");

    // Student profiles
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS student_profile (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            surname TEXT,
            year_completed_or_will_complete INTEGER,
            programming_languages TEXT
        )
        "#,
    )
    .execute(&pool)
    .await?;

    // Curriculum
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS curriculum (
            id SERIAL PRIMARY KEY,
            day_number INTEGER,
            topic TEXT,
            lesson_content TEXT,
            difficulty TEXT,
            completed BOOLEAN
        )
        "#,
    )
    .execute(&pool)
    .await?;

    // Struggle log
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS struggle_log (
            id SERIAL PRIMARY KEY,
            day_number INTEGER,
            struggle_count INTEGER DEFAULT 0
        )
        "#,
    )
    .execute(&pool)
    .await?;

    println!("Database tables verified.");

    Ok(())
}

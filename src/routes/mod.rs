mod upload;
mod chat;

use axum::Router;

pub fn router() -> Router {
    Router::new()
        .nest("/upload", upload::router())
        .nest("/chat", chat::router())
}
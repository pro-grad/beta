mod chat;
mod curriculum;
mod upload;

use axum::Router;

pub fn router() -> Router {
    Router::new()
        .nest("/upload", upload::router())
        .nest("/chat", chat::router())
        .nest("/curriculum", curriculum::router())
}

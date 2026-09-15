use crate::agents::prompts::{APTITUDE_PROMPT, DOCUMENT_PROMPT, OBJECTIVE_PROMPT, TASK_PROMPT};
use crate::models::schemas::{ChatRequest, ChatResponse};
use crate::ollama::client::{check_scope, log_struggle, query_ollama};
use axum::{routing::post, Json, Router};

fn simple_rag_lookup(context: &str, query: &str) -> String {
    let query_words: Vec<String> = query
        .to_lowercase()
        .split_whitespace()
        .map(|w| w.to_string())
        .collect();

    let matches: Vec<&str> = context
        .split("\n\n")
        .filter(|chunk| {
            let chunk_lower = chunk.to_lowercase();
            query_words.iter().any(|w| chunk_lower.contains(w.as_str()))
        })
        .collect();

    if matches.is_empty() {
        context.to_string()
    } else {
        matches.join("\n\n")
    }
}

pub fn router() -> Router {
    Router::new().route("/", post(chat_handler))
}

async fn chat_handler(Json(payload): Json<ChatRequest>) -> Json<ChatResponse> {
    let response = format!(
        "Got your message: \"{}\" — I'm here to help with your IT learning journey!",
        payload.prompt
    );
    Json(ChatResponse { response })
}

use axum::{Router, routing::post, Json};
use crate::models::schemas::{ChatRequest, ChatResponse};
use crate::ollama::client::query_ollama;
use crate::agents::prompts::{APTITUDE_PROMPT, DOCUMENT_PROMPT, TASK_PROMPT, OBJECTIVE_PROMPT};

pub fn router() -> Router {
    Router::new().route("/chat", post(chat_handler))
}

async fn chat_handler(Json(payload): Json<ChatRequest>) -> Json<ChatResponse> {
    let system_prompt = match payload.agent_type.as_str() {
        "aptitude" => APTITUDE_PROMPT,
        "document" => DOCUMENT_PROMPT,
        "task" => TASK_PROMPT,
        "objective" => OBJECTIVE_PROMPT,
        _ => DOCUMENT_PROMPT,
    };

    let context = payload.context.join("\n\n");
    let response = query_ollama(system_prompt, &context, &payload.prompt).await;
    Json(ChatResponse { response })
}
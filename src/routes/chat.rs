use crate::agents::prompts::{APTITUDE_PROMPT, DOCUMENT_PROMPT, OBJECTIVE_PROMPT, TASK_PROMPT};
use crate::models::schemas::{ChatRequest, ChatResponse};
use crate::ollama::client::{check_scope, log_struggle, query_ollama};
use axum::{routing::post, Json, Router};

pub fn router() -> Router {
    Router::new().route("/chat", post(chat_handler))
}

async fn chat_handler(Json(payload): Json<ChatRequest>) -> Json<ChatResponse> {
    let scope_check = check_scope(&payload.prompt).await;

    if scope_check.struggle_detected {
        if let Err(e) = log_struggle(payload.day_number).await {
            eprintln!("Failed to log struggle: {}", e);
        }
    }

    if !scope_check.in_scope {
        return Json(ChatResponse {
            response: "I'm here to help with your IT learning journey — let's get back to that! What topic are you working on?".to_string(),
        });
    }

    let system_prompt = match payload.agent_type.as_str() {
        "aptitude" => APTITUDE_PROMPT,
        "document" => DOCUMENT_PROMPT,
        "task" => TASK_PROMPT,
        "objective" => OBJECTIVE_PROMPT,
        _ => DOCUMENT_PROMPT,
    };

    let mut context = payload.context.join("\n\n");
    if scope_check.needs_rag {
        if let Some(query) = &scope_check.search_query {
            context = format!("{}\n\n[RAG lookup needed for: {}]", context, query);
        }
    }

    let response = query_ollama(system_prompt, &context, &payload.prompt).await;
    Json(ChatResponse { response })
}

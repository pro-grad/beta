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

    let context = payload.context.join("\n\n");
    let context = if scope_check.needs_rag {
        if let Some(query) = &scope_check.search_query {
            simple_rag_lookup(&context, query)
        } else {
            context
        }
    } else {
        context
    };

    let response = query_ollama(system_prompt, &context, &payload.prompt).await;
    Json(ChatResponse { response })
}

use reqwest;
use serde_json::json;
use crate::agents::prompts::SCOPE_CHECK_PROMPT;
use crate::models::schemas::ScopeCheckResult;


pub async fn check_scope(user_message: &str) -> ScopeCheckResult {
    let raw_output = query_ollama(SCOPE_CHECK_PROMPT, "", user_message).await;
    serde_json::from_str(&raw_output).unwrap_or(ScopeCheckResult {
        in_scope: true,
        needs_rag: false,
        search_query: None,
    })
}

pub async fn query_ollama(system_prompt: &str, context: &str, question: &str) -> String {
    let full_prompt = format!(
        "{}\n\nContext:\n{}\n\nUser question: {}\n\nResponse:",
        system_prompt, context, question
    );

    let client = reqwest::Client::new();
    let response = client
        .post("http://localhost:11434/api/generate")
        .json(&json!({
            "model": "prograd-local:latest",
            "prompt": full_prompt,
            "stream": false,
            "options": {
                "temperature": 0.3,
                "num_predict": 512
            }
        }))
        .timeout(std::time::Duration::from_secs(90))
        .send()
        .await;

    match response {
        Ok(res) => {
            if let Ok(json) = res.json::<serde_json::Value>().await {
                json.get("response")
                    .and_then(|v| v.as_str())
                    .unwrap_or("No response generated.")
                    .to_string()
            } else {
                "Failed to parse Ollama response.".to_string()
            }
        }
        Err(e) => format!("Error connecting to Ollama: {}", e),
    }
}
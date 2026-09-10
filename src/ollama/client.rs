use crate::agents::prompts::{CURRICULUM_PROMPT, SCOPE_CHECK_PROMPT};
use crate::models::schemas::{Lessons30Days, ScopeCheckResult};
use reqwest;
use serde_json::json;

pub async fn check_scope(user_message: &str) -> ScopeCheckResult {
    let raw_output = query_ollama(SCOPE_CHECK_PROMPT, "", user_message).await;
    serde_json::from_str(&raw_output).unwrap_or(ScopeCheckResult {
        in_scope: true,
        needs_rag: false,
        search_query: None,
        struggle_detected: false,
    })
}

pub async fn save_curriculum(curriculum: &Lessons30Days) -> Result<(), sqlx::Error> {
    let options = sqlx::postgres::PgConnectOptions::new()
        .host("localhost")
        .port(5432)
        .username("postgres")
        .password("newpassword123")
        .database("prograd");

    let pool = sqlx::postgres::PgPoolOptions::new()
        .connect_with(options)
        .await?;

    for day in &curriculum.days {
        sqlx::query(
            "INSERT INTO Curriculum (day_number, topic, difficulty, completed) VALUES (?, ?, ?, ?)",
        )
        .bind(day.day_number)
        .bind(&day.topic)
        .bind(&day.difficulty)
        .bind(false)
        .execute(&pool)
        .await?;
    }

    Ok(())
}

pub async fn lesson_planner(user_message: &str) -> Lessons30Days {
    let raw_output = query_ollama(CURRICULUM_PROMPT, "", user_message).await;
    serde_json::from_str(&raw_output).unwrap_or(Lessons30Days { days: vec![] })
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

pub async fn log_struggle(day_number: i32) -> Result<(), sqlx::Error> {
    let options = sqlx::postgres::PgConnectOptions::new()
        .host("localhost")
        .port(5432)
        .username("postgres")
        .password("newpassword123")
        .database("prograd");

    let pool = sqlx::postgres::PgPoolOptions::new()
        .connect_with(options)
        .await?;

    let existing = sqlx::query_scalar::<_, i32>(
        "SELECT struggle_count FROM struggle_log WHERE day_number = $1",
    )
    .bind(day_number)
    .fetch_optional(&pool)
    .await?;

    match existing {
        Some(count) => {
            sqlx::query("UPDATE struggle_log SET struggle_count = $1 WHERE day_number = $2")
                .bind(count + 1)
                .bind(day_number)
                .execute(&pool)
                .await?;
        }
        None => {
            sqlx::query("INSERT INTO struggle_log (day_number, struggle_count) VALUES ($1, 1)")
                .bind(day_number)
                .execute(&pool)
                .await?;
        }
    }

    Ok(())
}

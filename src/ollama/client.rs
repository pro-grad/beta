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
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let pool = sqlx::postgres::PgPoolOptions::new()
        .connect(&database_url)
        .await?;

    for day in &curriculum.days {
        sqlx::query(
            "INSERT INTO Curriculum (day_number, topic, difficulty, completed) VALUES ($1, $2, $3, $4)",
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
    let api_key = std::env::var("GEMINI_API_KEY").unwrap_or_default();

    let full_prompt = format!(
        "{}\n\nContext:\n{}\n\nUser question: {}",
        system_prompt, context, question
    );

    let client = reqwest::Client::new();
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={}",
        api_key
    );

    let response = client
        .post(&url)
        .json(&json!({
            "contents": [{ "parts": [{ "text": full_prompt }] }]
        }))
        .timeout(std::time::Duration::from_secs(30))
        .send()
        .await;

    match response {
        Ok(res) => {
            let status = res.status();
            let text = res.text().await.unwrap_or_default();
            if status.is_success() {
                serde_json::from_str::<serde_json::Value>(&text)
                    .ok()
                    .and_then(|json| {
                        json["candidates"][0]["content"]["parts"][0]["text"]
                            .as_str()
                            .map(|s| s.to_string())
                    })
                    .unwrap_or_else(|| format!("Could not parse response: {}", text))
            } else {
                format!("Gemini error {}: {}", status, text)
            }
        }
        Err(e) => format!("Error connecting to Gemini: {}", e),
    }
}

pub async fn log_struggle(day_number: i32) -> Result<(), sqlx::Error> {
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let pool = sqlx::postgres::PgPoolOptions::new()
        .connect(&database_url)
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

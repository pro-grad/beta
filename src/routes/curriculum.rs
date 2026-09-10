use crate::models::schemas::{CurriculumRequest, CurriculumResponse};
use crate::ollama::client::{lesson_planner, save_curriculum};
use axum::{routing::post, Json, Router};

pub fn router() -> Router {
    Router::new().route("/curriculum", post(curriculum_handler))
}

async fn curriculum_handler(Json(payload): Json<CurriculumRequest>) -> Json<CurriculumResponse> {
    let combined_input = format!(
        "Weak topics: {}\nStrong topics: {}\nSkill level: {}\nSpecialty: {}",
        payload.weak_topics,
        payload.strong_topics,
        payload.practical_skill_level,
        payload.target_speciality
    );

    let curriculum = lesson_planner(&combined_input).await;

    if let Err(e) = save_curriculum(&curriculum).await {
        eprintln!("Failed to save curriculum: {}", e);
    }

    Json(CurriculumResponse { curriculum })
}

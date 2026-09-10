use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct ChatRequest {
    pub prompt: String,
    pub context: Vec<String>,
    pub agent_type: String,
    pub day_number: i32,
}

#[derive(Debug, Serialize)]
pub struct ChatResponse {
    pub response: String,
}

#[derive(Debug, Serialize)]
pub struct UploadResponse {
    pub filename: String,
    pub chunks: Vec<String>,
    pub chunk_count: usize,
    pub preview: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ScopeCheckResult {
    pub in_scope: bool,
    pub needs_rag: bool,
    pub search_query: Option<String>,
    pub struggle_detected: bool,
}

// for lesson planner
#[derive(Debug, Serialize, Deserialize)]
pub struct Lessonsday {
    pub day_number: i32,
    pub topic: String,
    pub difficulty: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Lessons30Days {
    pub days: Vec<Lessonsday>,
}

#[derive(Debug, Deserialize)]
pub struct CurriculumRequest {
    pub weak_topics: String,
    pub strong_topics: String,
    pub practical_skill_level: String,
    pub target_speciality: String,
}

#[derive(Debug, Serialize)]
pub struct CurriculumResponse {
    pub curriculum: Lessons30Days,
}

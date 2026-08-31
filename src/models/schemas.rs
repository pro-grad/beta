use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct ChatRequest {
    pub prompt: String,
    pub context: Vec<String>,
    pub agent_type: String,
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
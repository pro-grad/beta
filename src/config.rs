use std::env;

pub struct Config {
    pub ollama_url: String,
    pub model_name: String,
    pub chunk_size: usize,
    pub chunk_overlap: usize,
}

impl Config {
    pub fn from_env() -> Self {
        Self {
            ollama_url: env::var("OLLAMA_URL").unwrap_or("http://localhost:11434".to_string()),
            model_name: env::var("MODEL_NAME").unwrap_or("qwen2.5:7b".to_string()),
            chunk_size: env::var("CHUNK_SIZE").unwrap_or("1000".to_string()).parse().unwrap_or(1000),
            chunk_overlap: env::var("CHUNK_OVERLAP").unwrap_or("200".to_string()).parse().unwrap_or(200),
        }
    }
}
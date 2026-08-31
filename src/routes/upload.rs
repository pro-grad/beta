use axum::{Router, routing::post, Json};
use axum::extract::multipart::Multipart;
use crate::document_processor::process_file;
use crate::models::schemas::UploadResponse;

pub fn router() -> Router {
    Router::new().route("/upload", post(upload_handler))
}

async fn upload_handler(mut multipart: Multipart) -> Json<UploadResponse> {
    while let Some(mut field) = multipart.next_field().await.unwrap() {
        let name = field.name().unwrap_or("file").to_string();
        if name == "file" {
            // Get the filename BEFORE consuming the field
            let filename = field.file_name().unwrap_or("unknown").to_string();
            
            // Now consume the field to get the bytes
            let data = field.bytes().await.unwrap();
            
            let chunks = process_file(&data, &filename);
            return Json(UploadResponse {
                filename,
                chunks: chunks.clone(),
                chunk_count: chunks.len(),
                preview: chunks.first().map(|c| c[..300.min(c.len())].to_string()),
            });
        }
    }
    Json(UploadResponse {
        filename: "error".to_string(),
        chunks: vec![],
        chunk_count: 0,
        preview: None,
    })
}
use reqwest;
use serde_json;
use unicode_segmentation::UnicodeSegmentation;

fn extract_text(data: &[u8], filename: &str) -> String {
    if filename.ends_with(".pdf") {
        extract_pdf(data)
    } else if filename.ends_with(".docx") {
        extract_docx(data)
    } else {
        String::from_utf8_lossy(data).to_string()
    }
}

fn extract_pdf(data: &[u8]) -> String {
    match pdf_extract::extract_text_from_mem(data) {
        Ok(text) => text,
        Err(e) => format!("PDF extraction failed: {}", e),
    }
}

fn extract_docx(data: &[u8]) -> String {
    match docx_rs::read_docx(data) {
        Ok(docx) => docx
            .document
            .children
            .iter()
            .filter_map(|child| {
                if let docx_rs::DocumentChild::Paragraph(p) = child {
                    Some(p.raw_text())
                } else {
                    None
                }
            })
            .collect::<Vec<_>>()
            .join("\n"),
        Err(e) => format!("DOCX extraction failed: {:?}", e),
    }
}
//before we chunk the doc, we need to translate the doc before we chunk it

pub async fn process_file(data: &[u8], filename: &str, target_lang: Option<&str>) -> Vec<String> {
    let text = extract_text(data, filename);
    let text = match target_lang {
        Some(lang) => translate_text(&text, lang).await,
        None => text,
    };
    chunk_text(&text, 1000, 200)
}

pub async fn translate_text(text: &str, target_lang: &str) -> String {
    let client = reqwest::Client::new();
    let result = client
        .post("https://libretranslate.de/translate")
        .json(&serde_json::json!({
            "q": text,
            "source": "auto",
            "target": target_lang,
            "format": "text"
        }))
        .timeout(std::time::Duration::from_secs(15))
        .send()
        .await;

    match result {
        Ok(res) => {
            if let Ok(json) = res.json::<serde_json::Value>().await {
                json.get("translatedText")
                    .and_then(|v| v.as_str())
                    .unwrap_or(text)
                    .to_string()
            } else {
                text.to_string()
            }
        }
        Err(_) => text.to_string(),
    }
}

fn chunk_text(text: &str, chunk_size: usize, overlap: usize) -> Vec<String> {
    let graphemes: Vec<&str> = text.graphemes(true).collect();
    let total = graphemes.len();
    let mut chunks = Vec::new();
    let mut start = 0;

    while start < total {
        let end = (start + chunk_size).min(total);
        chunks.push(graphemes[start..end].concat());
        if end >= total {
            break;
        }
        start += chunk_size - overlap;
    }
    chunks
}

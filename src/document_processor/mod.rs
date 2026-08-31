use unicode_segmentation::UnicodeSegmentation;

pub fn process_file(data: &[u8], filename: &str) -> Vec<String> {
    let text = extract_text(data, filename);
    chunk_text(&text, 1000, 200)
}

fn extract_text(data: &[u8], filename: &str) -> String {
    if filename.ends_with(".pdf") {
        extract_pdf(data)
    } else if filename.ends_with(".docx") {
        extract_docx(data)
    } else {
        String::from_utf8_lossy(data).to_string()
    }
}

fn extract_pdf(_data: &[u8]) -> String {
    // Placeholder — PDF extraction will be implemented here
    "PDF extraction placeholder".to_string()
}

fn extract_docx(_data: &[u8]) -> String {
    // Placeholder — DOCX extraction will be implemented here
    "DOCX extraction placeholder".to_string()
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
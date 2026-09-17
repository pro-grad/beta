# Pro-Grad

**An offline, multi-agent AI career assistant.**

Built in Rust, React Native, and Qwen2.5. Runs entirely on your machine — no cloud, no API keys, no data leaving your laptop.

---

## What It Does

Pro-Grad is a career assistant with four agents:

| Agent | Purpose |
|-------|---------|
| **Aptitude** | Generates and evaluates career aptitude tests |
| **Document** | Answers questions based on uploaded CVs and job descriptions |
| **Task** | Breaks goals into daily actionable steps |
| **Objective** | Helps set SMART career objectives |

Everything runs locally. You upload a document, ask a question, and get an answer — all without an internet connection.

---

## Architecture

```
Expo App  →  Rust Backend (Axum)  →  Ollama (Qwen2.5)
```

- **Frontend:** React Native (Expo) — mobile-first interface
- **Backend:** Rust with Axum — document processing, agent routing, LLM orchestration
- **Model:** Qwen2.5 running locally via Ollama
- **Document processor:** Rust-based, grapheme-aware chunking for PDF, DOCX, and TXT

---

## Why Rust?

Because the backend needs to be **fast, memory-safe, and deployable as a single binary**. Rust delivers all three. Document processing runs in sub-millisecond time on a laptop.

---

## Repository Structure

```
pro-grad/
├── backend/          # Rust backend (Axum + Ollama)
│   └── README.md     # Full backend documentation
├── frontend/         # React Native (Expo) app
└── README.md         # This file
```

---

## Quick Start

### 1. Start Ollama

```bash
ollama serve
ollama pull qwen2.5:7b
```

### 2. Run the Backend

```bash
cd backend
cargo run --release
```

Backend runs on `http://0.0.0.0:8000`.

### 3. Run the Frontend

```bash
cd frontend/src
npm install
npx expo start --web
```

App runs on `http://localhost:8081`.

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/api/v1/upload` | POST | Upload a document (PDF, DOCX, TXT) |
| `/api/v1/chat` | POST | Send a message to an agent |

Full API reference: [backend/README.md](backend/README.md)

---

## Offline by Design

No cloud APIs. No subscription costs. No third-party data access.

- Documents stay on your machine
- The model runs locally
- The backend and frontend communicate over localhost

Built for environments where internet is expensive, unreliable, or inappropriate for sensitive data.

---

## Backend-Team

Built by a five-person team for a national hackathon.

**Tumelo Tshabalala** - Technical lead (Rust backend, document processor, agent routing)

**Phenyo Moloko** - Co Technical lead (database, front-end to back-end pipeline, system prompt refinement, error handling, deployment)

**Dimpho Magoro** - lead AI engineer (fine-tuning of offline model, front-end optimization, frontier designer for continuous computing architecture)

**Result:** 2nd place, Campus hackathon.

---

## License

MIT

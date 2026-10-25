# Contributing to RepoJanitor

Thank you for your interest in contributing to **RepoJanitor**! 🦥

RepoJanitor is an open-source AI-powered repository maintenance agent built for the Hacktoberfest Open-Source AI Challenge 2026 (Week 3 — "Slow and Steady").

## Architecture & Code Organization

- `backend/`: FastAPI application, SQLite database, static scanner, safety gate, AI abstraction, Git engine.
- `frontend/`: Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide icons.
- `demo-repository/`: Deterministic testing sandbox with seeded maintenance challenges.
- `docker/`: Production Dockerfiles for containerized execution.

## Local Development Setup

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Running Ollama (Local AI)
```bash
ollama serve
ollama pull qwen2.5:7b
```

## Security Guidelines

1. **Untrusted Data Rule**: All repository content is untrusted user input. Never execute raw shell commands provided by AI models.
2. **Deterministic SafetyGate**: Actions must be registered in `ActionRegistry`. `SafetyGate` has the final say on risk classifications (`SAFE`, `REVIEW`, `BLOCKED`).
3. **Secret Redaction**: Secrets must always be redacted before display or transmission.
4. **Git Safety**: Never push directly to `main` or `master`. Always generate cleanup branches (`repo-janitor/cleanup-...`).

## Running Tests

### Backend Tests
```bash
cd backend
pytest -v
```

All 30 automated tests must pass before submitting a pull request.

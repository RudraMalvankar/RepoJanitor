# RepoJanitor 🦥
### *The AI maintainer you never asked for.*

> **Your code is messy. You don't have to be. RepoJanitor cleans up after you. 🦥**

[![Hacktoberfest 2026](https://img.shields.io/badge/Hacktoberfest-2026_AI_Challenge_Week_3-emerald.svg)](https://hacktoberfest.com/)
[![Model](https://img.shields.io/badge/Model-Gemma--2--27B--IT_/_Gemini--1.5--Flash-4285F4.svg)](https://ai.google.dev/gemma)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Next.js 14](https://img.shields.io/badge/Next.js-14_App_Router-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_Python_3.12-009688.svg)](https://fastapi.tiangolo.com/)

**RepoJanitor** is a focused developer tool built for the **Hacktoberfest Open-Source AI Challenge (Week 3: "Slow and Steady")**. The challenge asks developers to build something with open-source AI or open-weight models that rewards laziness by doing boring maintenance work automatically.

RepoJanitor scans any public GitHub repository or local codebase, spots clutter and maintenance debt, invokes open-weight AI (Google Gemma 2 & Gemini API for cloud deployments, or local Ollama for offline machines) to reason about findings, delivers a witty **Janitor's Roast**, verifies safety through a deterministic **SafetyGate**, checks out an isolated cleanup branch, runs automated tests, displays an interactive diff, and generates a GitHub Pull Request in one click.

---

## ⚡ The Problem & Solution

Developers love shipping new features. What developers constantly postpone:
1. **Duplicate Clutter**: Copy-pasted helper utilities (`helpers_old.js`, `utils_copy.py`, duplicate components) accumulating across directories.
2. **TODO Debt Archeology**: Stale `TODO`, `FIXME`, and `HACK` comments from months ago with zero tracking.
3. **Documentation Decay**: Broken internal README links and missing environment variable documentation.
4. **Dead Code & Phantom Files**: Modules with zero references squatting in the repository tree.
5. **Secret Exposure Risk**: Accidentally committed `.env` files or hardcoded credentials.

**RepoJanitor solves this in seconds:**
- **Paste any GitHub URL or local path** — e.g. `facebook/react`, `expressjs/express`, or `./`.
- **Get scored with an animated Circular SVG Health Gauge** — 0 to 100 based on actual detected findings.
- **Read the savage Janitor's Roast** — witty, unvarnished critiques of your maintenance procrastination.
- **Review risk-classified actions** — strict classification into `SAFE` (auto-executable), `REVIEW` (human confirmation needed), and `BLOCKED` (tampering prevented).
- **One-Click Safe Cleanup & PR** — creates an isolated `repo-janitor/cleanup-*` branch, validates with `pytest` / `npm test`, shows unified diff, and publishes a Pull Request.

---

## 🏗️ Architecture & How It Works

```text
User Input (GitHub URL or Local Path)
       │
       ▼
 [ RepoScanner Engine ] (Deterministic Static Analysis)
       │
       ├─► DuplicateDetector: SHA-256 Content & AST Hashing
       ├─► TodoDetector: Stale FIXME / TODO / HACK regex scanner
       ├─► DeadCodeDetector: Import Graph & Reference Mapping
       ├─► DocAnalyzer: README Broken Link & Env Var Checker
       └─► SecretDetector: Pre-Redaction of AWS, GitHub, DB keys ([REDACTED])
       │
       ▼
 [ AI Reasoning & Roast Layer ]
       │
       ├─► Google Gemma 2 & Gemini API (gemini-1.5-flash / gemma-2-9b-it)
       ├─► Local Open-Weight Fallback (Ollama llama3.2 / qwen2.5)
       ├─► The Janitor's Roast Generator
       └─► Health Score Calculation (0-100)
       │
       ▼
 [ Strict SafetyGate ]
       │
       ├── Path Traversal & .git Tampering Protection
       ├── Secret File Isolation (.env, *.pem, *.key)
       └── Risk Classifier: SAFE | REVIEW | BLOCKED
       │
       ▼
 [ Controlled Action Executor ]
       │
       ├── ActionRegistry (remove_duplicate_file, update_readme, remove_unused_file)
       ├── Automatic Rollback Snapshots
       ├── Allowlisted Test Runner (pytest, npm test)
       ├── Git Service (Isolated repo-janitor/cleanup-* Branch)
       └── GitHub PR Generator (Title, Summary, Diff & Safety Attestation)
```

---

## 🚀 Open-Source AI: Google Gemma 2 & Gemini

RepoJanitor is built with a flexible AI provider architecture:

1. **Cloud Deployment (Zero Hardware GPU Requirements)**:
   Powered by Google's open-weight **Gemma 2 (`gemma-2-9b-it`, `gemma-2-27b-it`)** and **Gemini (`gemini-1.5-flash`, `gemini-2.0-flash`)** via Google AI Studio API key (`GEMINI_API_KEY`). Fast sub-second inference, low latency, and free tier availability.
2. **100% Offline / Sovereign Machine (Ollama)**:
   Runs locally with open-weight models (`llama3.2:1b`, `qwen2.5:7b`, `gemma2:9b`) via Ollama (`http://127.0.0.1:11434`). Your source code never leaves your workstation.
3. **Structured JSON Output Schema**:
   All reasoning output adheres strictly to Pydantic contracts (`AIReasoningOutput`), guaranteeing valid severity, risk levels, evidence lists, and auto-fix indicators.
4. **Pre-Inference Secret Redaction**:
   High-entropy tokens and private keys are replaced with `[REDACTED]` *before* code snippets are dispatched to any model.

---

## 🛡️ The RepoJanitor Safety Gate

The AI is never permitted to execute arbitrary shell strings or run unbounded file operations:
- **No Arbitrary Shell**: `subprocess.run(ai_string)` is strictly prohibited. Only allowlisted test commands (`pytest`, `npm test`) are executable.
- **Path Traversal Shield**: All file targets are resolved against canonical root boundaries. Any attempt to modify `../../` or Windows system files is flagged as `BLOCKED`.
- **Protected Branch Invariant**: The agent cannot commit directly to `main` or `master`. All work is isolated in dedicated timestamped branches.
- **Automatic Rollback**: Any file deletion creates an in-memory backup snapshot allowing instantaneous rollback with one click.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router, React, TypeScript, Tailwind CSS, Lucide icons)
- **Visuals**: Animated Circular SVG Gauge (0-100), Janitor's Roast Card, unified diff viewer
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12, Pydantic v2, SQLAlchemy, SQLite)
- **AI Engine**: Google Gemma 2 / Gemini API + Ollama local open-weight engine
- **Repository Analysis**: GitPython, AST analysis, SHA-256 hashing, regex pattern matchers
- **Testing**: pytest (35 automated tests covering scanners, safety gate, secrets, and API)
- **Deployment**: [Render](https://render.com/) via `render.yaml` + Docker compose

---

## 🏁 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git for Windows / macOS / Linux

### 1. Clone the repository
```bash
git clone https://github.com/RudraMalvankar/RepoJanitor.git
cd RepoJanitor
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

For cloud deployment or Google AI Studio access:
```env
AI_PROVIDER=auto
GEMINI_API_KEY=your_google_ai_studio_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

For local offline development with Ollama:
```bash
ollama run llama3.2:1b
```

### 3. Start the Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Interactive FastAPI docs will be live at `http://127.0.0.1:8000/docs`.

### 4. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Real-World Verification Matrix

RepoJanitor has been validated against diverse scenarios:

| Scenario / Target | Expected Behavior | Result |
| :--- | :--- | :--- |
| **Public GitHub URL** (`facebook/react`) | Shallow-clones repository, indexes files, computes Health Score | ✅ Passed |
| **Local Codebase** (`.`) | Scans file tree, detects duplicates, stale TODOs, and broken links | ✅ Passed |
| **Path Traversal Attack** (`../../windows/...`) | SafetyGate intercepts and marks action as `BLOCKED` | ✅ Passed |
| **Secret File Modification** (`.env`, `*.pem`) | SafetyGate blocks deletion or modification | ✅ Passed |
| **Credential in Code** (AWS / GitHub token) | Pre-redacts secret to `[REDACTED]` before AI reasoning | ✅ Passed |
| **Duplicate File Removal** | Safely removes duplicate with automatic rollback snapshot | ✅ Passed |
| **Protected Branch Defense** | Disallows commits to `main` / `master`; forces cleanup branch | ✅ Passed |
| **Automated Test Suite** | 35 out of 35 pytest tests pass in < 5 seconds | ✅ Passed |

---

## ☁️ Deployment on Render

RepoJanitor includes a production `render.yaml` manifest.

1. Fork or push this repository to GitHub.
2. Create a new Web Service on [Render](https://render.com/).
3. Connect your repository — Render auto-detects `render.yaml`.
4. Add your `GEMINI_API_KEY` (and optional `GITHUB_TOKEN`) in the Environment Variables tab.

---

## 🤝 Contributing

Contributions are welcome!
1. Fork the repository: `git checkout -b feat/my-improvement`
2. Run automated tests: `cd backend && python -m pytest`
3. Commit using Conventional Commits.
4. Submit a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details. Built by **Rudra Malvankar** for Hacktoberfest 2026.

# RepoJanitor Architecture

RepoJanitor is designed as an agentic pair-programming system that relieves developers of tedious repository maintenance without compromising safety or developer control.

## System Workflow Diagram

```mermaid
flowchart TD
    A["Developer Repository"] --> B["RepoScanner (Static Indexing)"]
    B --> C["Deterministic Detectors"]
    C --> C1["DuplicateDetector (SHA-256)"]
    C --> C2["TodoDetector (FIXME/TODO)"]
    C --> C3["DeadCodeDetector (Import Graph)"]
    C --> C4["DocAnalyzer (README / Env)"]
    C --> C5["SecretDetector (Redaction)"]
    
    C1 & C2 & C3 & C4 & C5 --> D["Health Score Engine"]
    C1 & C2 & C3 & C4 --> E["AI Reasoning (Open-Weight Model)"]
    
    E --> F["Pydantic Structured Output Validation"]
    F --> G["SafetyGate"]
    
    G --> H{"Risk Classification"}
    H -->|SAFE| I["Approve Queue / 1-Click Batch"]
    H -->|REVIEW| J["Developer Review Required"]
    H -->|BLOCKED| K["Strictly Blocked (Secrets / Git)"]
    
    I & J --> L["Controlled ActionExecutor"]
    L --> M["GitService (Isolated Branch)"]
    M --> N["TestRunner (Allowlisted Execution)"]
    N --> O["Unified Diff Engine"]
    O --> P["Pull Request Generator"]
```

## Security Model & Threat Mitigation

| Threat Vector | Mitigation Strategy |
| :--- | :--- |
| **Command Injection** | No `subprocess.run(ai_generated_command)` is ever allowed. All actions map to an explicit, typed `ActionRegistry`. |
| **Prompt Injection** | Code sent to LLMs is explicitly marked as `UNTRUSTED DATA`. The system policy prevents repository content from changing rules. |
| **Secret Leaks** | High-entropy secrets and credential files are redacted before being displayed or sent to models. |
| **Unsafe Git Pushes** | Commits to `main` or `master` are strictly rejected. All changes happen in isolated `repo-janitor/cleanup-*` branches. |
| **Path Traversal** | `SafetyGate.is_path_safe` resolves paths against the repository root and blocks traversal outside repo boundaries. |

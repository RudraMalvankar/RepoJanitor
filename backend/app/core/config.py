import os
from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "RepoJanitor"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    DATABASE_URL: str = "sqlite:///./repojanitor.db"
    
    # AI Configuration
    AI_PROVIDER: str = "ollama"  # "ollama" or "mock"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen2.5:7b"
    AI_TIMEOUT_SECONDS: int = 45
    
    # GitHub Integration
    GITHUB_TOKEN: Optional[str] = None
    GITHUB_API_URL: str = "https://api.github.com"
    
    # Frontend URL for CORS
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Ignore rules for repo scanner
    SCAN_IGNORE_DIRS: List[str] = [
        ".git", "node_modules", "venv", ".venv", "__pycache__",
        "dist", "build", ".next", "coverage", ".pytest_cache",
        ".vscode", ".idea", ".mypy_cache", ".tox"
    ]
    SCAN_IGNORE_FILES: List[str] = [
        "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "poetry.lock"
    ]
    
    # Execution security
    COMMAND_TIMEOUT_SECONDS: int = 30
    MAX_FILE_READ_BYTES: int = 500_000  # 500 KB limit for AI context selection
    
    # Allowed test commands (Safe Allowlist)
    ALLOWED_TEST_COMMANDS: List[str] = [
        "pytest",
        "python -m pytest",
        "python -m unittest",
        "npm test",
        "npm run test",
        "cargo test",
        "go test ./..."
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

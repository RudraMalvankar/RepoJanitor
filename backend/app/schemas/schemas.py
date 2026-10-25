from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import datetime

# --- Enums / Risk Categories ---
# Risk: SAFE, REVIEW, BLOCKED
# Status: PENDING, APPROVED, REJECTED, EXECUTED, FAILED

class HealthBreakdown(BaseModel):
    documentation: int = Field(100, ge=0, le=100)
    code_quality: int = Field(100, ge=0, le=100)
    repository_hygiene: int = Field(100, ge=0, le=100)
    tests: int = Field(100, ge=0, le=100)
    maintenance: int = Field(100, ge=0, le=100)

class RepositoryBase(BaseModel):
    name: str
    path: str
    url: Optional[str] = None
    is_demo: bool = False

class RepositoryCreate(BaseModel):
    path: Optional[str] = None
    url: Optional[str] = None

class RepositoryResponse(BaseModel):
    id: str
    name: str
    path: str
    url: Optional[str] = None
    current_branch: str
    is_demo: bool
    health_score: int
    health_breakdown: Dict[str, Any]
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class FindingResponse(BaseModel):
    id: str
    scan_id: str
    category: str
    file_path: str
    related_file_path: Optional[str] = None
    line_number: Optional[int] = None
    title: str
    description: str
    confidence: float
    severity: str
    risk: str
    evidence: List[str]
    is_ignored: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ScanResponse(BaseModel):
    id: str
    repo_id: str
    status: str
    files_count: int
    lines_count: int
    duration_seconds: float
    summary: Dict[str, Any]
    findings_count: int
    created_at: datetime.datetime

class AIReasoningOutput(BaseModel):
    finding_id: str
    title: str
    severity: str
    risk: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    reason: str
    evidence: List[str]
    recommended_action: Optional[str] = None
    can_auto_fix: bool = False

class ProposedActionResponse(BaseModel):
    id: str
    repo_id: str
    finding_id: Optional[str] = None
    action_type: str
    title: str
    description: str
    risk: str
    requires_approval: bool
    status: str
    details: Dict[str, Any]
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ActionExecutionResponse(BaseModel):
    action_id: str
    status: str
    message: str
    stdout: Optional[str] = None
    stderr: Optional[str] = None

class TestRunResponse(BaseModel):
    id: str
    repo_id: str
    command: str
    passed: bool
    passed_count: int
    failed_count: int
    skipped_count: int
    output: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class DiffFileEntry(BaseModel):
    path: str
    old_path: Optional[str] = None
    new_path: Optional[str] = None
    status: str  # modified, added, deleted
    lines_added: int
    lines_removed: int
    diff_content: str

class DiffResponse(BaseModel):
    branch: str
    base_commit: str
    files_changed: int
    total_added: int
    total_removed: int
    files: List[DiffFileEntry]

class PullRequestRequest(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    target_branch: str = "main"

class PullRequestResponse(BaseModel):
    success: bool
    pr_url: Optional[str] = None
    title: str
    body: str
    branch: str
    is_preview: bool = False
    message: str

class AuditEventResponse(BaseModel):
    id: str
    repo_id: str
    event_type: str
    title: str
    details: Dict[str, Any]
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class SettingsResponse(BaseModel):
    ai_provider: str
    gemini_api_key_configured: bool
    gemini_model: str
    ollama_base_url: str
    ollama_model: str
    ai_available: bool
    github_configured: bool
    scan_ignore_dirs: List[str]

class SettingsUpdate(BaseModel):
    ai_provider: Optional[str] = None
    gemini_api_key: Optional[str] = None
    gemini_model: Optional[str] = None
    ollama_base_url: Optional[str] = None
    ollama_model: Optional[str] = None
    github_token: Optional[str] = None

import os
import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.models import Repository, Scan, Finding, AIAnalysis, ProposedAction, Execution, TestRun, AuditEvent
from app.schemas.schemas import (
    RepositoryCreate, RepositoryResponse, FindingResponse, ScanResponse,
    ProposedActionResponse, ActionExecutionResponse, TestRunResponse,
    DiffResponse, PullRequestRequest, PullRequestResponse, AuditEventResponse,
    SettingsResponse, SettingsUpdate
)
from app.agents.janitor_agent import JanitorAgent
from app.services.ai.ollama_provider import OllamaProvider
from app.services.ai.gemini_provider import GeminiProvider
from app.services.git.git_service import GitService
from app.services.github.github_service import GitHubService

router = APIRouter()

@router.get("/health")
async def health_check():
    gemini = GeminiProvider()
    ollama = OllamaProvider()
    gemini_online = bool(settings.GEMINI_API_KEY)
    ollama_online = await ollama.is_available()
    active_provider = "gemini" if (settings.AI_PROVIDER == "gemini" or (settings.AI_PROVIDER == "auto" and settings.GEMINI_API_KEY)) else settings.AI_PROVIDER

    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "ai_provider": active_provider,
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "gemini_model": settings.GEMINI_MODEL,
        "ollama_available": ollama_online,
        "github_configured": bool(settings.GITHUB_TOKEN)
    }

@router.get("/settings", response_model=SettingsResponse)
async def get_settings():
    ollama = OllamaProvider()
    ollama_online = await ollama.is_available()
    gemini_configured = bool(settings.GEMINI_API_KEY)
    ai_available = gemini_configured or ollama_online
    active_provider = "gemini" if (settings.AI_PROVIDER == "gemini" or (settings.AI_PROVIDER == "auto" and gemini_configured)) else settings.AI_PROVIDER

    return SettingsResponse(
        ai_provider=active_provider,
        gemini_api_key_configured=gemini_configured,
        gemini_model=settings.GEMINI_MODEL,
        ollama_base_url=settings.OLLAMA_BASE_URL,
        ollama_model=settings.OLLAMA_MODEL,
        ai_available=ai_available,
        github_configured=bool(settings.GITHUB_TOKEN),
        scan_ignore_dirs=settings.SCAN_IGNORE_DIRS
    )

@router.post("/settings")
async def update_settings(update: SettingsUpdate):
    if update.ai_provider:
        settings.AI_PROVIDER = update.ai_provider
    if update.gemini_api_key is not None:
        settings.GEMINI_API_KEY = update.gemini_api_key
    if update.gemini_model:
        settings.GEMINI_MODEL = update.gemini_model
    if update.ollama_base_url:
        settings.OLLAMA_BASE_URL = update.ollama_base_url
    if update.ollama_model:
        settings.OLLAMA_MODEL = update.ollama_model
    if update.github_token is not None:
        settings.GITHUB_TOKEN = update.github_token
    return {"message": "Settings updated successfully"}

@router.post("/repos/scan", response_model=RepositoryResponse)
async def create_or_scan_repo(payload: RepositoryCreate, db: Session = Depends(get_db)):
    repo_path = payload.path
    if not repo_path:
        raise HTTPException(status_code=400, detail="Repository path is required.")

    if not os.path.exists(repo_path):
        raise HTTPException(status_code=404, detail=f"Repository path does not exist on disk: {repo_path}")

    # Check if already registered
    repo = db.query(Repository).filter(Repository.path == repo_path).first()
    if not repo:
        repo_name = os.path.basename(os.path.normpath(repo_path)) or "repository"
        repo = Repository(
            name=repo_name,
            path=repo_path,
            url=payload.url,
            is_demo=False
        )
        db.add(repo)
        db.commit()
        db.refresh(repo)

    # Run scan
    agent = JanitorAgent(db, repo.id)
    scan = await agent.run_scan()

    return RepositoryResponse(
        id=repo.id,
        name=repo.name,
        path=repo.path,
        url=repo.url,
        current_branch=repo.current_branch,
        is_demo=repo.is_demo,
        health_score=repo.health_score,
        health_breakdown=json.loads(repo.health_breakdown),
        created_at=repo.created_at,
        updated_at=repo.updated_at
    )

@router.get("/repos/{repo_id}", response_model=RepositoryResponse)
def get_repository(repo_id: str, db: Session = Depends(get_db)):
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    return RepositoryResponse(
        id=repo.id,
        name=repo.name,
        path=repo.path,
        url=repo.url,
        current_branch=repo.current_branch,
        is_demo=repo.is_demo,
        health_score=repo.health_score,
        health_breakdown=json.loads(repo.health_breakdown),
        created_at=repo.created_at,
        updated_at=repo.updated_at
    )

@router.get("/repos/{repo_id}/findings", response_model=List[FindingResponse])
def get_findings(repo_id: str, db: Session = Depends(get_db)):
    latest_scan = db.query(Scan).filter(Scan.repo_id == repo_id).order_by(Scan.created_at.desc()).first()
    if not latest_scan:
        return []

    findings = db.query(Finding).filter(Finding.scan_id == latest_scan.id).all()
    results = []
    for f in findings:
        results.append(FindingResponse(
            id=f.id,
            scan_id=f.scan_id,
            category=f.category,
            file_path=f.file_path,
            related_file_path=f.related_file_path,
            line_number=f.line_number,
            title=f.title,
            description=f.description,
            confidence=f.confidence,
            severity=f.severity,
            risk=f.risk,
            evidence=json.loads(f.evidence_json),
            is_ignored=f.is_ignored,
            created_at=f.created_at
        ))
    return results

@router.post("/repos/{repo_id}/analyze", response_model=List[ProposedActionResponse])
async def analyze_repo(repo_id: str, db: Session = Depends(get_db)):
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    latest_scan = db.query(Scan).filter(Scan.repo_id == repo_id).order_by(Scan.created_at.desc()).first()
    if not latest_scan:
        raise HTTPException(status_code=400, detail="Scan repository before requesting AI analysis.")

    agent = JanitorAgent(db, repo.id)
    actions = await agent.analyze_findings_with_ai(latest_scan.id)

    res = []
    for a in actions:
        res.append(ProposedActionResponse(
            id=a.id,
            repo_id=a.repo_id,
            finding_id=a.finding_id,
            action_type=a.action_type,
            title=a.title,
            description=a.description,
            risk=a.risk,
            requires_approval=a.requires_approval,
            status=a.status,
            details=json.loads(a.details_json),
            created_at=a.created_at
        ))
    return res

@router.get("/repos/{repo_id}/actions", response_model=List[ProposedActionResponse])
def get_actions(repo_id: str, db: Session = Depends(get_db)):
    actions = db.query(ProposedAction).filter(ProposedAction.repo_id == repo_id).all()
    res = []
    for a in actions:
        res.append(ProposedActionResponse(
            id=a.id,
            repo_id=a.repo_id,
            finding_id=a.finding_id,
            action_type=a.action_type,
            title=a.title,
            description=a.description,
            risk=a.risk,
            requires_approval=a.requires_approval,
            status=a.status,
            details=json.loads(a.details_json),
            created_at=a.created_at
        ))
    return res

@router.post("/repos/{repo_id}/actions/{action_id}/approve")
def approve_action(repo_id: str, action_id: str, db: Session = Depends(get_db)):
    action = db.query(ProposedAction).filter(ProposedAction.id == action_id, ProposedAction.repo_id == repo_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    if action.risk == "BLOCKED":
        raise HTTPException(status_code=403, detail="Cannot approve an action classified as BLOCKED.")
    action.status = "APPROVED"
    db.commit()
    return {"status": "APPROVED", "action_id": action.id}

@router.post("/repos/{repo_id}/actions/{action_id}/reject")
def reject_action(repo_id: str, action_id: str, db: Session = Depends(get_db)):
    action = db.query(ProposedAction).filter(ProposedAction.id == action_id, ProposedAction.repo_id == repo_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    action.status = "REJECTED"
    db.commit()
    return {"status": "REJECTED", "action_id": action.id}

@router.post("/repos/{repo_id}/actions/{action_id}/execute", response_model=ActionExecutionResponse)
async def execute_action(repo_id: str, action_id: str, db: Session = Depends(get_db)):
    agent = JanitorAgent(db, repo_id)
    execution = await agent.execute_action(action_id)
    return ActionExecutionResponse(
        action_id=action_id,
        status=execution.status,
        message=execution.stdout or execution.error_message or "",
        stdout=execution.stdout,
        stderr=execution.stderr
    )

@router.post("/repos/{repo_id}/actions/approve-all-safe")
def approve_all_safe(repo_id: str, db: Session = Depends(get_db)):
    safe_actions = db.query(ProposedAction).filter(
        ProposedAction.repo_id == repo_id,
        ProposedAction.risk == "SAFE",
        ProposedAction.status == "PENDING"
    ).all()
    for a in safe_actions:
        a.status = "APPROVED"
    db.commit()
    return {"approved_count": len(safe_actions)}

@router.post("/repos/{repo_id}/actions/execute-all-approved")
async def execute_all_approved(repo_id: str, db: Session = Depends(get_db)):
    approved = db.query(ProposedAction).filter(
        ProposedAction.repo_id == repo_id,
        ProposedAction.status == "APPROVED"
    ).all()
    agent = JanitorAgent(db, repo_id)
    executed = 0
    failed = 0
    for a in approved:
        try:
            ex = await agent.execute_action(a.id)
            if ex.status == "SUCCESS":
                executed += 1
            else:
                failed += 1
        except Exception:
            failed += 1

    # Re-run scan to reflect improved health score
    await agent.run_scan()

    return {"executed": executed, "failed": failed}

@router.post("/repos/{repo_id}/tests", response_model=TestRunResponse)
def run_tests(repo_id: str, command: Optional[str] = None, db: Session = Depends(get_db)):
    agent = JanitorAgent(db, repo_id)
    run = agent.run_tests(command)
    return TestRunResponse(
        id=run.id,
        repo_id=run.repo_id,
        command=run.command,
        passed=run.passed,
        passed_count=run.passed_count,
        failed_count=run.failed_count,
        skipped_count=run.skipped_count,
        output=run.output,
        created_at=run.created_at
    )

@router.get("/repos/{repo_id}/diff", response_model=DiffResponse)
def get_diff(repo_id: str, db: Session = Depends(get_db)):
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    git_service = GitService(repo.path)
    diff_data = git_service.get_diff()
    return DiffResponse(
        branch=diff_data["branch"],
        base_commit=diff_data["base_commit"],
        files_changed=diff_data["files_changed"],
        total_added=diff_data["total_added"],
        total_removed=diff_data["total_removed"],
        files=diff_data["files"]
    )

@router.post("/repos/{repo_id}/branch")
def create_branch(repo_id: str, db: Session = Depends(get_db)):
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    git_service = GitService(repo.path)
    branch_name = git_service.create_janitor_branch()
    repo.current_branch = branch_name
    db.commit()

    agent = JanitorAgent(db, repo.id)
    agent.record_audit("BRANCH_CREATED", f"Created cleanup branch {branch_name}", {"branch": branch_name})

    return {"branch": branch_name}

@router.post("/repos/{repo_id}/pull-request", response_model=PullRequestResponse)
async def create_pull_request(repo_id: str, payload: PullRequestRequest, db: Session = Depends(get_db)):
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    agent = JanitorAgent(db, repo.id)
    git_service = GitService(repo.path)
    branch = git_service.get_current_branch()

    # Commit any uncommitted changes first
    try:
        if branch not in ("main", "master"):
            git_service.commit_changes("🦥 chore(cleanup): automated repository maintenance by RepoJanitor")
    except Exception:
        pass

    # AI summary generation
    changes_summary = {
        "repo_name": repo.name,
        "branch": branch,
        "executed_actions": [a.title for a in db.query(ProposedAction).filter(ProposedAction.repo_id == repo.id, ProposedAction.status == "EXECUTED").all()]
    }
    ai_summary = await agent.ai_provider.generate_pr_summary(changes_summary)

    title = payload.title or ai_summary.get("title", f"🦥 RepoJanitor cleanup ({branch})")
    body = payload.body or ai_summary.get("body", "RepoJanitor automated maintenance.")

    gh_service = GitHubService()
    res = await gh_service.create_pull_request(
        repo_url=repo.url or "https://github.com/demo/repo",
        head_branch=branch,
        base_branch=payload.target_branch,
        title=title,
        body=body
    )

    agent.record_audit("PR_CREATED", f"Pull request: {title}", {"branch": branch, "pr_url": res.get("pr_url")})

    return PullRequestResponse(
        success=res.get("success", True),
        pr_url=res.get("pr_url"),
        title=res.get("title", title),
        body=res.get("body", body),
        branch=branch,
        is_preview=res.get("is_preview", True),
        message=res.get("message", "PR created")
    )

@router.get("/repos/{repo_id}/activity", response_model=List[AuditEventResponse])
def get_activity(repo_id: str, db: Session = Depends(get_db)):
    events = db.query(AuditEvent).filter(AuditEvent.repo_id == repo_id).order_by(AuditEvent.created_at.desc()).all()
    res = []
    for e in events:
        res.append(AuditEventResponse(
            id=e.id,
            repo_id=e.repo_id,
            event_type=e.event_type,
            title=e.title,
            details=json.loads(e.details_json),
            created_at=e.created_at
        ))
    return res

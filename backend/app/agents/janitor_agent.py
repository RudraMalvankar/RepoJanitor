import os
import json
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.models import Repository, Scan, Finding, AIAnalysis, ProposedAction, Execution, TestRun, AuditEvent
from app.services.scanner.repo_scanner import RepoScanner
from app.services.ai.provider import AIProvider
from app.services.ai.ollama_provider import OllamaProvider
from app.services.ai.mock_provider import MockProvider
from app.services.safety.safety_gate import SafetyGate
from app.services.actions.executor import ActionExecutor
from app.services.git.git_service import GitService
from app.services.github.github_service import GitHubService

logger = logging.getLogger("repojanitor.agent")

class JanitorAgent:
    """
    Core orchestrating agent for RepoJanitor.
    Coordinates scanner, AI reasoning, safety verification, and execution.
    """

    def __init__(self, db: Session, repo_id: str):
        self.db = db
        self.repo_id = repo_id
        self.repo_model = db.query(Repository).filter(Repository.id == repo_id).first()
        if not self.repo_model:
            raise ValueError(f"Repository with id '{repo_id}' not found.")

        # Determine AI Provider
        if self.repo_model.is_demo or settings.AI_PROVIDER == "mock":
            self.ai_provider: AIProvider = MockProvider()
        else:
            self.ai_provider = OllamaProvider()

        self.git_service = GitService(self.repo_model.path)
        self.github_service = GitHubService()

    def record_audit(self, event_type: str, title: str, details: Dict[str, Any]):
        event = AuditEvent(
            repo_id=self.repo_id,
            event_type=event_type,
            title=title,
            details_json=json.dumps(details)
        )
        self.db.add(event)
        self.db.commit()

    async def run_scan(self) -> Scan:
        """Runs repository scan, generates findings, and updates health scores."""
        self.record_audit("SCAN_STARTED", "Repository scan started", {"path": self.repo_model.path})

        scanner = RepoScanner(self.repo_model.path)
        scan_results = scanner.scan()

        scan = Scan(
            repo_id=self.repo_id,
            status="completed",
            files_count=scan_results["files_count"],
            lines_count=scan_results["lines_count"],
            duration_seconds=scan_results["duration_seconds"],
            summary=json.dumps(scan_results["summary"])
        )
        self.db.add(scan)
        self.db.commit()

        # Update repository health score
        self.repo_model.health_score = scan_results["health_score"]
        self.repo_model.health_breakdown = json.dumps(scan_results["health_breakdown"])
        self.db.commit()

        # Persist findings
        for f_data in scan_results["findings"]:
            finding = Finding(
                scan_id=scan.id,
                category=f_data["category"],
                file_path=f_data["file_path"],
                related_file_path=f_data.get("related_file_path"),
                line_number=f_data.get("line_number"),
                title=f_data["title"],
                description=f_data["description"],
                confidence=f_data.get("confidence", 1.0),
                severity=f_data.get("severity", "medium"),
                risk=f_data.get("risk", "REVIEW"),
                evidence_json=json.dumps(f_data.get("evidence", []))
            )
            self.db.add(finding)
        self.db.commit()

        self.record_audit("SCAN_COMPLETED", "Repository scan completed", {
            "files_scanned": scan.files_count,
            "issues_found": len(scan_results["findings"]),
            "health_score": scan_results["health_score"]
        })

        return scan

    async def analyze_findings_with_ai(self, scan_id: str) -> List[ProposedAction]:
        """
        Sends structured findings and limited code context to the AI model.
        Generates AIAnalysis records and creates ProposedAction records.
        """
        self.record_audit("AI_ANALYSIS_STARTED", "AI reasoning engine initiated", {"provider": settings.AI_PROVIDER})
        
        findings = self.db.query(Finding).filter(Finding.scan_id == scan_id).all()
        proposed_actions = []

        for finding in findings:
            if finding.is_ignored:
                continue

            # Read limited snippet of file if present
            code_context = ""
            full_file_path = os.path.join(self.repo_model.path, finding.file_path)
            if os.path.exists(full_file_path) and os.path.isfile(full_file_path):
                try:
                    with open(full_file_path, "r", encoding="utf-8", errors="ignore") as f:
                        code_context = f.read(4000)
                except Exception:
                    code_context = ""

            finding_dict = {
                "id": finding.id,
                "category": finding.category,
                "file_path": finding.file_path,
                "related_file_path": finding.related_file_path,
                "title": finding.title,
                "description": finding.description,
                "evidence": json.loads(finding.evidence_json)
            }

            try:
                ai_output = await self.ai_provider.reason_about_finding(finding_dict, code_context)
            except Exception as e:
                logger.warning(f"AI reasoning failed for finding {finding.id}: {e}")
                # Fallback to deterministic reasoning
                ai_output = await MockProvider().reason_about_finding(finding_dict, code_context)

            # Persist AIAnalysis
            analysis = AIAnalysis(
                scan_id=scan_id,
                finding_id=finding.id,
                reasoning=ai_output.reason,
                evidence_json=json.dumps(ai_output.evidence),
                recommended_action=ai_output.recommended_action,
                confidence=ai_output.confidence,
                model_name=getattr(self.ai_provider, "model", "mock-agent"),
                is_demo=self.repo_model.is_demo
            )
            self.db.add(analysis)

            # Create ProposedAction if an action is recommended and not blocked
            if ai_output.recommended_action:
                action_details = {
                    "file_path": finding.file_path,
                    "related_file": finding.related_file_path,
                    "line_number": finding.line_number,
                    "category": finding.category
                }

                # Evaluate with SafetyGate
                risk, requires_approval, reason = SafetyGate.evaluate_action(
                    self.repo_model.path,
                    ai_output.recommended_action,
                    action_details
                )

                action = ProposedAction(
                    repo_id=self.repo_id,
                    finding_id=finding.id,
                    action_type=ai_output.recommended_action,
                    title=f"Fix: {finding.title}",
                    description=f"{ai_output.reason} ({reason})",
                    risk=risk,
                    requires_approval=requires_approval,
                    status="PENDING",
                    details_json=json.dumps(action_details)
                )
                self.db.add(action)
                proposed_actions.append(action)

        self.db.commit()

        self.record_audit("AI_ANALYSIS_COMPLETED", "AI reasoning completed", {
            "analyses_count": len(findings),
            "actions_proposed": len(proposed_actions)
        })

        return proposed_actions

    async def execute_action(self, action_id: str) -> Execution:
        """Safely executes an approved action with rollback capture."""
        action = self.db.query(ProposedAction).filter(ProposedAction.id == action_id).first()
        if not action:
            raise ValueError(f"Action '{action_id}' not found.")

        if action.status not in ("APPROVED", "PENDING"):
            raise ValueError(f"Action cannot be executed in status '{action.status}'.")

        details = json.loads(action.details_json)

        success, message, rollback_data = ActionExecutor.execute(
            self.repo_model.path,
            action.action_type,
            details
        )

        status_str = "SUCCESS" if success else "FAILED"
        execution = Execution(
            action_id=action.id,
            status=status_str,
            rollback_data_json=json.dumps(rollback_data),
            error_message=None if success else message,
            stdout=message if success else None,
            stderr=None if success else message
        )
        self.db.add(execution)

        action.status = "EXECUTED" if success else "FAILED"
        self.db.commit()

        self.record_audit(
            "ACTION_EXECUTED" if success else "ACTION_FAILED",
            f"Action '{action.title}' {'executed' if success else 'failed'}",
            {"action_id": action.id, "type": action.action_type, "message": message}
        )

        return execution

    def run_tests(self, command: Optional[str] = None) -> TestRun:
        """Executes project tests safely."""
        self.record_audit("TEST_STARTED", "Running test suite validation", {"command": command or "auto"})

        success, msg, run_details = ActionExecutor.execute(
            self.repo_model.path,
            "run_tests",
            {"command": command} if command else {}
        )

        test_run = TestRun(
            repo_id=self.repo_id,
            command=run_details.get("command", "test"),
            passed=run_details.get("passed", False),
            passed_count=1 if run_details.get("passed") else 0,
            failed_count=0 if run_details.get("passed") else 1,
            skipped_count=0,
            output=run_details.get("output", msg)
        )
        self.db.add(test_run)
        self.db.commit()

        self.record_audit(
            "TEST_PASSED" if test_run.passed else "TEST_FAILED",
            f"Test execution {'passed' if test_run.passed else 'failed'}",
            {"passed": test_run.passed, "command": test_run.command}
        )

        return test_run

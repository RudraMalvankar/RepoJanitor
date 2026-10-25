from typing import Dict, Any, Optional
from app.schemas.schemas import AIReasoningOutput
from app.services.ai.provider import AIProvider

class MockProvider(AIProvider):
    """
    Deterministic Mock AI Provider for Demo Mode and offline environments.
    Clearly identifies outputs as DEMO MODE.
    """

    async def is_available(self) -> bool:
        return True

    async def reason_about_finding(self, finding: Dict[str, Any], context_code: str) -> AIReasoningOutput:
        cat = finding.get("category", "cleanup")
        finding_id = finding.get("id", "finding_demo")
        file_path = finding.get("file_path", "")

        if cat == "duplicate":
            return AIReasoningOutput(
                finding_id=finding_id,
                title=finding.get("title", "Duplicate file detected"),
                severity="medium",
                risk="SAFE",
                confidence=0.98,
                reason="[DEMO MODE] Exact cryptographic hash match confirms this secondary file is an identical copy. Removing it eliminates code bloat without impacting runtime behavior.",
                evidence=[
                    "SHA-256 hash matches the active implementation",
                    "Redundant file naming convention detected (_old)",
                    "Safe to remove with automatic backup and rollback support"
                ],
                recommended_action="remove_duplicate_file",
                can_auto_fix=True
            )
        elif cat == "secret":
            return AIReasoningOutput(
                finding_id=finding_id,
                title=finding.get("title", "Sensitive credential exposed"),
                severity="critical",
                risk="BLOCKED",
                confidence=1.0,
                reason="[DEMO MODE] Repository files must never contain unencrypted secrets or credentials. Automated AI execution on secret files is blocked by SafetyGate.",
                evidence=[
                    "Matches known sensitive credential pattern",
                    "Action must be manually resolved by developer via secret manager"
                ],
                recommended_action="manual_redaction",
                can_auto_fix=False
            )
        elif cat == "dead_code":
            return AIReasoningOutput(
                finding_id=finding_id,
                title=finding.get("title", "Potentially unused module"),
                severity="medium",
                risk="REVIEW",
                confidence=0.88,
                reason="[DEMO MODE] Static analysis detected 0 imports or references across all repository files. Flagged for developer review to confirm it is not dynamically loaded.",
                evidence=[
                    "0 references found in codebase",
                    "Classified as REVIEW to avoid breaking dynamic reflection"
                ],
                recommended_action="remove_unused_file",
                can_auto_fix=False
            )
        elif cat == "documentation":
            return AIReasoningOutput(
                finding_id=finding_id,
                title=finding.get("title", "Documentation issue"),
                severity="low",
                risk="SAFE",
                confidence=0.95,
                reason="[DEMO MODE] Updating documentation to reflect current repository structure and environment variables poses no runtime risk.",
                evidence=[
                    "Documentation-only modification",
                    "Aligns README with existing repository structure"
                ],
                recommended_action="update_readme",
                can_auto_fix=True
            )
        else:
            return AIReasoningOutput(
                finding_id=finding_id,
                title=finding.get("title", "Stale code comment"),
                severity="low",
                risk="REVIEW",
                confidence=0.90,
                reason="[DEMO MODE] Stale comment indicates incomplete or deprecated code. Review suggested before cleanup.",
                evidence=[
                    "Comment indicates legacy temporary fix",
                    "Source code logic unchanged"
                ],
                recommended_action="resolve_stale_todo",
                can_auto_fix=False
            )

    async def generate_pr_summary(self, changes_summary: Dict[str, Any]) -> Dict[str, str]:
        files_count = len(changes_summary.get("executed_actions", []))
        return {
            "title": f"🦥 RepoJanitor cleanup: automated repository maintenance ({files_count} actions)",
            "body": f"""## What changed
[DEMO MODE] RepoJanitor cleaned repository clutter:
- Safely removed verified redundant duplicate files
- Cleaned stale comments and obsolete scaffolding
- Updated documentation and README specifications

## Validation
- Test suite executed: PASS
- SafetyGate checks: 0 violations, all secrets redacted

## AI Analysis
Model: Demo Mode (Open-weight local reasoning simulation)
Risk Level: Verified SAFE
"""
        }

    async def generate_readme_patch(self, original_readme: str, context: Dict[str, Any]) -> str:
        patch = """

## Environment Configuration
Copy `.env.example` to `.env` and configure your local settings:
```bash
cp .env.example .env
```
"""
        if "## Environment Configuration" not in original_readme:
            return original_readme.strip() + "\n" + patch
        return original_readme

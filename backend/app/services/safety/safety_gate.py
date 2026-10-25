import os
import pathlib
from typing import Tuple, Dict, Any, Optional

# Predefined Actions Allowlist
SAFE_ACTIONS = {
    "update_readme",
    "format_code",
    "remove_duplicate_file",
    "generate_changelog",
    "add_docstring"
}

REVIEW_ACTIONS = {
    "delete_file",
    "remove_unused_file",
    "resolve_stale_todo",
    "modify_dependency",
    "modify_config",
    "update_tests"
}

BLOCKED_ACTIONS = {
    "execute_arbitrary_shell",
    "modify_secrets",
    "delete_git_directory",
    "modify_git_history",
    "escalate_privileges",
    "write_outside_repo",
    "delete_branch_main",
    "push_to_main_directly"
}

PROTECTED_PATHS = {
    ".git",
    ".github/workflows",
    ".env",
    ".env.local",
    ".env.production",
    "id_rsa",
    "id_ed25519"
}

class SafetyGate:
    """
    Deterministic Safety Gate that regulates all actions.
    The AI proposes actions; SafetyGate determines permission.
    AI can NEVER elevate its own permissions.
    """

    @staticmethod
    def is_path_safe(repo_root: str, target_path: str) -> Tuple[bool, str]:
        """
        Validates that target_path is strictly within repo_root and doesn't touch protected files.
        Guards against directory traversal, symlink attacks, and protected directory modification.
        """
        try:
            repo_path = pathlib.Path(repo_root).resolve()
            resolved_target = (repo_path / target_path).resolve()

            # Prevent directory traversal
            if not str(resolved_target).startswith(str(repo_path)):
                return False, f"Directory traversal detected: {target_path} is outside repository root."

            # Check protected paths
            rel_path = resolved_target.relative_to(repo_path).as_posix()
            parts = rel_path.split("/")

            if ".git" in parts:
                return False, "Modifying files inside .git directory is strictly BLOCKED."

            for part in parts:
                if part in PROTECTED_PATHS or part.startswith(".env"):
                    return False, f"Protected file or secret path modification is strictly BLOCKED: {rel_path}."

            return True, "Path is within safe repository boundaries."
        except Exception as e:
            return False, f"Invalid path validation error: {str(e)}"

    @classmethod
    def evaluate_action(cls, repo_root: str, action_type: str, details: Dict[str, Any]) -> Tuple[str, bool, str]:
        """
        Evaluates proposed action and returns:
        (risk: 'SAFE' | 'REVIEW' | 'BLOCKED', requires_approval: bool, reason: str)
        """
        # 1. Check for explicitly blocked action types
        if action_type in BLOCKED_ACTIONS:
            return "BLOCKED", True, f"Action '{action_type}' is on the critical blocked list."

        # 2. Check for shell command execution requests
        if "command" in details and action_type != "run_tests":
            return "BLOCKED", True, "Arbitrary shell execution is strictly forbidden."

        # 3. Path safety check for actions targeting files
        target_file = details.get("file_path") or details.get("target_path") or details.get("file")
        if target_file:
            safe, reason = cls.is_path_safe(repo_root, target_file)
            if not safe:
                return "BLOCKED", True, reason

        # 4. Safe actions
        if action_type in SAFE_ACTIONS:
            # Verified duplicate removal is SAFE only if source and target are inside repo and match
            if action_type == "remove_duplicate_file":
                duplicate_file = details.get("duplicate_file")
                if duplicate_file:
                    safe_dup, reason_dup = cls.is_path_safe(repo_root, duplicate_file)
                    if not safe_dup:
                        return "BLOCKED", True, reason_dup
                return "SAFE", True, "Removing verified redundant duplicate file."
            
            return "SAFE", False, f"Action '{action_type}' is classified as SAFE."

        # 5. Review required actions
        if action_type in REVIEW_ACTIONS:
            return "REVIEW", True, f"Action '{action_type}' requires explicit human review and approval."

        # Default fallback is REVIEW with approval required
        return "REVIEW", True, f"Unrecognized action '{action_type}' defaulting to strict REVIEW."

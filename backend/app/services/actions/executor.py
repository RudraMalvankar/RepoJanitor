import os
import shutil
import subprocess
import json
from typing import Dict, Any, Tuple, Optional
from app.core.config import settings
from app.services.actions.registry import ActionRegistry
from app.services.safety.safety_gate import SafetyGate

class ActionExecutor:
    """
    Controlled Action Executor.
    Enforces SafetyGate validation, strict command allowlists, working-directory limits,
    and automatic rollback capture.
    """

    @classmethod
    def execute(cls, repo_root: str, action_type: str, details: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Executes a registered action.
        Returns (success: bool, message: str, rollback_data: dict).
        """
        # 1. Action must exist in ActionRegistry
        if not ActionRegistry.is_registered(action_type):
            return False, f"Action '{action_type}' is not registered in ActionRegistry.", {}

        # 2. SafetyGate evaluation
        risk, _, reason = SafetyGate.evaluate_action(repo_root, action_type, details)
        if risk == "BLOCKED":
            return False, f"Execution BLOCKED by SafetyGate: {reason}", {}

        # 3. Dispatch to designated safe handler
        if action_type == "remove_duplicate_file" or action_type == "remove_unused_file":
            return cls._handle_remove_file(repo_root, details)
        elif action_type == "update_readme":
            return cls._handle_update_readme(repo_root, details)
        elif action_type == "resolve_stale_todo":
            return cls._handle_resolve_todo(repo_root, details)
        elif action_type == "run_tests":
            return cls._handle_run_tests(repo_root, details)
        else:
            return False, f"No executor handler implemented for '{action_type}'.", {}

    @classmethod
    def rollback(cls, repo_root: str, action_type: str, rollback_data: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Rolls back a previously executed action using preserved rollback data.
        """
        try:
            rel_path = rollback_data.get("file_path")
            if not rel_path:
                return False, "No file_path provided in rollback data."

            full_path = os.path.join(repo_root, rel_path)
            original_content = rollback_data.get("original_content")

            if original_content is not None:
                os.makedirs(os.path.dirname(full_path), exist_ok=True)
                with open(full_path, "w", encoding="utf-8") as f:
                    f.write(original_content)
                return True, f"Successfully restored '{rel_path}'."
            elif rollback_data.get("was_created"):
                if os.path.exists(full_path):
                    os.remove(full_path)
                return True, f"Removed created file '{rel_path}'."
            else:
                return False, "Incomplete rollback metadata."
        except Exception as e:
            return False, f"Rollback failed: {str(e)}"

    @classmethod
    def _handle_remove_file(cls, repo_root: str, details: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        rel_path = details.get("file_path")
        if not rel_path:
            return False, "Missing 'file_path' in details.", {}

        full_path = os.path.join(repo_root, rel_path)
        if not os.path.exists(full_path):
            return False, f"File does not exist: {rel_path}", {}

        # Read content for rollback
        with open(full_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()

        os.remove(full_path)
        return True, f"Safely removed file '{rel_path}'.", {"file_path": rel_path, "original_content": content}

    @classmethod
    def _handle_update_readme(cls, repo_root: str, details: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        rel_path = details.get("file_path", "README.md")
        new_content = details.get("new_content")
        full_path = os.path.join(repo_root, rel_path)

        old_content = ""
        if os.path.exists(full_path):
            with open(full_path, "r", encoding="utf-8", errors="replace") as f:
                old_content = f.read()

        if not new_content:
            # Append standard environment setup if not provided
            env_section = "\n\n## Environment Configuration\n\nCopy `.env.example` to `.env` and fill in required variables.\n"
            new_content = old_content + env_section

        with open(full_path, "w", encoding="utf-8") as f:
            f.write(new_content)

        return True, f"Updated documentation in '{rel_path}'.", {"file_path": rel_path, "original_content": old_content}

    @classmethod
    def _handle_resolve_todo(cls, repo_root: str, details: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        rel_path = details.get("file_path")
        line_num = details.get("line_number")
        if not rel_path or not line_num:
            return False, "Missing 'file_path' or 'line_number' for TODO resolution.", {}

        full_path = os.path.join(repo_root, rel_path)
        if not os.path.exists(full_path):
            return False, f"File does not exist: {rel_path}", {}

        with open(full_path, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()

        old_content = "".join(lines)
        if 1 <= line_num <= len(lines):
            # Remove the specific line
            del lines[line_num - 1]
            with open(full_path, "w", encoding="utf-8") as f:
                f.writelines(lines)
            return True, f"Resolved stale TODO at line {line_num} in '{rel_path}'.", {
                "file_path": rel_path,
                "original_content": old_content
            }
        else:
            return False, f"Line number {line_num} out of bounds.", {}

    @classmethod
    def _handle_run_tests(cls, repo_root: str, details: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Executes test commands strictly verified against the ALLOWED_TEST_COMMANDS list.
        Never runs arbitrary user/AI input strings.
        """
        requested_cmd = details.get("command")

        # Auto-detect test runner if not specified
        if not requested_cmd:
            if os.path.exists(os.path.join(repo_root, "pytest.ini")) or any(f.endswith(".py") for f in os.listdir(repo_root)):
                requested_cmd = "python -m pytest"
            elif os.path.exists(os.path.join(repo_root, "package.json")):
                requested_cmd = "npm test"
            else:
                requested_cmd = "pytest"

        # Validate against safe allowlist
        if requested_cmd not in settings.ALLOWED_TEST_COMMANDS:
            return False, f"Command '{requested_cmd}' is not in the safe test command allowlist.", {}

        try:
            cmd_parts = requested_cmd.split()
            # If command starts with python, use current sys.executable
            import sys
            if cmd_parts[0] in ("python", "python3"):
                cmd_parts[0] = sys.executable

            result = subprocess.run(
                cmd_parts,
                cwd=repo_root,
                capture_output=True,
                text=True,
                timeout=settings.COMMAND_TIMEOUT_SECONDS
            )

            passed = (result.returncode == 0)
            output = (result.stdout + "\n" + result.stderr).strip()

            return passed, f"Tests {'PASSED' if passed else 'FAILED'} (exit code {result.returncode})", {
                "command": requested_cmd,
                "returncode": result.returncode,
                "output": output,
                "passed": passed
            }
        except subprocess.TimeoutExpired:
            return False, f"Test execution timed out after {settings.COMMAND_TIMEOUT_SECONDS}s.", {"output": "Timeout"}
        except Exception as e:
            return False, f"Failed to execute test command: {str(e)}", {"output": str(e)}

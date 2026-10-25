import os
import pytest
from app.services.safety.safety_gate import SafetyGate

def test_safe_action_evaluation(tmp_path):
    repo_dir = str(tmp_path)
    readme = tmp_path / "README.md"
    readme.write_text("# Hello", encoding="utf-8")
    risk, approval, reason = SafetyGate.evaluate_action(
        repo_dir,
        "update_readme",
        {"file_path": "README.md"}
    )
    assert risk == "SAFE"

def test_review_action_evaluation(tmp_path):
    repo_dir = str(tmp_path)
    target = tmp_path / "unused.py"
    target.write_text("x = 1", encoding="utf-8")
    risk, approval, reason = SafetyGate.evaluate_action(
        repo_dir,
        "remove_unused_file",
        {"file_path": "unused.py"}
    )
    assert risk == "REVIEW"
    assert approval is True

def test_path_traversal_blocked(tmp_path):
    repo_dir = str(tmp_path)
    risk, approval, reason = SafetyGate.evaluate_action(
        repo_dir,
        "delete_file",
        {"file_path": "../../windows/system32/cmd.exe"}
    )
    assert risk == "BLOCKED"

def test_dot_git_tampering_blocked(tmp_path):
    repo_dir = str(tmp_path)
    risk, approval, reason = SafetyGate.evaluate_action(
        repo_dir,
        "delete_file",
        {"file_path": ".git/config"}
    )
    assert risk == "BLOCKED"

def test_secret_file_blocked(tmp_path):
    repo_dir = str(tmp_path)
    risk, approval, reason = SafetyGate.evaluate_action(
        repo_dir,
        "delete_file",
        {"file_path": ".env"}
    )
    assert risk == "BLOCKED"

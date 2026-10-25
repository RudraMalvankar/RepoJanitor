import os
import pytest
from app.services.safety.safety_gate import SafetyGate

DEMO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "demo-repository"))

def test_safe_action_evaluation():
    risk, approval, reason = SafetyGate.evaluate_action(
        DEMO_DIR,
        "update_readme",
        {"file_path": "README.md"}
    )
    assert risk == "SAFE"

def test_review_action_evaluation():
    risk, approval, reason = SafetyGate.evaluate_action(
        DEMO_DIR,
        "remove_unused_file",
        {"file_path": "src/services/unused_service.py"}
    )
    assert risk == "REVIEW"
    assert approval is True

def test_path_traversal_blocked():
    risk, approval, reason = SafetyGate.evaluate_action(
        DEMO_DIR,
        "delete_file",
        {"file_path": "../../windows/system32/cmd.exe"}
    )
    assert risk == "BLOCKED"
    assert "Directory traversal" in reason

def test_git_directory_protected():
    risk, approval, reason = SafetyGate.evaluate_action(
        DEMO_DIR,
        "delete_file",
        {"file_path": ".git/config"}
    )
    assert risk == "BLOCKED"
    assert ".git" in reason

def test_secrets_file_protected():
    risk, approval, reason = SafetyGate.evaluate_action(
        DEMO_DIR,
        "delete_file",
        {"file_path": ".env.local"}
    )
    assert risk == "BLOCKED"
    assert "Protected file or secret" in reason

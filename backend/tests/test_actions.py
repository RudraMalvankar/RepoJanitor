import os
import pytest
from app.services.actions.registry import ActionRegistry
from app.services.actions.executor import ActionExecutor

DEMO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "demo-repository"))

def test_action_registry_known_actions():
    assert ActionRegistry.is_registered("remove_duplicate_file") is True
    assert ActionRegistry.is_registered("update_readme") is True
    assert ActionRegistry.is_registered("arbitrary_command") is False

def test_unregistered_action_rejected():
    success, msg, _ = ActionExecutor.execute(DEMO_DIR, "unregistered_hack", {})
    assert success is False
    assert "not registered" in msg

def test_action_execution_and_rollback():
    # Create temporary scratch file in demo repository
    test_file_rel = "temp_action_test.txt"
    test_file_full = os.path.join(DEMO_DIR, test_file_rel)
    with open(test_file_full, "w", encoding="utf-8") as f:
        f.write("Line 1: important content\nLine 2: to preserve")

    assert os.path.exists(test_file_full)

    # Execute remove action
    success, msg, rollback_data = ActionExecutor.execute(
        DEMO_DIR,
        "remove_unused_file",
        {"file_path": test_file_rel}
    )
    assert success is True
    assert not os.path.exists(test_file_full)

    # Perform rollback
    rb_success, rb_msg = ActionExecutor.rollback(
        DEMO_DIR,
        "remove_unused_file",
        rollback_data
    )
    assert rb_success is True
    assert os.path.exists(test_file_full)

    with open(test_file_full, "r", encoding="utf-8") as f:
        restored = f.read()
    assert restored == "Line 1: important content\nLine 2: to preserve"

    # Clean up scratch test file
    os.remove(test_file_full)

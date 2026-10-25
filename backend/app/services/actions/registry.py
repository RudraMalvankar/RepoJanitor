from typing import Dict, Any, Callable, Optional, Tuple
import os

class ActionDefinition:
    def __init__(
        self,
        id: str,
        name: str,
        description: str,
        default_risk: str,
        requires_approval: bool
    ):
        self.id = id
        self.name = name
        self.description = description
        self.default_risk = default_risk
        self.requires_approval = requires_approval

class ActionRegistry:
    """
    Central registry of safe, registered actions.
    The system will NEVER execute an action that is not registered here.
    """
    _actions: Dict[str, ActionDefinition] = {}

    @classmethod
    def register(cls, action_def: ActionDefinition):
        cls._actions[action_def.id] = action_def

    @classmethod
    def get(cls, action_id: str) -> Optional[ActionDefinition]:
        return cls._actions.get(action_id)

    @classmethod
    def is_registered(cls, action_id: str) -> bool:
        return action_id in cls._actions

    @classmethod
    def all_actions(cls) -> Dict[str, ActionDefinition]:
        return dict(cls._actions)

# Initialize standard action definitions
ActionRegistry.register(ActionDefinition(
    id="remove_duplicate_file",
    name="Remove Duplicate File",
    description="Safely removes a verified redundant copy of a duplicate file.",
    default_risk="SAFE",
    requires_approval=True
))

ActionRegistry.register(ActionDefinition(
    id="remove_unused_file",
    name="Remove Unused File",
    description="Removes a file identified as dead/unused with zero references.",
    default_risk="REVIEW",
    requires_approval=True
))

ActionRegistry.register(ActionDefinition(
    id="update_readme",
    name="Update Documentation",
    description="Updates README with missing environment or installation instructions.",
    default_risk="SAFE",
    requires_approval=True
))

ActionRegistry.register(ActionDefinition(
    id="resolve_stale_todo",
    name="Clean Stale TODO",
    description="Removes or resolves a confirmed stale TODO/FIXME comment.",
    default_risk="REVIEW",
    requires_approval=True
))

ActionRegistry.register(ActionDefinition(
    id="format_code",
    name="Format Code",
    description="Cleans whitespace and formatting in code files.",
    default_risk="SAFE",
    requires_approval=False
))

ActionRegistry.register(ActionDefinition(
    id="run_tests",
    name="Execute Test Suite",
    description="Executes project test suite using an allowlisted test runner.",
    default_risk="SAFE",
    requires_approval=False
))

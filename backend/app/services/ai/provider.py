from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from app.schemas.schemas import AIReasoningOutput

class AIProvider(ABC):
    """Abstract interface for open-weight/local AI providers."""

    @abstractmethod
    async def is_available(self) -> bool:
        """Checks if the AI model / daemon is healthy and reachable."""
        pass

    @abstractmethod
    async def reason_about_finding(self, finding: Dict[str, Any], context_code: str) -> AIReasoningOutput:
        """
        Receives finding metadata and sanitized code context, returning
        structured reasoning and recommended actions.
        """
        pass

    @abstractmethod
    async def generate_pr_summary(self, changes_summary: Dict[str, Any]) -> Dict[str, str]:
        """
        Generates professional Git PR title and structured markdown body.
        """
        pass

    @abstractmethod
    async def generate_readme_patch(self, original_readme: str, context: Dict[str, Any]) -> str:
        """
        Generates safe documentation updates (e.g. adding missing env docs or fixing dead links).
        """
        pass

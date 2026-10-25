import os
import re
from typing import Dict, Any, Optional, Tuple
import httpx
from app.core.config import settings

class GitHubService:
    """
    Interacts with GitHub REST API using secure backend environment token.
    Never exposes token to frontend or persists token in database.
    Supports local workflow seamlessly when token is absent.
    """

    def __init__(self, token: Optional[str] = None):
        self.token = token or settings.GITHUB_TOKEN
        self.api_base = settings.GITHUB_API_URL.rstrip("/")

    def is_configured(self) -> bool:
        return bool(self.token)

    @staticmethod
    def parse_repo_url(url: str) -> Optional[Tuple[str, str]]:
        """Extracts (owner, repo) from https://github.com/owner/repo or git@github.com:owner/repo.git"""
        match = re.search(r"github\.com[/:]([^/]+)/([^/\.]+)(?:\.git)?", url)
        if match:
            return match.group(1), match.group(2)
        return None

    async def create_pull_request(
        self,
        repo_url: str,
        head_branch: str,
        base_branch: str = "main",
        title: str = "🦥 RepoJanitor cleanup",
        body: str = "Automated repository maintenance performed by RepoJanitor."
    ) -> Dict[str, Any]:
        """
        Creates a GitHub Pull Request via GitHub REST API.
        If no token is provided, returns preview mode without failing.
        """
        parsed = self.parse_repo_url(repo_url)
        if not parsed:
            return {
                "success": False,
                "is_preview": True,
                "title": title,
                "body": body,
                "branch": head_branch,
                "pr_url": None,
                "message": "Invalid GitHub repository URL format. PR preview generated."
            }

        owner, repo = parsed

        if not self.is_configured():
            # Graceful local fallback
            return {
                "success": True,
                "is_preview": True,
                "title": title,
                "body": body,
                "branch": head_branch,
                "pr_url": f"https://github.com/{owner}/{repo}/compare/{base_branch}...{head_branch}",
                "message": "GitHub token not configured. Generated branch compare link and PR preview."
            }

        headers = {
            "Authorization": f"Bearer {self.token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "RepoJanitor"
        }

        payload = {
            "title": title,
            "body": body,
            "head": head_branch,
            "base": base_branch
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    f"{self.api_base}/repos/{owner}/{repo}/pulls",
                    headers=headers,
                    json=payload
                )

                if res.status_code == 201:
                    pr_data = res.json()
                    return {
                        "success": True,
                        "is_preview": False,
                        "title": title,
                        "body": body,
                        "branch": head_branch,
                        "pr_url": pr_data.get("html_url"),
                        "message": f"Pull request successfully opened at {pr_data.get('html_url')}"
                    }
                else:
                    return {
                        "success": False,
                        "is_preview": True,
                        "title": title,
                        "body": body,
                        "branch": head_branch,
                        "pr_url": None,
                        "message": f"GitHub API error: {res.status_code} - {res.text}"
                    }
        except Exception as e:
            return {
                "success": False,
                "is_preview": True,
                "title": title,
                "body": body,
                "branch": head_branch,
                "pr_url": None,
                "message": f"Failed to contact GitHub API: {str(e)}"
            }

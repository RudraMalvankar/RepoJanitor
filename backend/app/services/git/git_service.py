import os
import datetime
from typing import Dict, Any, List, Optional, Tuple
import git
from git import Repo

class GitService:
    """
    Manages isolated Git operations safely.
    Enforces the rule that 'main' and 'master' are never directly committed to.
    Generates branches in format: repo-janitor/cleanup-YYYYMMDD-HHMMSS
    Calculates unified diffs and stats.
    """

    @classmethod
    def clone_or_update(cls, repo_url: str, target_dir: Optional[str] = None) -> Tuple[str, str]:
        """
        Shallow clones a public remote repository into a local cache directory.
        Returns (local_path, repo_name).
        """
        import re, tempfile
        clean_url = repo_url.strip()
        # Handle github.com/owner/repo or owner/repo format
        if not clean_url.startswith("http://") and not clean_url.startswith("https://") and not clean_url.startswith("git@"):
            clean_url = clean_url.replace("github.com/", "")
            clean_url = f"https://github.com/{clean_url}"

        # Clean trailing slashes
        clean_url = clean_url.rstrip("/")

        # Extract repo name
        parts = clean_url.split("/")
        repo_name = parts[-1].replace(".git", "") if parts else "repo"

        cache_base = target_dir or os.path.join(tempfile.gettempdir(), "repojanitor_repos")
        os.makedirs(cache_base, exist_ok=True)
        dest_path = os.path.join(cache_base, repo_name)

        if os.path.exists(dest_path) and os.path.exists(os.path.join(dest_path, ".git")):
            try:
                repo = Repo(dest_path)
                # Quick fetch to ensure latest
                repo.remotes.origin.pull()
                return dest_path, repo_name
            except Exception:
                return dest_path, repo_name

        # Shallow clone to ensure speed
        Repo.clone_from(clean_url, dest_path, depth=1)
        return dest_path, repo_name

    def __init__(self, repo_path: str):
        self.repo_path = os.path.abspath(repo_path)
        self._repo: Optional[Repo] = None

    @property
    def repo(self) -> Repo:
        if self._repo is None:
            self._repo = Repo(self.repo_path)
        return self._repo

    def is_git_repo(self) -> bool:
        try:
            _ = self.repo.git_dir
            return True
        except Exception:
            return False

    def get_current_branch(self) -> str:
        try:
            return self.repo.active_branch.name
        except Exception:
            return "unknown"

    def get_head_sha(self) -> str:
        try:
            return self.repo.head.commit.hexsha
        except Exception:
            return "unknown"

    def create_janitor_branch(self, prefix: str = "repo-janitor/cleanup") -> str:
        """
        Creates and checks out an isolated cleanup branch.
        Never allows modifying main or master directly.
        """
        timestamp = datetime.datetime.utcnow().strftime("%Y%m%d-%H%M%S")
        branch_name = f"{prefix}-{timestamp}"

        # If repo is dirty, or on main/master, we checkout new branch from HEAD
        new_branch = self.repo.create_head(branch_name)
        new_branch.checkout()
        return branch_name

    def commit_changes(self, message: str) -> str:
        """
        Stages all modified and untracked changes on the current branch and commits.
        Rejects commits directly on main or master.
        """
        current_branch = self.get_current_branch()
        if current_branch in ("main", "master"):
            raise ValueError(f"Direct commit to protected branch '{current_branch}' is strictly forbidden by Git safety policy.")

        self.repo.git.add(A=True)
        commit = self.repo.index.commit(message)
        return commit.hexsha

    def get_diff(self, base_ref: str = "HEAD~1") -> Dict[str, Any]:
        """
        Computes diff, files changed, additions, and deletions.
        """
        files_data: List[Dict[str, Any]] = []
        total_added = 0
        total_removed = 0

        try:
            # Check diff against base_ref or unstaged/staged working tree
            diff_text = self.repo.git.diff(base_ref) if self.repo.head.is_valid() else ""
            
            # Parse diff by file
            for line in diff_text.splitlines():
                if line.startswith("+") and not line.startswith("+++"):
                    total_added += 1
                elif line.startswith("-") and not line.startswith("---"):
                    total_removed += 1

            # Get stat summary
            stats = self.repo.git.diff("--stat", base_ref) if self.repo.head.is_valid() else ""

            # Check individual file diffs
            index_diff = self.repo.head.commit.diff(None) if self.repo.head.is_valid() else []
            for d in index_diff:
                files_data.append({
                    "path": d.b_path or d.a_path,
                    "old_path": d.a_path,
                    "new_path": d.b_path,
                    "status": "modified" if d.change_type == "M" else ("deleted" if d.change_type == "D" else "added"),
                    "lines_added": 0,
                    "lines_removed": 0,
                    "diff_content": str(d)
                })

            return {
                "branch": self.get_current_branch(),
                "base_commit": self.get_head_sha(),
                "files_changed": len(files_data),
                "total_added": total_added,
                "total_removed": total_removed,
                "diff_text": diff_text,
                "stats_summary": stats,
                "files": files_data
            }
        except Exception as e:
            return {
                "branch": self.get_current_branch(),
                "base_commit": self.get_head_sha(),
                "files_changed": 0,
                "total_added": 0,
                "total_removed": 0,
                "diff_text": "",
                "stats_summary": f"Diff calculation: {str(e)}",
                "files": []
            }

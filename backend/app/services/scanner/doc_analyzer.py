import os
import re
from typing import List, Dict

class DocumentationAnalyzer:
    """
    Analyzes documentation (e.g. README.md) for completeness, broken file references,
    missing setup guides, and missing environment documentation.
    """

    @classmethod
    def analyze_readme(cls, repo_root: str, all_files: List[str]) -> List[Dict]:
        findings = []

        readme_candidates = [f for f in all_files if os.path.basename(f).lower() in ("readme.md", "readme.txt", "readme")]
        if not readme_candidates:
            findings.append({
                "category": "documentation",
                "file_path": "README.md",
                "title": "Missing README.md file",
                "description": "The repository is missing a primary README documentation file.",
                "confidence": 1.0,
                "severity": "high",
                "risk": "SAFE",
                "evidence": ["No README.md found in repository root"]
            })
            return findings

        readme_rel = readme_candidates[0]
        readme_path = os.path.join(repo_root, readme_rel)

        try:
            with open(readme_path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()
        except Exception:
            return findings

        # 1. Check for stale/broken file links in markdown: [text](path)
        file_links = re.findall(r"\[.*?\]\((?!https?:\/\/|mailto:|#)([^\)]+)\)", content)
        for link in file_links:
            clean_link = link.split("#")[0].strip()
            if not clean_link:
                continue
            target_on_disk = os.path.normpath(os.path.join(os.path.dirname(readme_path), clean_link))
            if not os.path.exists(target_on_disk):
                findings.append({
                    "category": "documentation",
                    "file_path": readme_rel,
                    "title": f"Broken internal documentation link: '{clean_link}'",
                    "description": f"README references '{clean_link}' which does not exist on disk.",
                    "confidence": 0.98,
                    "severity": "medium",
                    "risk": "SAFE",
                    "evidence": [
                        f"Referenced path '{clean_link}' does not exist in repository",
                        f"Detected inside {readme_rel}"
                    ]
                })

        # 2. Check for missing environment documentation if .env.example exists
        has_env_example = any(os.path.basename(f) in (".env.example", ".env.sample", ".env.template") for f in all_files)
        if has_env_example and "environment" not in content.lower() and ".env" not in content.lower():
            findings.append({
                "category": "documentation",
                "file_path": readme_rel,
                "title": "Undocumented environment configuration",
                "description": "Repository contains environment example files, but README does not mention environment variables.",
                "confidence": 0.92,
                "severity": "low",
                "risk": "SAFE",
                "evidence": [
                    "Detected .env.example / .env.sample file",
                    "No environment setup section in README.md"
                ]
            })

        # 3. Check for minimal / empty README
        if len(content.strip().splitlines()) < 5:
            findings.append({
                "category": "documentation",
                "file_path": readme_rel,
                "title": "Minimal or placeholder README",
                "description": "README contains fewer than 5 lines and lacks installation or usage instructions.",
                "confidence": 0.95,
                "severity": "medium",
                "risk": "SAFE",
                "evidence": [
                    f"README has only {len(content.strip().splitlines())} lines",
                    "Missing installation, usage, or project description"
                ]
            })

        return findings

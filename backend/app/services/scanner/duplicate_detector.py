import os
import hashlib
from typing import Dict, List, Tuple

def compute_sha256(filepath: str) -> str:
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def normalize_code_content(content: str) -> str:
    """Normalizes code content by stripping whitespace and empty lines for fuzzy matching."""
    lines = [line.strip() for line in content.splitlines() if line.strip() and not line.strip().startswith(("#", "//", "/*", "*"))]
    return "".join(lines)

class DuplicateDetector:
    """
    Detects duplicate files in a repository based on exact cryptographic hashes
    and normalized content analysis.
    """

    @classmethod
    def find_duplicates(cls, repo_root: str, file_paths: List[str]) -> List[Dict]:
        duplicates_found = []
        hash_to_files: Dict[str, List[str]] = {}

        # 1. Exact SHA256 match
        for rel_path in file_paths:
            full_path = os.path.join(repo_root, rel_path)
            # Skip empty files
            try:
                if os.path.getsize(full_path) == 0:
                    continue
                file_hash = compute_sha256(full_path)
                hash_to_files.setdefault(file_hash, []).append(rel_path)
            except Exception:
                continue

        # Group matches
        for fhash, files in hash_to_files.items():
            if len(files) > 1:
                # Decide which one is likely the obsolete/redundant copy
                # e.g., files ending with _old, _bak, .backup, or longer names
                primary, redundant = cls._rank_copies(files)
                duplicates_found.append({
                    "category": "duplicate",
                    "file_path": redundant,
                    "related_file_path": primary,
                    "title": f"Duplicate file detected: {os.path.basename(redundant)}",
                    "description": f"File '{redundant}' is an exact cryptographic duplicate of '{primary}'.",
                    "confidence": 1.0,
                    "severity": "medium",
                    "risk": "SAFE",
                    "evidence": [
                        f"Exact SHA-256 match: {fhash[:16]}...",
                        f"Primary file: {primary}",
                        f"Redundant file: {redundant}"
                    ]
                })

        return duplicates_found

    @staticmethod
    def _rank_copies(files: List[str]) -> Tuple[str, str]:
        """
        Determines which file is likely primary and which is redundant.
        Files with 'old', 'backup', 'copy', or 'temp' in the name are prioritized as redundant.
        """
        def redundancy_score(path: str) -> int:
            score = 0
            lower = path.lower()
            if "_old" in lower or "-old" in lower:
                score += 10
            if "copy" in lower:
                score += 8
            if "backup" in lower or ".bak" in lower:
                score += 10
            if "temp" in lower or "tmp" in lower:
                score += 5
            return score

        sorted_files = sorted(files, key=redundancy_score)
        # Primary is lowest redundancy score, redundant is highest
        primary = sorted_files[0]
        redundant = sorted_files[-1]
        return primary, redundant

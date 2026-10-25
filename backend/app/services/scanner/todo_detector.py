import re
import os
from typing import List, Dict

TODO_PATTERN = re.compile(r"""(?i)(?://|#|/\*|<!--|;)\s*(TODO|FIXME|HACK|XXX|OPTIMIZE)\b[:\s]*(.*)""")

class TodoDetector:
    """
    Detects TODO, FIXME, HACK, and XXX comments across codebases,
    extracting line numbers, comment text, and context.
    """

    @classmethod
    def scan_file(cls, repo_root: str, rel_path: str) -> List[Dict]:
        full_path = os.path.join(repo_root, rel_path)
        findings = []

        try:
            with open(full_path, "r", encoding="utf-8", errors="replace") as f:
                lines = f.readlines()
        except Exception:
            return findings

        for idx, line in enumerate(lines, start=1):
            match = TODO_PATTERN.search(line)
            if match:
                marker = match.group(1).upper()
                content = match.group(2).strip()
                # Clean trailing comment closures */ or -->
                content = re.sub(r"(\*/|-->)$", "", content).strip()

                is_stale = cls._assess_staleness(content)
                severity = "medium" if marker in ("FIXME", "HACK") else "low"
                
                findings.append({
                    "category": "todo",
                    "file_path": rel_path,
                    "line_number": idx,
                    "title": f"Stale {marker}: {content[:50]}" if is_stale else f"{marker}: {content[:50]}",
                    "description": f"Found '{marker}' comment at line {idx}: {content}",
                    "confidence": 0.95 if is_stale else 0.85,
                    "severity": severity,
                    "risk": "REVIEW",
                    "evidence": [
                        f"Line {idx}: {line.strip()}",
                        f"Marker: {marker}",
                        f"Likely stale/unresolved: {is_stale}"
                    ]
                })

        return findings

    @staticmethod
    def _assess_staleness(text: str) -> bool:
        lower = text.lower()
        stale_cues = [
            "remove before release", "temporary", "temp fix", "clean up later",
            "quick fix", "deprecated", "legacy", "workaround", "hacky"
        ]
        return any(cue in lower for cue in stale_cues)

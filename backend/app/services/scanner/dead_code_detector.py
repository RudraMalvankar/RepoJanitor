import os
import re
from typing import List, Dict, Set

# Standard entry points that may not be imported directly by other modules
COMMON_ENTRY_POINTS = {
    "main.py", "app.py", "index.js", "index.ts", "server.js", "server.ts",
    "setup.py", "manage.py", "wsgi.py", "asgi.py", "vite.config.ts",
    "next.config.js", "next.config.mjs", "tailwind.config.js", "jest.config.js"
}

CODE_EXTENSIONS = {".py", ".js", ".ts", ".jsx", ".tsx", ".go", ".rs"}

class DeadCodeDetector:
    """
    Detects potentially unused modules and files using an import and reference index.
    Always flags as REVIEW by default and never claims 'definitely unused' without caution.
    """

    @classmethod
    def find_potentially_unused_files(cls, repo_root: str, file_paths: List[str]) -> List[Dict]:
        findings = []

        code_files = [p for p in file_paths if os.path.splitext(p)[1].lower() in CODE_EXTENSIONS]
        if len(code_files) < 3:
            return findings

        # Load all file contents for reference checking
        all_contents: Dict[str, str] = {}
        for p in code_files:
            try:
                full_path = os.path.join(repo_root, p)
                with open(full_path, "r", encoding="utf-8", errors="replace") as f:
                    all_contents[p] = f.read()
            except Exception:
                continue

        for target_path in code_files:
            basename = os.path.basename(target_path)
            stem, ext = os.path.splitext(basename)

            # Skip common entry points, test files, config files, and dunder files (__init__.py)
            if stem.startswith("__") or basename in COMMON_ENTRY_POINTS:
                continue
            if "test" in target_path.lower() or "spec" in target_path.lower():
                continue

            # Check if module name or stem is mentioned anywhere outside itself
            references_count = 0
            referencing_files = []

            # Patterns: import stem, from ... import stem, require('...stem'), from './stem'
            ref_pattern = re.compile(rf"\b{re.escape(stem)}\b")

            for other_path, content in all_contents.items():
                if other_path == target_path:
                    continue
                if ref_pattern.search(content):
                    references_count += 1
                    referencing_files.append(other_path)

            if references_count == 0:
                findings.append({
                    "category": "dead_code",
                    "file_path": target_path,
                    "title": f"Potentially unused file: {basename}",
                    "description": f"File '{target_path}' has 0 references or imports across {len(code_files)} code files.",
                    "confidence": 0.88,
                    "severity": "medium",
                    "risk": "REVIEW",
                    "evidence": [
                        f"0 imports or references found across {len(code_files)} scanned source files",
                        f"Not identified as a standard framework entry point",
                        "Requires manual review before safe removal"
                    ]
                })

        return findings

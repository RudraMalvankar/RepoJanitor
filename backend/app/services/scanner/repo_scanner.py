import os
import time
from typing import Dict, List, Any, Tuple
from app.core.config import settings
from app.services.scanner.duplicate_detector import DuplicateDetector
from app.services.scanner.todo_detector import TodoDetector
from app.services.scanner.dead_code_detector import DeadCodeDetector
from app.services.scanner.doc_analyzer import DocumentationAnalyzer
from app.services.safety.secret_detector import is_sensitive_file, scan_text_for_secrets

class RepoScanner:
    """
    Main deterministic repository scanner.
    Indexes files, collects metadata, runs all detectors, and calculates repository health scores.
    """

    def __init__(self, repo_root: str):
        self.repo_root = os.path.abspath(repo_root)

    def collect_files(self) -> Tuple[List[str], int]:
        """
        Traverses repo_root, respecting ignore rules, and collects all relative file paths.
        Returns (file_paths, total_lines).
        """
        collected = []
        total_lines = 0

        for root, dirs, files in os.walk(self.repo_root):
            # Prune ignored directories
            dirs[:] = [d for d in dirs if d not in settings.SCAN_IGNORE_DIRS]

            for file in files:
                if file in settings.SCAN_IGNORE_FILES:
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, self.repo_root).replace("\\", "/")
                collected.append(rel_path)

                # Count lines for text files
                try:
                    if os.path.getsize(full_path) < 1_000_000:
                        with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                            total_lines += sum(1 for _ in f)
                except Exception:
                    pass

        return collected, total_lines

    def scan(self) -> Dict[str, Any]:
        """
        Executes complete repository scan and returns structured findings and health score.
        """
        start_time = time.time()
        file_paths, total_lines = self.collect_files()

        findings: List[Dict[str, Any]] = []

        # 1. Secret Detection (Sensitive Files and Pattern Matching)
        for rel_path in file_paths:
            full_path = os.path.join(self.repo_root, rel_path)
            # Sensitive filename check
            if is_sensitive_file(rel_path):
                findings.append({
                    "category": "secret",
                    "file_path": rel_path,
                    "title": f"Sensitive credential file found: {os.path.basename(rel_path)}",
                    "description": f"File '{rel_path}' is a sensitive credential or secret file that should never be committed to Git.",
                    "confidence": 1.0,
                    "severity": "critical",
                    "risk": "BLOCKED",
                    "evidence": [f"File matches sensitive pattern: {os.path.basename(rel_path)}"]
                })
            else:
                # Content secret pattern check
                try:
                    if os.path.getsize(full_path) < 500_000:
                        with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                            content = f.read()
                        secret_matches = scan_text_for_secrets(content, rel_path)
                        for sm in secret_matches:
                            findings.append({
                                "category": "secret",
                                "file_path": rel_path,
                                "line_number": sm["line_number"],
                                "title": f"Exposed secret ({sm['type']})",
                                "description": sm["description"],
                                "confidence": 0.95,
                                "severity": "critical",
                                "risk": "BLOCKED",
                                "evidence": [f"Line {sm['line_number']} matches high-entropy token pattern"]
                            })
                except Exception:
                    pass

        # 2. Duplicate Detection
        dup_findings = DuplicateDetector.find_duplicates(self.repo_root, file_paths)
        findings.extend(dup_findings)

        # 3. TODO / FIXME Detection
        for rel_path in file_paths:
            todo_findings = TodoDetector.scan_file(self.repo_root, rel_path)
            findings.extend(todo_findings)

        # 4. Potentially Unused / Dead Code Detection
        dead_code_findings = DeadCodeDetector.find_potentially_unused_files(self.repo_root, file_paths)
        findings.extend(dead_code_findings)

        # 5. Documentation Analysis
        doc_findings = DocumentationAnalyzer.analyze_readme(self.repo_root, file_paths)
        findings.extend(doc_findings)

        # 6. Test Suite Detection
        has_tests = any("test" in f.lower() for f in file_paths)

        # Calculate Health Score Breakdown
        health_score, breakdown = self._calculate_health(findings, has_tests, len(file_paths))

        duration = round(time.time() - start_time, 3)

        summary = {
            "total_files": len(file_paths),
            "total_lines": total_lines,
            "total_issues": len(findings),
            "safe_count": sum(1 for f in findings if f.get("risk") == "SAFE"),
            "review_count": sum(1 for f in findings if f.get("risk") == "REVIEW"),
            "blocked_count": sum(1 for f in findings if f.get("risk") == "BLOCKED"),
            "duplicates": len(dup_findings),
            "todos": sum(1 for f in findings if f.get("category") == "todo"),
            "dead_code": len(dead_code_findings),
            "secrets": sum(1 for f in findings if f.get("category") == "secret"),
            "has_tests": has_tests
        }

        return {
            "files_count": len(file_paths),
            "lines_count": total_lines,
            "duration_seconds": duration,
            "health_score": health_score,
            "health_breakdown": breakdown,
            "summary": summary,
            "findings": findings
        }

    def _calculate_health(self, findings: List[Dict], has_tests: bool, total_files: int) -> Tuple[int, Dict[str, int]]:
        doc_score = 100
        quality_score = 100
        hygiene_score = 100
        tests_score = 90 if has_tests else 45
        maint_score = 100

        for f in findings:
            cat = f.get("category")
            sev = f.get("severity")
            penalty = 15 if sev == "critical" else (10 if sev == "high" else (5 if sev == "medium" else 2))

            if cat == "documentation":
                doc_score = max(0, doc_score - penalty)
            elif cat == "secret":
                hygiene_score = max(0, hygiene_score - (penalty * 2))
                quality_score = max(0, quality_score - 10)
            elif cat == "duplicate":
                hygiene_score = max(0, hygiene_score - penalty)
                maint_score = max(0, maint_score - 8)
            elif cat == "todo":
                maint_score = max(0, maint_score - penalty)
            elif cat == "dead_code":
                quality_score = max(0, quality_score - penalty)
                maint_score = max(0, maint_score - 5)

        overall = int((doc_score * 0.20) + (quality_score * 0.25) + (hygiene_score * 0.25) + (tests_score * 0.15) + (maint_score * 0.15))
        overall = max(10, min(100, overall))

        breakdown = {
            "documentation": doc_score,
            "code_quality": quality_score,
            "repository_hygiene": hygiene_score,
            "tests": tests_score,
            "maintenance": maint_score
        }

        return overall, breakdown

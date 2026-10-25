import os
import pytest
from app.services.scanner.repo_scanner import RepoScanner
from app.services.scanner.duplicate_detector import DuplicateDetector
from app.services.scanner.todo_detector import TodoDetector
from app.services.scanner.dead_code_detector import DeadCodeDetector
from app.services.scanner.doc_analyzer import DocumentationAnalyzer

DEMO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "demo-repository"))

def test_repo_scanner_indexes_files():
    scanner = RepoScanner(DEMO_DIR)
    files, total_lines = scanner.collect_files()
    assert len(files) >= 5
    assert total_lines > 0
    assert any("helpers.js" in f for f in files)

def test_duplicate_detector():
    scanner = RepoScanner(DEMO_DIR)
    files, _ = scanner.collect_files()
    duplicates = DuplicateDetector.find_duplicates(DEMO_DIR, files)
    assert len(duplicates) >= 1
    # Check that helpers_old.js is flagged
    dup_files = [d["file_path"] for d in duplicates]
    assert any("helpers_old.js" in f or "README_old.md" in f for f in dup_files)

def test_todo_detector():
    findings = TodoDetector.scan_file(DEMO_DIR, "src/api/auth.py")
    assert len(findings) >= 2
    assert any("FIXME" in f["title"] for f in findings)
    assert any("TODO" in f["title"] for f in findings)

def test_doc_analyzer_detects_broken_links():
    scanner = RepoScanner(DEMO_DIR)
    files, _ = scanner.collect_files()
    doc_findings = DocumentationAnalyzer.analyze_readme(DEMO_DIR, files)
    assert len(doc_findings) >= 1
    assert any("legacy_guide.md" in f["title"] or "Broken internal documentation link" in f["title"] for f in doc_findings)

def test_health_score_calculation():
    scanner = RepoScanner(DEMO_DIR)
    result = scanner.scan()
    assert "health_score" in result
    assert 0 <= result["health_score"] <= 100
    assert "health_breakdown" in result
    assert "documentation" in result["health_breakdown"]

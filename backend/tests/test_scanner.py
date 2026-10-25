import os
import pytest
from app.services.scanner.repo_scanner import RepoScanner
from app.services.scanner.duplicate_detector import DuplicateDetector
from app.services.scanner.todo_detector import TodoDetector
from app.services.scanner.dead_code_detector import DeadCodeDetector
from app.services.scanner.doc_analyzer import DocumentationAnalyzer

@pytest.fixture
def sample_repo(tmp_path):
    repo = tmp_path / "sample_project"
    repo.mkdir()
    (repo / "README.md").write_text("# Sample Project\nSee [old](broken_guide.md)", encoding="utf-8")
    (repo / "file1.py").write_text("# TODO: fix this\n# FIXME: critical issue\ndef foo(): pass\n", encoding="utf-8")
    (repo / "file2.py").write_text("print('duplicate file')\n", encoding="utf-8")
    (repo / "file2_copy.py").write_text("print('duplicate file')\n", encoding="utf-8")
    (repo / "unused.py").write_text("def dead(): return True\n", encoding="utf-8")
    return str(repo)

def test_repo_scanner_indexes_files(sample_repo):
    scanner = RepoScanner(sample_repo)
    files, total_lines = scanner.collect_files()
    assert len(files) >= 5
    assert total_lines > 0
    assert any("file2.py" in f for f in files)

def test_duplicate_detector(sample_repo):
    scanner = RepoScanner(sample_repo)
    files, _ = scanner.collect_files()
    duplicates = DuplicateDetector.find_duplicates(sample_repo, files)
    assert len(duplicates) >= 1
    dup_files = [d["file_path"] for d in duplicates]
    assert any("file2_copy.py" in f for f in dup_files)

def test_todo_detector(sample_repo):
    findings = TodoDetector.scan_file(sample_repo, "file1.py")
    assert len(findings) >= 2
    assert any("FIXME" in f["title"] for f in findings)
    assert any("TODO" in f["title"] for f in findings)

def test_doc_analyzer_detects_broken_links(sample_repo):
    scanner = RepoScanner(sample_repo)
    files, _ = scanner.collect_files()
    doc_findings = DocumentationAnalyzer.analyze_readme(sample_repo, files)
    assert len(doc_findings) >= 1
    assert any("broken_guide.md" in f["title"] or "Broken internal documentation link" in f["title"] for f in doc_findings)

def test_health_score_calculation(sample_repo):
    scanner = RepoScanner(sample_repo)
    result = scanner.scan()
    assert "health_score" in result
    assert 0 <= result["health_score"] <= 100
    assert "health_breakdown" in result
    assert "documentation" in result["health_breakdown"]

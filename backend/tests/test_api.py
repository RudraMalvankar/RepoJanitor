import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.schemas import AIReasoningOutput

client = TestClient(app)

def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "ollama_available" in data

def test_api_settings():
    response = client.get("/api/settings")
    assert response.status_code == 200
    data = response.json()
    assert "ai_provider" in data
    assert "ollama_model" in data

def test_api_real_scan_flow(tmp_path):
    # Setup real repo
    test_repo = tmp_path / "test_repo"
    test_repo.mkdir()
    (test_repo / "README.md").write_text("# Test Repo\nSee [broken](nonexistent.md)", encoding="utf-8")
    (test_repo / "file1.py").write_text("# TODO: clean up code\nprint('hello')\n", encoding="utf-8")
    (test_repo / "dup.txt").write_text("duplicate content\n", encoding="utf-8")
    (test_repo / "dup_copy.txt").write_text("duplicate content\n", encoding="utf-8")

    # 1. Start real local scan
    scan_res = client.post("/api/repos/scan", json={"path": str(test_repo)})
    assert scan_res.status_code == 200
    repo = scan_res.json()
    repo_id = repo["id"]
    assert repo["health_score"] > 0

    # 2. Get findings
    findings_res = client.get(f"/api/repos/{repo_id}/findings")
    assert findings_res.status_code == 200
    findings = findings_res.json()
    assert len(findings) > 0

    # 3. Analyze findings with AI
    with patch("app.services.ai.ollama_provider.OllamaProvider.reason_about_finding") as mock_reason:
        async def mock_fn(f, c):
            return AIReasoningOutput(
                finding_id=f.get("id", "mock_id"),
                title="Clean duplicate",
                severity="low",
                risk="SAFE",
                confidence=0.95,
                reason="Exact duplicate file found",
                evidence=["SHA-256 hash match"],
                recommended_action="remove_duplicate_file",
                can_auto_fix=True
            )
        mock_reason.side_effect = mock_fn
        analyze_res = client.post(f"/api/repos/{repo_id}/analyze")
        assert analyze_res.status_code == 200
        actions = analyze_res.json()
        assert len(actions) > 0

    # 4. Approve all SAFE actions
    approve_res = client.post(f"/api/repos/{repo_id}/actions/approve-all-safe")
    assert approve_res.status_code == 200

    # 5. Activity log check
    activity_res = client.get(f"/api/repos/{repo_id}/activity")
    assert activity_res.status_code == 200
    assert len(activity_res.json()) >= 1

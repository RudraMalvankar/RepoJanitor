import pytest
from fastapi.testclient import TestClient
from app.main import app

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

def test_api_demo_flow():
    # 1. Start demo scan
    demo_res = client.post("/api/demo/start")
    assert demo_res.status_code == 200
    repo = demo_res.json()
    repo_id = repo["id"]
    assert repo["health_score"] > 0

    # 2. Get findings
    findings_res = client.get(f"/api/repos/{repo_id}/findings")
    assert findings_res.status_code == 200
    findings = findings_res.json()
    assert len(findings) > 0

    # 3. Analyze findings with AI
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
    assert len(activity_res.json()) >= 2

"""Unit test for System Health Check API."""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_endpoint():
    """Verify health endpoint returns status 200 and healthy payload."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["project"] == "LifeSync AI"
    assert "version" in data
    assert "timestamp" in data
    assert "modules" in data
    assert data["modules"]["api"] == "active"


def test_root_endpoint():
    """Verify root endpoint returns project metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["project"] == "LifeSync AI"
    assert data["health_check"] == "/api/health"

import pytest
from app.config import settings

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    json_data = response.json()
    assert "message" in json_data
    assert "Apex Equity Research" in json_data["message"]

def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "version": "1.0.0"}

def test_settings_config():
    assert settings.PROJECT_NAME is not None
    assert settings.API_V1_STR == "/api/v1"


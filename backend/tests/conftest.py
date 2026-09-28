import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    """
    FastAPI TestClient fixture for API integration tests.
    """
    return TestClient(app)

"""Comprehensive Phase 3 Test Suite: Auth, Database Persistence, Security & Isolation."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

# Create an in-memory SQLite database specifically for test isolation
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_lifesync.db"
test_engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True, scope="module")
def setup_and_teardown_db():
    """Create all tables before test module runs and clean up after."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


def test_user_registration():
    """Test user registration creates both user and user_profile atomically."""
    payload = {
        "email": "student_alpha@college.edu",
        "password": "SecurePassword123!",
        "full_name": "Alex Mercer",
        "age": 23,
        "gender": "male",
        "height_cm": 178.5,
        "weight_kg": 72.0,
        "occupation": "MCA Student",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201, response.text
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "student_alpha@college.edu"
    assert data["user"]["profile"]["full_name"] == "Alex Mercer"
    assert data["user"]["profile"]["age"] == 23
    assert "password" not in data["user"]
    assert "hashed_password" not in data["user"]


def test_duplicate_registration_rejected():
    """Verify system rejects duplicate email registrations with 400 Bad Request."""
    payload = {
        "email": "student_alpha@college.edu",
        "password": "AnotherPassword456!",
        "full_name": "Duplicate Tester",
        "age": 25,
        "gender": "other",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"].lower()


def test_user_login_success():
    """Test login with valid credentials issues a JWT token."""
    login_payload = {
        "email": "student_alpha@college.edu",
        "password": "SecurePassword123!",
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "student_alpha@college.edu"


def test_user_login_invalid_password():
    """Test login with invalid password triggers 401 Unauthorized."""
    login_payload = {
        "email": "student_alpha@college.edu",
        "password": "WrongPassword999!",
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 401
    assert "incorrect" in response.json()["detail"].lower()


def test_get_current_user_profile():
    """Test GET /api/auth/me returns the authenticated user's profile."""
    # Obtain token
    login_res = client.post("/api/auth/login", json={
        "email": "student_alpha@college.edu",
        "password": "SecurePassword123!",
    })
    token = login_res.json()["access_token"]

    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == "student_alpha@college.edu"
    assert user_data["profile"]["full_name"] == "Alex Mercer"


def test_unauthorized_access_protection():
    """Test protected endpoints deny requests with missing or invalid tokens."""
    # Missing token
    res1 = client.get("/api/auth/me")
    assert res1.status_code in [401, 403]

    # Invalid token
    res2 = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid_garbage_token"})
    assert res2.status_code == 401


def test_assessment_creation_and_persistence():
    """Test assessment intake runs scoring, ML, recommendations and persists all records."""
    # Login User A
    login_res = client.post("/api/auth/login", json={
        "email": "student_alpha@college.edu",
        "password": "SecurePassword123!",
    })
    token = login_res.json()["access_token"]

    assessment_payload = {
        "sleep_hours": 7.5,
        "sleep_quality": 4,
        "wake_freshness": 4,
        "exercise_minutes": 35,
        "step_count": 7500,
        "sitting_hours": 6.5,
        "water_intake_liters": 2.8,
        "meals_regularity": 3,
        "junk_food_freq": 1,
        "fruit_veg_servings": 4,
        "stress_level": 3,
        "mindfulness_minutes": 15,
        "work_screen_hours": 6.0,
        "recreational_screen_hours": 2.0,
        "screen_before_bed": False,
        "caffeine_cups": 2,
        "smoking_status": "never",
        "alcohol_freq": "none",
        "notes": "Optimal baseline test session",
    }

    response = client.post(
        "/api/assessment/",
        json=assessment_payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201, response.text
    data = response.json()

    # Verify assessment structure
    assert "id" in data
    assert data["scores"]["composite_lwi"] > 70.0
    assert data["scores"]["risk_tier"] in ["Optimal", "Fair"]
    assert "sleep" in data["scores"]["pillars"]
    assert "cluster_name" in data["ml_insights"]
    assert len(data["recommendations"]) >= 1

    # Verify summary listing
    list_res = client.get("/api/assessment/", headers={"Authorization": f"Bearer {token}"})
    assert list_res.status_code == 200
    summaries = list_res.json()
    assert len(summaries) >= 1
    assert summaries[0]["id"] == data["id"]


def test_tenant_isolation_security():
    """Verify that User B CANNOT view or tamper with User A's assessments."""
    # 1. Login User A and create an assessment
    token_a = client.post("/api/auth/login", json={
        "email": "student_alpha@college.edu",
        "password": "SecurePassword123!",
    }).json()["access_token"]

    create_res = client.post(
        "/api/assessment/",
        json={
            "sleep_hours": 8.0,
            "sleep_quality": 5,
            "wake_freshness": 5,
            "exercise_minutes": 45,
            "step_count": 9000,
            "sitting_hours": 5.0,
            "water_intake_liters": 3.0,
            "meals_regularity": 3,
            "junk_food_freq": 0,
            "fruit_veg_servings": 5,
            "stress_level": 2,
            "mindfulness_minutes": 20,
            "work_screen_hours": 5.0,
            "recreational_screen_hours": 1.5,
            "screen_before_bed": False,
            "caffeine_cups": 1,
            "smoking_status": "never",
            "alcohol_freq": "none",
        },
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assessment_id_a = create_res.json()["id"]

    # 2. Register and Login User B
    client.post("/api/auth/register", json={
        "email": "student_beta@college.edu",
        "password": "PasswordBeta456!",
        "full_name": "Bob Taylor",
        "age": 24,
        "gender": "male",
    })
    token_b = client.post("/api/auth/login", json={
        "email": "student_beta@college.edu",
        "password": "PasswordBeta456!",
    }).json()["access_token"]

    # 3. User B attempts to access User A's assessment
    tamper_res = client.get(f"/api/assessment/{assessment_id_a}", headers={"Authorization": f"Bearer {token_b}"})
    assert tamper_res.status_code == 403, "User B should be forbidden from accessing User A's assessment"
    assert "not authorized" in tamper_res.json()["detail"].lower()


def test_dashboard_summary_and_trends():
    """Verify dashboard KPI summary and chronological trendlines."""
    token = client.post("/api/auth/login", json={
        "email": "student_alpha@college.edu",
        "password": "SecurePassword123!",
    }).json()["access_token"]

    # Summary
    sum_res = client.get("/api/dashboard/summary", headers={"Authorization": f"Bearer {token}"})
    assert sum_res.status_code == 200
    summary = sum_res.json()
    assert summary["total_assessments"] >= 2
    assert summary["latest_lwi"] is not None
    assert summary["best_pillar"] is not None

    # Trends
    trend_res = client.get("/api/dashboard/trends", headers={"Authorization": f"Bearer {token}"})
    assert trend_res.status_code == 200
    trends = trend_res.json()
    assert len(trends["timeline"]) >= 2
    assert trends["average_lwi"] > 0
    assert trends["highest_lwi"] >= trends["lowest_lwi"]

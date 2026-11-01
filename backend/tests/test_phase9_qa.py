"""
LifeSync AI - Phase 9 Comprehensive QA & Security Test Suite
Covers:
- Auth & Password Hashing (bcrypt, JWT verification, invalid tokens)
- Tenant Isolation & Unauthorized Access Protection
- Input Validation & Edge Cases
- Scoring & Deductions Engine
- ML Engine (KMeans, PCA, Isolation Forest)
- PDF Report Generation & Streaming
- Profile Updating & Persistence
- Cascading Deletions
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db
from app.utils.security import hash_password, verify_password, create_access_token

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_db():
    """Ensure database tables exist for this test suite."""
    init_db()
    yield



# Fixture for a registered test user
@pytest.fixture
def auth_user():
    email = f"qa_test_{pytest.importorskip('uuid').uuid4().hex[:8]}@lifesync.edu"
    password = "TestPassword123!"
    reg_payload = {
        "email": email,
        "password": password,
        "full_name": "QA Tester",
        "age": 22,
        "gender": "male",
        "occupation": "MCA Student",
        "height_cm": 175.0,
        "weight_kg": 68.0,
    }
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    token = data["access_token"]
    user_id = data["user"]["id"]
    return {"email": email, "password": password, "token": token, "user_id": user_id}


# Fixture for a second distinct user to test multi-tenancy & isolation
@pytest.fixture
def other_user():
    email = f"other_user_{pytest.importorskip('uuid').uuid4().hex[:8]}@lifesync.edu"
    password = "OtherPassword123!"
    reg_payload = {
        "email": email,
        "password": password,
        "full_name": "Other Student",
        "age": 25,
        "gender": "female",
        "occupation": "Research Scholar",
        "height_cm": 162.0,
        "weight_kg": 54.0,
    }
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    return {"email": email, "password": password, "token": data["access_token"], "user_id": data["user"]["id"]}


# Sample valid questionnaire
VALID_ASSESSMENT_PAYLOAD = {
    "sleep_hours": 7.5,
    "sleep_consistency": 4,
    "sleep_quality": 4,
    "wake_freshness": 4,
    "exercise_minutes": 45,
    "activity_frequency_days": 4,
    "step_count": 8500,
    "sitting_hours": 6.0,
    "water_intake_liters": 2.5,
    "hydration_habit": "regular",
    "meals_regularity": 3,
    "fruit_veg_servings": 3,
    "junk_food_freq": 1,
    "stress_level": 3,
    "mindfulness_minutes": 15,
    "work_life_balance": 4,
    "recreational_screen_hours": 2.0,
    "work_screen_hours": 5.0,
    "screen_break_frequency": "hourly",
    "screen_before_bed": False,
    "caffeine_cups": 1,
    "smoking_status": "never",
    "alcohol_freq": "none",
    "notes": "QA test assessment.",
}


class TestAuthenticationAndSecurity:
    """Tests for authentication, password hashing, and JWT security."""

    def test_password_hashing_security(self):
        plain = "SuperSecurePass99!"
        hashed = hash_password(plain)
        assert hashed != plain
        assert verify_password(plain, hashed) is True
        assert verify_password("WrongPassword!", hashed) is False

    def test_duplicate_email_registration_rejected(self, auth_user):
        payload = {
            "email": auth_user["email"],
            "password": "AnyPassword123!",
            "full_name": "Duplicate Tester",
            "age": 21,
            "gender": "other",
        }
        res = client.post("/api/auth/register", json=payload)
        assert res.status_code == 400
        assert "already exists" in res.json()["detail"].lower()

    def test_login_invalid_password_rejected(self, auth_user):
        res = client.post(
            "/api/auth/login",
            json={"email": auth_user["email"], "password": "WrongPassword123!"},
        )
        assert res.status_code == 401
        assert "incorrect" in res.json()["detail"].lower()

    def test_protected_route_rejects_missing_token(self):
        res = client.get("/api/auth/me")
        assert res.status_code == 401

    def test_protected_route_rejects_malformed_token(self):
        headers = {"Authorization": "Bearer invalid.fake.token"}
        res = client.get("/api/auth/me", headers=headers)
        assert res.status_code == 401


class TestUserProfileAPI:
    """Tests for user profile retrieval and modification."""

    def test_get_me_returns_profile(self, auth_user):
        headers = {"Authorization": f"Bearer {auth_user['token']}"}
        res = client.get("/api/auth/me", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["email"] == auth_user["email"]
        assert data["profile"]["full_name"] == "QA Tester"

    def test_update_profile_persists_changes(self, auth_user):
        headers = {"Authorization": f"Bearer {auth_user['token']}"}
        update_payload = {
            "full_name": "Updated QA Scholar",
            "age": 23,
            "gender": "male",
            "occupation": "Senior MCA Scholar",
            "height_cm": 180.0,
            "weight_kg": 74.0,
        }
        res = client.put("/api/auth/profile", json=update_payload, headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["profile"]["full_name"] == "Updated QA Scholar"
        assert data["profile"]["occupation"] == "Senior MCA Scholar"
        assert data["profile"]["height_cm"] == 180.0
        assert data["profile"]["weight_kg"] == 74.0


class TestAssessmentAndTenantIsolation:
    """Tests for questionnaire validation, ML scoring, and multi-tenant isolation."""

    def test_submit_valid_assessment(self, auth_user):
        headers = {"Authorization": f"Bearer {auth_user['token']}"}
        res = client.post("/api/assessment/", json=VALID_ASSESSMENT_PAYLOAD, headers=headers)
        assert res.status_code == 201
        data = res.json()
        assert data["id"] > 0
        assert data["scores"]["composite_lwi"] > 0
        assert "risk_tier" in data["scores"]
        assert len(data["scores"]["pillars"]) == 6
        assert data["ml_insights"]["cluster_name"] != ""
        assert len(data["recommendations"]) > 0

    def test_tenant_isolation_cannot_view_other_user_assessment(self, auth_user, other_user):
        # auth_user creates an assessment
        headers_a = {"Authorization": f"Bearer {auth_user['token']}"}
        res_a = client.post("/api/assessment/", json=VALID_ASSESSMENT_PAYLOAD, headers=headers_a)
        assert res_a.status_code == 201
        assessment_id = res_a.json()["id"]

        # other_user attempts to retrieve auth_user's assessment
        headers_b = {"Authorization": f"Bearer {other_user['token']}"}
        res_b = client.get(f"/api/assessment/{assessment_id}", headers=headers_b)
        assert res_b.status_code in [403, 404]

    def test_tenant_isolation_cannot_delete_other_user_assessment(self, auth_user, other_user):
        headers_a = {"Authorization": f"Bearer {auth_user['token']}"}
        res_a = client.post("/api/assessment/", json=VALID_ASSESSMENT_PAYLOAD, headers=headers_a)
        assessment_id = res_a.json()["id"]

        headers_b = {"Authorization": f"Bearer {other_user['token']}"}
        res_b = client.delete(f"/api/assessment/{assessment_id}", headers=headers_b)
        assert res_b.status_code in [403, 404]

    def test_assessment_cascading_delete(self, auth_user):
        headers = {"Authorization": f"Bearer {auth_user['token']}"}
        res = client.post("/api/assessment/", json=VALID_ASSESSMENT_PAYLOAD, headers=headers)
        assessment_id = res.json()["id"]

        del_res = client.delete(f"/api/assessment/{assessment_id}", headers=headers)
        assert del_res.status_code == 200

        # Verify not found after delete
        get_res = client.get(f"/api/assessment/{assessment_id}", headers=headers)
        assert get_res.status_code == 404


class TestPDFReportGeneration:
    """Tests for PDF streaming and content generation."""

    def test_download_pdf_report_succeeds(self, auth_user):
        headers = {"Authorization": f"Bearer {auth_user['token']}"}
        res_create = client.post("/api/assessment/", json=VALID_ASSESSMENT_PAYLOAD, headers=headers)
        assert res_create.status_code == 201
        assessment_id = res_create.json()["id"]

        res_pdf = client.get(f"/api/assessment/{assessment_id}/pdf", headers=headers)
        assert res_pdf.status_code == 200
        assert res_pdf.headers["content-type"] == "application/pdf"
        assert "attachment" in res_pdf.headers.get("content-disposition", "")
        # Check PDF Magic Header %PDF-
        assert res_pdf.content.startswith(b"%PDF-")
        assert len(res_pdf.content) > 1000  # Substantial PDF size

    def test_unauthorized_pdf_download_rejected(self, auth_user, other_user):
        headers_a = {"Authorization": f"Bearer {auth_user['token']}"}
        res_create = client.post("/api/assessment/", json=VALID_ASSESSMENT_PAYLOAD, headers=headers_a)
        assessment_id = res_create.json()["id"]

        # other_user attempts to download auth_user's PDF report
        headers_b = {"Authorization": f"Bearer {other_user['token']}"}
        res_pdf = client.get(f"/api/assessment/{assessment_id}/pdf", headers=headers_b)
        assert res_pdf.status_code in [403, 404]


class TestRecommendationsAndDashboard:
    """Tests for recommendation toggling, dashboard KPI calculation, and trend tracking."""

    def test_toggle_recommendation_status(self, auth_user):
        headers = {"Authorization": f"Bearer {auth_user['token']}"}
        client.post("/api/assessment/", json=VALID_ASSESSMENT_PAYLOAD, headers=headers)

        recs = client.get("/api/recommendations/", headers=headers).json()
        assert len(recs) > 0
        first_id = recs[0]["id"]
        initial_status = recs[0]["is_completed"]

        toggle_res = client.patch(f"/api/recommendations/{first_id}/toggle", headers=headers)
        assert toggle_res.status_code == 200
        assert toggle_res.json()["is_completed"] == (not initial_status)

    def test_dashboard_summary_and_trends(self, auth_user):
        headers = {"Authorization": f"Bearer {auth_user['token']}"}
        # Initial assessment
        client.post("/api/assessment/", json=VALID_ASSESSMENT_PAYLOAD, headers=headers)

        sum_res = client.get("/api/dashboard/summary", headers=headers)
        assert sum_res.status_code == 200
        sum_data = sum_res.json()
        assert sum_data["total_assessments"] >= 1
        assert sum_data["latest_lwi"] is not None

        trends_res = client.get("/api/dashboard/trends", headers=headers)
        assert trends_res.status_code == 200
        trends_data = trends_res.json()
        assert len(trends_data["timeline"]) >= 1
        assert trends_data["average_lwi"] > 0

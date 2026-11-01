"""
LifeSync AI - Phase 6 Recommendation Engine Automated Test Suite
Tests:
1. Scenario-based recommendation generation (Sleep, Physical Activity, Hydration, Nutrition, Mental Wellness, Digital Habits).
2. ML pattern & anomaly-aware contextual advice.
3. Longitudinal trend tracking & habit progress celebration.
4. Safety constraint verification (no medical prescriptions or extreme diets).
5. REST API endpoints: list, summary, by assessment, and toggle completion.
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, engine
from app.services.recommendation_engine import recommendation_engine
from app.schemas.assessment import AssessmentCreateRequest

client = TestClient(app)


@pytest.fixture(autouse=True, scope="module")
def setup_recommendations_db():
    """Ensure database tables exist in test environment."""
    Base.metadata.create_all(bind=engine)
    try:
        from tests.test_phase3 import test_engine
        Base.metadata.create_all(bind=test_engine)
    except Exception:
        try:
            from backend.tests.test_phase3 import test_engine
            Base.metadata.create_all(bind=test_engine)
        except Exception:
            pass
    yield


def test_scenario_sleep_deprivation_and_screen():
    """Verify high-priority sleep and digital recommendations for sleep-restricted users."""
    data = {
        "sleep_hours": 4.5,
        "sleep_consistency": 1,
        "sleep_quality": 2,
        "wake_freshness": 1,
        "exercise_minutes": 20,
        "activity_frequency_days": 2,
        "step_count": 4000,
        "sitting_hours": 8.0,
        "water_intake_liters": 2.0,
        "hydration_habit": "occasional",
        "meals_regularity": 2,
        "fruit_veg_servings": 2,
        "junk_food_freq": "moderate",
        "stress_level": 6,
        "mindfulness_minutes": 0,
        "work_life_balance": 3,
        "recreational_screen_hours": 4.5,
        "work_screen_hours": 7.0,
        "screen_break_frequency": "rarely",
        "screen_before_bed": True,
        "caffeine_cups": 2,
        "smoking_status": "never",
        "alcohol_freq": "none",
    }
    ml_insights = {
        "cluster_name": "Stressed Academic / Crammer",
        "is_anomaly": False,
        "anomaly_contributing_factors": [],
    }
    recs = recommendation_engine.generate_recommendations(
        assessment_data=data,
        wellness_scores={"composite_lwi": 45.0},
        ml_insights=ml_insights,
    )

    assert len(recs) >= 3
    categories = [r["category"] for r in recs]
    assert "Sleep" in categories
    assert "Digital Habits" in categories

    sleep_rec = next(r for r in recs if r["category"] == "Sleep")
    assert sleep_rec["priority"] == "high"
    assert "sleep" in sleep_rec["action_item"].lower() or "bedtime" in sleep_rec["action_item"].lower()
    assert len(sleep_rec["reason"]) > 20
    assert len(sleep_rec["observation"]) > 10


def test_scenario_hydration_deficit_and_caffeine():
    """Verify high caffeine and low water triggers hydration guidance."""
    data = {
        "sleep_hours": 7.0,
        "sleep_consistency": 4,
        "sleep_quality": 4,
        "wake_freshness": 3,
        "exercise_minutes": 30,
        "activity_frequency_days": 3,
        "step_count": 6000,
        "sitting_hours": 7.0,
        "water_intake_liters": 1.2,
        "hydration_habit": "rare",
        "meals_regularity": 2,
        "fruit_veg_servings": 2,
        "junk_food_freq": "low",
        "stress_level": 4,
        "mindfulness_minutes": 0,
        "work_life_balance": 3,
        "recreational_screen_hours": 2.0,
        "work_screen_hours": 6.0,
        "screen_break_frequency": "hourly",
        "screen_before_bed": False,
        "caffeine_cups": 4,
        "smoking_status": "never",
        "alcohol_freq": "none",
    }
    ml_insights = {
        "cluster_name": "Sedentary Digital Workaholic",
        "is_anomaly": False,
        "anomaly_contributing_factors": [],
    }
    recs = recommendation_engine.generate_recommendations(
        assessment_data=data,
        wellness_scores={"composite_lwi": 60.0},
        ml_insights=ml_insights,
    )

    categories = [r["category"] for r in recs]
    assert "Hydration" in categories
    hyd_rec = next(r for r in recs if r["category"] == "Hydration")
    assert hyd_rec["priority"] == "high"
    assert "water" in hyd_rec["action_item"].lower()


def test_scenario_high_stress_and_anomaly_context():
    """Verify ML anomaly factor triggers contextualized mental wellness guidance."""
    data = {
        "sleep_hours": 5.0,
        "sleep_consistency": 2,
        "sleep_quality": 2,
        "wake_freshness": 2,
        "exercise_minutes": 10,
        "activity_frequency_days": 1,
        "step_count": 3000,
        "sitting_hours": 11.0,
        "water_intake_liters": 1.5,
        "hydration_habit": "rare",
        "meals_regularity": 1,
        "fruit_veg_servings": 1,
        "junk_food_freq": "high",
        "stress_level": 9,
        "mindfulness_minutes": 0,
        "work_life_balance": 1,
        "recreational_screen_hours": 3.0,
        "work_screen_hours": 9.0,
        "screen_break_frequency": "rarely",
        "screen_before_bed": True,
        "caffeine_cups": 3,
        "smoking_status": "never",
        "alcohol_freq": "occasional",
    }
    ml_insights = {
        "cluster_name": "Stressed Academic / Crammer",
        "is_anomaly": True,
        "anomaly_contributing_factors": ["Sedentary sitting time is significantly elevated (+2.1σ)"],
    }
    recs = recommendation_engine.generate_recommendations(
        assessment_data=data,
        wellness_scores={"composite_lwi": 38.0},
        ml_insights=ml_insights,
    )

    categories = [r["category"] for r in recs]
    assert "Mental Wellness" in categories
    anomaly_rec = next((r for r in recs if "Anomaly" in r["title"]), None)
    assert anomaly_rec is not None
    assert anomaly_rec["priority"] == "high"


def test_scenario_balanced_achiever_positive_strengths():
    """Verify positive strengths habit celebration for high-performing lifestyle."""
    data = {
        "sleep_hours": 8.0,
        "sleep_consistency": 5,
        "sleep_quality": 5,
        "wake_freshness": 5,
        "exercise_minutes": 45,
        "activity_frequency_days": 4,
        "step_count": 9500,
        "sitting_hours": 6.0,
        "water_intake_liters": 3.0,
        "hydration_habit": "consistent",
        "meals_regularity": 3,
        "fruit_veg_servings": 5,
        "junk_food_freq": "low",
        "stress_level": 2,
        "mindfulness_minutes": 15,
        "work_life_balance": 5,
        "recreational_screen_hours": 1.5,
        "work_screen_hours": 5.0,
        "screen_break_frequency": "every_30m",
        "screen_before_bed": False,
        "caffeine_cups": 1,
        "smoking_status": "never",
        "alcohol_freq": "none",
    }
    ml_insights = {
        "cluster_name": "Balanced High-Achiever",
        "is_anomaly": False,
        "anomaly_contributing_factors": [],
    }
    recs = recommendation_engine.generate_recommendations(
        assessment_data=data,
        wellness_scores={"composite_lwi": 88.0},
        ml_insights=ml_insights,
    )

    priorities = [r["priority"] for r in recs]
    assert "positive" in priorities
    positive_rec = next(r for r in recs if r["priority"] == "positive")
    assert "Exemplary" in positive_rec["title"] or "Consistent" in positive_rec["title"] or "Optimal" in positive_rec["title"]


def test_scenario_longitudinal_progress_celebration():
    """Verify comparison with prior assessment acknowledges habit improvement."""
    class MockPrevAssessment:
        sleep_hours = 5.0
        water_intake_liters = 1.2

    current_data = {
        "sleep_hours": 7.5,  # +2.5 hrs improvement!
        "sleep_consistency": 4,
        "sleep_quality": 4,
        "wake_freshness": 4,
        "exercise_minutes": 30,
        "activity_frequency_days": 3,
        "step_count": 7000,
        "sitting_hours": 7.0,
        "water_intake_liters": 2.5,  # +1.3 L improvement!
        "hydration_habit": "frequent",
        "meals_regularity": 2,
        "fruit_veg_servings": 3,
        "junk_food_freq": "moderate",
        "stress_level": 4,
        "mindfulness_minutes": 5,
        "work_life_balance": 3,
        "recreational_screen_hours": 2.0,
        "work_screen_hours": 6.0,
        "screen_break_frequency": "hourly",
        "screen_before_bed": False,
        "caffeine_cups": 1,
        "smoking_status": "never",
        "alcohol_freq": "none",
    }
    ml_insights = {
        "cluster_name": "Balanced High-Achiever",
        "is_anomaly": False,
        "anomaly_contributing_factors": [],
    }

    recs = recommendation_engine.generate_recommendations(
        assessment_data=current_data,
        wellness_scores={"composite_lwi": 78.0},
        ml_insights=ml_insights,
        previous_assessments=[MockPrevAssessment()],
    )

    titles = [r["title"] for r in recs]
    has_progress = any("Progress" in t or "Growth" in t for t in titles)
    assert has_progress, f"Expected progress celebration in recommendations: {titles}"


def test_safety_and_ethics_filters():
    """Verify no dangerous diets, medication, or medical claims are present in recommendations."""
    all_recs = []
    # Test multiple distinct configurations
    for sleep_h in [4.0, 6.0, 8.0]:
        for water_l in [1.0, 2.5]:
            data = {
                "sleep_hours": sleep_h,
                "sleep_consistency": 2,
                "sleep_quality": 2,
                "wake_freshness": 2,
                "exercise_minutes": 15,
                "activity_frequency_days": 1,
                "step_count": 3500,
                "sitting_hours": 9.0,
                "water_intake_liters": water_l,
                "hydration_habit": "rare",
                "meals_regularity": 1,
                "fruit_veg_servings": 1,
                "junk_food_freq": "high",
                "stress_level": 7,
                "mindfulness_minutes": 0,
                "work_life_balance": 2,
                "recreational_screen_hours": 4.0,
                "work_screen_hours": 7.0,
                "screen_break_frequency": "rarely",
                "screen_before_bed": True,
                "caffeine_cups": 3,
                "smoking_status": "never",
                "alcohol_freq": "none",
            }
            recs = recommendation_engine.generate_recommendations(
                assessment_data=data,
                wellness_scores={"composite_lwi": 50.0},
                ml_insights={"cluster_name": "Sedentary Digital Workaholic", "is_anomaly": False},
            )
            all_recs.extend(recs)

    forbidden = ["prescription", "prescribe", "medication", "pill", "starve", "crash diet", "diagnose"]
    for r in all_recs:
        full_text = (r["action_item"] + " " + r["reason"] + " " + r["title"]).lower()
        for word in forbidden:
            assert word not in full_text, f"Forbidden word '{word}' found in recommendation: {r}"


def test_recommendations_api_endpoints():
    """Verify end-to-end recommendation REST API: list, summary, and toggle."""
    import uuid
    email = f"rec_tester_{uuid.uuid4().hex[:8]}@domain.com"
    reg_resp = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": "Password123!",
            "full_name": "Recommendation Tester",
            "age": 22,
            "gender": "prefer_not_to_say",
        },
    )
    assert reg_resp.status_code == 201
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Initially no recommendations
    empty_resp = client.get("/api/recommendations/", headers=headers)
    assert empty_resp.status_code == 200
    assert empty_resp.json() == []

    # 2. Submit assessment
    assessment_payload = {
        "sleep_hours": 5.5,
        "sleep_consistency": 2,
        "sleep_quality": 2,
        "wake_freshness": 2,
        "exercise_minutes": 15,
        "activity_frequency_days": 1,
        "step_count": 3500,
        "sitting_hours": 9.5,
        "water_intake_liters": 1.4,
        "hydration_habit": "rare",
        "meals_regularity": 1,
        "fruit_veg_servings": 1,
        "junk_food_freq": 3,
        "stress_level": 7,
        "mindfulness_minutes": 0,
        "work_life_balance": 2,
        "recreational_screen_hours": 4.0,
        "work_screen_hours": 7.0,
        "screen_break_frequency": "rarely",
        "screen_before_bed": True,
        "caffeine_cups": 3,
        "smoking_status": "never",
        "alcohol_freq": "none",
    }
    create_resp = client.post("/api/assessment/", json=assessment_payload, headers=headers)
    assert create_resp.status_code == 201
    created_data = create_resp.json()
    assert len(created_data["recommendations"]) >= 3
    rec_id = created_data["recommendations"][0]["id"]

    # 3. Retrieve recommendations list
    list_resp = client.get("/api/recommendations/", headers=headers)
    assert list_resp.status_code == 200
    recs_list = list_resp.json()
    assert len(recs_list) >= 3

    # Check that aliases are properly populated
    first_rec = recs_list[0]
    assert "observation" in first_rec
    assert "suggested_action" in first_rec
    assert "reason" in first_rec

    # 4. Filter by category
    filter_resp = client.get(f"/api/recommendations/?category={first_rec['category']}", headers=headers)
    assert filter_resp.status_code == 200
    for r in filter_resp.json():
        assert first_rec["category"].lower() in r["category"].lower()

    # 5. Retrieve summary
    summary_resp = client.get("/api/recommendations/summary", headers=headers)
    assert summary_resp.status_code == 200
    summary = summary_resp.json()
    assert summary["total_active"] >= 1
    assert "by_category" in summary
    assert "by_priority" in summary

    # 6. Toggle recommendation status (complete / uncomplete)
    toggle_resp = client.patch(f"/api/recommendations/{rec_id}/toggle", headers=headers)
    assert toggle_resp.status_code == 200
    assert toggle_resp.json()["is_completed"] is True

    # Toggle back
    toggle_resp2 = client.patch(f"/api/recommendations/{rec_id}/toggle", headers=headers)
    assert toggle_resp2.status_code == 200
    assert toggle_resp2.json()["is_completed"] is False

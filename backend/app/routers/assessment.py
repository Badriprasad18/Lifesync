"""Assessment Management Router (Intake, Scoring, and Historical Retrieval)."""
import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.assessment import (
    LifestyleAssessment,
    WellnessScore,
    MLAnalysisResult,
    WellnessRecommendation,
)
from app.schemas.assessment import (
    AssessmentCreateRequest,
    AssessmentDetailResponse,
    AssessmentSummaryResponse,
    WellnessScoreResponse,
    MLAnalysisResponse,
    RecommendationResponse,
)
from app.services.scoring_service import compute_lifestyle_assessment_results
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/assessment", tags=["Assessments"])


def serialize_assessment_detail(assessment: LifestyleAssessment) -> AssessmentDetailResponse:
    """Helper to convert ORM model into API schema with parsed JSON fields."""
    score = assessment.wellness_score
    ml = assessment.ml_result

    deductions_list = json.loads(score.deductions_json) if score and score.deductions_json else []
    anomaly_factors_list = json.loads(ml.anomaly_factors_json) if ml and ml.anomaly_factors_json else []

    return AssessmentDetailResponse(
        id=assessment.id,
        user_id=assessment.user_id,
        assessed_at=assessment.created_at,
        inputs={
            "sleep_hours": assessment.sleep_hours,
            "sleep_quality": assessment.sleep_quality,
            "wake_freshness": assessment.wake_freshness,
            "exercise_minutes": assessment.exercise_minutes,
            "step_count": assessment.step_count,
            "sitting_hours": assessment.sitting_hours,
            "water_intake_liters": assessment.water_intake_liters,
            "meals_regularity": assessment.meals_regularity,
            "junk_food_freq": assessment.junk_food_freq,
            "fruit_veg_servings": assessment.fruit_veg_servings,
            "stress_level": assessment.stress_level,
            "mindfulness_minutes": assessment.mindfulness_minutes,
            "work_screen_hours": assessment.work_screen_hours,
            "recreational_screen_hours": assessment.recreational_screen_hours,
            "screen_before_bed": assessment.screen_before_bed,
            "caffeine_cups": assessment.caffeine_cups,
            "smoking_status": assessment.smoking_status,
            "alcohol_freq": assessment.alcohol_freq,
            "notes": assessment.notes,
        },
        scores=WellnessScoreResponse(
            id=score.id,
            assessment_id=score.assessment_id,
            composite_lwi=score.composite_lwi,
            risk_tier=score.risk_tier,
            pillars={
                "sleep": score.sleep_score,
                "physical_activity": score.activity_score,
                "nutrition_hydration": score.nutrition_score,
                "mental_wellbeing": score.stress_score,
                "digital_hygiene": score.screen_score,
                "habits": score.habits_score,
            },
            deductions=deductions_list,
            created_at=score.created_at,
        ),
        ml_insights=MLAnalysisResponse(
            id=ml.id,
            assessment_id=ml.assessment_id,
            cluster_id=ml.cluster_id,
            cluster_name=ml.cluster_name,
            cluster_description=ml.cluster_description,
            distance_to_center=ml.distance_to_center,
            pca_coordinates={"x": ml.pca_x, "y": ml.pca_y},
            is_anomaly=ml.is_anomaly,
            anomaly_score=ml.anomaly_score,
            anomaly_contributing_factors=anomaly_factors_list,
        ),
        recommendations=[
            RecommendationResponse(
                id=rec.id,
                category=rec.category,
                priority=rec.priority,
                title=rec.title,
                description=rec.description,
                action_item=rec.action_item,
                is_completed=rec.is_completed,
            )
            for rec in assessment.recommendations
        ],
    )


@router.post("/", response_model=AssessmentDetailResponse, status_code=status.HTTP_201_CREATED)
def create_assessment(
    data: AssessmentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submit lifestyle assessment questionnaire:
    1. Persists raw inputs in lifestyle_assessments.
    2. Executes explainable scoring engine.
    3. Runs archetype segmentation & anomaly detection.
    4. Generates prioritized recommendations.
    5. Saves all records in atomic transaction.
    """
    # 1. Create Assessment Record
    assessment = LifestyleAssessment(
        user_id=current_user.id,
        sleep_hours=data.sleep_hours,
        sleep_quality=data.sleep_quality,
        wake_freshness=data.wake_freshness,
        exercise_minutes=data.exercise_minutes,
        step_count=data.step_count,
        sitting_hours=data.sitting_hours,
        water_intake_liters=data.water_intake_liters,
        meals_regularity=data.meals_regularity,
        junk_food_freq=data.junk_food_freq,
        fruit_veg_servings=data.fruit_veg_servings,
        stress_level=data.stress_level,
        mindfulness_minutes=data.mindfulness_minutes,
        work_screen_hours=data.work_screen_hours,
        recreational_screen_hours=data.recreational_screen_hours,
        screen_before_bed=data.screen_before_bed,
        caffeine_cups=data.caffeine_cups,
        smoking_status=data.smoking_status,
        alcohol_freq=data.alcohol_freq,
        notes=data.notes,
    )
    db.add(assessment)
    db.flush()  # Generates assessment.id

    # 2. Run Scoring & ML Analysis
    analysis = compute_lifestyle_assessment_results(data)

    # 3. Create WellnessScore Record
    score_record = WellnessScore(
        assessment_id=assessment.id,
        composite_lwi=analysis["composite_lwi"],
        risk_tier=analysis["risk_tier"],
        sleep_score=analysis["pillars"]["sleep"],
        activity_score=analysis["pillars"]["physical_activity"],
        nutrition_score=analysis["pillars"]["nutrition_hydration"],
        stress_score=analysis["pillars"]["mental_wellbeing"],
        screen_score=analysis["pillars"]["digital_hygiene"],
        habits_score=analysis["pillars"]["habits"],
        deductions_json=json.dumps(analysis["deductions"]),
    )
    db.add(score_record)

    # 4. Create ML Analysis Result Record
    ml_data = analysis["ml_insights"]
    ml_record = MLAnalysisResult(
        assessment_id=assessment.id,
        cluster_id=ml_data["cluster_id"],
        cluster_name=ml_data["cluster_name"],
        cluster_description=ml_data["cluster_description"],
        distance_to_center=ml_data["distance_to_center"],
        pca_x=ml_data["pca_coordinates"]["x"],
        pca_y=ml_data["pca_coordinates"]["y"],
        is_anomaly=ml_data["is_anomaly"],
        anomaly_score=ml_data["anomaly_score"],
        anomaly_factors_json=json.dumps(ml_data["anomaly_contributing_factors"]),
    )
    db.add(ml_record)

    # 5. Create Recommendation Records
    for rec in analysis["recommendations"]:
        rec_record = WellnessRecommendation(
            assessment_id=assessment.id,
            category=rec["category"],
            priority=rec["priority"],
            title=rec["title"],
            description=rec["description"],
            action_item=rec["action_item"],
            is_completed=False,
        )
        db.add(rec_record)

    db.commit()
    db.refresh(assessment)

    return serialize_assessment_detail(assessment)


@router.get("/", response_model=List[AssessmentSummaryResponse])
def list_assessments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve summary history of all assessments belonging to the authenticated user."""
    assessments = (
        db.query(LifestyleAssessment)
        .filter(LifestyleAssessment.user_id == current_user.id)
        .order_by(LifestyleAssessment.created_at.desc())
        .all()
    )

    summaries = []
    for a in assessments:
        score = a.wellness_score
        ml = a.ml_result
        summaries.append(
            AssessmentSummaryResponse(
                id=a.id,
                assessed_at=a.created_at,
                composite_lwi=score.composite_lwi if score else 0.0,
                risk_tier=score.risk_tier if score else "Unknown",
                cluster_name=ml.cluster_name if ml else "Unassigned",
                is_anomaly=ml.is_anomaly if ml else False,
            )
        )
    return summaries


@router.get("/{assessment_id}", response_model=AssessmentDetailResponse)
def get_assessment(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve full assessment details by ID.
    Enforces strict tenant isolation: users cannot access assessments belonging to other accounts.
    """
    assessment = (
        db.query(LifestyleAssessment)
        .filter(LifestyleAssessment.id == assessment_id)
        .first()
    )

    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Assessment #{assessment_id} was not found.",
        )

    # Security: Tenant ownership check
    if assessment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this assessment.",
        )

    return serialize_assessment_detail(assessment)

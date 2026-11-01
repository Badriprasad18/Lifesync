"""Assessment Management Router (Intake, Scoring, Editing, and Retrieval)."""
import json
import io
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from app.services.pdf_service import generate_lifestyle_pdf_report
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
    AssessmentUpdateRequest,
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
            "sleep_consistency": assessment.sleep_consistency,
            "sleep_quality": assessment.sleep_quality,
            "wake_freshness": assessment.wake_freshness,
            "exercise_minutes": assessment.exercise_minutes,
            "activity_frequency_days": assessment.activity_frequency_days,
            "step_count": assessment.step_count,
            "sitting_hours": assessment.sitting_hours,
            "water_intake_liters": assessment.water_intake_liters,
            "hydration_habit": assessment.hydration_habit,
            "meals_regularity": assessment.meals_regularity,
            "fruit_veg_servings": assessment.fruit_veg_servings,
            "junk_food_freq": assessment.junk_food_freq,
            "stress_level": assessment.stress_level,
            "mindfulness_minutes": assessment.mindfulness_minutes,
            "work_life_balance": assessment.work_life_balance,
            "recreational_screen_hours": assessment.recreational_screen_hours,
            "work_screen_hours": assessment.work_screen_hours,
            "screen_break_frequency": assessment.screen_break_frequency,
            "screen_before_bed": assessment.screen_before_bed,
            "caffeine_cups": assessment.caffeine_cups,
            "smoking_status": assessment.smoking_status,
            "alcohol_freq": assessment.alcohol_freq,
            "notes": assessment.notes,
        },
        scores=WellnessScoreResponse(
            id=score.id if score else 0,
            assessment_id=score.assessment_id if score else assessment.id,
            composite_lwi=score.composite_lwi if score else 0.0,
            risk_tier=score.risk_tier if score else "Unknown",
            pillars={
                "sleep": score.sleep_score if score else 0.0,
                "physical_activity": score.activity_score if score else 0.0,
                "nutrition_hydration": score.nutrition_score if score else 0.0,
                "mental_wellbeing": score.stress_score if score else 0.0,
                "digital_hygiene": score.screen_score if score else 0.0,
                "habits": score.habits_score if score else 0.0,
            },
            deductions=deductions_list,
            created_at=score.created_at if score else assessment.created_at,
        ),
        ml_insights=MLAnalysisResponse(
            id=ml.id if ml else 0,
            assessment_id=ml.assessment_id if ml else assessment.id,
            cluster_id=ml.cluster_id if ml else 0,
            cluster_name=ml.cluster_name if ml else "Unassigned",
            cluster_description=ml.cluster_description if ml else None,
            distance_to_center=ml.distance_to_center if ml else 0.0,
            pca_coordinates={"x": ml.pca_x, "y": ml.pca_y} if ml else {"x": 0.0, "y": 0.0},
            is_anomaly=ml.is_anomaly if ml else False,
            anomaly_score=ml.anomaly_score if ml else 0.0,
            anomaly_contributing_factors=anomaly_factors_list,
        ),
        recommendations=[
            RecommendationResponse(
                id=rec.id,
                category=rec.category,
                priority=rec.priority,
                title=rec.title,
                observation=rec.title,
                description=rec.description,
                reason=rec.description,
                action_item=rec.action_item,
                suggested_action=rec.action_item,
                is_completed=rec.is_completed,
                created_at=rec.created_at,
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
    assessment = LifestyleAssessment(
        user_id=current_user.id,
        sleep_hours=data.sleep_hours,
        sleep_consistency=data.sleep_consistency,
        sleep_quality=data.sleep_quality,
        wake_freshness=data.wake_freshness,
        exercise_minutes=data.exercise_minutes,
        activity_frequency_days=data.activity_frequency_days,
        step_count=data.step_count,
        sitting_hours=data.sitting_hours,
        water_intake_liters=data.water_intake_liters,
        hydration_habit=data.hydration_habit,
        meals_regularity=data.meals_regularity,
        fruit_veg_servings=data.fruit_veg_servings,
        junk_food_freq=data.junk_food_freq,
        stress_level=data.stress_level,
        mindfulness_minutes=data.mindfulness_minutes,
        work_life_balance=data.work_life_balance,
        recreational_screen_hours=data.recreational_screen_hours,
        work_screen_hours=data.work_screen_hours,
        screen_break_frequency=data.screen_break_frequency,
        screen_before_bed=data.screen_before_bed,
        caffeine_cups=data.caffeine_cups,
        smoking_status=data.smoking_status,
        alcohol_freq=data.alcohol_freq,
        notes=data.notes,
    )
    db.add(assessment)
    db.flush()

    # Fetch prior assessments for longitudinal trend tracking
    prior_assessments = (
        db.query(LifestyleAssessment)
        .filter(LifestyleAssessment.user_id == current_user.id, LifestyleAssessment.id != assessment.id)
        .order_by(LifestyleAssessment.created_at.desc())
        .all()
    )

    # Run Scoring, ML Analysis & Personalized Recommendation Generation
    analysis = compute_lifestyle_assessment_results(data, previous_assessments=prior_assessments)

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


@router.put("/{assessment_id}", response_model=AssessmentDetailResponse)
def update_assessment(
    assessment_id: int,
    data: AssessmentUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Edit and update an existing assessment:
    1. Verifies ownership.
    2. Updates raw input values.
    3. Re-computes scores and ML insights.
    4. Replaces recommendations.
    """
    assessment = db.query(LifestyleAssessment).filter(LifestyleAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Assessment #{assessment_id} not found.")

    if assessment.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to edit this assessment.")

    # Update input attributes
    for key, value in data.model_dump().items():
        if hasattr(assessment, key):
            setattr(assessment, key, value)

    # Fetch prior assessments for longitudinal trend tracking
    prior_assessments = (
        db.query(LifestyleAssessment)
        .filter(LifestyleAssessment.user_id == current_user.id, LifestyleAssessment.id != assessment.id)
        .order_by(LifestyleAssessment.created_at.desc())
        .all()
    )

    # Recompute scores & analysis with trend awareness
    analysis = compute_lifestyle_assessment_results(data, previous_assessments=prior_assessments)

    if assessment.wellness_score:
        assessment.wellness_score.composite_lwi = analysis["composite_lwi"]
        assessment.wellness_score.risk_tier = analysis["risk_tier"]
        assessment.wellness_score.sleep_score = analysis["pillars"]["sleep"]
        assessment.wellness_score.activity_score = analysis["pillars"]["physical_activity"]
        assessment.wellness_score.nutrition_score = analysis["pillars"]["nutrition_hydration"]
        assessment.wellness_score.stress_score = analysis["pillars"]["mental_wellbeing"]
        assessment.wellness_score.screen_score = analysis["pillars"]["digital_hygiene"]
        assessment.wellness_score.habits_score = analysis["pillars"]["habits"]
        assessment.wellness_score.deductions_json = json.dumps(analysis["deductions"])

    if assessment.ml_result:
        ml_data = analysis["ml_insights"]
        assessment.ml_result.cluster_id = ml_data["cluster_id"]
        assessment.ml_result.cluster_name = ml_data["cluster_name"]
        assessment.ml_result.cluster_description = ml_data["cluster_description"]
        assessment.ml_result.pca_x = ml_data["pca_coordinates"]["x"]
        assessment.ml_result.pca_y = ml_data["pca_coordinates"]["y"]
        assessment.ml_result.is_anomaly = ml_data["is_anomaly"]
        assessment.ml_result.anomaly_score = ml_data["anomaly_score"]
        assessment.ml_result.anomaly_factors_json = json.dumps(ml_data["anomaly_contributing_factors"])

    # Re-generate recommendations
    db.query(WellnessRecommendation).filter(WellnessRecommendation.assessment_id == assessment.id).delete()
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


@router.delete("/{assessment_id}")
def delete_assessment(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel and delete an assessment session and its cascading child records."""
    assessment = db.query(LifestyleAssessment).filter(LifestyleAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Assessment #{assessment_id} not found.")

    if assessment.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to delete this assessment.")

    db.delete(assessment)
    db.commit()

    return {"message": f"Assessment #{assessment_id} cancelled and deleted successfully."}


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
    """Retrieve full assessment details by ID with tenant isolation."""
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

    if assessment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this assessment.",
        )

    return serialize_assessment_detail(assessment)


@router.get("/{assessment_id}/pdf")
def download_assessment_pdf(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate and stream a professional lifestyle wellness evaluation PDF report."""
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

    if assessment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this assessment report.",
        )

    detail = serialize_assessment_detail(assessment)
    detail_dict = detail.model_dump()

    profile_dict = {}
    if current_user.profile:
        profile_dict = {
            "full_name": current_user.profile.full_name,
            "age": current_user.profile.age,
            "gender": current_user.profile.gender,
            "height_cm": current_user.profile.height_cm,
            "weight_kg": current_user.profile.weight_kg,
            "occupation": current_user.profile.occupation,
        }

    pdf_bytes = generate_lifestyle_pdf_report(detail_dict, profile_dict)

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=LifeSync_Report_{assessment_id}.pdf"
        },
    )


"""
LifeSync AI - Recommendations API Router
Endpoints for retrieving, filtering, toggling completion, and summarizing personalized lifestyle recommendations.
"""
from typing import List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.assessment import LifestyleAssessment, WellnessRecommendation
from app.routers.auth import get_current_user
from app.schemas.recommendation import (
    RecommendationItemResponse,
    RecommendationToggleResponse,
    RecommendationSummaryResponse,
)

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("/", response_model=List[RecommendationItemResponse])
def get_user_recommendations(
    category: Optional[str] = Query(None, description="Filter by category: Sleep, Physical Activity, Hydration, Nutrition, Mental Wellness, Digital Habits"),
    priority: Optional[str] = Query(None, description="Filter by priority: high, medium, low, positive"),
    is_completed: Optional[bool] = Query(None, description="Filter by completion status"),
    latest_only: bool = Query(True, description="Limit to user's most recent assessment"),
    limit: int = Query(30, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve personalized lifestyle recommendations for the authenticated user.
    Supports filtering by category, priority tier, completion status, and assessment scope.
    """
    query = (
        db.query(WellnessRecommendation)
        .join(LifestyleAssessment, WellnessRecommendation.assessment_id == LifestyleAssessment.id)
        .filter(LifestyleAssessment.user_id == current_user.id)
    )

    if latest_only:
        latest_assessment = (
            db.query(LifestyleAssessment)
            .filter(LifestyleAssessment.user_id == current_user.id)
            .order_by(LifestyleAssessment.created_at.desc())
            .first()
        )
        if not latest_assessment:
            return []
        query = query.filter(WellnessRecommendation.assessment_id == latest_assessment.id)

    if category:
        query = query.filter(WellnessRecommendation.category.ilike(f"%{category}%"))

    if priority:
        query = query.filter(WellnessRecommendation.priority == priority.lower())

    if is_completed is not None:
        query = query.filter(WellnessRecommendation.is_completed == is_completed)

    recommendations = query.order_by(WellnessRecommendation.created_at.desc()).limit(limit).all()

    return [
        RecommendationItemResponse(
            id=r.id,
            assessment_id=r.assessment_id,
            category=r.category,
            priority=r.priority,
            title=r.title,
            observation=r.title,
            action_item=r.action_item,
            suggested_action=r.action_item,
            description=r.description,
            reason=r.description,
            is_completed=r.is_completed,
            created_at=r.created_at,
        )
        for r in recommendations
    ]


@router.get("/summary", response_model=RecommendationSummaryResponse)
def get_recommendations_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get aggregated recommendations breakdown for dashboard cards:
    - Active actionable guidance
    - Completed habits count
    - Positive lifestyle habits & strengths celebrated
    - Category & priority distributions
    """
    latest_assessment = (
        db.query(LifestyleAssessment)
        .filter(LifestyleAssessment.user_id == current_user.id)
        .order_by(LifestyleAssessment.created_at.desc())
        .first()
    )

    if not latest_assessment:
        return RecommendationSummaryResponse(
            total_active=0,
            completed_count=0,
            pending_count=0,
            positive_habits_count=0,
            by_category={},
            by_priority={},
            positive_strengths=[],
            actionable_recommendations=[],
        )

    all_recs = (
        db.query(WellnessRecommendation)
        .filter(WellnessRecommendation.assessment_id == latest_assessment.id)
        .order_by(WellnessRecommendation.id.asc())
        .all()
    )

    by_category: Dict[str, int] = {}
    by_priority: Dict[str, int] = {}
    completed_count = 0
    pending_count = 0
    positive_strengths = []
    actionable_recs = []

    for r in all_recs:
        item = RecommendationItemResponse(
            id=r.id,
            assessment_id=r.assessment_id,
            category=r.category,
            priority=r.priority,
            title=r.title,
            observation=r.title,
            action_item=r.action_item,
            suggested_action=r.action_item,
            description=r.description,
            reason=r.description,
            is_completed=r.is_completed,
            created_at=r.created_at,
        )

        by_category[r.category] = by_category.get(r.category, 0) + 1
        by_priority[r.priority] = by_priority.get(r.priority, 0) + 1

        if r.is_completed:
            completed_count += 1
        else:
            pending_count += 1

        if r.priority == "positive":
            positive_strengths.append(item)
        else:
            actionable_recs.append(item)

    return RecommendationSummaryResponse(
        total_active=len(actionable_recs),
        completed_count=completed_count,
        pending_count=pending_count,
        positive_habits_count=len(positive_strengths),
        by_category=by_category,
        by_priority=by_priority,
        positive_strengths=positive_strengths,
        actionable_recommendations=actionable_recs,
    )


@router.get("/assessment/{assessment_id}", response_model=List[RecommendationItemResponse])
def get_assessment_recommendations(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve all recommendations generated for a specific assessment ID."""
    assessment = db.query(LifestyleAssessment).filter(LifestyleAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Assessment #{assessment_id} not found.")

    if assessment.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to view this assessment's recommendations.")

    return [
        RecommendationItemResponse(
            id=r.id,
            assessment_id=r.assessment_id,
            category=r.category,
            priority=r.priority,
            title=r.title,
            observation=r.title,
            action_item=r.action_item,
            suggested_action=r.action_item,
            description=r.description,
            reason=r.description,
            is_completed=r.is_completed,
            created_at=r.created_at,
        )
        for r in assessment.recommendations
    ]


@router.patch("/{recommendation_id}/toggle", response_model=RecommendationToggleResponse)
def toggle_recommendation_status(
    recommendation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Toggle is_completed status for a recommendation action item.
    Enables users to track daily habit implementation.
    """
    rec = (
        db.query(WellnessRecommendation)
        .join(LifestyleAssessment, WellnessRecommendation.assessment_id == LifestyleAssessment.id)
        .filter(
            WellnessRecommendation.id == recommendation_id,
            LifestyleAssessment.user_id == current_user.id,
        )
        .first()
    )

    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recommendation #{recommendation_id} not found or unauthorized.",
        )

    rec.is_completed = not rec.is_completed
    db.commit()
    db.refresh(rec)

    status_str = "completed" if rec.is_completed else "marked as pending"
    return RecommendationToggleResponse(
        id=rec.id,
        is_completed=rec.is_completed,
        message=f"Recommendation '{rec.title}' {status_str}.",
    )

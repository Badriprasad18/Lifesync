"""Dashboard Analytics & Trend Tracking Router."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.assessment import LifestyleAssessment, WellnessRecommendation
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    DashboardTrendsResponse,
    TrendDataPoint,
)
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Provide KPI summary metrics for user's personal analytics overview."""
    assessments = (
        db.query(LifestyleAssessment)
        .filter(LifestyleAssessment.user_id == current_user.id)
        .order_by(LifestyleAssessment.created_at.desc())
        .all()
    )

    total_assessments = len(assessments)
    user_name = current_user.profile.full_name if current_user.profile else current_user.email

    if not assessments:
        return DashboardSummaryResponse(
            total_assessments=0,
            latest_assessment_id=None,
            latest_lwi=None,
            latest_risk_tier=None,
            latest_cluster=None,
            is_latest_anomaly=False,
            best_pillar=None,
            lowest_pillar=None,
            pending_actions_count=0,
            user_name=user_name,
        )

    latest = assessments[0]
    score = latest.wellness_score
    ml = latest.ml_result

    # Determine highest and lowest scoring pillars
    pillars = {
        "Sleep": score.sleep_score,
        "Activity": score.activity_score,
        "Nutrition": score.nutrition_score,
        "Stress": score.stress_score,
        "Screen": score.screen_score,
        "Habits": score.habits_score,
    }
    sorted_pillars = sorted(pillars.items(), key=lambda x: x[1])
    lowest_pillar = f"{sorted_pillars[0][0]} ({sorted_pillars[0][1]:.1f})"
    best_pillar = f"{sorted_pillars[-1][0]} ({sorted_pillars[-1][1]:.1f})"

    # Count pending recommendation actions across user assessments
    pending_actions = (
        db.query(WellnessRecommendation)
        .join(LifestyleAssessment)
        .filter(
            LifestyleAssessment.user_id == current_user.id,
            WellnessRecommendation.is_completed == False,
        )
        .count()
    )

    return DashboardSummaryResponse(
        total_assessments=total_assessments,
        latest_assessment_id=latest.id,
        latest_lwi=score.composite_lwi,
        latest_risk_tier=score.risk_tier,
        latest_cluster=ml.cluster_name if ml else "Unassigned",
        is_latest_anomaly=ml.is_anomaly if ml else False,
        best_pillar=best_pillar,
        lowest_pillar=lowest_pillar,
        pending_actions_count=pending_actions,
        user_name=user_name,
    )


@router.get("/trends", response_model=DashboardTrendsResponse)
def get_dashboard_trends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve chronological longitudinal trendlines across all historical assessments."""
    # Query in ascending order for time-series visualization
    assessments = (
        db.query(LifestyleAssessment)
        .filter(LifestyleAssessment.user_id == current_user.id)
        .order_by(LifestyleAssessment.created_at.asc())
        .all()
    )

    if not assessments:
        return DashboardTrendsResponse(
            timeline=[],
            average_lwi=0.0,
            highest_lwi=0.0,
            lowest_lwi=0.0,
            total_points=0,
        )

    timeline: list[TrendDataPoint] = []
    lwi_values: list[float] = []

    for a in assessments:
        score = a.wellness_score
        if not score:
            continue

        lwi_values.append(score.composite_lwi)
        timeline.append(
            TrendDataPoint(
                assessment_id=a.id,
                date=a.created_at.strftime("%Y-%m-%d %H:%M"),
                lwi=score.composite_lwi,
                sleep=score.sleep_score,
                activity=score.activity_score,
                nutrition=score.nutrition_score,
                stress=score.stress_score,
                screen=score.screen_score,
                habits=score.habits_score,
            )
        )

    avg_lwi = round(sum(lwi_values) / len(lwi_values), 1) if lwi_values else 0.0
    highest_lwi = max(lwi_values) if lwi_values else 0.0
    lowest_lwi = min(lwi_values) if lwi_values else 0.0

    return DashboardTrendsResponse(
        timeline=timeline,
        average_lwi=avg_lwi,
        highest_lwi=highest_lwi,
        lowest_lwi=lowest_lwi,
        total_points=len(timeline),
    )


@router.get("/clusters")
def get_cluster_benchmarks():
    """Retrieve population cluster archetypes and PCA coordinates for scatter plotting."""
    from app.ml.engine import ml_engine
    return ml_engine.get_cluster_archetypes()


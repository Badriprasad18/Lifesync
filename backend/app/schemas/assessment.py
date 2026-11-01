"""Pydantic Schemas for Lifestyle Assessments, Scores, and ML Results."""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AssessmentCreateRequest(BaseModel):
    """Raw questionnaire inputs submitted by the user."""
    # 1. Sleep
    sleep_hours: float = Field(..., ge=0.0, le=24.0, examples=[7.5])
    sleep_quality: int = Field(..., ge=1, le=5, examples=[4])
    wake_freshness: int = Field(..., ge=1, le=5, examples=[4])

    # 2. Activity
    exercise_minutes: int = Field(..., ge=0, le=720, examples=[30])
    step_count: int = Field(..., ge=0, le=100000, examples=[6500])
    sitting_hours: float = Field(..., ge=0.0, le=24.0, examples=[7.0])

    # 3. Nutrition & Hydration
    water_intake_liters: float = Field(..., ge=0.0, le=15.0, examples=[2.5])
    meals_regularity: int = Field(..., ge=1, le=3, examples=[3])
    junk_food_freq: int = Field(..., ge=0, le=4, examples=[1])
    fruit_veg_servings: int = Field(..., ge=0, le=15, examples=[3])

    # 4. Stress & Mental Wellbeing
    stress_level: int = Field(..., ge=1, le=10, examples=[4])
    mindfulness_minutes: int = Field(..., ge=0, le=360, examples=[15])

    # 5. Screen & Digital
    work_screen_hours: float = Field(..., ge=0.0, le=24.0, examples=[6.5])
    recreational_screen_hours: float = Field(..., ge=0.0, le=24.0, examples=[2.5])
    screen_before_bed: bool = Field(..., examples=[False])

    # 6. Stimulants & Habits
    caffeine_cups: int = Field(..., ge=0, le=20, examples=[2])
    smoking_status: str = Field(..., examples=["never", "occasional", "frequent"])
    alcohol_freq: str = Field(..., examples=["none", "occasional", "frequent"])

    notes: Optional[str] = Field(None, max_length=500, examples=["Feeling energetic this week."])


class WellnessScoreResponse(BaseModel):
    id: int
    assessment_id: int
    composite_lwi: float
    risk_tier: str
    pillars: Dict[str, float]
    deductions: List[str]
    created_at: datetime


class MLAnalysisResponse(BaseModel):
    id: int
    assessment_id: int
    cluster_id: int
    cluster_name: str
    cluster_description: Optional[str]
    distance_to_center: float
    pca_coordinates: Dict[str, float]
    is_anomaly: bool
    anomaly_score: float
    anomaly_contributing_factors: List[str]


class RecommendationResponse(BaseModel):
    id: int
    category: str
    priority: str
    title: str
    description: str
    action_item: str
    is_completed: bool


class AssessmentSummaryResponse(BaseModel):
    id: int
    assessed_at: datetime
    composite_lwi: float
    risk_tier: str
    cluster_name: str
    is_anomaly: bool


class AssessmentDetailResponse(BaseModel):
    id: int
    user_id: int
    assessed_at: datetime
    inputs: Dict[str, Any]
    scores: WellnessScoreResponse
    ml_insights: MLAnalysisResponse
    recommendations: List[RecommendationResponse]

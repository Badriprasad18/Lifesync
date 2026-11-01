"""Pydantic Schemas for Lifestyle Assessments, Scores, and ML Results."""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class AssessmentCreateRequest(BaseModel):
    """Questionnaire inputs submitted by the user."""
    # 1. SLEEP
    sleep_hours: float = Field(..., ge=0.0, le=24.0, description="Average daily sleep duration in hours", examples=[7.5])
    sleep_consistency: int = Field(4, ge=1, le=5, description="Sleep schedule consistency: 1 (Very Irregular) to 5 (Very Consistent)", examples=[4])
    sleep_quality: int = Field(..., ge=1, le=5, description="Self-reported sleep quality: 1 (Very Poor) to 5 (Excellent)", examples=[4])
    wake_freshness: int = Field(4, ge=1, le=5, description="Wake-up freshness score: 1 (Exhausted) to 5 (Fully Refreshed)", examples=[4])

    # 2. PHYSICAL ACTIVITY
    exercise_minutes: int = Field(..., ge=0, le=720, description="Daily physical activity duration in minutes", examples=[30])
    activity_frequency_days: int = Field(3, ge=0, le=7, description="Weekly activity frequency (days per week)", examples=[3])
    step_count: int = Field(5000, ge=0, le=100000, description="Estimated daily step count", examples=[6500])
    sitting_hours: float = Field(..., ge=0.0, le=24.0, description="Sedentary sitting hours per day", examples=[7.0])

    # 3. HYDRATION
    water_intake_liters: float = Field(..., ge=0.0, le=15.0, description="Daily water intake in liters", examples=[2.5])
    hydration_habit: str = Field("regular", description="Hydration habit pattern", examples=["regular", "thirst_only", "reminders_needed"])

    # 4. NUTRITION
    meals_regularity: int = Field(..., ge=1, le=3, description="Meal regularity: 1=Irregular, 2=Somewhat, 3=Consistent", examples=[3])
    fruit_veg_servings: int = Field(..., ge=0, le=15, description="Fruit and vegetable consumption servings/day", examples=[3])
    junk_food_freq: int = Field(..., ge=0, le=4, description="General meal balance / junk food frequency: 0=Never to 4=Multiple times/day", examples=[1])

    # 5. MENTAL WELLNESS
    stress_level: int = Field(..., ge=1, le=10, description="Self-reported stress level: 1 (Low) to 10 (Burnout)", examples=[4])
    mindfulness_minutes: int = Field(10, ge=0, le=360, description="Relaxation frequency / mindfulness minutes per day", examples=[15])
    work_life_balance: int = Field(3, ge=1, le=5, description="Study/work-life balance: 1 (Poor) to 5 (Excellent)", examples=[4])

    # 6. DIGITAL HABITS
    recreational_screen_hours: float = Field(..., ge=0.0, le=24.0, description="Recreational screen time in hours/day", examples=[2.5])
    work_screen_hours: float = Field(6.0, ge=0.0, le=24.0, description="Work/study screen time in hours/day", examples=[6.5])
    screen_break_frequency: str = Field("occasional", description="Screen break frequency", examples=["every_30m", "hourly", "rarely"])
    screen_before_bed: bool = Field(..., description="Looking at screens within 1 hour before sleep", examples=[False])

    # General Habits
    caffeine_cups: int = Field(1, ge=0, le=20, examples=[2])
    smoking_status: str = Field("never", examples=["never", "occasional", "frequent"])
    alcohol_freq: str = Field("none", examples=["none", "occasional", "frequent"])

    notes: Optional[str] = Field(None, max_length=500, examples=["Midterm exams preparation week"])

    model_config = ConfigDict(from_attributes=True)


class AssessmentUpdateRequest(AssessmentCreateRequest):
    """Schema for updating/editing an existing assessment."""
    pass


class WellnessScoreResponse(BaseModel):
    id: int
    assessment_id: int
    composite_lwi: float
    risk_tier: str
    pillars: Dict[str, float]
    deductions: List[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


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

    model_config = ConfigDict(from_attributes=True)


class RecommendationResponse(BaseModel):
    id: int
    category: str
    priority: str
    title: str
    description: str
    action_item: str
    is_completed: bool

    model_config = ConfigDict(from_attributes=True)


class AssessmentSummaryResponse(BaseModel):
    id: int
    assessed_at: datetime
    composite_lwi: float
    risk_tier: str
    cluster_name: str
    is_anomaly: bool

    model_config = ConfigDict(from_attributes=True)


class AssessmentDetailResponse(BaseModel):
    id: int
    user_id: int
    assessed_at: datetime
    inputs: Dict[str, Any]
    scores: WellnessScoreResponse
    ml_insights: MLAnalysisResponse
    recommendations: List[RecommendationResponse]

    model_config = ConfigDict(from_attributes=True)

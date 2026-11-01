"""SQLAlchemy Lifestyle Assessment, Scores, ML, and Recommendation Models."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from app.database import Base


class LifestyleAssessment(Base):
    """Core lifestyle assessment intake submission record."""
    __tablename__ = "lifestyle_assessments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # 1. Sleep Metrics
    sleep_hours = Column(Float, nullable=False)
    sleep_consistency = Column(Integer, nullable=False, default=4)  # 1 (Erratic) to 5 (Consistent schedule)
    sleep_quality = Column(Integer, nullable=False)  # 1 (Very Poor) to 5 (Excellent)
    wake_freshness = Column(Integer, nullable=False)  # 1 (Exhausted) to 5 (Refreshed)

    # 2. Physical Activity Metrics
    exercise_minutes = Column(Integer, nullable=False)  # Daily activity duration (0 to 720 mins)
    activity_frequency_days = Column(Integer, nullable=False, default=3)  # Weekly frequency (0 to 7 days)
    step_count = Column(Integer, nullable=False, default=5000)  # Estimated daily steps
    sitting_hours = Column(Float, nullable=False)  # Sedentary sitting behavior (0 to 24 hrs)

    # 3. Hydration Metrics
    water_intake_liters = Column(Float, nullable=False)  # Daily intake in liters
    hydration_habit = Column(String(50), nullable=False, default="regular")  # "regular", "thirst_only", "reminders_needed"

    # 4. Nutrition Metrics
    meals_regularity = Column(Integer, nullable=False)  # 1=Irregular, 2=Somewhat regular, 3=Consistent
    fruit_veg_servings = Column(Integer, nullable=False)  # Servings per day (0 to 15)
    junk_food_freq = Column(Integer, nullable=False)  # 0=Never, 1=1-2x/wk, 2=3-4x/wk, 3=Daily, 4=Multiple/day

    # 5. Mental Wellness Metrics
    stress_level = Column(Integer, nullable=False)  # 1 (Calm/Low) to 10 (Burnout)
    mindfulness_minutes = Column(Integer, nullable=False, default=10)  # Relaxation time per day
    work_life_balance = Column(Integer, nullable=False, default=3)  # 1 (Poor) to 5 (Optimal balance)

    # 6. Digital Habits Metrics
    recreational_screen_hours = Column(Float, nullable=False)  # Recreational screen time (0 to 24)
    work_screen_hours = Column(Float, nullable=False)  # Study/work screen time (0 to 24)
    screen_break_frequency = Column(String(50), nullable=False, default="occasional")  # "every_30m", "hourly", "rarely"
    screen_before_bed = Column(Boolean, nullable=False)  # Looking at screens within 1h of bedtime

    # General Habits
    caffeine_cups = Column(Integer, nullable=False, default=1)
    smoking_status = Column(String(20), nullable=False, default="never")
    alcohol_freq = Column(String(20), nullable=False, default="none")

    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="assessments")
    wellness_score = relationship("WellnessScore", back_populates="assessment", uselist=False, cascade="all, delete-orphan")
    ml_result = relationship("MLAnalysisResult", back_populates="assessment", uselist=False, cascade="all, delete-orphan")
    recommendations = relationship("WellnessRecommendation", back_populates="assessment", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<LifestyleAssessment id={self.id} user_id={self.user_id} date={self.created_at}>"


class WellnessScore(Base):
    """Explainable rule-derived wellness index and pillar sub-scores."""
    __tablename__ = "wellness_scores"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    assessment_id = Column(
        Integer, ForeignKey("lifestyle_assessments.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )

    composite_lwi = Column(Float, nullable=False)  # 0.0 to 100.0
    risk_tier = Column(String(30), nullable=False)  # Optimal, Fair, Elevated Risk, Critical Alert
    sleep_score = Column(Float, nullable=False)
    activity_score = Column(Float, nullable=False)
    nutrition_score = Column(Float, nullable=False)
    stress_score = Column(Float, nullable=False)
    screen_score = Column(Float, nullable=False)
    habits_score = Column(Float, nullable=False)
    deductions_json = Column(Text, nullable=False, default="[]")  # JSON encoded list of deduction details
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationship
    assessment = relationship("LifestyleAssessment", back_populates="wellness_score")

    def __repr__(self):
        return f"<WellnessScore assessment_id={self.assessment_id} LWI={self.composite_lwi}>"


class MLAnalysisResult(Base):
    """Unsupervised Machine Learning model outputs (K-Means + Isolation Forest)."""
    __tablename__ = "ml_analysis_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    assessment_id = Column(
        Integer, ForeignKey("lifestyle_assessments.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )

    cluster_id = Column(Integer, nullable=False)  # 0, 1, 2, 3
    cluster_name = Column(String(100), nullable=False)
    cluster_description = Column(Text, nullable=True)
    distance_to_center = Column(Float, nullable=False, default=0.0)
    pca_x = Column(Float, nullable=False, default=0.0)
    pca_y = Column(Float, nullable=False, default=0.0)

    is_anomaly = Column(Boolean, nullable=False, default=False)
    anomaly_score = Column(Float, nullable=False, default=0.0)
    anomaly_factors_json = Column(Text, nullable=False, default="[]")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationship
    assessment = relationship("LifestyleAssessment", back_populates="ml_result")

    def __repr__(self):
        return f"<MLAnalysisResult assessment_id={self.assessment_id} cluster={self.cluster_name}>"


class WellnessRecommendation(Base):
    """Personalized, actionable lifestyle guidance items."""
    __tablename__ = "wellness_recommendations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    assessment_id = Column(
        Integer, ForeignKey("lifestyle_assessments.id", ondelete="CASCADE"), nullable=False, index=True
    )

    category = Column(String(50), nullable=False)  # Sleep, Activity, Hydration, Nutrition, Stress, Screen, Habits
    priority = Column(String(20), nullable=False)  # high, medium, low
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    action_item = Column(String(255), nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationship
    assessment = relationship("LifestyleAssessment", back_populates="recommendations")

    def __repr__(self):
        return f"<WellnessRecommendation id={self.id} category={self.category} priority={self.priority}>"

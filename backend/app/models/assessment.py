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
    sleep_quality = Column(Integer, nullable=False)  # 1 to 5
    wake_freshness = Column(Integer, nullable=False)  # 1 to 5

    # 2. Physical Activity Metrics
    exercise_minutes = Column(Integer, nullable=False)  # 0 to 720
    step_count = Column(Integer, nullable=False)  # 0 to 100,000
    sitting_hours = Column(Float, nullable=False)  # 0 to 24

    # 3. Nutrition & Hydration Metrics
    water_intake_liters = Column(Float, nullable=False)  # 0 to 15
    meals_regularity = Column(Integer, nullable=False)  # 1=Irregular, 2=Somewhat, 3=Consistent
    junk_food_freq = Column(Integer, nullable=False)  # 0=Never, 1=1-2x/wk, 2=3-4x/wk, 3=Daily, 4=Multiple/day
    fruit_veg_servings = Column(Integer, nullable=False)  # 0 to 15

    # 4. Stress & Mental Wellbeing Metrics
    stress_level = Column(Integer, nullable=False)  # 1 (Low) to 10 (Extreme)
    mindfulness_minutes = Column(Integer, nullable=False)  # 0 to 360

    # 5. Screen & Digital Habits
    work_screen_hours = Column(Float, nullable=False)  # 0 to 24
    recreational_screen_hours = Column(Float, nullable=False)  # 0 to 24
    screen_before_bed = Column(Boolean, nullable=False)  # Within 1h before bed

    # 6. Stimulants & General Habits
    caffeine_cups = Column(Integer, nullable=False)  # 0 to 20
    smoking_status = Column(String(20), nullable=False)  # "never", "occasional", "frequent"
    alcohol_freq = Column(String(20), nullable=False)  # "none", "occasional", "frequent"

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

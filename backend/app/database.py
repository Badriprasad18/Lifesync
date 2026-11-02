"""Database Configuration and SQLAlchemy Session Lifecycle."""
import logging
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

logger = logging.getLogger(__name__)

is_sqlite = settings.DATABASE_URL.startswith("sqlite")

engine_kwargs = {"echo": False}
if is_sqlite:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # PostgreSQL / NeonDB connection pooling configuration
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_recycle"] = 300

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)

if is_sqlite:
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        """Enforce SQLite WAL mode, foreign keys, and busy timeout for high reliability."""
        try:
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA journal_mode = WAL;")
            cursor.execute("PRAGMA foreign_keys = ON;")
            cursor.execute("PRAGMA busy_timeout = 5000;")
            cursor.close()
        except Exception as e:
            logger.warning(f"Could not configure SQLite pragmas: {e}")


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI Dependency providing request-scoped database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_demo_accounts():
    """Seed Badriprasad Dash and MCA Demo accounts if not already present."""
    from app.models.user import User, UserProfile
    from app.models.assessment import (
        LifestyleAssessment,
        WellnessScore,
        MLAnalysisResult,
        WellnessRecommendation,
    )
    from app.utils.security import hash_password
    from datetime import datetime, timezone

    db = SessionLocal()
    try:
        # 1. Badriprasad Dash
        badri_email = "badriprasaddash849@gmail.com"
        badri_user = db.query(User).filter(User.email == badri_email).first()
        if not badri_user:
            badri_user = User(
                email=badri_email,
                hashed_password=hash_password("Badri123!"),
                is_active=True,
            )
            db.add(badri_user)
            db.flush()

            badri_profile = UserProfile(
                user_id=badri_user.id,
                full_name="Badriprasad Dash",
                age=23,
                gender="male",
                height_cm=188.0,
                weight_kg=65.0,
                occupation="MCA Student",
            )
            db.add(badri_profile)
            db.commit()
            db.refresh(badri_user)
            logger.info("Seeded user Badriprasad Dash in NeonDB.")

        # 2. MCA Demo Student
        mca_email = "student_mca@college.edu"
        mca_user = db.query(User).filter(User.email == mca_email).first()
        if not mca_user:
            mca_user = User(
                email=mca_email,
                hashed_password=hash_password("StudentPassword123!"),
                is_active=True,
            )
            db.add(mca_user)
            db.flush()

            mca_profile = UserProfile(
                user_id=mca_user.id,
                full_name="MCA Demo Student",
                age=22,
                gender="male",
                height_cm=175.0,
                weight_kg=68.0,
                occupation="MCA Student",
            )
            db.add(mca_profile)
            db.commit()
            db.refresh(mca_user)
            logger.info("Seeded MCA Demo Student in NeonDB.")

        # Ensure Badriprasad Dash has baseline assessment and recommendations
        has_assessment = db.query(LifestyleAssessment).filter(LifestyleAssessment.user_id == badri_user.id).first()
        if not has_assessment:
            assessment = LifestyleAssessment(
                user_id=badri_user.id,
                sleep_hours=7.5,
                sleep_consistency=4,
                sleep_quality=4,
                wake_freshness=4,
                exercise_minutes=45,
                activity_frequency_days=4,
                step_count=7500,
                sitting_hours=6.5,
                water_intake_liters=2.5,
                hydration_habit="regular",
                meals_regularity=3,
                fruit_veg_servings=4,
                junk_food_freq=1,
                stress_level=3,
                mindfulness_minutes=15,
                work_life_balance=4,
                recreational_screen_hours=2.0,
                work_screen_hours=5.0,
                screen_break_frequency="hourly",
                screen_before_bed=False,
                caffeine_cups=1,
                smoking_status="never",
                alcohol_freq="none",
                notes="Baseline wellness assessment for Badriprasad Dash on NeonDB.",
                created_at=datetime.now(timezone.utc),
            )
            db.add(assessment)
            db.flush()

            wellness_score = WellnessScore(
                assessment_id=assessment.id,
                composite_lwi=88.5,
                risk_tier="Optimal",
                sleep_score=87.0,
                activity_score=85.0,
                nutrition_score=90.0,
                stress_score=88.0,
                screen_score=84.0,
                habits_score=95.0,
                deductions_json="[]",
                created_at=datetime.now(timezone.utc),
            )
            db.add(wellness_score)

            ml_result = MLAnalysisResult(
                assessment_id=assessment.id,
                cluster_id=0,
                cluster_name="Balanced High-Achiever",
                cluster_description="Exemplifies balanced sleep, regular physical activity, mindful screen limits, and consistent hydration.",
                distance_to_center=0.42,
                pca_x=-1.25,
                pca_y=0.88,
                is_anomaly=False,
                anomaly_score=-0.12,
                anomaly_factors_json="[]",
                created_at=datetime.now(timezone.utc),
            )
            db.add(ml_result)

            default_recs = [
                ("Sleep", "high", "Consistent Sleep Schedule", "Maintain your 11:00 PM sleep schedule to stabilize circadian melatonin rhythm.", "Set bedtime notification at 10:30 PM", False),
                ("Activity", "medium", "Post-Study Micro-Movement", "Take a 5-minute movement break for every 50 minutes of coding or studying.", "Stretch and walk 250 steps after study blocks", False),
                ("Hydration", "medium", "Mid-Morning Hydration Target", "Target 1 liter of water consumption before 12:00 PM.", "Keep a 1L water bottle at your workstation", True),
                ("Digital Hygiene", "low", "Blue-Light Pre-Sleep Buffer", "Keep digital screens away 45 minutes prior to sleep.", "Switch to night mode or read a book before bed", False),
            ]
            for cat, prio, title, desc, action, completed in default_recs:
                rec = WellnessRecommendation(
                    assessment_id=assessment.id,
                    category=cat,
                    priority=prio,
                    title=title,
                    description=desc,
                    action_item=action,
                    is_completed=completed,
                    created_at=datetime.now(timezone.utc),
                )
                db.add(rec)

            db.commit()
            logger.info("Seeded baseline assessment and recommendations for Badriprasad Dash.")

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding demo accounts: {e}")
    finally:
        db.close()


def init_db():
    """Initialize database tables according to declared ORM metadata."""
    from app import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully in NeonDB.")
    seed_demo_accounts()

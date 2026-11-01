# LifeSync AI — Entity-Relationship (ER) Diagram & Data Dictionary

This document details the relational database schema, entities, attributes, primary/foreign key relationships, and cardinalities implemented in LifeSync AI using SQLite and SQLAlchemy.

---

## 1. Visual Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--|| USER_PROFILES : "has one (1:1)"
    USERS ||--o{ LIFESTYLE_ASSESSMENTS : "submits many (1:N)"
    LIFESTYLE_ASSESSMENTS ||--|| WELLNESS_SCORES : "generates one (1:1)"
    LIFESTYLE_ASSESSMENTS ||--|| ML_ANALYSIS_RESULTS : "produces one (1:1)"
    LIFESTYLE_ASSESSMENTS ||--o{ WELLNESS_RECOMMENDATIONS : "yields many (1:N)"

    USERS {
        int id PK "Primary Key, Auto Increment"
        string email UK "Unique, Indexed, Lowercase"
        string hashed_password "Bcrypt Hash (60 chars)"
        boolean is_active "Default TRUE"
        datetime created_at "Timestamp (UTC)"
        datetime updated_at "Timestamp (UTC)"
    }

    USER_PROFILES {
        int id PK "Primary Key, Auto Increment"
        int user_id FK "Foreign Key -> users.id, Unique"
        string full_name "User Full Name (2-100 chars)"
        int age "Age (10-120 years)"
        string gender "male, female, other, prefer_not_to_say"
        float height_cm "Height in centimeters"
        float weight_kg "Weight in kilograms"
        string occupation "Occupation / Academic Role"
        datetime created_at "Timestamp (UTC)"
        datetime updated_at "Timestamp (UTC)"
    }

    LIFESTYLE_ASSESSMENTS {
        int id PK "Primary Key, Auto Increment"
        int user_id FK "Foreign Key -> users.id, Indexed"
        float sleep_hours "Daily sleep duration (0-24)"
        int sleep_consistency "Scale 1-5"
        int sleep_quality "Scale 1-5"
        int wake_freshness "Scale 1-5"
        int exercise_minutes "Daily exercise (0-720)"
        int activity_frequency_days "Weekly activity (0-7)"
        int step_count "Daily step count (0-100000)"
        float sitting_hours "Sedentary hours (0-24)"
        float water_intake_liters "Daily water intake (0-15)"
        string hydration_habit "regular, thirst_only, etc."
        int meals_regularity "Scale 1-3"
        int fruit_veg_servings "Daily servings (0-15)"
        int junk_food_freq "Scale 0-4"
        int stress_level "Scale 1-10"
        int mindfulness_minutes "Daily minutes (0-360)"
        int work_life_balance "Scale 1-5"
        float recreational_screen_hours "Hours per day (0-24)"
        float work_screen_hours "Hours per day (0-24)"
        string screen_break_frequency "hourly, every_30m, rarely"
        boolean screen_before_bed "True/False"
        int caffeine_cups "Daily cups (0-20)"
        string smoking_status "never, occasional, frequent"
        string alcohol_freq "none, occasional, frequent"
        string notes "Optional text notes"
        datetime created_at "Timestamp (UTC)"
    }

    WELLNESS_SCORES {
        int id PK "Primary Key, Auto Increment"
        int assessment_id FK "Foreign Key -> lifestyle_assessments.id, Unique"
        float composite_lwi "Composite Score 0.0 - 100.0"
        string risk_tier "Optimal, Good, Moderate, Elevated"
        float sleep_score "Pillar Score 0.0 - 100.0"
        float activity_score "Pillar Score 0.0 - 100.0"
        float nutrition_score "Pillar Score 0.0 - 100.0"
        float stress_score "Pillar Score 0.0 - 100.0"
        float screen_score "Pillar Score 0.0 - 100.0"
        float habits_score "Pillar Score 0.0 - 100.0"
        text deductions_json "JSON Array of Audit Deductions"
        datetime created_at "Timestamp (UTC)"
    }

    ML_ANALYSIS_RESULTS {
        int id PK "Primary Key, Auto Increment"
        int assessment_id FK "Foreign Key -> lifestyle_assessments.id, Unique"
        int cluster_id "KMeans Cluster Index (0-3)"
        string cluster_name "Balanced High-Achiever, etc."
        string cluster_description "Archetype descriptive summary"
        float distance_to_center "Euclidean distance to centroid"
        float pca_x "PCA Component 1 Coordinate"
        float pca_y "PCA Component 2 Coordinate"
        boolean is_anomaly "Isolation Forest Outlier Flag"
        float anomaly_score "Raw Decision Score"
        text anomaly_factors_json "JSON Array of Attributed Factors"
        datetime created_at "Timestamp (UTC)"
    }

    WELLNESS_RECOMMENDATIONS {
        int id PK "Primary Key, Auto Increment"
        int assessment_id FK "Foreign Key -> lifestyle_assessments.id, Indexed"
        string category "Sleep, Physical Activity, Hydration, etc."
        string priority "high, medium, low, positive"
        string title "Identified Habit Observation"
        string description "Physiological Justification / Reason"
        string action_item "Specific Actionable Micro-Habit"
        boolean is_completed "Daily Completion Toggle (Default FALSE)"
        datetime created_at "Timestamp (UTC)"
    }
```

---

## 2. Relational Cardinalities & Constraints

### 2.1 `users` $\rightarrow$ `user_profiles` (One-to-One / 1:1)
- **Constraint:** `user_profiles.user_id` is defined with `unique=True` and `ForeignKey("users.id", ondelete="CASCADE")`.
- **Business Rule:** Every user has exactly one personal demographic profile. Deleting a user account cascades to delete their associated profile.

### 2.2 `users` $\rightarrow$ `lifestyle_assessments` (One-to-Many / 1:N)
- **Constraint:** `lifestyle_assessments.user_id` is a `ForeignKey("users.id", ondelete="CASCADE")` indexed for fast lookup.
- **Business Rule:** A user can submit multiple assessment questionnaires over time, creating a longitudinal historical audit trail.

### 2.3 `lifestyle_assessments` $\rightarrow$ `wellness_scores` (One-to-One / 1:1)
- **Constraint:** `wellness_scores.assessment_id` is defined with `unique=True` and `ForeignKey("lifestyle_assessments.id", ondelete="CASCADE")`.
- **Business Rule:** Each lifestyle questionnaire intake produces exactly one set of explainable scores and composite index.

### 2.4 `lifestyle_assessments` $\rightarrow$ `ml_analysis_results` (One-to-One / 1:1)
- **Constraint:** `ml_analysis_results.assessment_id` is defined with `unique=True` and `ForeignKey("lifestyle_assessments.id", ondelete="CASCADE")`.
- **Business Rule:** Each assessment intake is evaluated once by the Scikit-Learn KMeans, PCA, and Isolation Forest models.

### 2.5 `lifestyle_assessments` $\rightarrow$ `wellness_recommendations` (One-to-Many / 1:N)
- **Constraint:** `wellness_recommendations.assessment_id` is a `ForeignKey("lifestyle_assessments.id", ondelete="CASCADE")`.
- **Business Rule:** Each assessment intake yields between 3 and 10 actionable habit recommendations tailored to detected deficiencies and strengths.

---

## 3. Data Integrity & Storage Engine

- **Database Engine:** SQLite 3 configured with Write-Ahead Logging (`PRAGMA journal_mode=WAL`), eliminating concurrency deadlocks between simultaneous read and write operations.
- **Foreign Key Enforcement:** Enabled on every database connection via `PRAGMA foreign_keys=ON`.
- **Zero Raw Passwords:** Passwords hashed with `bcrypt` (60 ASCII characters) before database insertion. Plaintext passwords are never stored in memory or disk.

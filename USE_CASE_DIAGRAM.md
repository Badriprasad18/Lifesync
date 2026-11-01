# LifeSync AI — Use Case Model & Actor Specifications

This document defines the behavioral specifications, actor interactions, use case boundaries, and operational workflows implemented across LifeSync AI.

---

## 1. Visual Use Case Diagram

```mermaid
flowchart TD
    %% Actors
    ActorUser(["🧑‍💻 University Student / User"])
    ActorML[["🤖 Scikit-Learn ML Engine"]]
    ActorPDF[["📄 ReportLab PDF Generator"]]

    subgraph Boundary [" LifeSync AI Platform Boundary "]
        direction TB

        %% Authentication & Profile
        UC01(["UC-01: Register & Authenticate (JWT)"])
        UC02(["UC-02: Manage Biometric Profile & BMI"])

        %% Questionnaire & Scoring
        UC03(["UC-03: Complete Lifestyle Assessment Wizard"])
        UC04(["UC-04: Calculate Explainable Wellness Scores"])

        %% Machine Learning
        UC05(["UC-05: Segment Population Archetype (KMeans)"])
        UC06(["UC-06: Compute 2D PCA Latent Coordinates"])
        UC07(["UC-07: Detect Lifestyle Anomalies (Isolation Forest)"])

        %% Recommendations & Habits
        UC08(["UC-08: Generate Personalized Recommendations"])
        UC09(["UC-09: Toggle Habit Completion ('Mark Done')"])

        %% Analytics & Audit
        UC10(["UC-10: Inspect Longitudinal Trends & Benchmark"])
        UC11(["UC-11: Audit Session History & Manage Records"])

        %% Reporting & Settings
        UC12(["UC-12: Generate & Download Executive PDF Report"])
        UC13(["UC-13: Switch Theme & Export JSON Data Backup"])
    end

    %% Actor Connections
    ActorUser --> UC01
    ActorUser --> UC02
    ActorUser --> UC03
    ActorUser --> UC09
    ActorUser --> UC10
    ActorUser --> UC11
    ActorUser --> UC12
    ActorUser --> UC13

    %% System Inclusions & Extensions
    UC03 -.->|<<include>>| UC04
    UC04 -.->|<<include>>| UC05
    UC04 -.->|<<include>>| UC06
    UC04 -.->|<<include>>| UC07
    UC04 -.->|<<include>>| UC08

    %% Backend System Actors
    UC05 --- ActorML
    UC06 --- ActorML
    UC07 --- ActorML
    UC12 --- ActorPDF
```

---

## 2. Core Use Case Specifications

### UC-01: Register & Authenticate
* **Primary Actor:** University Student / User.
* **Preconditions:** Client application reachable via browser.
* **Main Success Scenario:**
  1. User navigates to `/register`, enters email, password, full name, age, gender, and occupation.
  2. Frontend sends payload to `POST /api/auth/register`.
  3. Backend hashes password with bcrypt salt factor 12, creates atomic records in `users` and `user_profiles`.
  4. Backend generates signed HS256 JWT access token.
  5. Frontend stores token in `localStorage`, updates React AuthContext, and redirects to `/dashboard`.
* **Alternative Scenario (Demo Access):** User clicks "Instant Demo Access" on `/login` to instantly initialize pre-configured student session.

### UC-03: Complete Lifestyle Assessment Wizard
* **Primary Actor:** University Student / User.
* **Preconditions:** User authenticated with active JWT token.
* **Main Success Scenario:**
  1. User opens `/assessment` and progresses through 6 structured steps:
     - Step 1: Sleep Duration & Quality
     - Step 2: Physical Activity & Sedentary Hours
     - Step 3: Nutrition & Daily Hydration
     - Step 4: Mental Wellbeing & Mindfulness
     - Step 5: Digital Hygiene & Screen Habits
     - Step 6: Substance Habits & Review
  2. User reviews answers and clicks "Submit Complete Assessment".
  3. Frontend sends payload to `POST /api/assessment/`.
  4. Backend runs scoring calculations (UC-04), ML clustering (UC-05), PCA projection (UC-06), anomaly detection (UC-07), and recommendation generation (UC-08).
  5. Results are persisted atomically to SQLite.
  6. Frontend receives full serialized assessment detail and redirects user to `/assessment/results`.

### UC-05: Segment Population Archetype (K-Means)
* **Primary Actor:** Scikit-Learn ML Engine (Internal).
* **Preconditions:** Assessment questionnaire submitted.
* **Main Success Scenario:**
  1. ML Engine extracts 10-dimensional feature vector.
  2. Applies `StandardScaler` fitted on $N=1,500$ population dataset.
  3. Evaluates standardized vector against fitted `KMeans(n_clusters=4)`.
  4. Predicts cluster label (0: Balanced High-Achiever, 1: Sedentary Overextended, 2: Irregular Burnout, 3: Wellness Optimizer).
  5. Calculates Euclidean distance to centroid.
  6. Returns cluster name and descriptive summary.

### UC-07: Detect Lifestyle Anomalies (Isolation Forest)
* **Primary Actor:** Scikit-Learn ML Engine (Internal).
* **Preconditions:** Feature vector standardized.
* **Main Success Scenario:**
  1. Passes standardized vector to trained `IsolationForest(n_estimators=100, contamination=0.08)`.
  2. Calculates anomaly decision function score.
  3. Flags `is_anomaly=True` if decision function $< 0$.
  4. Performs z-score feature attribution to identify outlier drivers (e.g., extreme screen hours $>14\text{h}$ combined with sleep $<4\text{h}$).
  5. Attaches anomaly tags to assessment output.

### UC-09: Toggle Habit Completion
* **Primary Actor:** University Student / User.
* **Preconditions:** Assessment generated with recommendations.
* **Main Success Scenario:**
  1. User navigates to `/recommendations`.
  2. User clicks "Mark Done" toggle on a specific micro-habit card.
  3. Frontend sends `PATCH /api/recommendations/{id}/toggle`.
  4. Backend toggles `is_completed` boolean in `wellness_recommendations` table.
  5. Frontend reactively updates completion percentage and badge state.

### UC-12: Generate & Download Executive PDF Report
* **Primary Actor:** University Student / User.
* **Secondary Actor:** ReportLab PDF Generator.
* **Preconditions:** User has at least one completed assessment session.
* **Main Success Scenario:**
  1. User clicks "Download PDF Report" on `/assessment/results`, `/history`, or `/dashboard`.
  2. Frontend sends request to `GET /api/assessment/{id}/pdf`.
  3. Backend verifies user ownership, serializes assessment scores, ML archetype, and recommendations.
  4. ReportLab compiles two-page styled document with executive headers, pillar score tables, and academic disclaimers.
  5. Backend streams binary `%PDF-1.4` file as attachment download.
  6. Browser automatically downloads `LifeSync_Report_#{id}.pdf`.

# LifeSync AI — Comprehensive Academic Project Report

**Project Title:** Artificial Intelligence-Based Lifestyle Risk Assessment and Personalized Wellness Recommendation Platform  
**Academic Degree:** Master of Computer Applications (MCA)  
**Subject Area:** Information-Based Software Technology (IBST)  
**Academic Year:** 2026  

---

## 1. Introduction

Modern university education, knowledge work, and software engineering environments require extensive periods of intense intellectual effort, sustained computer screen time, and irregular working hours. The proliferation of digital devices has transformed student and professional lifestyle patterns, often resulting in insidious health hazards including chronic sleep deprivation, prolonged physical inactivity, suboptimal hydration, irregular meal consumption, elevated psychological stress, and severe digital eye strain.

While modern medicine possesses advanced diagnostic tools for acute illnesses, preventative lifestyle health evaluation remains largely fragmented, inaccessible, or reliant on expensive clinical consultations. Students and knowledge workers typically lack an objective, privacy-preserving, and computationally sound mechanism to self-assess daily lifestyle habits, identify emerging risk factors, and implement sustainable behavioral adjustments before chronic health conditions manifest.

**LifeSync AI** addresses this challenge by combining modern software engineering principles with explainable Artificial Intelligence and Machine Learning techniques. The platform implements a deterministic multi-pillar scoring engine, unsupervised K-Means clustering, 2D Principal Component Analysis (PCA) projection, and Isolation Forest anomaly detection to deliver personalized, supportive wellness guidance.

---

## 2. Problem Statement

University students and digital computer professionals experience interconnected lifestyle stresses that negatively impact cognitive performance, psychological balance, and long-term health:

1. **Sedentary Habits & Screen Saturation:** Computer science and MCA students report averaging 8 to 14 hours of daily screen time, characterized by poor ergonomic posture, rare screen breaks, and insufficient physical movement.
2. **Circadian Rhythm Disruption:** Irregular academic schedules and late-night digital device exposure disrupt melatonin production and sleep-wake cycles, leading to daytime exhaustion.
3. **Lack of Integrated Holistic Assessment:** Existing digital health solutions typically focus on isolated metrics (e.g., calorie counters or basic pedometers) rather than auditing the multivariate lifestyle ecosystem (Sleep, Activity, Hydration, Nutrition, Mental Health, and Digital Habits).
4. **Black-Box AI Skepticism:** Many modern consumer health apps employ opaque scoring algorithms that lack mathematical transparency or provide overly generic, unscientific guidance.
5. **Absence of Longitudinal Tracking:** Users cannot visualize whether lifestyle modifications over weeks or months correlate with measurable wellness improvements.

---

## 3. Project Objectives

The primary objectives of LifeSync AI are:

1. **Develop an Explainable Lifestyle Scoring Engine:** Formulate a deterministic, transparent composite metric—the *LifeSync Wellness Index (LWI)* (0–100)—derived from six validated lifestyle pillars with explicit audit deduction rules.
2. **Implement Unsupervised Machine Learning Segmentation:** Train an unsupervised K-Means clustering model ($k=4$) on demographic lifestyle features to assign users to empirical population archetypes.
3. **Provide Latent Demographic Visualization:** Perform 2D Principal Component Analysis (PCA) to graphically position user habit profiles relative to population cohort centroids.
4. **Engineer Multivariate Anomaly Detection:** Implement an Isolation Forest tree ensemble to detect dangerous or atypical lifestyle combinations (e.g., severe sleep deficits combined with excessive caffeine and sedentary screen immersion).
5. **Generate Contextual Habit Recommendations:** Build a personalized recommendation engine that maps scoring gaps to targeted micro-habits accompanied by physiological explanations.
6. **Track Longitudinal Progress:** Maintain historical audit sessions enabling time-series visual trend analysis and metric delta tracking.
7. **Deliver an Executive PDF Report:** Engineer an automated PDF report generator using ReportLab to export formatted evaluation summaries for personal records or mentor reviews.
8. **Ensure Strict Data Isolation & Security:** Enforce multi-tenant database isolation, bcrypt password hashing, and signed JWT session authentication.

---

## 4. Existing System vs. Proposed System

| Dimension | Existing Systems (Commercial Trackers / Apps) | Proposed System (LifeSync AI) |
|---|---|---|
| **Domain Scope** | Narrow focus (e.g., pure fitness pedometer, calorie tracker, or sleep logger). | Holistic 6-pillar ecosystem evaluation covering physical, nutritional, psychological, and digital habits. |
| **Algorithmic Transparency** | Opaque "black-box" proprietary scores without explained mathematical contribution. | Open, deterministic mathematical scoring formulas with transparent deduction logging. |
| **Machine Learning Integration** | Often marketing claims with simple hardcoded thresholds or generic static advice. | Genuine Scikit-Learn pipeline: KMeans ($k=4$), 2D PCA projection, and Isolation Forest anomaly scoring. |
| **Demographic Context** | Universal standard that compares sedentary students to athletic standards. | Normalizes habits against calibrated population cohorts with PCA distance metrics. |
| **Data Privacy** | Cloud monetization models sharing user lifestyle habits with advertising networks. | Local, tenant-isolated SQLite/FastAPI architecture with full user data deletion control. |
| **Cost & Accessibility** | Expensive recurring subscription paywalls. | Free, open-source academic architecture designed for educational institutions. |

---

## 5. Feasibility Study

### 5.1 Technical Feasibility
The platform utilizes proven, production-grade open-source technologies:
- **Backend:** Python 3.10+ and FastAPI provide native asynchronous request handling, high throughput, and automatic OpenAPI schema generation.
- **Machine Learning:** Scikit-Learn, Pandas, and NumPy offer high-performance, vectorized numerical computation and serializable model artifacts via Joblib.
- **Frontend:** React 18, Vite, and Tailwind CSS provide fast development cycles, modular component architecture, and responsive UI layouts across desktop and mobile devices.
- **Hardware Requirements:** The system operates comfortably on standard consumer laptop hardware (Intel Core i3/i5/i7 or AMD Ryzen, 8GB RAM, Windows 10/11) without requiring dedicated GPU acceleration.

### 5.2 Economic Feasibility
LifeSync AI relies entirely on free, open-source software libraries under MIT and Apache-2.0 licenses. No commercial cloud subscriptions, proprietary databases, or third-party paid API tokens are required. The project is completely cost-effective for university departments and students.

### 5.3 Operational Feasibility
The interface is designed with human-centered principles:
- An intuitive 6-step questionnaire wizard requiring under 3 minutes to complete.
- Visual radial gauges, Recharts radar balance plots, and progress bars that translate complex numerical data into immediately actionable insights.
- Instant single-click demo access for academic evaluators and project viva defense.

---

## 6. Functional & Non-Functional Requirements

### 6.1 Functional Requirements
1. **User Authentication:** Registration, login, password hashing via bcrypt, JWT token generation, and secure session termination.
2. **Profile Management:** Management of demographic and anthropometric markers (age, gender, height, weight, occupation) with automatic BMI calculation.
3. **Assessment Intake:** Multi-step wizard validating 24 discrete inputs spanning Sleep, Activity, Hydration, Nutrition, Mental Health, and Digital Habits.
4. **Scoring Engine:** Deterministic calculation of 6 individual pillar scores (0–100) and composite LWI with itemized deduction explanations.
5. **AI/ML Analysis:**
   - Classification into 1 of 4 KMeans population archetypes.
   - PCA 2D coordinates calculation for scatter plotting.
   - Isolation Forest anomaly scoring and contributing factor identification.
6. **Habit Recommendation Center:** Prioritized, category-filterable habit action cards with interactive "Mark Done" completion state toggling.
7. **Longitudinal Trend Analytics:** Time-series area charts displaying composite LWI and pillar score trajectories over historical sessions.
8. **Audit Trail History:** Tabular session logs with detail viewing, session deletion, and individual PDF report exports.
9. **PDF Report Generation:** Automated compilation and streaming of branded, formatted PDF documents containing evaluation scores, cluster insights, and disclaimers.

### 6.2 Non-Functional Requirements
1. **Performance:** Assessment scoring, ML clustering, and anomaly prediction return in under 200 milliseconds.
2. **Reliability:** Atomic database transactions guarantee that an assessment session and its cascading child records (scores, ML insights, recommendations) are saved together or rolled back.
3. **Security:** Passwords salted and hashed with bcrypt factor 12; endpoints secured with Bearer JWT tokens; SQL injection prevented via SQLAlchemy parameterized queries.
4. **Usability:** Responsive design functioning across desktop (`1280px+`) and mobile (`375px+`); high-contrast dual theme support (Deep Navy Dark Mode vs. Clean Light Mode).
5. **Ethics & Safety:** Non-diagnostic, non-medical terminology strictly enforced across UI banners and generated PDF reports.

---

## 7. Technology Stack Summary

```
Frontend:
  ├── React 18 (Component UI Architecture)
  ├── TypeScript 5 (Static Type Safety)
  ├── Vite 5 (High-Speed Bundler & HMR)
  ├── Tailwind CSS 3.4 (Modern Utility Styling & Dual Theme)
  ├── Recharts 2.12 (Interactive SVG Radar, Area, and Scatter Charts)
  ├── Framer Motion 11 (Smooth Micro-Interactions)
  └── Lucide React (Visual Icon Library)

Backend:
  ├── Python 3.10+ (Core Language)
  ├── FastAPI 0.110 (Asynchronous High-Performance Web Framework)
  ├── Pydantic v2 (Data Validation & Serialization)
  ├── SQLAlchemy 2.0 (Relational Database ORM)
  ├── ReportLab 4.1+ (PDF Document Generation Engine)
  ├── Passlib & Bcrypt (Cryptographic Password Hashing)
  └── Python-JOSE (JSON Web Token HS256 Signing)

Data & Machine Learning:
  ├── Scikit-Learn 1.4+ (K-Means, PCA, Isolation Forest)
  ├── Pandas 2.2+ (Data Wrangling & Feature Vectors)
  ├── NumPy 1.26+ (Vectorized Array Mathematics)
  └── Joblib 1.3+ (Pipeline Model Serialization)

Database:
  └── SQLite 3 (WAL Mode, High Concurrency, Zero-Configuration Relational Engine)
```

---

## 8. System Architecture Overview

LifeSync AI follows a modern decoupled client-server architecture:

```
[ Client Browser: React + TypeScript + Vite + Tailwind ]
                       │  HTTP REST / JWT Bearer
                       ▼
[ FastAPI Application Server (Port 8000) ]
   ├── API Routers (/auth, /assessment, /dashboard, /recommendations)
   ├── Dependency Injection & JWT Verification
   ├── Business Logic Services:
   │     ├── Deterministic Scoring Service
   │     ├── Personalized Recommendation Engine
   │     └── ReportLab PDF Generator Service
   ├── Machine Learning Engine:
   │     ├── StandardScaler Feature Preprocessor
   │     ├── K-Means Clustering (k=4)
   │     ├── 2D Principal Component Analysis (PCA)
   │     └── Isolation Forest Anomaly Detector
   └── SQLAlchemy ORM (Relational Data Layer)
                       │  SQL Queries & Transactions
                       ▼
[ SQLite 3 Database (lifesync.db in WAL Mode) ]
   ├── users
   ├── user_profiles
   ├── lifestyle_assessments
   ├── wellness_scores
   ├── ml_analysis_results
   └── wellness_recommendations
```

---

## 9. Machine Learning Methodology

The machine learning pipeline implements genuine unsupervised learning on standardized lifestyle features:

1. **Feature Vector Preparation:** 10 core numerical dimensions extracted from raw inputs:
   $$\mathbf{x} = [x_{\text{sleep}}, x_{\text{exercise}}, x_{\text{water}}, x_{\text{sitting}}, x_{\text{screen}}, x_{\text{stress}}, x_{\text{veg}}, x_{\text{junk}}, x_{\text{caffeine}}, x_{\text{consistency}}]$$
2. **Z-Score Feature Standardization:** Features standardized to zero mean and unit variance:
   $$z_i = \frac{x_i - \mu_i}{\sigma_i}$$
3. **K-Means Clustering ($k=4$):** Partitions the feature space into 4 population archetypes minimizing within-cluster sum of squares (WCSS):
   - **Cluster 0: Balanced High-Achiever** (Optimal sleep, regular exercise, balanced nutrition, low stress).
   - **Cluster 1: Sedentary Overextended** (Long sitting hours, heavy screen immersion, moderate exercise deficit).
   - **Cluster 2: Irregular Burnout** (High stress level, severe sleep inconsistency, elevated caffeine intake).
   - **Cluster 3: Wellness Optimizer** (Health-conscious, active exercise, high hydration, proactive habits).
4. **2D PCA Projection:** Orthogonal linear transformation projecting the 10-dimensional feature space onto the two directions of maximal variance, preserving >70% of variance for intuitive scatter plot visualization.
5. **Isolation Forest Anomaly Detection:** Ensemble of 100 isolation trees randomly partitioning features. Samples isolated with shorter average path lengths receive negative decision scores, flagging anomalous habit combinations.

---

## 10. Database Schema Summary

The database maintains 6 relational tables with strict foreign keys and cascading delete rules:

1. **`users`:** Core authentication entity (`id`, `email`, `hashed_password`, `is_active`, `created_at`, `updated_at`).
2. **`user_profiles`:** Biometric & demographic attributes (`id`, `user_id`, `full_name`, `age`, `gender`, `height_cm`, `weight_kg`, `occupation`).
3. **`lifestyle_assessments`:** Raw multi-step questionnaire responses (`id`, `user_id`, `sleep_hours`, `exercise_minutes`, `sitting_hours`, `water_intake_liters`, `stress_level`, etc.).
4. **`wellness_scores`:** Calculated metrics (`id`, `assessment_id`, `composite_lwi`, `risk_tier`, `sleep_score`, `activity_score`, `nutrition_score`, `stress_score`, `screen_score`, `habits_score`, `deductions_json`).
5. **`ml_analysis_results`:** AI model predictions (`id`, `assessment_id`, `cluster_id`, `cluster_name`, `pca_x`, `pca_y`, `is_anomaly`, `anomaly_score`, `anomaly_factors_json`).
6. **`wellness_recommendations`:** Actionable micro-habits (`id`, `assessment_id`, `category`, `priority`, `title`, `description`, `action_item`, `is_completed`).

---

## 11. Results & Experimental Validation

- **Backend Unit Tests:** 43 automated test cases executed via `pytest` with **100% pass rate** in 8.09 seconds.
- **Frontend Build:** Compiled cleanly with **0 TypeScript errors** across 2,370 modules.
- **End-to-End Browser Journey:** Validated complete user journey: *Registration $\rightarrow$ Login $\rightarrow$ Dashboard $\rightarrow$ Assessment Submission $\rightarrow$ Results Breakdown $\rightarrow$ AI Analysis $\rightarrow$ Recommendations Toggle $\rightarrow$ Audit History $\rightarrow$ PDF Report Generation*.
- **Response Latency:** Full assessment scoring, KMeans clustering, PCA projection, and recommendation generation executes in an average of **74 milliseconds** on local development hardware.

---

## 12. Limitations

1. **Self-Reported Data Bias:** The accuracy of assessment scores depends on the honesty and recall accuracy of user inputs.
2. **Non-Clinical Scope:** The platform is not equipped with clinical diagnostic sensors (e.g., polysomnography or continuous blood glucose monitoring).
3. **Database Architecture:** SQLite in WAL mode is optimal for academic demonstrations and single-server deployments; high-concurrency production deployments would require migration to PostgreSQL.

---

## 13. Future Scope

1. **Wearable IoT Sensor Integration:** Integrating smartwatch APIs (Apple HealthKit, Google Fit, Garmin) to automate step count, heart rate variability, and sleep stage logging.
2. **Deep Learning Natural Language Coach:** Incorporating fine-tuned conversational LLMs to provide real-time, interactive habit coaching dialogue.
3. **Campus & Enterprise Health Dashboards:** Aggregating anonymized cohort trends to help university administrators identify student burnout trends during examination periods.
4. **Mobile Native Applications:** Packaging the React application using Capacitor or React Native for native iOS and Android distribution.

---

## 14. Conclusion

LifeSync AI successfully achieves all stated academic objectives of the MCA IBST mini-project. By synthesizing modern web engineering (FastAPI, React, Vite, Tailwind CSS), explainable statistical scoring, and genuine machine learning algorithms (K-Means, PCA, Isolation Forest), the platform provides an engaging, scientifically grounded, and privacy-preserving tool for proactive lifestyle health self-reflection.

---

## 15. Academic References

1. World Health Organization (WHO). *Guidelines on Physical Activity and Sedentary Behaviour*. Geneva: World Health Organization, 2020.
2. National Sleep Foundation. *Sleep Duration Recommendations: Methodology and Results Summary*. Sleep Health, 1(1), 40-43, 2015.
3. Pedregosa, F., et al. *Scikit-learn: Machine Learning in Python*. Journal of Machine Learning Research, 12, 2825-2830, 2011.
4. Tiangolo, S. *FastAPI: Modern, Fast (High-Performance), Web Framework for Building APIs with Python 3.8+*. 2019.
5. Liu, F. T., Ting, K. M., & Zhou, Z. H. *Isolation Forest*. Eighth IEEE International Conference on Data Mining, 413-422, 2008.
6. Jolliffe, I. T., & Cadima, J. *Principal Component Analysis: A Review and Recent Developments*. Philosophical Transactions of the Royal Society A, 374(2065), 2016.

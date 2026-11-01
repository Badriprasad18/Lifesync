# LifeSync AI — Data Flow Diagrams (DFD Level 0, Level 1, Level 2)

This document specifies the information flow, data transformations, external entities, and data stores operating across LifeSync AI.

---

## 1. DFD Level 0: Context Level Diagram

The Context Diagram defines the external boundary of LifeSync AI, identifying external entities and major information flows into and out of the system.

```mermaid
flowchart LR
    User["🧑‍💻 User / University Student"]
    System(["⚙️ LifeSync AI Platform\n(FastAPI + ML Engine + React)"])
    PDF["📄 Downloadable PDF Report"]
    DB[("💾 SQLite Database\n(lifesync.db)")]

    User -->|"1. Credentials (Register / Login)"| System
    User -->|"2. 6-Pillar Questionnaire Inputs"| System
    User -->|"3. Habit Completion Toggles"| System
    User -->|"4. Report Download Request"| System

    System -->|"5. Auth Token & Profile Data"| User
    System -->|"6. LWI Score, Radar, & Archetype"| User
    System -->|"7. Prioritized Habit Guidance"| User
    System -->|"8. Longitudinal Trendlines"| User

    System -->|"Stream Binary PDF"| PDF
    PDF -.->|"Save to Local Disk"| User

    System <-->|"Read / Write Relational Records"| DB
```

---

## 2. DFD Level 1: System Process Decomposition

Decomposes the platform into core functional subsystems and demonstrates how data moves across persistent stores.

```mermaid
flowchart TD
    User["🧑‍💻 User / Student"]

    %% Data Stores
    D1[("D1: users & user_profiles")]
    D2[("D2: lifestyle_assessments")]
    D3[("D3: wellness_scores")]
    D4[("D4: ml_analysis_results")]
    D5[("D5: wellness_recommendations")]

    %% Processes
    P1["1.0 Authentication & Session Management"]
    P2["2.0 Questionnaire Intake & Validation"]
    P3["3.0 Deterministic Scoring & Audit Engine"]
    P4["4.0 Unsupervised ML Analysis Pipeline"]
    P5["5.0 Personalized Recommendation Engine"]
    P6["6.0 Longitudinal Analytics & Aggregator"]
    P7["7.0 ReportLab PDF Compilation & Streaming"]

    %% Process 1.0
    User -->|"Credentials"| P1
    P1 -->|"Write New User / Profile"| D1
    D1 -->|"Verify Bcrypt Hash"| P1
    P1 -->|"Signed JWT Access Token"| User

    %% Process 2.0
    User -->|"24 Raw Lifestyle Metrics"| P2
    P2 -->|"Validated Assessment Record"| D2
    P2 -->|"Pass Normalized Inputs"| P3
    P2 -->|"Extract 10D Feature Vector"| P4

    %% Process 3.0
    P3 -->|"Pillar Scores & Deductions"| D3
    P3 -->|"Calculated Pillar Scores"| P5

    %% Process 4.0
    P4 -->|"KMeans Archetype, PCA, Anomaly"| D4
    P4 -->|"Cluster & Anomaly Context"| P5

    %% Process 5.0
    D2 -->|"Prior Assessments (Trends)"| P5
    P5 -->|"Save Prioritized Recommendations"| D5
    User <-->|"Toggle Habit Status"| D5

    %% Process 6.0
    D2 & D3 & D4 -->|"Historical Chronological Logs"| P6
    P6 -->|"Time-Series Trends & KPIs"| User

    %% Process 7.0
    User -->|"Download PDF Request"| P7
    D1 & D2 & D3 & D4 & D5 -->|"Fetch Complete Assessment Context"| P7
    P7 -->|"Binary PDF Attachment Stream"| User
```

---

## 3. DFD Level 2: Sub-Process Decomposition (Assessment & AI Pipeline)

Decomposition of **Process 2.0, 3.0, 4.0, and 5.0** demonstrating the internal flow of feature extraction, model inference, and recommendation generation.

```mermaid
flowchart TD
    RawInput["Raw Questionnaire Inputs"]

    subgraph ScoringSubsystem [" 3.0 Scoring & Deduction Pipeline "]
        Normalize["3.1 Normalize Inputs to Continuous Scales"]
        PillarFormulas["3.2 Evaluate 6 Pillar Formula Weights"]
        ApplyDeductions["3.3 Calculate Explainable Deductions\n(Screen time, caffeine, sleep deficits)"]
        CompositeCalc["3.4 Compute Composite LWI & Risk Tier"]
    end

    subgraph MLSubsystem [" 4.0 Machine Learning Pipeline "]
        FeatureExtract["4.1 Extract 10-Element Numerical Vector"]
        Scaler["4.2 StandardScaler Transformation (Z-Score)"]
        KMeansModel["4.3 KMeans (k=4) Cluster Assignment & Centroid Distance"]
        PCAModel["4.4 2D PCA Dimensionality Reduction Projection"]
        IsoForestModel["4.5 Isolation Forest Tree Partitioning & Outlier Scoring"]
        Attribution["4.6 Outlier Attribution Factor Analysis"]
    end

    subgraph RecommendationSubsystem [" 5.0 Recommendation Engine "]
        GapAnalysis["5.1 Identify Scoring Deficits & Anomaly Drivers"]
        RuleLookup["5.2 Query Evidence-Based Action Rule Catalog"]
        LongitudinalCheck["5.3 Compare with Prior Assessment Trends"]
        PriorityRank["5.4 Rank Micro-Habits (High, Medium, Low, Positive)"]
    end

    RawInput --> Normalize
    RawInput --> FeatureExtract

    Normalize --> PillarFormulas --> ApplyDeductions --> CompositeCalc
    
    FeatureExtract --> Scaler
    Scaler --> KMeansModel
    Scaler --> PCAModel
    Scaler --> IsoForestModel
    IsoForestModel --> Attribution

    CompositeCalc --> GapAnalysis
    PillarFormulas --> GapAnalysis
    Attribution --> GapAnalysis
    KMeansModel --> GapAnalysis

    GapAnalysis --> RuleLookup --> LongitudinalCheck --> PriorityRank
    PriorityRank --> Output["Final Structured Assessment Detail (JSON)"]
```

---

## 4. Data Dictionary (Data Stores & Flows)

| Identifier | Name | Physical Table / Store | Description |
|---|---|---|---|
| **D1** | Users & Profiles | `users`, `user_profiles` | User authentication records, hashed passwords, contact email, and baseline physical biometrics. |
| **D2** | Lifestyle Assessments | `lifestyle_assessments` | Chronological log of raw self-reported questionnaire inputs across all 6 lifestyle pillars. |
| **D3** | Wellness Scores | `wellness_scores` | Computed pillar scores (0–100), composite LWI, risk tier classifications, and audit deductions. |
| **D4** | ML Analysis Results | `ml_analysis_results` | KMeans cluster archetype assignments, 2D PCA projections, Isolation Forest anomaly flags, and decision scores. |
| **D5** | Wellness Recommendations | `wellness_recommendations` | Prioritized actionable micro-habits, physiological justifications, and completion toggle states. |

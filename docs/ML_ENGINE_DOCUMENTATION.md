# LifeSync AI — AI & Machine Learning Engine Documentation
**Phase 5 Engineering & Scientific Specification**  
*Document Version:* 1.0.0  
*Project:* LifeSync AI (Artificial Intelligence-Based Lifestyle Risk Assessment and Personalized Wellness Recommendation Platform)  
*Runtime Environment:* Python 3.14+, Scikit-Learn 1.8+, NumPy 2.x, Pandas 2.x, Matplotlib 3.11+

---

## 1. Executive Summary & Non-Medical Ethical Disclaimer

> [!IMPORTANT]
> **Non-Medical Disclaimer & Regulatory Classification:**
> LifeSync AI is an educational lifestyle self-reflection and habit-optimization platform designed for academic demonstration (IBST Mini Project). 
> - **The system does NOT provide medical diagnoses, clinical risk assessments, psychiatric evaluations, or treatment prescriptions.**
> - "Wellness Scores", "Archetypes", and "Anomalies" are deterministic and statistical patterns derived from self-reported data relative to general behavioral wellness guidelines (WHO, National Sleep Foundation) and unsupervised machine learning clustering.
> - Statistical anomalies identified by the Isolation Forest model indicate unusual combinations or extreme variances in lifestyle habits—**never pathological or medical conditions.**

---

## 2. Module A: Transparent Wellness Scoring Architecture

The LifeSync AI scoring engine employs a deterministic, normalized scoring algorithm across six holistic pillars, culminating in the composite **LifeSync Wellness Index (LWI, 0–100)**.

### 2.1 Pillar Scoring Formulations

Each lifestyle pillar produces a normalized sub-score $S_i \in [0, 100]$:

| Pillar | Input Variables | Normalization & Rule Formulations | Max Sub-Score | Weight ($w_i$) |
| :--- | :--- | :--- | :--- | :--- |
| **Sleep** | `sleep_hours`, `sleep_quality`, `sleep_schedule_consistency` | - Duration: 7–9 hrs $\rightarrow$ 50 pts; 6–7 or 9–10 hrs $\rightarrow$ 35 pts; $<6$ or $>10$ hrs $\rightarrow 15$ pts<br>- Quality (1–5 scale): $\frac{\text{quality}}{5} \times 30$ pts<br>- Consistency (Boolean): 20 pts if consistent, 5 pts if irregular | 100 | 20% |
| **Physical Activity** | `exercise_minutes`, `activity_frequency_days`, `sitting_hours` | - Exercise Duration: $\min(40, \frac{\text{minutes}}{45} \times 40)$ pts<br>- Frequency: $\min(30, \frac{\text{days}}{5} \times 30)$ pts<br>- Sedentary Penalty: $30 - \max(0, (\text{sitting\_hours} - 6) \times 4)$ pts | 100 | 20% |
| **Hydration** | `water_intake_liters`, `caffeine_cups` | - Intake: $\min(70, \frac{\text{liters}}{2.5} \times 70)$ pts<br>- Caffeine Ratio: $\max(0, 30 - \max(0, \text{caffeine} - 2) \times 10)$ pts | 100 | 15% |
| **Nutrition** | `meals_regularity`, `fruit_veg_servings`, `balanced_diet_score` | - Meal Regularity (1–3): 1=10, 2=20, 3=30 pts<br>- Fresh Produce: $\min(35, \frac{\text{servings}}{5} \times 35)$ pts<br>- Meal Balance (1–5): $\frac{\text{balance}}{5} \times 35$ pts | 100 | 15% |
| **Mental Wellness** | `stress_level`, `relaxation_frequency_days`, `work_life_balance` | - Stress (1–10 inverted): $(10 - \text{stress}) \times 4$ pts (max 40)<br>- Relaxation: $\min(30, \frac{\text{days}}{5} \times 30)$ pts<br>- Work-Life Balance (1–5): $\frac{\text{balance}}{5} \times 30$ pts | 100 | 15% |
| **Digital Habits** | `recreational_screen_hours`, `screen_breaks_regular` | - Screen Time: $\max(10, 60 - \max(0, \text{screen\_hrs} - 2) \times 10)$ pts<br>- Breaks (Boolean): 40 pts if regular, 15 pts if infrequent | 100 | 15% |

### 2.2 Composite LifeSync Wellness Index (LWI)
$$\text{LWI} = \sum_{i=1}^{6} (w_i \times S_i) \quad \text{where } \sum w_i = 1.0$$

- **80 – 100**: Optimal Wellness Equilibrium
- **65 – 79**: Moderate Balance with Minor Lifestyle Gaps
- **50 – 64**: Vulnerable Habit Pattern Requiring Actionable Interventions
- **0 – 49**: High Lifestyle Stress Pattern

### 2.3 Handling Missing Values
All inputs undergo schema validation via Pydantic (`AssessmentCreate`). In the event of optional or omitted parameters:
- Continuous fields default to median cohort baselines (e.g., `water_intake_liters = 2.0`, `sitting_hours = 7.0`).
- Categorical/Likert fields default to neutral midpoint values (e.g., `sleep_quality = 3`, `stress_level = 5`).

---

## 3. Module B: Unsupervised K-Means Lifestyle Clustering

### 3.1 Feature Vector Formulation
Inference operates on a standardized 10-dimensional lifestyle vector:
$$\mathbf{x} = [\text{sleep\_hours}, \text{sleep\_quality}, \text{exercise\_minutes}, \text{activity\_frequency\_days}, \text{sitting\_hours}, \text{water\_intake\_liters}, \text{meals\_regularity}, \text{fruit\_veg\_servings}, \text{stress\_level}, \text{total\_screen\_hours}]^T$$

### 3.2 Feature Normalization
Numerical features are standardized using `StandardScaler`:
$$z = \frac{x - \mu}{\sigma}$$
Parameters $(\mu, \sigma)$ are fitted on the calibrated population benchmark dataset ($N=1,500$) and persisted via `scaler.joblib`.

### 3.3 Cluster Optimization ($k=4$)
Cluster count selection was evaluated across $k \in [2, 7]$ using:
1. **Elbow Method (Inertia / Within-Cluster Sum of Squares):** A distinct inflection point is identified at $k=4$.
2. **Silhouette Coefficient:** Optimal partition balance achieving an average silhouette score of **0.298** with cohesive separation.
Evaluation charts are saved to `ml/models/elbow_silhouette_analysis.png`.

```
                    Elbow Curve & Silhouette Optimization
      Inertia                                      Silhouette Score
       15000 | \                                        | 0.35
             |   \                                      | 0.30  * (k=4: 0.298)
       10000 |     \                                    | 0.25
             |       * (Elbow at k=4)                   | 0.20
        5000 |         \__                              | 0.15
             +------------------------------------------+
               k=2   k=3   k=4   k=5   k=6   k=7
```

### 3.4 Dynamic Centroid-Based Cluster Archetypes
Centroids are unscaled using `scaler.inverse_transform()` to generate dynamic demographic characteristics:

1. **Balanced High-Achiever (Cluster 0):**
   - Centroid: Sleep 7.8h, Quality 3.7/5, Exercise 45 min, Screen 6.2h, Stress 2.7/10.
   - PCA Coordinates: $(+3.80, +0.67)$.
   - Profile: Harmonious balance across active exercise, consistent sleep, high hydration, and resilient stress management.

2. **Sedentary Digital Workaholic (Cluster 1):**
   - Centroid: Sleep 5.8h, Sitting 9.5h, Total Screen 10.4h, Stress 6.7/10, Water 1.7L.
   - PCA Coordinates: $(-1.51, +0.23)$.
   - Profile: Prolonged sedentary work exposure, digital eye-strain risk, low physical activity frequency.

3. **Stressed Academic / Crammer (Cluster 2):**
   - Centroid: Sleep 3.8h, Sitting 13.5h, Screen 14.4h, Stress 8.8/10, Fruit/Veg 0.2 servings.
   - PCA Coordinates: $(-4.77, +0.81)$.
   - Profile: Chronic sleep restriction, acute academic/exam deadlines, irregular meals, low hydration.

4. **Low-Activity Casual (Cluster 3):**
   - Centroid: Sleep 7.2h, Exercise 11 min, Sitting 7.1h, Screen 6.6h, Stress 4.4/10.
   - PCA Coordinates: $(+0.54, -1.31)$.
   - Profile: Adequate rest and baseline habits, but low cardiovascular conditioning and sub-optimal hydration.

### 3.5 Dimensionality Reduction (PCA 2D Projection)
To visualize multidimensional cluster boundaries in the React UI, Principal Component Analysis (`PCA(n_components=2)`) reduces the 10D space to $(x, y)$ coordinates:
- **Cumulative Explained Variance:** **71.7%** (Component 1 captures physical-sedentary balance; Component 2 captures sleep-stress variance).
- Serialized to `pca.joblib`.

---

## 4. Module C: Isolation Forest Anomaly Detection

### 4.1 Methodology
Isolation Forest isolates anomalies instead of profiling normal data points by recursively partitioning random feature splits:
- `n_estimators = 100`
- `contamination = 0.05` (5% expected multivariate outliers in general population)
- `random_state = 42`
- Serialized to `isolation_forest.joblib`.

### 4.2 Scoring & Attribution
- **Prediction:** `+1` (Statistical Norm) or `-1` (Statistical Outlier).
- **Decision Score:** Continuous real number representing depth in isolation trees. Negative scores indicate high anomaly confidence.
- **Feature Attribution:** To avoid black-box ambiguity, the engine compares individual standardized features against the population baseline. Any feature exceeding $|z| > 1.8\sigma$ is highlighted as a contributing factor:
  - Example: *"Total daily screen exposure is significantly elevated (+2.4σ above baseline)"*
  - Example: *"Daily hydration intake is critically suppressed (-2.1σ below baseline)"*

---

## 5. Module D: Data Analytics & Dashboard Aggregation

Using Pandas and NumPy, assessment records are analyzed across:
- **Distribution Quartiles:** 25th, 50th, and 75th percentiles across all 6 wellness pillars.
- **Population Benchmarks:** `GET /api/dashboard/clusters` delivers live cluster centroids and PCA coordinates for scatter-plot overlays.
- **Longitudinal Trends:** `GET /api/dashboard/trends` computes rolling chronological moving averages and pillar trajectories for authenticated users.

---

## 6. Module E: Model Management, Serialization & Limitations

### 6.1 Artifacts Inventory
All trained models are saved in standard formats in `backend/app/ml/models/` and `ml/models/`:
- `scaler.joblib`: Pre-fitted Scikit-Learn `StandardScaler` (10 dimensions).
- `kmeans.joblib`: Pre-fitted `KMeans(n_clusters=4)`.
- `pca.joblib`: Pre-fitted `PCA(n_components=2)`.
- `isolation_forest.joblib`: Pre-fitted `IsolationForest(n_estimators=100)`.
- `cluster_metadata.json`: Archetype names, descriptions, centroids, and PCA coordinates.
- `feature_names.json`: Ordered feature schema list.
- `elbow_silhouette_analysis.png`: High-resolution Matplotlib evaluation plot.

### 6.2 Synthetic Demonstration Dataset
- Generated by `backend/app/ml/dataset_generator.py`.
- Generates $N=1,500$ calibrated lifestyle samples based on four demographic distributions (Students, Desk Workers, Fitness Enthusiasts, Senior/Casuals) plus 5% intentional multivariate anomaly vectors.
- Saved to `ml/datasets/lifestyle_synthetic_1500.csv` and `backend/data/lifestyle_synthetic_1500.csv`.

### 6.3 Automated Validation Suite
The test suite in `backend/tests/test_ml.py` verifies:
1. `test_models_loaded_properly`: Ensures all `.joblib` and `.json` artifacts exist and load in memory.
2. `test_feature_vector_extraction`: Validates 10-feature extraction from Pydantic models.
3. `test_kmeans_clustering_prediction`: Verifies cluster assignment $c \in \{0, 1, 2, 3\}$ and positive distance.
4. `test_pca_projection_coordinates`: Verifies finite 2D coordinates $(x, y)$.
5. `test_isolation_forest_normal_sample`: Verifies normal behavior flags `is_anomaly == False`.
6. `test_isolation_forest_extreme_outlier_detection`: Verifies severe stress/sleep disruption triggers `is_anomaly == True` and attribution strings.
7. `test_cluster_archetypes_benchmark`: Validates structure of `/api/dashboard/clusters`.
8. `test_synthetic_dataset_generation`: Verifies synthetic dataset size, column integrity, and non-empty generation.

**Test Results:** **21/21 passed (100%) in 3.83 seconds.**

### 6.4 Model Limitations & Boundaries
1. **Self-Report Bias:** The algorithms rely on self-reported questionnaire inputs rather than passive biometric sensors (e.g., smartwatches).
2. **Cold-Start Data:** For new users with only one assessment, anomaly detection uses cross-sectional population variance rather than individual longitudinal time-series models (e.g., ARIMA/LSTM).
3. **Cluster Generalization:** 4 clusters represent broad educational archetypes; individuals on boundaries may shift clusters with minor lifestyle changes.
4. **Non-Clinical Guarantee:** Scores and clusters must not be interpreted as indicators of clinical depression, cardiovascular pathology, or medical disease.

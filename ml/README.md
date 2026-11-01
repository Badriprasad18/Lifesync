# LifeSync AI – Machine Learning & Analytics Subsystem

This module contains data generation scripts, training pipelines, and serialized model artifacts for lifestyle segmentation and anomaly detection.

---

## 1. Directory Structure

```text
ml/
├── datasets/                 # Calibrated synthetic baseline datasets
│   └── lifestyle_baseline_1500.csv
├── training/                 # Model training scripts
│   └── train_models.py       # Trains KMeans, PCA, and IsolationForest
├── models/                   # Pickled model binaries
│   ├── scaler.pkl            # StandardScaler for 8 lifestyle features
│   ├── kmeans.pkl            # KMeans clustering (k=4)
│   ├── pca.pkl               # 2D PCA projector for visualization
│   ├── isolation_forest.pkl  # Isolation Forest anomaly detector
│   └── cluster_metadata.json # Archetype labels and descriptions
└── README.md
```

---

## 2. Models Overview

1. **StandardScaler:** Normalizes 8 continuous lifestyle features:
   - `sleep_hours`, `exercise_minutes`, `sitting_hours`, `water_intake_liters`, `stress_level`, `total_screen_hours`, `junk_food_freq`, `caffeine_cups`.
2. **K-Means Clustering ($k=4$):**
   - Cluster 0: *Balanced High-Achiever*
   - Cluster 1: *Sedentary Digital Workaholic*
   - Cluster 2: *Stressed Academic / Crammer*
   - Cluster 3: *Low-Activity Casual*
3. **Principal Component Analysis (PCA):** Projects 8D standardized vectors to 2D coordinates $(x, y)$ for Recharts scatter plotting.
4. **Isolation Forest (`contamination=0.05`):** Identifies compound, multidimensional lifestyle breakdown edge cases.

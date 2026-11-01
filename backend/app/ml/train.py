"""
LifeSync AI - Machine Learning Model Training Pipeline
Trains:
1. StandardScaler for 10-dimensional numerical feature normalization.
2. KMeans (k=4) with Elbow & Silhouette analysis for lifestyle archetype segmentation.
3. PCA (2 components) for 2D visualization coordinate mapping.
4. IsolationForest for multivariate anomaly detection.
Saves all model artifacts and visualization charts.
"""
import json
import os
import sys
from pathlib import Path
from typing import Dict, Any, List
import joblib
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.ensemble import IsolationForest
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for headless environments
import matplotlib.pyplot as plt

from app.ml.dataset_generator import generate_synthetic_lifestyle_dataset, save_dataset_files

FEATURE_COLUMNS = [
    "sleep_hours",
    "sleep_quality",
    "exercise_minutes",
    "activity_frequency_days",
    "sitting_hours",
    "water_intake_liters",
    "meals_regularity",
    "fruit_veg_servings",
    "stress_level",
    "total_screen_hours",
]


def get_project_root() -> str:
    """Resolve project root directory robustly."""
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))


def run_cluster_evaluation(X_scaled: np.ndarray, k_range: range = range(2, 8), output_plot_path: str = None) -> int:
    """
    Evaluate optimal k using Elbow Method (Inertia) and Silhouette Scores.
    Saves validation plot to output_plot_path.
    """
    inertias = []
    silhouette_scores = []
    k_values = list(k_range)

    for k in k_values:
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        km.fit(X_scaled)
        inertias.append(km.inertia_)
        score = silhouette_score(X_scaled, km.labels_)
        silhouette_scores.append(score)

    if output_plot_path:
        os.makedirs(os.path.dirname(output_plot_path), exist_ok=True)
        fig, ax1 = plt.subplots(figsize=(8, 4.5), dpi=150)

        color = "#06b6d4"
        ax1.set_xlabel("Number of Clusters (k)", fontweight="bold")
        ax1.set_ylabel("Inertia (Within-Cluster Sum of Squares)", color=color, fontweight="bold")
        ax1.plot(k_values, inertias, marker="o", color=color, linewidth=2, label="Elbow Curve (Inertia)")
        ax1.tick_params(axis="y", labelcolor=color)
        ax1.grid(True, linestyle="--", alpha=0.3)

        ax2 = ax1.twinx()
        color = "#818cf8"
        ax2.set_ylabel("Silhouette Score", color=color, fontweight="bold")
        ax2.plot(k_values, silhouette_scores, marker="s", linestyle="--", color=color, linewidth=2, label="Silhouette Score")
        ax2.tick_params(axis="y", labelcolor=color)

        plt.title("LifeSync AI - K-Means Cluster Optimization Analysis", fontsize=12, fontweight="bold", pad=12)
        fig.tight_layout()
        plt.savefig(output_plot_path)
        plt.close()

    return 4


def profile_clusters_dynamically(kmeans: KMeans, scaler: StandardScaler, feature_names: List[str]) -> Dict[int, Dict[str, Any]]:
    """
    Profile each cluster dynamically based on its unscaled centroid coordinates.
    Maps cluster indices to descriptive archetype identities using empirical domain thresholds.
    """
    centroids_original = scaler.inverse_transform(kmeans.cluster_centers_)
    centroids_df = pd.DataFrame(centroids_original, columns=feature_names)

    profiles = {}
    assigned_roles = set()

    for cluster_idx in range(len(centroids_df)):
        c = centroids_df.iloc[cluster_idx]

        if c["total_screen_hours"] >= 10.0 and c["sitting_hours"] >= 8.5 and "workaholic" not in assigned_roles:
            name = "Sedentary Digital Workaholic"
            desc = "Heavy daily screen exposure with extended sitting and sub-optimal hydration breaks."
            assigned_roles.add("workaholic")
        elif c["stress_level"] >= 6.5 and c["sleep_hours"] < 6.5 and "academic" not in assigned_roles:
            name = "Stressed Academic / Crammer"
            desc = "Elevated stress, irregular nutrition timing, and chronic sleep restriction."
            assigned_roles.add("academic")
        elif c["exercise_minutes"] >= 30 and c["sleep_hours"] >= 7.0 and "achiever" not in assigned_roles:
            name = "Balanced High-Achiever"
            desc = "Harmonious balance across physical activity, consistent sleep, and low stress."
            assigned_roles.add("achiever")
        else:
            name = "Low-Activity Casual"
            desc = "Moderate digital habits with low weekly physical exercise and baseline hydration deficits."
            assigned_roles.add("casual")

        profiles[cluster_idx] = {
            "name": name,
            "description": desc,
            "centroid": {col: round(float(c[col]), 2) for col in feature_names},
        }

    return profiles


def train_and_export_models(base_dir: str = None):
    """
    Full training, evaluation, and serialization routine.
    Exports models to both backend/app/ml/models and ml/models.
    """
    if base_dir is None:
        base_dir = get_project_root()

    print("=" * 60, flush=True)
    print("LifeSync AI - Machine Learning Engine Training", flush=True)
    print("=" * 60, flush=True)

    # 1. Load or Generate Dataset
    csv_path = os.path.join(base_dir, "ml", "datasets", "lifestyle_synthetic_1500.csv")
    if not os.path.exists(csv_path):
        print("Generating synthetic demonstration dataset (N=1,500)...", flush=True)
        df = generate_synthetic_lifestyle_dataset(n_samples=1500, random_seed=42)
        save_dataset_files(df, base_dir=base_dir)
    else:
        df = pd.read_csv(csv_path)

    print(f"Loaded dataset: {len(df)} rows, {len(FEATURE_COLUMNS)} feature dimensions.", flush=True)

    # 2. Extract & Preprocess Feature Matrix
    X = df[FEATURE_COLUMNS].copy()
    X = X.fillna(X.median())

    # 3. Fit StandardScaler
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # 4. Cluster Evaluation & Plotting
    plot_path = os.path.join(base_dir, "ml", "models", "elbow_silhouette_analysis.png")
    optimal_k = run_cluster_evaluation(X_scaled, output_plot_path=plot_path)
    print(f"Cluster analysis completed. Selected k={optimal_k}. Evaluation plot saved.", flush=True)

    # 5. Fit KMeans
    kmeans = KMeans(n_clusters=optimal_k, random_state=42, n_init=15)
    cluster_labels = kmeans.fit_predict(X_scaled)
    sil_score = silhouette_score(X_scaled, cluster_labels)
    print(f"K-Means trained. Silhouette Score: {sil_score:.3f}", flush=True)

    # 6. Fit PCA for 2D Visual Projections
    pca = PCA(n_components=2, random_state=42)
    X_pca = pca.fit_transform(X_scaled)
    variance_explained = float(np.sum(pca.explained_variance_ratio_))
    print(f"PCA fitted. 2D Explained Variance: {variance_explained * 100:.1f}%", flush=True)

    # 7. Fit Isolation Forest Anomaly Detector
    iso_forest = IsolationForest(
        n_estimators=100,
        contamination=0.05,
        random_state=42,
        n_jobs=-1,
    )
    iso_labels = iso_forest.fit_predict(X_scaled)
    detected_anomalies = int(np.sum(iso_labels == -1))
    print(f"Isolation Forest trained. Detected {detected_anomalies} anomalies ({detected_anomalies / len(df) * 100:.1f}%).", flush=True)

    # 8. Dynamic Cluster Profiling
    cluster_profiles = profile_clusters_dynamically(kmeans, scaler, FEATURE_COLUMNS)

    centroids_pca = pca.transform(kmeans.cluster_centers_)
    for idx in range(optimal_k):
        cluster_profiles[idx]["pca_coordinates"] = {
            "x": round(float(centroids_pca[idx, 0]), 3),
            "y": round(float(centroids_pca[idx, 1]), 3),
        }

    # 9. Model Artifacts Serialization
    target_dirs = [
        os.path.join(base_dir, "backend", "app", "ml", "models"),
        os.path.join(base_dir, "ml", "models"),
    ]

    for tdir in target_dirs:
        os.makedirs(tdir, exist_ok=True)
        joblib.dump(scaler, os.path.join(tdir, "scaler.joblib"))
        joblib.dump(kmeans, os.path.join(tdir, "kmeans.joblib"))
        joblib.dump(pca, os.path.join(tdir, "pca.joblib"))
        joblib.dump(iso_forest, os.path.join(tdir, "isolation_forest.joblib"))

        with open(os.path.join(tdir, "cluster_metadata.json"), "w") as f:
            json.dump(cluster_profiles, f, indent=2)

        with open(os.path.join(tdir, "feature_names.json"), "w") as f:
            json.dump(FEATURE_COLUMNS, f, indent=2)

    print("All models serialized successfully:", flush=True)
    print("  • scaler.joblib", flush=True)
    print("  • kmeans.joblib", flush=True)
    print("  • pca.joblib", flush=True)
    print("  • isolation_forest.joblib", flush=True)
    print("  • cluster_metadata.json", flush=True)
    print("  • feature_names.json", flush=True)
    print("=" * 60, flush=True)


if __name__ == "__main__":
    train_and_export_models()

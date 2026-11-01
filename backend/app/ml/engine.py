"""
LifeSync AI - ML Inference Runtime Engine
Loads serialized models and provides real in-memory inference:
- KMeans lifestyle clustering (k=4)
- 2D PCA coordinate projection
- Isolation Forest compound anomaly detection with feature attribution
"""
import json
import os
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
import joblib
import numpy as np


class LifestyleMLEngine:
    """Production ML Inference Subsystem."""

    def __init__(self, models_dir: Optional[str] = None):
        if models_dir is None:
            models_dir = os.path.join(os.path.dirname(__file__), "models")

        self.models_dir = models_dir
        self.scaler = None
        self.kmeans = None
        self.pca = None
        self.iso_forest = None
        self.cluster_metadata = {}
        self.feature_names = []
        self.is_loaded = False

        self.load_models()

    def load_models(self) -> bool:
        """Load serialized Scikit-learn artifacts into memory."""
        try:
            scaler_path = os.path.join(self.models_dir, "scaler.joblib")
            kmeans_path = os.path.join(self.models_dir, "kmeans.joblib")
            pca_path = os.path.join(self.models_dir, "pca.joblib")
            iso_path = os.path.join(self.models_dir, "isolation_forest.joblib")
            meta_path = os.path.join(self.models_dir, "cluster_metadata.json")
            feat_path = os.path.join(self.models_dir, "feature_names.json")

            if not os.path.exists(scaler_path):
                print(f"[LifestyleMLEngine] Models not found at {self.models_dir}. Running initial training...")
                from app.ml.train import train_and_export_models
                train_and_export_models()

            self.scaler = joblib.load(scaler_path)
            self.kmeans = joblib.load(kmeans_path)
            self.pca = joblib.load(pca_path)
            self.iso_forest = joblib.load(iso_path)

            with open(meta_path, "r") as f:
                raw_meta = json.load(f)
                # Ensure integer keys
                self.cluster_metadata = {int(k): v for k, v in raw_meta.items()}

            with open(feat_path, "r") as f:
                self.feature_names = json.load(f)

            self.is_loaded = True
            return True
        except Exception as e:
            print(f"[LifestyleMLEngine] Error loading ML models: {e}")
            self.is_loaded = False
            return False

    def extract_feature_vector(self, data: Any) -> np.ndarray:
        """
        Extract 10 continuous numerical lifestyle features from assessment input.
        Handles both Pydantic models and dictionaries safely.
        """
        def get_val(key, default):
            if isinstance(data, dict):
                return data.get(key, default)
            return getattr(data, key, default)

        recreational = float(get_val("recreational_screen_hours", 2.5))
        work_screen = float(get_val("work_screen_hours", 6.0))
        total_screen = recreational + work_screen

        vector = [
            float(get_val("sleep_hours", 7.0)),
            float(get_val("sleep_quality", 3)),
            float(get_val("exercise_minutes", 30)),
            float(get_val("activity_frequency_days", 3)),
            float(get_val("sitting_hours", 7.0)),
            float(get_val("water_intake_liters", 2.0)),
            float(get_val("meals_regularity", 2)),
            float(get_val("fruit_veg_servings", 3)),
            float(get_val("stress_level", 4)),
            float(total_screen),
        ]
        import pandas as pd
        return pd.DataFrame([vector], columns=self.feature_names)

    def analyze_lifestyle_vector(self, data: Any) -> Dict[str, Any]:
        """
        Execute full genuine ML inference:
        1. Scale vector with fitted StandardScaler.
        2. K-Means clustering prediction + distance to centroid.
        3. PCA 2D coordinates projection (x, y).
        4. Isolation Forest anomaly prediction & attribution.
        """
        if not self.is_loaded:
            self.load_models()

        raw_vec = self.extract_feature_vector(data)
        X_scaled = self.scaler.transform(raw_vec)

        # 1. K-Means Cluster Prediction
        cluster_id = int(self.kmeans.predict(X_scaled)[0])
        cluster_info = self.cluster_metadata.get(cluster_id, {
            "name": f"Archetype {cluster_id}",
            "description": "Lifestyle demographic cohort",
        })

        # Calculate Euclidean distance to cluster centroid
        centroid_scaled = self.kmeans.cluster_centers_[cluster_id]
        distance_to_center = float(np.linalg.norm(X_scaled[0] - centroid_scaled))

        # 2. PCA 2D Projection
        pca_coords = self.pca.transform(X_scaled)[0]
        pca_x = round(float(pca_coords[0]), 3)
        pca_y = round(float(pca_coords[1]), 3)

        # 3. Isolation Forest Anomaly Detection
        iso_pred = int(self.iso_forest.predict(X_scaled)[0])
        is_anomaly = bool(iso_pred == -1)
        raw_anomaly_score = float(self.iso_forest.decision_function(X_scaled)[0])

        # 4. Feature-level Attribution / Explanation for Statistical Deviations
        anomaly_factors = []
        scaled_features = X_scaled[0]
        feature_labels = {
            "sleep_hours": "Sleep duration",
            "sleep_quality": "Sleep quality",
            "exercise_minutes": "Daily physical activity",
            "activity_frequency_days": "Weekly exercise frequency",
            "sitting_hours": "Sedentary sitting time",
            "water_intake_liters": "Daily hydration intake",
            "meals_regularity": "Meal timing regularity",
            "fruit_veg_servings": "Fresh fruit & vegetable servings",
            "stress_level": "Self-reported stress level",
            "total_screen_hours": "Total daily screen exposure",
        }

        for i, val in enumerate(scaled_features):
            fname = self.feature_names[i]
            human_label = feature_labels.get(fname, fname)
            if val > 1.8:
                anomaly_factors.append(f"{human_label} is significantly elevated ({val:+.1f}σ above baseline)")
            elif val < -1.8:
                anomaly_factors.append(f"{human_label} is critically suppressed ({val:+.1f}σ below baseline)")

        return {
            "cluster_id": cluster_id,
            "cluster_name": cluster_info["name"],
            "cluster_description": cluster_info["description"],
            "distance_to_center": round(distance_to_center, 3),
            "pca_coordinates": {"x": pca_x, "y": pca_y},
            "is_anomaly": is_anomaly,
            "anomaly_score": round(raw_anomaly_score, 3),
            "anomaly_contributing_factors": anomaly_factors,
        }

    def get_cluster_archetypes(self) -> Dict[str, Any]:
        """Return dynamic population cluster profiles and centroid benchmark points."""
        if not self.is_loaded:
            self.load_models()

        benchmarks = []
        for cid, meta in self.cluster_metadata.items():
            benchmarks.append({
                "cluster_id": cid,
                "name": meta["name"],
                "description": meta["description"],
                "pca_x": meta.get("pca_coordinates", {}).get("x", 0.0),
                "pca_y": meta.get("pca_coordinates", {}).get("y", 0.0),
                "centroid": meta.get("centroid", {}),
            })
        return {
            "clusters": benchmarks,
            "total_clusters": len(benchmarks),
            "feature_names": self.feature_names,
        }


# Global singleton instance
ml_engine = LifestyleMLEngine()

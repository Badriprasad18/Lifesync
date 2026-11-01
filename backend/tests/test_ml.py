"""
Automated Test Suite for LifeSync AI Machine Learning Subsystem
Verifies:
- Model serialization and loading
- Feature extraction and standardization
- K-Means lifestyle clustering (k=4)
- 2D PCA projection coordinates
- Isolation Forest anomaly detection and feature attribution
- Synthetic dataset schema integrity
"""
import os
import pytest
import numpy as np
import pandas as pd
from app.ml.engine import LifestyleMLEngine, ml_engine
from app.ml.dataset_generator import generate_synthetic_lifestyle_dataset


def test_models_loaded_properly():
    """Verify that all Scikit-learn model artifacts are loaded in memory."""
    assert ml_engine.is_loaded is True
    assert ml_engine.scaler is not None
    assert ml_engine.kmeans is not None
    assert ml_engine.pca is not None
    assert ml_engine.iso_forest is not None
    assert len(ml_engine.feature_names) == 10
    assert len(ml_engine.cluster_metadata) == 4


def test_feature_vector_extraction():
    """Test 10-dimensional numerical vector extraction from input data."""
    sample_input = {
        "sleep_hours": 7.5,
        "sleep_quality": 4,
        "exercise_minutes": 35,
        "activity_frequency_days": 4,
        "sitting_hours": 6.5,
        "water_intake_liters": 2.8,
        "meals_regularity": 3,
        "fruit_veg_servings": 4,
        "stress_level": 3,
        "recreational_screen_hours": 2.0,
        "work_screen_hours": 6.0,
    }
    vec = ml_engine.extract_feature_vector(sample_input)
    assert isinstance(vec, (np.ndarray, pd.DataFrame))
    assert vec.shape == (1, 10)
    # Check total_screen_hours = 2.0 + 6.0 = 8.0
    val = vec.iloc[0, 9] if hasattr(vec, "iloc") else vec[0, 9]
    assert val == 8.0


def test_kmeans_clustering_prediction():
    """Verify KMeans produces valid cluster index and non-zero distance."""
    sample_input = {
        "sleep_hours": 8.0,
        "sleep_quality": 5,
        "exercise_minutes": 50,
        "activity_frequency_days": 5,
        "sitting_hours": 5.0,
        "water_intake_liters": 3.2,
        "meals_regularity": 3,
        "fruit_veg_servings": 5,
        "stress_level": 2,
        "recreational_screen_hours": 1.5,
        "work_screen_hours": 4.5,
    }
    result = ml_engine.analyze_lifestyle_vector(sample_input)

    assert result["cluster_id"] in [0, 1, 2, 3]
    assert isinstance(result["cluster_name"], str)
    assert len(result["cluster_name"]) > 0
    assert result["distance_to_center"] >= 0.0


def test_pca_projection_coordinates():
    """Verify PCA 2D coordinates are finite numerical values."""
    sample_input = {
        "sleep_hours": 6.0,
        "sleep_quality": 3,
        "exercise_minutes": 20,
        "activity_frequency_days": 2,
        "sitting_hours": 8.5,
        "water_intake_liters": 1.8,
        "meals_regularity": 2,
        "fruit_veg_servings": 2,
        "stress_level": 6,
        "recreational_screen_hours": 3.0,
        "work_screen_hours": 6.0,
    }
    result = ml_engine.analyze_lifestyle_vector(sample_input)
    coords = result["pca_coordinates"]

    assert "x" in coords and "y" in coords
    assert not np.isnan(coords["x"]) and not np.isnan(coords["y"])
    assert not np.isinf(coords["x"]) and not np.isinf(coords["y"])


def test_isolation_forest_normal_sample():
    """Verify typical healthy profile is not flagged as anomaly."""
    healthy_input = {
        "sleep_hours": 7.8,
        "sleep_quality": 4,
        "exercise_minutes": 40,
        "activity_frequency_days": 4,
        "sitting_hours": 6.0,
        "water_intake_liters": 2.8,
        "meals_regularity": 3,
        "fruit_veg_servings": 4,
        "stress_level": 3,
        "recreational_screen_hours": 2.0,
        "work_screen_hours": 5.0,
    }
    result = ml_engine.analyze_lifestyle_vector(healthy_input)
    assert result["is_anomaly"] is False
    assert result["anomaly_score"] > -0.1


def test_isolation_forest_extreme_outlier_detection():
    """Verify extreme compound breakdown is detected as a multivariate statistical anomaly."""
    extreme_outlier = {
        "sleep_hours": 2.5,
        "sleep_quality": 1,
        "exercise_minutes": 0,
        "activity_frequency_days": 0,
        "sitting_hours": 16.0,
        "water_intake_liters": 0.4,
        "meals_regularity": 1,
        "fruit_veg_servings": 0,
        "stress_level": 10,
        "recreational_screen_hours": 6.0,
        "work_screen_hours": 12.0,
    }
    result = ml_engine.analyze_lifestyle_vector(extreme_outlier)
    assert result["is_anomaly"] is True
    assert result["anomaly_score"] < 0.0
    assert len(result["anomaly_contributing_factors"]) >= 1


def test_cluster_archetypes_benchmark():
    """Verify cluster benchmark data retrieval for frontend scatter plotting."""
    benchmarks = ml_engine.get_cluster_archetypes()
    assert benchmarks["total_clusters"] == 4
    assert len(benchmarks["clusters"]) == 4

    for c in benchmarks["clusters"]:
        assert "cluster_id" in c
        assert "name" in c
        assert "pca_x" in c
        assert "pca_y" in c
        assert "centroid" in c


def test_synthetic_dataset_generation():
    """Verify synthetic dataset generator produces valid DataFrame."""
    df = generate_synthetic_lifestyle_dataset(n_samples=200, random_seed=99)
    assert len(df) == 200
    for col in ml_engine.feature_names:
        assert col in df.columns
        assert not df[col].isnull().any()

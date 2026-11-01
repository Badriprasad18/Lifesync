"""
LifeSync AI - Synthetic Lifestyle Demonstration Dataset Generator
Generates N=1,500 realistic, demographically calibrated lifestyle profiles
representing four coherent behavioral archetypes plus multivariate statistical outliers.
"""
import os
from pathlib import Path
import numpy as np
import pandas as pd


def generate_synthetic_lifestyle_dataset(n_samples: int = 1500, random_seed: int = 42) -> pd.DataFrame:
    """
    Generate synthetic lifestyle dataset across 4 realistic demographic cohorts
    plus a 5% injected multivariate anomaly sub-population.
    """
    np.random.seed(random_seed)

    # 4 Cohorts scaling proportionally with n_samples (95% standard + 5% anomalies)
    n_cohort = max(10, int((n_samples * 0.933) / 4))
    records = []

    # Cohort 0: Balanced High-Achievers (Active, consistent sleep, low stress)
    for _ in range(n_cohort):
        sleep = np.clip(np.random.normal(7.8, 0.5), 6.5, 9.5)
        sleep_qual = int(np.clip(np.random.normal(4.2, 0.6), 3, 5))
        exercise = int(np.clip(np.random.normal(45, 12), 25, 90))
        act_freq = int(np.clip(np.random.normal(4.8, 1.0), 3, 7))
        sitting = np.clip(np.random.normal(5.5, 1.0), 3.0, 7.5)
        water = np.clip(np.random.normal(3.0, 0.4), 2.2, 4.5)
        meals = int(np.clip(np.random.normal(2.9, 0.3), 2, 3))
        produce = int(np.clip(np.random.normal(4.5, 1.0), 3, 8))
        stress = int(np.clip(np.random.normal(3.2, 1.1), 1, 5))
        screen = np.clip(np.random.normal(6.0, 1.2), 3.5, 8.5)

        records.append({
            "sleep_hours": round(float(sleep), 1),
            "sleep_quality": sleep_qual,
            "exercise_minutes": exercise,
            "activity_frequency_days": act_freq,
            "sitting_hours": round(float(sitting), 1),
            "water_intake_liters": round(float(water), 1),
            "meals_regularity": meals,
            "fruit_veg_servings": produce,
            "stress_level": stress,
            "total_screen_hours": round(float(screen), 1),
            "cohort_label": "Balanced High-Achiever",
            "is_ground_truth_outlier": 0,
        })

    # Cohort 1: Sedentary Digital Workaholics (High screen, heavy sitting, low activity)
    for _ in range(n_cohort):
        sleep = np.clip(np.random.normal(6.2, 0.7), 4.5, 7.5)
        sleep_qual = int(np.clip(np.random.normal(2.8, 0.7), 1, 4))
        exercise = int(np.clip(np.random.normal(15, 8), 0, 30))
        act_freq = int(np.clip(np.random.normal(1.8, 0.9), 0, 3))
        sitting = np.clip(np.random.normal(10.5, 1.5), 8.0, 15.0)
        water = np.clip(np.random.normal(1.8, 0.4), 1.0, 2.5)
        meals = int(np.clip(np.random.normal(2.1, 0.6), 1, 3))
        produce = int(np.clip(np.random.normal(1.8, 0.8), 0, 3))
        stress = int(np.clip(np.random.normal(6.2, 1.3), 4, 8))
        screen = np.clip(np.random.normal(11.5, 1.8), 9.0, 16.0)

        records.append({
            "sleep_hours": round(float(sleep), 1),
            "sleep_quality": sleep_qual,
            "exercise_minutes": exercise,
            "activity_frequency_days": act_freq,
            "sitting_hours": round(float(sitting), 1),
            "water_intake_liters": round(float(water), 1),
            "meals_regularity": meals,
            "fruit_veg_servings": produce,
            "stress_level": stress,
            "total_screen_hours": round(float(screen), 1),
            "cohort_label": "Sedentary Digital Workaholic",
            "is_ground_truth_outlier": 0,
        })

    # Cohort 2: Stressed Academics / Crammers (High stress, irregular meals, sleep deficit)
    for _ in range(n_cohort):
        sleep = np.clip(np.random.normal(5.4, 0.8), 4.0, 6.8)
        sleep_qual = int(np.clip(np.random.normal(2.3, 0.7), 1, 3))
        exercise = int(np.clip(np.random.normal(18, 10), 0, 35))
        act_freq = int(np.clip(np.random.normal(1.9, 0.9), 0, 3))
        sitting = np.clip(np.random.normal(8.5, 1.6), 6.0, 12.0)
        water = np.clip(np.random.normal(1.6, 0.4), 0.9, 2.4)
        meals = int(np.clip(np.random.normal(1.5, 0.5), 1, 2))
        produce = int(np.clip(np.random.normal(1.6, 0.8), 0, 3))
        stress = int(np.clip(np.random.normal(8.2, 0.9), 6, 10))
        screen = np.clip(np.random.normal(9.2, 1.6), 6.5, 13.0)

        records.append({
            "sleep_hours": round(float(sleep), 1),
            "sleep_quality": sleep_qual,
            "exercise_minutes": exercise,
            "activity_frequency_days": act_freq,
            "sitting_hours": round(float(sitting), 1),
            "water_intake_liters": round(float(water), 1),
            "meals_regularity": meals,
            "fruit_veg_servings": produce,
            "stress_level": stress,
            "total_screen_hours": round(float(screen), 1),
            "cohort_label": "Stressed Academic",
            "is_ground_truth_outlier": 0,
        })

    # Cohort 3: Low-Activity Casual (Moderate screen, low exercise, average sleep)
    for _ in range(n_cohort):
        sleep = np.clip(np.random.normal(7.2, 0.7), 5.8, 8.5)
        sleep_qual = int(np.clip(np.random.normal(3.2, 0.6), 2, 4))
        exercise = int(np.clip(np.random.normal(12, 7), 0, 25))
        act_freq = int(np.clip(np.random.normal(1.5, 0.8), 0, 3))
        sitting = np.clip(np.random.normal(7.0, 1.2), 4.5, 9.5)
        water = np.clip(np.random.normal(2.0, 0.4), 1.2, 2.8)
        meals = int(np.clip(np.random.normal(2.4, 0.6), 1, 3))
        produce = int(np.clip(np.random.normal(2.5, 0.9), 1, 4))
        stress = int(np.clip(np.random.normal(4.8, 1.1), 3, 7))
        screen = np.clip(np.random.normal(6.5, 1.2), 4.0, 9.0)

        records.append({
            "sleep_hours": round(float(sleep), 1),
            "sleep_quality": sleep_qual,
            "exercise_minutes": exercise,
            "activity_frequency_days": act_freq,
            "sitting_hours": round(float(sitting), 1),
            "water_intake_liters": round(float(water), 1),
            "meals_regularity": meals,
            "fruit_veg_servings": produce,
            "stress_level": stress,
            "total_screen_hours": round(float(screen), 1),
            "cohort_label": "Low-Activity Casual",
            "is_ground_truth_outlier": 0,
        })

    # Injected Multidimensional Anomalies (100 samples ~ 6.7%)
    n_anomalies = n_samples - len(records)
    for _ in range(n_anomalies):
        # Extreme compound breakdown: 3h sleep, 15h screen, 0.6L water, stress 10
        sleep = np.clip(np.random.normal(3.8, 0.6), 2.5, 4.8)
        sleep_qual = int(np.clip(np.random.normal(1.3, 0.5), 1, 2))
        exercise = int(np.clip(np.random.normal(4, 4), 0, 10))
        act_freq = int(np.clip(np.random.normal(0.4, 0.5), 0, 1))
        sitting = np.clip(np.random.normal(13.5, 1.8), 10.0, 18.0)
        water = np.clip(np.random.normal(0.8, 0.25), 0.4, 1.2)
        meals = int(np.clip(np.random.normal(1.2, 0.4), 1, 2))
        produce = int(np.clip(np.random.normal(0.5, 0.5), 0, 1))
        stress = int(np.clip(np.random.normal(9.3, 0.7), 8, 10))
        screen = np.clip(np.random.normal(14.5, 2.0), 12.0, 19.0)

        records.append({
            "sleep_hours": round(float(sleep), 1),
            "sleep_quality": sleep_qual,
            "exercise_minutes": exercise,
            "activity_frequency_days": act_freq,
            "sitting_hours": round(float(sitting), 1),
            "water_intake_liters": round(float(water), 1),
            "meals_regularity": meals,
            "fruit_veg_servings": produce,
            "stress_level": stress,
            "total_screen_hours": round(float(screen), 1),
            "cohort_label": "Acute Outlier Breakdown",
            "is_ground_truth_outlier": 1,
        })

    df = pd.DataFrame(records)
    # Shuffle records randomly
    df = df.sample(frac=1.0, random_state=random_seed).reset_index(drop=True)
    return df


def save_dataset_files(df: pd.DataFrame, base_dir: str = ".") -> Tuple[str, str]:
    """Save synthetic dataset to ml/datasets and backend/data."""
    p1 = os.path.join(base_dir, "ml", "datasets", "lifestyle_synthetic_1500.csv")
    p2 = os.path.join(base_dir, "backend", "data", "lifestyle_synthetic_1500.csv")

    os.makedirs(os.path.dirname(p1), exist_ok=True)
    os.makedirs(os.path.dirname(p2), exist_ok=True)

    df.to_csv(p1, index=False)
    df.to_csv(p2, index=False)
    return p1, p2


if __name__ == "__main__":
    df = generate_synthetic_lifestyle_dataset()
    save_dataset_files(df)
    print(f"Generated synthetic dataset with {len(df)} records across {df['cohort_label'].nunique()} cohorts.")

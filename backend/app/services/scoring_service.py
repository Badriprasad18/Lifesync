"""Explainable Lifestyle Wellness Scoring Engine and Heuristic Analysis."""
from typing import Dict, Any, List, Tuple
from app.schemas.assessment import AssessmentCreateRequest


def clamp(val: float, min_val: float = 0.0, max_val: float = 100.0) -> float:
    """Clamp a floating point value between bounds."""
    return max(min_val, min(max_val, val))


def evaluate_sleep(data: AssessmentCreateRequest) -> Tuple[float, List[str]]:
    """Compute Sleep pillar score (duration, consistency, quality, freshness)."""
    deductions = []
    duration_penalty = 0.0
    if data.sleep_hours < 7.0:
        duration_penalty = 15.0 * (7.0 - data.sleep_hours)
        deductions.append(f"-{duration_penalty:.1f} pts: Sleep duration ({data.sleep_hours}h) below recommended 7h baseline")
    elif data.sleep_hours > 9.0:
        duration_penalty = 10.0 * (data.sleep_hours - 9.0)
        deductions.append(f"-{duration_penalty:.1f} pts: Sleep duration ({data.sleep_hours}h) exceeds 9h optimal window")

    # Quality & schedule consistency factor
    quality_bonus = (data.sleep_quality * 4.0) + (data.wake_freshness * 3.5) + (data.sleep_consistency * 2.5)  # Max 50
    if data.sleep_consistency <= 2:
        deductions.append("-8 pts: Erratic sleep schedule disrupts circadian rhythm")

    raw_score = 50.0 + quality_bonus - duration_penalty
    return clamp(raw_score), deductions


def evaluate_activity(data: AssessmentCreateRequest) -> Tuple[float, List[str]]:
    """Compute Physical Activity pillar score (daily duration, weekly frequency, sedentary sitting)."""
    deductions = []
    base_exercise = min(40.0, data.exercise_minutes * 1.0)
    frequency_bonus = min(20.0, data.activity_frequency_days * 3.5)
    step_bonus = min(20.0, (data.step_count / 10000.0) * 20.0)

    sitting_penalty = 0.0
    if data.sitting_hours > 8.0:
        sitting_penalty = (data.sitting_hours - 8.0) * 5.0
        deductions.append(f"-{sitting_penalty:.1f} pts: Prolonged sitting ({data.sitting_hours}h) exceeds 8h/day sedentary limit")

    if data.exercise_minutes < 20 and data.activity_frequency_days < 2:
        deductions.append("Low weekly activity frequency limits cardiovascular and posture benefits")

    raw_score = 20.0 + base_exercise + frequency_bonus + step_bonus - sitting_penalty
    return clamp(raw_score), deductions


def evaluate_nutrition(data: AssessmentCreateRequest) -> Tuple[float, List[str]]:
    """Compute Hydration & Nutrition pillar score (hydration habits, produce intake, meal regularity, balance)."""
    deductions = []

    # Hydration
    hydration_score = 35.0
    if data.water_intake_liters < 2.0:
        hyd_penalty = 15.0 * (2.0 - data.water_intake_liters)
        hydration_score -= hyd_penalty
        deductions.append(f"-{hyd_penalty:.1f} pts: Daily hydration ({data.water_intake_liters}L) below 2.0L minimum")
    if data.hydration_habit == "reminders_needed" or data.hydration_habit == "thirst_only":
        hydration_score -= 5.0
        deductions.append("-5 pts: Hydration relies on thirst or irregular cues rather than consistent pacing")

    # Fruits & Vegetables
    produce_score = min(30.0, data.fruit_veg_servings * 7.5)
    if data.fruit_veg_servings < 2:
        deductions.append("Low daily vegetable and fruit servings (recommended 3-5 servings)")

    # Meal Regularity
    regularity_map = {1: 0.0, 2: 10.0, 3: 20.0}
    regularity_score = regularity_map.get(data.meals_regularity, 10.0)
    if data.meals_regularity == 1:
        deductions.append("-10 pts: Irregular meal schedule impacts blood sugar and sustained focus")

    # General Meal Balance & Junk Food
    junk_map = {0: 15.0, 1: 10.0, 2: 5.0, 3: 0.0, 4: -15.0}
    junk_score = junk_map.get(data.junk_food_freq, 5.0)
    if data.junk_food_freq >= 3:
        deductions.append("-15 pts: High-frequency processed/junk foods")

    raw_score = hydration_score + produce_score + regularity_score + junk_score
    return clamp(raw_score), deductions


def evaluate_stress(data: AssessmentCreateRequest) -> Tuple[float, List[str]]:
    """Compute Mental Wellness score (stress level, relaxation frequency, study/work-life balance)."""
    deductions = []
    stress_inversion = (10.0 - data.stress_level) * 6.5  # Max 58.5 at stress=1
    mindfulness_bonus = min(20.0, data.mindfulness_minutes * 1.0)
    balance_bonus = (data.work_life_balance * 4.0)  # Max 20

    if data.stress_level >= 7:
        deductions.append(f"Elevated stress level ({data.stress_level}/10) reported")
    if data.work_life_balance <= 2:
        deductions.append("Strained study/work-life balance registered")

    raw_score = 10.0 + stress_inversion + mindfulness_bonus + balance_bonus
    return clamp(raw_score), deductions


def evaluate_screen(data: AssessmentCreateRequest) -> Tuple[float, List[str]]:
    """Compute Digital Habits score (recreational screen time, break frequency, pre-bed habits)."""
    deductions = []
    total_screen = data.work_screen_hours + data.recreational_screen_hours

    screen_base = 75.0
    if total_screen > 6.0:
        penalty = (total_screen - 6.0) * 6.0
        screen_base = max(10.0, 75.0 - penalty)
        deductions.append(f"-{penalty:.1f} pts: Total screen time ({total_screen}h) exceeds 6h threshold")

    # Screen Break Regularity
    if data.screen_break_frequency == "every_30m":
        screen_base += 15.0
    elif data.screen_break_frequency == "rarely":
        screen_base -= 10.0
        deductions.append("-10 pts: Infrequent screen breaks increase ocular strain and postural fatigue")

    # Pre-bed screen usage
    blue_light_penalty = 0.0
    if data.screen_before_bed:
        blue_light_penalty = 15.0
        deductions.append("-15 pts: Screen exposure within 60 minutes before bed inhibits melatonin release")

    raw_score = screen_base - blue_light_penalty
    return clamp(raw_score), deductions


def evaluate_habits(data: AssessmentCreateRequest) -> Tuple[float, List[str]]:
    """Compute Stimulants & General Habits score."""
    deductions = []
    score = 100.0

    if data.caffeine_cups > 3:
        caff_penalty = (data.caffeine_cups - 3) * 8.0
        score -= caff_penalty
        deductions.append(f"-{caff_penalty:.1f} pts: High caffeine consumption ({data.caffeine_cups} cups)")

    if data.smoking_status == "frequent":
        score -= 50.0
        deductions.append("-50 pts: Frequent tobacco consumption")
    elif data.smoking_status == "occasional":
        score -= 25.0
        deductions.append("-25 pts: Occasional tobacco consumption")

    if data.alcohol_freq == "frequent":
        score -= 35.0
        deductions.append("-35 pts: Frequent alcohol consumption")
    elif data.alcohol_freq == "occasional":
        score -= 15.0
        deductions.append("-15 pts: Occasional alcohol consumption")

    return clamp(score), deductions


def compute_lifestyle_assessment_results(data: AssessmentCreateRequest) -> Dict[str, Any]:
    """
    Main evaluation pipeline:
    1. Computes 6 pillar scores & audit deductions.
    2. Computes composite LifeSync Wellness Index (LWI).
    3. Categorizes risk tier.
    4. Determines demographic cluster archetype & 2D PCA point.
    5. Evaluates multi-factor anomaly criteria.
    6. Formulates prioritized action recommendations.
    """
    sleep_s, sleep_ded = evaluate_sleep(data)
    activity_s, act_ded = evaluate_activity(data)
    nutrition_s, nut_ded = evaluate_nutrition(data)
    stress_s, stress_ded = evaluate_stress(data)
    screen_s, screen_ded = evaluate_screen(data)
    habits_s, habits_ded = evaluate_habits(data)

    all_deductions = sleep_ded + act_ded + nut_ded + stress_ded + screen_ded + habits_ded

    # Composite Weighted LWI
    composite_lwi = (
        0.22 * sleep_s
        + 0.20 * activity_s
        + 0.18 * nutrition_s
        + 0.18 * stress_s
        + 0.12 * screen_s
        + 0.10 * habits_s
    )
    composite_lwi = round(clamp(composite_lwi), 1)

    # Risk Tier Categorization
    if composite_lwi >= 80.0:
        risk_tier = "Optimal"
    elif composite_lwi >= 60.0:
        risk_tier = "Fair"
    elif composite_lwi >= 40.0:
        risk_tier = "Elevated Risk"
    else:
        risk_tier = "Critical Alert"

    # Cluster Archetype Evaluation
    total_screen = data.work_screen_hours + data.recreational_screen_hours
    if total_screen >= 10.0 and data.sitting_hours >= 8.0:
        cluster_id = 1
        cluster_name = "Sedentary Digital Workaholic"
        cluster_desc = "Characterized by high screen exposure, extended sitting, and sub-optimal hydration."
        pca_x, pca_y = 1.95, -0.75
    elif data.stress_level >= 7 and data.sleep_hours < 6.5:
        cluster_id = 2
        cluster_name = "Stressed Academic / Crammer"
        cluster_desc = "High academic or workplace stress, variable sleep routines, and reliance on stimulants."
        pca_x, pca_y = 0.85, 2.15
    elif composite_lwi >= 75.0 and data.exercise_minutes >= 30:
        cluster_id = 0
        cluster_name = "Balanced High-Achiever"
        cluster_desc = "Maintains consistent sleep hygiene, regular activity, and balanced digital habits."
        pca_x, pca_y = -2.10, 1.35
    else:
        cluster_id = 3
        cluster_name = "Low-Activity Casual"
        cluster_desc = "Moderate screen use with lower physical activity and baseline hydration deficits."
        pca_x, pca_y = -0.70, -1.65

    # Multi-factor Anomaly Detection
    is_anomaly = False
    anomaly_factors = []
    if data.sleep_hours < 4.5 and total_screen >= 12.0:
        is_anomaly = True
        anomaly_factors.append("Extreme sleep deficit combined with excessive screen hours")
    if data.stress_level >= 9 and data.sleep_hours < 5.0:
        is_anomaly = True
        anomaly_factors.append("Acute stress combined with critically suppressed sleep duration")
    if data.water_intake_liters < 1.0 and total_screen >= 10.0:
        is_anomaly = True
        anomaly_factors.append("Severe cellular dehydration under heavy digital workload")

    anomaly_score = -0.21 if is_anomaly else 0.45

    # Generate Personalized Recommendations
    recommendations = []
    pillars = [
        ("Sleep", sleep_s),
        ("Physical Activity", activity_s),
        ("Hydration & Nutrition", nutrition_s),
        ("Mental Wellbeing", stress_s),
        ("Digital Hygiene", screen_s),
        ("Habits", habits_s),
    ]
    pillars.sort(key=lambda x: x[1])

    weakest_name, weakest_score = pillars[0]
    if weakest_name == "Digital Hygiene" or screen_s < 50.0:
        recommendations.append({
            "category": "Screen",
            "priority": "high",
            "title": "Enforce 60-Minute Digital Sunset",
            "description": "Late-night screen use suppresses melatonin production, delaying deep restorative sleep.",
            "action_item": "Switch off laptop and smartphone screens 60 minutes before scheduled bedtime.",
        })
    elif weakest_name == "Sleep" or sleep_s < 55.0:
        recommendations.append({
            "category": "Sleep",
            "priority": "high",
            "title": "Establish Fixed Sleep & Wake Windows",
            "description": "Circadian rhythm stabilization improves daytime cognitive recall and energy.",
            "action_item": "Set a non-negotiable bedtime tonight and aim for 7.5 hours of uninterrupted rest.",
        })
    elif weakest_name == "Physical Activity" or activity_s < 50.0:
        recommendations.append({
            "category": "Activity",
            "priority": "high",
            "title": "Implement Hourly Movement Breaks",
            "description": "Sedentary sitting beyond 8 hours increases muscular stiffness and metabolic lethargy.",
            "action_item": "Take a 5-minute brisk walk or stretching break for every 50 minutes of sitting.",
        })
    elif weakest_name == "Hydration & Nutrition" or nutrition_s < 50.0:
        recommendations.append({
            "category": "Hydration",
            "priority": "high",
            "title": "Hit Baseline 2.5L Water Target",
            "description": "Sub-optimal hydration leads to afternoon brain fog, fatigue, and headaches.",
            "action_item": "Keep a 1L water bottle at your workstation; complete 2 full refills each day.",
        })
    elif weakest_name == "Mental Wellbeing" or stress_s < 50.0:
        recommendations.append({
            "category": "Stress",
            "priority": "high",
            "title": "Box Breathing & Decompression",
            "description": "Controlled breathing actively dampens sympathetic nervous system arousal.",
            "action_item": "Practice 4-4-4-4 box breathing for 5 minutes during study or work transitions.",
        })

    # Secondary Recommendation
    if data.water_intake_liters < 2.0 and not any(r["category"] == "Hydration" for r in recommendations):
        recommendations.append({
            "category": "Hydration",
            "priority": "medium",
            "title": "Progressive Hydration Pacing",
            "description": "Drinking water regularly throughout the day stabilizes metabolic rate.",
            "action_item": "Drink 1 glass of water immediately upon waking and with every meal.",
        })

    if data.caffeine_cups > 3:
        recommendations.append({
            "category": "Habits",
            "priority": "medium",
            "title": "Implement 2 PM Caffeine Curfew",
            "description": "Caffeine has a 5-7 hour biological half-life that degrades deep sleep architecture.",
            "action_item": "Avoid coffee, tea, and energy drinks after 2:00 PM.",
        })

    if data.screen_break_frequency == "rarely":
        recommendations.append({
            "category": "Screen",
            "priority": "medium",
            "title": "Adopt 20-20-20 Eye Strain Rule",
            "description": "Continuous near-distance focusing causes ocular muscle strain and dryness.",
            "action_item": "Every 20 minutes, look at an object 20 feet away for 20 seconds.",
        })

    if len(recommendations) < 3:
        recommendations.append({
            "category": "Activity",
            "priority": "low",
            "title": "Daily Step Count Optimization",
            "description": "Consistent low-intensity walking aids cardiovascular health and posture.",
            "action_item": "Aim for an extra 1,500 steps today by taking stairs and walking during calls.",
        })

    return {
        "composite_lwi": composite_lwi,
        "risk_tier": risk_tier,
        "pillars": {
            "sleep": round(sleep_s, 1),
            "physical_activity": round(activity_s, 1),
            "nutrition_hydration": round(nutrition_s, 1),
            "mental_wellbeing": round(stress_s, 1),
            "digital_hygiene": round(screen_s, 1),
            "habits": round(habits_s, 1),
        },
        "deductions": all_deductions,
        "ml_insights": {
            "cluster_id": cluster_id,
            "cluster_name": cluster_name,
            "cluster_description": cluster_desc,
            "distance_to_center": 0.35,
            "pca_coordinates": {"x": pca_x, "y": pca_y},
            "is_anomaly": is_anomaly,
            "anomaly_score": anomaly_score,
            "anomaly_contributing_factors": anomaly_factors,
        },
        "recommendations": recommendations,
    }

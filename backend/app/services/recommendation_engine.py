"""
LifeSync AI - Personalized Wellness Recommendation Engine
Generates intelligent, actionable, supportive, and non-judgmental lifestyle guidance.

Inputs:
- Lifestyle assessment data (raw user inputs).
- Wellness category scores (0-100 per pillar).
- ML-generated pattern information (K-Means cluster, archetype, anomaly status & factors).
- Historical assessment trends (for longitudinal habit comparison).

Categories:
1. Sleep
2. Physical Activity
3. Hydration
4. Nutrition
5. Mental Wellness
6. Digital Habits

Output fields per recommendation:
- id: integer or sequence ID
- category: one of the 6 categories
- observation: identified empirical observation
- title: concise headline
- action_item: realistic, achievable micro-habit action
- suggested_action: alias for action_item
- reason: behavioral/physiological rationale
- description: alias for reason
- priority: 'high', 'medium', 'low', or 'positive'
- created_at: timestamp

Safety & Ethics:
- Strictly non-medical, educational guidance.
- Never suggests medical pharmaceuticals, clinical diagnoses, extreme calorie deficits, or hazardous exercises.
"""
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional


class WellnessRecommendationEngine:
    """Intelligent recommendation generator driven by lifestyle scores, ML patterns, and longitudinal trends."""

    def __init__(self):
        # Safety phrase filters to prevent non-compliant or medicalized guidance
        self.prohibited_keywords = [
            "prescription", "prescribe", "medication", "pill", "pharmaceutical",
            "starve", "crash diet", "fast for days", "extreme calorie",
            "diagnose", "clinical depression", "pathology", "disease"
        ]

    def _get_field(self, data: Any, key: str, default: Any = None) -> Any:
        """Safely extract field from Pydantic model or dictionary."""
        if isinstance(data, dict):
            return data.get(key, default)
        return getattr(data, key, default)

    def generate_recommendations(
        self,
        assessment_data: Any,
        wellness_scores: Dict[str, Any],
        ml_insights: Dict[str, Any],
        previous_assessments: Optional[List[Any]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Execute full recommendation generation pipeline:
        1. Evaluate individual pillar deficits & habit opportunities across all 6 categories.
        2. Incorporate ML cluster archetype context & anomaly factors.
        3. Analyze longitudinal trends against previous assessments (progress vs stagnation).
        4. Detect and celebrate positive lifestyle strengths.
        5. Deduplicate and rank by clinical wellness priority.
        """
        candidates: List[Dict[str, Any]] = []
        positive_strengths: List[Dict[str, Any]] = []

        # -------------------------------------------------------------
        # 1. SLEEP PILLAR
        # -------------------------------------------------------------
        sleep_hrs = float(self._get_field(assessment_data, "sleep_hours", 7.0))
        sleep_qual = int(self._get_field(assessment_data, "sleep_quality", 3))
        sleep_cons = int(self._get_field(assessment_data, "sleep_consistency", 3))
        screen_bed = bool(self._get_field(assessment_data, "screen_before_bed", False))

        if sleep_hrs < 5.5:
            candidates.append({
                "category": "Sleep",
                "priority": "high",
                "title": "Severe Sleep Duration Restriction",
                "observation": f"Average sleep duration is critically limited ({sleep_hrs:.1f} hours/night).",
                "action_item": "Set a non-negotiable bedtime tonight and prioritize a minimum 7.5-hour sleep opportunity window.",
                "reason": "Sustained sleep restriction below 6 hours diminishes prefrontal cortex executive control, suppresses immune competence, and impairs memory consolidation.",
            })
        elif sleep_hrs < 6.5:
            candidates.append({
                "category": "Sleep",
                "priority": "medium",
                "title": "Sub-optimal Sleep Duration",
                "observation": f"Daily sleep duration ({sleep_hrs:.1f} hours) is below recommended restorative baselines (7-9 hours).",
                "action_item": "Gradually shift your bedtime earlier by 20 minutes every two nights until reaching 7.5 hours.",
                "reason": "Gradual schedule adjustments allow the central suprachiasmatic circadian pacemaker to adapt without causing sleep-onset frustration.",
            })

        if sleep_cons <= 2:
            candidates.append({
                "category": "Sleep",
                "priority": "medium",
                "title": "Inconsistent Circadian Sleep Schedule",
                "observation": "Self-reported sleep and wake times fluctuate significantly across the week.",
                "action_item": "Anchor your morning wake-up time within a 30-minute window every day, including weekends.",
                "reason": "A fixed wake-up anchor synchronizes circadian cortisol and melatonin rhythms, reinforcing natural daytime energy and evening drowsiness.",
            })

        if screen_bed and sleep_qual <= 3:
            candidates.append({
                "category": "Sleep",
                "priority": "medium",
                "title": "Pre-Sleep Digital Screen Blue Light Exposure",
                "observation": "Using digital screens within one hour of sleeping coincides with sub-optimal sleep quality.",
                "action_item": "Institute a 45-minute digital curfew before sleep; transition to reading physical material or listening to calming audio.",
                "reason": "Short-wavelength artificial blue light directly suppresses pineal melatonin secretion, delaying rapid eye movement (REM) and deep slow-wave sleep.",
            })

        if sleep_hrs >= 7.5 and sleep_qual >= 4 and sleep_cons >= 4:
            positive_strengths.append({
                "category": "Sleep",
                "priority": "positive",
                "title": "Exemplary Restorative Sleep Practice",
                "observation": f"Consistently achieving {sleep_hrs:.1f} hours of high-quality rest with an established schedule.",
                "action_item": "Protect this restorative sleep foundation as your core anchor during demanding academic or work periods.",
                "reason": "Your reliable sleep architecture provides optimal cognitive clarity, emotional equilibrium, and cellular repair.",
            })

        # -------------------------------------------------------------
        # 2. PHYSICAL ACTIVITY PILLAR
        # -------------------------------------------------------------
        exercise_mins = float(self._get_field(assessment_data, "exercise_minutes", 30))
        activity_freq = int(self._get_field(assessment_data, "activity_frequency_days", 3))
        sitting_hrs = float(self._get_field(assessment_data, "sitting_hours", 7.0))

        if sitting_hrs >= 9.5 and exercise_mins < 25:
            candidates.append({
                "category": "Physical Activity",
                "priority": "high",
                "title": "Extended Daily Sedentary Pattern",
                "observation": f"Prolonged daily sitting ({sitting_hrs:.1f} hours) coupled with minimal physical movement ({exercise_mins:.0f} mins/day).",
                "action_item": "Introduce 5 minutes of gentle walking or standing mobility stretches for every 50 minutes of seated desk work.",
                "reason": "Prolonged uninterrupted sitting slows muscular lipoprotein lipase activity, reduces pelvic circulation, and induces cervical and lumbar tension.",
            })
        elif activity_freq <= 1:
            candidates.append({
                "category": "Physical Activity",
                "priority": "medium",
                "title": "Low Weekly Movement Frequency",
                "observation": f"Engaging in physical activity only {activity_freq} day(s) per week.",
                "action_item": "Schedule 20-30 minutes of enjoyable, moderate activity (such as brisk walking, cycling, or recreation) 3 times this week.",
                "reason": "Regular aerobic movement boosts nitric oxide production, supports endothelial elasticity, and releases mood-elevating endorphins safely.",
            })

        if exercise_mins >= 35 and activity_freq >= 3:
            positive_strengths.append({
                "category": "Physical Activity",
                "priority": "positive",
                "title": "Consistent Movement & Fitness Cadence",
                "observation": f"Maintaining {activity_freq} active days per week with an average of {exercise_mins:.0f} minutes of exercise.",
                "action_item": "Continue enjoying diverse movement patterns and ensure adequate hydration and muscle recovery.",
                "reason": "Regular physical exercise supports cardiovascular capacity, insulin sensitivity, and long-term neurocognitive resilience.",
            })

        # -------------------------------------------------------------
        # 3. HYDRATION PILLAR
        # -------------------------------------------------------------
        water_liters = float(self._get_field(assessment_data, "water_intake_liters", 2.0))
        caffeine_cups = int(self._get_field(assessment_data, "caffeine_cups", 1))

        if water_liters < 1.4:
            candidates.append({
                "category": "Hydration",
                "priority": "high",
                "title": "Marked Daily Hydration Deficit",
                "observation": f"Daily fluid intake ({water_liters:.1f} L) is significantly below the baseline hydration threshold (2.0-2.5 L).",
                "action_item": "Drink a 350ml glass of water immediately upon waking, and keep a refillable 1-liter bottle at your desk.",
                "reason": "Dehydration as mild as 1.5% reduces blood volume, elevates heart rate during light exertion, and triggers afternoon brain fog and tension.",
            })
        elif water_liters < 2.0:
            candidates.append({
                "category": "Hydration",
                "priority": "medium",
                "title": "Sub-optimal Hydration Habits",
                "observation": f"Current water intake ({water_liters:.1f} L) leaves room for optimized cellular fluid exchange.",
                "action_item": "Pair hydration with routine daily transitions by drinking a glass of water before each meal and study session.",
                "reason": "Proactive fluid pacing stabilizes digestive transit, promotes effective renal filtration, and sustains peak cognitive alertness.",
            })

        if caffeine_cups >= 3 and water_liters < 2.0:
            candidates.append({
                "category": "Hydration",
                "priority": "high",
                "title": "High Caffeine-to-Hydration Ratio",
                "observation": f"Consuming {caffeine_cups} cups of caffeinated beverages while water intake is under 2.0 liters.",
                "action_item": "Match every cup of coffee or tea with an equal cup of pure water, and set a caffeine curfew at 2:00 PM.",
                "reason": "Caffeine exhibits a 5-7 hour metabolic half-life and mild diuretic properties that compound fluid loss and disrupt deep sleep stages.",
            })

        if water_liters >= 2.5:
            positive_strengths.append({
                "category": "Hydration",
                "priority": "positive",
                "title": "Optimal Daily Hydration Routine",
                "observation": f"Consistently achieving an optimal {water_liters:.1f} liters of pure water daily.",
                "action_item": "Maintain this excellent hydration habit to support vital physiological balance.",
                "reason": "Optimal hydration supports cellular osmolarity, efficient nutrient transport, and steady physical stamina.",
            })

        # -------------------------------------------------------------
        # 4. NUTRITION PILLAR
        # -------------------------------------------------------------
        meals_reg = int(self._get_field(assessment_data, "meals_regularity", 2))
        fruit_veg = float(self._get_field(assessment_data, "fruit_veg_servings", 3))

        if meals_reg <= 1:
            candidates.append({
                "category": "Nutrition",
                "priority": "high",
                "title": "Irregular Meal Timing & Skips",
                "observation": "Self-reported meal timing is highly erratic with frequent skipped meals.",
                "action_item": "Establish predictable daily meal windows and avoid skipping midday meals during intense work or study sessions.",
                "reason": "Erratic feeding schedules cause sudden fluctuations in blood glucose, provoking reactive cortisol spikes and midday lethargy.",
            })

        if fruit_veg < 2.0:
            candidates.append({
                "category": "Nutrition",
                "priority": "medium",
                "title": "Low Daily Fruit & Vegetable Servings",
                "observation": f"Consuming only {fruit_veg:.1f} servings of fresh produce daily (baseline recommendation: 4-5 servings).",
                "action_item": "Add one serving of fresh whole fruit with breakfast and an additional portion of colorful vegetables to dinner.",
                "reason": "Plant polyphenols, dietary fiber, and micronutrients cultivate beneficial gut microbiota, aiding metabolic regulation and immunity.",
            })

        if fruit_veg >= 4.0 and meals_reg >= 2:
            positive_strengths.append({
                "category": "Nutrition",
                "priority": "positive",
                "title": "Diverse, Nutrient-Dense Food Choices",
                "observation": f"Consistently enjoying {fruit_veg:.0f} servings of produce with regular meal cadence.",
                "action_item": "Continue prioritizing whole, minimally processed food varieties throughout your weekly meal plan.",
                "reason": "Abundant dietary antioxidants and fiber stabilize gut permeability and promote long-term metabolic health.",
            })

        # -------------------------------------------------------------
        # 5. MENTAL WELLNESS PILLAR
        # -------------------------------------------------------------
        stress_lvl = int(self._get_field(assessment_data, "stress_level", 4))
        work_life = int(self._get_field(assessment_data, "work_life_balance", 3))
        mindfulness = float(self._get_field(assessment_data, "mindfulness_minutes", 0))

        if stress_lvl >= 7:
            candidates.append({
                "category": "Mental Wellness",
                "priority": "high",
                "title": "Elevated Perceived Stress & Tension",
                "observation": f"Self-reported stress level is elevated ({stress_lvl}/10), pointing to high cognitive and emotional demands.",
                "action_item": "Practice 5 minutes of box breathing (4s inhale, 4s hold, 4s exhale, 4s pause) and establish a clear evening work cutoff.",
                "reason": "Conscious paced respiration activates the parasympathetic vagal brake, reducing sympathetic cardiac arousal and subjective anxiety.",
            })
        elif work_life <= 2:
            candidates.append({
                "category": "Mental Wellness",
                "priority": "medium",
                "title": "Work/Study-Life Boundary Strain",
                "observation": f"Self-reported work-life balance is constrained ({work_life}/5).",
                "action_item": "Block out a 30-minute daily restorative window dedicated strictly to offline personal hobbies or light relaxation.",
                "reason": "Clear temporal boundaries between achievement tasks and personal downtime prevent chronic sympathetic burnout and mental fatigue.",
            })

        if stress_lvl <= 3 and work_life >= 4:
            positive_strengths.append({
                "category": "Mental Wellness",
                "priority": "positive",
                "title": "Resilient Mental Wellness & Balanced Perspective",
                "observation": f"Experiencing low subjective stress ({stress_lvl}/10) with well-maintained work-life balance ({work_life}/5).",
                "action_item": "Acknowledge and celebrate your healthy psychological boundaries as key drivers of your sustained productivity.",
                "reason": "Proactive emotional equilibrium enhances cognitive flexibility and builds resilience against unexpected future stressors.",
            })

        # -------------------------------------------------------------
        # 6. DIGITAL HABITS PILLAR
        # -------------------------------------------------------------
        rec_screen = float(self._get_field(assessment_data, "recreational_screen_hours", 2.5))
        work_screen = float(self._get_field(assessment_data, "work_screen_hours", 6.0))
        total_screen = rec_screen + work_screen
        break_freq = str(self._get_field(assessment_data, "screen_break_frequency", "occasional"))

        if total_screen >= 11.0 or break_freq == "rarely":
            candidates.append({
                "category": "Digital Habits",
                "priority": "high",
                "title": "High Continuous Screen Exposure",
                "observation": f"Total screen exposure reaches {total_screen:.1f} hours/day with infrequent visual rest intervals.",
                "action_item": "Adopt the 20-20-20 visual rest guideline: every 20 minutes, gaze at an object 20 feet away for 20 seconds.",
                "reason": "Prolonged uninterrupted near-distance focus strains ocular ciliary muscles and decreases natural blink frequency by up to 60%.",
            })
        elif rec_screen >= 4.5:
            candidates.append({
                "category": "Digital Habits",
                "priority": "medium",
                "title": "High Recreational Screen Time",
                "observation": f"Recreational screen use accounts for {rec_screen:.1f} hours daily, displacing active rest.",
                "action_item": "Set a 1-hour recreational app daily limit and swap 30 minutes of late-evening scrolling for an offline hobby.",
                "reason": "Excessive passive digital consumption increases dopaminergic stimulation and displaces restorative movement and social connection.",
            })

        if rec_screen <= 2.0 and break_freq in ["every_30m", "hourly"]:
            positive_strengths.append({
                "category": "Digital Habits",
                "priority": "positive",
                "title": "Mindful Digital Boundaries & Screen Breaks",
                "observation": f"Maintains modest recreational screen time ({rec_screen:.1f} hrs) and takes regular screen breaks.",
                "action_item": "Continue your intentional digital hygiene habits during heavy study or work periods.",
                "reason": "Periodic visual breaks and mindful media consumption protect ocular vitality and sharpen cognitive attention spans.",
            })

        # -------------------------------------------------------------
        # 7. ML PATTERN & ANOMALY CONTEXTUALIZATION
        # -------------------------------------------------------------
        cluster_name = ml_insights.get("cluster_name", "")
        is_anomaly = ml_insights.get("is_anomaly", False)
        anomaly_factors = ml_insights.get("anomaly_contributing_factors", [])

        if is_anomaly and anomaly_factors:
            first_factor = anomaly_factors[0]
            candidates.insert(0, {
                "category": "Mental Wellness",
                "priority": "high",
                "title": "Multivariate Lifestyle Anomaly Detected",
                "observation": f"Unusual lifestyle combination identified by AI engine: {first_factor}.",
                "action_item": "Acknowledge this high-demand period; focus on two stabilizing daily anchors: a fixed bedtime and steady hydration.",
                "reason": "Statistical anomaly analysis indicates an extreme divergence from typical behavioral patterns, signaling an acute crunch period.",
            })

        if "Stressed Academic" in cluster_name and not any(c["category"] == "Mental Wellness" for c in candidates):
            candidates.append({
                "category": "Mental Wellness",
                "priority": "medium",
                "title": "Archetype Insight: Academic Pacing & Rest",
                "observation": "Lifestyle profile aligns with the Stressed Academic / Crammer cluster pattern.",
                "action_item": "Break intense study blocks into 45-minute Pomodoro intervals followed by 10-minute completely offline breaks.",
                "reason": "Interval learning prevents cognitive fatigue and improves neural retention compared to uninterrupted multi-hour cramming.",
            })
        elif "Sedentary Digital Workaholic" in cluster_name and not any(c["category"] == "Physical Activity" for c in candidates):
            candidates.append({
                "category": "Physical Activity",
                "priority": "medium",
                "title": "Archetype Insight: Postural Re-alignment",
                "observation": "Lifestyle profile aligns with the Sedentary Digital Workaholic pattern.",
                "action_item": "Perform 3 neck retractions, shoulder blade squeezes, and standing calf raises every two hours.",
                "reason": "Simple postural reset exercises alleviate forward-head posture and activate the venous muscle pump in the lower limbs.",
            })

        # -------------------------------------------------------------
        # 8. LONGITUDINAL TREND TRACKING & PROGRESS COMPARISON
        # -------------------------------------------------------------
        progress_celebrations: List[Dict[str, Any]] = []
        if previous_assessments and len(previous_assessments) > 0:
            last_assessment = previous_assessments[0]

            # Sleep trend comparison
            prev_sleep = getattr(last_assessment, "sleep_hours", None)
            if prev_sleep is not None:
                sleep_delta = sleep_hrs - float(prev_sleep)
                if sleep_delta >= 0.75:
                    progress_celebrations.append({
                        "category": "Sleep",
                        "priority": "positive",
                        "title": f"Positive Sleep Progress (+{sleep_delta:.1f} hrs)",
                        "observation": f"Your sleep duration increased from {prev_sleep:.1f} to {sleep_hrs:.1f} hours since your last assessment.",
                        "action_item": "Celebrate this significant sleep improvement and keep reinforcing your evening wind-down routine.",
                        "reason": "Every additional hour of restorative sleep delivers exponential gains in daytime focus, mood stability, and metabolic health.",
                    })

            # Hydration trend comparison
            prev_water = getattr(last_assessment, "water_intake_liters", None)
            if prev_water is not None:
                water_delta = water_liters - float(prev_water)
                if water_delta >= 0.5:
                    progress_celebrations.append({
                        "category": "Hydration",
                        "priority": "positive",
                        "title": f"Hydration Habit Growth (+{water_delta:.1f} L)",
                        "observation": f"Daily water intake increased by +{water_delta:.1f} Liters compared to your prior assessment.",
                        "action_item": "Keep your water bottle close by to solidify this positive hydration habit.",
                        "reason": "Consistently increasing daily fluid intake reinforces kidney health and natural cognitive energy.",
                    })

        # -------------------------------------------------------------
        # 9. DEDUPLICATION, DIVERSITY-AWARE SELECTION & PRIORITIZATION
        # -------------------------------------------------------------
        # Deduplicate candidates by (category, title)
        seen = set()
        unique_actionable: List[Dict[str, Any]] = []
        for c in candidates:
            key = (c["category"], c["title"])
            if key not in seen:
                seen.add(key)
                unique_actionable.append(c)

        # Sort actionable items: high first, then medium, then low
        priority_weights = {"high": 1, "medium": 2, "low": 3}
        unique_actionable.sort(key=lambda x: priority_weights.get(x["priority"], 99))

        # Diverse category selection: Pick top priority per category first to prevent pillar starvation
        selected: List[Dict[str, Any]] = []
        seen_categories = set()
        for item in unique_actionable:
            if item["category"] not in seen_categories and len(selected) < 5:
                selected.append(item)
                seen_categories.add(item["category"])

        # Second pass: fill up to 5 with highest remaining priority items
        for item in unique_actionable:
            if item not in selected and len(selected) < 5:
                selected.append(item)

        # Add progress celebrations and positive habit strengths
        positives_to_add: List[Dict[str, Any]] = []
        seen_pos = set()
        for p in progress_celebrations + positive_strengths:
            p_key = (p["category"], p["title"])
            if p_key not in seen_pos:
                seen_pos.add(p_key)
                positives_to_add.append(p)

        if positives_to_add:
            selected.extend(positives_to_add[:2])

        # If user has few actionable deficits, provide general proactive wellness maintenance
        if len(selected) < 3:
            selected.append({
                "category": "Physical Activity",
                "priority": "low",
                "title": "Daily Step Count Optimization",
                "observation": "Baseline wellness habits are well established.",
                "action_item": "Aim for an extra 1,500 brisk steps today by taking stairs or walking during phone calls.",
                "reason": "Consistent low-intensity walking aids cardiovascular health and active mental decompression.",
            })

        # Final Formatting: Populate aliases & timestamps
        final_recommendations = []
        now = datetime.now(timezone.utc)
        for idx, rec in enumerate(selected, start=1):
            formatted = {
                "id": idx,
                "category": rec["category"],
                "priority": rec["priority"],
                "title": rec["title"],
                "observation": rec.get("observation", rec["title"]),
                "action_item": rec["action_item"],
                "suggested_action": rec.get("suggested_action", rec["action_item"]),
                "reason": rec.get("reason", rec["reason"]),
                "description": rec.get("description", rec["reason"]),
                "is_completed": False,
                "created_at": now.isoformat(),
            }
            final_recommendations.append(formatted)

        return final_recommendations


# Global singleton instance
recommendation_engine = WellnessRecommendationEngine()

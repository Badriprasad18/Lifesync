/**
 * LifeSync AI - Calibrated Demonstration & Fallback Datasets
 * Provides verified baseline metrics for immediate UI rendering and prototype testing.
 */
import {
  DashboardSummary,
  AssessmentDetail,
  Recommendation,
  RecommendationSummary,
} from '../types';

export const DEMO_DASHBOARD_SUMMARY: DashboardSummary = {
  total_assessments: 5,
  latest_score: {
    id: 101,
    assessment_id: 1,
    composite_lwi: 78.5,
    risk_tier: 'Optimal',
    pillars: {
      sleep: 80.0,
      physical_activity: 72.5,
      nutrition_hydration: 82.0,
      mental_wellbeing: 68.0,
      digital_hygiene: 74.0,
      habits: 85.0,
    },
    deductions: [
      '-10 pts: High recreational screen exposure',
      '-8 pts: Sub-optimal daily hydration timing',
    ],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  latest_cluster: 'Balanced High-Achiever',
  latest_anomaly: false,
  is_latest_anomaly: false,
  pending_actions_count: 3,
  pending_recommendations_count: 3,
  user_name: 'Aditya Sharma',
};

export const DEMO_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 1,
    category: 'Sleep',
    priority: 'high',
    title: 'Anchor Circadian Sleep Opportunity Window',
    observation: 'Average sleep duration is 6.5 hours with high bedtime fluctuation across weekends.',
    action_item: 'Set a non-negotiable bedtime tonight at 10:45 PM and prioritize a 7.5-hour sleep opportunity window.',
    reason: 'Regular circadian anchors synchronize morning cortisol surges with evening melatonin onset, optimizing memory consolidation.',
    suggested_action: 'Set a non-negotiable bedtime tonight at 10:45 PM and prioritize a 7.5-hour sleep opportunity window.',
    description: 'Regular circadian anchors synchronize morning cortisol surges with evening melatonin onset, optimizing memory consolidation.',
    is_completed: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    category: 'Digital Habits',
    priority: 'medium',
    title: 'Adopt the 20-20-20 Visual Rest Guideline',
    observation: 'Total daily screen exposure averages 9.5 hours with infrequent visual resets.',
    action_item: 'Every 20 minutes of continuous screen work, look at an object 20 feet away for 20 seconds.',
    reason: 'Brief visual focal shifts relax ciliary eye muscles, relieve digital asthenopia, and reduce ocular fatigue.',
    suggested_action: 'Every 20 minutes of continuous screen work, look at an object 20 feet away for 20 seconds.',
    description: 'Brief visual focal shifts relax ciliary eye muscles, relieve digital asthenopia, and reduce ocular fatigue.',
    is_completed: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    category: 'Physical Activity',
    priority: 'medium',
    title: 'Hourly Movement Interval Pacing',
    observation: 'Seated desk study time exceeds 8.5 hours daily without micro-movement breaks.',
    action_item: 'Stand up and complete 3 minutes of brisk walking or hip flexor stretches after every 50 minutes of studying.',
    reason: 'Periodic standing resets postural alignment, stimulates venous muscle pumps, and prevents lower back stiffness.',
    suggested_action: 'Stand up and complete 3 minutes of brisk walking or hip flexor stretches after every 50 minutes of studying.',
    description: 'Periodic standing resets postural alignment, stimulates venous muscle pumps, and prevents lower back stiffness.',
    is_completed: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    category: 'Hydration',
    priority: 'positive',
    title: 'Optimal Daily Hydration Routine',
    observation: 'Daily water intake consistently reaches 2.6 Liters with regular morning hydration.',
    action_item: 'Maintain this high-standard hydration pacing as a cornerstone of your daily routine.',
    reason: 'Optimal cellular fluid levels protect renal filtration and sustain daytime cognitive vigilance.',
    suggested_action: 'Maintain this high-standard hydration pacing as a cornerstone of your daily routine.',
    description: 'Optimal cellular fluid levels protect renal filtration and sustain daytime cognitive vigilance.',
    is_completed: false,
    created_at: new Date().toISOString(),
  },
];

export const DEMO_RECOMMENDATION_SUMMARY: RecommendationSummary = {
  total_active: 3,
  completed_count: 1,
  pending_count: 2,
  positive_habits_count: 1,
  by_category: {
    Sleep: 1,
    'Digital Habits': 1,
    'Physical Activity': 1,
    Hydration: 1,
  },
  by_priority: {
    high: 1,
    medium: 2,
    positive: 1,
  },
  positive_strengths: [DEMO_RECOMMENDATIONS[3]],
  actionable_recommendations: DEMO_RECOMMENDATIONS.slice(0, 3),
};

export const DEMO_HISTORICAL_TRENDS = [
  { assessment_id: 1, assessed_at: 'Week 1', score: 62.0, sleep: 58.0, activity: 50.0, hydration: 65.0, nutrition: 60.0, mental: 55.0, digital: 58.0 },
  { assessment_id: 2, assessed_at: 'Week 2', score: 67.5, sleep: 65.0, activity: 60.0, hydration: 72.0, nutrition: 68.0, mental: 60.0, digital: 64.0 },
  { assessment_id: 3, assessed_at: 'Week 3', score: 71.0, sleep: 70.0, activity: 65.0, hydration: 78.0, nutrition: 72.0, mental: 62.0, digital: 69.0 },
  { assessment_id: 4, assessed_at: 'Week 4', score: 75.0, sleep: 75.0, activity: 70.0, hydration: 80.0, nutrition: 75.0, mental: 66.0, digital: 72.0 },
  { assessment_id: 5, assessed_at: 'Current', score: 78.5, sleep: 80.0, activity: 72.5, hydration: 82.0, nutrition: 78.0, mental: 68.0, digital: 74.0 },
];

export const DEMO_PCA_CLUSTERS = [
  { id: 0, name: 'Balanced High-Achiever', x: 3.795, y: 0.667, color: '#10b981', desc: 'Active, high sleep consistency, and low stress' },
  { id: 1, name: 'Sedentary Digital Workaholic', x: -1.51, y: 0.226, color: '#f59e0b', desc: 'Heavy daily screens, long sitting, and moderate fatigue' },
  { id: 2, name: 'Stressed Academic / Crammer', x: -4.766, y: 0.807, color: '#ef4444', desc: 'Sleep deprivation, high stress, and irregular meals' },
  { id: 3, name: 'Low-Activity Casual', x: 0.539, y: -1.314, color: '#6366f1', desc: 'Moderate rest but baseline physical activity deficits' },
];

export const DEMO_ASSESSMENT_DETAIL: AssessmentDetail = {
  id: 1,
  user_id: 1,
  assessed_at: new Date().toISOString(),
  inputs: {
    sleep_hours: 7.5,
    sleep_quality: 4,
    sleep_consistency: 4,
    exercise_minutes: 35,
    activity_frequency_days: 3,
    sitting_hours: 7.5,
    water_intake_liters: 2.4,
    meals_regularity: 2,
    fruit_veg_servings: 3,
    stress_level: 4,
    work_life_balance: 3,
    recreational_screen_hours: 2.5,
    work_screen_hours: 6.0,
    screen_break_frequency: 'hourly',
  },
  scores: {
    id: 1,
    assessment_id: 1,
    composite_lwi: 78.5,
    risk_tier: 'Optimal',
    pillars: {
      sleep: 80.0,
      physical_activity: 72.5,
      nutrition_hydration: 82.0,
      mental_wellbeing: 68.0,
      digital_hygiene: 74.0,
      habits: 85.0,
    },
    deductions: ['-10 pts: High recreational screen time', '-5 pts: Sitting exceeds 7 hours'],
    created_at: new Date().toISOString(),
  },
  ml_insights: {
    id: 1,
    assessment_id: 1,
    cluster_id: 0,
    cluster_name: 'Balanced High-Achiever',
    cluster_description: 'Harmonious balance across physical activity, consistent sleep, and low stress.',
    distance_to_center: 0.84,
    pca_coordinates: { x: 2.85, y: 0.42 },
    is_anomaly: false,
    anomaly_score: 0.18,
    anomaly_contributing_factors: [],
  },
  recommendations: DEMO_RECOMMENDATIONS,
};

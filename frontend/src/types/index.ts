/** Core LifeSync AI Type Definitions */

export interface HealthCheckResponse {
  status: string;
  project: string;
  version: string;
  timestamp: string;
  environment: string;
  cors_origins: string[];
  modules: Record<string, string>;
}

export interface UserProfile {
  id: number;
  user_id: number;
  full_name: string;
  age: number;
  gender: string;
  height_cm?: number;
  weight_kg?: number;
  occupation?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
  profile?: UserProfile;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AssessmentFormData {
  // 1. Sleep
  sleep_hours: number;
  sleep_consistency: number;
  sleep_quality: number;
  wake_freshness: number;

  // 2. Physical Activity
  exercise_minutes: number;
  activity_frequency_days: number;
  step_count: number;
  sitting_hours: number;

  // 3. Hydration
  water_intake_liters: number;
  hydration_habit: string;

  // 4. Nutrition
  meals_regularity: number;
  fruit_veg_servings: number;
  junk_food_freq: number;

  // 5. Mental Wellness
  stress_level: number;
  mindfulness_minutes: number;
  work_life_balance: number;

  // 6. Digital Habits
  recreational_screen_hours: number;
  work_screen_hours: number;
  screen_break_frequency: string;
  screen_before_bed: boolean;

  // General Habits
  caffeine_cups: number;
  smoking_status: string;
  alcohol_freq: string;
  notes?: string;
}

export interface WellnessScore {
  id: number;
  assessment_id: number;
  composite_lwi: number;
  risk_tier: 'Optimal' | 'Fair' | 'Elevated Risk' | 'Critical Alert';
  pillars: {
    sleep: number;
    physical_activity: number;
    nutrition_hydration: number;
    mental_wellbeing: number;
    digital_hygiene: number;
    habits: number;
  };
  deductions: string[];
  created_at: string;
}

export interface MLInsights {
  id: number;
  assessment_id: number;
  cluster_id: number;
  cluster_name: string;
  cluster_description?: string;
  distance_to_center: number;
  pca_coordinates: { x: number; y: number };
  is_anomaly: boolean;
  anomaly_score: number;
  anomaly_contributing_factors: string[];
}

export interface Recommendation {
  id: number;
  category: string;
  priority: 'high' | 'medium' | 'low' | 'positive';
  title: string;
  observation?: string;
  description: string;
  reason?: string;
  action_item: string;
  suggested_action?: string;
  is_completed: boolean;
  created_at?: string;
}

export interface RecommendationSummary {
  total_active: number;
  completed_count: number;
  pending_count: number;
  positive_habits_count: number;
  by_category: Record<string, number>;
  by_priority: Record<string, number>;
  positive_strengths: Recommendation[];
  actionable_recommendations: Recommendation[];
}

export interface AssessmentDetail {
  id: number;
  user_id: number;
  assessed_at: string;
  inputs: Record<string, any>;
  scores: WellnessScore;
  ml_insights: MLInsights;
  recommendations: Recommendation[];
}

export interface AssessmentSummary {
  id: number;
  assessed_at: string;
  composite_lwi: number;
  risk_tier: string;
  cluster_name: string;
  is_anomaly: boolean;
}

export interface DashboardSummary {
  total_assessments: number;
  latest_assessment_id?: number;
  latest_lwi?: number;
  latest_risk_tier?: string;
  latest_cluster?: string;
  is_latest_anomaly: boolean;
  best_pillar?: string;
  lowest_pillar?: string;
  pending_actions_count: number;
  user_name: string;
  latest_score?: WellnessScore;
  latest_anomaly?: boolean;
  pending_recommendations_count?: number;
}

export interface TrendDataPoint {
  assessment_id: number;
  date: string;
  lwi: number;
  sleep: number;
  activity: number;
  nutrition: number;
  stress: number;
  screen: number;
  habits: number;
}

export interface DashboardTrends {
  timeline: TrendDataPoint[];
  average_lwi: number;
  highest_lwi: number;
  lowest_lwi: number;
  total_points: number;
}

export interface ClusterBenchmark {
  cluster_id: number;
  cluster_name: string;
  description: string;
  population_share: string;
  centroid: {
    pca_x: number;
    pca_y: number;
    sleep_hours: number;
    exercise_minutes: number;
    stress_level: number;
    screen_hours: number;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
  isError?: boolean;
  engine?: string;
}

export interface ChatResponse {
  reply: string;
  suggestions: string[];
  context_used: boolean;
  engine: string;
}

export interface ChatFaq {
  category: string;
  question: string;
  answer: string;
}

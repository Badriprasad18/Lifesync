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
  email: string;
  full_name: string;
  age: number;
  gender: string;
}

export interface AssessmentScores {
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
}

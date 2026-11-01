"""Pydantic Schemas for Dashboard Analytics and Longitudinal Trends."""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    total_assessments: int
    latest_assessment_id: Optional[int]
    latest_lwi: Optional[float]
    latest_risk_tier: Optional[str]
    latest_cluster: Optional[str]
    is_latest_anomaly: bool
    best_pillar: Optional[str]
    lowest_pillar: Optional[str]
    pending_actions_count: int
    user_name: str


class TrendDataPoint(BaseModel):
    assessment_id: int
    date: str
    lwi: float
    sleep: float
    activity: float
    nutrition: float
    stress: float
    screen: float
    habits: float


class DashboardTrendsResponse(BaseModel):
    timeline: List[TrendDataPoint]
    average_lwi: float
    highest_lwi: float
    lowest_lwi: float
    total_points: int

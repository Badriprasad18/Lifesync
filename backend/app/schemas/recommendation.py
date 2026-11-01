"""LifeSync AI - Wellness Recommendation Schemas."""
from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator


class RecommendationItemResponse(BaseModel):
    """Personalized lifestyle recommendation schema."""
    id: int
    assessment_id: Optional[int] = None
    category: str = Field(..., description="Lifestyle category: Sleep, Physical Activity, Hydration, Nutrition, Mental Wellness, Digital Habits")
    priority: str = Field(..., description="Priority tier: high, medium, low, positive")
    title: str = Field(..., description="Identified observation headline")
    observation: Optional[str] = Field(None, description="Detailed observation")
    action_item: str = Field(..., description="Suggested action item")
    suggested_action: Optional[str] = Field(None, description="Alternative alias for action item")
    description: str = Field(..., description="Physiological/behavioral reason")
    reason: Optional[str] = Field(None, description="Alternative alias for reason")
    is_completed: bool = False
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="after")
    def populate_aliases(self) -> "RecommendationItemResponse":
        """Ensure observation, suggested_action, and reason match title, action_item, and description."""
        if not self.observation:
            self.observation = self.title
        if not self.suggested_action:
            self.suggested_action = self.action_item
        if not self.reason:
            self.reason = self.description
        return self


class RecommendationToggleResponse(BaseModel):
    """Response returned when marking a recommendation completed/pending."""
    id: int
    is_completed: bool
    message: str


class RecommendationSummaryResponse(BaseModel):
    """Aggregated recommendations summary for the user dashboard."""
    total_active: int
    completed_count: int
    pending_count: int
    positive_habits_count: int
    by_category: Dict[str, int]
    by_priority: Dict[str, int]
    positive_strengths: List[RecommendationItemResponse]
    actionable_recommendations: List[RecommendationItemResponse]

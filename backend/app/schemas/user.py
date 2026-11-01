"""Pydantic Schemas for Authentication and User Profiles."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserProfileBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, examples=["Alex Mercer"])
    age: int = Field(..., ge=10, le=120, examples=[22])
    gender: str = Field(..., examples=["male", "female", "other", "prefer_not_to_say"])
    height_cm: Optional[float] = Field(None, ge=50, le=250, examples=[175.0])
    weight_kg: Optional[float] = Field(None, ge=20, le=300, examples=[68.5])
    occupation: Optional[str] = Field(None, max_length=100, examples=["MCA Student"])


class UserRegisterRequest(UserProfileBase):
    email: EmailStr = Field(..., examples=["student@college.edu"])
    password: str = Field(..., min_length=6, max_length=100, examples=["SecurePass123!"])


class UserLoginRequest(BaseModel):
    email: EmailStr = Field(..., examples=["student@college.edu"])
    password: str = Field(..., min_length=1, examples=["SecurePass123!"])


class UserProfileResponse(UserProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserResponse(BaseModel):
    id: int
    email: str
    is_active: bool
    created_at: datetime
    profile: Optional[UserProfileResponse] = None

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

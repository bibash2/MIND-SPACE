from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# ─── User Models ────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ─── Journal Models ──────────────────────────────────────────────────────────

class JournalEntryCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    mood_label: Optional[str] = None  # user-provided mood tag


class SentimentResult(BaseModel):
    polarity_score: float          # -1.0 to +1.0
    label: str                     # Positive / Neutral / Negative
    confidence: float              # 0.0 to 1.0
    vader_compound: float
    emotions: dict                 # breakdown if available


class JournalEntryResponse(BaseModel):
    id: str
    user_id: str
    title: str
    content: str
    mood_label: Optional[str]
    sentiment: SentimentResult
    word_count: int
    created_at: datetime
    updated_at: datetime


class JournalEntryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    mood_label: Optional[str] = None


# ─── Analytics Models ────────────────────────────────────────────────────────

class MoodDataPoint(BaseModel):
    date: str
    polarity_score: float
    label: str
    entry_count: int


class AnalyticsSummary(BaseModel):
    total_entries: int
    avg_polarity: float
    most_common_mood: str
    streak_days: int
    weekly_data: List[MoodDataPoint]
    monthly_data: List[MoodDataPoint]
    mood_distribution: dict

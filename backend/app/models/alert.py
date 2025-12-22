"""
Alert models for weather alerts and notifications.
"""
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class AlertType(str, Enum):
    """Types of weather alerts."""
    HEATWAVE = "HEATWAVE"
    HEAVY_RAIN = "HEAVY_RAIN"
    STORM = "STORM"
    COLD_WAVE = "COLD_WAVE"
    HIGH_HUMIDITY = "HIGH_HUMIDITY"


class Severity(str, Enum):
    """Alert severity levels."""
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    SEVERE = "SEVERE"


class Alert(BaseModel):
    """Weather alert model."""
    id: str = Field(..., description="Unique alert identifier")
    type: AlertType
    severity: Severity
    title: str = Field(..., description="Alert title")
    message: str = Field(..., description="Detailed alert message")
    recommendations: list[str] = Field(default_factory=list)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.now)
    acknowledged: bool = False


class AlertCheckRequest(BaseModel):
    """Request model for checking alerts."""
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    user_type: str = Field(..., description="STUDENT, FARMER, or TRAVELLER")
    custom_thresholds: Optional[dict] = None


class AlertCheckResponse(BaseModel):
    """Response model for alert checking."""
    alerts: list[Alert]
    risk_score: float = Field(..., ge=0, le=100)
    risk_level: str


class AlertHistoryResponse(BaseModel):
    """Response model for alert history."""
    alerts: list[Alert]

"""
User preference models.
"""
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class UserType(str, Enum):
    """User types for personalized alerts."""
    STUDENT = "STUDENT"
    FARMER = "FARMER"
    TRAVELLER = "TRAVELLER"
    DELIVERY_WORKER = "DELIVERY_WORKER"
    GENERAL = "GENERAL"


class CustomThresholds(BaseModel):
    """Custom alert thresholds."""
    heatwave_temp: float = Field(default=35.0, description="Heatwave temperature threshold in Celsius")
    heavy_rain_amount: float = Field(default=50.0, description="Heavy rain threshold in mm")
    high_wind_speed: float = Field(default=60.0, description="High wind speed threshold in km/h")
    cold_wave_temp: float = Field(default=5.0, description="Cold wave temperature threshold in Celsius")
    high_humidity: float = Field(default=85.0, description="High humidity threshold percentage")


class UserPreferences(BaseModel):
    """User preferences for weather alerts."""
    user_id: str
    user_type: UserType
    custom_thresholds: CustomThresholds = Field(default_factory=CustomThresholds)
    notification_enabled: bool = True
    temperature_unit: str = Field(default="celsius", description="celsius or fahrenheit")


class PreferencesResponse(BaseModel):
    """Response for saving preferences."""
    success: bool
    message: str

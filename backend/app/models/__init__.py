"""Data models for the Weather Alert System."""

from .weather import (
    WeatherData,
    CurrentWeather,
    DailyForecast,
    HourlyForecast,
    Location,
)
from .alert import Alert, AlertType, Severity
from .user import UserPreferences, UserType, CustomThresholds

__all__ = [
    "WeatherData",
    "CurrentWeather",
    "DailyForecast",
    "HourlyForecast",
    "Location",
    "Alert",
    "AlertType",
    "Severity",
    "UserPreferences",
    "UserType",
    "CustomThresholds",
]

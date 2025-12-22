"""
Weather data models using Pydantic for validation and serialization.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class Location(BaseModel):
    """Geographic location information."""
    city: str
    country: str
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)


class CurrentWeather(BaseModel):
    """Current weather conditions."""
    temperature: float = Field(..., description="Temperature in Celsius")
    feels_like: float = Field(..., description="Feels like temperature in Celsius")
    humidity: int = Field(..., ge=0, le=100, description="Humidity percentage")
    pressure: int = Field(..., description="Atmospheric pressure in hPa")
    wind_speed: float = Field(..., ge=0, description="Wind speed in km/h")
    wind_direction: int = Field(..., ge=0, le=360, description="Wind direction in degrees")
    visibility: float = Field(..., ge=0, description="Visibility in km")
    condition: str = Field(..., description="Weather condition description")
    icon: str = Field(..., description="Weather icon code")
    sunrise: int = Field(..., description="Sunrise time (Unix timestamp)")
    sunset: int = Field(..., description="Sunset time (Unix timestamp)")
    timestamp: datetime = Field(default_factory=datetime.now)



class WeatherData(BaseModel):
    """Complete weather data response."""
    location: Location
    current: CurrentWeather
    risk_score: float = Field(..., ge=0, le=100)
    risk_level: str = Field(..., description="LOW, MODERATE, MEDIUM, HIGH, or SEVERE")


class DailyForecast(BaseModel):
    """Daily weather forecast."""
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    temp_max: float = Field(..., description="Maximum temperature in Celsius")
    temp_min: float = Field(..., description="Minimum temperature in Celsius")
    condition: str = Field(..., description="Weather condition")
    icon: str = Field(..., description="Weather icon code")
    precipitation: float = Field(..., ge=0, description="Precipitation in mm")
    rain_chance: int = Field(..., ge=0, le=100, description="Chance of rain percentage")
    humidity: int = Field(..., ge=0, le=100)
    wind_speed: float = Field(..., ge=0, description="Wind speed in km/h")


class HourlyForecast(BaseModel):
    """Hourly weather forecast."""
    timestamp: datetime
    temperature: float = Field(..., description="Temperature in Celsius")
    feels_like: float = Field(..., description="Feels like temperature")
    condition: str
    icon: str
    precipitation: float = Field(..., ge=0, description="Precipitation in mm")
    humidity: int = Field(..., ge=0, le=100)
    wind_speed: float = Field(..., ge=0, description="Wind speed in km/h")


class DailyForecastResponse(BaseModel):
    """Response for daily forecast endpoint."""
    location: Location
    forecast: list[DailyForecast]


class HourlyForecastResponse(BaseModel):
    """Response for hourly forecast endpoint."""
    location: Location
    forecast: list[HourlyForecast]

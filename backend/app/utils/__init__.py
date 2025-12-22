"""
Utility helper functions.
"""
from datetime import datetime


def kelvin_to_celsius(kelvin: float) -> float:
    """Convert Kelvin to Celsius."""
    return kelvin - 273.15


def celsius_to_fahrenheit(celsius: float) -> float:
    """Convert Celsius to Fahrenheit."""
    return (celsius * 9/5) + 32


def mps_to_kmph(mps: float) -> float:
    """Convert meters per second to kilometers per hour."""
    return mps * 3.6


def format_timestamp(dt: datetime) -> str:
    """Format datetime to ISO string."""
    return dt.isoformat()


def get_weather_icon_url(icon_code: str) -> str:
    """Get OpenWeatherMap icon URL."""
    return f"https://openweathermap.org/img/wn/{icon_code}@2x.png"

"""
Weather API endpoints.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.models.weather import WeatherData, DailyForecastResponse, HourlyForecastResponse
from app.services.weather_service import WeatherService

router = APIRouter(prefix="/api/weather", tags=["weather"])
weather_service = WeatherService()


@router.get("/current", response_model=WeatherData)
async def get_current_weather(
    lat: Optional[float] = Query(None, ge=-90, le=90, description="Latitude"),
    lon: Optional[float] = Query(None, ge=-180, le=180, description="Longitude"),
    city: Optional[str] = Query(None, description="City name")
):
    """
    Get current weather by coordinates or city name.
    
    Either provide (lat, lon) or city parameter.
    """
    if city:
        try:
            return await weather_service.get_current_weather(city=city)
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"City not found: {str(e)}")
    elif lat is not None and lon is not None:
        try:
            return await weather_service.get_current_weather(lat=lat, lon=lon)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch weather data: {str(e)}")
    else:
        raise HTTPException(
            status_code=400,
            detail="Either provide (lat, lon) or city parameter"
        )


@router.get("/forecast/daily", response_model=DailyForecastResponse)
async def get_daily_forecast(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
    days: int = Query(7, ge=1, le=7, description="Number of days")
):
    """
    Get daily weather forecast for specified location.
    
    Returns up to 7 days of forecast data.
    """
    try:
        return await weather_service.get_daily_forecast(lat=lat, lon=lon, days=days)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch forecast: {str(e)}")


@router.get("/forecast/hourly", response_model=HourlyForecastResponse)
async def get_hourly_forecast(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
    hours: int = Query(24, ge=3, le=120, description="Number of hours")
):
    """
    Get hourly weather forecast for specified location.
    
    Returns hourly forecast data (3-hour intervals).
    """
    try:
        return await weather_service.get_hourly_forecast(lat=lat, lon=lon, hours=hours)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch forecast: {str(e)}")

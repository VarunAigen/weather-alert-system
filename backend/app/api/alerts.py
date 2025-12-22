"""
Alert API endpoints.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.models.alert import (
    AlertCheckRequest,
    AlertCheckResponse,
    Alert,
    AlertHistoryResponse
)
from app.models.user import CustomThresholds
from app.services.weather_service import WeatherService
from app.services.alert_engine import AlertEngine
from app.services.risk_calculator import RiskCalculator

router = APIRouter(prefix="/api/alerts", tags=["alerts"])
weather_service = WeatherService()
alert_engine = AlertEngine()
risk_calculator = RiskCalculator()

# In-memory alert history (in production, use a database)
alert_history: List[Alert] = []


@router.post("/check", response_model=AlertCheckResponse)
async def check_alerts(request: AlertCheckRequest):
    """
    Check for weather alerts based on current conditions and forecast.
    
    Analyzes weather data and generates personalized alerts based on user type
    and custom thresholds.
    """
    try:
        # Get current weather
        current_weather = await weather_service.get_current_weather(
            lat=request.lat,
            lon=request.lon
        )
        
        # Get hourly forecast
        hourly_forecast = await weather_service.get_hourly_forecast(
            lat=request.lat,
            lon=request.lon,
            hours=24
        )
        
        # Parse custom thresholds
        custom_thresholds = None
        if request.custom_thresholds:
            custom_thresholds = CustomThresholds(**request.custom_thresholds)
        
        # Check for alerts
        alerts = alert_engine.check_alerts(
            hourly_forecast=hourly_forecast.forecast,
            current_temp=current_weather.current.temperature,
            current_humidity=current_weather.current.humidity,
            current_wind=current_weather.current.wind_speed,
            user_type=request.user_type,
            custom_thresholds=custom_thresholds
        )
        
        # Store alerts in history
        alert_history.extend(alerts)
        
        # Keep only last 100 alerts
        if len(alert_history) > 100:
            alert_history[:] = alert_history[-100:]
        
        return AlertCheckResponse(
            alerts=alerts,
            risk_score=current_weather.risk_score,
            risk_level=current_weather.risk_level
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check alerts: {str(e)}")


@router.get("/history", response_model=AlertHistoryResponse)
async def get_alert_history(
    limit: int = Query(20, ge=1, le=100, description="Number of alerts to return")
):
    """
    Get alert history.
    
    Returns the most recent alerts.
    """
    return AlertHistoryResponse(
        alerts=alert_history[-limit:][::-1]  # Most recent first
    )


@router.post("/dismiss/{alert_id}")
async def dismiss_alert(alert_id: str):
    """
    Dismiss/acknowledge an alert.
    
    Marks the alert as acknowledged in the history.
    """
    for alert in alert_history:
        if alert.id == alert_id:
            alert.acknowledged = True
            return {"success": True, "message": "Alert dismissed"}
    
    raise HTTPException(status_code=404, detail="Alert not found")

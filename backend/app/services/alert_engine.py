"""
Alert engine for generating intelligent weather alerts.
"""
from datetime import datetime, timedelta
from typing import List, Optional, Dict
import uuid
from app.models.alert import Alert, AlertType, Severity
from app.models.user import UserType, CustomThresholds
from app.models.weather import HourlyForecast
from app.services.risk_calculator import RiskCalculator


class AlertEngine:
    """Generate and personalize weather alerts based on conditions."""
    
    def __init__(self):
        self.risk_calculator = RiskCalculator()
    
    def check_alerts(
        self,
        hourly_forecast: List[HourlyForecast],
        current_temp: float,
        current_humidity: float,
        current_wind: float,
        user_type: str,
        custom_thresholds: Optional[CustomThresholds] = None
    ) -> List[Alert]:
        """
        Check for weather alerts based on forecast and current conditions.
        
        Args:
            hourly_forecast: List of hourly forecasts
            current_temp: Current temperature
            current_humidity: Current humidity
            current_wind: Current wind speed
            user_type: User type (STUDENT, FARMER, TRAVELLER)
            custom_thresholds: Custom alert thresholds
            
        Returns:
            List of alerts
        """
        alerts = []
        thresholds = custom_thresholds or CustomThresholds()
        
        # Check for heatwave
        heatwave_alert = self._check_heatwave(hourly_forecast, thresholds.heatwave_temp)
        if heatwave_alert:
            alerts.append(heatwave_alert)
        
        # Check for heavy rain
        heavy_rain_alert = self._check_heavy_rain(hourly_forecast, thresholds.heavy_rain_amount)
        if heavy_rain_alert:
            alerts.append(heavy_rain_alert)
        
        # Check for storm/high wind
        storm_alert = self._check_storm(hourly_forecast, current_wind, thresholds.high_wind_speed)
        if storm_alert:
            alerts.append(storm_alert)
        
        # Check for cold wave
        cold_wave_alert = self._check_cold_wave(hourly_forecast, thresholds.cold_wave_temp)
        if cold_wave_alert:
            alerts.append(cold_wave_alert)
        
        # Check for high humidity
        humidity_alert = self._check_high_humidity(
            current_temp,
            current_humidity,
            thresholds.high_humidity
        )
        if humidity_alert:
            alerts.append(humidity_alert)
        
        # Personalize alerts based on user type
        personalized_alerts = self._personalize_alerts(alerts, user_type)
        
        # Sort by severity
        return self._prioritize_alerts(personalized_alerts)
    
    def _check_heatwave(self, forecast: List[HourlyForecast], threshold: float) -> Optional[Alert]:
        """Check for heatwave conditions."""
        high_temp_hours = []
        
        for item in forecast[:24]:  # Check next 24 hours
            if item.temperature > threshold:
                # Only consider daytime hours (10 AM - 6 PM)
                hour = item.timestamp.hour
                if 10 <= hour <= 18:
                    high_temp_hours.append(item)
        
        if len(high_temp_hours) >= 3:
            max_temp = max(item.temperature for item in high_temp_hours)
            severity = self._get_heatwave_severity(max_temp)
            
            return Alert(
                id=f"alert_{uuid.uuid4().hex[:8]}",
                type=AlertType.HEATWAVE,
                severity=severity,
                title="Heatwave Alert",
                message=f"Temperature expected to reach {max_temp:.1f}°C for {len(high_temp_hours)} hours",
                recommendations=[
                    "Avoid outdoor activities during peak hours (12 PM - 4 PM)",
                    "Stay hydrated and drink plenty of water",
                    "Use sunscreen and wear protective clothing",
                    "Check on elderly and vulnerable individuals"
                ],
                start_time=high_temp_hours[0].timestamp,
                end_time=high_temp_hours[-1].timestamp
            )
        
        return None
    
    def _check_heavy_rain(self, forecast: List[HourlyForecast], threshold: float) -> Optional[Alert]:
        """Check for heavy rain conditions."""
        total_precipitation = sum(item.precipitation for item in forecast[:8])  # Next 24 hours
        max_intensity = max(item.precipitation for item in forecast[:8])
        
        if total_precipitation > threshold or max_intensity > 10:
            severity = self._get_rain_severity(total_precipitation)
            
            rainy_periods = [item for item in forecast[:8] if item.precipitation > 0]
            
            return Alert(
                id=f"alert_{uuid.uuid4().hex[:8]}",
                type=AlertType.HEAVY_RAIN,
                severity=severity,
                title="Heavy Rain Alert",
                message=f"Expected rainfall: {total_precipitation:.1f}mm in next 24 hours",
                recommendations=[
                    "Carry an umbrella or raincoat",
                    "Allow extra time for commute",
                    "Avoid flood-prone areas",
                    "Check weather updates regularly"
                ],
                start_time=rainy_periods[0].timestamp if rainy_periods else None,
                end_time=rainy_periods[-1].timestamp if rainy_periods else None
            )
        
        return None
    
    def _check_storm(
        self,
        forecast: List[HourlyForecast],
        current_wind: float,
        threshold: float
    ) -> Optional[Alert]:
        """Check for storm/high wind conditions."""
        high_wind_periods = []
        
        # Check current wind
        if current_wind > threshold:
            high_wind_periods.append(("current", current_wind))
        
        # Check forecast
        for item in forecast[:8]:
            if item.wind_speed > threshold:
                high_wind_periods.append((item.timestamp, item.wind_speed))
        
        if high_wind_periods:
            max_wind = max(wind for _, wind in high_wind_periods)
            severity = self._get_wind_severity(max_wind)
            
            return Alert(
                id=f"alert_{uuid.uuid4().hex[:8]}",
                type=AlertType.STORM,
                severity=severity,
                title="High Wind / Storm Alert",
                message=f"Wind speeds expected to reach {max_wind:.1f} km/h",
                recommendations=[
                    "Stay indoors if possible",
                    "Secure loose objects outdoors",
                    "Avoid areas with trees and power lines",
                    "Postpone outdoor activities"
                ],
                start_time=datetime.now() if high_wind_periods else None
            )
        
        return None
    
    def _check_cold_wave(self, forecast: List[HourlyForecast], threshold: float) -> Optional[Alert]:
        """Check for cold wave conditions."""
        cold_hours = [item for item in forecast[:24] if item.temperature < threshold]
        
        # Reduced to 3 hours for demo (was 6)
        if len(cold_hours) >= 3:
            min_temp = min(item.temperature for item in cold_hours)
            severity = self._get_cold_severity(min_temp)
            
            return Alert(
                id=f"alert_{uuid.uuid4().hex[:8]}",
                type=AlertType.COLD_WAVE,
                severity=severity,
                title="Cold Wave Alert",
                message=f"Temperature expected to drop to {min_temp:.1f}°C for {len(cold_hours)} hours",
                recommendations=[
                    "Wear warm clothing in layers",
                    "Protect exposed skin",
                    "Check heating systems",
                    "Be aware of frost and ice"
                ],
                start_time=cold_hours[0].timestamp,
                end_time=cold_hours[-1].timestamp
            )
        
        return None
    
    def _check_high_humidity(
        self,
        temperature: float,
        humidity: float,
        threshold: float
    ) -> Optional[Alert]:
        """Check for high humidity with high temperature."""
        # Removed temp requirement for demo - humidity alone triggers alert
        if humidity > threshold:
            # Calculate heat index
            heat_index = temperature + (humidity - 60) * 0.1
            
            return Alert(
                id=f"alert_{uuid.uuid4().hex[:8]}",
                type=AlertType.HIGH_HUMIDITY,
                severity=Severity.MODERATE,
                title="High Humidity Alert",
                message=f"Humidity at {humidity:.0f}% with temperature {temperature:.1f}°C",
                recommendations=[
                    "Stay in air-conditioned spaces",
                    "Drink plenty of fluids",
                    "Limit strenuous outdoor activities",
                    "Watch for signs of heat exhaustion"
                ],
                start_time=datetime.now()
            )
        
        return None
    
    def _personalize_alerts(self, alerts: List[Alert], user_type: str) -> List[Alert]:
        """Add user-specific recommendations to alerts."""
        user_recommendations = {
            UserType.STUDENT: {
                AlertType.HEATWAVE: ["Plan indoor study sessions", "Carry water bottle to school"],
                AlertType.HEAVY_RAIN: ["Allow extra time for commute", "Keep books and electronics protected"],
                AlertType.STORM: ["Stay in school building if weather worsens", "Inform parents about weather"],
                AlertType.HIGH_HUMIDITY: ["Stay in air-conditioned classrooms", "Carry extra water to school"],
            },
            UserType.FARMER: {
                AlertType.HEATWAVE: ["Work during early morning or late evening", "Ensure worker hydration"],
                AlertType.HEAVY_RAIN: ["Protect crops and equipment", "Check drainage systems", "Delay harvesting"],
                AlertType.STORM: ["Secure farm equipment", "Protect livestock", "Check barn structures"],
                AlertType.COLD_WAVE: ["Protect sensitive crops", "Ensure livestock shelter", "Check irrigation systems"],
                AlertType.HIGH_HUMIDITY: ["Monitor crop health for fungal diseases", "Ensure proper ventilation in storage"],
            },
            UserType.TRAVELLER: {
                AlertType.HEATWAVE: ["Plan indoor activities", "Carry sufficient water", "Avoid peak sun hours"],
                AlertType.HEAVY_RAIN: ["Check road conditions", "Avoid flood-prone routes", "Have alternate plans"],
                AlertType.STORM: ["Postpone travel if possible", "Seek shelter", "Avoid coastal areas"],
                AlertType.HIGH_HUMIDITY: ["Plan indoor sightseeing", "Stay hydrated during outdoor activities"],
            },
            UserType.DELIVERY_WORKER: {
                AlertType.HEATWAVE: ["Schedule deliveries for cooler hours", "Keep vehicle AC functional"],
                AlertType.HEAVY_RAIN: ["Use waterproof packaging", "Plan safer routes"],
                AlertType.STORM: ["Delay deliveries if unsafe", "Stay in touch with dispatch"],
                AlertType.HIGH_HUMIDITY: ["Take frequent breaks in AC", "Keep extra water in vehicle"],
            },
            UserType.GENERAL: {
                AlertType.HEATWAVE: ["Stay indoors during peak hours", "Drink plenty of water"],
                AlertType.HEAVY_RAIN: ["Carry umbrella", "Avoid unnecessary travel"],
                AlertType.STORM: ["Stay indoors", "Secure outdoor items"],
                AlertType.COLD_WAVE: ["Wear warm clothing", "Keep heating systems ready"],
                AlertType.HIGH_HUMIDITY: ["Use air conditioning if available", "Stay hydrated"],
            }
        }
        
        try:
            user_type_enum = UserType(user_type)
            
            for alert in alerts:
                if user_type_enum in user_recommendations:
                    if alert.type in user_recommendations[user_type_enum]:
                        # Add user-specific recommendations
                        alert.recommendations.extend(
                            user_recommendations[user_type_enum][alert.type]
                        )
        except ValueError:
            # Invalid user type, skip personalization
            pass
        
        return alerts
    
    def _prioritize_alerts(self, alerts: List[Alert]) -> List[Alert]:
        """Sort alerts by severity."""
        severity_order = {
            Severity.SEVERE: 4,
            Severity.HIGH: 3,
            Severity.MODERATE: 2,
            Severity.LOW: 1
        }
        
        return sorted(
            alerts,
            key=lambda a: severity_order.get(a.severity, 0),
            reverse=True
        )
    
    def _get_heatwave_severity(self, temp: float) -> Severity:
        """Determine heatwave severity based on temperature."""
        if temp > 42:
            return Severity.SEVERE
        elif temp > 38:
            return Severity.HIGH
        else:
            return Severity.MODERATE
    
    def _get_rain_severity(self, precipitation: float) -> Severity:
        """Determine rain severity based on precipitation amount."""
        if precipitation > 150:
            return Severity.SEVERE
        elif precipitation > 100:
            return Severity.HIGH
        else:
            return Severity.MODERATE
    
    def _get_wind_severity(self, wind_speed: float) -> Severity:
        """Determine wind severity based on wind speed."""
        if wind_speed > 100:
            return Severity.SEVERE
        elif wind_speed > 80:
            return Severity.HIGH
        else:
            return Severity.MODERATE
    
    def _get_cold_severity(self, temp: float) -> Severity:
        """Determine cold wave severity based on temperature."""
        if temp < -5:
            return Severity.SEVERE
        elif temp < 0:
            return Severity.HIGH
        else:
            return Severity.MODERATE

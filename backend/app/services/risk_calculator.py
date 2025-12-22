"""
Risk score calculation service.
"""
from typing import Dict


class RiskCalculator:
    """Calculate weather risk scores based on multiple factors."""
    
    @staticmethod
    def calculate_risk_score(
        temperature: float,
        precipitation: float,
        wind_speed: float,
        humidity: float,
        visibility: float
    ) -> float:
        """
        Calculate overall risk score (0-100%) based on weather conditions.
        
        Args:
            temperature: Temperature in Celsius
            precipitation: Precipitation in mm
            wind_speed: Wind speed in km/h
            humidity: Humidity percentage
            visibility: Visibility in km
            
        Returns:
            Risk score between 0 and 100
        """
        temp_risk = RiskCalculator.calculate_temperature_risk(temperature)
        precip_risk = RiskCalculator.calculate_precipitation_risk(precipitation)
        wind_risk = RiskCalculator.calculate_wind_risk(wind_speed)
        humidity_risk = RiskCalculator.calculate_humidity_risk(humidity, temperature)
        visibility_risk = RiskCalculator.calculate_visibility_risk(visibility)
        
        # Weighted combination
        risk_score = (
            temp_risk * 0.30 +
            precip_risk * 0.25 +
            wind_risk * 0.25 +
            humidity_risk * 0.10 +
            visibility_risk * 0.10
        )
        
        return min(100.0, max(0.0, risk_score))
    
    @staticmethod
    def calculate_temperature_risk(temp: float) -> float:
        """
        Calculate risk based on temperature.
        Comfortable range: 15-25°C (risk = 0)
        
        Args:
            temp: Temperature in Celsius
            
        Returns:
            Risk score 0-100
        """
        if 15 <= temp <= 25:
            return 0.0
        elif temp > 25:
            # Heat risk: increases with temperature
            return min(100.0, ((temp - 25) / 20) * 100)
        else:
            # Cold risk: increases as temperature drops
            return min(100.0, ((15 - temp) / 20) * 100)
    
    @staticmethod
    def calculate_precipitation_risk(precip_mm: float) -> float:
        """
        Calculate risk based on precipitation.
        0mm = 0%, 100mm+ = 100%
        
        Args:
            precip_mm: Precipitation in mm
            
        Returns:
            Risk score 0-100
        """
        return min(100.0, (precip_mm / 100) * 100)
    
    @staticmethod
    def calculate_wind_risk(wind_speed_kmh: float) -> float:
        """
        Calculate risk based on wind speed.
        0-30 km/h: Low risk
        30-60 km/h: Moderate risk
        60+ km/h: High risk
        
        Args:
            wind_speed_kmh: Wind speed in km/h
            
        Returns:
            Risk score 0-100
        """
        if wind_speed_kmh < 30:
            return (wind_speed_kmh / 30) * 30
        elif wind_speed_kmh < 60:
            return 30 + ((wind_speed_kmh - 30) / 30) * 40
        else:
            return min(100.0, 70 + ((wind_speed_kmh - 60) / 40) * 30)
    
    @staticmethod
    def calculate_humidity_risk(humidity: float, temp: float) -> float:
        """
        Calculate risk based on humidity combined with temperature.
        High humidity is risky when combined with high temperature.
        
        Args:
            humidity: Humidity percentage
            temp: Temperature in Celsius
            
        Returns:
            Risk score 0-100
        """
        if temp < 25 or humidity < 60:
            return 0.0
        
        # Risk increases with humidity above 60% when temp > 25°C
        return min(100.0, ((humidity - 60) / 40) * 100)
    
    @staticmethod
    def calculate_visibility_risk(visibility_km: float) -> float:
        """
        Calculate risk based on visibility.
        10km+: No risk
        < 1km: High risk
        
        Args:
            visibility_km: Visibility in km
            
        Returns:
            Risk score 0-100
        """
        if visibility_km >= 10:
            return 0.0
        return min(100.0, ((10 - visibility_km) / 10) * 100)
    
    @staticmethod
    def get_risk_level(score: float) -> str:
        """
        Get risk level category based on score.
        
        Args:
            score: Risk score 0-100
            
        Returns:
            Risk level: LOW, MODERATE, MEDIUM, HIGH, or SEVERE
        """
        if score <= 20:
            return "LOW"
        elif score <= 40:
            return "MODERATE"
        elif score <= 60:
            return "MEDIUM"
        elif score <= 80:
            return "HIGH"
        else:
            return "SEVERE"

"""
Weather service for fetching and normalizing weather data from OpenWeatherMap API.
"""
import httpx
from datetime import datetime, timedelta
from typing import Optional, List
from app.config import get_settings
from app.models.weather import (
    WeatherData,
    CurrentWeather,
    Location,
    DailyForecast,
    HourlyForecast,
    DailyForecastResponse,
    HourlyForecastResponse,
)
from app.services.cache_service import cache
from app.services.risk_calculator import RiskCalculator


class WeatherService:
    """Service for fetching weather data from OpenWeatherMap."""
    
    def __init__(self):
        self.settings = get_settings()
        self.base_url = self.settings.openweather_base_url
        self.api_key = self.settings.openweather_api_key
        self.risk_calculator = RiskCalculator()
    
    async def get_current_weather(
        self,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        city: Optional[str] = None
    ) -> WeatherData:
        """
        Get current weather data by coordinates or city name.
        
        Args:
            lat: Latitude
            lon: Longitude
            city: City name
            
        Returns:
            WeatherData object
        """
        # Generate cache key
        if city:
            cache_key = f"current_weather_city_{city}"
        else:
            cache_key = f"current_weather_{lat}_{lon}"
        
        # Check cache
        cached_data = cache.get(cache_key)
        if cached_data:
            return WeatherData(**cached_data)
        
        # Build query parameters
        params = {"appid": self.api_key, "units": "metric"}
        
        if city:
            params["q"] = city
        else:
            params["lat"] = lat
            params["lon"] = lon
        
        # Fetch from API
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/weather", params=params)
                response.raise_for_status()
                data = response.json()
                
                # If fetched by coordinates, try to get more precise location name via Reverse Geocoding
                if not city and lat is not None and lon is not None:
                    try:
                        precise_name = await self._get_location_name(lat, lon)
                        if precise_name:
                            data["name"] = precise_name
                    except Exception as e:
                        print(f"Failed to get precise location name: {e}")
                        
        except httpx.HTTPStatusError as e:
            print(f"HTTP error fetching current weather: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            print(f"Error fetching current weather: {str(e)}")
            raise
        
        # Normalize data
        weather_data = self._normalize_current_weather(data)
        
        # Cache the result
        cache.set(cache_key, weather_data.model_dump(), ttl=self.settings.cache_ttl_current)
        
        return weather_data

    async def _get_location_name(self, lat: float, lon: float) -> Optional[str]:
        """
        Get precise location name using Reverse Geocoding API.
        """
        try:
            url = "http://api.openweathermap.org/geo/1.0/reverse"
            params = {
                "lat": lat,
                "lon": lon,
                "limit": 1,
                "appid": self.api_key
            }
            
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    if data and len(data) > 0:
                        # Return the local name if available, otherwise name
                        return data[0].get("name")
            return None
        except Exception as e:
            print(f"Error in reverse geocoding: {e}")
            return None
    
    async def get_daily_forecast(
        self,
        lat: float,
        lon: float,
        days: int = 7
    ) -> DailyForecastResponse:
        """
        Get daily weather forecast.
        
        Args:
            lat: Latitude
            lon: Longitude
            days: Number of days (default: 7)
            
        Returns:
            DailyForecastResponse object
        """
        cache_key = f"daily_forecast_{lat}_{lon}_{days}"
        
        # Check cache
        cached_data = cache.get(cache_key)
        if cached_data:
            return DailyForecastResponse(**cached_data)
        
        # Fetch from API (using One Call API 3.0 or forecast endpoint)
        params = {
            "lat": lat,
            "lon": lon,
            "appid": self.api_key,
            "units": "metric",
            "cnt": days * 8  # 8 forecasts per day (3-hour intervals)
        }
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/forecast", params=params)
                response.raise_for_status()
                data = response.json()
        except httpx.HTTPStatusError as e:
            print(f"HTTP error fetching daily forecast: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            print(f"Error fetching daily forecast: {str(e)}")
            raise
        
        # Normalize data
        try:
            forecast_data = self._normalize_daily_forecast(data, days)
        except Exception as e:
            print(f"Error normalizing daily forecast: {str(e)}")
            print(f"Raw data keys: {data.keys() if isinstance(data, dict) else 'not a dict'}")
            raise
        
        # Cache the result
        cache.set(cache_key, forecast_data.model_dump(), ttl=self.settings.cache_ttl_forecast)
        
        return forecast_data
    
    async def get_hourly_forecast(
        self,
        lat: float,
        lon: float,
        hours: int = 24
    ) -> HourlyForecastResponse:
        """
        Get hourly weather forecast.
        
        Args:
            lat: Latitude
            lon: Longitude
            hours: Number of hours (default: 24)
            
        Returns:
            HourlyForecastResponse object
        """
        cache_key = f"hourly_forecast_{lat}_{lon}_{hours}"
        
        # Check cache
        cached_data = cache.get(cache_key)
        if cached_data:
            return HourlyForecastResponse(**cached_data)
        
        # Fetch from API
        params = {
            "lat": lat,
            "lon": lon,
            "appid": self.api_key,
            "units": "metric",
            "cnt": min(hours // 3, 40)  # Max 40 items (5 days)
        }
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/forecast", params=params)
                response.raise_for_status()
                data = response.json()
        except httpx.HTTPStatusError as e:
            print(f"HTTP error fetching hourly forecast: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            print(f"Error fetching hourly forecast: {str(e)}")
            raise
        
        # Normalize data
        try:
            forecast_data = self._normalize_hourly_forecast(data, hours)
        except Exception as e:
            print(f"Error normalizing hourly forecast: {str(e)}")
            print(f"Raw data keys: {data.keys() if isinstance(data, dict) else 'not a dict'}")
            raise
        
        # Cache the result
        cache.set(cache_key, forecast_data.model_dump(), ttl=self.settings.cache_ttl_forecast)
        
        return forecast_data
    
    def _normalize_current_weather(self, data: dict) -> WeatherData:
        """Normalize OpenWeatherMap current weather response."""
        location = Location(
            city=data["name"],
            country=data["sys"]["country"],
            lat=data["coord"]["lat"],
            lon=data["coord"]["lon"]
        )
        
        current = CurrentWeather(
            temperature=data["main"]["temp"],
            feels_like=data["main"]["feels_like"],
            humidity=data["main"]["humidity"],
            pressure=data["main"]["pressure"],
            wind_speed=data["wind"]["speed"] * 3.6,  # Convert m/s to km/h
            wind_direction=data["wind"].get("deg", 0),
            visibility=data.get("visibility", 10000) / 1000,  # Convert m to km
            condition=data["weather"][0]["description"].title(),
            icon=data["weather"][0]["icon"],
            sunrise=data["sys"]["sunrise"],  # Unix timestamp
            sunset=data["sys"]["sunset"],    # Unix timestamp
            timestamp=datetime.now().isoformat()
        )
        
        # Calculate risk score
        risk_score = self.risk_calculator.calculate_risk_score(
            temperature=current.temperature,
            precipitation=0,  # Current weather doesn't include precipitation
            wind_speed=current.wind_speed,
            humidity=current.humidity,
            visibility=current.visibility
        )
        
        risk_level = self.risk_calculator.get_risk_level(risk_score)
        
        return WeatherData(
            location=location,
            current=current,
            risk_score=round(risk_score, 2),
            risk_level=risk_level
        )
    
    def _normalize_daily_forecast(self, data: dict, days: int) -> DailyForecastResponse:
        """Normalize OpenWeatherMap forecast response to daily format."""
        location = Location(
            city=data["city"]["name"],
            country=data["city"]["country"],
            lat=data["city"]["coord"]["lat"],
            lon=data["city"]["coord"]["lon"]
        )
        
        # Group forecasts by day
        daily_data = {}
        
        for item in data["list"][:days * 8]:
            date = datetime.fromtimestamp(item["dt"]).strftime("%Y-%m-%d")
            
            if date not in daily_data:
                daily_data[date] = {
                    "temps": [],
                    "conditions": [],
                    "icons": [],
                    "precipitation": 0,
                    "humidity": [],
                    "wind_speeds": []
                }
            
            daily_data[date]["temps"].append(item["main"]["temp"])
            daily_data[date]["conditions"].append(item["weather"][0]["description"])
            daily_data[date]["icons"].append(item["weather"][0]["icon"])
            daily_data[date]["precipitation"] += item.get("rain", {}).get("3h", 0)
            daily_data[date]["humidity"].append(item["main"]["humidity"])
            daily_data[date]["wind_speeds"].append(item["wind"]["speed"] * 3.6)
        
        # Create daily forecasts
        forecasts = []
        for date, day_data in list(daily_data.items())[:days]:
            forecasts.append(DailyForecast(
                date=date,
                temp_max=max(day_data["temps"]),
                temp_min=min(day_data["temps"]),
                condition=max(set(day_data["conditions"]), key=day_data["conditions"].count).title(),
                icon=max(set(day_data["icons"]), key=day_data["icons"].count),
                precipitation=round(day_data["precipitation"], 2),
                rain_chance=min(100, int(day_data["precipitation"] * 2)),  # Rough estimate
                humidity=int(sum(day_data["humidity"]) / len(day_data["humidity"])),
                wind_speed=round(sum(day_data["wind_speeds"]) / len(day_data["wind_speeds"]), 2)
            ))
        
        return DailyForecastResponse(location=location, forecast=forecasts)
    
    def _normalize_hourly_forecast(self, data: dict, hours: int) -> HourlyForecastResponse:
        """Normalize OpenWeatherMap forecast response to hourly format."""
        location = Location(
            city=data["city"]["name"],
            country=data["city"]["country"],
            lat=data["city"]["coord"]["lat"],
            lon=data["city"]["coord"]["lon"]
        )
        
        forecasts = []
        for item in data["list"][:hours // 3]:
            forecasts.append(HourlyForecast(
                timestamp=datetime.fromtimestamp(item["dt"]),
                temperature=item["main"]["temp"],
                feels_like=item["main"]["feels_like"],
                condition=item["weather"][0]["description"].title(),
                icon=item["weather"][0]["icon"],
                precipitation=item.get("rain", {}).get("3h", 0),
                humidity=item["main"]["humidity"],
                wind_speed=item["wind"]["speed"] * 3.6
            ))
        
        return HourlyForecastResponse(location=location, forecast=forecasts)

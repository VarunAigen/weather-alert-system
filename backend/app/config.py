"""
Configuration management for the Weather Alert System backend.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # OpenWeatherMap API
    openweather_api_key: str = "demo_key"
    openweather_base_url: str = "https://api.openweathermap.org/data/2.5"
    
    # Server configuration
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    
    # Cache TTL (Time To Live) in seconds
    cache_ttl_current: int = 300  # 5 minutes
    cache_ttl_forecast: int = 1800  # 30 minutes
    cache_ttl_city: int = 86400  # 24 hours
    
    # CORS settings
    cors_origins: list[str] = ["*"]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()

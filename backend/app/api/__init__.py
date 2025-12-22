"""API routes package."""

from .weather import router as weather_router
from .alerts import router as alerts_router
from .preferences import router as preferences_router

__all__ = [
    "weather_router",
    "alerts_router",
    "preferences_router",
]

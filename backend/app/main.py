"""
FastAPI application entry point for Weather Alert System.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.api import weather_router, alerts_router, preferences_router
from app.routers import disasters, users

# Get settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title="Weather Alert System API",
    description="Production-ready weather API with intelligent alerts and risk scoring",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(weather_router)
app.include_router(alerts_router)
app.include_router(preferences_router)
app.include_router(disasters.router)
app.include_router(users.router)


@app.get("/")
async def root():
    """Root endpoint - API information."""
    return {
        "name": "Weather Alert System API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "docs": "/docs",
            "weather": "/api/weather",
            "alerts": "/api/alerts",
            "preferences": "/api/preferences",
            "disasters": "/api/disasters",
            "users": "/api/users"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": "2025-12-17T21:59:54+05:30"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )

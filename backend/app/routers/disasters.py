"""
Disaster alerts API router.
Handles earthquake, tsunami, and global disaster alerts.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from app.services.earthquake_monitor import earthquake_monitor
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/disasters", tags=["disasters"])


@router.get("/earthquakes")
async def get_earthquakes(
    lat: float = Query(..., description="User latitude"),
    lon: float = Query(..., description="User longitude"),
    user_type: str = Query("GENERAL", description="User type for personalized messages"),
    max_distance: float = Query(1000, description="Maximum distance in km")
):
    """
    Get recent earthquakes near user location.
    
    Returns earthquakes from USGS that are:
    - Magnitude >= 4.0
    - Within last 24 hours
    - Within impact radius or max_distance
    
    Response includes:
    - Distance from user
    - Severity classification
    - Context-aware safety messages
    """
    try:
        alerts = await earthquake_monitor.get_earthquakes_near_location(
            user_lat=lat,
            user_lon=lon,
            user_type=user_type.upper(),
            max_distance_km=max_distance
        )
        
        return {
            "count": len(alerts),
            "alerts": alerts
        }
        
    except Exception as e:
        logger.error(f"Error fetching earthquakes: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch earthquake data: {str(e)}"
        )


@router.get("/earthquakes/global")
async def get_global_earthquakes(
    min_magnitude: float = Query(4.5, description="Minimum magnitude"),
    limit: int = Query(50, description="Maximum number of results")
):
    """
    Get recent significant earthquakes worldwide.
    
    Used for analytics and global disaster map.
    """
    try:
        earthquakes = await earthquake_monitor.fetch_earthquakes(
            min_magnitude=min_magnitude
        )
        
        # Limit results
        earthquakes = earthquakes[:limit]
        
        return {
            "count": len(earthquakes),
            "earthquakes": earthquakes
        }
        
    except Exception as e:
        logger.error(f"Error fetching global earthquakes: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch global earthquake data: {str(e)}"
        )


@router.get("/tsunamis")
async def get_tsunami_warnings(
    lat: float = Query(..., description="User latitude"),
    lon: float = Query(..., description="User longitude"),
    user_type: str = Query("GENERAL", description="User type for personalized messages"),
    max_distance: float = Query(1000, description="Maximum distance in km")
):
    """
    Get active tsunami warnings near user location.
    
    Returns tsunami warnings triggered by earthquakes with:
    - Magnitude >= 6.0
    - Tsunami flag set by USGS
    - Within impact radius
    
    Response includes:
    - Estimated wave arrival time
    - Evacuation instructions
    - Severity based on coastal proximity
    """
    try:
        from app.services.tsunami_monitor import tsunami_monitor
        
        alerts = await tsunami_monitor.get_tsunami_alerts_near_location(
            user_lat=lat,
            user_lon=lon,
            user_type=user_type.upper(),
            max_distance_km=max_distance
        )
        
        return {
            "count": len(alerts),
            "alerts": alerts
        }
        
    except Exception as e:
        logger.error(f"Error fetching tsunami warnings: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch tsunami warnings: {str(e)}"
        )


@router.get("/analytics/map")
async def get_global_disaster_map(
    min_magnitude: float = Query(4.5, description="Minimum earthquake magnitude"),
    limit: int = Query(100, description="Maximum events to return")
):
    """
    Get worldwide disaster events for analytics map visualization.
    
    Returns:
    - Recent earthquakes worldwide
    - Tsunami warnings
    - Event locations for map markers
    
    Used for global analytics dashboard.
    """
    try:
        from app.services.tsunami_monitor import tsunami_monitor
        
        # Fetch global earthquakes
        earthquakes = await earthquake_monitor.fetch_earthquakes(
            min_magnitude=min_magnitude
        )
        
        # Fetch tsunami events
        tsunami_events = await tsunami_monitor.fetch_tsunami_warnings()
        
        # Format for map visualization
        map_data = {
            "earthquakes": [
                {
                    "id": eq["id"],
                    "type": "earthquake",
                    "magnitude": eq["magnitude"],
                    "location": eq["place"],
                    "lat": eq["latitude"],
                    "lon": eq["longitude"],
                    "depth_km": eq["depth_km"],
                    "time": eq["time"],
                    "tsunami_potential": bool(eq.get("tsunami", 0)),
                    "url": eq["url"]
                }
                for eq in earthquakes[:limit]
            ],
            "tsunamis": [
                {
                    "id": event["id"],
                    "type": "tsunami",
                    "magnitude": event["magnitude"],
                    "location": event["location"],
                    "lat": event["latitude"],
                    "lon": event["longitude"],
                    "time": event["event_time"],
                    "url": event["source_url"]
                }
                for event in tsunami_events
            ],
            "summary": {
                "total_earthquakes": len(earthquakes),
                "total_tsunamis": len(tsunami_events),
                "max_magnitude": max([eq["magnitude"] for eq in earthquakes]) if earthquakes else 0,
                "last_updated": datetime.now().isoformat()
            }
        }
        
        return map_data
        
    except Exception as e:
        logger.error(f"Error fetching global disaster map: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch global disaster data: {str(e)}"
        )

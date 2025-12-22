"""
Tsunami Monitor Service
Monitors NOAA and other tsunami warning systems for active alerts.
"""
import httpx
from datetime import datetime, timedelta
from typing import List, Optional, Dict
import logging

logger = logging.getLogger(__name__)


class TsunamiMonitor:
    """Monitor tsunami warning systems and generate alerts."""
    
    # NOAA Tsunami Warning Centers
    NOAA_PACIFIC = "https://www.tsunami.gov/events/"
    
    # Alternative: Use GDACS for tsunami events
    GDACS_TSUNAMI = "https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventtype=TC,EQ,FL,VO,DR,WF&alertlevel=Orange;Red&country=&fromDate=&toDate=&limit=10&offset=0"
    
    def __init__(self):
        self.max_age_hours = 48  # Show tsunami warnings from last 48 hours
    
    async def fetch_tsunami_warnings(self) -> List[Dict]:
        """
        Fetch active tsunami warnings.
        
        Note: NOAA doesn't have a simple JSON API for tsunami warnings.
        For production, you would:
        1. Use NOAA's CAP (Common Alerting Protocol) feeds
        2. Parse RSS feeds from tsunami.gov
        3. Use GDACS API which includes tsunami events
        
        For this implementation, we'll use earthquake data with tsunami flag.
        """
        try:
            # Use USGS earthquakes with tsunami potential
            from app.services.earthquake_monitor import earthquake_monitor
            
            earthquakes = await earthquake_monitor.fetch_earthquakes(min_magnitude=6.0)
            
            tsunami_events = []
            for eq in earthquakes:
                # Check if earthquake has tsunami potential
                if eq.get("tsunami", 0) == 1:
                    tsunami_event = {
                        "id": f"tsunami_{eq['id']}",
                        "trigger_earthquake_id": eq["id"],
                        "magnitude": eq["magnitude"],
                        "location": eq["place"],
                        "latitude": eq["latitude"],
                        "longitude": eq["longitude"],
                        "depth_km": eq["depth_km"],
                        "event_time": eq["time"],
                        "tsunami_potential": True,
                        "source": "USGS",
                        "source_url": eq["url"]
                    }
                    tsunami_events.append(tsunami_event)
            
            logger.info(f"Found {len(tsunami_events)} potential tsunami events")
            return tsunami_events
            
        except Exception as e:
            logger.error(f"Error fetching tsunami warnings: {e}")
            return []
    
    def is_coastal_location(
        self,
        lat: float,
        lon: float,
        distance_to_coast_km: float = 100
    ) -> bool:
        """
        Check if location is coastal (simplified).
        
        In production, you would use a proper coastline database.
        For now, we'll assume all locations could be affected.
        """
        # Simplified: Consider all locations potentially affected
        # In production: Use coastline distance calculation
        return True
    
    def calculate_tsunami_severity(
        self,
        magnitude: float,
        distance_km: float,
        is_coastal: bool
    ) -> str:
        """
        Determine tsunami alert severity.
        
        Args:
            magnitude: Triggering earthquake magnitude
            distance_km: Distance from epicenter
            is_coastal: Whether user is in coastal area
            
        Returns:
            Severity: 'critical', 'warning', or 'info'
        """
        if not is_coastal:
            return "info"
        
        # Critical: Large earthquake, close to coast
        if magnitude >= 8.0 and distance_km < 500:
            return "critical"
        elif magnitude >= 7.5 and distance_km < 300:
            return "critical"
        
        # Warning: Moderate earthquake, medium distance
        elif magnitude >= 7.0 and distance_km < 800:
            return "warning"
        elif magnitude >= 6.5 and distance_km < 500:
            return "warning"
        
        # Info: Lower magnitude or farther away
        else:
            return "info"
    
    def generate_tsunami_message(
        self,
        magnitude: float,
        distance_km: float,
        location: str,
        user_type: str,
        severity: str,
        estimated_arrival_minutes: Optional[int] = None
    ) -> str:
        """
        Generate context-aware tsunami warning message.
        
        Args:
            magnitude: Earthquake magnitude
            distance_km: Distance from epicenter
            location: Earthquake location
            user_type: User type
            severity: Alert severity
            estimated_arrival_minutes: Time until tsunami arrival
            
        Returns:
            Personalized warning message
        """
        # Base message
        if estimated_arrival_minutes:
            base_msg = f"TSUNAMI WARNING: Magnitude {magnitude} earthquake near {location}. Tsunami waves may arrive in approximately {estimated_arrival_minutes} minutes."
        else:
            base_msg = f"TSUNAMI WARNING: Magnitude {magnitude} earthquake near {location} ({distance_km:.0f}km away). Tsunami waves possible."
        
        # Critical severity - immediate action required
        if severity == "critical":
            action = " EVACUATE IMMEDIATELY to higher ground (at least 30m above sea level or 3km inland). Do not wait for official evacuation orders."
        elif severity == "warning":
            action = " Move to higher ground as a precaution. Stay away from beaches and coastal areas. Monitor official channels."
        else:
            action = " Stay informed through official channels. Be prepared to evacuate if warning is upgraded."
        
        # User-specific advice
        user_advice = {
            "STUDENT": " If at school, follow evacuation procedures. Move to upper floors or inland immediately.",
            "FARMER": " Secure livestock and move to higher ground. Do not attempt to save equipment - prioritize safety.",
            "TRAVELLER": " Leave coastal hotels immediately. Head inland or to high ground. Do not use elevators.",
            "DELIVERY_WORKER": " Abandon deliveries. Drive inland immediately. Alert dispatch of your location.",
            "GENERAL": " Take tsunami warnings seriously. Move quickly but calmly to safety."
        }
        
        specific_advice = user_advice.get(user_type, user_advice["GENERAL"])
        
        return base_msg + action + specific_advice
    
    async def get_tsunami_alerts_near_location(
        self,
        user_lat: float,
        user_lon: float,
        user_type: str = "GENERAL",
        max_distance_km: float = 1000
    ) -> List[Dict]:
        """
        Get tsunami warnings relevant to user's location.
        
        Args:
            user_lat: User's latitude
            user_lon: User's longitude
            user_type: User type for personalized messages
            max_distance_km: Maximum distance to consider
            
        Returns:
            List of tsunami alerts
        """
        from app.services.earthquake_monitor import earthquake_monitor
        
        tsunami_events = await self.fetch_tsunami_warnings()
        alerts = []
        
        for event in tsunami_events:
            # Calculate distance
            distance = earthquake_monitor.calculate_distance(
                user_lat,
                user_lon,
                event["latitude"],
                event["longitude"]
            )
            
            # Check if within range
            if distance <= max_distance_km:
                # Check if coastal
                is_coastal = self.is_coastal_location(user_lat, user_lon)
                
                # Determine severity
                severity = self.calculate_tsunami_severity(
                    event["magnitude"],
                    distance,
                    is_coastal
                )
                
                # Estimate arrival time (rough calculation: ~800 km/h tsunami speed)
                tsunami_speed_kmh = 800
                estimated_arrival_minutes = int((distance / tsunami_speed_kmh) * 60)
                
                # Generate message
                user_message = self.generate_tsunami_message(
                    event["magnitude"],
                    distance,
                    event["location"],
                    user_type,
                    severity,
                    estimated_arrival_minutes if distance < 500 else None
                )
                
                # Create alert
                alert = {
                    "id": event["id"],
                    "type": "tsunami",
                    "severity": severity,
                    "title": f"Tsunami Warning - Magnitude {event['magnitude']} Earthquake",
                    "message": f"Tsunami possible from earthquake {distance:.0f}km away",
                    "user_message": user_message,
                    "location": {
                        "description": event["location"],
                        "lat": event["latitude"],
                        "lon": event["longitude"]
                    },
                    "distance_km": round(distance, 1),
                    "event_time": datetime.fromtimestamp(event["event_time"] / 1000).isoformat(),
                    "metadata": {
                        "trigger_magnitude": event["magnitude"],
                        "depth_km": event["depth_km"],
                        "estimated_arrival_minutes": estimated_arrival_minutes if distance < 500 else None,
                        "tsunami_speed_kmh": tsunami_speed_kmh,
                        "is_coastal_area": is_coastal
                    },
                    "source": event["source"],
                    "source_url": event["source_url"],
                    "user_type": user_type
                }
                
                alerts.append(alert)
        
        # Sort by severity (critical first) then distance
        severity_order = {"critical": 3, "warning": 2, "info": 1}
        alerts.sort(key=lambda x: (severity_order.get(x["severity"], 0), x["distance_km"]), reverse=True)
        
        return alerts


# Singleton instance
tsunami_monitor = TsunamiMonitor()

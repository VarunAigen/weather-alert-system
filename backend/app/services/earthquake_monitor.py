"""
Earthquake Monitor Service
Monitors USGS Earthquake API for recent seismic events and generates alerts.
"""
import httpx
from datetime import datetime, timedelta
from typing import List, Optional, Dict
from math import radians, cos, sin, asin, sqrt
import logging

logger = logging.getLogger(__name__)


class EarthquakeMonitor:
    """Monitor USGS earthquake feed and generate relevant alerts."""
    
    # USGS GeoJSON API endpoints
    USGS_SIGNIFICANT = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson"
    USGS_4_5_DAY = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson"
    USGS_ALL_DAY = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
    
    def __init__(self):
        self.min_magnitude = 4.0  # Minimum magnitude to alert
        self.max_age_hours = 24   # Only show events from last 24 hours
    
    async def fetch_earthquakes(
        self,
        min_magnitude: float = 4.5
    ) -> List[Dict]:
        """
        Fetch recent earthquakes from USGS.
        
        Args:
            min_magnitude: Minimum magnitude threshold
            
        Returns:
            List of earthquake events
        """
        try:
            # Use appropriate endpoint based on magnitude
            if min_magnitude >= 4.5:
                url = self.USGS_4_5_DAY
            else:
                url = self.USGS_ALL_DAY
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url)
                response.raise_for_status()
                
                data = response.json()
                earthquakes = []
                
                # Parse GeoJSON features
                for feature in data.get("features", []):
                    props = feature.get("properties", {})
                    geometry = feature.get("geometry", {})
                    coords = geometry.get("coordinates", [])
                    
                    if len(coords) >= 2:
                        earthquake = {
                            "id": feature.get("id"),
                            "magnitude": props.get("mag"),
                            "place": props.get("place"),
                            "time": props.get("time"),  # Unix timestamp in ms
                            "updated": props.get("updated"),
                            "longitude": coords[0],
                            "latitude": coords[1],
                            "depth_km": coords[2] if len(coords) > 2 else None,
                            "felt_reports": props.get("felt", 0),
                            "tsunami": props.get("tsunami", 0),
                            "url": props.get("url"),
                            "detail_url": props.get("detail"),
                            "type": props.get("type"),
                        }
                        
                        # Filter by magnitude and age
                        if self._is_relevant_earthquake(earthquake):
                            earthquakes.append(earthquake)
                
                logger.info(f"Fetched {len(earthquakes)} relevant earthquakes from USGS")
                return earthquakes
                
        except Exception as e:
            logger.error(f"Error fetching earthquakes: {e}")
            return []
    
    def _is_relevant_earthquake(self, earthquake: Dict) -> bool:
        """
        Check if earthquake is relevant for alerting.
        
        Criteria:
        - Magnitude >= minimum threshold
        - Occurred within last 24 hours
        - Type is 'earthquake' (not explosion, quarry blast, etc.)
        """
        # Check magnitude
        magnitude = earthquake.get("magnitude")
        if not magnitude or magnitude < self.min_magnitude:
            return False
        
        # Check age
        event_time_ms = earthquake.get("time")
        if event_time_ms:
            event_time = datetime.fromtimestamp(event_time_ms / 1000)
            age = datetime.now() - event_time
            if age > timedelta(hours=self.max_age_hours):
                return False
        
        # Check type
        event_type = earthquake.get("type", "").lower()
        if event_type != "earthquake":
            return False
        
        return True
    
    def calculate_distance(
        self,
        lat1: float,
        lon1: float,
        lat2: float,
        lon2: float
    ) -> float:
        """
        Calculate distance between two points using Haversine formula.
        
        Args:
            lat1, lon1: First point coordinates
            lat2, lon2: Second point coordinates
            
        Returns:
            Distance in kilometers
        """
        # Convert to radians
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        
        # Earth radius in kilometers
        r = 6371
        
        return c * r
    
    def get_impact_radius(self, magnitude: float) -> float:
        """
        Estimate impact radius based on earthquake magnitude.
        
        Args:
            magnitude: Earthquake magnitude
            
        Returns:
            Impact radius in kilometers
        """
        if magnitude >= 8.0:
            return 1000  # Catastrophic - global impact
        elif magnitude >= 7.0:
            return 500   # Major - regional impact
        elif magnitude >= 6.0:
            return 200   # Strong - local impact
        elif magnitude >= 5.0:
            return 100   # Moderate - nearby areas
        else:
            return 50    # Light - immediate vicinity
    
    def get_severity(
        self,
        magnitude: float,
        distance_km: float
    ) -> str:
        """
        Determine alert severity based on magnitude and distance.
        
        Args:
            magnitude: Earthquake magnitude
            distance_km: Distance from user location
            
        Returns:
            Severity level: 'critical', 'warning', or 'info'
        """
        impact_radius = self.get_impact_radius(magnitude)
        
        # Critical: High magnitude and close proximity
        if magnitude >= 7.0 and distance_km < 100:
            return "critical"
        elif magnitude >= 6.0 and distance_km < 50:
            return "critical"
        
        # Warning: Moderate magnitude or medium distance
        elif magnitude >= 6.5 and distance_km < 200:
            return "warning"
        elif magnitude >= 5.5 and distance_km < 100:
            return "warning"
        
        # Info: Lower magnitude or farther away
        elif distance_km < impact_radius:
            return "warning"
        else:
            return "info"
    
    def generate_user_message(
        self,
        magnitude: float,
        distance_km: float,
        place: str,
        user_type: str,
        severity: str
    ) -> str:
        """
        Generate context-aware message for user.
        
        Args:
            magnitude: Earthquake magnitude
            distance_km: Distance from user
            place: Earthquake location description
            user_type: User type (student, farmer, etc.)
            severity: Alert severity
            
        Returns:
            Personalized message
        """
        # Base message
        base_msg = f"Magnitude {magnitude} earthquake occurred {distance_km:.0f}km away near {place}."
        
        # User-specific advice
        user_advice = {
            "STUDENT": {
                "critical": " TAKE COVER NOW! Drop, Cover, and Hold On. Stay away from windows. Follow your school's earthquake drill procedures.",
                "warning": " Stay alert. If you feel shaking, drop under a desk and hold on. Inform teachers and stay calm.",
                "info": " Be aware of this seismic activity. Review earthquake safety procedures with your school."
            },
            "FARMER": {
                "critical": " Secure livestock immediately. Move away from structures and equipment. Check for gas leaks and structural damage after shaking stops.",
                "warning": " Monitor your animals for unusual behavior. Secure heavy equipment. Be prepared for aftershocks.",
                "info": " Check farm structures for any damage. Ensure water sources are not contaminated."
            },
            "TRAVELLER": {
                "critical": " Seek shelter immediately in a sturdy building. Stay away from coastal areas if near the ocean (tsunami risk). Do not use elevators.",
                "warning": " Avoid traveling to the affected area. Check with local authorities. Have an emergency plan ready.",
                "info": " Monitor local news for updates. Be aware of potential travel disruptions in the region."
            },
            "DELIVERY_WORKER": {
                "critical": " Stop your vehicle safely away from buildings, bridges, and power lines. Stay inside until shaking stops.",
                "warning": " Avoid routes near the affected area. Check road conditions before proceeding. Stay in communication with dispatch.",
                "info": " Be aware of potential road damage or closures in the affected region."
            },
            "GENERAL": {
                "critical": " DROP, COVER, and HOLD ON! Get under sturdy furniture. Stay away from windows and outside walls. Do not run outside.",
                "warning": " Be prepared for aftershocks. Have emergency supplies ready. Check on neighbors.",
                "info": " Stay informed through official channels. Review your emergency preparedness plan."
            }
        }
        
        advice = user_advice.get(user_type, user_advice["GENERAL"]).get(severity, "")
        
        return base_msg + advice
    
    async def get_earthquakes_near_location(
        self,
        user_lat: float,
        user_lon: float,
        user_type: str = "GENERAL",
        max_distance_km: float = 1000
    ) -> List[Dict]:
        """
        Get earthquakes relevant to user's location.
        
        Args:
            user_lat: User's latitude
            user_lon: User's longitude
            user_type: User type for personalized messages
            max_distance_km: Maximum distance to consider
            
        Returns:
            List of earthquake alerts with distance and severity
        """
        earthquakes = await self.fetch_earthquakes()
        relevant_alerts = []
        
        for eq in earthquakes:
            # Calculate distance
            distance = self.calculate_distance(
                user_lat,
                user_lon,
                eq["latitude"],
                eq["longitude"]
            )
            
            # Check if within impact radius
            impact_radius = self.get_impact_radius(eq["magnitude"])
            
            if distance <= max(impact_radius, max_distance_km):
                # Determine severity
                severity = self.get_severity(eq["magnitude"], distance)
                
                # Generate user message
                user_message = self.generate_user_message(
                    eq["magnitude"],
                    distance,
                    eq["place"],
                    user_type,
                    severity
                )
                
                # Create alert
                alert = {
                    "id": f"eq_{eq['id']}",
                    "type": "earthquake",
                    "severity": severity,
                    "title": f"Magnitude {eq['magnitude']} Earthquake",
                    "message": f"Earthquake detected {distance:.0f}km from your location",
                    "user_message": user_message,
                    "location": {
                        "description": eq["place"],
                        "lat": eq["latitude"],
                        "lon": eq["longitude"]
                    },
                    "distance_km": round(distance, 1),
                    "event_time": datetime.fromtimestamp(eq["time"] / 1000).isoformat(),
                    "metadata": {
                        "magnitude": eq["magnitude"],
                        "depth_km": eq["depth_km"],
                        "felt_reports": eq["felt_reports"],
                        "tsunami_potential": bool(eq["tsunami"])
                    },
                    "source": "USGS",
                    "source_url": eq["url"],
                    "user_type": user_type
                }
                
                relevant_alerts.append(alert)
        
        # Sort by distance (closest first)
        relevant_alerts.sort(key=lambda x: x["distance_km"])
        
        return relevant_alerts


# Singleton instance
earthquake_monitor = EarthquakeMonitor()

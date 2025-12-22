"""
Simple in-memory cache service for weather data.
"""
from typing import Any, Optional
from datetime import datetime, timedelta
import json


class CacheService:
    """In-memory cache with TTL support."""
    
    def __init__(self):
        self._cache: dict[str, tuple[Any, datetime]] = {}
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache if not expired.
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found/expired
        """
        if key not in self._cache:
            return None
        
        value, expiry = self._cache[key]
        
        if datetime.now() > expiry:
            # Expired, remove from cache
            del self._cache[key]
            return None
        
        return value
    
    def set(self, key: str, value: Any, ttl: int = 300) -> None:
        """
        Set value in cache with TTL.
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds (default: 5 minutes)
        """
        expiry = datetime.now() + timedelta(seconds=ttl)
        self._cache[key] = (value, expiry)
    
    def invalidate(self, key: str) -> None:
        """
        Remove key from cache.
        
        Args:
            key: Cache key to remove
        """
        if key in self._cache:
            del self._cache[key]
    
    def clear(self) -> None:
        """Clear all cache entries."""
        self._cache.clear()
    
    def get_stats(self) -> dict:
        """Get cache statistics."""
        total = len(self._cache)
        expired = sum(1 for _, expiry in self._cache.values() if datetime.now() > expiry)
        
        return {
            "total_entries": total,
            "expired_entries": expired,
            "active_entries": total - expired
        }


# Global cache instance
cache = CacheService()

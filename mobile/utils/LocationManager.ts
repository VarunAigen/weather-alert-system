/**
 * Location Manager
 * Manages saved locations with Firebase integration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseService, SavedLocation } from '../services/firebaseService';
import { authService } from '../services/authService';

// Base keys - will be prefixed with user ID
const LOCATIONS_KEY_BASE = '@weather_locations';
const CURRENT_LOCATION_KEY_BASE = '@current_location_id';

class LocationManager {
    /**
     * Get user-specific storage key for locations
     */
    private getLocationsKey(): string {
        const userId = authService.getUserId();
        return `${LOCATIONS_KEY_BASE}_${userId}`;
    }

    /**
     * Get user-specific storage key for current location
     */
    private getCurrentLocationKey(): string {
        const userId = authService.getUserId();
        return `${CURRENT_LOCATION_KEY_BASE}_${userId}`;
    }

    /**
     * Get all saved locations (Firebase + local cache)
     */
    async getLocations(): Promise<SavedLocation[]> {
        try {
            // Try Firebase first
            const firebaseLocations = await firebaseService.getLocations();

            if (firebaseLocations.length > 0) {
                // Cache locally
                await AsyncStorage.setItem(this.getLocationsKey(), JSON.stringify(firebaseLocations));
                return firebaseLocations;
            }

            // Fallback to local storage
            const cached = await AsyncStorage.getItem(this.getLocationsKey());
            return cached ? JSON.parse(cached) : [];
        } catch (error) {
            console.error('Error getting locations:', error);

            // Fallback to local storage on error
            try {
                const cached = await AsyncStorage.getItem(this.getLocationsKey());
                return cached ? JSON.parse(cached) : [];
            } catch {
                return [];
            }
        }
    }

    /**
     * Add a new location
     */
    async addLocation(location: Omit<SavedLocation, 'id' | 'addedAt'>): Promise<void> {
        try {
            // Add to Firebase
            await firebaseService.addLocation(location);

            // Update local cache
            const locations = await this.getLocations();
            const newLocation: SavedLocation = {
                ...location,
                id: `location_${Date.now()}`,
                addedAt: new Date(),
            };
            locations.push(newLocation);
            await AsyncStorage.setItem(this.getLocationsKey(), JSON.stringify(locations));
        } catch (error) {
            console.error('Error adding location:', error);
            throw error;
        }
    }

    /**
     * Delete a location
     */
    async deleteLocation(locationId: string): Promise<void> {
        try {
            // Delete from Firebase
            await firebaseService.deleteLocation(locationId);

            // Update local cache
            const locations = await this.getLocations();
            const filtered = locations.filter(loc => loc.id !== locationId);
            await AsyncStorage.setItem(this.getLocationsKey(), JSON.stringify(filtered));
        } catch (error) {
            console.error('Error deleting location:', error);
            throw error;
        }
    }

    /**
     * Set current selected location
     */
    async setCurrentLocation(locationId: string): Promise<void> {
        try {
            await AsyncStorage.setItem(this.getCurrentLocationKey(), locationId);
        } catch (error) {
            console.error('Error setting current location:', error);
        }
    }

    /**
     * Get current selected location ID
     */
    async getCurrentLocationId(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(this.getCurrentLocationKey());
        } catch (error) {
            console.error('Error getting current location:', error);
            return null;
        }
    }

    /**
     * Check if a location already exists
     */
    async locationExists(city: string, country: string): Promise<boolean> {
        const locations = await this.getLocations();
        return locations.some(
            loc => loc.city.toLowerCase() === city.toLowerCase() &&
                loc.country.toLowerCase() === country.toLowerCase()
        );
    }

    /**
     * Get GPS/current location
     */
    async getCurrentGPSLocation(): Promise<SavedLocation | null> {
        const locations = await this.getLocations();
        return locations.find(loc => loc.isCurrentLocation) || null;
    }

    /**
     * Clear all user-specific data (call on logout)
     */
    async clearUserData(): Promise<void> {
        try {
            await AsyncStorage.removeItem(this.getLocationsKey());
            await AsyncStorage.removeItem(this.getCurrentLocationKey());
        } catch (error) {
            console.error('Error clearing user data:', error);
        }
    }
}

export const locationManager = new LocationManager();

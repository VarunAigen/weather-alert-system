/**
 * Firebase Service for Location Management
 * Handles CRUD operations for saved locations in Firestore
 */

import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    query,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { authService } from './authService';

export interface SavedLocation {
    id: string;
    city: string;
    country: string;
    lat: number;
    lon: number;
    isCurrentLocation: boolean;
    addedAt: Date;
}

export interface UserPreferences {
    userType: 'farmer' | 'student' | 'traveler' | 'delivery_worker' | 'general';
    alertThresholds: {
        heatwave: number;
        heavyRain: number;
        storm: number;
        coldWave: number;
        highHumidity: number;
    };
    notifications: boolean;
    theme: 'light' | 'dark';
}

class FirebaseService {
    /**
     * Get current user ID from auth service
     */
    private getUserId(): string {
        return authService.getUserId();
    }

    /**
     * Get all saved locations for the user
     */
    async getLocations(): Promise<SavedLocation[]> {
        try {
            const locationsRef = collection(db, 'users', this.getUserId(), 'locations');
            const q = query(locationsRef, orderBy('addedAt', 'desc'));
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                addedAt: doc.data().addedAt.toDate(),
            })) as SavedLocation[];
        } catch (error) {
            console.error('Error fetching locations:', error);
            return [];
        }
    }

    /**
     * Add a new location
     */
    async addLocation(location: Omit<SavedLocation, 'id' | 'addedAt'>): Promise<void> {
        try {
            const locationId = `location_${Date.now()}`;
            const locationRef = doc(db, 'users', this.getUserId(), 'locations', locationId);

            await setDoc(locationRef, {
                ...location,
                addedAt: Timestamp.now(),
            });
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
            const locationRef = doc(db, 'users', this.getUserId(), 'locations', locationId);
            await deleteDoc(locationRef);
        } catch (error) {
            console.error('Error deleting location:', error);
            throw error;
        }
    }

    /**
     * Get user preferences
     */
    async getPreferences(): Promise<UserPreferences | null> {
        try {
            const prefRef = doc(db, 'users', this.getUserId(), 'preferences', 'main');
            const snapshot = await getDoc(prefRef);

            if (snapshot.exists()) {
                return snapshot.data() as UserPreferences;
            }
            return null;
        } catch (error) {
            console.error('Error fetching preferences:', error);
            return null;
        }
    }

    /**
     * Save user preferences
     */
    async savePreferences(preferences: UserPreferences): Promise<void> {
        try {
            const prefRef = doc(db, 'users', this.getUserId(), 'preferences', 'main');
            await setDoc(prefRef, preferences);
        } catch (error) {
            console.error('Error saving preferences:', error);
            throw error;
        }
    }

    /**
     * Save alert to history
     */
    async saveAlertHistory(alert: any): Promise<void> {
        try {
            const alertId = `alert_${Date.now()}`;
            const alertRef = doc(db, 'users', this.getUserId(), 'alertHistory', alertId);

            await setDoc(alertRef, {
                ...alert,
                timestamp: Timestamp.now(),
            });
        } catch (error) {
            console.error('Error saving alert history:', error);
            throw error;
        }
    }

    /**
     * Get alert history
     */
    async getAlertHistory(limit: number = 20): Promise<any[]> {
        try {
            const alertsRef = collection(db, 'users', this.getUserId(), 'alertHistory');
            const q = query(alertsRef, orderBy('timestamp', 'desc'));
            const snapshot = await getDocs(q);

            return snapshot.docs
                .slice(0, limit)
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp.toDate(),
                }));
        } catch (error) {
            console.error('Error fetching alert history:', error);
            return [];
        }
    }

    /**
     * Clean up old alert history (older than specified days)
     * @param daysToKeep Number of days to keep (default: 30)
     */
    async cleanupOldAlerts(daysToKeep: number = 1): Promise<number> {
        try {
            const alertsRef = collection(db, 'users', this.getUserId(), 'alertHistory');
            const snapshot = await getDocs(alertsRef);

            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
            const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

            let deletedCount = 0;
            const deletePromises: Promise<void>[] = [];

            snapshot.docs.forEach(doc => {
                const alertTimestamp = doc.data().timestamp;
                if (alertTimestamp && alertTimestamp < cutoffTimestamp) {
                    deletePromises.push(deleteDoc(doc.ref));
                    deletedCount++;
                }
            });

            await Promise.all(deletePromises);
            console.log(`🧹 Cleaned up ${deletedCount} old alerts (older than ${daysToKeep} days)`);

            return deletedCount;
        } catch (error) {
            console.error('Error cleaning up old alerts:', error);
            return 0;
        }
    }
}

export const firebaseService = new FirebaseService();

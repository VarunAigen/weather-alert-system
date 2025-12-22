import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert, UserPreferences } from '../types';
import { alertsApi, preferencesApi } from '../services/api';
import * as Notifications from 'expo-notifications';
import { useWeather } from './WeatherContext';
import { authService } from '../services/authService';
import { firebaseService } from '../services/firebaseService';

interface AlertContextType {
    activeAlerts: Alert[];
    alertHistory: Alert[];
    preferences: UserPreferences | null;
    loading: boolean;
    checkAlerts: () => Promise<void>;
    dismissAlert: (id: string) => Promise<void>;
    savePreferences: (prefs: UserPreferences) => Promise<void>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Configure notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export function AlertProvider({ children }: { children: React.ReactNode }) {
    const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
    const [alertHistory, setAlertHistory] = useState<Alert[]>([]);
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [loading, setLoading] = useState(false);
    const { weather, hourlyForecast, isGPSLocation } = useWeather();

    // Get actual user ID from auth service
    const getUserId = () => authService.getUserId();

    useEffect(() => {
        loadPreferences();
        loadHistory();

        // Clean up old alerts on startup
        cleanupOldAlerts();

        // Set up automatic cleanup every 24 hours
        const cleanupInterval = setInterval(() => {
            cleanupOldAlerts();
        }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

        return () => clearInterval(cleanupInterval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cleanupOldAlerts = async () => {
        try {
            const deletedCount = await firebaseService.cleanupOldAlerts(7); // Keep last 7 days
            if (deletedCount > 0) {
                console.log(`Automatically cleaned up ${deletedCount} old alerts`);
                // Refresh history after cleanup
                loadHistory();
            }
        } catch (error) {
            console.error('Failed to cleanup old alerts:', error);
        }
    };

    const loadPreferences = async () => {
        try {
            const prefs = await preferencesApi.getPreferences(getUserId());
            setPreferences(prefs);
        } catch (error) {
            console.error('Failed to load preferences:', error);
        }
    };

    const loadHistory = async () => {
        try {
            // Use Firebase for user-specific alert history
            const history = await firebaseService.getAlertHistory(20);
            setAlertHistory(history);
        } catch (error) {
            console.error('Failed to load alert history:', error);
        }
    };

    const checkAlerts = async () => {
        // DEMO MODE: Alerts work for all locations (GPS + saved cities)
        // Production: Uncomment line below to restrict to GPS only
        // if (!weather || !preferences || !isGPSLocation) return;
        if (!weather || !preferences) return;
        try {
            setLoading(true);
            const response = await alertsApi.checkAlerts({
                lat: weather.location.lat,
                lon: weather.location.lon,
                user_type: preferences.user_type,
                custom_thresholds: preferences.custom_thresholds,
            });

            if (response && response.alerts) {
                const newAlerts = response.alerts;
                setActiveAlerts(newAlerts);

                // Send notifications for new high severity alerts
                newAlerts.forEach(async (alert: Alert) => {
                    if (['HIGH', 'SEVERE'].includes(alert.severity) && preferences.notification_enabled) {
                        await Notifications.scheduleNotificationAsync({
                            content: {
                                title: `${alert.type.replace('_', ' ')} ALERT`,
                                body: alert.message,
                                data: { alertId: alert.id },
                            },
                            trigger: null, // Send immediately
                        });
                    }
                });

                // Play alert sound for any new alerts
                if (newAlerts.length > 0 && preferences.notification_enabled) {
                    // Notification sound will play automatically
                    console.log(`🔔 ${newAlerts.length} alert(s) detected with sound notification`);
                }

                // Save alerts to Firebase for user-specific history
                for (const alert of newAlerts) {
                    try {
                        await firebaseService.saveAlertHistory(alert);
                    } catch (error) {
                        console.error('Failed to save alert to Firebase:', error);
                    }
                }

                // Update history
                loadHistory();
            }
        } catch (error) {
            console.error('Failed to check alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const dismissAlert = async (id: string) => {
        try {
            await alertsApi.dismissAlert(id);
            // Remove from active alerts locally
            setActiveAlerts(prev => prev.filter(a => a.id !== id));
            // Refresh history
            loadHistory();
        } catch (error) {
            console.error('Failed to dismiss alert:', error);
        }
    };

    const savePreferences = async (newPrefs: UserPreferences) => {
        try {
            setLoading(true);
            await preferencesApi.savePreferences(newPrefs);
            setPreferences(newPrefs);
            // Re-check alerts with new preferences
            checkAlerts();
        } catch (error) {
            console.error('Failed to save preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertContext.Provider
            value={{
                activeAlerts,
                alertHistory,
                preferences,
                loading,
                checkAlerts,
                dismissAlert,
                savePreferences,
            }}
        >
            {children}
        </AlertContext.Provider>
    );
}

export function useAlerts() {
    const context = useContext(AlertContext);
    if (context === undefined) {
        throw new Error('useAlerts must be used within an AlertProvider');
    }
    return context;
}

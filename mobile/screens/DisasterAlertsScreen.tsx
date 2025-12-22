/**
 * Disaster Alerts Screen
 * Displays earthquake and tsunami alerts with severity-based styling
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    Linking,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { disasterApi } from '../services/api';
import { DisasterAlert } from '../types/disasters';
import * as Location from 'expo-location';
import { sendTestNotification } from '../services/notificationService';

export default function DisasterAlertsScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();

    const [earthquakeAlerts, setEarthquakeAlerts] = useState<DisasterAlert[]>([]);
    const [tsunamiAlerts, setTsunamiAlerts] = useState<DisasterAlert[]>([]);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

    useEffect(() => {
        loadLocation();

        // Subscribe to location updates
        const subscription = Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.Balanced,
                timeInterval: 10000, // Update every 10 seconds
                distanceInterval: 100, // Or when moved 100 meters
            },
            (newLocation) => {
                console.log(' Location updated:', newLocation.coords);
                setLocation({
                    lat: newLocation.coords.latitude,
                    lon: newLocation.coords.longitude,
                });
                loadAlerts(newLocation.coords.latitude, newLocation.coords.longitude);
            }
        );

        return () => {
            subscription.then(sub => sub.remove());
        };
    }, []);

    const loadLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Location permission denied');
                return;
            }

            const loc = await Location.getCurrentPositionAsync({});
            console.log(' Initial location:', loc.coords);
            setLocation({
                lat: loc.coords.latitude,
                lon: loc.coords.longitude,
            });

            // Load alerts after location is obtained
            loadAlerts(loc.coords.latitude, loc.coords.longitude);
        } catch (error) {
            console.error('Error getting location:', error);
        }
    };

    const loadAlerts = async (lat: number, lon: number) => {
        setLoading(true);
        try {
            const userType = 'GENERAL'; // Get from user preferences

            console.log(`🔍 Fetching earthquakes for lat=${lat}, lon=${lon}, radius=3000km`);

            // Fetch earthquake alerts (increased radius for better demo)
            const earthquakes = await disasterApi.getEarthquakes(lat, lon, userType, 3000);
            console.log('📊 Earthquake API Response:', earthquakes);
            console.log(`📊 Number of earthquake alerts: ${earthquakes.alerts?.length || 0}`);
            setEarthquakeAlerts(earthquakes.alerts || []);

            // Fetch tsunami warnings
            const tsunamis = await disasterApi.getTsunamis(lat, lon, userType, 3000);
            console.log('🌊 Tsunami API Response:', tsunamis);
            console.log(`🌊 Number of tsunami alerts: ${tsunamis.alerts?.length || 0}`);
            setTsunamiAlerts(tsunamis.alerts || []);

        } catch (error) {
            console.error('Error loading disaster alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = () => {
        // Always reload location on refresh
        console.log('🔄 Refreshing - getting fresh location...');
        loadLocation();
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return '#DC2626'; // Red
            case 'warning':
                return '#F59E0B'; // Orange
            case 'info':
                return '#3B82F6'; // Blue
            default:
                return colors.text;
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'alert-circle';
            case 'warning':
                return 'warning';
            case 'info':
                return 'information-circle';
            default:
                return 'alert';
        }
    };

    const renderDisasterAlert = (alert: DisasterAlert) => {
        const severityColor = getSeverityColor(alert.severity);
        const severityIcon = getSeverityIcon(alert.severity);

        return (
            <View
                key={alert.id}
                style={[
                    styles.alertCard,
                    {
                        backgroundColor: colors.card,
                        borderLeftColor: severityColor,
                        borderLeftWidth: 4,
                    },
                ]}
            >
                {/* Header */}
                <View style={styles.alertHeader}>
                    <View style={styles.alertTitleRow}>
                        <Ionicons name={severityIcon as any} size={24} color={severityColor} />
                        <Text style={[styles.alertTitle, { color: colors.text }]}>
                            {alert.title}
                        </Text>
                    </View>
                    <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
                        <Text style={styles.severityText}>{alert.severity.toUpperCase()}</Text>
                    </View>
                </View>

                {/* Location & Distance */}
                <View style={styles.alertInfo}>
                    <Ionicons name="location-outline" size={16} color={colors.tabIconDefault} />
                    <Text style={[styles.alertLocation, { color: colors.tabIconDefault }]}>
                        {alert.location.description} • {alert.distance_km.toFixed(0)}km away
                    </Text>
                </View>

                {/* Message */}
                <Text style={[styles.alertMessage, { color: colors.text }]}>
                    {alert.message}
                </Text>

                {/* User-specific advice */}
                <View style={[styles.adviceBox, { backgroundColor: colors.background }]}>
                    <Text style={[styles.adviceText, { color: colors.text }]}>
                        {alert.user_message}
                    </Text>
                </View>

                {/* Metadata */}
                {alert.type === 'earthquake' && (
                    <View style={styles.metadata}>
                        <Text style={[styles.metadataText, { color: colors.tabIconDefault }]}>
                            Magnitude: {(alert.metadata as any).magnitude} •
                            Depth: {(alert.metadata as any).depth_km?.toFixed(1) || 'N/A'}km
                        </Text>
                    </View>
                )}

                {alert.type === 'tsunami' && (alert.metadata as any).estimated_arrival_minutes && (
                    <View style={[styles.urgentBox, { backgroundColor: '#FEE2E2' }]}>
                        <Ionicons name="time-outline" size={16} color="#DC2626" />
                        <Text style={[styles.urgentText, { color: '#DC2626' }]}>
                            Estimated arrival: {(alert.metadata as any).estimated_arrival_minutes} minutes
                        </Text>
                    </View>
                )}

                {/* Source link */}
                <TouchableOpacity
                    style={styles.sourceButton}
                    onPress={() => Linking.openURL(alert.source_url)}
                >
                    <Text style={[styles.sourceText, { color: colors.tint }]}>
                        View on {alert.source} →
                    </Text>
                </TouchableOpacity>

                {/* Timestamp */}
                <Text style={[styles.timestamp, { color: colors.tabIconDefault }]}>
                    {new Date(alert.event_time).toLocaleString()}
                </Text>
            </View>
        );
    };

    const allAlerts = [...tsunamiAlerts, ...earthquakeAlerts];
    const criticalCount = allAlerts.filter(a => a.severity === 'critical').length;
    const warningCount = allAlerts.filter(a => a.severity === 'warning').length;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.tint} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.screenTitle, { color: colors.text }]}>
                        Disaster Alerts
                    </Text>
                    <Text style={[styles.greeting, { color: colors.tabIconDefault }]}>
                        Stay safe, {user?.displayName || user?.email?.split('@')[0] || 'User'}! 🛡️
                    </Text>
                    <TouchableOpacity onPress={sendTestNotification} style={{ marginLeft: 'auto' }}>
                        <Ionicons name="notifications-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    {/* Demo Test Button */}
                    <TouchableOpacity
                        style={[styles.testButton, { backgroundColor: '#F59E0B', flex: 1, marginRight: 8 }]}
                        onPress={() => {
                            console.log('Testing with Goroka, Papua New Guinea coordinates');
                            loadAlerts(-6.073, 145.3933);
                        }}
                    >
                        <Ionicons name="flask-outline" size={20} color="#ffffffff" />
                        <Text style={styles.testButtonText}>Test Data (Goroka)</Text>
                    </TouchableOpacity>

                    {/* Notification Test Button */}
                    <TouchableOpacity
                        style={[styles.testButton, { backgroundColor: '#F59E0B', flex: 1, marginLeft: 8 }]}
                        onPress={async () => {
                            console.log('Sending test push notification');
                            const success = await sendTestNotification();
                            if (!success) {
                                alert('Please enable notifications in settings to receive alerts.');
                            } else {
                                console.log('✅ Test notification scheduled!');
                            }
                        }}
                    >
                        <Ionicons name="notifications" size={20} color="#FFFFFF" />
                        <Text style={styles.testButtonText}>Test Push</Text>
                    </TouchableOpacity>
                </View>

                {/* Summary */}
                {allAlerts.length > 0 && (
                    <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryItem}>
                                <Text style={[styles.summaryNumber, { color: '#DC2626' }]}>
                                    {criticalCount}
                                </Text>
                                <Text style={[styles.summaryLabel, { color: colors.tabIconDefault }]}>
                                    Critical
                                </Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={[styles.summaryNumber, { color: '#F59E0B' }]}>
                                    {warningCount}
                                </Text>
                                <Text style={[styles.summaryLabel, { color: colors.tabIconDefault }]}>
                                    Warning
                                </Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={[styles.summaryNumber, { color: colors.text }]}>
                                    {allAlerts.length}
                                </Text>
                                <Text style={[styles.summaryLabel, { color: colors.tabIconDefault }]}>
                                    Total
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Tsunami Alerts */}
                {tsunamiAlerts.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="water-outline" size={20} color={colors.text} />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Tsunami Warnings
                            </Text>
                            <View style={[styles.badge, { backgroundColor: '#DC2626' }]}>
                                <Text style={styles.badgeText}>{tsunamiAlerts.length}</Text>
                            </View>
                        </View>
                        {tsunamiAlerts.map(renderDisasterAlert)}
                    </View>
                )}

                {/* Earthquake Alerts */}
                {earthquakeAlerts.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="pulse-outline" size={20} color={colors.text} />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Earthquake Alerts
                            </Text>
                            <View style={[styles.badge, { backgroundColor: "#F59E0B" }]}>
                                <Text style={styles.badgeText}>{earthquakeAlerts.length}</Text>
                            </View>
                        </View>
                        {earthquakeAlerts.map(renderDisasterAlert)}
                    </View>
                )}

                {/* No Alerts */}
                {!loading && allAlerts.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="shield-checkmark-outline" size={64} color={colors.tabIconDefault} />
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>
                            No Active Disaster Alerts
                        </Text>
                        <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
                            No earthquakes or tsunamis detected near your location in the last 24 hours.
                        </Text>
                    </View>
                )}

                {loading && allAlerts.length === 0 && (
                    <View style={styles.loadingState}>
                        <ActivityIndicator size="large" color={colors.tint} />
                        <Text style={[styles.loadingText, { color: colors.tabIconDefault }]}>
                            Checking for disaster alerts...
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 16,
    },
    header: {
        marginBottom: 20,
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    greeting: {
        fontSize: 16,
    },
    summaryCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryNumber: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    summaryLabel: {
        fontSize: 14,
        marginTop: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
        flex: 1,
    },
    badge: {
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    alertCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    alertHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    alertTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    alertTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
        flex: 1,
    },
    severityBadge: {
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    severityText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    alertInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    alertLocation: {
        fontSize: 14,
        marginLeft: 4,
    },
    alertMessage: {
        fontSize: 16,
        marginBottom: 12,
        lineHeight: 22,
    },
    adviceBox: {
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    adviceText: {
        fontSize: 14,
        lineHeight: 20,
    },
    metadata: {
        marginBottom: 8,
    },
    metadataText: {
        fontSize: 12,
    },
    urgentBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    urgentText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    sourceButton: {
        marginBottom: 8,
    },
    sourceText: {
        fontSize: 14,
        fontWeight: '500',
    },
    timestamp: {
        fontSize: 12,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    loadingState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: 16,
        marginTop: 16,
    },
    testButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
    },
    testButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 0,
        marginBottom: 20,
    },
});

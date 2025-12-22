/**
 * Global Disaster Map Component
 * Displays worldwide earthquakes and tsunamis on an interactive map
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useTheme } from '../contexts/ThemeContext';
import { disasterApi } from '../services/api';
import * as Clipboard from 'expo-clipboard';

interface MapEvent {
    id: string;
    type: 'earthquake' | 'tsunami';
    magnitude: number;
    location: string;
    lat: number;
    lon: number;
    time: number;
    tsunami_potential?: boolean;
    url: string;
}

export default function GlobalDisasterMap() {
    const { colors, isDark } = useTheme();

    const [earthquakes, setEarthquakes] = useState<MapEvent[]>([]);
    const [tsunamis, setTsunamis] = useState<MapEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null);
    const [showEarthquakes, setShowEarthquakes] = useState(true);
    const [showTsunamis, setShowTsunamis] = useState(true);

    useEffect(() => {
        loadMapData();
    }, []);

    const loadMapData = async () => {
        setLoading(true);
        try {
            const data = await disasterApi.getAnalyticsMap(4.5, 100);
            setEarthquakes(data.earthquakes || []);
            setTsunamis(data.tsunamis || []);
        } catch (error) {
            console.error('Error loading map data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMarkerColor = (magnitude: number, type: string) => {
        if (type === 'tsunami') return '#DC2626'; // Red for tsunami

        if (magnitude >= 7.0) return '#DC2626'; // Red
        if (magnitude >= 6.0) return '#F59E0B'; // Orange
        if (magnitude >= 5.0) return '#FBBF24'; // Yellow
        return '#3B82F6'; // Blue
    };

    const getCircleRadius = (magnitude: number) => {
        // Radius in meters for visualization
        if (magnitude >= 7.0) return 500000; // 500km
        if (magnitude >= 6.0) return 200000; // 200km
        if (magnitude >= 5.0) return 100000; // 100km
        return 50000; // 50km
    };

    const copyLocationName = async (location: string) => {
        await Clipboard.setStringAsync(location);
        Alert.alert(
            '📋 Location Copied!',
            `"${location}" copied to clipboard.\n\nGo to Home screen and paste this location to see weather and alerts for this area.`,
            [{ text: 'OK' }]
        );
    };

    const renderMarker = (event: MapEvent) => {
        const color = getMarkerColor(event.magnitude, event.type);
        const radius = getCircleRadius(event.magnitude);

        return (
            <React.Fragment key={event.id}>
                {/* Impact radius circle */}
                <Circle
                    center={{ latitude: event.lat, longitude: event.lon }}
                    radius={radius}
                    fillColor={`${color}20`}
                    strokeColor={color}
                    strokeWidth={2}
                />

                {/* Marker */}
                <Marker
                    coordinate={{ latitude: event.lat, longitude: event.lon }}
                    onPress={() => setSelectedEvent(event)}
                >
                    <View style={[styles.markerContainer, { backgroundColor: color }]}>
                        <Ionicons
                            name={event.type === 'tsunami' ? 'water' : 'pulse'}
                            size={20}
                            color="#FFFFFF"
                        />
                        <Text style={styles.markerText}>{event.magnitude.toFixed(1)}</Text>
                    </View>
                </Marker>
            </React.Fragment>
        );
    };

    // Lighter dark mode for better visibility
    const mapStyle = isDark ? [
        {
            "elementType": "geometry",
            "stylers": [{ "color": "#1a1a2e" }]
        },
        {
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#e0e0e0" }]
        },
        {
            "elementType": "labels.text.stroke",
            "stylers": [{ "color": "#1a1a2e" }]
        },
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{ "color": "#0f62c8ff" }]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#e0e0e0" }]
        }
    ] : [];

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.tint} />
                <Text style={[styles.loadingText, { color: colors.text }]}>
                    Loading global disaster data...
                </Text>
            </View>
        );
    }

    const visibleEvents = [
        ...(showEarthquakes ? earthquakes : []),
        ...(showTsunamis ? tsunamis : [])
    ];

    return (
        <View style={styles.container}>
            {/* Map */}
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 20,
                    longitude: 0,
                    latitudeDelta: 100,
                    longitudeDelta: 100,
                }}
                customMapStyle={mapStyle}
            >
                {visibleEvents.map(renderMarker)}
            </MapView>

            {/* Filter Controls */}
            <View style={[styles.filterContainer, { backgroundColor: colors.card }]}>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        showEarthquakes && { backgroundColor: '#3B82F6' }
                    ]}
                    onPress={() => setShowEarthquakes(!showEarthquakes)}
                >
                    <Ionicons
                        name="pulse"
                        size={20}
                        color={showEarthquakes ? '#FFFFFF' : colors.text}
                    />
                    <Text style={[
                        styles.filterText,
                        { color: showEarthquakes ? '#FFFFFF' : colors.text }
                    ]}>
                        Earthquakes ({earthquakes.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        showTsunamis && { backgroundColor: '#DC2626' }
                    ]}
                    onPress={() => setShowTsunamis(!showTsunamis)}
                >
                    <Ionicons
                        name="water"
                        size={20}
                        color={showTsunamis ? '#FFFFFF' : colors.text}
                    />
                    <Text style={[
                        styles.filterText,
                        { color: showTsunamis ? '#FFFFFF' : colors.text }
                    ]}>
                        Tsunamis ({tsunamis.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={loadMapData}
                >
                    <Ionicons name="refresh" size={30} color={colors.tint} />
                </TouchableOpacity>
            </View>

            {/* Event Details - Bottom Panel */}
            {selectedEvent && (
                <View style={[styles.detailsContainer, { backgroundColor: colors.card }]}>
                    <View style={styles.detailsHeader}>
                        <View style={styles.detailsTitle}>
                            <Ionicons
                                name={selectedEvent.type === 'tsunami' ? 'water' : 'pulse'}
                                size={24}
                                color={getMarkerColor(selectedEvent.magnitude, selectedEvent.type)}
                            />
                            <Text style={[styles.detailsText, { color: colors.text }]}>
                                Magnitude {selectedEvent.magnitude.toFixed(1)} {selectedEvent.type}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => setSelectedEvent(null)}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.detailsLocation, { color: colors.tabIconDefault }]}>
                        {selectedEvent.location}
                    </Text>

                    <Text style={[styles.detailsTime, { color: colors.tabIconDefault }]}>
                        {new Date(selectedEvent.time).toLocaleString()}
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.copyButton,
                            {
                                backgroundColor: isDark ? '#3B82F6' : '#2563EB',
                                borderWidth: 1,
                                borderColor: isDark ? '#60A5FA' : '#1D4ED8',
                            }
                        ]}
                        onPress={() => copyLocationName(selectedEvent.location)}
                    >
                        <Ionicons name="copy-outline" size={16} color="#FFFFFF" />
                        <Text style={[styles.copyButtonText, { color: '#FFFFFF' }]}>
                            Copy Location Name
                        </Text>
                    </TouchableOpacity>

                    {selectedEvent.tsunami_potential && (
                        <View style={styles.tsunamiWarning}>
                            <Ionicons name="warning" size={16} color="#DC2626" />
                            <Text style={styles.tsunamiText}>Tsunami Potential</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Legend */}
            <View style={[styles.legendContainer, { backgroundColor: colors.card }]}>
                <Text style={[styles.legendTitle, { color: colors.text }]}>Magnitude</Text>
                <View style={styles.legendItems}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
                        <Text style={[styles.legendText, { color: colors.text }]}>≥7.0</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                        <Text style={[styles.legendText, { color: colors.text }]}>6.0-6.9</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#FBBF24' }]} />
                        <Text style={[styles.legendText, { color: colors.text }]}>5.0-5.9</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                        <Text style={[styles.legendText, { color: colors.text }]}>5.0</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    markerContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
        borderRadius: 16,
        minWidth: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    markerText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginTop: 2,
        fontSize: 11,
    },
    filterContainer: {
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        flexDirection: 'row',
        borderRadius: 12,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    filterButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    filterText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    refreshButton: {
        padding: 12,
        borderRadius: 8,
    },
    detailsContainer: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    detailsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    detailsTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    detailsText: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
    detailsLocation: {
        fontSize: 16,
        marginBottom: 4,
    },
    detailsTime: {
        fontSize: 14,
        marginBottom: 12,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    copyButtonText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    tsunamiWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#FEE2E2',
        borderRadius: 8,
    },
    tsunamiText: {
        color: '#DC2626',
        fontWeight: '600',
        marginLeft: 8,
    },
    legendContainer: {
        position: 'absolute',
        top: 100,
        right: 16,
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    legendTitle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
    },
    legendItems: {
        gap: 6,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendText: {
        fontSize: 12,
    },
});

/**
 * Location Picker Modal
 * Allows users to search and add new locations
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { locationManager } from '../utils/LocationManager';
import { SavedLocation } from '../services/firebaseService';

interface LocationPickerProps {
    visible: boolean;
    onClose: () => void;
    onLocationAdded: () => void;
}

interface CitySearchResult {
    city: string;
    country: string;
    lat: number;
    lon: number;
}

// Popular cities for quick selection
const POPULAR_CITIES: CitySearchResult[] = [
    { city: 'Delhi', country: 'IN', lat: 28.6139, lon: 77.2090 },
    { city: 'Mumbai', country: 'IN', lat: 19.0760, lon: 72.8777 },
    { city: 'Bangalore', country: 'IN', lat: 12.9716, lon: 77.5946 },
    { city: 'Chennai', country: 'IN', lat: 13.0827, lon: 80.2707 },
    { city: 'Kolkata', country: 'IN', lat: 22.5726, lon: 88.3639 },
    { city: 'Hyderabad', country: 'IN', lat: 17.3850, lon: 78.4867 },
    { city: 'Pune', country: 'IN', lat: 18.5204, lon: 73.8567 },
    { city: 'Coimbatore', country: 'IN', lat: 11.0168, lon: 76.9558 },
];

export const LocationPicker: React.FC<LocationPickerProps> = ({
    visible,
    onClose,
    onLocationAdded,
}) => {
    const { colors } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<CitySearchResult[]>(POPULAR_CITIES);

    // Debounce search to avoid too many API calls
    const searchTimeout = React.useRef<ReturnType<typeof setTimeout>>(undefined);

    const searchCities = async (query: string) => {
        if (query.length < 2) {
            setSearchResults(POPULAR_CITIES);
            return;
        }

        try {
            setLoading(true);
            // Use OpenWeatherMap Geocoding API
            const API_KEY = process.env.Api_key
            const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=20&appid=${API_KEY}`
            );

            if (!response.ok) {
                throw new Error('Failed to search cities');
            }

            const data = await response.json();

            // Transform API response to our format
            const cities: CitySearchResult[] = data.map((item: any) => ({
                city: item.name,
                country: item.country,
                lat: item.lat,
                lon: item.lon,
                state: item.state, // Include state/region for better identification
            }));

            setSearchResults(cities);
        } catch (error) {
            console.error('Error searching cities:', error);
            // Fallback to filtering popular cities
            const filtered = POPULAR_CITIES.filter(city =>
                city.city.toLowerCase().includes(query.toLowerCase())
            );
            setSearchResults(filtered);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);

        // Clear previous timeout
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        if (query.length < 2) {
            setSearchResults(POPULAR_CITIES);
            return;
        }

        // Debounce search - wait 500ms after user stops typing
        searchTimeout.current = setTimeout(() => {
            searchCities(query);
        }, 500);
    };

    const handleAddLocation = async (city: CitySearchResult) => {
        try {
            setLoading(true);

            // Check if location already exists
            const exists = await locationManager.locationExists(city.city, city.country);
            if (exists) {
                alert('Location already added!');
                return;
            }

            // Add location
            await locationManager.addLocation({
                city: city.city,
                country: city.country,
                lat: city.lat,
                lon: city.lon,
                isCurrentLocation: false,
            });

            onLocationAdded();
            onClose();
            setSearchQuery('');
        } catch (error) {
            console.error('Error adding location:', error);
            alert('Failed to add location');
        } finally {
            setLoading(false);
        }
    };

    const renderCityItem = ({ item }: { item: CitySearchResult }) => (
        <TouchableOpacity
            style={[styles.cityItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleAddLocation(item)}
            disabled={loading}
        >
            <View style={styles.cityInfo}>
                <Ionicons name="location" size={24} color={colors.tint} />
                <View style={styles.cityText}>
                    <Text style={[styles.cityName, { color: colors.text }]}>{item.city}</Text>
                    <Text style={[styles.countryName, { color: colors.tabIconDefault }]}>
                        {(item as any).state ? `${(item as any).state}, ${item.country}` : item.country}
                    </Text>
                </View>
            </View>
            <Ionicons name="add-circle-outline" size={24} color={colors.tint} />
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>Add Location</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Search Input */}
                    <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Ionicons name="search" size={20} color={colors.tabIconDefault} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Search city..."
                            placeholderTextColor={colors.tabIconDefault}
                            value={searchQuery}
                            onChangeText={handleSearch}
                            autoFocus
                        />
                    </View>

                    {/* City List */}
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.tint} />
                        </View>
                    ) : (
                        <FlatList
                            data={searchResults}
                            renderItem={renderCityItem}
                            keyExtractor={(item) => `${item.city}-${item.country}`}
                            contentContainerStyle={styles.listContent}
                            ListEmptyComponent={
                                <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
                                    No cities found
                                </Text>
                            }
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '80%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    listContent: {
        paddingBottom: 20,
    },
    cityItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 10,
    },
    cityInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cityText: {
        marginLeft: 12,
    },
    cityName: {
        fontSize: 18,
        fontWeight: '600',
    },
    countryName: {
        fontSize: 14,
        marginTop: 2,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    },
});

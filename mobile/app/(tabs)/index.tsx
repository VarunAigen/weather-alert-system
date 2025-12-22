import React, { useCallback, useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PagerView from 'react-native-pager-view';
import { useTheme } from '../../contexts/ThemeContext';
import { useWeather } from '../../contexts/WeatherContext';
import { useAlerts } from '../../contexts/AlertContext';
import { ForecastCard } from '../../components/ForecastCard';
import { AlertCard } from '../../components/AlertCard';
import { HourlyForecastChart } from '../../components/HourlyForecastChart';
import { WeatherInfoGrid } from '../../components/WeatherInfoGrid';
import { WeatherAnimation } from '../../components/WeatherAnimation';
import { LocationPicker } from '../../components/LocationPicker';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSmartGradient } from '../../utils/weatherBackgrounds';
import { getWeatherIcon, getWeatherIconColor } from '../../utils/weatherIcons';
import { locationManager } from '../../utils/LocationManager';
import { SavedLocation } from '../../services/firebaseService';


export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { weather, dailyForecast, hourlyForecast, loading, error, refreshWeather, fetchWeatherForLocation } = useWeather();
  const { activeAlerts, checkAlerts } = useAlerts();
  const { dismissAlert } = useAlerts();

  // Debug location data
  useEffect(() => {
    if (weather?.location) {
      console.log('Current Weather Location Data:', JSON.stringify(weather.location, null, 2));
    }
  }, [weather]);
  const [refreshing, setRefreshing] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  // Load saved locations
  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    const locations = await locationManager.getLocations();

    // Find current GPS location and put it first
    const gpsLocation = locations.find(loc => loc.isCurrentLocation);
    const reorderedLocations = gpsLocation
      ? [gpsLocation, ...locations.filter(loc => !loc.isCurrentLocation)]
      : locations;

    setSavedLocations(reorderedLocations);

    // Restore previously selected location
    const currentLocationId = await locationManager.getCurrentLocationId();
    if (currentLocationId && reorderedLocations.length > 0) {
      const index = reorderedLocations.findIndex(loc => loc.id === currentLocationId);
      if (index !== -1) {
        setCurrentLocationIndex(index);
        const location = reorderedLocations[index];
        if (location.isCurrentLocation) {
          await refreshWeather();
        } else {
          await fetchWeatherForLocation(location.lat, location.lon);
        }
        return;
      }
    }

    // Default to first location (GPS) if no saved preference
    if (reorderedLocations.length > 0) {
      setCurrentLocationIndex(0);
      const location = reorderedLocations[0];
      if (location.isCurrentLocation) {
        await refreshWeather();
      } else {
        await fetchWeatherForLocation(location.lat, location.lon);
      }
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // If we are on the first page (GPS), force a GPS refresh
    // Otherwise just refresh the weather for the current static coordinates
    const currentLocation = savedLocations[currentLocationIndex];

    if (currentLocation?.isCurrentLocation) {
      await Promise.all([refreshWeather(), checkAlerts()]);
    } else if (currentLocation) {
      await Promise.all([
        fetchWeatherForLocation(currentLocation.lat, currentLocation.lon),
        checkAlerts()
      ]);
    } else {
      await Promise.all([refreshWeather(), checkAlerts()]);
    }

    setRefreshing(false);
  }, [refreshWeather, checkAlerts, savedLocations, currentLocationIndex]);

  const handleLocationAdded = () => {
    loadLocations();
  };

  const handlePageChange = async (index: number) => {
    setCurrentLocationIndex(index);
    pagerRef.current?.setPage(index);
    if (savedLocations[index]) {
      const location = savedLocations[index];
      // Save this as the current location (non-blocking)
      locationManager.setCurrentLocation(location.id);

      // Load weather for this location (non-blocking)
      if (location.isCurrentLocation) {
        refreshWeather();
      } else {
        fetchWeatherForLocation(location.lat, location.lon);
      }
    }
  };


  const handleDeleteLocation = async (locationId: string) => {
    try {
      await locationManager.deleteLocation(locationId);
      await loadLocations();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete location');
    }
  };

  const handleMenuPress = () => {
    const currentLocation = savedLocations[currentLocationIndex];
    if (!currentLocation) return;

    if (currentLocation.isCurrentLocation) {
      Alert.alert('Info', 'Current GPS location cannot be deleted.');
      return;
    }

    Alert.alert(
      'Delete Location',
      `Are you sure you want to delete ${currentLocation.city}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeleteLocation(currentLocation.id)
        }
      ]
    );
  };

  // Get gradient colors based on weather
  const gradient = weather
    ? getSmartGradient(weather.current.icon, weather.current.temperature, isDark)
    : { colors: isDark ? ['#1a1a2e', '#16213e'] as const : ['#87CEEB', '#4682B4'] as const };

  // Get REAL sunrise/sunset from API (convert Unix timestamp to Date)
  const sunrise = weather ? new Date(weather.current.sunrise * 1000) : new Date();
  const sunset = weather ? new Date(weather.current.sunset * 1000) : new Date();

  // Fallback to default times if no weather data
  if (!weather) {
    sunrise.setHours(6, 30, 0);
    sunset.setHours(18, 30, 0);
  }

  if (loading && !weather) {
    return (
      <LinearGradient colors={gradient.colors} style={styles.container}>
        <SafeAreaView style={styles.centerContainer}>
          <Text style={[styles.loadingText, { color: '#FFFFFF' }]}>Loading weather data...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (error && !weather) {
    return (
      <LinearGradient colors={gradient.colors} style={styles.container}>
        <SafeAreaView style={styles.centerContainer}>
          <Ionicons name="cloud-offline-outline" size={64} color="#FFFFFF" />
          <Text style={[styles.errorText, { color: '#FFFFFF' }]}>{error}</Text>
          <Text style={[styles.subError, { color: 'rgba(255,255,255,0.7)' }]}>
            Please check your connection and location permissions.
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Reusable weather content renderer
  const renderWeatherContent = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      nestedScrollEnabled={true}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#FFFFFF"
        />
      }
    >
      {/* Current Weather Summary */}
      {weather && (
        <View style={styles.currentWeather}>
          <WeatherAnimation iconCode={weather.current.icon} size={120} />
          <Text style={styles.temperature}>
            {Math.round(weather.current.temperature)}°
          </Text>
          <Text style={styles.condition}>{weather.current.condition}</Text>
          <Text style={styles.tempRange}>
            H:{dailyForecast?.forecast[0]?.temp_max ? Math.round(dailyForecast.forecast[0].temp_max) : '--'}°
            L:{dailyForecast?.forecast[0]?.temp_min ? Math.round(dailyForecast.forecast[0].temp_min) : '--'}°
          </Text>
        </View>
      )}

      {/* Active Alerts Summary */}
      {activeAlerts.length > 0 && (
        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>⚠️ Active Alerts ({activeAlerts.length})</Text>
          {activeAlerts.slice(0, 2).map((alert, index) => (
            <AlertCard key={index} alert={alert} onDismiss={() => dismissAlert(alert.id)} />
          ))}
        </View>
      )}

      {/* 24-Hour Forecast */}
      {hourlyForecast?.forecast?.length && hourlyForecast.forecast.length > 0 && (
        <HourlyForecastChart forecast={hourlyForecast.forecast} />
      )}

      {/* 7-Day Forecast */}
      {dailyForecast?.forecast?.length && dailyForecast.forecast.length > 0 && (
        <View style={styles.forecastSection}>
          <ForecastCard forecast={dailyForecast.forecast} />
        </View>
      )}

      {/* Weather Info Grid */}
      {weather && (
        <WeatherInfoGrid
          windSpeed={weather.current.wind_speed}
          windDirection={weather.current.wind_direction}
          humidity={weather.current.humidity}
          feelsLike={weather.current.feels_like}
          uvIndex={0}
          sunrise={sunrise}
          sunset={sunset}
          pressure={weather.current.pressure}
          rainChance={dailyForecast?.forecast[0]?.rain_chance || 0}
        />
      )}
    </ScrollView>
  );

  return (
    <LinearGradient colors={gradient.colors} locations={gradient.locations} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header with location and add button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowLocationPicker(true)}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>
              {savedLocations[currentLocationIndex]?.isCurrentLocation && weather?.location.city
                ? weather.location.city
                : (savedLocations[currentLocationIndex]?.city || weather?.location.city || 'Loading...')}
            </Text>
            {savedLocations.length > 1 && (
              <View style={styles.dotsContainer}>
                {savedLocations.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handlePageChange(index)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <View
                      style={[
                        styles.dot,
                        index === currentLocationIndex && styles.activeDot
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
            <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Conditional PagerView for swipe navigation */}
        {savedLocations.length > 1 ? (
          <PagerView
            style={{ flex: 1 }}
            initialPage={currentLocationIndex}
            ref={pagerRef}
            scrollEnabled={true}
            onPageSelected={(e) => handlePageChange(e.nativeEvent.position)}
          >
            {savedLocations.map((location, pageIndex) => (
              <View key={location.id} style={{ flex: 1 }}>
                {pageIndex === currentLocationIndex ? renderWeatherContent() : <View />}
              </View>
            ))}
          </PagerView>
        ) : (
          renderWeatherContent()
        )}

        {/* Location Picker Modal */}
        <LocationPicker
          visible={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onLocationAdded={handleLocationAdded}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
    alignItems: 'center',
  },
  locationName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#22ff00ff',
    width: 20,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  currentWeather: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  weatherIcon: {
    marginBottom: 12,
  },
  temperature: {
    fontSize: 72,
    fontWeight: '200',
    color: '#ffffffff',
  },
  condition: {
    fontSize: 24,
    color: '#FFFFFF',
    marginTop: 8,
  },
  tempRange: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  riskContainer: {
    marginVertical: 16,
  },
  alertsSection: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  forecastSection: {
    marginVertical: 8,
  },
  twoColumnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  halfWidth: {
    width: '48%',
    maxHeight: '20%',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  subError: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

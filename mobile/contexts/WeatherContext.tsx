import React, { createContext, useContext, useState, useEffect } from 'react';
import { WeatherData, DailyForecastResponse, HourlyForecastResponse } from '../types';
import { weatherApi } from '../services/api';
import * as Location from 'expo-location';

interface WeatherContextType {
    weather: WeatherData | null;
    dailyForecast: DailyForecastResponse | null;
    hourlyForecast: HourlyForecastResponse | null;
    loading: boolean;
    error: string | null;
    refreshWeather: () => Promise<void>;
    fetchWeatherForLocation: (lat: number, lon: number) => Promise<void>;
    locationPermission: boolean;
    isGPSLocation: boolean;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: React.ReactNode }) {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [dailyForecast, setDailyForecast] = useState<DailyForecastResponse | null>(null);
    const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [locationPermission, setLocationPermission] = useState(false);
    const [isGPSLocation, setIsGPSLocation] = useState(true); // Track if viewing GPS location

    const fetchWeatherData = async (lat: number, lon: number) => {
        try {
            setLoading(true);
            setError(null);
            setIsGPSLocation(false); // This is a saved location, not GPS

            const [current, daily, hourly] = await Promise.all([
                weatherApi.getCurrentWeather(lat, lon),
                weatherApi.getDailyForecast(lat, lon),
                weatherApi.getHourlyForecast(lat, lon),
            ]);

            setWeather(current);
            setDailyForecast(daily);
            setHourlyForecast(hourly);
        } catch (err) {
            setError('Failed to fetch weather data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const refreshWeather = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setError('Permission to access location was denied');
            return;
        }
        setLocationPermission(true);

        let location = await Location.getCurrentPositionAsync({});
        const lat = location.coords.latitude;
        const lon = location.coords.longitude;

        // Fetch weather data
        try {
            setLoading(true);
            setError(null);
            setIsGPSLocation(true); // This is GPS location

            const [current, daily, hourly] = await Promise.all([
                weatherApi.getCurrentWeather(lat, lon),
                weatherApi.getDailyForecast(lat, lon),
                weatherApi.getHourlyForecast(lat, lon),
            ]);

            setWeather(current);
            setDailyForecast(daily);
            setHourlyForecast(hourly);

            // Update the saved GPS location entry with fresh coordinates
            try {
                const { locationManager } = await import('../utils/LocationManager');
                const savedLocations = await locationManager.getLocations();
                const gpsLocation = savedLocations.find(loc => loc.isCurrentLocation);

                // If GPS location exists and coordinates have changed significantly, update it
                if (gpsLocation && (
                    Math.abs(gpsLocation.lat - lat) > 0.01 ||
                    Math.abs(gpsLocation.lon - lon) > 0.01
                )) {
                    console.log('GPS coordinates changed, updating saved location...');
                    await locationManager.deleteLocation(gpsLocation.id);
                    await locationManager.addLocation({
                        city: current.location.city,
                        country: current.location.country,
                        lat: lat,
                        lon: lon,
                        isCurrentLocation: true
                    });
                } else if (!gpsLocation) {
                    // No GPS location saved yet, create one
                    console.log('Creating initial GPS location entry...');
                    await locationManager.addLocation({
                        city: current.location.city,
                        country: current.location.country,
                        lat: lat,
                        lon: lon,
                        isCurrentLocation: true
                    });
                }
            } catch (error) {
                console.error('Failed to update GPS location:', error);
            }
        } catch (err) {
            setError('Failed to fetch weather data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshWeather();
    }, []);

    return (
        <WeatherContext.Provider
            value={{
                weather,
                dailyForecast,
                hourlyForecast,
                loading,
                error,
                refreshWeather,
                fetchWeatherForLocation: fetchWeatherData,
                locationPermission,
                isGPSLocation,
            }}
        >
            {children}
        </WeatherContext.Provider>
    );
}

export function useWeather() {
    const context = useContext(WeatherContext);
    if (context === undefined) {
        throw new Error('useWeather must be used within a WeatherProvider');
    }
    return context;
}

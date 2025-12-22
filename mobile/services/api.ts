import axios from 'axios';
import Constants from 'expo-constants';

// Get API URL from environment variable (.env file)
// Falls back to localhost if not set
const BASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL ||
    process.env.EXPO_PUBLIC_API_URL ||
    'http://localhost:8000';

console.log('API Base URL:', BASE_URL); // Debug log

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const weatherApi = {
    getCurrentWeather: async (lat: number, lon: number) => {
        const response = await api.get('/api/weather/current', { params: { lat, lon } });
        return response.data;
    },

    getCurrentWeatherByCity: async (city: string) => {
        const response = await api.get('/api/weather/current', { params: { city } });
        return response.data;
    },

    getDailyForecast: async (lat: number, lon: number, days: number = 7) => {
        const response = await api.get('/api/weather/forecast/daily', { params: { lat, lon, days } });
        return response.data;
    },

    getHourlyForecast: async (lat: number, lon: number, hours: number = 24) => {
        const response = await api.get('/api/weather/forecast/hourly', { params: { lat, lon, hours } });
        return response.data;
    },
};

export const alertsApi = {
    checkAlerts: async (data: any) => {
        const response = await api.post('/api/alerts/check', data);
        return response.data;
    },

    getHistory: async (limit: number = 20) => {
        const response = await api.get('/api/alerts/history', { params: { limit } });
        return response.data;
    },

    dismissAlert: async (alertId: string) => {
        const response = await api.post(`/api/alerts/dismiss/${alertId}`);
        return response.data;
    },
};

export const preferencesApi = {
    savePreferences: async (data: any) => {
        const response = await api.post('/api/preferences', data);
        return response.data;
    },

    getPreferences: async (userId: string) => {
        const response = await api.get(`/api/preferences/${userId}`);
        return response.data;
    },
};

export const disasterApi = {
    getEarthquakes: async (lat: number, lon: number, userType: string = 'GENERAL', maxDistance: number = 1000) => {
        const response = await api.get('/api/disasters/earthquakes', {
            params: { lat, lon, user_type: userType, max_distance: maxDistance }
        });
        return response.data;
    },

    getTsunamis: async (lat: number, lon: number, userType: string = 'GENERAL', maxDistance: number = 1000) => {
        const response = await api.get('/api/disasters/tsunamis', {
            params: { lat, lon, user_type: userType, max_distance: maxDistance }
        });
        return response.data;
    },

    getGlobalEarthquakes: async (minMagnitude: number = 4.5, limit: number = 50) => {
        const response = await api.get('/api/disasters/earthquakes/global', {
            params: { min_magnitude: minMagnitude, limit }
        });
        return response.data;
    },

    getAnalyticsMap: async (minMagnitude: number = 4.5, limit: number = 100) => {
        const response = await api.get('/api/disasters/analytics/map', {
            params: { min_magnitude: minMagnitude, limit }
        });
        return response.data;
    },
};

export default api;

export interface Location {
    city: string;
    country: string;
    lat: number;
    lon: number;
}

export interface CurrentWeather {
    temperature: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    wind_direction: number;
    visibility: number;
    condition: string;
    icon: string;
    sunrise: number;  // Unix timestamp
    sunset: number;   // Unix timestamp
    timestamp: string;
}

export interface WeatherData {
    location: Location;
    current: CurrentWeather;
    risk_score: number;
    risk_level: 'LOW' | 'MODERATE' | 'MEDIUM' | 'HIGH' | 'SEVERE';
}

export interface DailyForecast {
    date: string;
    temp_max: number;
    temp_min: number;
    condition: string;
    icon: string;
    precipitation: number;
    rain_chance: number;
    humidity: number;
    wind_speed: number;
}

export interface HourlyForecast {
    timestamp: string;
    temperature: number;
    feels_like: number;
    condition: string;
    icon: string;
    precipitation: number;
    humidity: number;
    wind_speed: number;
}

export interface DailyForecastResponse {
    location: Location;
    forecast: DailyForecast[];
}

export interface HourlyForecastResponse {
    location: Location;
    forecast: HourlyForecast[];
}

export type AlertType = 'HEATWAVE' | 'HEAVY_RAIN' | 'STORM' | 'COLD_WAVE' | 'HIGH_HUMIDITY';

export type Severity = 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';

export interface Alert {
    id: string;
    type: AlertType;
    severity: Severity;
    title: string;
    message: string;
    recommendations: string[];
    start_time: string | null;
    end_time: string | null;
    created_at: string;
    acknowledged: boolean;
}

export type UserType = 'STUDENT' | 'FARMER' | 'TRAVELLER' | 'DELIVERY_WORKER' | 'GENERAL';

export interface CustomThresholds {
    heatwave_temp: number;
    heavy_rain_amount: number;
    high_wind_speed: number;
    cold_wave_temp: number;
    high_humidity: number;
}

export interface UserPreferences {
    user_id: string;
    user_type: UserType;
    custom_thresholds: CustomThresholds;
    notification_enabled: boolean;
    temperature_unit: 'celsius' | 'fahrenheit';
}

export interface AlertCheckResponse {
    alerts: Alert[];
    risk_score: number;
    risk_level: string;
}

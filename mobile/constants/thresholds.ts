/**
 * Default Alert Thresholds by User Type
 * Recommended values based on user needs
 */

export interface AlertThresholds {
    heatwave: number;      // Temperature in °C
    heavyRain: number;     // Rainfall in mm
    storm: number;         // Wind speed in km/h
    coldWave: number;      // Temperature in °C
    highHumidity: number;  // Humidity in %
}

export type UserType = 'farmer' | 'student' | 'traveler' | 'traveller' | 'delivery_worker' | 'general';

/**
 * Default thresholds for each user type
 */
export const DEFAULT_THRESHOLDS: Record<UserType, AlertThresholds> = {
    farmer: {
        heatwave: 35,        // Farmers sensitive to crop stress
        heavyRain: 50,       // Risk of flooding
        storm: 40,           // Risk of crop damage
        coldWave: 5,         // Risk of frost
        highHumidity: 80,    // Risk of fungal diseases
    },
    student: {
        heatwave: 40,        // Less sensitive, health risk only
        heavyRain: 80,       // Only extreme rain affects school
        storm: 50,           // Safety concern
        coldWave: 0,         // Very cold weather
        highHumidity: 90,    // Comfort level
    },
    traveler: {
        heatwave: 38,        // Travel comfort
        heavyRain: 20,       // Any significant rain affects travel
        storm: 30,           // Flight/transport delays
        coldWave: 5,         // Travel safety
        highHumidity: 75,    // Comfort during travel
    },
    traveller: {  // British spelling alias
        heatwave: 38,        // Travel comfort
        heavyRain: 20,       // Any significant rain affects travel
        storm: 30,           // Flight/transport delays
        coldWave: 5,         // Travel safety
        highHumidity: 75,    // Comfort during travel
    },
    delivery_worker: {
        heatwave: 38,        // Outdoor work safety
        heavyRain: 60,       // Delivery delays
        storm: 35,           // Safety on roads
        coldWave: 5,         // Outdoor work safety
        highHumidity: 85,    // Work comfort
    },
    general: {
        heatwave: 38,        // General health risk
        heavyRain: 70,       // Significant disruption
        storm: 45,           // Safety concern
        coldWave: 3,         // Cold weather
        highHumidity: 85,    // General comfort
    },
};

/**
 * Threshold ranges (min/max values for sliders)
 */
export const THRESHOLD_RANGES = {
    heatwave: { min: 30, max: 45, step: 1, unit: '°C' },
    heavyRain: { min: 10, max: 100, step: 5, unit: 'mm' },
    storm: { min: 20, max: 80, step: 5, unit: 'km/h' },
    coldWave: { min: -5, max: 15, step: 1, unit: '°C' },
    highHumidity: { min: 60, max: 95, step: 5, unit: '%' },
};

/**
 * User type descriptions
 */
export const USER_TYPE_INFO: Record<UserType, { label: string; description: string; icon: string }> = {
    farmer: {
        label: 'Farmer',
        description: 'Optimized for agricultural activities and crop protection',
        icon: 'leaf',
    },
    student: {
        label: 'Student',
        description: 'Focused on school safety and comfort',
        icon: 'school',
    },
    traveler: {
        label: 'Traveler',
        description: 'Alerts for travel disruptions and safety',
        icon: 'airplane',
    },
    traveller: {  // British spelling alias
        label: 'Traveller',
        description: 'Alerts for travel disruptions and safety',
        icon: 'airplane',
    },
    delivery_worker: {
        label: 'Delivery Worker',
        description: 'Optimized for outdoor work and road safety',
        icon: 'bicycle',
    },
    general: {
        label: 'General',
        description: 'Balanced alerts for everyday use',
        icon: 'person',
    },
};

/**
 * Get default thresholds for a user type
 */
export function getDefaultThresholds(userType: UserType): AlertThresholds {
    return { ...DEFAULT_THRESHOLDS[userType] };
}

/**
 * Threshold labels and descriptions
 */
export const THRESHOLD_INFO = {
    heatwave: {
        label: 'Heatwave Alert',
        description: 'Temperature threshold for heat warnings',
    },
    heavyRain: {
        label: 'Heavy Rain Alert',
        description: 'Rainfall amount threshold',
    },
    storm: {
        label: 'Storm Alert',
        description: 'Wind speed threshold for storm warnings',
    },
    coldWave: {
        label: 'Cold Wave Alert',
        description: 'Temperature threshold for cold warnings',
    },
    highHumidity: {
        label: 'High Humidity Alert',
        description: 'Humidity percentage threshold',
    },
};

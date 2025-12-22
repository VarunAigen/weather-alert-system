/**
 * Weather Background Gradients
 * Maps weather conditions to beautiful gradient colors
 */

export interface WeatherGradient {
    colors: readonly [string, string, ...string[]];
    locations?: readonly [number, number, ...number[]];
}

/**
 * Get gradient colors based on weather condition and time of day
 */
export const getWeatherGradient = (
    weatherCode: string,
    isNight: boolean = false
): WeatherGradient => {
    // Clear sky
    if (weatherCode === '01d') {
        return {
            colors: ['#FFD700', '#FFA500', '#FF6347'], // Gold → Orange → Tomato
            locations: [0, 0.5, 1],
        };
    }

    if (weatherCode === '01n') {
        return {
            colors: ['#1a1a2e', '#16213e', '#0f3460'], // Dark blue night
            locations: [0, 0.5, 1],
        };
    }

    // Few clouds
    if (weatherCode === '02d') {
        return {
            colors: ['#87CEEB', '#4682B4', '#1E90FF'], // Sky blue
            locations: [0, 0.5, 1],
        };
    }

    if (weatherCode === '02n') {
        return {
            colors: ['#2c3e50', '#34495e', '#1a252f'], // Dark gray night
            locations: [0, 0.5, 1],
        };
    }

    // Cloudy
    if (weatherCode.startsWith('03') || weatherCode.startsWith('04')) {
        return {
            colors: isNight
                ? ['#2c3e50', '#34495e', '#95a5a6']
                : ['#95a5a6', '#7f8c8d', '#bdc3c7'], // Gray
            locations: [0, 0.5, 1],
        };
    }

    // Rain / Showers
    if (weatherCode.startsWith('09') || weatherCode.startsWith('10')) {
        return {
            colors: isNight
                ? ['#1a237e', '#283593', '#3949ab']
                : ['#4682B4', '#5F9EA0', '#708090'], // Steel blue
            locations: [0, 0.5, 1],
        };
    }

    // Thunderstorm
    if (weatherCode.startsWith('11')) {
        return {
            colors: ['#2c3e50', '#8e44ad', '#9b59b6'], // Dark purple
            locations: [0, 0.5, 1],
        };
    }

    // Snow
    if (weatherCode.startsWith('13')) {
        return {
            colors: ['#E0F7FA', '#B2EBF2', '#80DEEA'], // Light blue/white
            locations: [0, 0.5, 1],
        };
    }

    // Mist / Fog
    if (weatherCode.startsWith('50')) {
        return {
            colors: ['#ECEFF1', '#CFD8DC', '#B0BEC5'], // Light gray
            locations: [0, 0.5, 1],
        };
    }

    // Default gradient
    return {
        colors: isNight
            ? ['#1a1a2e', '#16213e', '#0f3460']
            : ['#87CEEB', '#4682B4', '#1E90FF'],
        locations: [0, 0.5, 1],
    };
};

/**
 * Get gradient based on temperature (for extreme heat/cold)
 */
export const getTemperatureGradient = (temperature: number): WeatherGradient => {
    // Extreme heat (>40°C)
    if (temperature > 40) {
        return {
            colors: ['#FF4500', '#FF6347', '#FF7F50'], // Hot red-orange
            locations: [0, 0.5, 1],
        };
    }

    // Very hot (35-40°C)
    if (temperature > 35) {
        return {
            colors: ['#FFA500', '#FFB347', '#FFC966'], // Orange
            locations: [0, 0.5, 1],
        };
    }

    // Hot (30-35°C)
    if (temperature > 30) {
        return {
            colors: ['#FFD700', '#FFE55C', '#FFF176'], // Yellow
            locations: [0, 0.5, 1],
        };
    }

    // Cold (0-10°C)
    if (temperature < 10) {
        return {
            colors: ['#B3E5FC', '#81D4FA', '#4FC3F7'], // Light blue
            locations: [0, 0.5, 1],
        };
    }

    // Very cold (<0°C)
    if (temperature < 0) {
        return {
            colors: ['#E1F5FE', '#B3E5FC', '#81D4FA'], // Icy blue
            locations: [0, 0.5, 1],
        };
    }

    // Normal temperature
    return {
        colors: ['#87CEEB', '#4682B4', '#1E90FF'],
        locations: [0, 0.5, 1],
    };
};

/**
 * Get combined gradient based on weather and temperature
 */
export const getSmartGradient = (
    weatherCode: string,
    temperature: number,
    isNight: boolean = false
): WeatherGradient => {
    // Prioritize extreme temperatures
    if (temperature > 40 || temperature < 0) {
        return getTemperatureGradient(temperature);
    }

    // Otherwise use weather-based gradient
    return getWeatherGradient(weatherCode, isNight);
};

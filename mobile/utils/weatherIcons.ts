/**
 * Maps OpenWeatherMap icon codes to Ionicons names
 * Covers all weather conditions with appropriate icons
 */
export const getWeatherIcon = (iconCode: string): string => {
    // Day icons (d suffix)
    if (iconCode === '01d') return 'sunny'; // Clear sky day
    if (iconCode === '02d') return 'partly-sunny'; // Few clouds day
    if (iconCode === '03d') return 'cloud'; // Scattered clouds
    if (iconCode === '04d') return 'cloudy'; // Broken clouds
    if (iconCode === '09d') return 'rainy'; // Shower rain
    if (iconCode === '10d') return 'rainy'; // Rain day
    if (iconCode === '11d') return 'thunderstorm'; // Thunderstorm
    if (iconCode === '13d') return 'snow'; // Snow
    if (iconCode === '50d') return 'cloud'; // Mist

    // Night icons (n suffix)
    if (iconCode === '01n') return 'moon'; // Clear sky night
    if (iconCode === '02n') return 'cloudy-night'; // Few clouds night
    if (iconCode === '03n') return 'cloud'; // Scattered clouds night
    if (iconCode === '04n') return 'cloudy'; // Broken clouds night
    if (iconCode === '09n') return 'rainy'; // Shower rain night
    if (iconCode === '10n') return 'rainy'; // Rain night
    if (iconCode === '11n') return 'thunderstorm'; // Thunderstorm night
    if (iconCode === '13n') return 'snow'; // Snow night
    if (iconCode === '50n') return 'cloud'; // Mist night

    // Default fallback
    return 'cloud';
};

/**
 * Gets color for weather icon based on condition
 */
export const getWeatherIconColor = (iconCode: string, isDark: boolean): string => {
    if (iconCode.startsWith('01')) return '#FFD700'; // Sunny/Clear - Gold
    if (iconCode.startsWith('02')) return '#FFA500'; // Partly cloudy - Orange
    if (iconCode.startsWith('03') || iconCode.startsWith('04')) return '#808080'; // Cloudy - Gray
    if (iconCode.startsWith('09') || iconCode.startsWith('10')) return '#4682B4'; // Rain - Steel Blue
    if (iconCode.startsWith('11')) return '#9370DB'; // Thunderstorm - Purple
    if (iconCode.startsWith('13')) return '#87CEEB'; // Snow - Sky Blue
    if (iconCode.startsWith('50')) return '#B0C4DE'; // Mist - Light Steel Blue

    return isDark ? '#FFFFFF' : '#000000'; // Default
};

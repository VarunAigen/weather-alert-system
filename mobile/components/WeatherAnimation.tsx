/**
 * Weather Animation Component
 * Uses LOCAL Lottie animations from assets/animations/
 */

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';
import { getWeatherIcon, getWeatherIconColor } from '../utils/weatherIcons';

interface WeatherAnimationProps {
    iconCode: string;
    size?: number;
}

export const WeatherAnimation: React.FC<WeatherAnimationProps> = ({ iconCode, size = 150 }) => {
    const animationRef = useRef<LottieView>(null);
    const [useFallback, setUseFallback] = React.useState(false);

    useEffect(() => {
        animationRef.current?.play();
    }, [iconCode]);

    // Map weather icon codes to LOCAL Lottie animations
    const getAnimationSource = (code: string) => {
        try {
            const animations: { [key: string]: any } = {
                // Clear sky - day (Sunny) → Happy SUN.json
                '01d': require('../assets/animations/sunny.json'),

                // Clear sky - night (Moon) → Weather-night.json
                '01n': require('../assets/animations/night.json'),

                // Few clouds - day (Partly Cloudy) → Weather-partly cloudy.json
                '02d': require('../assets/animations/partly-cloudy.json'),

                // Few clouds - night → Weather-night.json (reuse)
                '02n': require('../assets/animations/cloudy-night.json'),

                // Scattered/Broken clouds (Cloudy) → Weather-windy.json
                '03d': require('../assets/animations/cloudy.json'),
                '03n': require('../assets/animations/cloudy.json'),
                '04d': require('../assets/animations/cloudy.json'),
                '04n': require('../assets/animations/cloudy.json'),

                // Shower rain / Rain → rainy icon.json
                '09d': require('../assets/animations/rain.json'),
                '09n': require('../assets/animations/rain.json'),
                '10d': require('../assets/animations/rain.json'),
                '10n': require('../assets/animations/rain.json'),

                // Thunderstorm → Weather-storm.json
                '11d': require('../assets/animations/thunderstorm.json'),
                '11n': require('../assets/animations/thunderstorm.json'),

                // Snow → snow icon.json
                '13d': require('../assets/animations/snow.json'),
                '13n': require('../assets/animations/snow.json'),

                // Mist/Fog → Fog_Smoke.json
                '50d': require('../assets/animations/mist.json'),
                '50n': require('../assets/animations/mist.json'),
            };

            return animations[code] || animations['01d']; // Default to sunny
        } catch (error) {
            console.error('Error loading animation:', error);
            return null;
        }
    };

    const animationSource = getAnimationSource(iconCode);

    // Fallback to Ionicons if animation fails to load
    if (useFallback || !animationSource) {
        return (
            <View style={[styles.container, { width: size, height: size }]}>
                <Ionicons
                    name={getWeatherIcon(iconCode) as any}
                    size={size * 0.6}
                    color={getWeatherIconColor(iconCode, false)}
                />
            </View>
        );
    }

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <LottieView
                ref={animationRef}
                source={animationSource}
                autoPlay
                loop
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
                onAnimationFailure={() => setUseFallback(true)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

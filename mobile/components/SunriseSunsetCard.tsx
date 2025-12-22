/**
 * Sunrise/Sunset Card
 * Displays sunrise and sunset times with arc visualization
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface SunriseSunsetCardProps {
    sunrise: Date;
    sunset: Date;
    currentTime?: Date;
}

export const SunriseSunsetCard: React.FC<SunriseSunsetCardProps> = ({
    sunrise,
    sunset,
    currentTime = new Date(),
}) => {
    const { colors } = useTheme();

    // Calculate sun position (0 to 1, where 0 is sunrise and 1 is sunset)
    const sunriseTime = sunrise.getTime();
    const sunsetTime = sunset.getTime();
    const currentTimeMs = currentTime.getTime();

    let sunPosition = 0;
    if (currentTimeMs >= sunriseTime && currentTimeMs <= sunsetTime) {
        sunPosition = (currentTimeMs - sunriseTime) / (sunsetTime - sunriseTime);
    } else if (currentTimeMs > sunsetTime) {
        sunPosition = 1;
    }

    // Arc parameters
    const width = 200;
    const height = 100;
    const radius = 90;
    const centerX = width / 2;
    const centerY = height - 10;

    // Calculate sun position on arc
    const angle = Math.PI * sunPosition; // 0 to PI
    const sunX = centerX - radius * Math.cos(angle);
    const sunY = centerY - radius * Math.sin(angle);

    // Create arc path
    const arcPath = `M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`;

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.header}>
                <Ionicons name="sunny" size={20} color={colors.tint} />
                <Text style={[styles.title, { color: colors.text }]}>Sun Position</Text>
            </View>

            {/* Arc Visualization */}
            <View style={styles.arcContainer}>
                <Svg width={width} height={height}>
                    {/* Background arc */}
                    <Path
                        d={arcPath}
                        stroke={colors.border}
                        strokeWidth="3"
                        fill="none"
                    />

                    {/* Progress arc */}
                    {sunPosition > 0 && (
                        <Path
                            d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${sunX} ${sunY}`}
                            stroke={colors.tint}
                            strokeWidth="3"
                            fill="none"
                        />
                    )}

                    {/* Sun indicator */}
                    {sunPosition > 0 && sunPosition < 1 && (
                        <Circle
                            cx={sunX}
                            cy={sunY}
                            r="8"
                            fill="#FFD700"
                            stroke={colors.tint}
                            strokeWidth="2"
                        />
                    )}
                </Svg>
            </View>

            {/* Times */}
            <View style={styles.timesContainer}>
                <View style={styles.timeItem}>
                    <Ionicons name="arrow-up" size={16} color={colors.tabIconDefault} />
                    <Text style={[styles.timeLabel, { color: colors.tabIconDefault }]}>Sunrise</Text>
                    <Text style={[styles.timeValue, { color: colors.text }]}>{formatTime(sunrise)}</Text>
                </View>

                <View style={styles.timeItem}>
                    <Ionicons name="arrow-down" size={16} color={colors.tabIconDefault} />
                    <Text style={[styles.timeLabel, { color: colors.tabIconDefault }]}>Sunset</Text>
                    <Text style={[styles.timeValue, { color: colors.text }]}>{formatTime(sunset)}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        marginVertical: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    arcContainer: {
        alignItems: 'center',
        marginVertical: 8,
    },
    timesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    timeItem: {
        alignItems: 'center',
    },
    timeLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    timeValue: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 2,
    },
});

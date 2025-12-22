import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { HourlyForecast } from '../types';
import { getWeatherIcon, getWeatherIconColor } from '../utils/weatherIcons';

interface HourlyForecastChartProps {
    forecast: HourlyForecast[];
}

export const HourlyForecastChart: React.FC<HourlyForecastChartProps> = ({ forecast }) => {
    const { colors, isDark } = useTheme();

    // 🔹 NEW STATE
    const [isExpanded, setIsExpanded] = useState(false);

    const next24Hours = forecast.slice(0, 8);

    const temps = next24Hours.map(item => item.temperature);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const tempRange = maxTemp - minTemp || 1;

    const getTempPosition = (temp: number) => {
        return 100 - ((temp - minTemp) / tempRange) * 100;
    };

    const formatTime = (timestamp: Date | string) => {
        const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
        const hours = date.getHours();
        return `${hours}:00`;
    };

    const renderHourItem = (item: HourlyForecast, index: number) => {
        const iconName = getWeatherIcon(item.icon);
        const iconColor = getWeatherIconColor(item.icon, isDark);
        const position = getTempPosition(item.temperature);

        return (
            <View key={index} style={styles.hourItem}>
                <Text style={[styles.time, { color: colors.tabIconDefault }]}>
                    {index === 0 ? 'Now' : formatTime(item.timestamp)}
                </Text>

                <Ionicons name={iconName as any} size={24} color={iconColor} />

                <View style={styles.chartColumn}>
                    <View
                        style={[
                            styles.tempDot,
                            { top: `${position}%`, backgroundColor: colors.tint },
                        ]}
                    />
                </View>

                <Text style={[styles.temp, { color: colors.text }]}>
                    {Math.round(item.temperature)}°
                </Text>
            </View>
        );
    };

    return (
        // 🔹 PRESSABLE CONTAINER
        <Pressable
            onPress={() => setIsExpanded(prev => !prev)}
            style={[
                styles.container,
                { backgroundColor: colors.card, borderColor: colors.border },
            ]}
        >
            {/* Header */}
            <View style={styles.header}>
                <Ionicons name="time" size={20} color={colors.tint} />
                <Text style={[styles.title, { color: colors.text }]}>
                    24-Hour Forecast
                </Text>

                {/* 🔹 Arrow Indicator */}
                <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.text}
                    style={{ marginLeft: 'auto' }}
                />
            </View>

            {/* 🔹 SHOW DATA ONLY WHEN CLICKED */}
            {isExpanded && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {next24Hours.map(renderHourItem)}
                </ScrollView>
            )}
        </Pressable>
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
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    scrollContent: {
        paddingTop: 16,
    },
    hourItem: {
        alignItems: 'center',
        marginRight: 24,
        width: 60,
    },
    time: {
        fontSize: 12,
        marginBottom: 8,
    },
    chartColumn: {
        height: 20,
        width: 2,
        backgroundColor: 'rgba(128,128,128,0.2)',
        position: 'relative',
        marginVertical: 8,
    },
    tempDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        position: 'absolute',
        left: -3,
    },
    temp: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 8,
    },
});

/**
 * Weather Details Grid
 * Displays weather metrics in a grid layout
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface WeatherDetail {
    icon: string;
    label: string;
    value: string;
    unit?: string;
}

interface WeatherDetailsGridProps {
    humidity: number;
    feelsLike: number;
    uvIndex?: number;
    pressure: number;
    rainChance?: number;
    visibility: number;
}

export const WeatherDetailsGrid: React.FC<WeatherDetailsGridProps> = ({
    humidity,
    feelsLike,
    uvIndex = 0,
    pressure,
    rainChance = 0,
    visibility,
}) => {
    const { colors } = useTheme();

    const details: WeatherDetail[] = [
        {
            icon: 'water',
            label: 'Humidity',
            value: humidity.toString(),
            unit: '%',
        },
        {
            icon: 'thermometer',
            label: 'Real Feel',
            value: Math.round(feelsLike).toString(),
            unit: '°',
        },
        {
            icon: 'sunny',
            label: 'UV Index',
            value: uvIndex.toString(),
        },
        {
            icon: 'speedometer',
            label: 'Pressure',
            value: pressure.toString(),
            unit: 'mb',
        },
        {
            icon: 'rainy',
            label: 'Rain Chance',
            value: rainChance.toString(),
            unit: '%',
        },
        {
            icon: 'eye',
            label: 'Visibility',
            value: visibility.toFixed(1),
            unit: 'km',
        },
    ];

    const renderDetail = (detail: WeatherDetail, index: number) => (
        <View
            key={index}
            style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
            <Ionicons name={detail.icon as any} size={24} color={colors.tint} />
            <Text style={[styles.label, { color: colors.tabIconDefault }]}>{detail.label}</Text>
            <View style={styles.valueContainer}>
                <Text style={[styles.value, { color: colors.text }]}>{detail.value}</Text>
                {detail.unit && (
                    <Text style={[styles.unit, { color: colors.tabIconDefault }]}>{detail.unit}</Text>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {details.map((detail, index) => renderDetail(detail, index))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    detailCard: {
        width: '48%',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        marginBottom: 12,
        alignItems: 'center',
    },
    label: {
        fontSize: 12,
        marginTop: 8,
        marginBottom: 4,
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    value: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    unit: {
        fontSize: 14,
        marginLeft: 2,
    },
});

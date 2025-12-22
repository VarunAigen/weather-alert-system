import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { DailyForecast } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { getWeatherIcon, getWeatherIconColor } from '../utils/weatherIcons';

interface ForecastCardProps {
    forecast: DailyForecast[];
}

export const ForecastCard: React.FC<ForecastCardProps> = ({ forecast }) => {
    const { colors, isDark } = useTheme();

    const renderItem = ({ item }: { item: DailyForecast }) => {
        const date = new Date(item.date);
        const day = date.toLocaleDateString(undefined, { weekday: 'short' });
        const formattedDate = date.getDate();
        const iconName = getWeatherIcon(item.icon);
        const iconColor = getWeatherIconColor(item.icon, isDark);

        return (
            <View style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.day, { color: colors.text }]}>{day}</Text>
                <Text style={[styles.date, { color: colors.tabIconDefault }]}>{formattedDate}</Text>

                <Ionicons
                    name={iconName as any}
                    size={40}
                    color={iconColor}
                    style={styles.icon}
                />

                <Text style={[styles.max, { color: colors.text }]}>{Math.round(item.temp_max)}°</Text>
                <Text style={[styles.min, { color: colors.tabIconDefault }]}>{Math.round(item.temp_min)}°</Text>

                {item.rain_chance > 20 && (
                    <View style={styles.rainContainer}>
                        <Text style={styles.rainText}>{item.rain_chance}%</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: colors.text }]}>7-Day Forecast</Text>
            <FlatList
                data={forecast}
                renderItem={renderItem}
                keyExtractor={(item) => item.date}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        marginLeft: 4,
    },
    list: {
        paddingBottom: 10,
    },
    item: {
        alignItems: 'center',
        padding: 12,
        marginRight: 10,
        borderRadius: 16,
        borderWidth: 1,
        minWidth: 70,
    },
    day: {
        fontWeight: '600',
        fontSize: 14,
    },
    date: {
        fontSize: 12,
        marginBottom: 4,
    },
    icon: {
        marginVertical: 4,
    },
    max: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    min: {
        fontSize: 12,
    },
    rainContainer: {
        marginTop: 4,
        backgroundColor: '#e3f2fdff',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    rainText: {
        color: '#1976D2',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

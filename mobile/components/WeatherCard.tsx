import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { CurrentWeather, Location } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { getWeatherIcon, getWeatherIconColor } from '../utils/weatherIcons';

interface WeatherCardProps {
    weather: CurrentWeather;
    location: Location;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, location }) => {
    const { colors, isDark } = useTheme();
    const iconName = getWeatherIcon(weather.icon);
    const iconColor = getWeatherIconColor(weather.icon, isDark);

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.city, { color: colors.text }]}>{location.city}</Text>
                    <Text style={[styles.country, { color: colors.tabIconDefault }]}>{location.country}</Text>
                </View>
                <View style={styles.dateContainer}>
                    <Text style={[styles.date, { color: colors.tabIconDefault }]}>
                        {new Date(weather.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </Text>
                </View>
            </View>

            <View style={styles.mainInfo}>
                <Ionicons
                    name={iconName as any}
                    size={100}
                    color={iconColor}
                    style={styles.icon}
                />
                <View>
                    <Text style={[styles.temp, { color: colors.text }]}>{Math.round(weather.temperature)}°</Text>
                    <Text style={[styles.condition, { color: colors.text }]}>{weather.condition}</Text>
                </View>
            </View>

            <View style={[styles.details, { borderTopColor: colors.border }]}>
                <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.tabIconDefault }]}>Feels Like</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{Math.round(weather.feels_like)}°</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.tabIconDefault }]}>Humidity</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{weather.humidity}%</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.tabIconDefault }]}>Wind</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{Math.round(weather.wind_speed)} km/h</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        padding: 20,
        marginVertical: 10,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    city: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    country: {
        fontSize: 16,
        marginTop: 2,
    },
    dateContainer: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    date: {
        fontSize: 12,
        fontWeight: '600',
    },
    mainInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 15,
    },
    icon: {
        marginRight: 10,
    },
    temp: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    condition: {
        fontSize: 18,
        textTransform: 'capitalize',
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 15,
        borderTopWidth: 1,
    },
    detailItem: {
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
    },
});

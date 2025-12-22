/**
 * Weather Info Grid - EXACT match to reference image
 * Layout: 2 rows x 2 columns
 * Top-left: Wind compass | Top-right: Weather stats (5 items)
 * Bottom-left: Sunrise/Sunset arc | Bottom-right: (empty/reserved)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';

interface WeatherInfoGridProps {
    windSpeed: number;
    windDirection: number;
    humidity: number;
    feelsLike: number;
    uvIndex: number;
    sunrise: Date;
    sunset: Date;
    pressure: number;
    rainChance: number;
}

export const WeatherInfoGrid: React.FC<WeatherInfoGridProps> = ({
    windSpeed,
    windDirection,
    humidity,
    feelsLike,
    uvIndex,
    sunrise,
    sunset,
    pressure,
    rainChance,
}) => {
    const { colors } = useTheme();

    const formatTime = (date: Date) => {
        // Validate date object
        if (!date || isNaN(date.getTime())) {
            return '--:--';
        }
        try {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (error) {
            console.error('Error formatting time:', error);
            return '--:--';
        }
    };

    const getCardinalDirection = (degrees: number): string => {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(degrees / 45) % 8;
        return directions[index];
    };

    // Wind compass - smaller, simpler
    const compassSize = 80;
    const compassCenter = compassSize / 2;
    const compassRadius = compassSize / 2 - 10;
    const angleRad = ((windDirection - 90) * Math.PI) / 180;
    const arrowLength = compassRadius - 5;
    const arrowX = compassCenter + arrowLength * Math.cos(angleRad);
    const arrowY = compassCenter + arrowLength * Math.sin(angleRad);

    // Sunrise/Sunset arc
    const arcWidth = 120;
    const arcHeight = 60;
    const arcRadius = 50;
    const arcCenterX = arcWidth / 2;
    const arcCenterY = arcHeight;
    const arcPath = `M ${arcCenterX - arcRadius} ${arcCenterY} A ${arcRadius} ${arcRadius} 0 0 1 ${arcCenterX + arcRadius} ${arcCenterY}`;

    const cardBg = 'rgba(255, 255, 255, 0.1)';
    const textColor = '#FFFFFF';
    const labelColor = 'rgba(255, 255, 255, 0.7)';

    return (
        <View style={styles.container}>
            {/* Top Row */}
            <View style={styles.row}>
                {/* Wind Card - Top Left */}
                <View style={[styles.card, { backgroundColor: cardBg }]}>
                    <View style={styles.windLeft}>
                        <Text style={[styles.windLabel, { color: labelColor }]}>
                            {getCardinalDirection(windDirection)}
                        </Text>
                        <Text style={[styles.windValue, { color: textColor }]}>
                            {windSpeed.toFixed(1)}km/h
                        </Text>
                    </View>

                    <View style={styles.compassWrapper}>
                        <Svg width={compassSize} height={compassSize}>
                            <Circle
                                cx={compassCenter}
                                cy={compassCenter}
                                r={compassRadius}
                                stroke="rgba(255,255,255,0.3)"
                                strokeWidth="1.5"
                                fill="none"
                            />
                            <SvgText x={compassCenter} y={10} fontSize="10" fill={textColor} textAnchor="middle">N</SvgText>
                            <SvgText x={compassSize - 6} y={compassCenter + 3} fontSize="10" fill={textColor} textAnchor="middle">E</SvgText>
                            <SvgText x={compassCenter} y={compassSize - 2} fontSize="10" fill={textColor} textAnchor="middle">S</SvgText>
                            <SvgText x={6} y={compassCenter + 3} fontSize="10" fill={textColor} textAnchor="middle">W</SvgText>

                            <Line
                                x1={compassCenter}
                                y1={compassCenter}
                                x2={arrowX}
                                y2={arrowY}
                                stroke={textColor}
                                strokeWidth="2"
                            />
                            <Circle cx={compassCenter} cy={compassCenter} r="2" fill={textColor} />
                        </Svg>
                    </View>
                </View>

                {/* Stats Card - Top Right */}
                <View style={[styles.card, { backgroundColor: cardBg }]}>
                    <View style={styles.statRow}>
                        <Text style={[styles.statLabel, { color: labelColor }]}>Humidity</Text>
                        <Text style={[styles.statValue, { color: textColor }]}>{humidity}%</Text>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={[styles.statLabel, { color: labelColor }]}>Real feel</Text>
                        <Text style={[styles.statValue, { color: textColor }]}>{Math.round(feelsLike)}°</Text>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={[styles.statLabel, { color: labelColor }]}>UV</Text>
                        <Text style={[styles.statValue, { color: textColor }]}>{uvIndex}</Text>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={[styles.statLabel, { color: labelColor }]}>Pressure</Text>
                        <Text style={[styles.statValue, { color: textColor }]}>{pressure}mbar</Text>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={[styles.statLabel, { color: labelColor }]}>Chance of rain</Text>
                        <Text style={[styles.statValue, { color: textColor }]}>{rainChance}%</Text>
                    </View>
                </View>
            </View>

            {/* Bottom Row */}
            <View style={styles.row}>
                {/* Sunrise/Sunset Card - Bottom Left */}
                <View style={[styles.card, { backgroundColor: cardBg }]}>
                    <View style={styles.sunContent}>
                        <View style={styles.arcWrapper}>
                            <Svg width={arcWidth} height={arcHeight}>
                                <Path
                                    d={arcPath}
                                    stroke="rgba(203, 197, 197, 0.94)"
                                    strokeWidth="5"
                                    fill="none"
                                />

                                {/* Animated sun position */}
                                {(() => {
                                    const now = new Date();
                                    const sunriseTime = sunrise.getTime();
                                    const sunsetTime = sunset.getTime();
                                    const currentTime = now.getTime();

                                    let sunPosition = 0;
                                    if (currentTime >= sunriseTime && currentTime <= sunsetTime) {
                                        sunPosition = (currentTime - sunriseTime) / (sunsetTime - sunriseTime);
                                    } else if (currentTime > sunsetTime) {
                                        sunPosition = 1;
                                    }

                                    const angle = Math.PI * sunPosition;
                                    const sunX = arcCenterX - arcRadius * Math.cos(angle);
                                    const sunY = arcCenterY - arcRadius * Math.sin(angle);

                                    if (sunPosition > 0 && sunPosition < 1) {
                                        return (
                                            <Circle
                                                cx={sunX}
                                                cy={sunY}
                                                r="6"
                                                fill="#FFD700"
                                                stroke="#FFA500"
                                                strokeWidth="2"
                                            />
                                        );
                                    }
                                    return null;
                                })()}
                            </Svg>
                        </View>

                        <View style={styles.sunTimes}>
                            <View style={styles.sunTimeItem}>
                                <Text style={[styles.sunTime, { color: textColor }]}>{formatTime(sunrise)}</Text>
                                <Text style={[styles.sunLabel, { color: labelColor }]}>Sunrise</Text>
                            </View>
                            <View style={styles.sunTimeItem}>
                                <Text style={[styles.sunTime, { color: textColor }]}>{formatTime(sunset)}</Text>
                                <Text style={[styles.sunLabel, { color: labelColor }]}>Sunset</Text>
                            </View>
                        </View>
                    </View>
                </View>


            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 12,
    },
    card: {
        flex: 1,
        borderRadius: 20,
        padding: 16,
        minHeight: 140,
    },
    // Wind card styles
    windLeft: {
        marginBottom: 8,
    },
    windLabel: {
        fontSize: 16,
        marginBottom: 4,
    },
    windValue: {
        fontSize: 18,
        fontWeight: '400',
    },
    compassWrapper: {
        alignItems: 'center',
        marginTop: 8,
    },
    // Stats card styles
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    statLabel: {
        fontSize: 14,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '400',
    },
    // Sunrise/Sunset card styles
    sunContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    arcWrapper: {
        alignItems: 'center',
        marginTop: 10,
    },
    sunTimes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    sunTimeItem: {
        alignItems: 'flex-start',
    },
    sunTime: {
        fontSize: 16,
        fontWeight: '400',
    },
    sunLabel: {
        fontSize: 12,
        marginTop: 2,
    },
});

/**
 * Wind Compass Component
 * Displays wind direction and speed with compass visualization
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Circle, Line, Text as SvgText, Polygon } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface WindCompassProps {
    windSpeed: number; // km/h
    windDirection: number; // degrees (0-360)
}

export const WindCompass: React.FC<WindCompassProps> = ({ windSpeed, windDirection }) => {
    const { colors } = useTheme();

    const size = 140;
    const center = size / 2;
    const radius = size / 2 - 20;

    // Convert wind direction to radians (0° = North, clockwise)
    const angleRad = ((windDirection - 90) * Math.PI) / 180;

    // Calculate arrow endpoint
    const arrowLength = radius - 10;
    const arrowX = center + arrowLength * Math.cos(angleRad);
    const arrowY = center + arrowLength * Math.sin(angleRad);

    // Get cardinal direction
    const getCardinalDirection = (degrees: number): string => {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(degrees / 45) % 8;
        return directions[index];
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.header}>
                <Ionicons name="navigate" size={20} color={colors.tint} />
                <Text style={[styles.title, { color: colors.text }]}>Wind</Text>
            </View>

            {/* Compass */}
            <View style={styles.compassContainer}>
                <Svg width={size} height={size}>
                    {/* Outer circle */}
                    <Circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke={colors.border}
                        strokeWidth="2"
                        fill="none"
                    />

                    {/* Cardinal directions */}
                    <SvgText
                        x={center}
                        y={15}
                        fontSize="14"
                        fontWeight="bold"
                        fill={colors.text}
                        textAnchor="middle"
                    >
                        N
                    </SvgText>
                    <SvgText
                        x={size - 10}
                        y={center + 5}
                        fontSize="14"
                        fontWeight="bold"
                        fill={colors.text}
                        textAnchor="middle"
                    >
                        E
                    </SvgText>
                    <SvgText
                        x={center}
                        y={size - 5}
                        fontSize="14"
                        fontWeight="bold"
                        fill={colors.text}
                        textAnchor="middle"
                    >
                        S
                    </SvgText>
                    <SvgText
                        x={10}
                        y={center + 5}
                        fontSize="14"
                        fontWeight="bold"
                        fill={colors.text}
                        textAnchor="middle"
                    >
                        W
                    </SvgText>

                    {/* Wind direction arrow */}
                    <Line
                        x1={center}
                        y1={center}
                        x2={arrowX}
                        y2={arrowY}
                        stroke={colors.tint}
                        strokeWidth="3"
                    />

                    {/* Arrow head */}
                    <Polygon
                        points={`${arrowX},${arrowY} ${arrowX - 5},${arrowY - 10} ${arrowX + 5},${arrowY - 10}`}
                        fill={colors.tint}
                        rotation={windDirection}
                        origin={`${arrowX},${arrowY}`}
                    />

                    {/* Center dot */}
                    <Circle cx={center} cy={center} r="4" fill={colors.tint} />
                </Svg>
            </View>

            {/* Wind info */}
            <View style={styles.infoContainer}>
                <Text style={[styles.speedValue, { color: colors.text }]}>
                    {Math.round(windSpeed)}
                </Text>
                <Text style={[styles.speedUnit, { color: colors.tabIconDefault }]}>km/h</Text>
            </View>
            <Text style={[styles.direction, { color: colors.tabIconDefault }]}>
                {getCardinalDirection(windDirection)}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        marginVertical: 8,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        alignSelf: 'flex-start',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    compassContainer: {
        marginVertical: 8,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 8,
    },
    speedValue: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    speedUnit: {
        fontSize: 14,
        marginLeft: 4,
    },
    direction: {
        fontSize: 14,
        marginTop: 4,
    },
});

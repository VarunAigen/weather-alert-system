import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Alert } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface AlertCardProps {
    alert: Alert;
    onDismiss?: (id: string) => void;
    showDismiss?: boolean;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onDismiss, showDismiss = true }) => {
    const { colors } = useTheme();

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'LOW': return colors.riskLow;
            case 'MODERATE': return colors.riskModerate;
            case 'HIGH': return colors.riskHigh;
            case 'SEVERE': return colors.riskSevere;
            default: return colors.riskLow;
        }
    };

    const severityColor = getSeverityColor(alert.severity);

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderLeftColor: severityColor }]}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Ionicons name="warning" size={24} color={severityColor} />
                    <Text style={[styles.title, { color: colors.text }]}>{alert.title}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: severityColor + '20' }]}>
                    <Text style={[styles.badgeText, { color: severityColor }]}>{alert.severity}</Text>
                </View>
            </View>

            <Text style={[styles.message, { color: colors.text }]}>{alert.message}</Text>

            {alert.recommendations.length > 0 && (
                <View style={styles.recommendations}>
                    <Text style={[styles.recTitle, { color: colors.tabIconDefault }]}>Recommendations:</Text>
                    {alert.recommendations.slice(0, 2).map((rec, index) => (
                        <View key={index} style={styles.recItem}>
                            <Text style={[styles.bullet, { color: colors.text }]}>•</Text>
                            <Text style={[styles.recText, { color: colors.text }]}>{rec}</Text>
                        </View>
                    ))}
                </View>
            )}

            {showDismiss && onDismiss && (
                <TouchableOpacity
                    style={[styles.dismissBtn, { borderColor: colors.border }]}
                    onPress={() => onDismiss(alert.id)}
                >
                    <Text style={[styles.dismissText, { color: colors.tabIconDefault }]}>Dismiss</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        borderLeftWidth: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
        flex: 1,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    message: {
        fontSize: 15,
        marginBottom: 12,
        lineHeight: 22,
    },
    recommendations: {
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    recTitle: {
        fontSize: 12,
        marginBottom: 6,
        fontWeight: '600',
    },
    recItem: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    bullet: {
        marginRight: 6,
        fontSize: 14,
    },
    recText: {
        fontSize: 14,
        flex: 1,
    },
    dismissBtn: {
        marginTop: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderRadius: 6,
        alignItems: 'center',
    },
    dismissText: {
        fontSize: 14,
        fontWeight: '500',
    },
});

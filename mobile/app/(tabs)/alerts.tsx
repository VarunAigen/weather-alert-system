import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAlerts } from '../../contexts/AlertContext';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCard } from '../../components/AlertCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function AlertsScreen() {
    const { colors } = useTheme();
    const { activeAlerts, alertHistory, checkAlerts, dismissAlert, loading } = useAlerts();
    const { user } = useAuth();

    useEffect(() => {
        checkAlerts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={checkAlerts} tintColor={colors.tint} />
                }
            >
                <View style={styles.header}>
                    <Text style={[styles.screenTitle, { color: colors.text }]}>Smart Alerts</Text>
                    <Text style={[styles.greeting, { color: colors.tabIconDefault }]}>
                        Stay safe, {user?.displayName || user?.email?.split('@')[0] || 'User'}! 🛡️
                    </Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="flash-outline" size={20} color={colors.text} style={styles.icon} />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Alerts</Text>
                        {activeAlerts.length > 0 && (
                            <View style={[styles.badge, { backgroundColor: colors.riskHigh }]}>
                                <Text style={styles.badgeText}>{activeAlerts.length}</Text>
                            </View>
                        )}
                    </View>

                    {activeAlerts.length === 0 ? (
                        <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                            <Ionicons name="checkmark-circle-outline" size={48} color={colors.riskLow} />
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Active Alerts</Text>
                            <Text style={[styles.emptySubtitle, { color: colors.tabIconDefault }]}>
                                Conditions are currently safe in your area.
                            </Text>
                        </View>
                    ) : (
                        activeAlerts.map(alert => (
                            <AlertCard
                                key={alert.id}
                                alert={alert}
                                onDismiss={dismissAlert}
                                showDismiss={true}
                            />
                        ))
                    )}
                </View>

                {alertHistory.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="time-outline" size={20} color={colors.text} style={styles.icon} />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent History</Text>
                        </View>

                        {alertHistory.slice(0, 10).map(alert => (
                            <AlertCard
                                key={alert.id}
                                alert={alert}
                                showDismiss={false}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 8,
    },
    greeting: {
        fontSize: 15,
        marginTop: 4,
        marginBottom: 12,
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    icon: {
        marginRight: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyState: {
        padding: 30,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 12,
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
    },
});

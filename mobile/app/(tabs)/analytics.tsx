import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalDisasterMap from '../../components/GlobalDisasterMap';

export default function AnalyticsScreen() {
    const { colors } = useTheme();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>
                    Global Disaster Map
                </Text>
                <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
                    Worldwide earthquakes and tsunamis
                </Text>
            </View>
            <GlobalDisasterMap />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
    },
});

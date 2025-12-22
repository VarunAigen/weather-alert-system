import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Switch, TouchableOpacity, Alert, Clipboard } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAlerts } from '../../contexts/AlertContext';
import { useAuth } from '../../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { USER_TYPES } from '../../utils/constants';
import { UserType } from '../../types';
import { DEFAULT_THRESHOLDS, THRESHOLD_RANGES, THRESHOLD_INFO, getDefaultThresholds, type AlertThresholds } from '../../constants/thresholds';
import * as Notifications from 'expo-notifications';
import { firebaseService } from '../../services/firebaseService';

export default function SettingsScreen() {
    const { colors, toggleTheme, isDark } = useTheme();
    const { preferences, savePreferences, loading } = useAlerts();
    const { user } = useAuth(); // Get logged-in user

    // Local state for thresholds - start with general defaults
    const [thresholds, setThresholds] = useState<AlertThresholds>({
        heatwave: 38,
        heavyRain: 70,
        storm: 45,
        coldWave: 3,
        highHumidity: 85,
    });

    // Update local thresholds when preferences change
    useEffect(() => {
        console.log('=== Settings Screen Debug ===');
        console.log('Preferences:', JSON.stringify(preferences, null, 2));

        if (!preferences) {
            console.log('No preferences yet');
            return;
        }

        // Normalize user type to lowercase to match constants
        const userType = (preferences.user_type?.toLowerCase() || 'general') as keyof typeof DEFAULT_THRESHOLDS;
        console.log('User type (normalized):', userType);

        // Check if custom_thresholds is actually populated (not just empty {})
        const custom = preferences.custom_thresholds;
        const hasValidThresholds = custom &&
            typeof custom.heatwave_temp === 'number' &&
            typeof custom.heavy_rain_amount === 'number';

        console.log('Has valid custom thresholds?', hasValidThresholds);

        if (hasValidThresholds) {
            console.log('Loading custom thresholds:', custom);

            const newThresholds = {
                heatwave: custom.heatwave_temp!,
                heavyRain: custom.heavy_rain_amount!,
                storm: custom.high_wind_speed!,
                coldWave: custom.cold_wave_temp!,
                highHumidity: custom.high_humidity!,
            };
            console.log('Setting thresholds to:', newThresholds);
            setThresholds(newThresholds);
        } else {
            // No custom thresholds or empty object, use defaults for user type
            const defaults = getDefaultThresholds(userType);
            console.log('Using defaults for', userType, ':', defaults);
            setThresholds(defaults);
        }
    }, [preferences]);

    const updateUserType = (type: UserType) => {
        if (preferences) {
            // Normalize to lowercase to match constants
            const userType = type.toLowerCase() as keyof typeof DEFAULT_THRESHOLDS;
            const newDefaults = getDefaultThresholds(userType);

            console.log('Changing user type to:', type, '→', userType);
            console.log('New defaults:', newDefaults);

            // Update thresholds immediately
            setThresholds(newDefaults);

            // Save preferences with new user type AND new default thresholds
            savePreferences({
                ...preferences,
                user_type: type,
                custom_thresholds: {
                    heatwave_temp: newDefaults.heatwave,
                    heavy_rain_amount: newDefaults.heavyRain,
                    high_wind_speed: newDefaults.storm,
                    cold_wave_temp: newDefaults.coldWave,
                    high_humidity: newDefaults.highHumidity,
                }
            });
        }
    };

    const toggleNotifications = (value: boolean) => {
        if (preferences) {
            savePreferences({ ...preferences, notification_enabled: value });
        }
    };

    const clearOldAlerts = async () => {
        Alert.alert(
            '🧹 Clear Old Alerts',
            'This will delete all alert history older than 7 days. Continue?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const deletedCount = await firebaseService.cleanupOldAlerts(7);
                            Alert.alert(
                                '✅ Cleanup Complete',
                                `Deleted ${deletedCount} old alert${deletedCount !== 1 ? 's' : ''}`
                            );
                        } catch (error) {
                            Alert.alert('Error', 'Failed to clear old alerts');
                        }
                    }
                }
            ]
        );
    };


    const updateThreshold = (key: keyof AlertThresholds, value: number) => {
        setThresholds(prev => ({ ...prev, [key]: value }));
    };

    const saveThresholds = () => {
        if (preferences) {
            // Save thresholds to preferences
            savePreferences({
                ...preferences,
                custom_thresholds: {
                    heatwave_temp: thresholds.heatwave,
                    heavy_rain_amount: thresholds.heavyRain,
                    high_wind_speed: thresholds.storm,
                    cold_wave_temp: thresholds.coldWave,
                    high_humidity: thresholds.highHumidity,
                }
            });
            Alert.alert('Success', 'Thresholds saved successfully!');
        }
    };

    const resetToDefaults = () => {
        Alert.alert(
            'Reset to Defaults',
            'This will reset all thresholds to the recommended values for your user type. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        if (preferences?.user_type) {
                            const userType = preferences.user_type.toLowerCase() as keyof typeof DEFAULT_THRESHOLDS;
                            const defaults = getDefaultThresholds(userType);
                            setThresholds(defaults);
                            Alert.alert('Success', 'Thresholds reset to defaults!');
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* User Greeting */}
                <View style={styles.greetingContainer}>
                    <Text style={[styles.screenTitle, { color: colors.text }]}>Settings</Text>
                    <Text style={[styles.greeting, { color: colors.tabIconDefault }]}>
                        Hi, {user?.displayName || user?.email?.split('@')[0] || 'User'}! 👋
                    </Text>
                </View>

                {/* Appearance Section */}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.sectionHeader, { color: colors.tint }]}>Appearance</Text>
                    <View style={[styles.row, { borderBottomColor: colors.border }]}>
                        <View style={styles.rowLabel}>
                            <Ionicons name="moon-outline" size={22} color={colors.text} style={styles.icon} />
                            <Text style={[styles.label, { color: colors.text }]}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#767577', true: colors.tint }}
                        />
                    </View>
                </View>


                {/* Data Management Section */}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.sectionHeader, { color: colors.tint }]}>Data Management</Text>
                    <TouchableOpacity
                        style={[styles.row, { borderBottomWidth: 0 }]}
                        onPress={clearOldAlerts}
                    >
                        <View style={styles.rowLabel}>
                            <Ionicons name="trash-outline" size={22} color={colors.text} style={styles.icon} />
                            <View>
                                <Text style={[styles.label, { color: colors.text }]}>Clear Old Alerts</Text>
                                <Text style={[styles.sublabel, { color: colors.tabIconDefault }]}>
                                    Remove alerts older than 7 days
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={22} color={colors.tabIconDefault} />
                    </TouchableOpacity>
                </View>

                {/* Personalization Section */}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.sectionHeader, { color: colors.tint }]}>Personalization</Text>
                    <Text style={[styles.subText, { color: colors.tabIconDefault }]}>
                        Select your profile to receive tailored alerts
                    </Text>

                    <View style={styles.userTypes}>
                        {USER_TYPES.map((type) => (
                            <TouchableOpacity
                                key={type.value}
                                style={[
                                    styles.typeButton,
                                    {
                                        borderColor: colors.border,
                                        backgroundColor: preferences?.user_type === type.value ? colors.tint : 'transparent'
                                    }
                                ]}
                                onPress={() => updateUserType(type.value as UserType)}
                            >
                                <Text style={[
                                    styles.typeText,
                                    { color: preferences?.user_type === type.value ? '#000000ff' : colors.text }
                                ]}>
                                    {type.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Notifications Section */}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.sectionHeader, { color: colors.tint }]}>Notifications</Text>
                    <View style={styles.row}>
                        <View style={styles.rowLabel}>
                            <Ionicons name="notifications-outline" size={22} color={colors.text} style={styles.icon} />
                            <Text style={[styles.label, { color: colors.text }]}>Push Notifications</Text>
                        </View>
                        <Switch
                            value={preferences?.notification_enabled ?? true}
                            onValueChange={toggleNotifications}
                            trackColor={{ false: '#767577', true: colors.tint }}
                            disabled={loading}
                        />
                    </View>
                </View>

                {/* Alert Thresholds Section */}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.sectionHeaderRow}>
                        <View>
                            <Text style={[styles.sectionHeader, { color: colors.tint }]}>Alert Thresholds</Text>
                            <Text style={[styles.subText, { color: colors.tabIconDefault, marginBottom: 0 }]}>
                                Customize when you want to be alerted
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.resetButton, { borderColor: colors.border }]}
                            onPress={resetToDefaults}
                        >
                            <Ionicons name="refresh-outline" size={2} color={colors.tint} />
                            <Text style={[styles.resetText, { color: colors.tint }]}>Reset</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Heatwave Threshold */}
                    <View style={styles.thresholdItem}>
                        <View style={styles.thresholdHeader}>
                            <Text style={[styles.thresholdLabel, { color: colors.text }]}>
                                {THRESHOLD_INFO.heatwave.label}
                            </Text>
                            <Text style={[styles.thresholdValue, { color: colors.tint }]}>
                                {thresholds.heatwave}{THRESHOLD_RANGES.heatwave.unit}
                            </Text>
                        </View>
                        <Slider
                            style={styles.slider}
                            minimumValue={THRESHOLD_RANGES.heatwave.min}
                            maximumValue={THRESHOLD_RANGES.heatwave.max}
                            step={THRESHOLD_RANGES.heatwave.step}
                            value={thresholds.heatwave}
                            onValueChange={(val) => updateThreshold('heatwave', val)}
                            minimumTrackTintColor={colors.tint}
                            maximumTrackTintColor={colors.border}
                        />
                    </View>

                    {/* Heavy Rain Threshold */}
                    <View style={styles.thresholdItem}>
                        <View style={styles.thresholdHeader}>
                            <Text style={[styles.thresholdLabel, { color: colors.text }]}>
                                {THRESHOLD_INFO.heavyRain.label}
                            </Text>
                            <Text style={[styles.thresholdValue, { color: colors.tint }]}>
                                {thresholds.heavyRain}{THRESHOLD_RANGES.heavyRain.unit}
                            </Text>
                        </View>
                        <Slider
                            style={styles.slider}
                            minimumValue={THRESHOLD_RANGES.heavyRain.min}
                            maximumValue={THRESHOLD_RANGES.heavyRain.max}
                            step={THRESHOLD_RANGES.heavyRain.step}
                            value={thresholds.heavyRain}
                            onValueChange={(val) => updateThreshold('heavyRain', val)}
                            minimumTrackTintColor={colors.tint}
                            maximumTrackTintColor={colors.border}
                        />
                    </View>

                    {/* Storm Threshold */}
                    <View style={styles.thresholdItem}>
                        <View style={styles.thresholdHeader}>
                            <Text style={[styles.thresholdLabel, { color: colors.text }]}>
                                {THRESHOLD_INFO.storm.label}
                            </Text>
                            <Text style={[styles.thresholdValue, { color: colors.tint }]}>
                                {thresholds.storm}{THRESHOLD_RANGES.storm.unit}
                            </Text>
                        </View>
                        <Slider
                            style={styles.slider}
                            minimumValue={THRESHOLD_RANGES.storm.min}
                            maximumValue={THRESHOLD_RANGES.storm.max}
                            step={THRESHOLD_RANGES.storm.step}
                            value={thresholds.storm}
                            onValueChange={(val) => updateThreshold('storm', val)}
                            minimumTrackTintColor={colors.tint}
                            maximumTrackTintColor={colors.border}
                        />
                    </View>

                    {/* Cold Wave Threshold */}
                    <View style={styles.thresholdItem}>
                        <View style={styles.thresholdHeader}>
                            <Text style={[styles.thresholdLabel, { color: colors.text }]}>
                                {THRESHOLD_INFO.coldWave.label}
                            </Text>
                            <Text style={[styles.thresholdValue, { color: colors.tint }]}>
                                {thresholds.coldWave}{THRESHOLD_RANGES.coldWave.unit}
                            </Text>
                        </View>
                        <Slider
                            style={styles.slider}
                            minimumValue={THRESHOLD_RANGES.coldWave.min}
                            maximumValue={THRESHOLD_RANGES.coldWave.max}
                            step={THRESHOLD_RANGES.coldWave.step}
                            value={thresholds.coldWave}
                            onValueChange={(val) => updateThreshold('coldWave', val)}
                            minimumTrackTintColor={colors.tint}
                            maximumTrackTintColor={colors.border}
                        />
                    </View>

                    {/* High Humidity Threshold */}
                    <View style={styles.thresholdItem}>
                        <View style={styles.thresholdHeader}>
                            <Text style={[styles.thresholdLabel, { color: colors.text }]}>
                                {THRESHOLD_INFO.highHumidity.label}
                            </Text>
                            <Text style={[styles.thresholdValue, { color: colors.tint }]}>
                                {thresholds.highHumidity}{THRESHOLD_RANGES.highHumidity.unit}
                            </Text>
                        </View>
                        <Slider
                            style={styles.slider}
                            minimumValue={THRESHOLD_RANGES.highHumidity.min}
                            maximumValue={THRESHOLD_RANGES.highHumidity.max}
                            step={THRESHOLD_RANGES.highHumidity.step}
                            value={thresholds.highHumidity}
                            onValueChange={(val) => updateThreshold('highHumidity', val)}
                            minimumTrackTintColor={colors.tint}
                            maximumTrackTintColor={colors.border}
                        />
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: colors.tint }]}
                        onPress={saveThresholds}
                    >
                        <Ionicons name="checkmark-circle-outline" size={20} color="#000000ff" />
                        <Text style={styles.saveButtonText}>Save Thresholds</Text>
                    </TouchableOpacity>
                </View>

                <Text style={[styles.version, { color: colors.tabIconDefault }]}>Version 1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    greetingContainer: {
        marginBottom: 8,
    },
    greeting: {
        fontSize: 16,
        marginTop: 4,
        marginBottom: 12,
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    section: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
    },
    resetText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    rowLabel: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 12,
    },
    label: {
        fontSize: 16,
    },
    subText: {
        fontSize: 14,
        marginBottom: 16,
    },
    userTypes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    typeButton: {
        flex: 1,
        paddingVertical: 10,
        marginHorizontal: 4,
        marginBottom: 8,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
        minWidth: 80,
    },
    typeText: {
        fontWeight: '600',
        fontSize: 12,
    },
    thresholdItem: {
        marginBottom: 20,
    },
    thresholdHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    thresholdLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    thresholdValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    slider: {
        width: '100%',
        height: 40,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 10,
        marginTop: 8,
    },
    saveButtonText: {
        color: '#010101ff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    sublabel: {
        fontSize: 12,
        marginTop: 2,
    },
    version: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: 20,
    },
});

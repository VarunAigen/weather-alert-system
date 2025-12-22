/**
 * Notification Service
 * Handles push notification registration and listeners for disaster alerts
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Register for push notifications and get Expo push token
 */
export async function registerForPushNotifications(): Promise<string | null> {
    let token = null;

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.warn('Failed to get push notification permissions!');
            return null;
        }

        // Get Expo push token
        try {
            token = (await Notifications.getExpoPushTokenAsync()).data;

            console.log('Expo Push Token:', token);
        } catch (error) {
            console.error('Error getting push token:', error);
        }
    } else {
        console.warn('Must use physical device for push notifications');
    }

    // Android: Create notification channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('disaster_alerts', {
            name: 'Disaster Alerts',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF0000',
            sound: 'default',
            description: 'Critical earthquake and tsunami warnings',
        });
    }

    return token;
}

/**
 * Setup notification listeners for foreground and tap events
 */
export function setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationTapped?: (response: Notifications.NotificationResponse) => void
) {
    // Notification received while app is in foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener(
        (notification) => {
            console.log('Notification received:', notification);
            onNotificationReceived?.(notification);
        }
    );

    // Notification tapped
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
        (response) => {
            console.log('Notification tapped:', response);
            onNotificationTapped?.(response);
            // You can navigate to specific screen based on notification data
            // Example: router.push('/disasters');
        }
    );

    // Return cleanup function
    return () => {
        foregroundSubscription.remove();
        responseSubscription.remove();
    };
}

/**
 * Send a test local notification (for testing purposes)
 */
export async function sendTestNotification(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();

    if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
            console.warn('❌ Notification permissions denied!');
            return false;
        }
    }

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "🚨 Test Disaster Alert",
            body: "Magnitude 5.2 earthquake detected 85km from your location",
            data: {
                type: 'earthquake',
                severity: 'warning',
                alert_id: 'test_123'
            },
            sound: 'default',
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 2
        }
    });

    return true;
}

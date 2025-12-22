import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';

import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { WeatherProvider } from '../contexts/WeatherContext';
import { AlertProvider } from '../contexts/AlertContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { registerForPushNotifications, setupNotificationListeners } from '../services/notificationService';
import api from '@/services/api';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Register for push notifications
  useEffect(() => {
    registerForPushNotifications().then(async (token) => {
      if (token) {
        console.log('\n' + '='.repeat(80));
        console.log('📱 DEVICE TOKEN FOR PUSH NOTIFICATIONS:');
        console.log('='.repeat(80));
        console.log(token);
        console.log('='.repeat(80));
        console.log('👆 Copy this token to test push notifications from backend');
        console.log('='.repeat(80) + '\n');

        // Save token to backend
        try {
          // Get user from auth context (you'll need to access this)
          const userId = 'test-user-id'; // Replace with actual user ID

          const response = await fetch('http://localhost:8000/api/users/device-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userId,
              token: token,
              platform: 'expo'
            })
          });

          const result = await response.json();
          console.log('✅ Token saved to backend:', result);
        } catch (error) {
          console.error('❌ Error saving token:', error);
        }
      }
    });

    // Setup notification listeners
    const cleanup = setupNotificationListeners(
      (notification) => {
        console.log('Notification received in foreground:', notification);
      },
      (response) => {
        console.log('Notification tapped:', response);
        // TODO: Navigate to appropriate screen based on notification data
      }
    );

    return cleanup;
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <WeatherProvider>
          <AlertProvider>
            <RootLayoutNav />
            <StatusBar style="auto" />
          </AlertProvider>
        </WeatherProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { theme } = useTheme();
  const { user, loading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (!user) {
    return showSignup ? (
      <SignupScreen
        onSignupSuccess={() => setShowSignup(false)}
        onNavigateToLogin={() => setShowSignup(false)}
      />
    ) : (
      <LoginScreen
        onLoginSuccess={() => { }}
        onNavigateToSignup={() => setShowSignup(true)}
      />
    );
  }

  return (
    <NavigationThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </NavigationThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
});

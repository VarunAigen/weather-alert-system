/**
 * Login Screen
 * Email/password authentication with Firebase
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';

interface LoginScreenProps {
    onLoginSuccess: () => void;
    onNavigateToSignup: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onNavigateToSignup }) => {
    const { colors, isDark } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setLoading(true);
        try {
            await authService.signIn(email, password);
            onLoginSuccess();
        } catch (error: any) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const gradient = isDark
        ? ['#1a1a2e', '#16213e'] as const
        : ['#4A90E2', '#357ABD'] as const;

    return (
        <LinearGradient colors={gradient} style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Ionicons name="cloud" size={64} color="#FFFFFF" />
                        <Text style={styles.title}>Weather Alert</Text>
                        <Text style={styles.subtitle}>Sign in to continue</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color={colors.tabIconDefault} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.text, backgroundColor: colors.card }]}
                                placeholder="Email"
                                placeholderTextColor={colors.tabIconDefault}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={colors.tabIconDefault} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.text, backgroundColor: colors.card }]}
                                placeholder="Password"
                                placeholderTextColor={colors.tabIconDefault}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                    size={20}
                                    color={colors.tabIconDefault}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>Sign In</Text>
                            )}
                        </TouchableOpacity>

                        {/* Forgot Password */}
                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={[styles.forgotPasswordText, { color: colors.tabIconDefault }]}>
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                            <Text style={[styles.dividerText, { color: colors.tabIconDefault }]}>OR</Text>
                            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                        </View>

                        {/* Google Sign In */}
                        <TouchableOpacity
                            style={[styles.googleButton, { backgroundColor: colors.card }]}
                            onPress={() => {
                                Alert.alert(
                                    'Google Sign-In',
                                    'Google Sign-In requires a development build and won\'t work in Expo Go.\n\nFor now, please use email/password authentication.\n\nGoogle Sign-In will be available in the production app!',
                                    [{ text: 'OK' }]
                                );
                            }}
                        >
                            <Ionicons name="logo-google" size={20} color="#DB4437" />
                            <Text style={[styles.googleButtonText, { color: colors.text }]}>
                                Continue with Google
                            </Text>
                        </TouchableOpacity>

                        {/* Sign Up Link */}
                        <View style={styles.signupContainer}>
                            <Text style={[styles.signupText, { color: colors.tabIconDefault }]}>
                                Don't have an account?{' '}
                            </Text>
                            <TouchableOpacity onPress={onNavigateToSignup}>
                                <Text style={styles.signupLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 16,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 8,
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: 16,
        zIndex: 1,
    },
    input: {
        flex: 1,
        height: 56,
        borderRadius: 12,
        paddingLeft: 48,
        paddingRight: 48,
        fontSize: 16,
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        padding: 8,
    },
    button: {
        height: 56,
        backgroundColor: '#4A90E2',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    forgotPassword: {
        alignItems: 'center',
        marginTop: 16,
    },
    forgotPasswordText: {
        fontSize: 14,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
    },
    googleButton: {
        height: 56,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    signupText: {
        fontSize: 14,
    },
    signupLink: {
        fontSize: 14,
        color: '#4A90E2',
        fontWeight: '600',
    },
});

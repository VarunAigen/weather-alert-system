/**
 * Signup Screen
 * User registration with Firebase
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
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';

interface SignupScreenProps {
    onSignupSuccess: () => void;
    onNavigateToLogin: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ onSignupSuccess, onNavigateToLogin }) => {
    const { colors, isDark } = useTheme();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignup = async () => {
        // Validation
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await authService.signUp(email, password, name);
            Alert.alert('Success', 'Account created successfully!', [
                { text: 'OK', onPress: onSignupSuccess }
            ]);
        } catch (error: any) {
            Alert.alert('Signup Failed', error.message);
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
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.content}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Ionicons name="cloud" size={64} color="#FFFFFF" />
                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.subtitle}>Join Weather Alert today</Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            {/* Name Input */}
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={20} color={colors.tabIconDefault} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: colors.text, backgroundColor: colors.card }]}
                                    placeholder="Full Name"
                                    placeholderTextColor={colors.tabIconDefault}
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                />
                            </View>

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

                            {/* Confirm Password Input */}
                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color={colors.tabIconDefault} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: colors.text, backgroundColor: colors.card }]}
                                    placeholder="Confirm Password"
                                    placeholderTextColor={colors.tabIconDefault}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                                        size={20}
                                        color={colors.tabIconDefault}
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Signup Button */}
                            <TouchableOpacity
                                style={[styles.button, loading && styles.buttonDisabled]}
                                onPress={handleSignup}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.buttonText}>Create Account</Text>
                                )}
                            </TouchableOpacity>

                            {/* Terms */}
                            <Text style={[styles.terms, { color: colors.tabIconDefault }]}>
                                By signing up, you agree to our Terms of Service and Privacy Policy
                            </Text>

                            {/* Login Link */}
                            <View style={styles.loginContainer}>
                                <Text style={[styles.loginText, { color: colors.tabIconDefault }]}>
                                    Already have an account?{' '}
                                </Text>
                                <TouchableOpacity onPress={onNavigateToLogin}>
                                    <Text style={styles.loginLink}>Sign In</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
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
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
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
    terms: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 18,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    loginText: {
        fontSize: 14,
    },
    loginLink: {
        fontSize: 14,
        color: '#4A90E2',
        fontWeight: '600',
    },
});

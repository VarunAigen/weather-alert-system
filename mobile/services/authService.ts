/**
 * Authentication Service
 * Handles user authentication with Firebase
 */

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
    GoogleAuthProvider,
    signInWithCredential,
    updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

class AuthService {
    private currentUser: AuthUser | null = null;

    /**
     * Initialize auth listener
     */
    init(callback: (user: AuthUser | null) => void) {
        return onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                this.currentUser = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                };
                callback(this.currentUser);
            } else {
                this.currentUser = null;
                callback(null);
            }
        });
    }

    /**
     * Sign up with email and password
     */
    async signUp(email: string, password: string, displayName: string): Promise<AuthUser> {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Update display name
            await updateProfile(userCredential.user, { displayName });

            const user: AuthUser = {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName,
                photoURL: null,
            };

            this.currentUser = user;
            return user;
        } catch (error: any) {
            throw new Error(this.getErrorMessage(error.code));
        }
    }

    /**
     * Sign in with email and password
     */
    async signIn(email: string, password: string): Promise<AuthUser> {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            const user: AuthUser = {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: userCredential.user.displayName,
                photoURL: userCredential.user.photoURL,
            };

            this.currentUser = user;
            return user;
        } catch (error: any) {
            throw new Error(this.getErrorMessage(error.code));
        }
    }

    /**
     * Sign in with Google
     */
    async signInWithGoogle(idToken: string): Promise<AuthUser> {
        try {
            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);

            const user: AuthUser = {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: userCredential.user.displayName,
                photoURL: userCredential.user.photoURL,
            };

            this.currentUser = user;
            return user;
        } catch (error: any) {
            throw new Error(this.getErrorMessage(error.code));
        }
    }

    /**
     * Sign out
     */
    async signOut(): Promise<void> {
        try {
            await signOut(auth);
            this.currentUser = null;
            await AsyncStorage.removeItem('user');
        } catch (error: any) {
            throw new Error('Failed to sign out');
        }
    }

    /**
     * Get current user
     */
    getCurrentUser(): AuthUser | null {
        return this.currentUser;
    }

    /**
     * Get user ID (for backward compatibility)
     */
    getUserId(): string {
        return this.currentUser?.uid || 'default_user';
    }

    /**
     * Convert Firebase error codes to user-friendly messages
     */
    private getErrorMessage(code: string): string {
        switch (code) {
            case 'auth/email-already-in-use':
                return 'This email is already registered';
            case 'auth/invalid-email':
                return 'Invalid email address';
            case 'auth/operation-not-allowed':
                return 'Operation not allowed';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters';
            case 'auth/user-disabled':
                return 'This account has been disabled';
            case 'auth/user-not-found':
                return 'No account found with this email';
            case 'auth/wrong-password':
                return 'Incorrect password';
            case 'auth/too-many-requests':
                return 'Too many attempts. Please try again later';
            default:
                return 'Authentication failed. Please try again';
        }
    }
}

export const authService = new AuthService();

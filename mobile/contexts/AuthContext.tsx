/**
 * Auth Context
 * Manages global authentication state
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, AuthUser } from '../services/authService';
import { locationManager } from '../utils/LocationManager';

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = authService.init((authUser) => {
            setUser(authUser);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        const authUser = await authService.signIn(email, password);
        setUser(authUser);
    };

    const signUp = async (email: string, password: string, displayName: string) => {
        const authUser = await authService.signUp(email, password, displayName);
        setUser(authUser);
    };

    const signOut = async () => {
        await authService.signOut();
        // Clear user-specific cached data
        await locationManager.clearUserData();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

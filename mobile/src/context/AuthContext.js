import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../services/api';

// Platform-aware storage that works on both native and web
const storage = {
    getItemAsync: async (key) => {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        }
        return SecureStore.getItemAsync(key);
    },
    setItemAsync: async (key, value) => {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
            return;
        }
        return SecureStore.setItemAsync(key, value);
    },
    deleteItemAsync: async (key) => {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
            return;
        }
        return SecureStore.deleteItemAsync(key);
    }
};

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// ⚠️ SET TO true TO BYPASS LOGIN FOR TESTING
const BYPASS_LOGIN = true;

const MOCK_USER = {
    id: 'test-user-123',
    email: 'test@healthvault.com',
    name: 'Test User',
    healthId: 'HV-TEST-001',
    phone: '+1234567890',
    isVerified: true,
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(BYPASS_LOGIN ? MOCK_USER : null);
    const [isAuthenticated, setIsAuthenticated] = useState(BYPASS_LOGIN);
    const [isLoading, setIsLoading] = useState(false); // Set to false when bypassing

    useEffect(() => {
        if (!BYPASS_LOGIN) {
            checkAuth();
        }
    }, []);

    const checkAuth = async () => {
        try {
            const token = await storage.getItemAsync('authToken');
            if (token) {
                const response = await authAPI.getProfile();
                setUser(response.data);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.log('Auth check failed:', error);
            await storage.deleteItemAsync('authToken');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            const { token, user: userData } = response.data;
            await storage.setItemAsync('authToken', token);
            setUser(userData);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Login failed';
            if (error.response?.status === 403) {
                return {
                    success: false,
                    error: errorMessage,
                    needsVerification: true,
                    userId: error.response.data.userId
                };
            }
            return { success: false, error: errorMessage };
        }
    };

    const register = async (data) => {
        try {
            const response = await authAPI.register(data);
            return { success: true, userId: response.data.userId };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Registration failed';
            return { success: false, error: errorMessage };
        }
    };

    const verifyOTP = async (userId, code, type = 'EMAIL_VERIFICATION') => {
        try {
            const response = await authAPI.verifyOTP({ userId, code, type });
            const { token, user: userData } = response.data;
            await storage.setItemAsync('authToken', token);
            setUser(userData);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Verification failed';
            return { success: false, error: errorMessage };
        }
    };

    const resendOTP = async (userId, type = 'EMAIL_VERIFICATION') => {
        try {
            await authAPI.resendOTP({ userId, type });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to resend OTP';
            return { success: false, error: errorMessage };
        }
    };

    const logout = async () => {
        await storage.deleteItemAsync('authToken');
        setUser(null);
        setIsAuthenticated(false);
    };

    const refreshUser = async () => {
        try {
            const response = await authAPI.getProfile();
            setUser(response.data);
        } catch (error) {
            console.log('Failed to refresh user:', error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isLoading,
            login,
            register,
            verifyOTP,
            resendOTP,
            logout,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

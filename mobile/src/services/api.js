import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://localhost:3000/api';

// Platform-aware storage helper
const getToken = async () => {
    if (Platform.OS === 'web') {
        return localStorage.getItem('authToken');
    }
    return SecureStore.getItemAsync('authToken');
};

const deleteToken = async () => {
    if (Platform.OS === 'web') {
        localStorage.removeItem('authToken');
        return;
    }
    return SecureStore.deleteItemAsync('authToken');
};

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await deleteToken();
            // Could trigger logout event here
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    verifyOTP: (data) => api.post('/auth/verify-otp', data),
    resendOTP: (data) => api.post('/auth/resend-otp', data),
    getProfile: () => api.get('/auth/profile'),
};

// Health ID API
export const healthIdAPI = {
    get: () => api.get('/health-id'),
    getWithQR: () => api.get('/health-id/qr'),
};

// Records API
export const recordsAPI = {
    getAll: (params) => api.get('/records', { params }),
    getByType: () => api.get('/records/by-type'),
    get: (id) => api.get(`/records/${id}`),
    upload: (formData) => api.post('/records', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    update: (id, data) => api.put(`/records/${id}`, data),
    delete: (id) => api.delete(`/records/${id}`),
};

// Emergency API
export const emergencyAPI = {
    get: () => api.get('/emergency'),
    getCard: () => api.get('/emergency/card'),
    update: (data) => api.put('/emergency', data),
    getPublic: (healthCode) => api.get(`/emergency/public/${healthCode}`),
};

// Reminders API
export const remindersAPI = {
    getAll: (params) => api.get('/reminders', { params }),
    getUpcoming: () => api.get('/reminders/upcoming'),
    get: (id) => api.get(`/reminders/${id}`),
    create: (data) => api.post('/reminders', data),
    update: (id, data) => api.put(`/reminders/${id}`, data),
    complete: (id) => api.post(`/reminders/${id}/complete`),
    delete: (id) => api.delete(`/reminders/${id}`),
};

export default api;

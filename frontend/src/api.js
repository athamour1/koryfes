import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
    baseURL: API_URL,
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor - Handle 401 errors globally
api.interceptors.response.use(
    (response) => {
        // Pass through successful responses
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized errors
        if (error.response && error.response.status === 401) {
            // Clear all auth data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('expiresAt');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('expiresAt');

            // Redirect to login page
            // Using window.location to ensure a clean redirect
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        // Re-throw the error so specific handlers can still catch it
        return Promise.reject(error);
    }
);

export default api;

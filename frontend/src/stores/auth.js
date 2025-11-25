import { defineStore } from 'pinia';
import { api } from 'src/api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || sessionStorage.getItem('token') || null,
        refreshToken: localStorage.getItem('refreshToken') || null,
        expiresAt: localStorage.getItem('expiresAt') || sessionStorage.getItem('expiresAt') || null,
        refreshExpiresAt: localStorage.getItem('refreshExpiresAt') || null,
        isAdmin: false, // Legacy, keep for now or derive from role
        refreshTimer: null, // Timer for automatic token refresh
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
        userRole: (state) => state.user?.role,
        isAdmin: (state) => state.user?.role === 'admin' || state.user?.role === 'super_admin',
        isSuperAdmin: (state) => state.user?.role === 'super_admin',
        isCaptain: (state) => state.user?.role === 'admin',
        hasRefreshToken: (state) => !!state.refreshToken,
    },
    actions: {
        async login(username, password, rememberMe = false) {
            try {
                const response = await api.post('/auth/login', { username, password, rememberMe });
                this.token = response.data.access_token;
                this.user = response.data.user;
                this.expiresAt = response.data.expires_at;
                this.isAdmin = response.data.user.isAdmin; // Legacy

                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem('token', this.token);
                storage.setItem('user', JSON.stringify(this.user));
                storage.setItem('expiresAt', this.expiresAt);

                // Store refresh token if remember me is enabled
                if (rememberMe && response.data.refresh_token) {
                    this.refreshToken = response.data.refresh_token;
                    this.refreshExpiresAt = response.data.refresh_expires_at;
                    localStorage.setItem('refreshToken', this.refreshToken);
                    localStorage.setItem('refreshExpiresAt', this.refreshExpiresAt);

                    // Start automatic token refresh
                    this.scheduleTokenRefresh();
                }

                return true;
            } catch (error) {
                console.error('Login failed', error);
                return false;
            }
        },

        scheduleTokenRefresh() {
            // Clear any existing timer
            if (this.refreshTimer) {
                clearTimeout(this.refreshTimer);
            }

            // Only schedule if we have a refresh token
            if (!this.refreshToken || !this.expiresAt) {
                return;
            }

            // Calculate time until 2 minutes before token expires
            const expiresAt = new Date(this.expiresAt);
            const refreshAt = new Date(expiresAt.getTime() - 2 * 60 * 1000); // 2 min before expiry
            const timeUntilRefresh = refreshAt.getTime() - Date.now();

            // Only schedule if we have time
            if (timeUntilRefresh > 0) {
                this.refreshTimer = setTimeout(() => {
                    this.refreshAccessToken();
                }, timeUntilRefresh);
            } else {
                // Token is about to expire or already expired, refresh immediately
                this.refreshAccessToken();
            }
        },

        async refreshAccessToken() {
            if (!this.refreshToken) {
                return false;
            }

            try {
                const response = await api.post('/auth/refresh', {
                    refresh_token: this.refreshToken
                });

                // Update tokens
                this.token = response.data.access_token;
                this.expiresAt = response.data.expires_at;
                this.refreshToken = response.data.refresh_token; // Rotated token
                this.refreshExpiresAt = response.data.refresh_expires_at;

                // Update storage - use same storage type as original login
                // Refresh tokens are always in localStorage, so if we have a refresh token, user chose rememberMe
                const storage = localStorage.getItem('refreshToken') ? localStorage : sessionStorage;
                storage.setItem('token', this.token);
                storage.setItem('expiresAt', this.expiresAt);
                if (storage === localStorage) {
                    localStorage.setItem('refreshToken', this.refreshToken);
                    localStorage.setItem('refreshExpiresAt', this.refreshExpiresAt);
                }

                // Schedule next refresh
                this.scheduleTokenRefresh();

                return true;
            } catch (error) {
                console.error('Token refresh failed', error);
                // If refresh fails, logout user
                this.logout();
                return false;
            }
        },

        async register(userData) {
            try {
                await api.post('/auth/register', userData);
                return { success: true };
            } catch (error) {
                console.error('Registration failed', error);
                if (error.response && error.response.status === 409) {
                    return { success: false, message: 'Username already exists' };
                }
                return { success: false, message: 'Registration failed' };
            }
        },
        async forgotPassword(email) {
            try {
                await api.post('/auth/forgot-password', { email });
                return { success: true };
            } catch (error) {
                console.error('Forgot password failed', error);
                return { success: false, message: 'Request failed' };
            }
        },
        async resetPassword(token, password) {
            try {
                await api.post('/auth/reset-password', { token, password });
                return { success: true };
            } catch (error) {
                console.error('Reset password failed', error);
                return { success: false, message: 'Reset failed' };
            }
        },
        async fetchProfile() {
            if (!this.token) return;
            try {
                const response = await api.get('/auth/profile');
                this.user = response.data;
                this.isAdmin = response.data.isAdmin;

                // Update storage with fresh user data
                const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
                storage.setItem('user', JSON.stringify(this.user));
            } catch (error) {
                console.error('Fetch profile failed', error);
                // Only logout if it's an auth error (401)
                // The response interceptor will handle 401s globally
                if (error.response && error.response.status === 401) {
                    this.logout();
                    throw error; // Re-throw to let router handle redirect
                }
            }
        },
        async logout() {
            // Revoke refresh token on server if we have one
            if (this.refreshToken) {
                try {
                    await api.post('/auth/logout', { refresh_token: this.refreshToken });
                } catch (error) {
                    console.error('Logout request failed', error);
                }
            }

            // Clear refresh timer
            if (this.refreshTimer) {
                clearTimeout(this.refreshTimer);
                this.refreshTimer = null;
            }

            // Clear state
            this.token = '';
            this.user = null;
            this.isAdmin = false;
            this.expiresAt = null;
            this.refreshToken = null;
            this.refreshExpiresAt = null;

            // Clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('expiresAt');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('refreshExpiresAt');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('expiresAt');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('refreshExpiresAt');
        },
        checkAuth() {
            if (!this.token) return false;

            if (this.expiresAt) {
                const expirationDate = new Date(this.expiresAt);
                if (new Date() > expirationDate) {
                    // If we have a refresh token, try to refresh instead of logging out
                    if (this.refreshToken) {
                        this.refreshAccessToken();
                        return true;
                    }
                    this.logout();
                    return false;
                }
            }

            // Schedule refresh if we have refresh token but no timer
            if (this.refreshToken && !this.refreshTimer) {
                this.scheduleTokenRefresh();
            }

            return true;
        },

        // Initialize refresh timer on app start if refresh token exists
        initializeRefreshTimer() {
            if (this.refreshToken && this.expiresAt) {
                this.scheduleTokenRefresh();
            }
        }
    },
});

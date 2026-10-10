import { defineStore } from 'pinia';
import { api } from '@/api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
        refreshToken: localStorage.getItem('refreshToken') || null,
        expiresAt: localStorage.getItem('expiresAt') || null,
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

                // Always store access token in localStorage for cross-tab support
                // Whether rememberMe is true or false, users can use multiple tabs
                // The difference is whether we store refresh token (for auto-renewal)
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                localStorage.setItem('expiresAt', this.expiresAt);

                // Store refresh token ONLY if remember me is enabled
                if (rememberMe && response.data.refresh_token) {
                    this.refreshToken = response.data.refresh_token;
                    this.refreshExpiresAt = response.data.refresh_expires_at;
                    localStorage.setItem('refreshToken', this.refreshToken);
                    localStorage.setItem('refreshExpiresAt', this.refreshExpiresAt);

                    // Start automatic token refresh
                    this.scheduleTokenRefresh();
                } else {
                    // If not remembering, ensure no refresh token is stored
                    this.refreshToken = null;
                    this.refreshExpiresAt = null;
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('refreshExpiresAt');
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

                // Update localStorage
                localStorage.setItem('token', this.token);
                localStorage.setItem('expiresAt', this.expiresAt);
                localStorage.setItem('refreshToken', this.refreshToken);
                localStorage.setItem('refreshExpiresAt', this.refreshExpiresAt);

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
                localStorage.setItem('user', JSON.stringify(this.user));
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

            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('expiresAt');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('refreshExpiresAt');
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

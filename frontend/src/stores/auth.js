import { defineStore } from 'pinia';
import { api } from 'src/api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || sessionStorage.getItem('token') || null,
        expiresAt: localStorage.getItem('expiresAt') || sessionStorage.getItem('expiresAt') || null,
        isAdmin: false, // Legacy, keep for now or derive from role
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
        userRole: (state) => state.user?.role,
        isSuperAdmin: (state) => state.user?.role === 'super_admin',
        isCaptain: (state) => state.user?.role === 'admin',
    },
    actions: {
        async login(username, password, rememberMe = false) {
            try {
                const response = await api.post('/auth/login', { username, password, rememberMe });
                this.token = response.data.access_token;
                this.user = response.data.user;
                this.expiresAt = response.data.expires_at;
                this.isAdmin = response.data.user.isAdmin; // Legacy

                if (rememberMe) {
                    localStorage.setItem('token', this.token);
                    localStorage.setItem('user', JSON.stringify(this.user));
                    localStorage.setItem('expiresAt', this.expiresAt);
                } else {
                    sessionStorage.setItem('token', this.token);
                    sessionStorage.setItem('user', JSON.stringify(this.user));
                    sessionStorage.setItem('expiresAt', this.expiresAt);
                }

                return true;
            } catch (error) {
                console.error('Login failed', error);
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
            } catch (error) {
                console.error('Fetch profile failed', error);
                this.logout();
            }
        },
        logout() {
            this.token = '';
            this.user = null;
            this.isAdmin = false;
            this.expiresAt = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('expiresAt');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('expiresAt');
        },
        checkAuth() {
            if (!this.token) return false;

            if (this.expiresAt) {
                const expirationDate = new Date(this.expiresAt);
                if (new Date() > expirationDate) {
                    this.logout();
                    return false;
                }
            }
            return true;
        },
    },
});

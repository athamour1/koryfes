import { defineStore } from 'pinia';
import { api } from 'src/api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token') || null,
        isAdmin: false, // Legacy, keep for now or derive from role
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
        userRole: (state) => state.user?.role,
        isSuperAdmin: (state) => state.user?.role === 'super_admin',
        isCaptain: (state) => state.user?.role === 'admin',
    },
    actions: {
        async login(username, password) {
            try {
                const response = await api.post('/auth/login', { username, password });
                this.token = response.data.access_token;
                this.user = response.data.user;
                this.isAdmin = response.data.user.isAdmin; // Legacy
                localStorage.setItem('token', this.token);
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
            localStorage.removeItem('token');
        },
    },
});

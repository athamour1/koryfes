import { defineStore } from 'pinia';
import { api } from '../api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token') || null,
        isAdmin: false,
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
    },
    actions: {
        async login(username, password) {
            try {
                const response = await api.post('/auth/login', { username, password });
                this.token = response.data.access_token;
                this.user = response.data.user;
                this.isAdmin = response.data.user.isAdmin;
                localStorage.setItem('token', this.token);
                return true;
            } catch (error) {
                console.error('Login failed', error);
                return false;
            }
        },
        async register(username, password, location) {
            try {
                await api.post('/auth/register', { username, password, location });
                return { success: true };
            } catch (error) {
                console.error('Registration failed', error);
                if (error.response && error.response.status === 409) {
                    return { success: false, message: 'Username already exists' };
                }
                return { success: false, message: 'Registration failed' };
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

import { defineStore } from 'pinia';
import { api } from '../api';

export const useUserStore = defineStore('user', {
    state: () => ({
        users: [],
    }),
    actions: {
        async fetchUsers() {
            try {
                const response = await api.get('/users');
                this.users = response.data;
                return response.data;
            } catch (error) {
                console.error('Fetch users failed', error);
                return [];
            }
        },
        async updateProfile(data) {
            try {
                await api.patch('/users/profile', data);
                return true;
            } catch (error) {
                console.error('Update profile failed', error);
                return false;
            }
        },
        async updateUser(userId, data) {
            try {
                await api.patch(`/users/${userId}`, data);
                return true;
            } catch (error) {
                console.error('Update user failed', error);
                return false;
            }
        },
        async assignBadge(userId, badgeId) {
            try {
                await api.post(`/users/${userId}/badges`, { badgeId });
                return true;
            } catch (error) {
                console.error('Assign badge failed', error);
                return false;
            }
        },
        async removeBadge(userId, badgeId) {
            try {
                await api.delete(`/users/${userId}/badges/${badgeId}`);
                return true;
            } catch (error) {
                console.error('Remove badge failed', error);
                return false;
            }
        },
        async uploadProfileImage(file) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                await api.post('/users/profile/image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                return true;
            } catch (error) {
                console.error('Upload profile image failed', error);
                return false;
            }
        },
        async uploadUserImage(userId, file) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                await api.post(`/users/${userId}/image`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                return true;
            } catch (error) {
                console.error('Upload user image failed', error);
                return false;
            }
        },
    },
});

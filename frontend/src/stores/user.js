import { defineStore } from 'pinia';
import { api } from '../api';

export const useUserStore = defineStore('user', {
    state: () => ({
        users: [],
    }),
    actions: {
        async fetchUsers(location = '', name = '') {
            try {
                const response = await api.get('/users', { params: { location, name } });
                this.users = response.data;
                return this.users;
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
        async assignBadge(userId, badgeId) {
            try {
                await api.post(`/users/${userId}/badges`, { badgeId });
                return true;
            } catch (error) {
                console.error('Assign badge failed', error);
                return false;
            }
        },
        async uploadProfileImage(file) {
            const formData = new FormData();
            formData.append('file', file);
            try {
                await api.post('/users/profile/image', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                return true;
            } catch (error) {
                console.error('Upload profile image failed', error);
                return false;
            }
        }
    },
});

import { defineStore } from 'pinia';
import { api } from 'src/api';

export const useUserStore = defineStore('user', {
    state: () => ({
        users: [],
        userProgress: null,
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
                const response = await api.patch(`/users/${userId}`, data);
                return response.data;
            } catch (error) {
                console.error('Update user failed', error);
                return null;
            }
        },
        async assignBadge(userId, badgeId, acquiredAt) {
            try {
                await api.post(`/users/${userId}/badges`, { badgeId, acquiredAt });
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
        async updateBadgeDate(userId, badgeId, date) {
            try {
                await api.patch(`/users/${userId}/badges/${badgeId}`, { acquiredAt: date });
                return true;
            } catch (error) {
                console.error('Update badge date failed', error);
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
        async createUser(userData) {
            try {
                const response = await api.post('/users', userData);
                // Refresh users list after creation
                await this.fetchUsers();
                return response.data;
            } catch (error) {
                console.error('Create user failed', error);
                if (error.response && error.response.status === 409) {
                    throw new Error('Username already exists');
                }
                throw new Error(error.response?.data?.message || 'Failed to create user');
            }
        },
        async deleteUser(userId) {
            try {
                await api.delete(`/users/${userId}`);
                // Refresh users list after deletion
                await this.fetchUsers();
                return true;
            } catch (error) {
                console.error('Delete user failed', error);
                throw new Error(error.response?.data?.message || 'Failed to delete user');
            }
        },
        // User Progress Actions
        async fetchMyProgress() {
            try {
                const response = await api.get('/user-progress/me');
                this.userProgress = response.data;
                return response.data;
            } catch (error) {
                console.error('Fetch user progress failed', error);
                return null;
            }
        },
        async initializeProgress() {
            try {
                const response = await api.post('/user-progress/initialize');
                this.userProgress = response.data;
                return response.data;
            } catch (error) {
                console.error('Initialize progress failed', error);
                return null;
            }
        },
        async awardPeak(userId, peakId) {
            try {
                const response = await api.post('/user-progress/award-peak', { userId, peakId });
                // Refresh the user's progress if it's the current user
                if (this.userProgress && this.userProgress.userId === userId) {
                    this.userProgress = response.data;
                }
                return response.data;
            } catch (error) {
                console.error('Award peak failed', error);
                return null;
            }
        },
        async awardPath(userId, pathId) {
            try {
                const response = await api.post('/user-progress/award-path', { userId, pathId });
                // Refresh the user's progress if it's the current user
                if (this.userProgress && this.userProgress.userId === userId) {
                    this.userProgress = response.data;
                }
                return response.data;
            } catch (error) {
                console.error('Award path failed', error);
                return null;
            }
        },
        async awardDiploma(userId, diplomaId, type) {
            try {
                const response = await api.post('/user-progress/award-diploma', { userId, diplomaId, type });
                // Refresh the user's progress if it's the current user
                if (this.userProgress && this.userProgress.userId === userId) {
                    this.userProgress = response.data;
                }
                return response.data;
            } catch (error) {
                console.error('Award diploma failed', error);
                return null;
            }
        },
    },
});

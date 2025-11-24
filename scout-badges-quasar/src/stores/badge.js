import { defineStore } from 'pinia';
import { api } from '../api';

export const useBadgeStore = defineStore('badge', {
    state: () => ({
        badges: [],
    }),
    actions: {
        async fetchBadges() {
            try {
                const response = await api.get('/badges');
                this.badges = response.data;
                return this.badges;
            } catch (error) {
                console.error('Fetch badges failed', error);
                return [];
            }
        },
        async createBadge(badgeData) {
            try {
                const formData = new FormData();
                formData.append('name', badgeData.name);
                formData.append('description', badgeData.description);
                if (badgeData.imageFile) {
                    formData.append('file', badgeData.imageFile);
                }
                // If image is a string (icon name), we might want to send it too, but the backend expects file or nothing.
                // Let's assume image input is now file only for upload, or we keep image field for icon name if no file?
                // The user said "picture which will be displayed".
                // Let's send 'image' field if it's a string (icon) and 'file' if it's a file.
                // But backend overwrites image with file path if file exists.

                await api.post('/badges', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                await this.fetchBadges();
                return true;
            } catch (error) {
                console.error('Create badge failed', error);
                return false;
            }
        },
        async updateBadge(badgeId, updateData) {
            try {
                await api.patch(`/badges/${badgeId}`, updateData);
                await this.fetchBadges();
                return true;
            } catch (error) {
                console.error('Update badge failed', error);
                return false;
            }
        },
        async uploadBadgeImage(badgeId, imageFile) {
            const formData = new FormData();
            formData.append('file', imageFile);
            try {
                await api.patch(`/badges/${badgeId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                await this.fetchBadges();
                return true;
            } catch (error) {
                console.error('Upload badge image failed', error);
                return false;
            }
        }
    },
});

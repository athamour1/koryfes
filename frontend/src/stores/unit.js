import { defineStore } from 'pinia';
import { api } from '../api';

export const useUnitStore = defineStore('unit', {
    state: () => ({
        units: [],
        currentUnit: null,
        loading: false,
        error: null
    }),

    actions: {
        async fetchUnits(locationId = null) {
            this.loading = true;
            this.error = null;
            try {
                const params = {};
                if (locationId) params.locationId = locationId;

                const response = await api.get('/units', { params });
                this.units = response.data;
                return true;
            } catch (error) {
                console.error('Error fetching units:', error);
                this.error = error.response?.data?.message || 'Failed to fetch units';
                return false;
            } finally {
                this.loading = false;
            }
        },

        async fetchUnit(id) {
            this.loading = true;
            this.error = null;
            try {
                const response = await api.get(`/units/${id}`);
                this.currentUnit = response.data;
                return response.data;
            } catch (error) {
                console.error('Error fetching unit:', error);
                this.error = error.response?.data?.message || 'Failed to fetch unit';
                return null;
            } finally {
                this.loading = false;
            }
        },

        async createUnit(unitData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await api.post('/units', unitData);
                this.units.push(response.data);
                return response.data;
            } catch (error) {
                console.error('Error creating unit:', error);
                this.error = error.response?.data?.message || 'Failed to create unit';
                return null;
            } finally {
                this.loading = false;
            }
        },

        async updateUnit(id, unitData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await api.patch(`/units/${id}`, unitData);
                const index = this.units.findIndex(u => u.id === id);
                if (index !== -1) {
                    this.units[index] = response.data;
                }
                if (this.currentUnit && this.currentUnit.id === id) {
                    this.currentUnit = response.data;
                }
                return response.data;
            } catch (error) {
                console.error('Error updating unit:', error);
                this.error = error.response?.data?.message || 'Failed to update unit';
                return null;
            } finally {
                this.loading = false;
            }
        },

        async deleteUnit(id) {
            this.loading = true;
            this.error = null;
            try {
                await api.delete(`/units/${id}`);
                this.units = this.units.filter(u => u.id !== id);
                return true;
            } catch (error) {
                console.error('Error deleting unit:', error);
                this.error = error.response?.data?.message || 'Failed to delete unit';
                return false;
            } finally {
                this.loading = false;
            }
        },

        async uploadUnitFlag(id, file) {
            this.loading = true;
            this.error = null;
            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await api.post(`/units/${id}/image`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                const index = this.units.findIndex(u => u.id === id);
                if (index !== -1) {
                    this.units[index] = response.data;
                }
                if (this.currentUnit && this.currentUnit.id === id) {
                    this.currentUnit = response.data;
                }
                return response.data;
            } catch (error) {
                console.error('Error uploading unit flag:', error);
                this.error = error.response?.data?.message || 'Failed to upload flag';
                return null;
            } finally {
                this.loading = false;
            }
        }
    }
});

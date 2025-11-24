import { defineStore } from 'pinia';
import { api } from 'src/api';

export const useProgressStore = defineStore('progress', {
    state: () => ({
        peaks: [],
        scoutDiplomas: [],
        electiveDiplomas: [],
        paths: [],
        loading: false,
    }),

    actions: {
        async fetchPeaks() {
            try {
                this.loading = true;
                const response = await api.get('/peaks');
                this.peaks = response.data;
            } catch (error) {
                console.error('Error fetching peaks:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchScoutDiplomas() {
            try {
                this.loading = true;
                const response = await api.get('/scout-diplomas');
                this.scoutDiplomas = response.data;
            } catch (error) {
                console.error('Error fetching scout diplomas:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchElectiveDiplomas() {
            try {
                this.loading = true;
                const response = await api.get('/elective-diplomas');
                this.electiveDiplomas = response.data;
            } catch (error) {
                console.error('Error fetching elective diplomas:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchPaths(category) {
            try {
                this.loading = true;
                const params = category ? { category } : {};
                const response = await api.get('/paths', { params });
                this.paths = response.data;
            } catch (error) {
                console.error('Error fetching paths:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async createPeak(peakData) {
            const response = await api.post('/peaks', peakData);
            await this.fetchPeaks();
            return response.data;
        },

        async updatePeak(id, peakData) {
            const response = await api.patch(`/peaks/${id}`, peakData);
            await this.fetchPeaks();
            return response.data;
        },

        async deletePeak(id) {
            await api.delete(`/peaks/${id}`);
            await this.fetchPeaks();
        },

        async createScoutDiploma(diplomaData) {
            const response = await api.post('/scout-diplomas', diplomaData);
            await this.fetchScoutDiplomas();
            return response.data;
        },

        async updateScoutDiploma(id, diplomaData) {
            const response = await api.patch(`/scout-diplomas/${id}`, diplomaData);
            await this.fetchScoutDiplomas();
            return response.data;
        },

        async deleteScoutDiploma(id) {
            await api.delete(`/scout-diplomas/${id}`);
            await this.fetchScoutDiplomas();
        },

        async createElectiveDiploma(diplomaData) {
            const response = await api.post('/elective-diplomas', diplomaData);
            await this.fetchElectiveDiplomas();
            return response.data;
        },

        async updateElectiveDiploma(id, diplomaData) {
            const response = await api.patch(`/elective-diplomas/${id}`, diplomaData);
            await this.fetchElectiveDiplomas();
            return response.data;
        },

        async deleteElectiveDiploma(id) {
            await api.delete(`/elective-diplomas/${id}`);
            await this.fetchElectiveDiplomas();
        },

        async createPath(pathData) {
            const response = await api.post('/paths', pathData);
            await this.fetchPaths();
            return response.data;
        },

        async updatePath(id, pathData) {
            const response = await api.patch(`/paths/${id}`, pathData);
            await this.fetchPaths();
            return response.data;
        },

        async deletePath(id) {
            await api.delete(`/paths/${id}`);
            await this.fetchPaths();
        },

        // User Progress Management (Admin only)
        async fetchUserProgress(userId) {
            try {
                this.loading = true;
                const response = await api.get(`/users/${userId}`);
                return response.data;
            } catch (error) {
                console.error('Error fetching user progress:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async awardPeakToUser(userId, peakId) {
            try {
                const response = await api.post('/user-progress/award-peak', { userId, peakId });
                return response.data;
            } catch (error) {
                console.error('Error awarding peak:', error);
                throw error;
            }
        },

        async awardPathToUser(userId, pathId) {
            try {
                const response = await api.post('/user-progress/award-path', { userId, pathId });
                return response.data;
            } catch (error) {
                console.error('Error awarding path:', error);
                throw error;
            }
        },

        async awardDiplomaToUser(userId, diplomaId, type) {
            try {
                const response = await api.post('/user-progress/award-diploma', {
                    userId,
                    diplomaId,
                    type // 'scout' or 'elective'
                });
                return response.data;
            } catch (error) {
                console.error('Error awarding diploma:', error);
                throw error;
            }
        },
    },
});

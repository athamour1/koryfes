import { defineStore } from 'pinia';
import { api } from '@/api';
import { PATH_CHAPTERS } from '@/utils/badges';

// The progress catalog is fixed (it comes from the branch book), so it is
// loaded once and only read.
export const useProgressStore = defineStore('progress', {
    state: () => ({
        peaks: [],
        paths: [],
        guideDiplomas: [],
        electiveDiplomas: [],
        loaded: false,
        loading: null,
    }),
    getters: {
        pathsByChapter: (state) => PATH_CHAPTERS.map((category) => ({
            category,
            paths: state.paths.filter((p) => p.category === category),
        })),
    },
    actions: {
        fetchCatalog() {
            if (this.loaded) {
                return Promise.resolve();
            }
            this.loading ??= Promise.all([
                api.get('/peaks'),
                api.get('/paths'),
                api.get('/guide-diplomas'),
                api.get('/elective-diplomas'),
            ]).then(([peaks, paths, guide, elective]) => {
                this.peaks = peaks.data;
                this.paths = paths.data;
                this.guideDiplomas = guide.data;
                this.electiveDiplomas = elective.data;
                this.loaded = true;
            }).finally(() => {
                this.loading = null;
            });
            return this.loading;
        },
    },
});

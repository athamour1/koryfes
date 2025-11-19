import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000', // In Docker, browser still hits localhost:3000. If SSR, would need service name.
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export { api };

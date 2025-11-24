// Environment configuration
export const config = {
    apiUrl: import.meta.env.VITE_API_URL || '/api',
    env: import.meta.env.VITE_ENV || 'development',
    isProd: import.meta.env.VITE_ENV === 'production',
    isDev: import.meta.env.VITE_ENV === 'development',
};

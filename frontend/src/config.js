// Environment configuration
const runtimeConfig = window.appConfig || {};

export const config = {
    apiUrl: runtimeConfig.apiUrl || import.meta.env.VITE_API_URL || '/api',
    env: runtimeConfig.env || import.meta.env.VITE_ENV || 'development',
    isProd: (runtimeConfig.env || import.meta.env.VITE_ENV) === 'production',
    isDev: (runtimeConfig.env || import.meta.env.VITE_ENV) === 'development',
    stagingMessage: runtimeConfig.stagingMessage || import.meta.env.VITE_STAGING_MESSAGE || '',
};

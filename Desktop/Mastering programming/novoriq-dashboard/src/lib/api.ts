import axios from 'axios';

// Safely handle the base URL whether in dev or production
// We remove the trailing '/api' from here because we will ensure 
// the environment variable holds the full path (e.g., http://localhost:3000/api)
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('novoriq_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    
    // Ensure we don't accidentally double up on slashes if the url starts with one
    const safeUrl = config.url?.startsWith('/') ? config.url : `/${config.url}`;
    
    // Logs the exact destination to your browser console for debugging
    console.log(`[🌐] Outgoing API Request: ${config.baseURL}${safeUrl}`);
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
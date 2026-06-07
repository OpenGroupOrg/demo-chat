import axios from 'axios';

const useCookies = import.meta.env.VITE_AUTH_TYPE === 'cookie';

const api = axios.create({
    baseURL: import.meta.env.VITE_LARAVEL_BASE_URL,
    withCredentials: useCookies,
    withXSRFToken: useCookies,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

// Interceptor nur für Token-Modus
if (!useCookies) {
    api.interceptors.request.use(config => {
        const token = localStorage.getItem('auth_token');
        const token_type = localStorage.getItem('auth_type');
        if (token && token_type) {
            config.headers.Authorization = `${token_type} ${token}`;
        }
        return config;
    });
}

export default api;
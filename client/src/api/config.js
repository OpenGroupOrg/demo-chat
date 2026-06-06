import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_LARAVEL_BASE_URL,
    withCredentials: true,
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token');
    const token_type = localStorage.getItem('auth_type');

    // Wenn ein Token da ist, anhängen
    if (token && token_type) {
        config.headers.Authorization = `${token_type} ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
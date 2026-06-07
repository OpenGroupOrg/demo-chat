import api from './config'

const useCookies = import.meta.env.VITE_AUTH_TYPE === 'cookie';

export const loginUser = async (credentials) => {
    if (useCookies) {
        const response = await api.get('/sanctum/csrf-cookie')
        const { data } = await api.post('/api/login', credentials)

        return data
    } else {
        const { data } = await api.post('/api/login', credentials)

        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_type', 'Bearer')
        return data
    }
}

export const registerUser = async (userData) => {
    if (useCookies) {
        const response = await api.get('/sanctum/csrf-cookie')
        const { data } = await api.post('/api/register', userData)

        return data
    } else {
        const { data } = await api.post('/api/register', userData)

        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_type', 'Bearer')
        return data
    }
}

export const logoutUser = async () => {
    await api.post('/api/logout')

    if (!useCookies) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_type')
    }
}

export const fetchUser = async () => {
    try {
        const { data } = await api.get('/api/user')

        return data
    } catch (error) {

        console.error('Error fetching user data:', error)

        if (error.response?.status === 401) return null
        throw error
    }
}

export function hasApiKey() {
    if (useCookies) return true // Bei Cookies prüfen wir meist über fetchUser/AuthContext
    return !!(localStorage.getItem('auth_token') && localStorage.getItem('auth_type'))
}
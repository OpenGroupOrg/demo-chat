import api from './config'

const useCookies = import.meta.env.VITE_AUTH_TYPE === 'cookie';

export const loginUser = async (credentials) => {
    console.log('Logging in with credentials:', credentials)
    console.log('Using cookies for authentication:', useCookies)

    if (useCookies) {
        const response = await api.get('/sanctum/csrf-cookie')
        console.log('CSRF cookie response:', response)

        const { data } = await api.post('/api/login', credentials)

        console.log('Login response data:', data)

        return data
    } else {
        const { data } = await api.post('/api/login', credentials)

        console.log('Login response data:', data)

        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_type', 'Bearer')
        return data
    }
}

export const registerUser = async (userData) => {
    console.log('Registering user with data:', userData)
    console.log('Using cookies for authentication:', useCookies)

    if (useCookies) {
        const response = await api.get('/sanctum/csrf-cookie')
        console.log('CSRF cookie response:', response)

        const { data } = await api.post('/api/register', userData)
        console.log('Registration response data:', data)

        return data
    } else {
        const { data } = await api.post('/api/register', userData)

        console.log('Registration response data:', data)

        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_type', 'Bearer')
        return data
    }
}

export const logoutUser = async () => {
    console.log('Logging out user')
    console.log('Using cookies for authentication:', useCookies)

    await api.post('/api/logout')

    if (!useCookies) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_type')
    }
}

export const fetchUser = async () => {
    console.log('Fetching user data')
    console.log('Using cookies for authentication:', useCookies)

    try {
        const { data } = await api.get('/api/user')

        console.log('Fetched user data:', data)

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
import { createContext, useContext } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchUser, logoutUser } from '../api/auth'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const queryClient = useQueryClient()

    const hasToken = !!localStorage.getItem('auth_token')

    const { data: user, isLoading } = useQuery({
        queryKey: ['authUser'],
        queryFn: fetchUser,
        retry: false,
        enabled: hasToken,
    })

    const setUser = (userData) => {
        queryClient.setQueryData(['authUser'], userData)
    }

    const logout = async () => {
        try {
            await logoutUser()
        } catch (error) {
            console.error("Fehler beim Logout-Request", error)
        } finally {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_type')

            queryClient.setQueryData(['authUser'], null)
        }
    }

    return (
        <AuthContext.Provider value={{ user: user || null, setUser, logout }}>
            {isLoading && hasToken && (
                <div className="fixed bg-base-100 z-50 left-0 top-0 w-screen h-screen flex flex-col items-center justify-center">
                    <span className="loading loading-infinity text-info w-20"></span>
                </div>
            )}

            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
import { Link } from 'react-router-dom'
import UserAvatar from '../ui/UserAvatar'
import { useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '../../api/config'

export default function Navbar({ user }) {
    const { data: logoutData, isLoading: logoutLoading, mutate: reLogout } = useMutation({
        mutationFn: async () => {
            const response = await api.post('/api/logout')
            return response.data
        }
    })

    const onLogout = () => {
        reLogout()
    }

    useEffect(() => {
        if (logoutData)
            window.location.href = '/'
    }, [logoutLoading])

    return (
        <div className="navbar bg-base-100 shadow-lg px-4">
            <div className="flex-1">
                <Link to="/" className="btn btn-ghost p-0 text-xl">
                    <img src="/easy-chat.svg" alt="easy-chat" className="h-10 w-10 text-primary mx-auto" />
                    EasyChat
                </Link>
            </div>
            <div className="flex-none gap-4">
                {user ? (
                    <div className="dropdown dropdown-end">
                        <div className="flex items-center gap-3">
                            <span className="text-xl text-primary">{user.name}</span>
                            <button tabIndex={0} role="button">
                                <UserAvatar user={user} size="sm" />
                            </button>
                        </div>
                        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                            <li><button onClick={() => onLogout()}>Logout</button></li>
                        </ul>
                    </div>
                ) : (
                    <Link to="/login" className="btn btn-primary">Login</Link>
                )}
            </div>
        </div>
    )
}
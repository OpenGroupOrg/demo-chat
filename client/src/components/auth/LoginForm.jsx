import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { AtSymbolIcon, KeyIcon } from '@heroicons/react/24/solid'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { loginUser } from '../../api/auth'

export default function LoginForm() {
    const [credentials, setCredentials] = useState({ email: '', password: '' })
    const { setUser } = useAuth()
    const navigate = useNavigate()

    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            console.info('Logged in Successfully!')

            // Da loginUser jetzt intern Tokens speichert, müssen wir hier nichts mehr machen.
            // Wir setzen nur noch den Context für React.
            setUser(data.user)
            navigate('/')
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        loginMutation.mutate(credentials)
    }

    return (
        <>
            <h2 className="-mt-17 mb-7 pt-2 text-3xl">Login - Welcome back !</h2>
            <form onSubmit={handleSubmit} className="space-y-2">
                <label className="input validator w-full pl-1" htmlFor="email">
                    <AtSymbolIcon height={"90%"} />
                    <input
                        type="email"
                        className="w-full"
                        id="email"
                        placeholder="Mail@gmail.com"
                        value={credentials.email}
                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                        required
                    />
                </label>
                <div className="validator-hint hidden">Enter valid email address</div>

                <label className="input validator w-full pl-1" htmlFor="password">
                    <KeyIcon height={"90%"} />
                    <input
                        type="password"
                        className="w-full"
                        id="password"
                        placeholder="12@#$678"
                        min={8}
                        value={credentials.password}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        required
                    />
                </label>
                <div className="validator-hint hidden">Enter valid password</div>

                {/* Fehler sicher abfangen mit Optional Chaining (?.) */}
                {loginMutation.isError && (
                    <div className="text-error">
                        {loginMutation.error.response?.data?.message || 'Login failed. Please check your credentials.'}
                    </div>
                )}

                <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={loginMutation.isPending}
                >
                    {loginMutation.isPending ?
                        <span className="loading loading-infinity loading-xl text-primary"></span>
                        :
                        'Login'
                    }
                </button>
            </form>

            <div className="text-center mt-4">
                <Link to="/register" className="link link-primary text-sm">
                    Not registered yet? Signup
                </Link>
            </div>
        </>
    )
}
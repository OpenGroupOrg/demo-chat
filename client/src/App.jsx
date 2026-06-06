import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'

import HomePage from './pages/HomePage'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'

import ChatHomePage from './pages/Chat/ChatHomePagePage'
import ConversationPage from './pages/Chat/ConversationPage'

import { ChatProvider } from './contexts/ChatContext'

function ProtectedRoute() {
    const { user, loading } = useAuth()

    if (loading) {
        return null // oder Spinner
    }

    return user ? <Outlet /> : <Navigate to="/login" replace />
}

function GuestRoute() {
    const { user, loading } = useAuth()

    if (loading) {
        return null // oder Spinner
    }

    return !user ? <Outlet /> : <Navigate to="/" replace />
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />

                {/* Nur für Gäste */}
                <Route element={<GuestRoute />}>
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                    </Route>
                </Route>

                {/* Nur für eingeloggte Benutzer */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path="/chat" element={<ChatHomePage />} />
                        <Route
                            path="/chat/:conversationId"
                            element={
                                <ChatProvider>
                                    <ConversationPage />
                                </ChatProvider>
                            }
                        />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

/*import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import ChatHomePage from './pages/Chat/ChatHomePage'
import ConversationPage from './pages/Chat/ConversationPage'
import { ChatProvider } from './contexts/ChatContext'

export default function App() {
  const { user, loading } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        {!user ?
          <Route element={<AuthLayout />}>
            <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
          </Route>
          :
          <Route element={<MainLayout />}>
            <Route path="/chat" element={<ChatHomePage />} />
            <Route path="/chat/:conversationId" element={
              <ChatProvider>
                <ConversationPage />
              </ChatProvider>
            } />
          </Route>
        }

        { !loading &&
          <Route path="*" element={<Navigate to="/" />} />
        }
      </Routes>
    </BrowserRouter>
  )
}
*/
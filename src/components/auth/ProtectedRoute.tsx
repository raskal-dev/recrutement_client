import { Navigate, useLocation } from 'react-router-dom'
import { ReactNode, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, token, logout } = useAuthStore((s) => ({
    isAuthenticated: s.isAuthenticated,
    token: s.token,
    logout: s.logout,
  }))

  useEffect(() => {
    // Écouter les événements de déconnexion depuis l'intercepteur axios
    const handleLogout = () => {
      logout()
    }

    window.addEventListener('auth:logout', handleLogout as EventListener)
    return () => {
      window.removeEventListener('auth:logout', handleLogout as EventListener)
    }
  }, [logout])

  // Si pas de token ou pas authentifié, rediriger vers login
  if (!token || !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}



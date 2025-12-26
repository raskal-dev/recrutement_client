import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'

export function useInitAuth() {
  const navigate = useNavigate()
  const { token, isAuthenticated, setUser, logout } = useAuthStore((s) => ({
    token: s.token,
    isAuthenticated: s.isAuthenticated,
    setUser: s.setUser,
    logout: s.logout,
  }))

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      // Pas de token => pas besoin d'appeler l'API
      if (!token) {
        setLoading(false)
        return
      }

      // Si déjà authentifié, on ne recharge pas
      if (isAuthenticated) {
        setLoading(false)
        return
      }

      try {
        const res = await api.get('/users/profile')
        const user = res.data.data
        setUser(user)
      } catch (error: any) {
        // Si le token est invalide / expiré (401 ou 403)
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout()
          // Rediriger vers login seulement si on n'y est pas déjà
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            navigate('/login', { replace: true })
          }
        } else {
          // Autre erreur, on nettoie quand même
          logout()
        }
      } finally {
        setLoading(false)
      }
    }

    void init()
  }, [token, isAuthenticated, setUser, logout, navigate])

  return { loading }
}



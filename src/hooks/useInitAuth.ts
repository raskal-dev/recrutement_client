import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'

export function useInitAuth() {
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
      } catch (_err) {
        // Si le token est invalide / expiré, on nettoie
        logout()
      } finally {
        setLoading(false)
      }
    }

    void init()
  }, [token, isAuthenticated, setUser, logout])

  return { loading }
}



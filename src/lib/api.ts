import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage')
  if (token) {
    try {
      const parsed = JSON.parse(token)
      if (parsed.state?.token) {
        config.headers.Authorization = `Bearer ${parsed.state.token}`
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }
  return config
})

// Intercepteur pour gérer les erreurs d'authentification
let isRedirecting = false

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si le token est expiré ou invalide (401 ou 403)
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Éviter les redirections multiples
      if (isRedirecting) {
        return Promise.reject(error)
      }
      
      const currentPath = window.location.pathname
      
      // Ne rediriger que si on n'est pas déjà sur login ou register
      if (currentPath !== '/login' && currentPath !== '/register') {
        isRedirecting = true
        
        // Nettoyer le storage d'authentification
        localStorage.removeItem('auth-storage')
        
        // Déclencher un événement personnalisé pour notifier les composants React
        window.dispatchEvent(new CustomEvent('auth:logout', { 
          detail: { reason: 'token_expired' } 
        }))
        
        // Rediriger vers la page de login
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api


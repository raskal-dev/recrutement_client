import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from '@/components/ui/toaster'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import OfferDetail from './pages/OfferDetail'
import CreateOffer from './pages/CreateOffer'
import AIAnalyzeCV from './pages/AIAnalyzeCV'
import MyApplications from './pages/MyApplications'
import OfferApplications from './pages/OfferApplications'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Navbar } from './components/layout/Navbar'
import { useInitAuth } from './hooks/useInitAuth'
import { useAuthStore } from './store/useAuthStore'
import './App.css'

// Composant interne qui utilise useInitAuth (doit être dans le Router)
function AppContent() {
  const { loading } = useInitAuth()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const logout = useAuthStore((s) => s.logout)

  // Écouter les événements de déconnexion depuis l'intercepteur axios
  useEffect(() => {
    const handleLogout = () => {
      logout()
    }

    window.addEventListener('auth:logout', handleLogout as EventListener)
    return () => {
      window.removeEventListener('auth:logout', handleLogout as EventListener)
    }
  }, [logout])

  return (
    <>
      {isAuthenticated && <Navbar />}
      {loading ? (
        <div className="flex h-screen items-center justify-center">
          <span className="text-sm text-muted-foreground">Chargement...</span>
        </div>
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              ) : (
                <Landing />
              )
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/offers/:id"
            element={
              <ProtectedRoute>
                <OfferDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/offers/new"
            element={
              <ProtectedRoute>
                <CreateOffer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai/analyze-cv"
            element={
              <ProtectedRoute>
                <AIAnalyzeCV />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <MyApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/offers/:offerId/applications"
            element={
              <ProtectedRoute>
                <OfferApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      )}
      <Toaster />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App


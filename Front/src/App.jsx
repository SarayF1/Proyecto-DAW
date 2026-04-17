// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import MapPage from './pages/MapPage'
import NavigationPage from './pages/NavigationPage'
import AccountPage from './pages/AccountPage'
import VehiculosPage from './pages/VehiculosPage'
import ReservasPage from './pages/ReservasPage'
import MonederoPage from './pages/MonederoPage'
import WelcomeFunnelPage from './pages/WelcomeFunnelPage'
import AdminPage from './pages/AdminPage'
import PaymentPage from './pages/PaymentPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import LoadingScreen from './components/LoadingScreen'

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!token) return <Navigate to="/" replace />
  return children
}

function AdminRoute({ children }) {
  const { token, user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!token) return <Navigate to="/" replace />
  if (user?.Rol !== 'ADMIN') return <Navigate to="/mapa" replace />
  return children
}

function PublicOnlyRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (token) return <Navigate to="/mapa" replace />
  return children
}

export default function App() {
  const { loading } = useAuth()
  if (loading) return <LoadingScreen />

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
        <Route path="/bienvenida" element={<ProtectedRoute><WelcomeFunnelPage /></ProtectedRoute>} />
        <Route path="/mapa" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
        <Route path="/navegar" element={<ProtectedRoute><NavigationPage /></ProtectedRoute>} />
        <Route path="/cuenta" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="/vehiculos" element={<ProtectedRoute><VehiculosPage /></ProtectedRoute>} />
        <Route path="/reservas" element={<ProtectedRoute><ReservasPage /></ProtectedRoute>} />
        <Route path="/monedero" element={<ProtectedRoute><MonederoPage /></ProtectedRoute>} />
        <Route path="/pago" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/privacidad" element={<PrivacyPage />} />
        <Route path="/terminos" element={<TermsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AppProvider } from './contexts/AppContext'

import WelcomeScreen from './screens/WelcomeScreen'
import LoginScreen from './screens/LoginScreen'
import SignupScreen from './screens/SignupScreen'
import OTPScreen from './screens/OTPScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import BrowseScreen from './screens/BrowseScreen'
import MatchesScreen from './screens/MatchesScreen'
import ChatScreen from './screens/ChatScreen'
import IcebreakerScreen from './screens/IcebreakerScreen'
import RestaurantPickScreen from './screens/RestaurantPickScreen'
import RestaurantListScreen from './screens/RestaurantListScreen'
import ProfileScreen from './screens/ProfileScreen'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', background: '#FFF8F0' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
      <div className="spinner" />
      <p style={{ marginTop: 12, color: '#AAA', fontSize: 13 }}>Getting your table ready...</p>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (!user.onboarding_complete) return <Navigate to="/onboarding" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/browse" /> : <WelcomeScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/signup" element={<SignupScreen />} />
      <Route path="/otp" element={<OTPScreen />} />
      <Route path="/onboarding" element={<OnboardingScreen />} />
      <Route path="/browse" element={<ProtectedRoute><BrowseScreen /></ProtectedRoute>} />
      <Route path="/matches" element={<ProtectedRoute><MatchesScreen /></ProtectedRoute>} />
      <Route path="/chat/:matchId" element={<ProtectedRoute><ChatScreen /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><MatchesScreen /></ProtectedRoute>} />
      <Route path="/icebreaker/:matchId" element={<ProtectedRoute><IcebreakerScreen /></ProtectedRoute>} />
      <Route path="/restaurant-pick/:matchId" element={<ProtectedRoute><RestaurantPickScreen /></ProtectedRoute>} />
      <Route path="/restaurants/:matchId" element={<ProtectedRoute><RestaurantListScreen /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <div className="app-shell">
            <AppRoutes />
          </div>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

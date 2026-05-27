import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('dd_token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      api.get('/api/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => { localStorage.removeItem('dd_token') })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  // Shared helper — used by email login, OTP login, and signup
  const applyAuth = (token, user) => {
    localStorage.setItem('dd_token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    return user
  }

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    return applyAuth(res.data.token, res.data.user)
  }

  const loginWithToken = (token, user) => applyAuth(token, user)

  const signup = async (data) => {
    const res = await api.post('/api/auth/signup', data)
    return applyAuth(res.data.token, res.data.user)
  }

  const logout = () => {
    localStorage.removeItem('dd_token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const updateUser = (updates) => setUser(prev => ({ ...prev, ...updates }))

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithToken, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

import axios from 'axios'

const PROD_BACKEND = 'https://dinedate-production.up.railway.app'

// Dev: empty (Vite proxy handles it) | Production: env var or hardcoded Railway URL
const baseURL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL || PROD_BACKEND)

const api = axios.create({
  baseURL,
  timeout: 15000,
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dd_token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dd_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

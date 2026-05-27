import axios from 'axios'

// In dev: proxy via vite.config.js (empty baseURL)
// In production: VITE_API_URL env variable points to the deployed backend
const baseURL = import.meta.env.VITE_API_URL || ''

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

import { io } from 'socket.io-client'

const PROD_BACKEND = 'https://dinedate-production.up.railway.app'

// Dev: '/' (proxied by Vite) | Production: env var or hardcoded Railway URL
const SOCKET_URL = import.meta.env.DEV
  ? '/'
  : (import.meta.env.VITE_API_URL || PROD_BACKEND)

let socket = null

export const connectSocket = (token) => {
  if (socket?.connected) return socket
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  })
  socket.on('connect', () => console.log('🔌 Socket connected'))
  socket.on('disconnect', () => console.log('🔌 Socket disconnected'))
  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  socket?.disconnect()
  socket = null
}

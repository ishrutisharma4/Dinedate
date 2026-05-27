require('dotenv').config()
const express = require('express')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')
const { getDb } = require('./database/db')
const setupSocket = require('./socket/chatHandler')

const app = express()
const server = http.createServer(app)

// Allow localhost + Vercel/Netlify previews + any custom FRONTEND_URL
const isTrustedOrigin = (origin) => {
  if (!origin) return true // curl / server-to-server
  if (origin.includes('localhost')) return true
  if (origin.endsWith('.vercel.app')) return true
  if (origin.endsWith('.netlify.app')) return true
  if (process.env.FRONTEND_URL && origin.startsWith(process.env.FRONTEND_URL)) return true
  return false
}

const corsOptions = {
  origin: (origin, cb) => isTrustedOrigin(origin) ? cb(null, true) : cb(new Error('CORS: ' + origin)),
  credentials: true,
}

const io = new Server(server, {
  cors: { origin: (origin, cb) => cb(null, isTrustedOrigin(origin)), methods: ['GET', 'POST'], credentials: true },
})

app.use(cors(corsOptions))
app.use(express.json())

// Init DB on startup
getDb()
console.log('Database ready')

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/users', require('./routes/users'))
app.use('/api/matches', require('./routes/matches'))
app.use('/api/restaurants', require('./routes/restaurants'))
app.use('/api/chat', require('./routes/chat'))

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

// Socket.IO
setupSocket(io)

const PORT = process.env.PORT || 5001
// Listen on 0.0.0.0 so Railway/Render can reach it (not just localhost)
server.listen(PORT, '0.0.0.0', () => {
  console.log(`DineDate backend running on port ${PORT}`)
  console.log(`Google Maps: ${process.env.GOOGLE_MAPS_API_KEY && process.env.GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE' ? 'enabled' : 'using mock Bangalore data'}`)
})

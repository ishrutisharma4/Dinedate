require('dotenv').config()
const express = require('express')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')
const { getDb } = require('./database/db')
const setupSocket = require('./socket/chatHandler')

const app = express()
const server = http.createServer(app)

// Accept local dev + any deployed frontend (set FRONTEND_URL in production)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,           // e.g. https://dinedate.vercel.app
].filter(Boolean)

const corsOptions = {
  origin: (origin, cb) => {
    // allow curl / server-to-server (no origin) and any allowed origin
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true)
    cb(new Error('Not allowed by CORS: ' + origin))
  },
  credentials: true,
}

const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true },
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

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`DineDate backend running on http://localhost:${PORT}`)
  console.log(`Google Maps: ${process.env.GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE' ? 'using mock data (add key to .env to enable)' : 'enabled'}`)
})

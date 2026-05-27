const jwt = require('jsonwebtoken')
const { getDb } = require('../database/db')

module.exports = function setupSocket(io) {
  // Auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('No token'))
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = payload.userId
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  // Track user → socket mapping
  const userSockets = new Map()

  io.on('connection', (socket) => {
    userSockets.set(socket.userId, socket.id)

    socket.on('join_match', (matchId) => {
      socket.join(`match:${matchId}`)
    })

    socket.on('leave_match', (matchId) => {
      socket.leave(`match:${matchId}`)
    })

    socket.on('send_message', ({ matchId, message }) => {
      // Broadcast to all in the match room except sender
      socket.to(`match:${matchId}`).emit('new_message', message)
    })

    socket.on('typing', ({ matchId, userId }) => {
      socket.to(`match:${matchId}`).emit('typing', { userId })
    })

    socket.on('disconnect', () => {
      userSockets.delete(socket.userId)
    })
  })

  // Helper to notify a specific user
  io.notifyUser = (userId, event, data) => {
    const socketId = userSockets.get(userId)
    if (socketId) io.to(socketId).emit(event, data)
  }

  return io
}

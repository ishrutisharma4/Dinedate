const jwt = require('jsonwebtoken')

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' })
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET || 'dinedate_demo_secret_fallback_2024')
    req.userId = payload.userId
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}

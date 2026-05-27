const router = require('express').Router()
const { getDb } = require('../database/db')
const auth = require('../middleware/auth')

router.get('/:matchId/messages', auth, (req, res) => {
  try {
    const messages = getDb().getMessages(req.params.matchId)
    res.json({ messages })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/:matchId/messages', auth, (req, res) => {
  try {
    const { content } = req.body
    if (!content?.trim()) return res.status(400).json({ message: 'Empty message' })
    const db = getDb()
    const message = db.insertMessage({
      id: require('crypto').randomUUID(),
      match_id: req.params.matchId,
      sender_id: req.userId,
      content: content.trim(),
      created_at: new Date().toISOString(),
    })
    db.updateMatch(req.params.matchId, { updated_at: new Date().toISOString() })
    res.status(201).json({ message })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router

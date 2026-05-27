const router = require('express').Router()
const { getDb } = require('../database/db')
const auth = require('../middleware/auth')
const { getCuisineOverlap } = require('../services/matchingService')

const safeUser = (u) => {
  if (!u) return null
  const { password_hash, ...rest } = u
  return rest
}

const enrichMatch = (match, userId) => {
  if (!match) return null
  const db = getDb()
  const otherId = match.user_a_id === userId ? match.user_b_id : match.user_a_id
  const other = db.findUser(otherId)
  const lastMsg = db.getLastMessage(match.id)
  const unread = db.getUnreadCount(match.id, userId, match.updated_at || match.created_at)
  return { ...match, other_user: safeUser(other), last_message: lastMsg?.content, unread }
}

router.post('/like', auth, (req, res) => {
  try {
    const { liked_user_id } = req.body
    const db = getDb()
    db.insertLike({ id: require('crypto').randomUUID(), liker_id: req.userId, liked_id: liked_user_id, created_at: new Date().toISOString() })

    const mutualLike = db.findLike(liked_user_id, req.userId)
    if (!mutualLike) return res.json({ matched: false })

    const existing = db.findMatchBetween(req.userId, liked_user_id)
    if (existing) return res.json({ matched: true, match_id: existing.id })

    const match = db.insertMatch({
      id: require('crypto').randomUUID(),
      user_a_id: req.userId,
      user_b_id: liked_user_id,
      status: 'pending_cuisine',
      user_a_cuisines: [],
      user_b_cuisines: [],
      mutual_cuisines: [],
      restaurant: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    res.json({ matched: true, match_id: match.id })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/', auth, (req, res) => {
  try {
    const db = getDb()
    const matches = db.getUserMatches(req.userId)
    res.json({ matches: matches.map(m => enrichMatch(m, req.userId)) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/:matchId', auth, (req, res) => {
  try {
    const match = getDb().findMatch(req.params.matchId)
    if (!match) return res.status(404).json({ message: 'Match not found' })
    res.json({ match: enrichMatch(match, req.userId) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/:matchId/cuisine-pick', auth, (req, res) => {
  try {
    const { cuisines } = req.body
    const db = getDb()
    const match = db.findMatch(req.params.matchId)
    if (!match) return res.status(404).json({ message: 'Match not found' })

    const isA = match.user_a_id === req.userId
    const updateKey = isA ? 'user_a_cuisines' : 'user_b_cuisines'
    const updated = db.updateMatch(match.id, { [updateKey]: cuisines })

    const aPicked = updated.user_a_cuisines || []
    const bPicked = updated.user_b_cuisines || []

    if (aPicked.length > 0 && bPicked.length > 0) {
      const overlap = getCuisineOverlap(aPicked, bPicked)
      if (overlap.length > 0) {
        db.updateMatch(match.id, { mutual_cuisines: overlap, status: 'pending_restaurant' })
        return res.json({ overlap, status: 'pending_restaurant' })
      }
      return res.json({ overlap: [], no_overlap: true })
    }
    res.json({ overlap: [], waiting: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/:matchId/select-restaurant', auth, (req, res) => {
  try {
    const { restaurant } = req.body
    const db = getDb()
    const match = db.updateMatch(req.params.matchId, { restaurant, status: 'confirmed' })
    res.json({ match: enrichMatch(match, req.userId) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router

const router = require('express').Router()
const { getDb } = require('../database/db')
const auth = require('../middleware/auth')

const safeUser = (u) => {
  if (!u) return null
  const { password_hash, ...rest } = u
  return rest
}

router.get('/discover', auth, (req, res) => {
  try {
    const db = getDb()
    const likedIds = db.getLikedIds(req.userId)
    const exclude = [req.userId, ...likedIds]
    const users = db.getDiscoverUsers(exclude)
    res.json({ users: users.map(safeUser) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/preferences', auth, (req, res) => {
  try {
    const db = getDb()
    const existing = db.findUser(req.userId)
    if (!existing) return res.status(404).json({ message: 'User not found' })

    const updates = {}
    const {
      bio, name, age, photo, city,
      food_preferences, dining_habits, onboarding_complete,
      // flat preference fields from onboarding
      cuisines, meal_types, restaurant_type, price_range, social_style, dietary,
      mood, interests, deal_breakers,
    } = req.body

    if (bio !== undefined) updates.bio = bio
    if (name !== undefined) updates.name = name
    if (age !== undefined) updates.age = parseInt(age) || existing.age
    if (photo !== undefined) updates.photo = photo   // base64 or URL
    if (city !== undefined) updates.city = city
    if (dining_habits) updates.dining_habits = dining_habits
    if (onboarding_complete !== undefined) updates.onboarding_complete = onboarding_complete

    // Deep-merge food preferences
    const prefs = { ...(existing.food_preferences || {}), ...(food_preferences || {}) }
    if (cuisines)      prefs.cuisines      = cuisines
    if (meal_types)    prefs.meal_types    = meal_types
    if (restaurant_type) prefs.restaurant_type = restaurant_type
    if (price_range)   prefs.price_range   = price_range
    if (social_style)  prefs.social_style  = social_style
    if (dietary)       prefs.dietary       = dietary
    if (mood)          prefs.mood          = mood
    if (interests)     prefs.interests     = interests
    if (deal_breakers) prefs.deal_breakers = deal_breakers
    updates.food_preferences = prefs

    const user = db.updateUser(req.userId, updates)
    res.json({ user: safeUser(user) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router

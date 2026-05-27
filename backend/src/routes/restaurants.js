const router = require('express').Router()
const { getDb } = require('../database/db')
const auth = require('../middleware/auth')
const { getNearbyRestaurants, getAllBangaloreRestaurants } = require('../services/googleMapsService')

// Suggestions for a match
router.get('/:matchId/suggestions', auth, async (req, res) => {
  try {
    const db = getDb()
    const match = db.findMatch(req.params.matchId)
    if (!match) return res.status(404).json({ message: 'Match not found' })
    const user = db.findUser(req.userId)
    const prefs = user?.food_preferences || {}
    const priceMap = { '$': 1, '$$': 2, '$$$': 3 }
    const restaurants = await getNearbyRestaurants({
      cuisines: match.mutual_cuisines?.length ? match.mutual_cuisines : (prefs.cuisines || []),
      city: user?.city || 'Bangalore',
      priceLevel: priceMap[prefs.price_range] || 2,
      mood: prefs.mood?.[0] || null,
    })
    res.json({ restaurants })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Mystery meal mode — browse ALL Bangalore restaurants
router.get('/mystery/all', auth, (req, res) => {
  try {
    const { mood, cuisine } = req.query
    let restaurants = getAllBangaloreRestaurants()
    if (mood) restaurants = restaurants.filter(r => r.mood?.includes(mood))
    if (cuisine) restaurants = restaurants.filter(r => r.cuisines?.some(c => c.toLowerCase().includes(cuisine.toLowerCase())))
    // Randomise order for mystery mode
    restaurants = restaurants.sort(() => 0.5 - Math.random())
    res.json({ restaurants })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router

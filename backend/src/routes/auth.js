const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { getDb } = require('../database/db')
const auth = require('../middleware/auth')

const makeToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' })
const safeUser = (u) => { if (!u) return null; const { password_hash, ...rest } = u; return rest }

// In-memory OTP store: phone -> { code, expiresAt, attempts }
const otpStore = new Map()

// ── Email / Password ──────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, age, gender, city } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing required fields' })
    const db = getDb()
    if (db.findUserByEmail(email)) return res.status(409).json({ message: 'Email already registered' })
    const hash = await bcrypt.hash(password, 10)
    const user = db.insertUser({
      id: require('crypto').randomUUID(), name, email: email.toLowerCase(),
      password_hash: hash, age: age ? parseInt(age) : null, gender: gender || null,
      city: city || 'Bangalore', bio: '', photo: null, onboarding_complete: false,
      food_preferences: {}, dining_habits: {}, stats: { swipes: 0, matches: 0, dates: 0 },
      badges: [], verified: false, created_at: new Date().toISOString(),
    })
    res.status(201).json({ token: makeToken(user.id), user: safeUser(user) })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const db = getDb()
    const user = db.findUserByEmail(email)
    if (!user) return res.status(401).json({ message: 'Invalid email or password' })
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' })
    res.json({ token: makeToken(user.id), user: safeUser(user) })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.get('/me', auth, (req, res) => {
  const user = getDb().findUser(req.userId)
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json({ user: safeUser(user) })
})

// ── Mobile OTP ────────────────────────────────────────────────
router.post('/send-otp', (req, res) => {
  try {
    const { phone } = req.body
    if (!phone || phone.length < 10) return res.status(400).json({ message: 'Valid phone number required' })

    const code = String(Math.floor(1000 + Math.random() * 9000)) // 4-digit
    const expiresAt = Date.now() + 5 * 60 * 1000 // 5 min
    otpStore.set(phone, { code, expiresAt, attempts: 0 })

    // In production → send via Twilio / MSG91
    // For demo → log it clearly
    console.log(`\n🔐 OTP for ${phone}: ${code}\n`)

    res.json({
      message: 'OTP sent',
      // Always return OTP for demo — replace with Twilio/MSG91 for real SMS
      dev_otp: code,
    })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, code, name } = req.body
    if (!phone || !code) return res.status(400).json({ message: 'Phone and code required' })

    const entry = otpStore.get(phone)
    if (!entry) return res.status(400).json({ message: 'OTP not requested or expired' })
    if (Date.now() > entry.expiresAt) { otpStore.delete(phone); return res.status(400).json({ message: 'OTP expired, request a new one' }) }

    entry.attempts++
    if (entry.attempts > 5) { otpStore.delete(phone); return res.status(429).json({ message: 'Too many attempts' }) }
    if (entry.code !== code) return res.status(400).json({ message: `Incorrect OTP (${5 - entry.attempts} left)` })

    otpStore.delete(phone)

    const db = getDb()
    let user = db.data.users.find(u => u.phone === phone)
    if (!user) {
      user = db.insertUser({
        id: require('crypto').randomUUID(),
        name: name || `User_${phone.slice(-4)}`,
        phone, email: `${phone}@phone.dinedate.com`,
        password_hash: '', age: null, gender: null,
        city: 'Bangalore', bio: '', photo: null, onboarding_complete: false,
        food_preferences: {}, dining_habits: {}, stats: { swipes: 0, matches: 0, dates: 0 },
        badges: [], verified: true, created_at: new Date().toISOString(),
      })
    }
    res.json({ token: makeToken(user.id), user: safeUser(user) })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router

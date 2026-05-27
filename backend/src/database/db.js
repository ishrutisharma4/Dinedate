const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')

const DB_PATH = path.join(__dirname, '../../data/db.json')

const DEFAULT_DATA = { users: [], likes: [], matches: [], messages: [] }

const SEED_USERS = [
  { id: 'demo-user-1', name: 'Demo User', email: 'demo@dinedate.com', password_hash: '$2a$10$Fd/9k6u3fZS8U.VulGZbI.TpiK8k11KnqKahT2UJIxqZ7.k1amf7W', age: 27, gender: 'Woman', city: 'Mumbai', bio: 'Food is my love language. Big fan of everything from street food to fine dining!', onboarding_complete: true, food_preferences: { cuisines: ['Indian', 'Italian', 'Japanese'], meal_types: ['dinner', 'lunch'], restaurant_type: ['casual', 'fine_dining'], price_range: '$$' }, stats: { swipes: 42, matches: 7, dates: 2 }, created_at: new Date().toISOString() },
  { id: 'profile-1', name: 'Priya', email: 'priya@demo.com', password_hash: '$2a$10$Fd/9k6u3fZS8U.VulGZbI.TpiK8k11KnqKahT2UJIxqZ7.k1amf7W', age: 26, gender: 'Woman', city: 'Mumbai', bio: 'Biryani enthusiast. Will travel 20km for good food.', onboarding_complete: true, food_preferences: { cuisines: ['Indian', 'Thai', 'Japanese'], meal_types: ['dinner'], restaurant_type: ['casual', 'fine_dining'], price_range: '$$' }, stats: {}, created_at: new Date().toISOString() },
  { id: 'profile-2', name: 'Arjun', email: 'arjun@demo.com', password_hash: '$2a$10$Fd/9k6u3fZS8U.VulGZbI.TpiK8k11KnqKahT2UJIxqZ7.k1amf7W', age: 29, gender: 'Man', city: 'Mumbai', bio: 'I rate restaurants before dates. Priorities sorted.', onboarding_complete: true, food_preferences: { cuisines: ['Italian', 'Japanese', 'French'], meal_types: ['dinner', 'lunch'], restaurant_type: ['fine_dining'], price_range: '$$$' }, stats: {}, created_at: new Date().toISOString() },
  { id: 'profile-3', name: 'Sneha', email: 'sneha@demo.com', password_hash: '$2a$10$Fd/9k6u3fZS8U.VulGZbI.TpiK8k11KnqKahT2UJIxqZ7.k1amf7W', age: 24, gender: 'Woman', city: 'Mumbai', bio: 'Chai > Coffee. Masala dosa is my love language.', onboarding_complete: true, food_preferences: { cuisines: ['Indian', 'Chinese', 'Mexican'], meal_types: ['breakfast', 'lunch'], restaurant_type: ['cafe', 'casual'], price_range: '$' }, stats: {}, created_at: new Date().toISOString() },
  { id: 'profile-4', name: 'Rahul', email: 'rahul@demo.com', password_hash: '$2a$10$Fd/9k6u3fZS8U.VulGZbI.TpiK8k11KnqKahT2UJIxqZ7.k1amf7W', age: 31, gender: 'Man', city: 'Bangalore', bio: 'Weekend brunch connoisseur. Avocado toast is non-negotiable.', onboarding_complete: true, food_preferences: { cuisines: ['Mediterranean', 'Italian', 'American'], meal_types: ['breakfast', 'dinner'], restaurant_type: ['cafe', 'fine_dining'], price_range: '$$' }, stats: {}, created_at: new Date().toISOString() },
]

class JsonStore {
  constructor() {
    this.data = this._load()
  }

  _load() {
    try {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
    } catch {
      const data = { ...DEFAULT_DATA, users: SEED_USERS }
      this._write(data)
      return data
    }
  }

  _write(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
    this.data = data
  }

  save() { this._write(this.data) }

  // --- Users ---
  findUser(id) { return this.data.users.find(u => u.id === id) || null }
  findUserByEmail(email) { return this.data.users.find(u => u.email === email.toLowerCase()) || null }
  insertUser(user) { this.data.users.push(user); this.save(); return user }
  updateUser(id, updates) {
    const i = this.data.users.findIndex(u => u.id === id)
    if (i < 0) return null
    this.data.users[i] = { ...this.data.users[i], ...updates }
    this.save()
    return this.data.users[i]
  }
  getDiscoverUsers(excludeIds) {
    return this.data.users.filter(u => !excludeIds.includes(u.id) && u.onboarding_complete).slice(0, 20)
  }

  // --- Likes ---
  insertLike(like) {
    if (!this.data.likes.find(l => l.liker_id === like.liker_id && l.liked_id === like.liked_id)) {
      this.data.likes.push(like); this.save()
    }
  }
  findLike(likerId, likedId) { return this.data.likes.find(l => l.liker_id === likerId && l.liked_id === likedId) || null }
  getLikedIds(userId) { return this.data.likes.filter(l => l.liker_id === userId).map(l => l.liked_id) }

  // --- Matches ---
  findMatch(id) { return this.data.matches.find(m => m.id === id) || null }
  findMatchBetween(aId, bId) {
    return this.data.matches.find(m => (m.user_a_id === aId && m.user_b_id === bId) || (m.user_a_id === bId && m.user_b_id === aId)) || null
  }
  insertMatch(match) { this.data.matches.push(match); this.save(); return match }
  updateMatch(id, updates) {
    const i = this.data.matches.findIndex(m => m.id === id)
    if (i < 0) return null
    this.data.matches[i] = { ...this.data.matches[i], ...updates, updated_at: new Date().toISOString() }
    this.save()
    return this.data.matches[i]
  }
  getUserMatches(userId) {
    return this.data.matches
      .filter(m => m.user_a_id === userId || m.user_b_id === userId)
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
  }

  // --- Messages ---
  getMessages(matchId) {
    return this.data.messages.filter(m => m.match_id === matchId).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  }
  insertMessage(msg) { this.data.messages.push(msg); this.save(); return msg }
  getLastMessage(matchId) {
    const msgs = this.getMessages(matchId)
    return msgs[msgs.length - 1] || null
  }
  getUnreadCount(matchId, userId, since) {
    return this.data.messages.filter(m => m.match_id === matchId && m.sender_id !== userId && new Date(m.created_at) > new Date(since)).length
  }
}

let store
function getDb() {
  if (!store) store = new JsonStore()
  return store
}

module.exports = { getDb }

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import SwipeCard from '../components/SwipeCard'
import BottomNav from '../components/BottomNav'
import { haptic } from '../utils/haptic'
import api from '../services/api'

const MOCK_PROFILES = [
  { id: '1', name: 'Priya', age: 26, bio: 'Biryani enthusiast. Will travel 20km for good dosas. MTR is my second home 🧡', distance_km: 1.8, verified: true, food_preferences: { cuisines: ['South Indian', 'Thai', 'Japanese'], meal_types: ['dinner'], restaurant_type: ['casual', 'fine_dining'], price_range: '$$', dietary: ['vegetarian'], mood: ['cozy'] }, photo: 'https://api.dicebear.com/7.x/personas/svg?seed=priya2&backgroundColor=ffd5dc' },
  { id: '2', name: 'Arjun', age: 29, bio: 'Craft beer + gourmet food is my religion. Toit regular 🍺', distance_km: 3.2, verified: true, food_preferences: { cuisines: ['Italian', 'Japanese', 'American'], meal_types: ['dinner', 'lunch'], restaurant_type: ['brewpub', 'fine_dining'], price_range: '$$$', mood: ['lively'] }, photo: 'https://api.dicebear.com/7.x/personas/svg?seed=arjun2&backgroundColor=c0aede' },
  { id: '3', name: 'Sneha', age: 24, bio: 'Chai > Coffee (fight me). My love language is masala dosa 💛', distance_km: 2.1, food_preferences: { cuisines: ['South Indian', 'Chinese', 'Street Food'], meal_types: ['breakfast', 'lunch'], restaurant_type: ['cafe', 'street_food'], price_range: '$', dietary: ['vegetarian', 'jain'], mood: ['cozy'] }, photo: 'https://api.dicebear.com/7.x/personas/svg?seed=sneha2&backgroundColor=b6e3f4' },
  { id: '4', name: 'Rahul', age: 31, bio: 'Weekend brunch is sacred. Trying every rooftop bar in Bangalore 🌇', distance_km: 4.5, food_preferences: { cuisines: ['Mediterranean', 'Italian', 'American'], meal_types: ['brunch', 'dinner'], restaurant_type: ['rooftop', 'fine_dining'], price_range: '$$', mood: ['rooftop'] }, photo: 'https://api.dicebear.com/7.x/personas/svg?seed=rahul2&backgroundColor=d1f4cc' },
  { id: '5', name: 'Kavya', age: 27, bio: 'Ramen noodle obsessed. Will judge you by your food order 🍜', distance_km: 2.8, food_preferences: { cuisines: ['Japanese', 'Korean', 'Italian'], meal_types: ['dinner', 'late_night'], restaurant_type: ['casual', 'cafe'], price_range: '$$', mood: ['date_night'] }, photo: 'https://api.dicebear.com/7.x/personas/svg?seed=kavya&backgroundColor=ffd5dc' },
]

const MYSTERY_RESTAURANTS = [
  { id: 'm1', name: 'Toit Brewpub', cuisine: 'Craft Beer & Burgers', photo: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=400&fit=crop', mood: 'Lively & Social', teaser: 'Bangalore\'s iconic craft beer paradise 🍺' },
  { id: 'm2', name: 'MTR 1924', cuisine: 'Authentic South Indian', photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop', mood: 'Classic Heritage', teaser: 'A century of dosas & filter coffee ☕' },
  { id: 'm3', name: 'Skyye Rooftop', cuisine: 'Continental & Cocktails', photo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop', mood: 'Rooftop Experience', teaser: 'City views + stunning sunsets 🌇' },
  { id: 'm4', name: 'Truffles', cuisine: 'American Burgers & Shakes', photo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop', mood: 'Casual & Fun', teaser: 'Best burgers in Bangalore, period 🍔' },
]

export default function BrowseScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useApp()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMatch, setShowMatch] = useState(null)
  const [mode, setMode] = useState('people') // 'people' | 'mystery'
  const [mysteryIdx, setMysteryIdx] = useState(0)
  const [mysteryLiked, setMysteryLiked] = useState([])
  const matchSoundRef = useRef(null)

  useEffect(() => { fetchProfiles() }, [])

  const fetchProfiles = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/users/discover')
      setProfiles(res.data.users?.length ? res.data.users : MOCK_PROFILES)
    } catch {
      setProfiles(MOCK_PROFILES)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = useCallback(async (profile) => {
    setProfiles(p => p.filter(x => x.id !== profile.id))
    haptic.like()
    try {
      const res = await api.post('/api/matches/like', { liked_user_id: profile.id })
      if (res.data.matched) {
        haptic.match()
        setShowMatch({ user: profile, matchId: res.data.match_id })
      } else {
        showToast('Liked! 💚')
      }
    } catch {
      showToast('Liked! 💚')
    }
  }, [showToast])

  const handlePass = useCallback((profile) => {
    setProfiles(p => p.filter(x => x.id !== profile.id))
    haptic.pass()
  }, [])

  const handleMysteryLike = (rest) => {
    haptic.like()
    setMysteryLiked(prev => [...prev, rest])
    if (mysteryIdx < MYSTERY_RESTAURANTS.length - 1) {
      setMysteryIdx(i => i + 1)
    } else {
      showToast('Browse people who like these spots! 🎉')
      setMode('people')
    }
  }

  const handleMysteryPass = () => {
    haptic.pass()
    if (mysteryIdx < MYSTERY_RESTAURANTS.length - 1) setMysteryIdx(i => i + 1)
    else { showToast('Try people mode now!'); setMode('people') }
  }

  const currentMystery = MYSTERY_RESTAURANTS[mysteryIdx]

  if (loading) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', background: '#FFF8F0' }}>
        <div style={{ fontSize: 48, animation: 'bounce 1s infinite' }}>🍽️</div>
        <div className="spinner" style={{ marginTop: 20 }} />
        <p style={{ marginTop: 16, color: '#888', fontSize: 14 }}>Finding foodies near you in Bangalore...</p>
      </div>
    )
  }

  return (
    <div className="screen" style={{ background: '#FFF8F0' }}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Discover</h1>
          <p style={styles.subtitle}>📍 Bangalore · {profiles.length} foodies nearby</p>
        </div>
        <div style={styles.headerRight}>
          <button className="btn btn-icon" style={{ background: 'white', fontSize: 16 }} onClick={() => { haptic.tap(); fetchProfiles() }}>🔄</button>
        </div>
      </div>

      {/* Mode toggle */}
      <div style={styles.modeRow}>
        <button
          style={{ ...styles.modeBtn, ...(mode === 'people' ? styles.modeBtnActive : {}) }}
          onClick={() => { setMode('people'); haptic.tap() }}
        >
          👫 People
        </button>
        <button
          style={{ ...styles.modeBtn, ...(mode === 'mystery' ? styles.modeBtnMystery : {}) }}
          onClick={() => { setMode('mystery'); haptic.tap() }}
        >
          🎲 Mystery Restaurant
        </button>
      </div>

      {mode === 'mystery' ? (
        /* Mystery mode — swipe restaurant-first */
        <div style={styles.cardArea}>
          {mysteryIdx >= MYSTERY_RESTAURANTS.length ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: 56 }}>🎉</div>
              <h3 style={styles.emptyTitle}>All restaurants seen!</h3>
              <p style={styles.emptySub}>You liked {mysteryLiked.length} spot{mysteryLiked.length !== 1 ? 's' : ''}. Now find people who share your taste!</p>
              <button className="btn btn-primary" onClick={() => { setMode('people'); setMysteryIdx(0) }} style={{ width: 'auto', marginTop: 24, paddingLeft: 32, paddingRight: 32 }}>Find Matches 💚</button>
            </div>
          ) : (
            <>
              {/* Stack card behind */}
              {MYSTERY_RESTAURANTS[mysteryIdx + 1] && (
                <div style={styles.stackBehind}>
                  <MysteryCard restaurant={MYSTERY_RESTAURANTS[mysteryIdx + 1]} />
                </div>
              )}
              <div style={styles.swipeFront}>
                <MysteryCard restaurant={currentMystery} onLike={handleMysteryLike} onPass={handleMysteryPass} isTop />
              </div>
              <p style={styles.swipeHint}>👋 Pass &nbsp;&nbsp;&nbsp; ❤️ Want to go!</p>
            </>
          )}
        </div>
      ) : (
        /* People mode */
        <div style={styles.cardArea}>
          {profiles.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: 64 }}>🍽️</div>
              <h3 style={styles.emptyTitle}>You've seen everyone!</h3>
              <p style={styles.emptySub}>Check back later or try Mystery Restaurant mode</p>
              <button className="btn btn-primary" onClick={fetchProfiles} style={{ width: 'auto', paddingLeft: 32, paddingRight: 32, marginTop: 24 }}>Refresh 🔄</button>
            </div>
          ) : (
            profiles.slice(0, 3).map((profile, i) => (
              <SwipeCard
                key={profile.id}
                profile={profile}
                onLike={handleLike}
                onPass={handlePass}
                isTop={i === 0}
                stackIndex={i}
              />
            ))
          )}
        </div>
      )}

      {/* Match overlay */}
      {showMatch && (
        <div className="match-overlay" onClick={() => setShowMatch(null)}>
          <div style={styles.matchCard} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 60, marginBottom: 8, animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>🎉</div>
            <h2 style={styles.matchTitle}>It's a Match!</h2>
            <p style={styles.matchSub}>You and <strong>{showMatch.user.name}</strong> are both foodies!</p>
            <div style={styles.matchAvatars}>
              <img src={user?.photo || `https://api.dicebear.com/7.x/personas/svg?seed=${user?.id}`} style={styles.matchAvatar} alt="you" />
              <div style={{ fontSize: 32 }}>💕</div>
              <img src={showMatch.user.photo} style={styles.matchAvatar} alt={showMatch.user.name} />
            </div>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 20, textAlign: 'center' }}>Try the food icebreaker quiz before you chat! 🧠🍜</p>
            <button className="btn btn-primary" onClick={() => { setShowMatch(null); navigate(`/icebreaker/${showMatch.matchId}`) }}>
              🧠 Food Icebreaker Quiz
            </button>
            <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => { setShowMatch(null); navigate(`/chat/${showMatch.matchId}`) }}>
              💬 Skip to Chat
            </button>
            <button className="btn btn-ghost" onClick={() => setShowMatch(null)} style={{ marginTop: 4, fontSize: 12 }}>Later</button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}

function MysteryCard({ restaurant, onLike, onPass, isTop }) {
  return (
    <div style={cardStyles.card}>
      <div style={cardStyles.photoWrap}>
        <img src={restaurant.photo} alt={restaurant.name} style={cardStyles.photo} />
        <div style={cardStyles.gradient} />
        <div style={cardStyles.mysteryBadge}>🎲 Mystery Spot</div>
        <div style={cardStyles.overlay}>
          <div style={cardStyles.restName}>{restaurant.name}</div>
          <div style={cardStyles.cuisine}>{restaurant.cuisine}</div>
          <div style={cardStyles.mood}>{restaurant.mood}</div>
          <p style={cardStyles.teaser}>{restaurant.teaser}</p>
        </div>
      </div>
      {isTop && (
        <div style={cardStyles.actions}>
          <button style={{ ...cardStyles.btn, ...cardStyles.passBtn }} onClick={onPass}>
            <span>👋</span><span style={{ fontSize: 13, fontWeight: 700 }}>Pass</span>
          </button>
          <button style={{ ...cardStyles.btn, ...cardStyles.likeBtn }} onClick={() => onLike(restaurant)}>
            <span>❤️</span><span style={{ fontSize: 13, fontWeight: 700 }}>Want to go!</span>
          </button>
        </div>
      )}
    </div>
  )
}

const cardStyles = {
  card: { background: 'white', borderRadius: 24, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.16)', width: '100%' },
  photoWrap: { position: 'relative', width: '100%', aspectRatio: '4/3', overflow: 'hidden' },
  photo: { width: '100%', height: '100%', objectFit: 'cover' },
  gradient: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.85) 100%)' },
  mysteryBadge: { position: 'absolute', top: 14, left: 14, background: '#2D4A3E', color: 'white', fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 50 },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px' },
  restName: { fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 2 },
  cuisine: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  mood: { display: 'inline-block', fontSize: 11, fontWeight: 700, color: 'white', background: 'rgba(224,123,57,0.85)', padding: '3px 10px', borderRadius: 50, marginBottom: 8 },
  teaser: { fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 1.4 },
  actions: { display: 'flex', gap: 10, padding: '14px 16px' },
  btn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '13px 16px', borderRadius: 50, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 20 },
  passBtn: { background: '#F5F5F5', color: '#666' },
  likeBtn: { background: 'linear-gradient(135deg, #E07B39, #F4A350)', color: 'white', boxShadow: '0 4px 16px rgba(224,123,57,0.35)' },
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 8px' },
  title: { fontSize: 26, fontWeight: 800, color: '#1A1A1A' },
  subtitle: { fontSize: 13, color: '#888', marginTop: 2 },
  headerRight: { display: 'flex', gap: 8, alignItems: 'center' },
  modeRow: { display: 'flex', gap: 8, padding: '0 16px 12px' },
  modeBtn: { flex: 1, padding: '10px 12px', borderRadius: 50, border: '2px solid #E8DDD3', background: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: '#555', transition: 'all 0.2s' },
  modeBtnActive: { background: '#E07B39', borderColor: '#E07B39', color: 'white', boxShadow: '0 4px 14px rgba(224,123,57,0.35)' },
  modeBtnMystery: { background: '#2D4A3E', borderColor: '#2D4A3E', color: 'white', boxShadow: '0 4px 14px rgba(45,74,62,0.3)' },
  cardArea: { flex: 1, position: 'relative', margin: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' },
  stackBehind: { position: 'absolute', width: '100%', transform: 'translateY(12px) scale(0.96)', zIndex: 1, pointerEvents: 'none' },
  swipeFront: { width: '100%', zIndex: 2, position: 'relative' },
  swipeHint: { fontSize: 12, color: '#CCC', marginTop: 10, textAlign: 'center' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: 700, color: '#1A1A1A', marginTop: 16 },
  emptySub: { fontSize: 14, color: '#888', marginTop: 8, textAlign: 'center' },
  matchCard: { background: 'white', borderRadius: 28, padding: '32px 28px', margin: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 340, width: '100%' },
  matchTitle: { fontSize: 30, fontWeight: 800, color: '#E07B39', marginBottom: 8 },
  matchSub: { fontSize: 15, color: '#444', marginBottom: 16 },
  matchAvatars: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 },
  matchAvatar: { width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid #E07B39' },
}

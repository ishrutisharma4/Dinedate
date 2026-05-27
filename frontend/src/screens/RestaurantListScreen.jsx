import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { RestaurantListCard } from '../components/RestaurantSwipeCard'
import RestaurantSwipeCard from '../components/RestaurantSwipeCard'
import { haptic } from '../utils/haptic'
import api from '../services/api'

const MOOD_FILTERS = [
  { id: null, icon: '✨', label: 'All' },
  { id: 'romantic', icon: '🕯️', label: 'Romantic' },
  { id: 'lively', icon: '🎉', label: 'Lively' },
  { id: 'cozy', icon: '☕', label: 'Cozy' },
  { id: 'rooftop', icon: '🌇', label: 'Rooftop' },
  { id: 'hidden_gem', icon: '💎', label: 'Hidden gem' },
  { id: 'date_night', icon: '🌹', label: 'Date night' },
]

export default function RestaurantListScreen() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useApp()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [match, setMatch] = useState(null)
  const [view, setView] = useState('swipe') // 'swipe' | 'list'
  const [swipeIdx, setSwipeIdx] = useState(0)
  const [moodFilter, setMoodFilter] = useState(null)
  const [wantedIds, setWantedIds] = useState(new Set())

  useEffect(() => { loadRestaurants() }, [matchId])

  const loadRestaurants = async () => {
    setLoading(true)
    try {
      const [matchRes, restRes] = await Promise.all([
        api.get(`/api/matches/${matchId}`),
        api.get(`/api/restaurants/${matchId}/suggestions`),
      ])
      setMatch(matchRes.data.match)
      setRestaurants(restRes.data.restaurants || [])
    } catch {
      // fallback to Bangalore data
      try {
        const restRes = await api.get('/api/restaurants/mystery/all')
        setRestaurants(restRes.data.restaurants?.slice(0, 8) || [])
      } catch { setRestaurants([]) }
    } finally { setLoading(false) }
  }

  const filtered = moodFilter ? restaurants.filter(r => r.mood?.includes(moodFilter)) : restaurants

  const handleWant = (r) => {
    setWantedIds(prev => new Set([...prev, r.id]))
    setSwipeIdx(i => i + 1)
    haptic.like()
    if (swipeIdx >= filtered.length - 2) showToast('You\'ve seen them all! 🍽️')
  }

  const handleSkip = () => {
    setSwipeIdx(i => i + 1)
    haptic.pass()
  }

  const handleConfirm = async () => {
    if (!selected) return showToast('Pick a restaurant first')
    setConfirming(true)
    haptic.match()
    try {
      await api.post(`/api/matches/${matchId}/select-restaurant`, { restaurant: selected })
      showToast(`${selected.name} booked! Date confirmed 🎉`)
      navigate(`/chat/${matchId}`)
    } catch {
      showToast(`${selected.name} suggested! Waiting for your match... 💌`)
      navigate(`/chat/${matchId}`)
    } finally { setConfirming(false) }
  }

  const current = filtered[swipeIdx]
  const upcoming = filtered[swipeIdx + 1]

  return (
    <div className="screen" style={{ background: '#FFF8F0' }}>
      {/* Header */}
      <div style={styles.header}>
        <button className="btn btn-ghost" style={{ padding: '8px 4px' }} onClick={() => navigate(-1)}>←</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={styles.title}>Pick a Restaurant</h2>
          <p style={styles.subtitle}>{match?.other_user?.name ? `For you & ${match.other_user.name}` : 'Bangalore picks for you both'}</p>
        </div>
        <div style={styles.viewToggle}>
          <button style={{ ...styles.viewBtn, ...(view === 'swipe' ? styles.viewActive : {}) }} onClick={() => { setView('swipe'); haptic.tap() }}>🃏</button>
          <button style={{ ...styles.viewBtn, ...(view === 'list' ? styles.viewActive : {}) }} onClick={() => { setView('list'); haptic.tap() }}>☰</button>
        </div>
      </div>

      {/* Overlap tags */}
      {match?.mutual_cuisines?.length > 0 && (
        <div style={styles.overlapBar}>
          <span style={styles.overlapLabel}>Showing</span>
          {match.mutual_cuisines.map(c => <span key={c} style={styles.overlapChip}>{c}</span>)}
          <span style={styles.overlapLabel}>spots in Bangalore</span>
        </div>
      )}

      {/* Mood filters */}
      <div style={styles.moodRow}>
        {MOOD_FILTERS.map(m => (
          <button key={String(m.id)} style={{ ...styles.moodBtn, ...(moodFilter === m.id ? styles.moodActive : {}) }}
            onClick={() => { setMoodFilter(m.id); setSwipeIdx(0); haptic.tap() }}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <div className="spinner" />
          <p style={{ fontSize: 14, color: '#888' }}>Finding great spots in Bangalore...</p>
        </div>
      ) : view === 'swipe' ? (
        // SWIPE MODE
        <div style={styles.swipeArea}>
          {filtered.length === 0 || swipeIdx >= filtered.length ? (
            <div style={styles.empty}>
              <div style={{ fontSize: 56 }}>🍽️</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginTop: 16, color: '#1A1A1A' }}>That's all!</h3>
              <p style={{ fontSize: 14, color: '#888', marginTop: 8, textAlign: 'center' }}>
                {wantedIds.size > 0 ? `You liked ${wantedIds.size} place${wantedIds.size > 1 ? 's' : ''}! Switch to list view to pick one.` : 'Try a different mood filter'}
              </p>
              <button className="btn btn-primary" onClick={() => setView('list')} style={{ marginTop: 20, width: 'auto', paddingLeft: 32, paddingRight: 32 }}>See your picks ☰</button>
            </div>
          ) : (
            <>
              {/* Stack: next card behind */}
              {upcoming && (
                <div style={{ ...styles.stackBehind }}>
                  <RestaurantSwipeCard restaurant={upcoming} />
                </div>
              )}
              {/* Current card */}
              <div style={styles.swipeCard}>
                <RestaurantSwipeCard
                  key={current.id}
                  restaurant={current}
                  onWant={handleWant}
                  onSkip={handleSkip}
                />
              </div>
              <p style={styles.swipeHint}>← Skip &nbsp;&nbsp; Want to go! →</p>
              <div style={styles.swipeCounter}>{swipeIdx + 1} / {filtered.length}</div>
            </>
          )}
        </div>
      ) : (
        // LIST MODE (Swiggy-style)
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 140px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(r => (
              <div key={r.id}>
                <RestaurantListCard
                  restaurant={r}
                  selected={selected?.id === r.id}
                  onSelect={r => { setSelected(r); haptic.tap() }}
                />
                {wantedIds.has(r.id) && (
                  <div style={styles.wantedBadge}>❤️ You liked this!</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm bar */}
      {selected && view === 'list' && (
        <div style={styles.confirmBar}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{selected.name}</p>
            <p style={{ fontSize: 12, color: '#888', margin: 0 }}>{'₹'.repeat(selected.price_level || 2)} · ★ {selected.rating} · {selected.match_pct}% match</p>
          </div>
          <button style={styles.confirmBtn} onClick={handleConfirm} disabled={confirming}>
            {confirming ? '🎉' : 'Suggest This! 🎯'}
          </button>
        </div>
      )}
    </div>
  )
}

const styles = {
  header: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px 8px', background: 'white', borderBottom: '1px solid #E8DDD3', flexShrink: 0 },
  title: { fontSize: 17, fontWeight: 800, color: '#1A1A1A' },
  subtitle: { fontSize: 12, color: '#888' },
  viewToggle: { display: 'flex', background: '#F5F5F5', borderRadius: 10, overflow: 'hidden' },
  viewBtn: { padding: '6px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, fontFamily: 'Inter, sans-serif' },
  viewActive: { background: '#E07B39', borderRadius: 8 },
  overlapBar: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, padding: '8px 16px', background: '#FFF0E6', borderBottom: '1px solid #F2DDD0', flexShrink: 0 },
  overlapLabel: { fontSize: 12, color: '#888' },
  overlapChip: { fontSize: 11, fontWeight: 700, color: 'white', background: '#E07B39', padding: '3px 10px', borderRadius: 50 },
  moodRow: { display: 'flex', gap: 8, padding: '8px 16px', overflowX: 'auto', flexShrink: 0 },
  moodBtn: { padding: '7px 12px', borderRadius: 50, border: '1.5px solid #E8DDD3', background: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', color: '#555', fontFamily: 'Inter, sans-serif', flexShrink: 0 },
  moodActive: { background: '#2D4A3E', borderColor: '#2D4A3E', color: 'white' },
  swipeArea: { flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 16px 0', flexDirection: 'column' },
  stackBehind: { position: 'absolute', width: 'calc(100% - 48px)', transform: 'translateY(12px) scale(0.96)', zIndex: 1, pointerEvents: 'none' },
  swipeCard: { width: '100%', zIndex: 2, position: 'relative' },
  swipeHint: { fontSize: 12, color: '#CCC', marginTop: 12, textAlign: 'center' },
  swipeCounter: { fontSize: 12, color: '#BBB', marginTop: 4 },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px' },
  wantedBadge: { fontSize: 11, color: '#E07B39', fontWeight: 600, padding: '4px 8px', background: '#FFF0E6', borderRadius: '0 0 8px 8px', marginTop: -4, textAlign: 'center' },
  confirmBar: { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #E8DDD3', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 -4px 20px rgba(0,0,0,0.10)' },
  confirmBtn: { background: '#E07B39', color: 'white', border: 'none', borderRadius: 50, padding: '12px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' },
}

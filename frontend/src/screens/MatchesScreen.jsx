import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MatchCard from '../components/MatchCard'
import BottomNav from '../components/BottomNav'
import api from '../services/api'

const MOCK_MATCHES = [
  { id: 'm1', status: 'pending_cuisine', created_at: new Date(Date.now() - 300000).toISOString(), other_user: { id: '1', name: 'Priya', photo: 'https://api.dicebear.com/7.x/personas/svg?seed=priya&backgroundColor=ffd5dc' }, last_message: "You matched! Pick a cuisine 🍜", unread: 1 },
  { id: 'm2', status: 'confirmed', created_at: new Date(Date.now() - 86400000).toISOString(), other_user: { id: '2', name: 'Arjun', photo: 'https://api.dicebear.com/7.x/personas/svg?seed=arjun&backgroundColor=c0aede' }, last_message: "See you at Prego Saturday! 🍝", unread: 0 },
  { id: 'm3', status: 'pending_restaurant', created_at: new Date(Date.now() - 3600000).toISOString(), other_user: { id: '3', name: 'Sneha', photo: 'https://api.dicebear.com/7.x/personas/svg?seed=sneha&backgroundColor=b6e3f4' }, last_message: "Italian or Japanese? You decide!", unread: 2 },
]

export default function MatchesScreen() {
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/matches')
      setMatches(res.data.matches?.length ? res.data.matches : MOCK_MATCHES)
    } catch {
      setMatches(MOCK_MATCHES)
    } finally {
      setLoading(false)
    }
  }

  const filtered = matches.filter(m => {
    if (filter === 'all') return true
    if (filter === 'active') return ['pending_cuisine', 'pending_restaurant'].includes(m.status)
    if (filter === 'confirmed') return m.status === 'confirmed'
    return true
  })

  const unread = matches.reduce((n, m) => n + (m.unread || 0), 0)

  return (
    <div className="screen" style={{ background: '#FFF8F0' }}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Matches</h1>
          <p style={styles.subtitle}>{matches.length} foodie matches</p>
        </div>
        {unread > 0 && <span className="badge" style={{ fontSize: 13, width: 24, height: 24 }}>{unread}</span>}
      </div>

      {/* Filter tabs */}
      <div style={styles.filterRow}>
        {['all', 'active', 'confirmed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}>
            {f === 'all' ? '✨ All' : f === 'active' ? '🔥 In Progress' : '✅ Confirmed'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: 56 }}>💌</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginTop: 16 }}>No matches yet</h3>
          <p style={{ fontSize: 14, color: '#888', marginTop: 8, textAlign: 'center' }}>Keep swiping to find your meal match!</p>
          <button className="btn btn-primary" onClick={() => navigate('/browse')} style={{ width: 'auto', paddingLeft: 32, paddingRight: 32, marginTop: 20 }}>Discover People</button>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.map(match => (
            <div key={match.id}>
              <MatchCard match={match} />
              {['pending_cuisine', 'pending_restaurant'].includes(match.status) && (
                <div style={styles.actionBanner}>
                  <span style={{ fontSize: 13, color: '#E07B39', fontWeight: 600 }}>
                    {match.status === 'pending_cuisine' ? '🍜 Pick a cuisine for your date' : '🗺️ Choose a restaurant together'}
                  </span>
                  <button
                    onClick={() => navigate(match.status === 'pending_cuisine' ? `/restaurant-pick/${match.id}` : `/restaurants/${match.id}`)}
                    style={styles.actionBtn}
                  >
                    {match.status === 'pending_cuisine' ? 'Pick Cuisine' : 'Choose'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <BottomNav unreadCount={unread} />
    </div>
  )
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 8px' },
  title: { fontSize: 26, fontWeight: 800, color: '#1A1A1A' },
  subtitle: { fontSize: 13, color: '#888', marginTop: 2 },
  filterRow: { display: 'flex', gap: 8, padding: '8px 20px 12px', overflowX: 'auto' },
  filterBtn: { padding: '8px 16px', borderRadius: 50, border: '2px solid #E8DDD3', background: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', color: '#666', fontFamily: 'Inter, sans-serif' },
  filterActive: { background: '#E07B39', borderColor: '#E07B39', color: 'white' },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 },
  actionBanner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px', background: '#FFF0E6', borderBottom: '1px solid #F2EBE5' },
  actionBtn: { fontSize: 12, fontWeight: 700, color: 'white', background: '#E07B39', border: 'none', borderRadius: 50, padding: '6px 14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
}

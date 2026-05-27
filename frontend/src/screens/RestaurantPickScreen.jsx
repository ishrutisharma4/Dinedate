import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { CUISINES } from '../components/CuisineSelector'
import api from '../services/api'

export default function RestaurantPickScreen() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useApp()
  const [selected, setSelected] = useState([])
  const [match, setMatch] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get(`/api/matches/${matchId}`)
      .then(res => setMatch(res.data.match))
      .catch(() => setMatch({ id: matchId, other_user: { name: 'your match', id: '1' } }))
  }, [matchId])

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleSubmit = async () => {
    if (selected.length === 0) return showToast('Pick at least one cuisine')
    setSubmitting(true)
    try {
      const res = await api.post(`/api/matches/${matchId}/cuisine-pick`, { cuisines: selected })
      if (res.data.overlap?.length > 0) {
        showToast(`Great match! You both like ${res.data.overlap[0]}! 🎉`)
        navigate(`/restaurants/${matchId}`)
      } else if (res.data.waiting) {
        showToast('Picked! Waiting for your match to choose...')
        navigate(`/chat/${matchId}`)
      } else {
        showToast('No overlap found, try different cuisines')
      }
    } catch {
      showToast('Saved! Waiting for your match...')
      navigate(`/chat/${matchId}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="screen-scroll" style={styles.screen}>
      <div style={styles.header}>
        <button className="btn btn-ghost" style={{ alignSelf: 'flex-start', padding: '4px 0' }} onClick={() => navigate(-1)}>← Back</button>
        <div style={{ fontSize: 48 }}>🍜</div>
        <h2 style={styles.title}>Pick Your Cuisine Vibe</h2>
        <p style={styles.subtitle}>
          What kind of food do you want for your date with <strong>{match?.other_user?.name || 'your match'}</strong>?
        </p>
        <div style={styles.hint}>
          <span style={{ fontSize: 20 }}>💡</span>
          <span style={{ fontSize: 13, color: '#888' }}>You'll only match if you both pick at least one in common</span>
        </div>
      </div>

      <div style={styles.grid}>
        {CUISINES.map(c => {
          const sel = selected.includes(c.id)
          return (
            <button key={c.id} type="button" onClick={() => toggle(c.id)}
              style={{ ...styles.item, ...(sel ? styles.itemSelected : {}) }}>
              <span style={{ fontSize: 32 }}>{c.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: sel ? 'white' : '#1A1A1A', textAlign: 'center' }}>{c.label}</span>
              {sel && <div style={styles.checkmark}>✓</div>}
            </button>
          )
        })}
      </div>

      <div style={styles.footer}>
        {selected.length > 0 && (
          <div style={styles.selectedPreview}>
            {selected.map(id => {
              const c = CUISINES.find(x => x.id === id)
              return <span key={id} style={styles.previewChip}>{c?.icon} {c?.label}</span>
            })}
          </div>
        )}
        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || selected.length === 0}
          style={{ opacity: selected.length === 0 || submitting ? 0.6 : 1 }}>
          {submitting ? 'Submitting...' : `Confirm ${selected.length > 0 ? `(${selected.length} picked)` : ''} 🎯`}
        </button>
      </div>
    </div>
  )
}

const styles = {
  screen: { background: '#FFF8F0', padding: '24px 20px 120px' },
  header: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, alignItems: 'center', textAlign: 'center' },
  title: { fontSize: 24, fontWeight: 800, color: '#1A1A1A' },
  subtitle: { fontSize: 15, color: '#555', lineHeight: 1.5 },
  hint: { display: 'flex', alignItems: 'center', gap: 8, background: '#FFF0E6', padding: '10px 14px', borderRadius: 12 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 },
  item: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '16px 8px', borderRadius: 16, border: '2px solid #E8DDD3', background: 'white', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s', position: 'relative', minHeight: 90 },
  itemSelected: { background: '#E07B39', borderColor: '#E07B39', boxShadow: '0 4px 16px rgba(224,123,57,0.35)', transform: 'scale(1.02)' },
  checkmark: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', color: 'white', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 },
  footer: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, padding: '16px 20px 24px', background: 'linear-gradient(transparent, #FFF8F0 30%)', display: 'flex', flexDirection: 'column', gap: 10 },
  selectedPreview: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  previewChip: { fontSize: 12, background: 'white', border: '1.5px solid #E07B39', color: '#E07B39', padding: '4px 10px', borderRadius: 50, fontWeight: 600 },
}

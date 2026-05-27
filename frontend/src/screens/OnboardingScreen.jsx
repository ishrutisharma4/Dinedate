import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import CuisineSelector from '../components/CuisineSelector'
import { haptic } from '../utils/haptic'
import api from '../services/api'

const MEAL_TYPES = [
  { id: 'breakfast', icon: '🥞', label: 'Breakfast' },
  { id: 'brunch', icon: '🍳', label: 'Brunch' },
  { id: 'lunch', icon: '🥗', label: 'Lunch' },
  { id: 'dinner', icon: '🍽️', label: 'Dinner' },
  { id: 'late_night', icon: '🌙', label: 'Late night' },
]

const REST_TYPES = [
  { id: 'casual', icon: '🪑', label: 'Casual' },
  { id: 'fine_dining', icon: '🕯️', label: 'Fine Dining' },
  { id: 'cafe', icon: '☕', label: 'Cafe' },
  { id: 'rooftop', icon: '🌇', label: 'Rooftop' },
  { id: 'street_food', icon: '🛺', label: 'Street Food' },
  { id: 'brewpub', icon: '🍺', label: 'Brewpub' },
]

const MOODS = [
  { id: 'romantic', icon: '🕯️', label: 'Romantic & Cozy', desc: 'Candlelit, intimate' },
  { id: 'lively', icon: '🎉', label: 'Lively & Social', desc: 'Music, energy, buzz' },
  { id: 'cozy', icon: '☕', label: 'Quiet & Cozy', desc: 'Relaxed, low-key' },
  { id: 'date_night', icon: '🌹', label: 'Classic Date Night', desc: 'Impressive, memorable' },
  { id: 'hidden_gem', icon: '💎', label: 'Hidden Gems', desc: 'Off the beaten path' },
  { id: 'rooftop', icon: '🌇', label: 'Rooftop Experience', desc: 'Views, vibes, magic' },
]

const DIETARY = [
  { id: 'vegetarian', icon: '🥦', label: 'Vegetarian' },
  { id: 'vegan', icon: '🌱', label: 'Vegan' },
  { id: 'jain', icon: '☮️', label: 'Jain' },
  { id: 'halal', icon: '🌙', label: 'Halal' },
  { id: 'gluten_free', icon: '🌾', label: 'Gluten-free' },
  { id: 'none', icon: '🍖', label: 'No restrictions' },
]

const SOCIAL = [
  { id: 'chatty', icon: '🗣️', label: 'Super chatty', desc: 'I love long conversations' },
  { id: 'moderate', icon: '😊', label: 'Balanced', desc: 'Good mix of talk & food focus' },
  { id: 'quiet', icon: '🤫', label: 'Let the food talk', desc: 'I prefer enjoying the meal' },
]

const INTERESTS = [
  { id: 'coffee', icon: '☕', label: 'Coffee snob' },
  { id: 'craft_beer', icon: '🍺', label: 'Craft beer' },
  { id: 'wine', icon: '🍷', label: 'Wine lover' },
  { id: 'baking', icon: '🧁', label: 'Baking' },
  { id: 'street_food', icon: '🌮', label: 'Street food hunter' },
  { id: 'fine_dining', icon: '⭐', label: 'Fine dining' },
  { id: 'cooking', icon: '👨‍🍳', label: 'Home cook' },
  { id: 'food_blogger', icon: '📸', label: 'Food photographer' },
]

const PRICE = [
  { id: '$', icon: '💰', label: 'Budget', sub: 'Under ₹500' },
  { id: '$$', icon: '💰💰', label: 'Mid', sub: '₹500–1500' },
  { id: '$$$', icon: '💰💰💰', label: 'Splurge', sub: '₹1500+' },
]

export default function OnboardingScreen() {
  const navigate = useNavigate()
  const { updateUser } = useAuth()
  const { showToast } = useApp()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [prefs, setPrefs] = useState({
    cuisines: [], meal_types: [], restaurant_type: [],
    price_range: '$$', social_style: 'moderate',
    dietary: [], mood: [], interests: [], bio: '',
  })

  const set = (key, val) => setPrefs(p => ({ ...p, [key]: val }))
  const toggle = (key, val) => {
    const arr = prefs[key] || []
    set(key, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
    haptic.tap()
  }

  const steps = [
    {
      icon: '🍜', title: 'What cuisines do you love?', sub: 'Pick up to 5 — this drives your matches',
      valid: () => prefs.cuisines.length > 0,
      render: () => <CuisineSelector selected={prefs.cuisines} onChange={v => { set('cuisines', v); haptic.tap() }} />,
    },
    {
      icon: '🌙', title: 'When do you like to eat out?', sub: 'Pick all that work for you',
      valid: () => prefs.meal_types.length > 0,
      render: () => <Grid2>{MEAL_TYPES.map(m => <ChipCard key={m.id} {...m} selected={prefs.meal_types.includes(m.id)} onClick={() => toggle('meal_types', m.id)} />)}</Grid2>,
    },
    {
      icon: '🏮', title: 'Your restaurant vibe?', sub: 'What kind of place feels right?',
      valid: () => prefs.restaurant_type.length > 0,
      render: () => <Grid2>{REST_TYPES.map(r => <ChipCard key={r.id} {...r} selected={prefs.restaurant_type.includes(r.id)} onClick={() => toggle('restaurant_type', r.id)} />)}</Grid2>,
    },
    {
      icon: '✨', title: 'Pick a date mood', sub: 'What vibe are you going for?',
      valid: () => prefs.mood.length > 0,
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MOODS.map(m => (
            <button key={m.id} type="button" onClick={() => { set('mood', [m.id]); haptic.tap() }}
              style={{ ...styles.moodCard, ...(prefs.mood.includes(m.id) ? styles.moodActive : {}) }}>
              <span style={{ fontSize: 28 }}>{m.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: prefs.mood.includes(m.id) ? 'white' : '#1A1A1A' }}>{m.label}</div>
                <div style={{ fontSize: 12, color: prefs.mood.includes(m.id) ? 'rgba(255,255,255,0.75)' : '#888' }}>{m.desc}</div>
              </div>
            </button>
          ))}
        </div>
      ),
    },
    {
      icon: '🌱', title: 'Dietary preferences?', sub: 'We\'ll filter restaurants accordingly',
      valid: () => prefs.dietary.length > 0,
      render: () => <Grid2>{DIETARY.map(d => <ChipCard key={d.id} {...d} selected={prefs.dietary.includes(d.id)} onClick={() => toggle('dietary', d.id)} />)}</Grid2>,
    },
    {
      icon: '💸', title: 'Budget per person?', sub: 'For an average meal out',
      valid: () => !!prefs.price_range,
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PRICE.map(p => (
            <button key={p.id} type="button" onClick={() => { set('price_range', p.id); haptic.tap() }}
              style={{ ...styles.priceCard, ...(prefs.price_range === p.id ? styles.priceActive : {}) }}>
              <span style={{ fontSize: 26 }}>{p.icon}</span>
              <div>
                <div style={{ fontWeight: 700, color: prefs.price_range === p.id ? 'white' : '#1A1A1A' }}>{p.label}</div>
                <div style={{ fontSize: 12, color: prefs.price_range === p.id ? 'rgba(255,255,255,0.7)' : '#999' }}>{p.sub}</div>
              </div>
            </button>
          ))}
        </div>
      ),
    },
    {
      icon: '🎭', title: 'How are you at the table?', sub: 'Your meal personality',
      valid: () => !!prefs.social_style,
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {SOCIAL.map(s => (
            <button key={s.id} type="button" onClick={() => { set('social_style', s.id); haptic.tap() }}
              style={{ ...styles.socialCard, ...(prefs.social_style === s.id ? styles.socialActive : {}) }}>
              <span style={{ fontSize: 30 }}>{s.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: prefs.social_style === s.id ? 'white' : '#1A1A1A' }}>{s.label}</div>
                <div style={{ fontSize: 12, color: prefs.social_style === s.id ? 'rgba(255,255,255,0.7)' : '#888' }}>{s.desc}</div>
              </div>
            </button>
          ))}
        </div>
      ),
    },
    {
      icon: '🍺', title: 'Your foodie interests?', sub: 'Let matches know your food personality',
      valid: () => true,
      render: () => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {INTERESTS.map(i => (
            <button key={i.id} type="button" onClick={() => toggle('interests', i.id)}
              style={{ ...styles.interestChip, ...(prefs.interests.includes(i.id) ? styles.interestActive : {}) }}>
              {i.icon} {i.label}
            </button>
          ))}
        </div>
      ),
    },
    {
      icon: '✍️', title: 'Write a short bio', sub: 'Your food story in a few words',
      valid: () => true,
      render: () => (
        <>
          <textarea className="input" placeholder="e.g. I judge restaurants by their dosas. Coffee snob. Will always order the weirdest thing on the menu 🧡" value={prefs.bio} onChange={e => set('bio', e.target.value)} rows={5} style={{ resize: 'none' }} maxLength={200} />
          <p style={{ fontSize: 12, color: '#CCC', textAlign: 'right', marginTop: 4 }}>{prefs.bio.length}/200</p>
        </>
      ),
    },
  ]

  const current = steps[step]
  const progress = (step + 1) / steps.length

  const next = async () => {
    if (!current.valid()) return showToast('Please make a selection to continue')
    haptic.medium()
    if (step < steps.length - 1) { setStep(s => s + 1) }
    else {
      setLoading(true)
      try {
        await api.put('/api/users/preferences', { ...prefs, onboarding_complete: true })
        updateUser({ onboarding_complete: true })
        haptic.match()
        navigate('/browse')
      } catch { showToast('Failed to save preferences') }
      finally { setLoading(false) }
    }
  }

  return (
    <div className="screen-scroll" style={styles.screen}>
      {/* Progress */}
      <div style={styles.progressOuter}>
        <div style={{ ...styles.progressInner, width: `${progress * 100}%` }} />
      </div>
      <p style={styles.stepCount}>{step + 1} of {steps.length}</p>

      <div style={styles.header}>
        <span style={{ fontSize: 44 }}>{current.icon}</span>
        <h2 style={styles.title}>{current.title}</h2>
        <p style={styles.sub}>{current.sub}</p>
      </div>

      <div style={{ flex: 1 }}>{current.render()}</div>

      <div style={styles.footer}>
        <button className="btn btn-primary" onClick={next} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Saving...' : step === steps.length - 1 ? 'Start Matching 🔥' : 'Next →'}
        </button>
        {step > 0 && (
          <button type="button" className="btn btn-ghost" onClick={() => { setStep(s => s - 1); haptic.tap() }} style={{ marginTop: 8 }}>
            ← Back
          </button>
        )}
      </div>
    </div>
  )
}

function Grid2({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>{children}</div>
}

function ChipCard({ icon, label, selected, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 14, border: `2.5px solid ${selected ? '#E07B39' : '#E8DDD3'}`, background: selected ? '#E07B39' : 'white', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}>
      <span style={{ fontSize: 24 }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: selected ? 'white' : '#1A1A1A' }}>{label}</span>
    </button>
  )
}

const styles = {
  screen: { background: '#FFF8F0', padding: '16px 20px 100px', display: 'flex', flexDirection: 'column', gap: 20 },
  progressOuter: { height: 4, background: '#E8DDD3', borderRadius: 4, overflow: 'hidden' },
  progressInner: { height: '100%', background: 'linear-gradient(90deg, #E07B39, #F4C430)', borderRadius: 4, transition: 'width 0.4s cubic-bezier(0.34,1.56,0.64,1)' },
  stepCount: { fontSize: 12, color: '#BBB', textAlign: 'center', marginTop: -8 },
  header: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6 },
  title: { fontSize: 22, fontWeight: 800, color: '#1A1A1A' },
  sub: { fontSize: 13, color: '#888' },
  footer: { display: 'flex', flexDirection: 'column', marginTop: 8 },
  moodCard: { display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 14, border: '2px solid #E8DDD3', background: 'white', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' },
  moodActive: { background: 'linear-gradient(135deg, #E07B39, #F4A350)', borderColor: '#E07B39', boxShadow: '0 4px 16px rgba(224,123,57,0.3)' },
  priceCard: { display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', borderRadius: 14, border: '2px solid #E8DDD3', background: 'white', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' },
  priceActive: { background: '#E07B39', borderColor: '#E07B39', boxShadow: '0 4px 16px rgba(224,123,57,0.3)' },
  socialCard: { display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 14, border: '2px solid #E8DDD3', background: 'white', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' },
  socialActive: { background: '#2D4A3E', borderColor: '#2D4A3E' },
  interestChip: { padding: '10px 16px', borderRadius: 50, border: '2px solid #E8DDD3', background: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: '#444', transition: 'all 0.15s' },
  interestActive: { background: '#2D4A3E', borderColor: '#2D4A3E', color: 'white' },
}

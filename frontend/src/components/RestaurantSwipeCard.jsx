import { haptic } from '../utils/haptic'

const MOOD_LABELS = {
  romantic: { icon: '🕯️', color: '#E91E63', label: 'Romantic' },
  lively: { icon: '🎉', color: '#FF5722', label: 'Lively' },
  cozy: { icon: '☕', color: '#795548', label: 'Cozy' },
  hidden_gem: { icon: '💎', color: '#9C27B0', label: 'Hidden Gem' },
  rooftop: { icon: '🌇', color: '#2196F3', label: 'Rooftop' },
  date_night: { icon: '🌹', color: '#F44336', label: 'Date Night' },
  casual: { icon: '😊', color: '#4CAF50', label: 'Casual' },
  fine_dining: { icon: '🍷', color: '#673AB7', label: 'Fine Dining' },
  heritage: { icon: '🏛️', color: '#FF9800', label: 'Heritage' },
  fun: { icon: '🎊', color: '#FF5722', label: 'Fun' },
}

export default function RestaurantSwipeCard({ restaurant, onWant, onSkip, style = {} }) {
  const mood = restaurant.mood?.[0]
  const moodInfo = MOOD_LABELS[mood] || MOOD_LABELS.casual
  const stars = Math.round(restaurant.rating || 4)

  return (
    <div style={{ ...styles.card, ...style }}>
      {/* Photo */}
      <div style={styles.photoWrap}>
        <img
          src={restaurant.photo_url || `https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop`}
          alt={restaurant.name}
          style={styles.photo}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop' }}
        />
        <div style={styles.gradient} />

        {/* Match % badge */}
        <div style={styles.matchBadge}>
          <span style={styles.matchPct}>{restaurant.match_pct || 88}%</span>
          <span style={styles.matchLabel}>match</span>
        </div>

        {/* Open badge */}
        <div style={{ ...styles.openBadge, background: restaurant.open_now !== false ? '#4CAF50' : '#F44336' }}>
          {restaurant.open_now !== false ? '● Open' : '○ Closed'}
        </div>

        {/* Mood tag */}
        <div style={{ ...styles.moodTag, background: moodInfo.color }}>
          {moodInfo.icon} {moodInfo.label}
        </div>
      </div>

      {/* Info */}
      <div style={styles.info}>
        <div style={styles.row1}>
          <h3 style={styles.name}>{restaurant.name}</h3>
          <span style={styles.price}>{'₹'.repeat(restaurant.price_level || 2)}</span>
        </div>

        <div style={styles.row2}>
          <div style={styles.stars}>
            {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
          </div>
          <span style={styles.ratingNum}>{(restaurant.rating || 4.2).toFixed(1)}</span>
          <span style={styles.ratingCount}>({(restaurant.total_ratings || 0).toLocaleString()})</span>
          {restaurant.distance && <span style={styles.dist}>📍 {(restaurant.distance / 1000).toFixed(1)}km</span>}
        </div>

        <div style={styles.tags}>
          {(restaurant.cuisines || []).slice(0, 3).map(c => (
            <span key={c} style={styles.tag}>{c}</span>
          ))}
          {restaurant.dietary?.map(d => (
            <span key={d} style={{ ...styles.tag, background: '#E8F5E9', color: '#2E7D32' }}>🌱 {d}</span>
          ))}
        </div>

        {restaurant.address && <p style={styles.address}>📍 {restaurant.address}</p>}
      </div>

      {/* Action buttons */}
      <div style={styles.actions}>
        <button
          style={{ ...styles.actionBtn, ...styles.skipBtn }}
          onClick={() => { haptic.pass(); onSkip?.(restaurant) }}
        >
          <span style={{ fontSize: 20 }}>👋</span>
          <span style={styles.btnLabel}>Skip</span>
        </button>
        <button
          style={{ ...styles.actionBtn, ...styles.wantBtn }}
          onClick={() => { haptic.like(); onWant?.(restaurant) }}
        >
          <span style={{ fontSize: 20 }}>❤️</span>
          <span style={styles.btnLabel}>Want to go!</span>
        </button>
      </div>
    </div>
  )
}

// Compact card for list view (Swiggy-style list item)
export function RestaurantListCard({ restaurant, selected, onSelect }) {
  const mood = restaurant.mood?.[0]
  const moodInfo = MOOD_LABELS[mood] || MOOD_LABELS.casual
  return (
    <div
      style={{ ...styles.listCard, border: selected ? '2px solid #E07B39' : '2px solid transparent' }}
      onClick={() => { haptic.tap(); onSelect?.(restaurant) }}
    >
      <div style={styles.listPhotoWrap}>
        <img
          src={restaurant.photo_url}
          alt={restaurant.name}
          style={styles.listPhoto}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop' }}
        />
        <div style={{ ...styles.listMoodBadge, background: moodInfo.color }}>{moodInfo.icon}</div>
        {selected && <div style={styles.listSelected}>✓</div>}
      </div>
      <div style={styles.listBody}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h4 style={styles.listName}>{restaurant.name}</h4>
          <span style={styles.listMatchBadge}>{restaurant.match_pct || 88}% match</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ color: '#F4C430', fontSize: 12 }}>★</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{(restaurant.rating || 4.2).toFixed(1)}</span>
          <span style={{ fontSize: 11, color: '#999' }}>({(restaurant.total_ratings || 0).toLocaleString()})</span>
          <span style={{ fontSize: 12, color: '#E07B39', fontWeight: 600 }}>{'₹'.repeat(restaurant.price_level || 2)}</span>
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {(restaurant.cuisines || []).slice(0, 2).map(c => (
            <span key={c} style={styles.listTag}>{c}</span>
          ))}
          <span style={{ ...styles.listTag, background: '#FFF0E6', color: '#E07B39' }}>{restaurant.open_now !== false ? '● Open' : '○ Closed'}</span>
        </div>
        {restaurant.address && <p style={styles.listAddress}>{restaurant.address}</p>}
      </div>
    </div>
  )
}

const styles = {
  // Swipe card
  card: { background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.14)' },
  photoWrap: { position: 'relative', width: '100%', height: 220 },
  photo: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  gradient: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 100%)' },
  matchBadge: { position: 'absolute', top: 12, left: 12, background: 'white', borderRadius: 50, padding: '6px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
  matchPct: { fontSize: 16, fontWeight: 900, color: '#E07B39', lineHeight: 1 },
  matchLabel: { fontSize: 9, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 },
  openBadge: { position: 'absolute', top: 12, right: 12, fontSize: 11, fontWeight: 700, color: 'white', padding: '4px 10px', borderRadius: 50 },
  moodTag: { position: 'absolute', bottom: 12, left: 12, fontSize: 11, fontWeight: 700, color: 'white', padding: '4px 10px', borderRadius: 50 },
  info: { padding: '14px 16px 8px' },
  row1: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  name: { fontSize: 17, fontWeight: 800, color: '#1A1A1A', flex: 1, marginRight: 8 },
  price: { fontSize: 14, fontWeight: 800, color: '#E07B39' },
  row2: { display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 },
  stars: { color: '#F4C430', fontSize: 13, letterSpacing: -1 },
  ratingNum: { fontSize: 14, fontWeight: 700, color: '#1A1A1A' },
  ratingCount: { fontSize: 11, color: '#999' },
  dist: { fontSize: 11, color: '#888', marginLeft: 4 },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 },
  tag: { fontSize: 11, background: '#FFF0E6', color: '#E07B39', padding: '3px 8px', borderRadius: 50, fontWeight: 600 },
  address: { fontSize: 11, color: '#AAA', marginTop: 0 },
  actions: { display: 'flex', gap: 10, padding: '4px 16px 16px' },
  actionBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 16px', borderRadius: 50, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, transition: 'all 0.15s' },
  skipBtn: { background: '#F5F5F5', color: '#666' },
  wantBtn: { background: 'linear-gradient(135deg, #E07B39, #F4A350)', color: 'white', boxShadow: '0 4px 16px rgba(224,123,57,0.35)' },
  btnLabel: {},
  // List card
  listCard: { display: 'flex', background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', cursor: 'pointer', transition: 'all 0.2s' },
  listPhotoWrap: { position: 'relative', width: 110, flexShrink: 0 },
  listPhoto: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  listMoodBadge: { position: 'absolute', top: 6, left: 6, width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 },
  listSelected: { position: 'absolute', inset: 0, background: 'rgba(224,123,57,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#E07B39' },
  listBody: { flex: 1, padding: '10px 12px' },
  listName: { fontSize: 14, fontWeight: 700, color: '#1A1A1A', flex: 1 },
  listMatchBadge: { fontSize: 11, fontWeight: 700, color: '#E07B39', background: '#FFF0E6', padding: '3px 8px', borderRadius: 50, whiteSpace: 'nowrap' },
  listTag: { fontSize: 10, background: '#F5F5F5', color: '#666', padding: '2px 7px', borderRadius: 50, fontWeight: 500 },
  listAddress: { fontSize: 10, color: '#CCC', marginTop: 4 },
}

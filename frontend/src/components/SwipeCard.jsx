import { useRef, useState, useCallback } from 'react'
import { haptic } from '../utils/haptic'

const SWIPE_THRESHOLD = 90
const ROTATION_FACTOR = 0.10
const SPRING_STIFFNESS = 0.18
const SPRING_DAMPING = 0.72

export default function SwipeCard({ profile, onLike, onPass, isTop, stackIndex = 0 }) {
  const posRef = useRef({ x: 0, y: 0 })
  const velRef = useRef({ x: 0, y: 0 })
  const startRef = useRef({ x: 0, y: 0 })
  const draggingRef = useRef(false)
  const rafRef = useRef(null)
  const cardRef = useRef(null)
  const [displayPos, setDisplayPos] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [flyDir, setFlyDir] = useState(null)

  const applyTransform = useCallback((x, y) => {
    if (!cardRef.current) return
    const rot = x * ROTATION_FACTOR
    cardRef.current.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`
    setDisplayPos({ x, y })
  }, [])

  const springBack = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    let x = posRef.current.x, y = posRef.current.y
    let vx = 0, vy = 0

    const tick = () => {
      vx += (-x) * SPRING_STIFFNESS
      vy += (-y) * SPRING_STIFFNESS
      vx *= SPRING_DAMPING
      vy *= SPRING_DAMPING
      x += vx; y += vy
      applyTransform(x, y)
      if (Math.abs(x) > 0.3 || Math.abs(y) > 0.3 || Math.abs(vx) > 0.1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        applyTransform(0, 0)
        posRef.current = { x: 0, y: 0 }
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [applyTransform])

  const flyOut = useCallback((dir, profile) => {
    cancelAnimationFrame(rafRef.current)
    setFlyDir(dir)
    const targetX = dir === 'right' ? window.innerWidth : -window.innerWidth
    let x = posRef.current.x, y = posRef.current.y
    const vx = (targetX - x) * 0.12
    const vy = y * 0.05

    haptic[dir === 'right' ? 'like' : 'pass']()

    const tick = () => {
      x += (targetX - x) * 0.15
      y += vy
      applyTransform(x, y)
      if (Math.abs(x - targetX) > 8) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        dir === 'right' ? onLike(profile) : onPass(profile)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [applyTransform, onLike, onPass])

  const handleStart = useCallback((clientX, clientY) => {
    if (!isTop) return
    cancelAnimationFrame(rafRef.current)
    startRef.current = { x: clientX - posRef.current.x, y: clientY - posRef.current.y }
    draggingRef.current = true
    setIsDragging(true)
    haptic.tap()
  }, [isTop])

  const handleMove = useCallback((clientX, clientY) => {
    if (!draggingRef.current) return
    const x = clientX - startRef.current.x
    const y = clientY - startRef.current.y
    posRef.current = { x, y }
    applyTransform(x, y)
  }, [applyTransform])

  const handleEnd = useCallback(() => {
    if (!draggingRef.current) return
    draggingRef.current = false
    setIsDragging(false)
    const { x } = posRef.current
    if (x > SWIPE_THRESHOLD) flyOut('right', profile)
    else if (x < -SWIPE_THRESHOLD) flyOut('left', profile)
    else springBack()
  }, [flyOut, springBack, profile])

  const likeOpacity = Math.min(Math.max(displayPos.x / SWIPE_THRESHOLD, 0), 1)
  const passOpacity = Math.min(Math.max(-displayPos.x / SWIPE_THRESHOLD, 0), 1)

  const stackStyle = !isTop ? {
    transform: `scale(${1 - stackIndex * 0.04}) translateY(${stackIndex * 14}px)`,
    zIndex: 10 - stackIndex,
    pointerEvents: 'none',
  } : { zIndex: 10 }

  const cuisines = profile.food_preferences?.cuisines?.slice(0, 3) || []
  const mood = profile.food_preferences?.restaurant_type?.[0] || 'Casual'

  return (
    <div
      ref={cardRef}
      style={{ ...styles.card, ...stackStyle, cursor: isTop ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      onMouseDown={e => handleStart(e.clientX, e.clientY)}
      onMouseMove={e => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={e => { e.preventDefault(); handleStart(e.touches[0].clientX, e.touches[0].clientY) }}
      onTouchMove={e => { e.preventDefault(); handleMove(e.touches[0].clientX, e.touches[0].clientY) }}
      onTouchEnd={handleEnd}
    >
      <div style={styles.photoWrap}>
        <img
          src={profile.photo || `https://api.dicebear.com/7.x/personas/svg?seed=${profile.id}&backgroundColor=b6e3f4,ffd5dc,c0aede,d1f4cc`}
          alt={profile.name}
          style={styles.photo}
          draggable={false}
        />
        <div style={styles.gradient} />

        {/* LIKE stamp */}
        <div style={{ ...styles.stamp, ...styles.likeStamp, opacity: likeOpacity, transform: `rotate(-18deg) scale(${0.8 + likeOpacity * 0.2})` }}>
          💚 LIKE
        </div>
        {/* PASS stamp */}
        <div style={{ ...styles.stamp, ...styles.passStamp, opacity: passOpacity, transform: `rotate(18deg) scale(${0.8 + passOpacity * 0.2})` }}>
          NOPE 💔
        </div>

        {/* Verified badge */}
        {profile.verified && (
          <div style={styles.verifiedBadge}>✓ Verified</div>
        )}

        <div style={styles.overlay}>
          <div style={styles.nameRow}>
            <span style={styles.name}>{profile.name}, {profile.age}</span>
            {profile.verified && <span style={{ fontSize: 18 }}>✓</span>}
          </div>
          <div style={styles.metaRow}>
            <span style={styles.metaTag}>🍽️ {profile.food_preferences?.meal_types?.[0] || 'Dinner'}</span>
            <span style={styles.metaTag}>📍 {profile.distance_km ? `${profile.distance_km}km` : '~2km'}</span>
          </div>
          <div style={styles.cuisineRow}>
            {cuisines.map(c => <span key={c} style={styles.cuisineChip}>{c}</span>)}
            {profile.food_preferences?.dietary?.length > 0 && (
              <span style={{ ...styles.cuisineChip, background: 'rgba(76,175,80,0.85)' }}>
                🌱 {profile.food_preferences.dietary[0]}
              </span>
            )}
          </div>
          {profile.bio && <p style={styles.bio}>{profile.bio}</p>}
        </div>
      </div>

      {isTop && (
        <div style={styles.actions}>
          <button
            className="btn btn-icon btn-icon-lg"
            style={{ background: '#FFF0EE', boxShadow: '0 4px 20px rgba(244,67,54,0.25)' }}
            onClick={() => flyOut('left', profile)}
          >💔</button>
          <button
            style={styles.superLikeBtn}
            onClick={() => { haptic.match(); onLike({ ...profile, superLike: true }) }}
          >⭐</button>
          <button
            className="btn btn-icon btn-icon-lg"
            style={{ background: '#F0FFF4', boxShadow: '0 4px 20px rgba(76,175,80,0.25)' }}
            onClick={() => flyOut('right', profile)}
          >💚</button>
        </div>
      )}
    </div>
  )
}

const styles = {
  card: {
    position: 'absolute', width: '100%', background: 'white',
    borderRadius: 24, overflow: 'hidden',
    boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
    userSelect: 'none', WebkitUserSelect: 'none',
    willChange: 'transform',
    transition: 'box-shadow 0.2s',
  },
  photoWrap: { position: 'relative', width: '100%', aspectRatio: '3/4', overflow: 'hidden' },
  photo: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  gradient: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, transparent 40%, rgba(0,0,0,0.85) 100%)' },
  overlay: { position: 'absolute', bottom: 72, left: 0, right: 0, padding: '0 20px 12px' },
  nameRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  name: { fontSize: 28, fontWeight: 800, color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.3)' },
  metaRow: { display: 'flex', gap: 8, marginBottom: 8 },
  metaTag: { fontSize: 12, color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', padding: '4px 10px', borderRadius: 50, fontWeight: 500 },
  cuisineRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  cuisineChip: { fontSize: 12, color: 'white', background: 'rgba(224,123,57,0.88)', padding: '3px 10px', borderRadius: 50, fontWeight: 600 },
  bio: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, marginTop: 4 },
  verifiedBadge: { position: 'absolute', top: 14, left: 14, fontSize: 12, fontWeight: 700, color: 'white', background: 'rgba(33,150,243,0.9)', padding: '4px 10px', borderRadius: 50, backdropFilter: 'blur(10px)' },
  actions: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, padding: '14px 24px 18px' },
  superLikeBtn: { width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #F4C430, #FF9800)', border: 'none', fontSize: 22, cursor: 'pointer', boxShadow: '0 4px 16px rgba(244,196,48,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  stamp: {
    position: 'absolute', top: 40, fontSize: 20, fontWeight: 900,
    padding: '8px 16px', borderRadius: 10, letterSpacing: 3,
    border: '3px solid', backdropFilter: 'blur(4px)',
    transition: 'opacity 0.05s, transform 0.05s',
  },
  likeStamp: { left: 20, color: '#4CAF50', borderColor: '#4CAF50', background: 'rgba(76,175,80,0.15)' },
  passStamp: { right: 20, color: '#F44336', borderColor: '#F44336', background: 'rgba(244,67,54,0.15)' },
}

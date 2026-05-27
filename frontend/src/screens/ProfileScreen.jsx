import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import CuisineSelector from '../components/CuisineSelector'
import BottomNav from '../components/BottomNav'
import { haptic } from '../utils/haptic'
import api from '../services/api'

const MEAL_TYPES = [
  { id: 'breakfast', icon: '🥞', label: 'Breakfast' },
  { id: 'brunch', icon: '🍳', label: 'Brunch' },
  { id: 'lunch', icon: '🥗', label: 'Lunch' },
  { id: 'dinner', icon: '🍽️', label: 'Dinner' },
  { id: 'late_night', icon: '🌙', label: 'Late Night' },
]

const DIETARY = [
  { id: 'vegetarian', icon: '🥦', label: 'Vegetarian' },
  { id: 'vegan', icon: '🌱', label: 'Vegan' },
  { id: 'jain', icon: '☮️', label: 'Jain' },
  { id: 'halal', icon: '🌙', label: 'Halal' },
  { id: 'gluten_free', icon: '🌾', label: 'Gluten-free' },
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

const DEAL_BREAKERS = [
  { id: 'no_sharing', icon: '🚫', label: 'Doesn\'t share food' },
  { id: 'picky', icon: '😤', label: 'Super picky eater' },
  { id: 'always_late', icon: '⏰', label: 'Always late to reservations' },
  { id: 'no_adventure', icon: '😴', label: 'Never tries new cuisines' },
  { id: 'phone_at_table', icon: '📱', label: 'Phone addict at table' },
]

const BADGES = [
  { id: 'first_match', icon: '💌', label: 'First Match', desc: 'Got your first match!', unlocked: true },
  { id: 'foodie', icon: '🍽️', label: 'Foodie', desc: 'Completed food preferences', unlocked: true },
  { id: 'adventurous', icon: '🌏', label: 'Adventurous', desc: 'Tried 5 different cuisines', unlocked: false },
  { id: 'date_confirmed', icon: '✅', label: 'Date Confirmed', desc: 'Confirmed your first date!', unlocked: false },
  { id: 'dosa_lover', icon: '🥞', label: 'Dosa Lover', desc: 'Picked South Indian 3 times', unlocked: false },
  { id: 'rooftop_royalty', icon: '🌇', label: 'Rooftop Royalty', desc: 'Liked 3+ rooftop spots', unlocked: false },
  { id: 'social_butterfly', icon: '🦋', label: 'Social Butterfly', desc: 'Chatted with 10 matches', unlocked: false },
  { id: 'gourmet', icon: '⭐', label: 'Gourmet', desc: 'Visited a fine dining spot', unlocked: false },
]

export default function ProfileScreen() {
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuth()
  const { showToast } = useApp()
  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'prefs' | 'badges'
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [localPhoto, setLocalPhoto] = useState(null)
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    bio: user?.bio || '',
    name: user?.name || '',
    age: user?.age || '',
    cuisines: user?.food_preferences?.cuisines || [],
    meal_types: user?.food_preferences?.meal_types || [],
    dietary: user?.food_preferences?.dietary || [],
    interests: user?.food_preferences?.interests || [],
    deal_breakers: user?.food_preferences?.deal_breakers || [],
    price_range: user?.food_preferences?.price_range || '$$',
    social_style: user?.food_preferences?.social_style || 'moderate',
    mood: user?.food_preferences?.mood || [],
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const toggle = (key, val) => {
    const arr = form[key] || []
    set(key, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
    haptic.tap()
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return showToast('Photo must be under 5MB')
    const reader = new FileReader()
    reader.onloadend = () => {
      setLocalPhoto(reader.result)
      showToast('Photo selected! Save to upload.')
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)
    haptic.medium()
    try {
      const payload = {
        bio: form.bio,
        name: form.name,
        age: form.age ? parseInt(form.age) : undefined,
        food_preferences: {
          cuisines: form.cuisines,
          meal_types: form.meal_types,
          dietary: form.dietary,
          interests: form.interests,
          deal_breakers: form.deal_breakers,
          price_range: form.price_range,
          social_style: form.social_style,
          mood: form.mood,
        },
      }
      if (localPhoto) payload.photo = localPhoto
      const res = await api.put('/api/users/preferences', payload)
      updateUser(res.data.user || { ...user, ...payload })
      showToast('Profile updated! ✅')
      haptic.success()
      setEditing(false)
      setLocalPhoto(null)
    } catch {
      showToast('Failed to save. Try again.')
      haptic.error()
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    haptic.medium()
    logout()
    navigate('/')
  }

  const currentPhoto = localPhoto || user?.photo || `https://api.dicebear.com/7.x/personas/svg?seed=${user?.id || 'user'}&backgroundColor=b6e3f4`
  const unlockedCount = BADGES.filter(b => b.unlocked).length

  return (
    <div className="screen" style={{ background: '#FFF8F0' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>

        {/* Hero header */}
        <div style={styles.hero}>
          <div style={styles.avatarWrap}>
            <img src={currentPhoto} style={styles.avatar} alt={user?.name} />
            <button
              style={styles.photoBtn}
              onClick={() => { haptic.tap(); fileInputRef.current?.click() }}
            >
              {uploadingPhoto ? '⏳' : '📷'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />
          </div>
          <h2 style={styles.heroName}>{user?.name || 'Foodie'}, {user?.age || '?'}</h2>
          <p style={styles.heroLoc}>📍 Bangalore</p>
          {user?.bio && <p style={styles.heroBio}>"{user.bio}"</p>}

          {/* Quick stats */}
          <div style={styles.statsRow}>
            {[
              { icon: '🔥', val: user?.stats?.swipes || 24, label: 'Swipes' },
              { icon: '💌', val: user?.stats?.matches || 5, label: 'Matches' },
              { icon: '🍽️', val: user?.stats?.dates || 1, label: 'Dates' },
              { icon: '🏆', val: `${unlockedCount}/${BADGES.length}`, label: 'Badges' },
            ].map(s => (
              <div key={s.label} style={styles.stat}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <span style={styles.statVal}>{s.val}</span>
                <span style={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div style={styles.tabBar}>
          {['profile', 'prefs', 'badges'].map(tab => (
            <button
              key={tab}
              style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
              onClick={() => { setActiveTab(tab); haptic.tap() }}
            >
              {tab === 'profile' ? '👤 Profile' : tab === 'prefs' ? '🍜 Prefs' : '🏆 Badges'}
            </button>
          ))}
        </div>

        <div style={{ padding: '16px 20px 24px' }}>

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Edit toggle */}
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>About Me</h3>
                <button style={styles.editToggle} onClick={() => { setEditing(e => !e); haptic.tap() }}>
                  {editing ? '✕ Cancel' : '✏️ Edit'}
                </button>
              </div>

              {editing ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={styles.fieldLabel}>Name</label>
                      <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" />
                    </div>
                    <div>
                      <label style={styles.fieldLabel}>Age</label>
                      <input className="input" type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="Your age" min={18} max={99} />
                    </div>
                    <div>
                      <label style={styles.fieldLabel}>Bio <span style={{ color: '#CCC', fontWeight: 400 }}>({form.bio.length}/200)</span></label>
                      <textarea
                        className="input"
                        value={form.bio}
                        onChange={e => set('bio', e.target.value)}
                        rows={4}
                        style={{ resize: 'none' }}
                        maxLength={200}
                        placeholder="Your food story in a few words..."
                      />
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes ✅'}
                  </button>
                </>
              ) : (
                <p style={styles.bioText}>{user?.bio || 'No bio yet. Tap Edit to add one!'}</p>
              )}

              {/* Foodie interests */}
              <div>
                <h3 style={styles.sectionTitle}>Foodie Identity 🍴</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                  {(user?.food_preferences?.interests?.length ? INTERESTS.filter(i => user.food_preferences.interests.includes(i.id)) : INTERESTS.slice(0, 4)).map(i => (
                    <span key={i.id} style={styles.interestChip}>{i.icon} {i.label}</span>
                  ))}
                </div>
              </div>

              {/* Deal-breakers */}
              {user?.food_preferences?.deal_breakers?.length > 0 && (
                <div>
                  <h3 style={styles.sectionTitle}>Deal-breakers 🚩</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                    {DEAL_BREAKERS.filter(d => user.food_preferences.deal_breakers.includes(d.id)).map(d => (
                      <span key={d.id} style={styles.dealBreakerChip}>{d.icon} {d.label}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Account settings */}
              <div>
                <h3 style={styles.sectionTitle}>Account</h3>
                <div style={styles.menuList}>
                  {[
                    { icon: '🔔', label: 'Notifications', action: () => showToast('Coming soon!') },
                    { icon: '🔒', label: 'Privacy Settings', action: () => showToast('Coming soon!') },
                    { icon: '🌍', label: 'Discovery Radius', action: () => showToast('Bangalore only for now!') },
                    { icon: '❓', label: 'Help & Support', action: () => showToast('Email us at hello@dinedate.app') },
                    { icon: '🚪', label: 'Sign Out', action: handleLogout, danger: true },
                  ].map(item => (
                    <button key={item.label} style={{ ...styles.menuItem, ...(item.danger ? styles.menuDanger : {}) }} onClick={item.action}>
                      <span>{item.icon} {item.label}</span>
                      <span style={{ color: '#DDD' }}>›</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PREFERENCES TAB ── */}
          {activeTab === 'prefs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={styles.sectionTitle}>Food Preferences</h3>
                <button style={styles.editToggle} onClick={() => { setEditing(e => !e); haptic.tap() }}>
                  {editing ? '✕ Cancel' : '✏️ Edit'}
                </button>
              </div>

              {/* Cuisines */}
              <div>
                <h4 style={styles.prefLabel}>🍜 Favourite Cuisines</h4>
                {editing ? (
                  <CuisineSelector selected={form.cuisines} onChange={v => set('cuisines', v)} />
                ) : (
                  <div style={styles.chipWrap}>
                    {(user?.food_preferences?.cuisines || ['South Indian', 'Italian']).map(c => (
                      <span key={c} style={styles.prefChip}>{c}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Meal types */}
              <div>
                <h4 style={styles.prefLabel}>🕐 When to eat out</h4>
                <div style={styles.chipWrap}>
                  {MEAL_TYPES.map(m => (
                    editing ? (
                      <button key={m.id} type="button" style={{ ...styles.prefChipBtn, ...(form.meal_types.includes(m.id) ? styles.prefChipActive : {}) }} onClick={() => toggle('meal_types', m.id)}>
                        {m.icon} {m.label}
                      </button>
                    ) : (
                      (user?.food_preferences?.meal_types || []).includes(m.id) ? (
                        <span key={m.id} style={styles.prefChip}>{m.icon} {m.label}</span>
                      ) : null
                    )
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <h4 style={styles.prefLabel}>💸 Budget per person</h4>
                <div style={styles.chipWrap}>
                  {[
                    { id: '$', label: 'Budget', sub: 'Under ₹500' },
                    { id: '$$', label: 'Mid-range', sub: '₹500–1500' },
                    { id: '$$$', label: 'Splurge', sub: '₹1500+' },
                  ].map(p => (
                    editing ? (
                      <button key={p.id} style={{ ...styles.priceBtn, ...(form.price_range === p.id ? styles.priceBtnActive : {}) }} onClick={() => { set('price_range', p.id); haptic.tap() }}>
                        <div style={{ fontWeight: 700 }}>{p.id}</div>
                        <div style={{ fontSize: 10 }}>{p.sub}</div>
                      </button>
                    ) : (
                      user?.food_preferences?.price_range === p.id ? (
                        <span key={p.id} style={{ ...styles.prefChip, background: '#E07B39', color: 'white', border: 'none' }}>{p.id} {p.label}</span>
                      ) : null
                    )
                  ))}
                </div>
              </div>

              {/* Dietary */}
              <div>
                <h4 style={styles.prefLabel}>🌱 Dietary</h4>
                <div style={styles.chipWrap}>
                  {DIETARY.map(d => (
                    editing ? (
                      <button key={d.id} style={{ ...styles.prefChipBtn, ...(form.dietary.includes(d.id) ? styles.prefChipGreen : {}) }} onClick={() => toggle('dietary', d.id)}>
                        {d.icon} {d.label}
                      </button>
                    ) : (
                      (user?.food_preferences?.dietary || []).includes(d.id) ? (
                        <span key={d.id} style={{ ...styles.prefChip, background: '#E8F5E9', color: '#2E7D32', border: '1.5px solid #C8E6C9' }}>{d.icon} {d.label}</span>
                      ) : null
                    )
                  ))}
                  {!editing && !(user?.food_preferences?.dietary?.length) && (
                    <span style={styles.emptyNote}>No restrictions set</span>
                  )}
                </div>
              </div>

              {/* Interests */}
              <div>
                <h4 style={styles.prefLabel}>✨ Foodie Interests</h4>
                <div style={styles.chipWrap}>
                  {INTERESTS.map(i => (
                    editing ? (
                      <button key={i.id} style={{ ...styles.prefChipBtn, ...(form.interests.includes(i.id) ? styles.prefChipDark : {}) }} onClick={() => toggle('interests', i.id)}>
                        {i.icon} {i.label}
                      </button>
                    ) : (
                      (user?.food_preferences?.interests || []).includes(i.id) ? (
                        <span key={i.id} style={styles.interestChip}>{i.icon} {i.label}</span>
                      ) : null
                    )
                  ))}
                  {!editing && !(user?.food_preferences?.interests?.length) && (
                    <span style={styles.emptyNote}>No interests added</span>
                  )}
                </div>
              </div>

              {/* Deal-breakers */}
              <div>
                <h4 style={styles.prefLabel}>🚩 Deal-breakers</h4>
                <div style={styles.chipWrap}>
                  {DEAL_BREAKERS.map(d => (
                    editing ? (
                      <button key={d.id} style={{ ...styles.prefChipBtn, ...(form.deal_breakers.includes(d.id) ? styles.prefChipRed : {}) }} onClick={() => toggle('deal_breakers', d.id)}>
                        {d.icon} {d.label}
                      </button>
                    ) : (
                      (user?.food_preferences?.deal_breakers || []).includes(d.id) ? (
                        <span key={d.id} style={{ ...styles.prefChip, background: '#FEECEC', color: '#C62828', border: '1.5px solid #FFCDD2' }}>{d.icon} {d.label}</span>
                      ) : null
                    )
                  ))}
                  {!editing && !(user?.food_preferences?.deal_breakers?.length) && (
                    <span style={styles.emptyNote}>No deal-breakers set</span>
                  )}
                </div>
              </div>

              {editing && (
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Preferences ✅'}
                </button>
              )}
            </div>
          )}

          {/* ── BADGES TAB ── */}
          {activeTab === 'badges' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={styles.badgeHeader}>
                <h3 style={styles.sectionTitle}>Your Badges 🏆</h3>
                <span style={styles.badgeCount}>{unlockedCount}/{BADGES.length} unlocked</span>
              </div>

              <div style={styles.badgeProgress}>
                <div style={{ ...styles.badgeProgressBar, width: `${(unlockedCount / BADGES.length) * 100}%` }} />
              </div>

              <div style={styles.badgeGrid}>
                {BADGES.map(badge => (
                  <div key={badge.id} style={{ ...styles.badgeCard, ...(badge.unlocked ? styles.badgeUnlocked : styles.badgeLocked) }}>
                    <div style={{ fontSize: 32, filter: badge.unlocked ? 'none' : 'grayscale(1)', opacity: badge.unlocked ? 1 : 0.4 }}>
                      {badge.icon}
                    </div>
                    <div style={styles.badgeName}>{badge.label}</div>
                    <div style={styles.badgeDesc}>{badge.desc}</div>
                    {badge.unlocked && <div style={styles.badgeCheck}>✓</div>}
                  </div>
                ))}
              </div>

              <div style={styles.gamifyHint}>
                🎯 Keep matching and going on dates to unlock more badges!
              </div>
            </div>
          )}

        </div>
      </div>

      <BottomNav />
    </div>
  )
}

const styles = {
  hero: { background: 'linear-gradient(160deg, #E07B39 0%, #F4C430 100%)', padding: '44px 24px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  avatarWrap: { position: 'relative', marginBottom: 4 },
  avatar: { width: 96, height: 96, borderRadius: '50%', border: '4px solid white', objectFit: 'cover', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  photoBtn: { position: 'absolute', bottom: 2, right: -2, width: 32, height: 32, borderRadius: '50%', background: 'white', border: 'none', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.18)' },
  heroName: { fontSize: 22, fontWeight: 800, color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.15)' },
  heroLoc: { fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  heroBio: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontStyle: 'italic', textAlign: 'center', maxWidth: 300, lineHeight: 1.4 },
  statsRow: { display: 'flex', gap: 20, marginTop: 12 },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  statVal: { fontSize: 18, fontWeight: 800, color: 'white' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: 0.5 },
  tabBar: { display: 'flex', background: 'white', borderBottom: '1px solid #E8DDD3' },
  tab: { flex: 1, padding: '12px 4px', border: 'none', background: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#999', fontFamily: 'Inter, sans-serif', borderBottom: '2.5px solid transparent', transition: 'all 0.2s' },
  tabActive: { color: '#E07B39', borderBottomColor: '#E07B39' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#1A1A1A' },
  editToggle: { fontSize: 13, color: '#E07B39', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  bioText: { fontSize: 14, color: '#555', lineHeight: 1.6 },
  fieldLabel: { fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 6, display: 'block' },
  interestChip: { fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 50, background: '#FFF0E6', color: '#E07B39', border: '1.5px solid #FADDCC' },
  dealBreakerChip: { fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 50, background: '#FEECEC', color: '#C62828', border: '1.5px solid #FFCDD2' },
  menuList: { display: 'flex', flexDirection: 'column', background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginTop: 10 },
  menuItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 18px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#1A1A1A', fontFamily: 'Inter, sans-serif', borderBottom: '1px solid #F5EFE8' },
  menuDanger: { color: '#F44336' },
  // Prefs tab
  prefLabel: { fontSize: 13, fontWeight: 700, color: '#444', marginBottom: 10 },
  chipWrap: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  prefChip: { fontSize: 12, fontWeight: 500, padding: '7px 14px', borderRadius: 50, border: '1.5px solid #E8DDD3', background: 'white', color: '#444' },
  prefChipBtn: { fontSize: 12, fontWeight: 500, padding: '7px 14px', borderRadius: 50, border: '2px solid #E8DDD3', background: 'white', color: '#444', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' },
  prefChipActive: { background: '#E07B39', borderColor: '#E07B39', color: 'white' },
  prefChipGreen: { background: '#2E7D32', borderColor: '#2E7D32', color: 'white' },
  prefChipDark: { background: '#2D4A3E', borderColor: '#2D4A3E', color: 'white' },
  prefChipRed: { background: '#C62828', borderColor: '#C62828', color: 'white' },
  priceBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 20px', borderRadius: 14, border: '2px solid #E8DDD3', background: 'white', cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: '#444', minWidth: 80 },
  priceBtnActive: { background: '#E07B39', borderColor: '#E07B39', color: 'white' },
  emptyNote: { fontSize: 12, color: '#CCC', fontStyle: 'italic' },
  // Badges
  badgeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  badgeCount: { fontSize: 12, fontWeight: 700, color: '#E07B39', background: '#FFF0E6', padding: '4px 12px', borderRadius: 50 },
  badgeProgress: { height: 6, background: '#E8DDD3', borderRadius: 6, overflow: 'hidden' },
  badgeProgressBar: { height: '100%', background: 'linear-gradient(90deg, #E07B39, #F4C430)', borderRadius: 6, transition: 'width 0.6s ease' },
  badgeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  badgeCard: { borderRadius: 16, padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center', position: 'relative' },
  badgeUnlocked: { background: 'white', boxShadow: '0 2px 12px rgba(224,123,57,0.15)', border: '2px solid #FADDCC' },
  badgeLocked: { background: '#F9F4EF', border: '2px solid #E8DDD3' },
  badgeName: { fontSize: 12, fontWeight: 700, color: '#1A1A1A' },
  badgeDesc: { fontSize: 10, color: '#999', lineHeight: 1.3 },
  badgeCheck: { position: 'absolute', top: 8, right: 8, fontSize: 12, color: '#E07B39', fontWeight: 900 },
  gamifyHint: { background: '#FFF0E6', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#B85E22', textAlign: 'center', fontWeight: 500 },
}

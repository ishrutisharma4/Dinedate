import { useNavigate } from 'react-router-dom'

export default function MatchCard({ match }) {
  const navigate = useNavigate()
  const other = match.other_user || {}
  const timeAgo = getTimeAgo(match.created_at)

  function getTimeAgo(ts) {
    if (!ts) return ''
    const diff = Date.now() - new Date(ts).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  const statusConfig = {
    pending_cuisine: { label: '🍽️ Pick a cuisine', color: '#FF9800', bg: '#FFF8E1' },
    pending_restaurant: { label: '🗺️ Pick a restaurant', color: '#2196F3', bg: '#E3F2FD' },
    confirmed: { label: '✅ Date confirmed!', color: '#4CAF50', bg: '#E8F5E9' },
    completed: { label: '🌟 Date done', color: '#9C27B0', bg: '#F3E5F5' },
  }

  const status = statusConfig[match.status] || statusConfig.pending_cuisine

  return (
    <div style={styles.card} onClick={() => navigate(`/chat/${match.id}`)}>
      <div style={styles.avatarWrap}>
        <img
          src={other.photo || `https://api.dicebear.com/7.x/personas/svg?seed=${other.id}&backgroundColor=b6e3f4`}
          alt={other.name}
          style={styles.avatar}
        />
        <div style={styles.onlineDot} />
      </div>
      <div style={styles.info}>
        <div style={styles.row}>
          <span style={styles.name}>{other.name || 'Match'}</span>
          <span style={styles.time}>{timeAgo}</span>
        </div>
        <div style={{ ...styles.statusBadge, color: status.color, background: status.bg }}>
          {status.label}
        </div>
        {match.last_message && (
          <p style={styles.preview}>{match.last_message}</p>
        )}
      </div>
      {match.unread > 0 && <span className="badge">{match.unread}</span>}
    </div>
  )
}

const styles = {
  card: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', cursor: 'pointer', borderBottom: '1px solid #F2EBE5', background: 'white' },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatar: { width: 58, height: 58, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E8DDD3' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: '50%', background: '#4CAF50', border: '2px solid white' },
  info: { flex: 1, minWidth: 0 },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 15, fontWeight: 700, color: '#1A1A1A' },
  time: { fontSize: 11, color: '#BBB' },
  statusBadge: { display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 50, marginBottom: 4 },
  preview: { fontSize: 13, color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
}

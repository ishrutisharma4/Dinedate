import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  { path: '/browse', icon: '🔥', label: 'Discover' },
  { path: '/matches', icon: '💌', label: 'Matches' },
  { path: '/chat', icon: '💬', label: 'Chat' },
  { path: '/profile', icon: '👤', label: 'Profile' },
]

export default function BottomNav({ unreadCount = 0 }) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav style={styles.nav}>
      {tabs.map(tab => {
        const active = location.pathname.startsWith(tab.path)
        return (
          <button key={tab.path} style={styles.tab} onClick={() => navigate(tab.path)}>
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <span style={{ fontSize: 24, filter: active ? 'none' : 'grayscale(1) opacity(0.45)' }}>
                {tab.icon}
              </span>
              {tab.path === '/chat' && unreadCount > 0 && (
                <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </div>
            <span style={{ ...styles.label, color: active ? '#E07B39' : '#999' }}>{tab.label}</span>
            {active && <div style={styles.dot} />}
          </button>
        )
      })}
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    background: 'white',
    borderTop: '1px solid #E8DDD3',
    paddingBottom: 'env(safe-area-inset-bottom, 8px)',
    paddingTop: 8,
    flexShrink: 0,
  },
  tab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 0',
    position: 'relative',
  },
  label: {
    fontSize: 10,
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
  },
  dot: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: '#E07B39',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    background: '#F44336',
    color: 'white',
    fontSize: 9,
    fontWeight: 700,
    borderRadius: 50,
    minWidth: 16,
    height: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    fontFamily: 'Inter, sans-serif',
  },
}

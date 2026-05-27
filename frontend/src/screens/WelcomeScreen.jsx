import { useNavigate } from 'react-router-dom'

export default function WelcomeScreen() {
  const navigate = useNavigate()
  return (
    <div className="screen" style={styles.screen}>
      {/* Background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.content}>
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>🍽️</div>
          <h1 style={styles.logo}>DineDate</h1>
          <p style={styles.tagline}>Find someone who loves what you love to eat</p>
        </div>

        <div style={styles.illustrations}>
          {['🍝', '🍱', '🍛', '🍕'].map((e, i) => (
            <div key={i} style={{ ...styles.floatEmoji, animationDelay: `${i * 0.4}s` }}>{e}</div>
          ))}
        </div>

        <div style={styles.features}>
          {[
            { icon: '🔥', text: 'Swipe on people who share your food taste' },
            { icon: '🗺️', text: 'Get matched restaurants you both love' },
            { icon: '💬', text: 'Chat and plan your meal date together' },
          ].map((f, i) => (
            <div key={i} style={styles.feature}>
              <span style={styles.featureIcon}>{f.icon}</span>
              <span style={styles.featureText}>{f.text}</span>
            </div>
          ))}
        </div>

        <div style={styles.actions}>
          <button className="btn btn-primary" onClick={() => navigate('/signup')}>
            Get Started 🚀
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/login')} style={{ marginTop: 12 }}>
            I already have an account
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  screen: { background: '#FFF8F0', position: 'relative', overflow: 'hidden' },
  blob1: { position: 'absolute', top: -80, right: -80, width: 250, height: 250, borderRadius: '50%', background: 'rgba(224,123,57,0.12)' },
  blob2: { position: 'absolute', bottom: 100, left: -60, width: 180, height: 180, borderRadius: '50%', background: 'rgba(244,196,48,0.15)' },
  content: { display: 'flex', flexDirection: 'column', padding: '60px 28px 40px', flex: 1, position: 'relative', zIndex: 1 },
  logoWrap: { textAlign: 'center', marginBottom: 32 },
  logoIcon: { fontSize: 56, marginBottom: 8 },
  logo: { fontSize: 40, fontWeight: 800, color: '#E07B39', letterSpacing: -1 },
  tagline: { fontSize: 15, color: '#666', marginTop: 8, lineHeight: 1.5 },
  illustrations: { display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 40 },
  floatEmoji: { fontSize: 36, animation: 'float 2.5s ease-in-out infinite' },
  features: { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 },
  feature: { display: 'flex', alignItems: 'center', gap: 14, background: 'white', padding: '14px 18px', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  featureIcon: { fontSize: 24 },
  featureText: { fontSize: 14, color: '#444', fontWeight: 500, lineHeight: 1.4 },
  actions: { marginTop: 'auto', display: 'flex', flexDirection: 'column' },
}

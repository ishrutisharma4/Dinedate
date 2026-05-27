import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import { haptic } from '../utils/haptic'

export default function LoginScreen() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useApp()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return showToast('Please fill all fields')
    setLoading(true)
    haptic.medium()
    try {
      const user = await login(form.email, form.password)
      haptic.success()
      navigate(user.onboarding_complete ? '/browse' : '/onboarding')
    } catch (err) {
      haptic.error()
      showToast(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen-scroll" style={styles.screen}>
      <div style={styles.header}>
        <button className="btn btn-ghost" onClick={() => navigate('/')} style={{ alignSelf: 'flex-start', padding: '8px 0' }}>← Back</button>
        <div style={{ fontSize: 44 }}>👋</div>
        <h2 style={styles.title}>Welcome back!</h2>
        <p style={styles.subtitle}>Sign in to find your meal date</p>
      </div>

      {/* OTP Login — prominent CTA */}
      <button
        type="button"
        style={styles.otpCta}
        onClick={() => { haptic.tap(); navigate('/otp') }}
      >
        <span style={{ fontSize: 22 }}>📱</span>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A' }}>Login with Mobile OTP</div>
          <div style={{ fontSize: 12, color: '#888' }}>Quick & secure — no password needed</div>
        </div>
        <span style={{ color: '#E07B39', fontSize: 18, marginLeft: 'auto' }}>›</span>
      </button>

      <div style={styles.dividerRow}>
        <div style={styles.divider} />
        <span style={styles.dividerText}>or use email</span>
        <div style={styles.divider} />
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            autoComplete="email"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <input
            className="input"
            type="password"
            placeholder="Your password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            autoComplete="current-password"
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 8, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Signing in...' : 'Sign In 🍽️'}
        </button>

        <div style={{ ...styles.dividerRow, margin: '4px 0' }}>
          <div style={styles.divider} />
          <span style={styles.dividerText}>or try a demo</span>
          <div style={styles.divider} />
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => { haptic.tap(); setForm({ email: 'demo@dinedate.com', password: 'demo123' }) }}
        >
          🎭 Use Demo Account
        </button>

        <p style={styles.signupText}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#E07B39', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
        </p>
      </form>
    </div>
  )
}

const styles = {
  screen: { background: '#FFF8F0', padding: '24px 28px 40px' },
  header: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28, gap: 8 },
  title: { fontSize: 28, fontWeight: 800, color: '#1A1A1A' },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center' },
  otpCta: { display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 16, border: '2px solid #E07B39', background: '#FFF8F3', cursor: 'pointer', fontFamily: 'Inter, sans-serif', width: '100%', marginBottom: 4 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#444' },
  dividerRow: { display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0' },
  divider: { flex: 1, height: 1, background: '#E8DDD3' },
  dividerText: { fontSize: 12, color: '#999', whiteSpace: 'nowrap' },
  signupText: { textAlign: 'center', fontSize: 14, color: '#666', marginTop: 8 },
}

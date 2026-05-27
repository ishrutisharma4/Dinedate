import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'

export default function SignupScreen() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const { showToast } = useApp()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', age: '', gender: '', city: 'Mumbai',
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleNext = () => {
    if (step === 1) {
      if (!form.name || !form.email || !form.password) return showToast('Fill all fields')
      if (form.password.length < 6) return showToast('Password must be at least 6 characters')
    }
    if (step === 2) {
      if (!form.age || !form.gender) return showToast('Fill all fields')
    }
    setStep(s => s + 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.city) return showToast('Select your city')
    setLoading(true)
    try {
      await signup(form)
      navigate('/onboarding')
    } catch (err) {
      showToast(err.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen-scroll" style={styles.screen}>
      {/* Progress bar */}
      <div style={styles.progress}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ ...styles.progressStep, background: step >= s ? '#E07B39' : '#E8DDD3' }} />
        ))}
      </div>

      <div style={styles.header}>
        <div style={{ fontSize: 44 }}>{step === 1 ? '✍️' : step === 2 ? '🎂' : '📍'}</div>
        <h2 style={styles.title}>
          {step === 1 ? 'Create your account' : step === 2 ? 'About you' : 'Where are you?'}
        </h2>
        <p style={styles.subtitle}>Step {step} of 3</p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {step === 1 && (
          <>
            <Field label="Full Name" placeholder="Your name" value={form.name} onChange={e => set('name', e.target.value)} />
            <Field label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
            <Field label="Password" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
          </>
        )}
        {step === 2 && (
          <>
            <Field label="Age" type="number" placeholder="Your age" value={form.age} onChange={e => set('age', e.target.value)} min="18" max="80" />
            <div style={styles.field}>
              <label style={styles.label}>I am a...</label>
              <div style={styles.genderRow}>
                {['Man', 'Woman', 'Non-binary'].map(g => (
                  <button key={g} type="button"
                    style={{ ...styles.genderBtn, ...(form.gender === g ? styles.genderSelected : {}) }}
                    onClick={() => set('gender', g)}
                  >{g}</button>
                ))}
              </div>
            </div>
          </>
        )}
        {step === 3 && (
          <div style={styles.field}>
            <label style={styles.label}>Your city</label>
            <div style={styles.cityGrid}>
              {['Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Pune', 'Chennai'].map(city => (
                <button key={city} type="button"
                  style={{ ...styles.cityBtn, ...(form.city === city ? styles.citySelected : {}) }}
                  onClick={() => set('city', city)}
                >
                  📍 {city}
                </button>
              ))}
            </div>
          </div>
        )}

        {step < 3 ? (
          <button type="button" className="btn btn-primary" onClick={handleNext}>Continue →</button>
        ) : (
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating account...' : 'Create Account 🎉'}
          </button>
        )}

        {step > 1 && (
          <button type="button" className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>← Back</button>
        )}

        {step === 1 && (
          <p style={styles.loginText}>
            Have an account? <Link to="/login" style={{ color: '#E07B39', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        )}
      </form>
    </div>
  )
}

function Field({ label, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#444' }}>{label}</label>
      <input className="input" {...props} />
    </div>
  )
}

const styles = {
  screen: { background: '#FFF8F0', padding: '24px 28px 40px' },
  progress: { display: 'flex', gap: 6, marginBottom: 28 },
  progressStep: { flex: 1, height: 4, borderRadius: 4, transition: 'background 0.3s' },
  header: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32, gap: 8 },
  title: { fontSize: 26, fontWeight: 800, color: '#1A1A1A', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#999' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: '#444' },
  genderRow: { display: 'flex', gap: 10 },
  genderBtn: { flex: 1, padding: '12px 8px', borderRadius: 12, border: '2px solid #E8DDD3', background: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: '#666' },
  genderSelected: { background: '#E07B39', borderColor: '#E07B39', color: 'white' },
  cityGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  cityBtn: { padding: '14px 12px', borderRadius: 12, border: '2px solid #E8DDD3', background: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: '#444', textAlign: 'left' },
  citySelected: { background: '#E07B39', borderColor: '#E07B39', color: 'white' },
  loginText: { textAlign: 'center', fontSize: 14, color: '#666', marginTop: 8 },
}

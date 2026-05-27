import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import { haptic } from '../utils/haptic'
import api from '../services/api'

export default function OTPScreen() {
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()
  const { showToast } = useApp()
  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [devOtp, setDevOtp] = useState(null)
  const [resendTimer, setResendTimer] = useState(0)
  const inputRefs = [useRef(), useRef(), useRef(), useRef()]
  const timerRef = useRef()

  useEffect(() => {
    if (step === 'otp') {
      inputRefs[0].current?.focus()
      startTimer()
    }
    return () => clearInterval(timerRef.current)
  }, [step])

  const startTimer = () => {
    setResendTimer(30)
    timerRef.current = setInterval(() => {
      setResendTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0 } return t - 1 })
    }, 1000)
  }

  const handleSendOTP = async () => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length < 10) return showToast('Enter a valid 10-digit number')
    setLoading(true)
    haptic.medium()
    try {
      const res = await api.post('/api/auth/send-otp', { phone: cleaned })
      setDevOtp(res.data.dev_otp) // shown in dev mode
      setStep('otp')
      haptic.success()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send OTP')
    } finally { setLoading(false) }
  }

  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[idx] = val.slice(-1)
    setOtp(next)
    haptic.tap()
    if (val && idx < 3) inputRefs[idx + 1].current?.focus()
    if (next.every(d => d !== '')) handleVerify(next.join(''))
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs[idx - 1].current?.focus()
    }
  }

  const handleVerify = async (code) => {
    const cleaned = phone.replace(/\D/g, '')
    setLoading(true)
    haptic.medium()
    try {
      const res = await api.post('/api/auth/verify-otp', { phone: cleaned, code })
      const { token, user } = res.data
      // loginWithToken sets user in React state + localStorage + axios header
      loginWithToken(token, user)
      haptic.match()
      navigate(user.onboarding_complete ? '/browse' : '/onboarding')
    } catch (err) {
      haptic.error()
      showToast(err.response?.data?.message || 'Incorrect OTP')
      setOtp(['', '', '', ''])
      inputRefs[0].current?.focus()
    } finally { setLoading(false) }
  }

  return (
    <div className="screen-scroll" style={styles.screen}>
      <button className="btn btn-ghost" style={{ alignSelf: 'flex-start', padding: '4px 0', marginBottom: 16 }}
        onClick={() => step === 'otp' ? setStep('phone') : navigate('/login')}>← Back</button>

      {step === 'phone' ? (
        <>
          <div style={styles.header}>
            <div style={{ fontSize: 52 }}>📱</div>
            <h2 style={styles.title}>Enter your mobile</h2>
            <p style={styles.subtitle}>We'll send a 4-digit OTP to verify</p>
          </div>

          <div style={styles.phoneWrap}>
            <div style={styles.countryCode}>🇮🇳 +91</div>
            <input
              className="input"
              style={{ flex: 1, borderRadius: '0 50px 50px 0', borderLeft: 'none' }}
              type="tel"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              maxLength={10}
              inputMode="numeric"
            />
          </div>
          <p style={styles.hint}>By continuing you agree to our Terms & Privacy Policy</p>

          <button className="btn btn-primary" onClick={handleSendOTP} disabled={loading || phone.replace(/\D/g,'').length < 10}
            style={{ opacity: phone.replace(/\D/g,'').length === 10 ? 1 : 0.5 }}>
            {loading ? 'Sending...' : 'Send OTP 🚀'}
          </button>
        </>
      ) : (
        <>
          <div style={styles.header}>
            <div style={{ fontSize: 52 }}>🔐</div>
            <h2 style={styles.title}>Enter OTP</h2>
            <p style={styles.subtitle}>Sent to +91 {phone}</p>
            {devOtp && (
              <div style={styles.devBanner}>
                🛠️ Dev mode OTP: <strong style={{ fontSize: 20, letterSpacing: 6 }}>{devOtp}</strong>
              </div>
            )}
          </div>

          <div style={styles.otpRow}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                style={{ ...styles.otpBox, borderColor: digit ? '#E07B39' : '#E8DDD3', background: digit ? '#FFF0E6' : '#F9F4EF' }}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
              />
            ))}
          </div>

          {loading && <div style={{ textAlign: 'center', color: '#888', fontSize: 14 }}>Verifying...</div>}

          <button className="btn btn-primary" onClick={() => handleVerify(otp.join(''))} disabled={loading || otp.some(d => !d)}
            style={{ opacity: otp.every(d => d) ? 1 : 0.5 }}>
            Verify & Continue ✓
          </button>

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            {resendTimer > 0 ? (
              <span style={{ fontSize: 13, color: '#999' }}>Resend OTP in {resendTimer}s</span>
            ) : (
              <button className="btn btn-ghost" onClick={handleSendOTP} style={{ fontSize: 13, color: '#E07B39' }}>
                Resend OTP
              </button>
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes otpPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  screen: { background: '#FFF8F0', padding: '24px 28px 40px', display: 'flex', flexDirection: 'column', gap: 16 },
  header: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: 800, color: '#1A1A1A' },
  subtitle: { fontSize: 14, color: '#888' },
  devBanner: { background: '#FFF3CD', border: '1.5px dashed #FF9800', borderRadius: 12, padding: '10px 16px', fontSize: 13, color: '#E65100', marginTop: 8 },
  phoneWrap: { display: 'flex', gap: 0 },
  countryCode: { display: 'flex', alignItems: 'center', padding: '15px 16px', background: '#F9F4EF', border: '2px solid #E8DDD3', borderRadius: '50px 0 0 50px', fontSize: 15, fontWeight: 600, color: '#444', whiteSpace: 'nowrap' },
  hint: { fontSize: 11, color: '#BBB', textAlign: 'center' },
  otpRow: { display: 'flex', justifyContent: 'center', gap: 12, margin: '8px 0' },
  otpBox: { width: 62, height: 70, borderRadius: 14, border: '2.5px solid', textAlign: 'center', fontSize: 28, fontWeight: 800, color: '#1A1A1A', outline: 'none', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' },
}

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { haptic } from '../utils/haptic'

const QUESTIONS = [
  {
    q: 'You have ₹500 and 30 mins for lunch. You go for:',
    options: [
      { id: 'a', emoji: '🥗', label: 'Quick salad bowl — light & healthy' },
      { id: 'b', emoji: '🍱', label: 'Biryani parcel from that no-name joint' },
      { id: 'c', emoji: '🌮', label: 'Street tacos or rolls, eating while walking' },
      { id: 'd', emoji: '🍜', label: "Instant noodles. Don't judge me." },
    ]
  },
  {
    q: 'Your ideal date place is:',
    options: [
      { id: 'a', emoji: '🕯️', label: 'Candlelit Italian, soft music, long conversations' },
      { id: 'b', emoji: '🍻', label: 'Loud rooftop bar — craft beer and good vibes' },
      { id: 'c', emoji: '🌮', label: 'Street food crawl, exploring hidden lanes' },
      { id: 'd', emoji: '☕', label: 'Cozy café, good coffee, zero pretense' },
    ]
  },
  {
    q: 'Someone orders pineapple on pizza. You:',
    options: [
      { id: 'a', emoji: '😤', label: 'Red flag. Immediately.' },
      { id: 'b', emoji: '🤷', label: "You do you, as long as I don't have to eat it" },
      { id: 'c', emoji: '🍕', label: 'Actually... sweet + savoury is underrated?' },
      { id: 'd', emoji: '🤝', label: "I'll try anything at least once" },
    ]
  },
  {
    q: 'Your spirit meal is:',
    options: [
      { id: 'a', emoji: '🌮', label: 'Masala dosa — crisp, reliable, always satisfying' },
      { id: 'b', emoji: '🍔', label: 'Smash burger — bold, messy, unapologetically good' },
      { id: 'c', emoji: '🥘', label: 'Butter chicken — classic comfort, never fails' },
      { id: 'd', emoji: '🍣', label: 'Sushi omakase — fancy, surprising, worth it' },
    ]
  },
  {
    q: 'The restaurant bill arrives. You:',
    options: [
      { id: 'a', emoji: '🤝', label: 'Split exactly 50/50, easy' },
      { id: 'b', emoji: '💳', label: 'Whoever invited pays this time, swap next time' },
      { id: 'c', emoji: '🧮', label: 'Each pays for exactly what they ordered' },
      { id: 'd', emoji: '😏', label: 'I grab it — generous is my love language' },
    ]
  },
]

const COMPATIBILITY_MESSAGES = [
  { min: 0, max: 1, emoji: '🍵', title: 'Opposite ends of the menu!', desc: 'They say opposites attract — your food tastes couldn\'t be more different, but that could make for a very interesting date!' },
  { min: 2, max: 2, emoji: '🍽️', title: 'Intriguing mismatch!', desc: 'You don\'t see food the same way — yet. A shared meal might just change that.' },
  { min: 3, max: 3, emoji: '🌮', title: 'Pretty compatible!', desc: 'You\'d probably order half the same things. Good sign for a smooth, fun first date!' },
  { min: 4, max: 4, emoji: '🔥', title: 'Food soulmates!', desc: 'You think about food almost identically. Your first date restaurant is going to be *chef\'s kiss*.' },
  { min: 5, max: 5, emoji: '💯', title: 'Perfect Food Match!', desc: 'You literally answered the same way every time. Are you sure you\'re not the same person? 😂' },
]

export default function IcebreakerScreen() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useApp()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState([])
  const [done, setDone] = useState(false)
  const [score, setScore] = useState(0)

  const handleAnswer = (optionId) => {
    haptic.tap()
    const newAnswers = [...answers, optionId]
    setAnswers(newAnswers)

    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1)
    } else {
      // Simulate matching — random compatibility (in real app would compare with partner)
      const matched = Math.floor(Math.random() * 3) + 3 // 3-5 out of 5
      setScore(matched)
      setDone(true)
      haptic.match()
    }
  }

  const compatResult = COMPATIBILITY_MESSAGES.find(c => score >= c.min && score <= c.max) || COMPATIBILITY_MESSAGES[2]
  const progress = (step / QUESTIONS.length) * 100

  if (done) {
    return (
      <div className="screen-scroll" style={styles.screen}>
        <div style={styles.resultHeader}>
          <div style={{ fontSize: 72, animation: 'popIn 0.6s cubic-bezier(0.34,1.56,0.64,1)' }}>{compatResult.emoji}</div>
          <h2 style={styles.resultTitle}>{compatResult.title}</h2>
          <p style={styles.resultDesc}>{compatResult.desc}</p>
          <div style={styles.scoreRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ ...styles.scoreDot, background: i < score ? '#E07B39' : '#E8DDD3' }} />
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#BBB', marginTop: 8 }}>{score}/5 questions matched</p>
        </div>

        <div style={styles.answerSummary}>
          <h3 style={styles.summaryTitle}>Your food personality 🧠</h3>
          {QUESTIONS.map((q, i) => {
            const chosen = q.options.find(o => o.id === answers[i])
            return (
              <div key={i} style={styles.summaryItem}>
                <p style={styles.summaryQ}>{q.q}</p>
                <p style={styles.summaryA}>{chosen?.emoji} {chosen?.label}</p>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 0 20px' }}>
          <button className="btn btn-primary" onClick={() => { haptic.medium(); navigate(`/chat/${matchId}`) }}>
            💬 Start Chatting!
          </button>
          <button className="btn btn-secondary" onClick={() => { haptic.tap(); navigate(`/restaurants/${matchId}`) }}>
            🗺️ Pick a Restaurant Together
          </button>
          <button className="btn btn-ghost" onClick={() => { haptic.tap(); navigate('/browse') }}>
            ← Back to Discover
          </button>
        </div>
      </div>
    )
  }

  const current = QUESTIONS[step]

  return (
    <div className="screen-scroll" style={styles.screen}>
      <button className="btn btn-ghost" onClick={() => { haptic.tap(); navigate(`/chat/${matchId}`) }} style={{ alignSelf: 'flex-start', padding: '4px 0', marginBottom: 8 }}>
        Skip quiz →
      </button>

      {/* Progress */}
      <div style={styles.progressOuter}>
        <div style={{ ...styles.progressInner, width: `${progress}%` }} />
      </div>
      <p style={styles.stepLabel}>Question {step + 1} of {QUESTIONS.length}</p>

      <div style={styles.header}>
        <div style={{ fontSize: 48 }}>🧠</div>
        <h2 style={styles.question}>{current.q}</h2>
      </div>

      <div style={styles.options}>
        {current.options.map(opt => (
          <button
            key={opt.id}
            style={styles.optionBtn}
            onClick={() => handleAnswer(opt.id)}
          >
            <span style={{ fontSize: 28 }}>{opt.emoji}</span>
            <span style={styles.optionLabel}>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

const styles = {
  screen: { background: '#FFF8F0', padding: '16px 20px 40px', display: 'flex', flexDirection: 'column', gap: 16 },
  progressOuter: { height: 5, background: '#E8DDD3', borderRadius: 5, overflow: 'hidden' },
  progressInner: { height: '100%', background: 'linear-gradient(90deg, #E07B39, #F4C430)', borderRadius: 5, transition: 'width 0.4s cubic-bezier(0.34,1.56,0.64,1)' },
  stepLabel: { fontSize: 12, color: '#BBB', textAlign: 'center', marginTop: -8 },
  header: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' },
  question: { fontSize: 20, fontWeight: 800, color: '#1A1A1A', lineHeight: 1.3 },
  options: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 },
  optionBtn: { display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 16, border: '2px solid #E8DDD3', background: 'white', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textAlign: 'left', transition: 'all 0.15s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', WebkitTapHighlightColor: 'transparent' },
  optionLabel: { fontSize: 14, fontWeight: 500, color: '#1A1A1A', lineHeight: 1.4 },
  // Result screen
  resultHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, paddingTop: 16 },
  resultTitle: { fontSize: 26, fontWeight: 800, color: '#E07B39' },
  resultDesc: { fontSize: 15, color: '#555', lineHeight: 1.5, maxWidth: 300 },
  scoreRow: { display: 'flex', gap: 8, marginTop: 8 },
  scoreDot: { width: 12, height: 12, borderRadius: '50%', transition: 'background 0.3s' },
  answerSummary: { background: 'white', borderRadius: 16, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  summaryTitle: { fontSize: 15, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 },
  summaryItem: { borderBottom: '1px solid #F5EFE8', paddingBottom: 12 },
  summaryQ: { fontSize: 11, color: '#999', marginBottom: 4 },
  summaryA: { fontSize: 13, fontWeight: 600, color: '#1A1A1A' },
}

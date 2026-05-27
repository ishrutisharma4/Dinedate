import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { connectSocket, getSocket } from '../services/socket'
import { haptic } from '../utils/haptic'
import api from '../services/api'

const BOT_RESPONSES = [
  ["Omg yes! I've been wanting to try that place too! 😍", "What kind of food are you usually into?"],
  ["Hahaha that's so true 😂", "I rate restaurants by their dosas tbh"],
  ["That sounds amazing honestly 🍽️", "We should definitely go sometime!"],
  ["100%! The food scene in Bangalore is insane rn", "Have you been to Toit? Their craft beer is 🔥"],
  ["I just ordered biryani at 11pm. No regrets 🍚", "Lol okay we definitely vibe"],
  ["Wait you also like Japanese food? Harima on Residency Road is a must-try!", "It's tiny but the ramen is 🤌"],
  ["MTR's dosas on weekends hits different", "30 min queue? Worth every second 😌"],
  ["Okay but real question — do you eat dessert first or last?", "This is very important to me 😂"],
  ["I love how you think about food!", "What's the best meal you've had in Bangalore?"],
  ["Truffles for the win honestly", "Their double chocolate shake is unreal 🍫"],
]

const QUICK_REPLIES = [
  '😍 Tell me more!',
  'What time works? 🕐',
  'Saturday evening? 🌆',
  'Love that place! ❤️',
  'Same! 🙌',
  'Hahaha 😂',
]

export default function ChatScreen() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [match, setMatch] = useState(null)
  const [typing, setTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showIcebreakerBanner, setShowIcebreakerBanner] = useState(true)
  const bottomRef = useRef(null)
  const typingTimer = useRef(null)
  const botResponseTimer = useRef(null)
  const botIdxRef = useRef(0)

  useEffect(() => {
    loadChat()
    const token = localStorage.getItem('dd_token')
    const socket = connectSocket(token)

    socket.emit('join_match', matchId)

    socket.on('new_message', (msg) => {
      if (msg.sender_id !== user?.id) {
        setMessages(prev => [...prev, msg])
        haptic.tap()
      }
    })

    socket.on('typing', ({ userId }) => {
      if (userId !== user?.id) {
        setTyping(true)
        clearTimeout(typingTimer.current)
        typingTimer.current = setTimeout(() => setTyping(false), 2000)
      }
    })

    socket.on('match_updated', (updated) => {
      setMatch(updated)
    })

    return () => {
      socket.emit('leave_match', matchId)
      socket.off('new_message')
      socket.off('typing')
      socket.off('match_updated')
      clearTimeout(botResponseTimer.current)
    }
  }, [matchId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const loadChat = async () => {
    try {
      const [matchRes, msgRes] = await Promise.all([
        api.get(`/api/matches/${matchId}`),
        api.get(`/api/chat/${matchId}/messages`),
      ])
      setMatch(matchRes.data.match)
      const existingMessages = msgRes.data.messages || []
      if (existingMessages.length === 0) {
        // Add a warm opening message from the match
        const openingMsg = {
          id: 'bot-0',
          sender_id: matchRes.data.match?.other_user?.id || 'match',
          content: `Hey! I saw we both matched 🍽️ Your bio made me smile. What's your go-to place in Bangalore?`,
          created_at: new Date(Date.now() - 60000).toISOString(),
        }
        setMessages([openingMsg])
      } else {
        setMessages(existingMessages)
      }
    } catch {
      setMatch({ id: matchId, other_user: { name: 'Priya', id: 'match-user', photo: null }, status: 'pending_cuisine' })
      setMessages([
        {
          id: 'bot-init',
          sender_id: 'match-user',
          content: "Hey! Omg we finally matched 🥳 Your foodie bio is *chef's kiss*. What's your fav cuisine in Bangalore?",
          created_at: new Date(Date.now() - 120000).toISOString(),
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Simulate bot typing + response after user sends a message
  const triggerBotResponse = useCallback(() => {
    const botMsgSet = BOT_RESPONSES[botIdxRef.current % BOT_RESPONSES.length]
    botIdxRef.current += 1

    // Show typing indicator after a short delay
    const delay1 = 800 + Math.random() * 1200
    botResponseTimer.current = setTimeout(() => {
      setTyping(true)
      haptic.tap()

      // Send first bot message
      const delay2 = 1200 + Math.random() * 800
      botResponseTimer.current = setTimeout(() => {
        setTyping(false)
        const msg1 = {
          id: `bot-${Date.now()}`,
          sender_id: match?.other_user?.id || 'match-user',
          content: botMsgSet[0],
          created_at: new Date().toISOString(),
        }
        setMessages(prev => [...prev, msg1])
        haptic.tap()
        scrollToBottom()

        // Optionally send a second follow-up message
        if (botMsgSet[1] && Math.random() > 0.3) {
          botResponseTimer.current = setTimeout(() => {
            setTyping(true)
            botResponseTimer.current = setTimeout(() => {
              setTyping(false)
              const msg2 = {
                id: `bot-${Date.now() + 1}`,
                sender_id: match?.other_user?.id || 'match-user',
                content: botMsgSet[1],
                created_at: new Date().toISOString(),
              }
              setMessages(prev => [...prev, msg2])
              haptic.tap()
              scrollToBottom()
            }, 1000 + Math.random() * 600)
          }, 400)
        }
      }, delay2)
    }, delay1)
  }, [match])

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const sendMessage = useCallback(async (text) => {
    const content = text || input.trim()
    if (!content) return
    setInput('')
    haptic.tap()

    const optimistic = {
      id: `opt-${Date.now()}`,
      sender_id: user?.id || 'me',
      content,
      created_at: new Date().toISOString(),
      pending: true,
    }
    setMessages(prev => [...prev, optimistic])
    scrollToBottom()

    // Trigger bot response
    triggerBotResponse()

    try {
      const res = await api.post(`/api/chat/${matchId}/messages`, { content })
      setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...res.data.message, pending: false } : m))
      getSocket()?.emit('send_message', { matchId, message: res.data.message })
    } catch {
      // Keep optimistic message as-is (offline mode)
      setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...m, pending: false } : m))
    }
  }, [input, matchId, user, triggerBotResponse])

  const handleTyping = () => {
    getSocket()?.emit('typing', { matchId, userId: user?.id })
  }

  const other = match?.other_user || { name: 'Match', id: 'match-user' }
  const formatTime = (ts) => {
    try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    catch { return '' }
  }

  if (loading) return (
    <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', background: '#FFF8F0' }}>
      <div className="spinner" />
    </div>
  )

  return (
    <div className="screen" style={{ background: '#FFF8F0' }}>
      {/* Header */}
      <div style={styles.header}>
        <button className="btn btn-ghost" style={{ padding: '8px 4px' }} onClick={() => navigate('/matches')}>←</button>
        <div style={styles.avatarWrap}>
          <img
            src={other.photo || `https://api.dicebear.com/7.x/personas/svg?seed=${other.id}&backgroundColor=ffd5dc`}
            style={styles.avatar}
            alt={other.name}
          />
          <div style={styles.onlineDot} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={styles.name}>{other.name}</div>
          <div style={{ fontSize: 11, color: '#4CAF50', fontWeight: 500 }}>● Online now</div>
        </div>
        {['pending_cuisine', 'pending_restaurant'].includes(match?.status) && (
          <button
            style={styles.actionBtn}
            onClick={() => { haptic.tap(); navigate(match.status === 'pending_cuisine' ? `/restaurant-pick/${matchId}` : `/restaurants/${matchId}`) }}
          >
            {match.status === 'pending_cuisine' ? '🍜 Pick' : '🗺️ Choose'}
          </button>
        )}
        {match?.status === 'confirmed' && match?.restaurant && (
          <div style={styles.dateBadge}>✅ {match.restaurant.name}</div>
        )}
      </div>

      {/* Icebreaker banner */}
      {showIcebreakerBanner && (
        <div style={styles.icebreakerBanner}>
          <span style={{ fontSize: 16 }}>🧠</span>
          <span style={{ flex: 1, fontSize: 12, color: '#B85E22', fontWeight: 500 }}>
            Break the ice with a food quiz!
          </span>
          <button style={styles.icebreakerBtn} onClick={() => { haptic.medium(); navigate(`/icebreaker/${matchId}`) }}>
            Try it →
          </button>
          <button style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', padding: '0 0 0 8px', color: '#CCC' }} onClick={() => setShowIcebreakerBanner(false)}>✕</button>
        </div>
      )}

      {/* Match status banner */}
      {match?.status && match.status !== 'confirmed' && (
        <div style={styles.statusBanner}>
          {match.status === 'pending_cuisine' && '🍜 Both of you need to pick a cuisine to confirm your date'}
          {match.status === 'pending_restaurant' && '🗺️ Choose a restaurant together for your date!'}
        </div>
      )}
      {match?.status === 'confirmed' && (
        <div style={{ ...styles.statusBanner, background: '#E8F5E9', color: '#2E7D32', borderBottomColor: '#C8E6C9' }}>
          🎉 Date confirmed at {match.restaurant?.name || 'your chosen spot'}! Time to chat details.
        </div>
      )}

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map(msg => {
          const isMine = msg.sender_id === user?.id || msg.sender_id === 'me'
          return (
            <div key={msg.id} style={{ ...styles.messageRow, justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
              {!isMine && (
                <img
                  src={other.photo || `https://api.dicebear.com/7.x/personas/svg?seed=${other.id}`}
                  style={styles.msgAvatar}
                  alt=""
                />
              )}
              <div>
                <div style={{
                  ...styles.bubble,
                  ...(isMine ? styles.myBubble : styles.theirBubble),
                  opacity: msg.pending ? 0.75 : 1,
                }}>
                  {msg.content}
                </div>
                <div style={{ ...styles.time, textAlign: isMine ? 'right' : 'left' }}>
                  {formatTime(msg.created_at)}{isMine && !msg.pending ? ' ✓✓' : ''}
                </div>
              </div>
            </div>
          )
        })}

        {typing && (
          <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
            <img
              src={other.photo || `https://api.dicebear.com/7.x/personas/svg?seed=${other.id}`}
              style={styles.msgAvatar}
              alt=""
            />
            <div style={{ ...styles.bubble, ...styles.theirBubble, padding: '12px 16px' }}>
              <div style={styles.typingIndicator}>
                <div style={{ ...styles.typingDot, animationDelay: '0ms' }} />
                <div style={{ ...styles.typingDot, animationDelay: '200ms' }} />
                <div style={{ ...styles.typingDot, animationDelay: '400ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div style={styles.quickReplies}>
        {QUICK_REPLIES.map(r => (
          <button key={r} style={styles.quickBtn} onClick={() => sendMessage(r)}>{r}</button>
        ))}
      </div>

      {/* Input */}
      <div style={styles.inputBar}>
        <input
          className="input"
          style={{ flex: 1, borderRadius: 50, padding: '12px 18px', fontSize: 14 }}
          placeholder="Type a message..."
          value={input}
          onChange={e => { setInput(e.target.value); handleTyping() }}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
        />
        <button
          style={{ ...styles.sendBtn, opacity: input.trim() ? 1 : 0.5, transform: input.trim() ? 'scale(1.05)' : 'scale(1)' }}
          onClick={() => sendMessage()}
          disabled={!input.trim()}
        >
          🚀
        </button>
      </div>

      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

const styles = {
  header: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'white', borderBottom: '1px solid #E8DDD3', flexShrink: 0 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' },
  onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: '#4CAF50', border: '2px solid white' },
  name: { fontSize: 15, fontWeight: 700, color: '#1A1A1A' },
  actionBtn: { fontSize: 11, fontWeight: 700, color: 'white', background: '#E07B39', border: 'none', borderRadius: 50, padding: '6px 12px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' },
  dateBadge: { fontSize: 11, fontWeight: 600, color: '#2E7D32', background: '#E8F5E9', padding: '6px 12px', borderRadius: 50, whiteSpace: 'nowrap' },
  icebreakerBanner: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#FFF0E6', borderBottom: '1px solid #F2DDD0', flexShrink: 0 },
  icebreakerBtn: { fontSize: 12, fontWeight: 700, color: '#E07B39', background: 'none', border: '1.5px solid #E07B39', borderRadius: 50, padding: '4px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' },
  statusBanner: { padding: '8px 20px', background: '#FFF0E6', fontSize: 12, color: '#B85E22', fontWeight: 500, textAlign: 'center', borderBottom: '1px solid #F2DDD0', flexShrink: 0 },
  messages: { flex: 1, overflowY: 'auto', padding: '12px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 },
  messageRow: { display: 'flex', alignItems: 'flex-end', gap: 8 },
  msgAvatar: { width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 },
  bubble: { maxWidth: 250, padding: '10px 14px', borderRadius: 18, fontSize: 14, lineHeight: 1.45, wordBreak: 'break-word' },
  myBubble: { background: 'linear-gradient(135deg, #E07B39, #F4A350)', color: 'white', borderBottomRightRadius: 4 },
  theirBubble: { background: 'white', color: '#1A1A1A', borderBottomLeftRadius: 4, boxShadow: '0 1px 6px rgba(0,0,0,0.08)' },
  time: { fontSize: 10, color: '#CCC', marginTop: 4, paddingLeft: 4 },
  typingIndicator: { display: 'flex', gap: 4, alignItems: 'center', height: 16 },
  typingDot: { width: 7, height: 7, borderRadius: '50%', background: '#CCC', animation: 'typingBounce 1.2s infinite' },
  quickReplies: { display: 'flex', gap: 8, padding: '8px 14px', overflowX: 'auto', flexShrink: 0 },
  quickBtn: { whiteSpace: 'nowrap', padding: '8px 14px', borderRadius: 50, border: '1.5px solid #E8DDD3', background: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', color: '#444', fontFamily: 'Inter, sans-serif' },
  inputBar: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px 16px', background: 'white', borderTop: '1px solid #E8DDD3', flexShrink: 0 },
  sendBtn: { width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #E07B39, #F4A350)', border: 'none', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s', boxShadow: '0 4px 12px rgba(224,123,57,0.35)' },
}

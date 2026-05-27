import { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [toast, setToast] = useState(null)
  const [matchOverlay, setMatchOverlay] = useState(null) // { matchedUser, matchId }

  const showToast = useCallback((message, duration = 2500) => {
    setToast(message)
    setTimeout(() => setToast(null), duration)
  }, [])

  const showMatchOverlay = useCallback((data) => {
    setMatchOverlay(data)
  }, [])

  const hideMatchOverlay = useCallback(() => {
    setMatchOverlay(null)
  }, [])

  return (
    <AppContext.Provider value={{ toast, showToast, matchOverlay, showMatchOverlay, hideMatchOverlay }}>
      {children}
      {toast && <div className="toast">{toast}</div>}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)

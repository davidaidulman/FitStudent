import { useState, useCallback, useRef } from 'react'

// Lightweight toast: const { toast, showToast } = useToast(); render {toast} once.
export function useToast() {
  const [message, setMessage] = useState(null)
  const timer = useRef(null)

  const showToast = useCallback((msg) => {
    setMessage(msg)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(null), 2600)
  }, [])

  const toast = message ? <div className="toast">{message}</div> : null
  return { toast, showToast }
}

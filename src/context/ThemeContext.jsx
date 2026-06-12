import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'fs-theme' // 'light' | 'dark' | 'system'

function systemPrefersDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

function resolve(mode) {
  if (mode === 'light' || mode === 'dark') return mode
  return systemPrefersDark() ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(() => localStorage.getItem(STORAGE_KEY) || 'system')
  const [resolved, setResolved] = useState(() => resolve(localStorage.getItem(STORAGE_KEY) || 'system'))

  // apply the resolved theme to <html data-theme> so CSS variables switch
  useEffect(() => {
    const r = resolve(mode)
    setResolved(r)
    document.documentElement.dataset.theme = r
  }, [mode])

  // when following the system, react to OS-level theme changes live
  useEffect(() => {
    if (mode !== 'system' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const r = systemPrefersDark() ? 'dark' : 'light'
      setResolved(r)
      document.documentElement.dataset.theme = r
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [mode])

  const setMode = useCallback((m) => {
    if (m === 'system') localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, m)
    setModeState(m)
  }, [])

  // simple toggle: flip the *currently shown* theme into an explicit choice
  const toggle = useCallback(() => {
    setMode(resolve(mode) === 'dark' ? 'light' : 'dark')
  }, [mode, setMode])

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode, toggle }}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

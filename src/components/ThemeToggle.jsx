import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

// Compact icon toggle for headers — flips between light/dark
export default function ThemeToggle() {
  const { resolved, toggle } = useTheme()
  const dark = resolved === 'dark'
  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'מצב יום' : 'מצב לילה'}
      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
      style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)', color: 'var(--lime)' }}
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  )
}

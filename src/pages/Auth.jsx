import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Auth({ mode = 'login' }) {
  const navigate = useNavigate()
  const [isSignup, setIsSignup] = useState(mode === 'signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        // alpha: email confirmation disabled — session returns immediately
        if (!data.session) {
          const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password })
          if (loginErr) throw new Error('החשבון נוצר — נסה להתחבר')
        }
        navigate('/onboarding')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/home')
      }
    } catch (err) {
      setError(translateError(err.message))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 relative z-10">
      <div className="card w-full max-w-sm glow-lime fade-up">
        <div className="flex flex-col items-center gap-1 mb-6 mt-2">
          <div className="text-5xl mb-1">🏋️</div>
          <h1 className="text-3xl font-black tracking-tight">
            Fit<span style={{ color: 'var(--lime)' }}>Student</span>
          </h1>
          <p className="label-muted">תזונה ואימונים לסטודנטים · קבוצה 42</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <Mail size={16} className="absolute top-1/2 -translate-y-1/2 right-3.5" style={{ color: 'var(--muted)' }} />
            <input
              className="input-dark pr-10"
              type="email"
              dir="ltr"
              style={{ textAlign: 'left' }}
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute top-1/2 -translate-y-1/2 right-3.5" style={{ color: 'var(--muted)' }} />
            <input
              className="input-dark pr-10"
              type="password"
              dir="ltr"
              style={{ textAlign: 'left' }}
              placeholder="סיסמה (לפחות 6 תווים)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {error && (
            <div
              className="text-sm font-semibold rounded-xl px-4 py-3"
              style={{ color: '#FF8C8C', background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.25)' }}
            >
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary mt-1" disabled={busy}>
            {busy ? '...' : isSignup ? 'הרשמה' : 'התחברות'}
          </button>
        </form>

        <button
          onClick={() => {
            setIsSignup(!isSignup)
            setError(null)
          }}
          className="w-full text-center text-sm mt-5 mb-1 font-medium"
          style={{ color: 'var(--muted)' }}
        >
          {isSignup ? (
            <>
              כבר יש לך חשבון? <span style={{ color: 'var(--lime)' }}>התחבר</span>
            </>
          ) : (
            <>
              אין לך חשבון? <span style={{ color: 'var(--lime)' }}>הירשם</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function translateError(msg = '') {
  if (msg.includes('Invalid login credentials')) return 'אימייל או סיסמה שגויים'
  if (msg.includes('already registered')) return 'האימייל כבר רשום במערכת — נסה להתחבר'
  if (msg.includes('at least 6')) return 'הסיסמה חייבת להכיל לפחות 6 תווים'
  if (msg.includes('valid email')) return 'כתובת אימייל לא תקינה'
  if (msg.includes('rate limit') || msg.includes('Too many')) return 'יותר מדי ניסיונות — נסה שוב בעוד רגע'
  return msg || 'שגיאה — נסה שוב'
}

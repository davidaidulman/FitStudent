import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  // blocks route redirects while a multi-step auth flow (demo setup) is mid-flight
  const [setupBusy, setSetupBusy] = useState(false)

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null)
      return null
    }
    const { data } = await supabase.from('users').select('*').eq('id', userId).maybeSingle()
    setProfile(data || null)
    return data || null
  }, [])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      setSession(session)
      if (session?.user) await loadProfile(session.user.id)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setSession(session)
      // setTimeout escapes the auth lock — supabase calls directly inside
      // onAuthStateChange can deadlock token refresh
      setTimeout(async () => {
        if (!mounted) return
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }, 0)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const refreshProfile = useCallback(
    () => loadProfile(session?.user?.id),
    [session, loadProfile]
  )

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        profile,
        loading,
        setupBusy,
        setSetupBusy,
        refreshProfile,
        loadProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

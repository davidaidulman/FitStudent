import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  // false while a profile fetch for the current session is still in flight —
  // route guards must wait on it, otherwise a fresh login bounces to /onboarding
  // before the existing profile arrives
  const [profileChecked, setProfileChecked] = useState(false)
  // blocks route redirects while a multi-step auth flow (demo setup) is mid-flight
  const [setupBusy, setSetupBusy] = useState(false)
  const checkedUserId = useRef(null)

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
      if (session?.user) {
        await loadProfile(session.user.id)
        checkedUserId.current = session.user.id
      }
      setProfileChecked(true)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setSession(session)
      if (!session?.user) {
        checkedUserId.current = null
        setProfile(null)
        setProfileChecked(true)
        setLoading(false)
        return
      }
      // token refreshes re-fire this event for the same user — skip the refetch
      if (checkedUserId.current === session.user.id) return
      setProfileChecked(false)
      // setTimeout escapes the auth lock — supabase calls directly inside
      // onAuthStateChange can deadlock token refresh
      setTimeout(async () => {
        if (!mounted) return
        await loadProfile(session.user.id)
        checkedUserId.current = session.user.id
        setProfileChecked(true)
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
        profileChecked,
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

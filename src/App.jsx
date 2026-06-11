import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Splash from './components/Splash'
import BottomNav from './components/BottomNav'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Nutrition from './pages/Nutrition'
import Workouts from './pages/Workouts'
import Profile from './pages/Profile'

// All data routes require a session; users without a profile go to onboarding
function Protected({ children, requireProfile = true }) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Splash />
  if (!session) return <Navigate to="/login" replace />
  if (requireProfile && !profile && location.pathname !== '/onboarding')
    return <Navigate to="/onboarding" replace />
  return children
}

// Login/signup redirect away when already authenticated.
// setupBusy holds the redirect while Demo Mode creates profile + plan.
function AuthRoute({ mode }) {
  const { session, profile, loading, setupBusy } = useAuth()
  if (loading || setupBusy) return <Splash />
  if (session) return <Navigate to={profile ? '/home' : '/onboarding'} replace />
  return <Auth mode={mode} />
}

// dev-only UI preview without a database (redirects home in prod builds)
const DevPreview = lazy(() => import('./pages/DevPreview'))
function DevPreviewLazy() {
  if (!import.meta.env.DEV) return <Navigate to="/home" replace />
  return (
    <Suspense fallback={<Splash />}>
      <DevPreview />
    </Suspense>
  )
}

function AppShell({ children }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthRoute mode="login" />} />
          <Route path="/signup" element={<AuthRoute mode="signup" />} />
          <Route
            path="/onboarding"
            element={
              <Protected requireProfile={false}>
                <Onboarding />
              </Protected>
            }
          />
          <Route
            path="/home"
            element={
              <Protected>
                <AppShell>
                  <Home />
                </AppShell>
              </Protected>
            }
          />
          <Route
            path="/nutrition"
            element={
              <Protected>
                <AppShell>
                  <Nutrition />
                </AppShell>
              </Protected>
            }
          />
          <Route
            path="/workouts"
            element={
              <Protected>
                <AppShell>
                  <Workouts />
                </AppShell>
              </Protected>
            }
          />
          <Route
            path="/profile"
            element={
              <Protected>
                <AppShell>
                  <Profile />
                </AppShell>
              </Protected>
            }
          />
          <Route path="/dev-preview" element={<DevPreviewLazy />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

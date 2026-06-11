// Full-screen loading state while auth session resolves
export default function Splash() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4">
      <div className="text-5xl">🏋️</div>
      <div className="text-2xl font-black">
        Fit<span style={{ color: 'var(--lime)' }}>Student</span>
      </div>
      <div className="spinner" />
    </div>
  )
}

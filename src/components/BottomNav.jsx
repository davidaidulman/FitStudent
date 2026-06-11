import { NavLink } from 'react-router-dom'
import { Home, Apple, Dumbbell, User } from 'lucide-react'

const tabs = [
  { to: '/home', label: 'בית', Icon: Home },
  { to: '/nutrition', label: 'תזונה', Icon: Apple },
  { to: '/workouts', label: 'אימונים', Icon: Dumbbell },
  { to: '/profile', label: 'פרופיל', Icon: User },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 right-1/2 translate-x-1/2 w-full max-w-[480px] h-14 z-50 flex items-stretch"
      style={{
        background: 'rgba(14,14,14,0.92)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--border)',
      }}
    >
      {tabs.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className="flex-1 flex flex-col items-center justify-center gap-0.5"
        >
          {({ isActive }) => (
            <>
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 2}
                style={{
                  color: isActive ? 'var(--lime)' : 'var(--muted)',
                  filter: isActive ? 'drop-shadow(0 0 6px rgba(200,240,0,0.5))' : 'none',
                }}
              />
              <span
                className="text-[10px] font-semibold"
                style={{ color: isActive ? 'var(--lime)' : 'var(--muted)' }}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

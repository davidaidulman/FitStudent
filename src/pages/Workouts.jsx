import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Timer, CheckCircle2, Dumbbell, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import SubTabs from '../components/SubTabs'
import Confetti from '../components/Confetti'
import { exercises as exerciseLibrary, MUSCLE_GROUPS } from '../data/mockData'
import { todayKey, todayISO, DAY_KEYS, DAY_LETTERS_HE, hebrewShortDate } from '../utils/dates'

const TABS = [
  { key: 'plan', label: 'התוכנית שלי' },
  { key: 'today', label: 'האימון של היום' },
  { key: 'history', label: 'היסטוריה' },
  { key: 'library', label: 'ספריית תרגילים' },
]

export default function Workouts() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'plan'
  const { user } = useAuth()
  const { toast, showToast } = useToast()
  const [plan, setPlan] = useState([])

  useEffect(() => {
    if (!user) return
    supabase
      .from('workout_plan')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => setPlan(data || []))
  }, [user])

  return (
    <div className="px-4 pt-6 pb-20 flex flex-col gap-4 relative z-10">
      <header className="fade-up">
        <h1 className="text-2xl font-black">🏋️ אימונים</h1>
      </header>
      <div className="fade-up fade-up-1">
        <SubTabs tabs={TABS} active={tab} onChange={(t) => setParams({ tab: t })} />
      </div>

      {tab === 'plan' && <PlanTab plan={plan} />}
      {tab === 'today' && <TodayTab plan={plan} user={user} showToast={showToast} />}
      {tab === 'history' && <HistoryTab user={user} />}
      {tab === 'library' && <LibraryTab />}

      {toast}
    </div>
  )
}

/* ───────────────────────── Tab 1: My Plan ───────────────────────── */

function PlanTab({ plan }) {
  const byDay = Object.fromEntries(plan.map((p) => [p.day_of_week, p]))
  return (
    <div className="flex flex-col gap-2.5">
      {DAY_KEYS.map((day, i) => {
        const entry = byDay[day]
        const isToday = day === todayKey()
        const isRest = !entry || entry.workout_name === 'מנוחה'
        const exercises = entry?.exercises_json || []
        return (
          <section
            key={day}
            className={`card !py-3.5 fade-up fade-up-${Math.min(i + 1, 6)} flex items-center gap-3`}
            style={isToday ? { borderColor: 'var(--lime-border)', boxShadow: '0 0 20px rgba(200,240,0,0.12)' } : {}}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold shrink-0"
              style={
                isToday
                  ? { background: 'var(--lime)', color: '#040404' }
                  : { background: 'var(--bg-card-2)', color: 'var(--muted)' }
              }
            >
              {DAY_LETTERS_HE[i]}
            </div>
            <div className="flex-1 min-w-0">
              {isRest ? (
                <p className="font-bold" style={{ color: 'var(--muted)' }}>
                  מנוחה 💤
                </p>
              ) : (
                <>
                  <p className="font-bold truncate">{entry.workout_name}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {entry.muscle_groups
                      .split(',')
                      .filter(Boolean)
                      .map((mg, j) => (
                        <span
                          key={j}
                          className="text-[10px] font-bold rounded-full px-2 py-0.5"
                          style={{ background: 'var(--lime-dim)', color: 'var(--lime)', border: '1px solid var(--lime-border)' }}
                        >
                          {mg.trim()}
                        </span>
                      ))}
                    <span className="label-muted" style={{ fontSize: 11 }}>
                      {exercises.length} תרגילים
                    </span>
                  </div>
                </>
              )}
            </div>
            {isToday && (
              <span className="text-[10px] font-extrabold shrink-0" style={{ color: 'var(--lime)' }}>
                היום
              </span>
            )}
          </section>
        )
      })}
    </div>
  )
}

/* ───────────────────────── Tab 2: Today's Workout ───────────────────────── */

function TodayTab({ plan, user, showToast }) {
  const todayPlan = plan.find((p) => p.day_of_week === todayKey())
  const exercises = todayPlan?.exercises_json || []
  const isRest = !todayPlan || todayPlan.workout_name === 'מנוחה' || exercises.length === 0

  const [actualWeights, setActualWeights] = useState({})
  const [timerFor, setTimerFor] = useState(null) // exercise index with active rest timer
  const [celebrating, setCelebrating] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [saving, setSaving] = useState(false)
  const startTime = useRef(Date.now())

  async function completeWorkout() {
    setSaving(true)
    const durationMin = Math.max(Math.round((Date.now() - startTime.current) / 60000), 1)
    const { error } = await supabase.from('workout_log').insert({
      user_id: user.id,
      date: todayISO(),
      workout_name: todayPlan.workout_name,
      exercises_json: exercises.map((ex, i) => ({
        ...ex,
        actual_weight_kg: actualWeights[i] !== undefined && actualWeights[i] !== '' ? +actualWeights[i] : ex.weight_kg,
      })),
      duration_min: durationMin,
      completed: true,
    })
    setSaving(false)
    if (error) {
      showToast('שגיאה בשמירה 😕')
      return
    }
    setCelebrating(true)
    setCompleted(true)
    showToast('כל הכבוד! האימון נשמר 🎉')
    setTimeout(() => setCelebrating(false), 4000)
  }

  if (isRest) {
    return (
      <section className="card fade-up fade-up-2 text-center py-12">
        <p className="text-5xl mb-3">💤</p>
        <p className="font-bold text-lg">היום מנוחה</p>
        <p className="label-muted text-sm mt-1">השריר נבנה בזמן המנוחה — תחזור מחר חזק יותר</p>
      </section>
    )
  }

  return (
    <>
      {celebrating && <Confetti />}
      <section className={`card fade-up fade-up-2 ${celebrating ? 'pulse-lime' : ''}`}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="section-title">{todayPlan.workout_name}</h2>
          {completed && <CheckCircle2 size={20} style={{ color: 'var(--lime)' }} />}
        </div>
        <p className="label-muted text-sm mb-4">
          {todayPlan.muscle_groups} · {exercises.length} תרגילים · לחץ על תרגיל לטיימר מנוחה ⏱️
        </p>

        <div className="flex flex-col gap-2.5">
          {exercises.map((ex, i) => (
            <div key={i} className="card-2 p-3">
              <button className="w-full text-right" onClick={() => setTimerFor(timerFor === i ? null : i)}>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm">{ex.name}</p>
                  <Timer size={15} style={{ color: timerFor === i ? 'var(--lime)' : 'var(--muted)' }} />
                </div>
                <p className="label-muted mt-0.5" style={{ fontSize: 12 }}>
                  יעד: {ex.sets} סטים × {ex.reps} חזרות
                  {ex.weight_kg > 0 ? ` × ${ex.weight_kg} ק"ג` : ''}
                </p>
                {ex.description && (
                  <p className="label-muted mt-0.5" style={{ fontSize: 11, opacity: 0.8 }}>
                    💡 {ex.description}
                  </p>
                )}
              </button>

              <div className="flex items-center gap-2 mt-2">
                <label className="label-muted shrink-0" style={{ fontSize: 12 }}>
                  משקל בפועל:
                </label>
                <input
                  type="number"
                  className="input-dark !py-1.5 !px-3 !text-sm !w-24"
                  placeholder={`${ex.weight_kg}`}
                  value={actualWeights[i] ?? ''}
                  onChange={(e) => setActualWeights((w) => ({ ...w, [i]: e.target.value }))}
                />
                <span className="label-muted" style={{ fontSize: 12 }}>
                  ק"ג
                </span>
              </div>

              {timerFor === i && <RestTimer onDone={() => setTimerFor(null)} />}
            </div>
          ))}
        </div>

        <button className="btn-primary mt-4" onClick={completeWorkout} disabled={saving || completed}>
          {completed ? '✅ האימון הושלם!' : saving ? 'שומר...' : '🏁 סיום אימון'}
        </button>
      </section>
    </>
  )
}

function RestTimer({ seconds = 60, onDone }) {
  const [left, setLeft] = useState(seconds)

  useEffect(() => {
    if (left <= 0) {
      beep()
      onDone?.()
      return
    }
    const t = setTimeout(() => setLeft(left - 1), 1000)
    return () => clearTimeout(t)
  }, [left])

  const pct = left / seconds
  const r = 26
  const c = 2 * Math.PI * r

  return (
    <div className="flex items-center justify-center gap-4 mt-3 py-2 rounded-xl" style={{ background: 'var(--lime-dim)' }}>
      <div className="relative w-16 h-16">
        <svg width="64" height="64" className="-rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="var(--bg-card)" strokeWidth="5" />
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke="var(--lime)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            style={{ transition: 'stroke-dashoffset 1s linear', filter: 'drop-shadow(0 0 6px rgba(200,240,0,0.5))' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-extrabold" style={{ color: 'var(--lime)' }}>
          {left}
        </span>
      </div>
      <div>
        <p className="font-bold text-sm" style={{ color: 'var(--lime)' }}>
          מנוחה בין סטים
        </p>
        <button className="label-muted text-xs flex items-center gap-1 mt-1" onClick={onDone}>
          <X size={12} /> דלג
        </button>
      </div>
    </div>
  )
}

// short completion beep via Web Audio API
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    osc.start()
    osc.stop(ctx.currentTime + 0.5)
  } catch {
    // audio not available — silent fallback
  }
}

/* ───────────────────────── Tab 3: History ───────────────────────── */

function HistoryTab({ user }) {
  const [logs, setLogs] = useState(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('workout_log')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(10)
      .then(({ data }) => setLogs(data || []))
  }, [user])

  if (!logs)
    return (
      <div className="flex justify-center py-12">
        <div className="spinner" />
      </div>
    )

  if (logs.length === 0)
    return (
      <section className="card fade-up fade-up-2 text-center py-12">
        <p className="text-4xl mb-3">📜</p>
        <p className="font-bold">אין עדיין אימונים בהיסטוריה</p>
        <p className="label-muted text-sm mt-1">סיים את האימון הראשון שלך והוא יופיע כאן</p>
      </section>
    )

  return (
    <div className="flex flex-col gap-2.5">
      {logs.map((log, i) => (
        <section key={log.id} className={`card !py-3.5 fade-up fade-up-${Math.min(i + 1, 6)} flex items-center gap-3`}>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'var(--lime-dim)', border: '1px solid var(--lime-border)' }}
          >
            <Dumbbell size={17} style={{ color: 'var(--lime)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{log.workout_name}</p>
            <p className="label-muted" style={{ fontSize: 12 }}>
              {hebrewShortDate(log.date)} · {log.duration_min} דק׳ · {(log.exercises_json || []).length} תרגילים
            </p>
          </div>
          {log.completed && (
            <span
              className="text-[10px] font-extrabold rounded-full px-2.5 py-1 shrink-0"
              style={{ background: 'var(--lime-dim)', color: 'var(--lime)', border: '1px solid var(--lime-border)' }}
            >
              ✓ הושלם
            </span>
          )}
        </section>
      ))}
    </div>
  )
}

/* ───────────────────────── Tab 4: Exercise Library ───────────────────────── */

function LibraryTab() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? exerciseLibrary : exerciseLibrary.filter((e) => e.muscle_group === filter)

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 fade-up fade-up-2" style={{ scrollbarWidth: 'none' }}>
        <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          הכל
        </button>
        {MUSCLE_GROUPS.map((mg) => (
          <button key={mg.key} className={`chip ${filter === mg.key ? 'active' : ''}`} onClick={() => setFilter(mg.key)}>
            {mg.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        {filtered.map((ex, i) => (
          <section key={ex.name} className={`card !py-3.5 fade-up fade-up-${Math.min((i % 6) + 1, 6)}`}>
            <div className="flex items-center justify-between mb-1">
              <p className="font-bold text-sm">{ex.name}</p>
              <span
                className="text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0"
                style={{ background: 'var(--lime-dim)', color: 'var(--lime)', border: '1px solid var(--lime-border)' }}
              >
                {MUSCLE_GROUPS.find((m) => m.key === ex.muscle_group)?.label}
              </span>
            </div>
            <p className="label-muted" style={{ fontSize: 12 }}>
              המלצה: {ex.sets_recommendation}
            </p>
            <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--text)', opacity: 0.85 }}>
              {ex.description}
            </p>
          </section>
        ))}
      </div>
    </>
  )
}

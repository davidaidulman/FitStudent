import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Timer, CheckCircle2, Dumbbell, X, Plus, Trash2, Pencil, Flame, RefreshCw, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import SubTabs from '../components/SubTabs'
import Confetti from '../components/Confetti'
import {
  exercises as exerciseLibrary,
  disciplineMovements,
  MUSCLE_GROUPS,
  DISCIPLINES,
  DISCIPLINE_LABELS,
  DISCIPLINE_EMOJI,
  CROSSFIT_SECTIONS,
  DISCIPLINE_VARIANT,
  variantLabel,
  defaultVariant,
} from '../data/mockData'
import { generateWorkoutPlan, workoutForDiscipline, recommendationsFor, scheduleWorkoutToCalendar } from '../services/ai'
import { calcCaloriesBurned } from '../utils/nutrition'
import { todayKey, todayISO, DAY_KEYS, DAY_LETTERS_HE, hebrewShortDate } from '../utils/dates'

const TABS = [
  { key: 'plan', label: 'התוכנית שלי' },
  { key: 'today', label: 'האימון של היום' },
  { key: 'add', label: 'הוסף אימון' },
  { key: 'history', label: 'היסטוריה' },
  { key: 'library', label: 'ספרייה' },
]

export default function Workouts() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'plan'
  const { user, profile, refreshProfile } = useAuth()
  const { toast, showToast } = useToast()
  const [plan, setPlan] = useState([])

  async function loadPlan() {
    if (!user) return
    const { data } = await supabase.from('workout_plan').select('*').eq('user_id', user.id)
    setPlan(data || [])
  }

  useEffect(() => {
    loadPlan()
  }, [user])

  return (
    <div className="px-4 pt-6 pb-20 flex flex-col gap-4 relative z-10">
      <header className="fade-up">
        <h1 className="text-2xl font-black">🏋️ אימונים</h1>
      </header>
      <div className="fade-up fade-up-1">
        <SubTabs tabs={TABS} active={tab} onChange={(t) => setParams({ tab: t })} />
      </div>

      {tab === 'plan' && (
        <PlanTab plan={plan} user={user} profile={profile} reloadPlan={loadPlan} refreshProfile={refreshProfile} showToast={showToast} />
      )}
      {tab === 'today' && <TodayTab plan={plan} user={user} profile={profile} reloadPlan={loadPlan} showToast={showToast} />}
      {tab === 'add' && <AddWorkoutTab user={user} profile={profile} showToast={showToast} onAdded={() => setParams({ tab: 'history' })} />}
      {tab === 'history' && <HistoryTab user={user} profile={profile} showToast={showToast} />}
      {tab === 'library' && <LibraryTab profile={profile} />}

      {toast}
    </div>
  )
}

/* ───────────────────────── Shared workout editor ───────────────────────── */

function normEx(ex) {
  return {
    name: ex.name || '',
    sets: ex.sets ?? 3,
    reps: ex.reps ?? 10,
    weight_kg: ex.weight_kg ?? 0,
    section: ex.section || 'strength',
    description: ex.description || '',
  }
}

function WorkoutEditor({ initial, mode, profile, onSave, onClose, busy }) {
  const startRest = initial.workout_name === 'מנוחה' || (!initial.workout_name && (initial.exercises_json || initial.exercises || []).length === 0 && mode === 'plan' && initial.isRest)
  const [rest, setRest] = useState(initial.workout_name === 'מנוחה')
  const [type, setType] = useState(initial.workout_type || profile?.workout_type || 'gym')
  const [variant, setVariant] = useState(initial.workout_variant || defaultVariant(initial.workout_type || 'gym', profile?.experience))
  const [name, setName] = useState(initial.workout_name && initial.workout_name !== 'מנוחה' ? initial.workout_name : '')
  const [muscle, setMuscle] = useState(initial.muscle_groups || '')
  const [duration, setDuration] = useState(initial.duration_min || 45)
  const [exercises, setExercises] = useState(() => (initial.exercises_json || initial.exercises || []).map(normEx))

  const variantOpts = DISCIPLINE_VARIANT[type]?.options || []
  const isWeighted = type === 'gym' || type === 'crossfit'
  const isCrossfit = type === 'crossfit'
  const calories = calcCaloriesBurned({ workout_type: type, variant, duration_min: duration, weight_kg: profile?.weight_kg })

  const [showRecs, setShowRecs] = useState(false)
  const recommendations = recommendationsFor(type, variant)

  function loadWorkout(w) {
    setName(w.workout_name)
    setMuscle(w.muscle_groups)
    setExercises(w.exercises.map(normEx))
  }
  function loadSuggestion(t, v) {
    const list = recommendationsFor(t, v)
    if (list[0]) loadWorkout(list[0])
  }
  function pickType(t) {
    const v = defaultVariant(t, profile?.experience)
    setType(t)
    setVariant(v)
    setRest(false)
    loadSuggestion(t, v)
  }
  function pickVariant(v) {
    setVariant(v)
    loadSuggestion(type, v)
  }
  const upd = (i, k, val) => setExercises((l) => l.map((e, j) => (j === i ? { ...e, [k]: val } : e)))
  const addRow = () => setExercises((l) => [...l, normEx({ name: '' })])
  const delRow = (i) => setExercises((l) => l.filter((_, j) => j !== i))

  function handleSave() {
    if (rest) return onSave({ rest: true })
    const clean = exercises
      .filter((e) => e.name.trim())
      .map((e) => ({
        name: e.name.trim(),
        sets: +e.sets || 0,
        reps: +e.reps || 0,
        weight_kg: +e.weight_kg || 0,
        actual_weight_kg: +e.weight_kg || 0,
        ...(isCrossfit ? { section: e.section } : {}),
        ...(e.description ? { description: e.description } : {}),
      }))
    onSave({
      rest: false,
      workout_name: name.trim() || DISCIPLINE_LABELS[type],
      workout_type: type,
      workout_variant: variant,
      muscle_groups: muscle,
      exercises: clean,
      duration_min: +duration || null,
      calories_burned: calories,
    })
  }

  return (
    <section className="card fade-up flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <h2 className="section-title">{mode === 'plan' ? 'עריכת יום' : 'עריכת אימון'}</h2>
        <button onClick={onClose} aria-label="סגור">
          <X size={18} style={{ color: 'var(--muted)' }} />
        </button>
      </div>

      {mode === 'plan' && (
        <button
          onClick={() => setRest((r) => !r)}
          className="chip self-start"
          style={rest ? { background: 'var(--lime-dim)', borderColor: 'var(--lime-border)', color: 'var(--lime)' } : {}}
        >
          💤 יום מנוחה
        </button>
      )}

      {!rest && (
        <>
          <div>
            <label className="label-muted block mb-1.5">סוג אימון</label>
            <div className="grid grid-cols-2 gap-2">
              {DISCIPLINES.map((d) => (
                <button
                  key={d.key}
                  onClick={() => pickType(d.key)}
                  className="card-2 p-2 text-sm font-bold flex items-center gap-1.5 justify-center"
                  style={type === d.key ? { borderColor: 'var(--lime-border)', background: 'var(--lime-dim)', color: 'var(--lime)' } : { color: 'var(--muted)' }}
                >
                  <span>{d.emoji}</span>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {variantOpts.length > 0 && (
            <div>
              <label className="label-muted block mb-1.5">{DISCIPLINE_VARIANT[type].label}</label>
              <div className="flex gap-2 flex-wrap">
                {variantOpts.map((o) => (
                  <button
                    key={o.key}
                    onClick={() => pickVariant(o.key)}
                    className={`chip ${variant === o.key ? 'active' : ''}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="label-muted block mb-1.5">שם האימון</label>
            <input className="input-dark" value={name} onChange={(e) => setName(e.target.value)} placeholder="שם האימון" />
          </div>

          <div className="flex items-end gap-3">
            <div>
              <label className="label-muted block mb-1.5">משך (דקות)</label>
              <input
                className="input-dark !w-28"
                type="number"
                min={1}
                max={300}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1.5 pb-2.5" style={{ color: 'var(--orange)' }}>
              <Flame size={16} />
              <span className="font-bold text-sm">~{calories} קק"ל</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label-muted">{isCrossfit ? 'תרגילים (לפי חלקים)' : 'תרגילים'}</label>
              <button
                onClick={() => setShowRecs((s) => !s)}
                className="label-muted text-xs flex items-center gap-1"
                style={{ color: 'var(--lime)' }}
              >
                <RefreshCw size={12} /> טען המלצה
              </button>
            </div>

            {showRecs && (
              <div className="card-2 p-2.5 mb-2 flex flex-col gap-1.5">
                <p className="label-muted" style={{ fontSize: 11 }}>בחר אימון מומלץ:</p>
                {recommendations.map((w, ri) => (
                  <button
                    key={ri}
                    onClick={() => {
                      loadWorkout(w)
                      setShowRecs(false)
                    }}
                    className="text-right rounded-lg px-2.5 py-2"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  >
                    <span className="text-sm font-bold block">{w.workout_name}</span>
                    <span className="label-muted block" style={{ fontSize: 11 }}>
                      {w.muscle_groups ? `${w.muscle_groups} · ` : ''}{w.exercises.length} תרגילים
                    </span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-2">
              {exercises.map((ex, i) => (
                <div key={i} className="card-2 p-2.5 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      className="input-dark !py-1.5 !px-3 !text-sm flex-1"
                      value={ex.name}
                      onChange={(e) => upd(i, 'name', e.target.value)}
                      placeholder={`תרגיל ${i + 1}`}
                    />
                    <button onClick={() => delRow(i)} aria-label="הסר תרגיל">
                      <Trash2 size={16} style={{ color: 'var(--muted)' }} />
                    </button>
                  </div>
                  {isCrossfit && (
                    <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
                      {CROSSFIT_SECTIONS.map((s) => (
                        <button
                          key={s.key}
                          onClick={() => upd(i, 'section', s.key)}
                          className={`chip !px-2.5 !py-1 ${ex.section === s.key ? 'active' : ''}`}
                          style={{ fontSize: 11 }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <NumField label={isCrossfit ? 'סבבים' : 'סטים'} value={ex.sets} onChange={(v) => upd(i, 'sets', v)} />
                    <NumField label={isWeighted ? 'חזרות' : 'חזרות/שנ׳'} value={ex.reps} onChange={(v) => upd(i, 'reps', v)} />
                    {isWeighted && <NumField label='ק"ג' value={ex.weight_kg} onChange={(v) => upd(i, 'weight_kg', v)} />}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={addRow}
              className="btn-ghost !py-2 text-sm mt-2 flex items-center justify-center gap-1.5"
              style={{ color: 'var(--lime)', borderColor: 'var(--lime-border)' }}
            >
              <Plus size={15} /> הוסף תרגיל
            </button>
          </div>
        </>
      )}

      <div className="flex gap-2">
        <button className="btn-primary" onClick={handleSave} disabled={busy}>
          {busy ? 'שומר...' : 'שמור'}
        </button>
        <button className="btn-ghost !w-auto px-4" onClick={onClose}>
          ביטול
        </button>
      </div>
    </section>
  )
}

/* ───────────────────────── Tab 1: My Plan ───────────────────────── */

function PlanTab({ plan, user, profile, reloadPlan, refreshProfile, showToast }) {
  const byDay = Object.fromEntries(plan.map((p) => [p.day_of_week, p]))
  const current = profile?.workout_type || 'gym'
  const [switching, setSwitching] = useState(null)
  const [editDay, setEditDay] = useState(null)
  const [savingDay, setSavingDay] = useState(false)

  async function saveDay(day, data) {
    setSavingDay(true)
    const row = data.rest
      ? { workout_name: 'מנוחה', muscle_groups: '', exercises: [], workout_type: profile?.workout_type || 'gym', workout_variant: null }
      : data
    await supabase.from('workout_plan').delete().eq('user_id', user.id).eq('day_of_week', day)
    const { error } = await supabase.from('workout_plan').insert({
      user_id: user.id,
      day_of_week: day,
      workout_name: row.workout_name,
      muscle_groups: row.muscle_groups || '',
      exercises_json: row.exercises || [],
      workout_type: row.workout_type,
      workout_variant: row.workout_variant || null,
    })
    setSavingDay(false)
    setEditDay(null)
    if (error) return showToast('שגיאה בעדכון היום 😕')
    showToast('היום עודכן ✅')
    reloadPlan()
  }

  async function switchDiscipline(discipline) {
    if (discipline === current || switching) return
    setSwitching(discipline)
    const newPlan = await generateWorkoutPlan({
      experience: profile?.experience,
      workouts_per_week: profile?.workouts_per_week,
      workout_type: discipline,
    })
    await supabase.from('users').update({ workout_type: discipline }).eq('id', user.id)
    await supabase.from('workout_plan').delete().eq('user_id', user.id)
    const { error } = await supabase.from('workout_plan').insert(
      newPlan.map((day) => ({
        user_id: user.id,
        day_of_week: day.day_of_week,
        workout_name: day.workout_name,
        muscle_groups: day.muscle_groups,
        exercises_json: day.exercises,
        workout_type: day.workout_type,
        workout_variant: day.workout_variant,
      }))
    )
    setSwitching(null)
    if (error) return showToast('שגיאה בעדכון התוכנית 😕')
    showToast(`התוכנית עודכנה ל${DISCIPLINE_LABELS[discipline]} ${DISCIPLINE_EMOJI[discipline]}`)
    await Promise.all([reloadPlan(), refreshProfile()])
  }

  return (
    <div className="flex flex-col gap-2.5">
      <section className="card !py-3 fade-up">
        <p className="label-muted text-sm mb-2">בנה מחדש את כל השבוע בסוג אחד - או ערוך כל יום בנפרד עם ✏️ לשילוב סוגים</p>
        <div className="grid grid-cols-2 gap-2">
          {DISCIPLINES.map((d) => (
            <button
              key={d.key}
              onClick={() => switchDiscipline(d.key)}
              disabled={!!switching}
              className="card-2 p-2.5 text-sm font-bold flex items-center gap-2 justify-center transition-all"
              style={
                current === d.key
                  ? { borderColor: 'var(--lime-border)', background: 'var(--lime-dim)', color: 'var(--lime)' }
                  : { color: 'var(--muted)' }
              }
            >
              <span className="text-lg">{d.emoji}</span>
              {switching === d.key ? '...' : d.label}
            </button>
          ))}
        </div>
      </section>
      {DAY_KEYS.map((day, i) => {
        const entry = byDay[day]
        const isToday = day === todayKey()
        const isRest = !entry || entry.workout_name === 'מנוחה'
        const exercises = entry?.exercises_json || []
        const dayType = entry?.workout_type
        if (editDay === day) {
          return (
            <WorkoutEditor
              key={day}
              mode="plan"
              profile={profile}
              busy={savingDay}
              initial={entry || { workout_name: '', workout_type: current, exercises_json: [] }}
              onSave={(data) => saveDay(day, data)}
              onClose={() => setEditDay(null)}
            />
          )
        }
        return (
          <section
            key={day}
            className={`card !py-3.5 fade-up fade-up-${Math.min(i + 1, 6)} flex flex-col gap-3`}
            style={isToday ? { borderColor: 'var(--lime-border)', boxShadow: '0 0 20px var(--glow)' } : {}}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold shrink-0"
                style={
                  isToday
                    ? { background: 'var(--lime)', color: 'var(--on-accent)' }
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
                    <p className="font-bold truncate">
                      {dayType && dayType !== 'gym' ? `${DISCIPLINE_EMOJI[dayType]} ` : ''}
                      {entry.workout_name}
                    </p>
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
              <button
                onClick={() => setEditDay(day)}
                aria-label="ערוך יום"
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)' }}
              >
                <Pencil size={14} style={{ color: 'var(--muted)' }} />
              </button>
            </div>
          </section>
        )
      })}
    </div>
  )
}

/* ───────────────────────── Tab 2: Today's Workout ───────────────────────── */

function TodayTab({ plan, user, profile, reloadPlan, showToast }) {
  const todayPlan = plan.find((p) => p.day_of_week === todayKey())
  const exercises = todayPlan?.exercises_json || []
  const isRest = !todayPlan || todayPlan.workout_name === 'מנוחה' || exercises.length === 0

  const [actualWeights, setActualWeights] = useState({})
  const [timerFor, setTimerFor] = useState(null)
  const [restSeconds, setRestSeconds] = useState(60)
  const [celebrating, setCelebrating] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [savingPlan, setSavingPlan] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const startTime = useRef(Date.now())

  async function saveTodayPlan(data) {
    setSavingPlan(true)
    const day = todayKey()
    const row = data.rest
      ? { workout_name: 'מנוחה', muscle_groups: '', exercises: [], workout_type: profile?.workout_type || 'gym', workout_variant: null }
      : data
    await supabase.from('workout_plan').delete().eq('user_id', user.id).eq('day_of_week', day)
    const { error } = await supabase.from('workout_plan').insert({
      user_id: user.id,
      day_of_week: day,
      workout_name: row.workout_name,
      muscle_groups: row.muscle_groups || '',
      exercises_json: row.exercises || [],
      workout_type: row.workout_type,
      workout_variant: row.workout_variant || null,
    })
    setSavingPlan(false)
    setEditing(false)
    if (error) return showToast('שגיאה בעדכון 😕')
    showToast('האימון של היום עודכן ✅')
    reloadPlan()
  }

  async function completeWorkout() {
    setSaving(true)
    const durationMin = Math.max(Math.round((Date.now() - startTime.current) / 60000), 1)
    const { error } = await supabase.from('workout_log').insert({
      user_id: user.id,
      date: todayISO(),
      workout_name: todayPlan.workout_name,
      workout_type: todayPlan.workout_type || 'gym',
      workout_variant: todayPlan.workout_variant || null,
      exercises_json: exercises.map((ex, i) => ({
        ...ex,
        actual_weight_kg: actualWeights[i] !== undefined && actualWeights[i] !== '' ? +actualWeights[i] : ex.weight_kg,
      })),
      duration_min: durationMin,
      calories_burned: calcCaloriesBurned({
        workout_type: todayPlan.workout_type || 'gym',
        variant: todayPlan.workout_variant,
        duration_min: durationMin,
        weight_kg: profile?.weight_kg,
      }),
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

  async function handleSchedule() {
    const time = prompt("באיזו שעה לקבוע את האימון? (למשל: 15:30)", "17:00");
    if (!time) return;

    setScheduling(true);
    try {
      const [hours, minutes] = time.split(':');
      const scheduledDate = new Date();
      scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0); 
      
      await scheduleWorkoutToCalendar(
        todayPlan.workout_name,
        user.email,
        scheduledDate.toISOString()
      );
      showToast(`האימון נקבע ל-${time}! 📅`);
    } catch (err) {
      console.error(err);
      showToast('שגיאה בהוספה ליומן');
    } finally {
      setScheduling(false);
    }
  }

  if (editing) {
    return (
      <WorkoutEditor
        mode="plan"
        profile={profile}
        busy={savingPlan}
        initial={todayPlan || { workout_name: '', workout_type: profile?.workout_type || 'gym', exercises_json: [] }}
        onSave={saveTodayPlan}
        onClose={() => setEditing(false)}
      />
    )
  }

  if (isRest) {
    return (
      <section className="card fade-up fade-up-2 text-center py-10">
        <p className="text-5xl mb-3">💤</p>
        <p className="font-bold text-lg">היום מנוחה</p>
        <p className="label-muted text-sm mt-1 mb-4">השריר נבנה בזמן המנוחה - תחזור מחר חזק יותר</p>
        <button
          className="btn-ghost flex items-center justify-center gap-2 mx-auto !w-auto px-5"
          style={{ color: 'var(--lime)', borderColor: 'var(--lime-border)' }}
          onClick={() => setEditing(true)}
        >
          <Pencil size={15} /> תכנן אימון להיום
        </button>
      </section>
    )
  }

  return (
    <>
      {celebrating && <Confetti />}
      <section className={`card fade-up fade-up-2 ${celebrating ? 'pulse-lime' : ''}`}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="section-title">
            {todayPlan.workout_type && todayPlan.workout_type !== 'gym' ? `${DISCIPLINE_EMOJI[todayPlan.workout_type]} ` : ''}
            {todayPlan.workout_name}
          </h2>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSchedule}
              disabled={scheduling}
              aria-label="קבע ביומן"
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'var(--lime-dim)', border: '1px solid var(--lime-border)' }}
            >
              <Calendar size={14} style={{ color: 'var(--lime)' }} />
            </button>
            {completed && <CheckCircle2 size={20} style={{ color: 'var(--lime)' }} />}
            <button
              onClick={() => setEditing(true)}
              aria-label="ערוך אימון"
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)' }}
            >
              <Pencil size={14} style={{ color: 'var(--muted)' }} />
            </button>
          </div>
        </div>
        <p className="label-muted text-sm mb-3">
          {todayPlan.muscle_groups} · {exercises.length} תרגילים · לחץ על תרגיל לטיימר מנוחה ⏱️
        </p>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="label-muted shrink-0" style={{ fontSize: 12 }}>זמן מנוחה:</span>
          {[30, 60, 90, 120].map((s) => (
            <button
              key={s}
              onClick={() => setRestSeconds(s)}
              className={`chip !px-2.5 !py-1 ${restSeconds === s ? 'active' : ''}`}
              style={{ fontSize: 12 }}
            >
              {s} שנ׳
            </button>
          ))}
          <input
            type="number"
            min={5}
            max={600}
            className="input-dark !py-1 !px-2 !text-sm !w-16 text-center"
            value={restSeconds}
            onChange={(e) => setRestSeconds(Math.max(5, Math.min(600, +e.target.value || 5)))}
            aria-label="זמן מנוחה מותאם"
          />
        </div>

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

              {(todayPlan.workout_type || 'gym') === 'gym' && (
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
              )}

              {timerFor === i && <RestTimer seconds={restSeconds} onDone={() => setTimerFor(null)} />}
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
  }
}

/* ───────────────────────── Tab 3: Add Manual Workout ───────────────────────── */

function AddWorkoutTab({ user, profile, showToast, onAdded }) {
  const [type, setType] = useState(profile?.workout_type || 'gym')
  const [variant, setVariant] = useState(defaultVariant(profile?.workout_type || 'gym', profile?.experience))
  const [name, setName] = useState('')
  const [duration, setDuration] = useState(45)
  const [exercises, setExercises] = useState([{ name: '', sets: 3, reps: 10, weight_kg: 0, section: 'strength' }])
  const [saving, setSaving] = useState(false)

  const isGym = type === 'gym'
  const isCrossfit = type === 'crossfit'
  const showExercises = isGym || isCrossfit 
  const variantOpts = DISCIPLINE_VARIANT[type]?.options || []
  const calories = calcCaloriesBurned({ workout_type: type, variant, duration_min: duration, weight_kg: profile?.weight_kg })

  function pickType(t) {
    setType(t)
    setVariant(defaultVariant(t, profile?.experience))
  }

  function updateExercise(i, key, value) {
    setExercises((list) => list.map((ex, j) => (j === i ? { ...ex, [key]: value } : ex)))
  }
  function addExerciseRow() {
    setExercises((list) => [...list, { name: '', sets: 3, reps: 10, weight_kg: 0, section: 'strength' }])
  }
  function removeExerciseRow(i) {
    setExercises((list) => list.filter((_, j) => j !== i))
  }

  async function save() {
    if (!name.trim()) return showToast('תן שם לאימון')
    setSaving(true)
    const cleanExercises = showExercises
      ? exercises
          .filter((ex) => ex.name.trim())
          .map((ex) => ({
            name: ex.name.trim(),
            sets: +ex.sets || 0,
            reps: +ex.reps || 0,
            weight_kg: +ex.weight_kg || 0,
            actual_weight_kg: +ex.weight_kg || 0,
            ...(isCrossfit ? { section: ex.section } : {}),
          }))
      : []
    const { error } = await supabase.from('workout_log').insert({
      user_id: user.id,
      date: todayISO(),
      workout_name: name.trim(),
      workout_type: type,
      workout_variant: variant,
      exercises_json: cleanExercises,
      duration_min: +duration || null,
      calories_burned: calories,
      completed: true,
    })
    setSaving(false)
    if (error) return showToast('שגיאה בשמירה 😕')
    showToast('האימון נשמר בהיסטוריה! 🎉')
    onAdded()
  }

  return (
    <section className="card fade-up fade-up-2 flex flex-col gap-4">
      <div>
        <label className="label-muted block mb-1.5">סוג אימון</label>
        <div className="grid grid-cols-2 gap-2">
          {DISCIPLINES.map((d) => (
            <button
              key={d.key}
              onClick={() => pickType(d.key)}
              className="card-2 p-2.5 text-sm font-bold flex items-center gap-2 justify-center transition-all"
              style={
                type === d.key
                  ? { borderColor: 'var(--lime-border)', background: 'var(--lime-dim)', color: 'var(--lime)' }
                  : { color: 'var(--muted)' }
              }
            >
              <span className="text-lg">{d.emoji}</span>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {variantOpts.length > 0 && (
        <div>
          <label className="label-muted block mb-1.5">{DISCIPLINE_VARIANT[type].label}</label>
          <div className="flex gap-2 flex-wrap">
            {variantOpts.map((o) => (
              <button key={o.key} onClick={() => setVariant(o.key)} className={`chip ${variant === o.key ? 'active' : ''}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="label-muted block mb-1.5">שם האימון</label>
        <input
          className="input-dark"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isGym ? 'לדוגמה: חזה + יד אחורית' : 'לדוגמה: שיעור יוגה בוקר'}
        />
      </div>

      <div className="flex items-end gap-3">
        <div>
          <label className="label-muted block mb-1.5">משך (דקות)</label>
          <input
            className="input-dark !w-28"
            type="number"
            min={1}
            max={300}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 pb-2.5" style={{ color: 'var(--orange)' }}>
          <Flame size={16} />
          <span className="font-bold text-sm">~{calories} קק"ל</span>
        </div>
      </div>

      {showExercises && (
        <div>
          <label className="label-muted block mb-1.5">
            {isCrossfit ? 'תרגילים - חלק לפי כוח / אירובי / מטקון' : 'תרגילים'}
          </label>
          <div className="flex flex-col gap-2">
            {exercises.map((ex, i) => (
              <div key={i} className="card-2 p-2.5 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    className="input-dark !py-1.5 !px-3 !text-sm flex-1"
                    value={ex.name}
                    onChange={(e) => updateExercise(i, 'name', e.target.value)}
                    placeholder={`תרגיל ${i + 1}`}
                  />
                  {exercises.length > 1 && (
                    <button onClick={() => removeExerciseRow(i)} aria-label="הסר תרגיל">
                      <Trash2 size={16} style={{ color: 'var(--muted)' }} />
                    </button>
                  )}
                </div>
                {isCrossfit && (
                  <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
                    {CROSSFIT_SECTIONS.map((s) => (
                      <button
                        key={s.key}
                        onClick={() => updateExercise(i, 'section', s.key)}
                        className={`chip !px-2.5 !py-1 ${ex.section === s.key ? 'active' : ''}`}
                        style={{ fontSize: 11 }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <NumField label={isCrossfit ? 'סבבים' : 'סטים'} value={ex.sets} onChange={(v) => updateExercise(i, 'sets', v)} />
                  <NumField label="חזרות" value={ex.reps} onChange={(v) => updateExercise(i, 'reps', v)} />
                  <NumField label='ק"ג' value={ex.weight_kg} onChange={(v) => updateExercise(i, 'weight_kg', v)} />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={addExerciseRow}
            className="btn-ghost !py-2 text-sm mt-2 flex items-center justify-center gap-1.5"
            style={{ color: 'var(--lime)', borderColor: 'var(--lime-border)' }}
          >
            <Plus size={15} /> הוסף תרגיל
          </button>
        </div>
      )}

      <button className="btn-primary flex items-center justify-center gap-1.5" onClick={save} disabled={saving}>
        <Plus size={17} />
        {saving ? 'שומר...' : 'שמור אימון'}
      </button>
    </section>
  )
}

function NumField({ label, value, onChange }) {
  return (
    <div className="flex-1">
      <label className="label-muted block mb-0.5 text-center" style={{ fontSize: 11 }}>
        {label}
      </label>
      <input
        type="number"
        className="input-dark !py-1.5 !px-2 !text-sm text-center w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

/* ───────────────────────── Tab 4: History ───────────────────────── */

function HistoryTab({ user, profile, showToast }) {
  const [logs, setLogs] = useState(null)
  const [editing, setEditing] = useState(null) 
  const [busy, setBusy] = useState(false)

  async function load() {
    const { data } = await supabase
      .from('workout_log')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(20)
    setLogs(data || [])
  }
  useEffect(() => {
    if (user) load()
  }, [user])

  async function saveEdit(data) {
    setBusy(true)
    const { error } = await supabase
      .from('workout_log')
      .update({
        workout_name: data.workout_name,
        workout_type: data.workout_type,
        workout_variant: data.workout_variant || null,
        exercises_json: data.exercises || [],
        duration_min: data.duration_min,
        calories_burned: data.calories_burned,
      })
      .eq('id', editing.id)
    setBusy(false)
    if (error) return showToast('שגיאה בעדכון 😕')
    setEditing(null)
    showToast('האימון עודכן ✅')
    load()
  }

  if (!logs)
    return (
      <div className="flex justify-center py-12">
        <div className="spinner" />
      </div>
    )

  if (editing) {
    return (
      <WorkoutEditor
        mode="log"
        profile={profile}
        busy={busy}
        initial={editing}
        onSave={saveEdit}
        onClose={() => setEditing(null)}
      />
    )
  }

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
      <p className="label-muted text-sm fade-up">הקש על אימון כדי לצפות ולערוך אותו בדיעבד ✏️</p>
      {logs.map((log, i) => (
        <button
          key={log.id}
          onClick={() => setEditing(log)}
          className={`card !py-3.5 fade-up fade-up-${Math.min(i + 1, 6)} flex items-center gap-3 text-right w-full`}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg"
            style={{ background: 'var(--lime-dim)', border: '1px solid var(--lime-border)' }}
          >
            {DISCIPLINE_EMOJI[log.workout_type] || <Dumbbell size={17} style={{ color: 'var(--lime)' }} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{log.workout_name}</p>
            <p className="label-muted" style={{ fontSize: 12 }}>
              {hebrewShortDate(log.date)}
              {log.workout_type ? ` · ${DISCIPLINE_LABELS[log.workout_type] || log.workout_type}` : ''}
              {log.workout_variant ? ` (${variantLabel(log.workout_type, log.workout_variant)})` : ''}
              {log.duration_min ? ` · ${log.duration_min} דק׳` : ''}
              {(log.exercises_json || []).length > 0 ? ` · ${log.exercises_json.length} תרגילים` : ''}
              {log.calories_burned ? ` · 🔥 ${Math.round(log.calories_burned)} קק"ל` : ''}
            </p>
          </div>
          <Pencil size={15} style={{ color: 'var(--muted)' }} className="shrink-0" />
        </button>
      ))}
    </div>
  )
}

/* ───────────────────────── Tab 4: Exercise Library ───────────────────────── */

function LibraryTab({ profile }) {
  const [discipline, setDiscipline] = useState(profile?.workout_type || 'gym')
  const [muscle, setMuscle] = useState('all') 

  const isGym = discipline === 'gym'
  const pool = isGym ? exerciseLibrary : disciplineMovements.filter((m) => m.muscle_group === discipline)
  const list = isGym && muscle !== 'all' ? pool.filter((e) => e.muscle_group === muscle) : pool

  function badgeFor(ex) {
    if (isGym) return MUSCLE_GROUPS.find((m) => m.key === ex.muscle_group)?.label
    return DISCIPLINE_LABELS[discipline]
  }

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 fade-up fade-up-2" style={{ scrollbarWidth: 'none' }}>
        {DISCIPLINES.map((d) => (
          <button
            key={d.key}
            className={`chip ${discipline === d.key ? 'active' : ''}`}
            onClick={() => {
              setDiscipline(d.key)
              setMuscle('all')
            }}
          >
            {d.emoji} {d.label}
          </button>
        ))}
      </div>

      {isGym && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 fade-up fade-up-2" style={{ scrollbarWidth: 'none' }}>
          <button className={`chip ${muscle === 'all' ? 'active' : ''}`} onClick={() => setMuscle('all')}>
            הכל
          </button>
          {MUSCLE_GROUPS.map((mg) => (
            <button key={mg.key} className={`chip ${muscle === mg.key ? 'active' : ''}`} onClick={() => setMuscle(mg.key)}>
              {mg.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {list.map((ex, i) => (
          <section key={ex.name} className={`card !py-3.5 fade-up fade-up-${Math.min((i % 6) + 1, 6)}`}>
            <div className="flex items-center justify-between mb-1">
              <p className="font-bold text-sm">{ex.name}</p>
              <span
                className="text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0"
                style={{ background: 'var(--lime-dim)', color: 'var(--lime)', border: '1px solid var(--lime-border)' }}
              >
                {badgeFor(ex)}
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

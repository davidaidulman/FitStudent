import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { calcAllTargets, ACTIVITY_LEVELS } from '../utils/nutrition'
import { generateWorkoutPlan } from '../services/ai'
import { DISCIPLINES } from '../data/mockData'

const BODY_TYPES = [
  { value: 'ecto', label: 'אקטומורף', emoji: '🪶', desc: 'רזה, מתקשה לעלות במשקל' },
  { value: 'meso', label: 'מזומורף', emoji: '💪', desc: 'אתלטי, בונה שריר בקלות' },
  { value: 'endo', label: 'אנדומורף', emoji: '🐻', desc: 'מבנה רחב, עולה במשקל בקלות' },
]

const GOALS = [
  { value: 'bulk', label: 'עליית מסה', emoji: '💪', desc: 'בניית שריר עם עודף קלורי מבוקר (300+ קק"ל)' },
  { value: 'cut', label: 'חיטוב', emoji: '🔥', desc: 'ירידה בשומן עם שמירה על שריר (500- קק"ל)' },
  { value: 'maintain', label: 'שמירה', emoji: '⚖️', desc: 'שמירה על המשקל הנוכחי והרכב הגוף' },
]

const EXPERIENCE = [
  { value: 'beginner', label: 'מתחיל', desc: 'עד שנה' },
  { value: 'intermediate', label: 'ביניים', desc: '1-3 שנים' },
  { value: 'advanced', label: 'מתקדם', desc: '3+ שנים' },
]

const DIET_OPTIONS = [
  { value: 'vegetarian', label: '🥦 צמחוני' },
  { value: 'vegan', label: '🌱 טבעוני' },
  { value: 'gluten_free', label: '🌾 ללא גלוטן' },
  { value: 'kosher', label: '✡️ כשר' },
]

const STEP_TITLES = ['פרטים אישיים', 'נתוני גוף', 'מטרה ופעילות', 'העדפות תזונה']

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    nickname: '',
    age: '',
    gender: 'male',
    height_cm: '',
    weight_kg: '',
    target_weight_kg: '',
    body_type: 'meso',
    goal: 'maintain',
    activity_level: 'moderate',
    workouts_per_week: 3,
    experience: 'beginner',
    workout_type: 'gym',
    dietary_restrictions: [],
    allergies: '',
  })

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const stepValid = [
    form.nickname.trim() && +form.age >= 14 && +form.age <= 99,
    +form.height_cm >= 120 && +form.weight_kg >= 35 && +form.target_weight_kg >= 35,
    true,
    true,
  ][step]

  async function finish() {
    setBusy(true)
    setError(null)
    try {
      const numeric = {
        age: +form.age,
        height_cm: +form.height_cm,
        weight_kg: +form.weight_kg,
        target_weight_kg: +form.target_weight_kg,
        workouts_per_week: +form.workouts_per_week,
      }
      const targets = calcAllTargets({ ...form, ...numeric })

      const restrictions = [...form.dietary_restrictions]
      if (form.allergies.trim()) restrictions.push(`אלרגיות: ${form.allergies.trim()}`)

      const { error: userErr } = await supabase.from('users').upsert({
        id: user.id,
        nickname: form.nickname.trim(),
        gender: form.gender,
        body_type: form.body_type,
        goal: form.goal,
        activity_level: form.activity_level,
        experience: form.experience,
        workout_type: form.workout_type,
        dietary_restrictions: restrictions,
        ...numeric,
        ...targets,
      })
      if (userErr) throw userErr

      // initial weight point for the progress graph
      await supabase.from('weight_log').insert({ user_id: user.id, weight_kg: numeric.weight_kg })

      // PHASE 2: this becomes Make.com Scenario E → Gemini-generated plan
      const plan = await generateWorkoutPlan({ ...form, ...numeric })
      await supabase.from('workout_plan').delete().eq('user_id', user.id)
      const { error: planErr } = await supabase.from('workout_plan').insert(
        plan.map((day) => ({
          user_id: user.id,
          day_of_week: day.day_of_week,
          workout_name: day.workout_name,
          muscle_groups: day.muscle_groups,
          exercises_json: day.exercises,
          workout_type: day.workout_type,
          workout_variant: day.workout_variant,
        }))
      )
      if (planErr) throw planErr

      await refreshProfile()
      navigate('/home')
    } catch (err) {
      setError(err.message || 'שגיאה בשמירה - נסה שוב')
    } finally {
      setBusy(false)
    }
  }
// מסך הטעינה שיוצג בזמן שה-AI בונה את התוכנית
  if (busy) {
    return (
      <div className="min-h-dvh px-5 py-8 flex flex-col items-center justify-center text-center max-w-md mx-auto fade-up">
        <div className="text-7xl mb-6 animate-pulse" style={{ animationDuration: '1.5s' }}>🧠</div>
        <h2 className="text-3xl font-black mb-3">ה-AI בפעולה...</h2>
        <p className="label-muted text-lg mb-8 leading-relaxed">
          אנחנו מנתחים את הנתונים שלך, מחשבים את המאקרוס, ומרכיבים עבורך תוכנית אימונים מותאמת אישית.
          <br /><br />
          <span style={{ color: 'var(--lime)' }}>זה ייקח בערך 10-15 שניות, שווה לחכות! 🚀</span>
        </p>
      </div>
    )
  }
    <div className="min-h-dvh px-5 py-8 relative z-10 max-w-md mx-auto"></div>
  return (
    <div className="min-h-dvh px-5 py-8 relative z-10 max-w-md mx-auto">
      {/* progress header */}
      <div className="mb-6 fade-up">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-black">{STEP_TITLES[step]}</h1>
          <span className="label-muted">
            {step + 1} / 4
          </span>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full transition-all duration-300"
              style={{
                background: i <= step ? 'var(--lime)' : 'var(--bg-card-2)',
                boxShadow: i <= step ? '0 0 8px rgba(200,240,0,0.4)' : 'none',
              }}
            />
          ))}
        </div>
      </div>

      <div className="card fade-up fade-up-1 flex flex-col gap-4">
        {step === 0 && (
          <>
            <Field label="שם / כינוי">
              <input className="input-dark" value={form.nickname} onChange={(e) => set('nickname', e.target.value)} placeholder="איך לקרוא לך?" />
            </Field>
            <Field label="גיל">
              <input className="input-dark" type="number" value={form.age} onChange={(e) => set('age', e.target.value)} placeholder="לדוגמה: 24" />
            </Field>
            <Field label="מגדר (לחישוב BMR מדויק)">
              <div className="grid grid-cols-2 gap-2">
                <SelectCard active={form.gender === 'male'} onClick={() => set('gender', 'male')} emoji="👨" label="גבר" />
                <SelectCard active={form.gender === 'female'} onClick={() => set('gender', 'female')} emoji="👩" label="אישה" />
              </div>
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label='גובה (ס"מ)'>
                <input className="input-dark" type="number" value={form.height_cm} onChange={(e) => set('height_cm', e.target.value)} placeholder="178" />
              </Field>
              <Field label='משקל (ק"ג)'>
                <input className="input-dark" type="number" value={form.weight_kg} onChange={(e) => set('weight_kg', e.target.value)} placeholder="75" />
              </Field>
            </div>
            <Field label='משקל יעד (ק"ג)'>
              <input className="input-dark" type="number" value={form.target_weight_kg} onChange={(e) => set('target_weight_kg', e.target.value)} placeholder="80" />
            </Field>
            <Field label="סוג גוף">
              <div className="flex flex-col gap-2">
                {BODY_TYPES.map((bt) => (
                  <SelectCard
                    key={bt.value}
                    active={form.body_type === bt.value}
                    onClick={() => set('body_type', bt.value)}
                    emoji={bt.emoji}
                    label={bt.label}
                    desc={bt.desc}
                    row
                  />
                ))}
              </div>
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="המטרה שלי">
              <div className="flex flex-col gap-2">
                {GOALS.map((g) => (
                  <SelectCard
                    key={g.value}
                    active={form.goal === g.value}
                    onClick={() => set('goal', g.value)}
                    emoji={g.emoji}
                    label={g.label}
                    desc={g.desc}
                    row
                  />
                ))}
              </div>
            </Field>
            <Field label={`רמת פעילות: ${ACTIVITY_LEVELS.find((a) => a.value === form.activity_level)?.label}`}>
              <input
                type="range"
                min={0}
                max={4}
                value={ACTIVITY_LEVELS.findIndex((a) => a.value === form.activity_level)}
                onChange={(e) => set('activity_level', ACTIVITY_LEVELS[+e.target.value].value)}
              />
              <p className="label-muted mt-1">
                {ACTIVITY_LEVELS.find((a) => a.value === form.activity_level)?.desc}
              </p>
            </Field>
            <Field label={`אימונים בשבוע: ${form.workouts_per_week}`}>
              <input
                type="range"
                min={1}
                max={6}
                value={form.workouts_per_week}
                onChange={(e) => set('workouts_per_week', +e.target.value)}
              />
            </Field>
            <Field label="ניסיון באימונים">
              <div className="grid grid-cols-3 gap-2">
                {EXPERIENCE.map((ex) => (
                  <SelectCard
                    key={ex.value}
                    active={form.experience === ex.value}
                    onClick={() => set('experience', ex.value)}
                    label={ex.label}
                    desc={ex.desc}
                    small
                  />
                ))}
              </div>
            </Field>
            <Field label="סוג האימון המועדף (קובע את התוכנית שלך)">
              <div className="grid grid-cols-2 gap-2">
                {DISCIPLINES.map((d) => (
                  <SelectCard
                    key={d.key}
                    active={form.workout_type === d.key}
                    onClick={() => set('workout_type', d.key)}
                    emoji={d.emoji}
                    label={d.label}
                    desc={d.desc}
                    row
                  />
                ))}
              </div>
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <Field label="העדפות תזונה (לא חובה)">
              <div className="grid grid-cols-2 gap-2">
                {DIET_OPTIONS.map((opt) => {
                  const checked = form.dietary_restrictions.includes(opt.value)
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        set(
                          'dietary_restrictions',
                          checked
                            ? form.dietary_restrictions.filter((v) => v !== opt.value)
                            : [...form.dietary_restrictions, opt.value]
                        )
                      }
                      className="card-2 p-3 text-sm font-semibold text-right transition-all"
                      style={
                        checked
                          ? { borderColor: 'var(--lime-border)', background: 'var(--lime-dim)', color: 'var(--lime)' }
                          : { color: 'var(--muted)' }
                      }
                    >
                      {checked ? '✓ ' : ''}
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </Field>
            <Field label="אלרגיות (טקסט חופשי)">
              <input
                className="input-dark"
                value={form.allergies}
                onChange={(e) => set('allergies', e.target.value)}
                placeholder="לדוגמה: בוטנים, לקטוז..."
              />
            </Field>
            <div className="card-2 p-3 text-sm" style={{ color: 'var(--muted)' }}>
              בסיום נחשב עבורך BMR, TDEE, יעד קלורי ופירוט מאקרוס - ונבנה לך תוכנית אימונים
              שבועית מותאמת אישית. 🎯
            </div>
          </>
        )}

        {error && (
          <div className="text-sm font-semibold" style={{ color: '#FF8C8C' }}>
            {error}
          </div>
        )}

        <div className="flex gap-2 mt-2">
          {step > 0 && (
            <button className="btn-ghost flex items-center justify-center gap-1 !w-auto px-5" onClick={() => setStep(step - 1)}>
              <ChevronRight size={16} />
              חזרה
            </button>
          )}
          {step < 3 ? (
            <button className="btn-primary flex items-center justify-center gap-1" disabled={!stepValid} onClick={() => setStep(step + 1)}>
              המשך
              <ChevronLeft size={16} />
            </button>
          ) : (
            <button className="btn-primary" disabled={busy} onClick={finish}>
              {busy ? 'בונה את התוכנית שלך...' : '🚀 סיום והתחלה'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label-muted block mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function SelectCard({ active, onClick, emoji, label, desc, row, small }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`card-2 transition-all text-right ${row ? 'flex items-center gap-3 p-3' : small ? 'p-2.5 text-center' : 'p-3 text-center'}`}
      style={
        active
          ? { borderColor: 'var(--lime-border)', background: 'var(--lime-dim)', boxShadow: '0 0 16px rgba(200,240,0,0.12)' }
          : {}
      }
    >
      {emoji && <span className={row ? 'text-2xl' : 'text-2xl block mb-1'}>{emoji}</span>}
      <span className={small ? 'block' : ''}>
        <span className="font-bold text-sm block" style={{ color: active ? 'var(--lime)' : 'var(--text)' }}>
          {label}
        </span>
        {desc && (
          <span className="text-xs block mt-0.5" style={{ color: 'var(--muted)' }}>
            {desc}
          </span>
        )}
      </span>
    </button>
  )
}

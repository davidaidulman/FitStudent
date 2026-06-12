import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Pencil, Save, LogOut, Trash2, Shield, Send, Droplets, Sun, Moon, SunMoon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import SubTabs from '../components/SubTabs'
import { calcAllTargets, ACTIVITY_LEVELS } from '../utils/nutrition'
import { hebrewShortDate } from '../utils/dates'

const TABS = [
  { key: 'profile', label: 'פרופיל' },
  { key: 'goals', label: 'יעדים' },
  { key: 'settings', label: 'הגדרות' },
]

const GOAL_LABELS = { bulk: '💪 עליית מסה', cut: '🔥 חיטוב', maintain: '⚖️ שמירה' }
const BODY_LABELS = { ecto: 'אקטומורף', meso: 'מזומורף', endo: 'אנדומורף' }
const EXP_LABELS = { beginner: 'מתחיל', intermediate: 'ביניים', advanced: 'מתקדם' }

export default function Profile() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'profile'
  const { user, profile, refreshProfile, signOut } = useAuth()
  const { toast, showToast } = useToast()
  const navigate = useNavigate()

  return (
    <div className="px-4 pt-6 pb-20 flex flex-col gap-4 relative z-10">
      <header className="fade-up flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-black glow-lime"
          style={{ background: 'var(--lime)', color: 'var(--on-accent)' }}
        >
          {(profile?.nickname || '?')[0]}
        </div>
        <div>
          <h1 className="text-2xl font-black">{profile?.nickname}</h1>
          <p className="label-muted text-sm">{user?.email}</p>
        </div>
      </header>

      <div className="fade-up fade-up-1">
        <SubTabs tabs={TABS} active={tab} onChange={(t) => setParams({ tab: t })} />
      </div>

      {tab === 'profile' && <ProfileTab user={user} profile={profile} refreshProfile={refreshProfile} showToast={showToast} />}
      {tab === 'goals' && <GoalsTab user={user} profile={profile} refreshProfile={refreshProfile} showToast={showToast} />}
      {tab === 'settings' && <SettingsTab user={user} profile={profile} signOut={signOut} navigate={navigate} showToast={showToast} refreshProfile={refreshProfile} />}

      {toast}
    </div>
  )
}

/* ───────────────────────── Tab 1: Profile ───────────────────────── */

const EDITABLE_FIELDS = [
  { key: 'nickname', label: 'כינוי', type: 'text' },
  { key: 'age', label: 'גיל', type: 'number' },
  { key: 'height_cm', label: 'גובה (ס"מ)', type: 'number' },
  { key: 'target_weight_kg', label: 'משקל יעד (ק"ג)', type: 'number' },
  { key: 'workouts_per_week', label: 'אימונים בשבוע', type: 'number' },
]

function ProfileTab({ user, profile, refreshProfile, showToast }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [newWeight, setNewWeight] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (profile) setForm(profile)
  }, [profile])

  async function saveEdits() {
    setBusy(true)
    const updates = Object.fromEntries(
      EDITABLE_FIELDS.map((f) => [f.key, f.type === 'number' ? +form[f.key] || null : form[f.key]])
    )
    // recalc targets since age/height may have changed
    const merged = { ...profile, ...updates }
    const targets = calcAllTargets(merged)
    const { error } = await supabase.from('users').update({ ...updates, ...targets }).eq('id', user.id)
    setBusy(false)
    if (error) return showToast('שגיאה בשמירה 😕')
    setEditing(false)
    showToast('הפרופיל עודכן ✅')
    refreshProfile()
  }

  async function logWeight() {
    if (!newWeight || +newWeight < 30) return
    setBusy(true)
    await supabase.from('weight_log').insert({ user_id: user.id, weight_kg: +newWeight })
    const merged = { ...profile, weight_kg: +newWeight }
    const targets = calcAllTargets(merged)
    const { error } = await supabase.from('users').update({ weight_kg: +newWeight, ...targets }).eq('id', user.id)
    setBusy(false)
    if (error) return showToast('שגיאה בעדכון 😕')
    setNewWeight('')
    showToast('המשקל עודכן! ⚖️')
    refreshProfile()
  }

  if (!profile) return null

  return (
    <>
      <section className="card fade-up fade-up-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">הפרטים שלי</h2>
          <button
            onClick={() => (editing ? saveEdits() : setEditing(true))}
            disabled={busy}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'var(--lime-dim)', border: '1px solid var(--lime-border)' }}
          >
            {editing ? <Save size={16} style={{ color: 'var(--lime)' }} /> : <Pencil size={15} style={{ color: 'var(--lime)' }} />}
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {EDITABLE_FIELDS.map((f) => (
            <div key={f.key} className="flex items-center justify-between gap-3">
              <span className="label-muted">{f.label}</span>
              {editing ? (
                <input
                  className="input-dark !py-1.5 !px-3 !text-sm !w-32 text-center"
                  type={f.type}
                  value={form[f.key] ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                />
              ) : (
                <span className="font-bold text-sm">{profile[f.key]}</span>
              )}
            </div>
          ))}
          <ReadonlyRow label="מגדר" value={profile.gender === 'male' ? 'גבר' : 'אישה'} />
          <ReadonlyRow label="סוג גוף" value={BODY_LABELS[profile.body_type]} />
          <ReadonlyRow label="מטרה" value={GOAL_LABELS[profile.goal]} />
          <ReadonlyRow label="רמת פעילות" value={ACTIVITY_LEVELS.find((a) => a.value === profile.activity_level)?.label} />
          <ReadonlyRow label="ניסיון" value={EXP_LABELS[profile.experience]} />
          {(profile.dietary_restrictions || []).length > 0 && (
            <ReadonlyRow label="העדפות תזונה" value={(profile.dietary_restrictions || []).join(', ')} />
          )}
        </div>
      </section>

      <section className="card fade-up fade-up-3">
        <h2 className="section-title mb-1">עדכון משקל ⚖️</h2>
        <p className="label-muted text-sm mb-3">
          משקל נוכחי: <b style={{ color: 'var(--text)' }}>{profile.weight_kg} ק"ג</b> · יעד:{' '}
          <b style={{ color: 'var(--lime)' }}>{profile.target_weight_kg} ק"ג</b>
        </p>
        <div className="flex gap-2">
          <input
            className="input-dark"
            type="number"
            step="0.1"
            placeholder='משקל חדש בק"ג'
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
          />
          <button className="btn-primary !w-auto px-5" onClick={logWeight} disabled={busy || !newWeight}>
            עדכן
          </button>
        </div>
      </section>
    </>
  )
}

function ReadonlyRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="label-muted">{label}</span>
      <span className="font-bold text-sm">{value}</span>
    </div>
  )
}

/* ───────────────────────── Tab 2: Goals ───────────────────────── */

function GoalsTab({ user, profile, refreshProfile, showToast }) {
  const [weights, setWeights] = useState([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('weight_log')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at')
      .then(({ data }) => setWeights(data || []))
  }, [user, profile])

  async function switchGoal(goal) {
    if (goal === profile.goal) return
    setBusy(true)
    const targets = calcAllTargets({ ...profile, goal })
    const { error } = await supabase.from('users').update({ goal, ...targets }).eq('id', user.id)
    setBusy(false)
    if (error) return showToast('שגיאה בעדכון 😕')
    showToast(`המטרה עודכנה: ${GOAL_LABELS[goal]}`)
    refreshProfile()
  }

  const chartData = weights.map((w) => ({
    date: hebrewShortDate(w.logged_at),
    weight: +w.weight_kg,
  }))

  if (!profile) return null

  return (
    <>
      <section className="card fade-up fade-up-2">
        <h2 className="section-title mb-3">היעדים היומיים שלי 🎯</h2>
        <div className="grid grid-cols-2 gap-2.5">
          <TargetCard value={Math.round(profile.calorie_target)} label='קלוריות (קק"ל)' color="var(--lime)" />
          <TargetCard value={`${Math.round(profile.protein_target_g)}g`} label="חלבון" color="var(--blue)" />
          <TargetCard value={`${Math.round(profile.carbs_target_g)}g`} label="פחמימות" color="var(--orange)" />
          <TargetCard value={`${Math.round(profile.fat_target_g)}g`} label="שומן" color="var(--purple)" />
        </div>
        <p className="label-muted mt-3" style={{ fontSize: 12 }}>
          BMR: {Math.round(profile.bmr)} · TDEE: {Math.round(profile.tdee)} קק"ל (נוסחת Mifflin-St Jeor)
        </p>
      </section>

      <section className="card fade-up fade-up-3">
        <h2 className="section-title mb-3">שינוי מטרה</h2>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(GOAL_LABELS).map(([goal, label]) => (
            <button
              key={goal}
              onClick={() => switchGoal(goal)}
              disabled={busy}
              className="card-2 p-3 text-center text-sm font-bold transition-all"
              style={
                profile.goal === goal
                  ? { borderColor: 'var(--lime-border)', background: 'var(--lime-dim)', color: 'var(--lime)', boxShadow: '0 0 14px rgba(200,240,0,0.12)' }
                  : { color: 'var(--muted)' }
              }
            >
              {label}
            </button>
          ))}
        </div>
        <p className="label-muted mt-2" style={{ fontSize: 12 }}>
          שינוי מטרה מחשב מחדש את כל היעדים אוטומטית
        </p>
      </section>

      <section className="card fade-up fade-up-4">
        <h2 className="section-title mb-3">גרף משקל 📉</h2>
        {chartData.length < 2 ? (
          <p className="label-muted text-sm py-4 text-center">
            עדכן משקל בלשונית הפרופיל כדי לראות את הגרף מתמלא
          </p>
        ) : (
          <div style={{ height: 170 }} dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
                  formatter={(v) => [`${v} ק"ג`, '']}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#C8F000"
                  strokeWidth={2.5}
                  dot={{ fill: '#C8F000', r: 3.5 }}
                  activeDot={{ r: 5, style: { filter: 'drop-shadow(0 0 6px rgba(200,240,0,0.7))' } }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </>
  )
}

function TargetCard({ value, label, color }) {
  return (
    <div className="card-2 p-3 text-center">
      <p className="text-xl font-extrabold" style={{ color }}>
        {value}
      </p>
      <p className="label-muted" style={{ fontSize: 12 }}>
        {label}
      </p>
    </div>
  )
}

/* ───────────────────────── Tab 3: Settings ───────────────────────── */

const THEME_OPTIONS = [
  { key: 'system', label: 'אוטומטי', Icon: SunMoon },
  { key: 'light', label: 'יום', Icon: Sun },
  { key: 'dark', label: 'לילה', Icon: Moon },
]

function SettingsTab({ user, profile, signOut, navigate, showToast, refreshProfile }) {
  const { mode, setMode } = useTheme()
  const [telegram, setTelegram] = useState(profile?.telegram_id || '')
  const [waterL, setWaterL] = useState(((+profile?.water_target_ml || 2500) / 1000).toFixed(1))
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)

  async function saveWaterTarget() {
    const ml = Math.round(parseFloat(waterL) * 1000)
    if (!ml || ml < 500 || ml > 8000) return showToast('בחר יעד בין 0.5 ל-8 ליטר')
    setBusy(true)
    const { error } = await supabase.from('users').update({ water_target_ml: ml }).eq('id', user.id)
    setBusy(false)
    if (error) return showToast('שגיאה בשמירה 😕')
    showToast('יעד המים עודכן 💧')
    refreshProfile()
  }

  async function saveTelegram() {
    setBusy(true)
    // PHASE 2: also POST to Make.com to register the daily Telegram reports
    const { error } = await supabase.from('users').update({ telegram_id: telegram.trim() }).eq('id', user.id)
    setBusy(false)
    if (error) return showToast('שגיאה בשמירה 😕')
    showToast('Telegram עודכן ✈️')
    refreshProfile()
  }

  async function deleteAccount() {
    setBusy(true)
    // FK cascade wipes food_log / workout_log / workout_plan / weight_log
    await supabase.from('users').delete().eq('id', user.id)
    await signOut()
    navigate('/login')
  }

  async function logout() {
    await signOut()
    navigate('/login')
  }

  return (
    <>
      <section className="card fade-up fade-up-2">
        <h2 className="section-title mb-1 flex items-center gap-2">
          <SunMoon size={17} style={{ color: 'var(--lime)' }} />
          מראה האפליקציה
        </h2>
        <p className="label-muted text-sm mb-3">"אוטומטי" מתאים את עצמו למצב יום/לילה של הטלפון</p>
        <div className="grid grid-cols-3 gap-2">
          {THEME_OPTIONS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className="card-2 p-3 flex flex-col items-center gap-1.5 text-sm font-bold transition-all"
              style={
                mode === key
                  ? { borderColor: 'var(--lime-border)', background: 'var(--lime-dim)', color: 'var(--lime)' }
                  : { color: 'var(--muted)' }
              }
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="card fade-up fade-up-2">
        <h2 className="section-title mb-1 flex items-center gap-2">
          <Droplets size={17} style={{ color: 'var(--teal)' }} />
          יעד מים יומי
        </h2>
        <p className="label-muted text-sm mb-3">
          כמה מים אתה רוצה לשתות ביום? (מומלץ 2–3 ליטר) — מתעדכן במסך הבית
        </p>
        <div className="flex gap-2">
          <input
            className="input-dark"
            type="number"
            step="0.1"
            min="0.5"
            max="8"
            value={waterL}
            onChange={(e) => setWaterL(e.target.value)}
          />
          <span className="label-muted shrink-0 self-center">ליטר</span>
          <button className="btn-primary !w-auto px-5" onClick={saveWaterTarget} disabled={busy}>
            שמור
          </button>
        </div>
      </section>

      <section className="card fade-up fade-up-3">
        <h2 className="section-title mb-1 flex items-center gap-2">
          <Send size={17} style={{ color: 'var(--blue)' }} />
          Telegram
        </h2>
        <p className="label-muted text-sm mb-3">
          חבר את חשבון הטלגרם שלך לקבלת דוח בוקר (07:00) והתראת ערב (20:00) — יופעל בשלב 2
        </p>
        <div className="flex gap-2">
          <input
            className="input-dark"
            dir="ltr"
            style={{ textAlign: 'left' }}
            placeholder="@username"
            value={telegram}
            onChange={(e) => setTelegram(e.target.value)}
          />
          <button className="btn-primary !w-auto px-5" onClick={saveTelegram} disabled={busy}>
            שמור
          </button>
        </div>
      </section>

      <section className="card fade-up fade-up-3">
        <h2 className="section-title mb-2 flex items-center gap-2">
          <Shield size={17} style={{ color: 'var(--teal)' }} />
          פרטיות
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
          הנתונים שלך (פרופיל, יומן תזונה, אימונים ומשקל) נשמרים במסד נתונים מאובטח (Supabase)
          וגלויים רק לך — כל משתמש רואה אך ורק את המידע של עצמו. בשלב 2, תמונות ארוחות יישלחו
          לניתוח AI חיצוני (Claude Vision) ונתוני תזונה לאימות (Perplexity). ניתן למחוק את החשבון
          וכל הנתונים בכל רגע בכפתור למטה.
        </p>
      </section>

      <section className="card fade-up fade-up-4 flex flex-col gap-2.5">
        <button className="btn-ghost flex items-center justify-center gap-2" onClick={logout}>
          <LogOut size={16} />
          התנתקות
        </button>

        {confirmDelete ? (
          <div
            className="rounded-xl p-3 flex flex-col gap-2"
            style={{ background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.3)' }}
          >
            <p className="text-sm font-bold" style={{ color: '#FF8C8C' }}>
              בטוח? כל הנתונים יימחקו לצמיתות ללא אפשרות שחזור.
            </p>
            <div className="flex gap-2">
              <button
                className="btn-ghost !py-2 text-sm"
                style={{ color: '#FF8C8C', borderColor: 'rgba(255,77,77,0.4)' }}
                onClick={deleteAccount}
                disabled={busy}
              >
                {busy ? 'מוחק...' : 'כן, מחק הכל'}
              </button>
              <button className="btn-ghost !py-2 text-sm" onClick={() => setConfirmDelete(false)}>
                ביטול
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn-ghost flex items-center justify-center gap-2"
            style={{ color: '#FF8C8C', borderColor: 'rgba(255,77,77,0.25)' }}
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 size={16} />
            מחיקת חשבון
          </button>
        )}
      </section>

      <p className="label-muted text-center" style={{ fontSize: 11 }}>
        FitStudent Alpha · קבוצה 42 · יסודות מערכות מידע · BGU תשפ"ו
      </p>
    </>
  )
}

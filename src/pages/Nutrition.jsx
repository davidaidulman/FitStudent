import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Camera, Trash2, Refrigerator, BookmarkPlus, Clock, Users, Wallet, Pencil, Plus, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { analyzeFoodImage, generateRecipeFromFridge } from '../services/ai'
import { useToast } from '../components/Toast'
import SubTabs from '../components/SubTabs'
import { COMMON_FOODS } from '../data/mockData'
import { todayISO } from '../utils/dates'

const TABS = [
  { key: 'diary', label: 'יומן' },
  { key: 'log', label: 'צלם ארוחה' },
  { key: 'fridge', label: 'מקרר → מתכון' },
  { key: 'saved', label: 'מתכונים שמורים' },
]

const MEAL_TYPES = [
  { key: 'breakfast', label: 'בוקר', emoji: '🌅' },
  { key: 'lunch', label: 'צהריים', emoji: '☀️' },
  { key: 'dinner', label: 'ערב', emoji: '🌙' },
  { key: 'snack', label: 'חטיף', emoji: '🍎' },
]

export default function Nutrition() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'diary'
  const { toast, showToast } = useToast()
  const { user, profile } = useAuth()
  const [diary, setDiary] = useState([])

  async function loadDiary() {
    if (!user) return
    const { data } = await supabase
      .from('food_log')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', todayISO())
      .order('created_at')
    setDiary(data || [])
  }

  useEffect(() => {
    loadDiary()
  }, [user])

  return (
    <div className="px-4 pt-6 pb-20 flex flex-col gap-4 relative z-10">
      <header className="fade-up">
        <h1 className="text-2xl font-black">🍎 תזונה</h1>
      </header>
      <div className="fade-up fade-up-1">
        <SubTabs tabs={TABS} active={tab} onChange={(t) => setParams({ tab: t })} />
      </div>

      {tab === 'diary' && <DiaryTab diary={diary} reload={loadDiary} profile={profile} showToast={showToast} />}
      {tab === 'log' && <LogMealTab user={user} onAdded={loadDiary} showToast={showToast} />}
      {tab === 'fridge' && <FridgeTab showToast={showToast} />}
      {tab === 'saved' && <SavedTab />}

      {toast}
    </div>
  )
}

/* ───────────────────────── Tab 1: Diary ───────────────────────── */

function DiaryTab({ diary, reload, profile, showToast }) {
  const totals = diary.reduce(
    (a, l) => ({
      calories: a.calories + (+l.calories || 0),
      protein: a.protein + (+l.protein_g || 0),
      carbs: a.carbs + (+l.carbs_g || 0),
      fat: a.fat + (+l.fat_g || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  return (
    <>
      {MEAL_TYPES.map((mt, i) => {
        const entries = diary.filter((l) => l.meal_type === mt.key)
        return (
          <section key={mt.key} className={`card fade-up fade-up-${i + 2}`}>
            <h2 className="font-bold mb-2">
              {mt.emoji} {mt.label}
            </h2>
            {entries.length === 0 ? (
              <p className="label-muted text-sm">עדיין לא נרשם כלום — צלם ארוחה כדי להוסיף 📷</p>
            ) : (
              <div className="flex flex-col gap-2">
                {entries.map((entry) => (
                  <DiaryEntry key={entry.id} entry={entry} reload={reload} showToast={showToast} />
                ))}
              </div>
            )}
          </section>
        )
      })}

      {/* daily totals bar */}
      <section className="card fade-up fade-up-6 glow-lime" style={{ borderColor: 'var(--lime-border)' }}>
        <h2 className="font-bold mb-2" style={{ color: 'var(--lime)' }}>
          סה"כ היום
        </h2>
        <div className="grid grid-cols-4 gap-2 text-center">
          <TotalStat value={Math.round(totals.calories)} label='קק"ל' target={profile?.calorie_target} color="var(--lime)" />
          <TotalStat value={Math.round(totals.protein)} label="חלבון" target={profile?.protein_target_g} color="var(--blue)" />
          <TotalStat value={Math.round(totals.carbs)} label="פחמימות" target={profile?.carbs_target_g} color="var(--orange)" />
          <TotalStat value={Math.round(totals.fat)} label="שומן" target={profile?.fat_target_g} color="var(--purple)" />
        </div>
      </section>
    </>
  )
}

function TotalStat({ value, label, target, color }) {
  return (
    <div>
      <p className="text-lg font-extrabold" style={{ color }}>
        {value}
      </p>
      <p className="label-muted" style={{ fontSize: 11 }}>
        {label}
        {target ? ` / ${Math.round(target)}` : ''}
      </p>
    </div>
  )
}

function DiaryEntry({ entry, reload, showToast }) {
  const items = entry.items_json || []
  const name = items.map((it) => it.name).join(' + ') || 'ארוחה'
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    name,
    calories: Math.round(entry.calories),
    protein_g: Math.round(entry.protein_g),
    carbs_g: Math.round(entry.carbs_g),
    fat_g: Math.round(entry.fat_g),
  })

  async function remove() {
    await supabase.from('food_log').delete().eq('id', entry.id)
    showToast('הארוחה נמחקה 🗑️')
    reload()
  }

  async function saveEdit() {
    if (!form.name.trim()) return showToast('הזן שם מאכל')
    setBusy(true)
    const { error } = await supabase
      .from('food_log')
      .update({
        items_json: [{ name: form.name.trim() }],
        calories: Math.round(+form.calories || 0),
        protein_g: Math.round(+form.protein_g || 0),
        carbs_g: Math.round(+form.carbs_g || 0),
        fat_g: Math.round(+form.fat_g || 0),
      })
      .eq('id', entry.id)
    setBusy(false)
    if (error) return showToast('שגיאה בעדכון 😕')
    setEditing(false)
    showToast('הארוחה עודכנה ✅')
    reload()
  }

  if (editing) {
    return (
      <div className="card-2 p-3 flex flex-col gap-2">
        <input
          className="input-dark !py-1.5 !px-3 !text-sm"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <div className="grid grid-cols-4 gap-2">
          <ManualField label='קק"ל' value={form.calories} onChange={(v) => setForm((f) => ({ ...f, calories: v }))} />
          <ManualField label="חלבון" value={form.protein_g} onChange={(v) => setForm((f) => ({ ...f, protein_g: v }))} />
          <ManualField label="פחמ׳" value={form.carbs_g} onChange={(v) => setForm((f) => ({ ...f, carbs_g: v }))} />
          <ManualField label="שומן" value={form.fat_g} onChange={(v) => setForm((f) => ({ ...f, fat_g: v }))} />
        </div>
        <div className="flex gap-2">
          <button className="btn-primary !py-2 text-sm" onClick={saveEdit} disabled={busy}>
            {busy ? 'שומר...' : 'שמור'}
          </button>
          <button className="btn-ghost !py-2 text-sm !w-auto px-4" onClick={() => setEditing(false)}>
            ביטול
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card-2 p-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{name}</p>
        <p className="label-muted" style={{ fontSize: 12 }}>
          🔥 {Math.round(entry.calories)} קק"ל ·{' '}
          <span style={{ color: 'var(--blue)' }}>💪 {Math.round(entry.protein_g)}g</span>
          {entry.confidence < 100 && ` · דיוק ${entry.confidence}%`}
        </p>
      </div>
      <button onClick={() => setEditing(true)} aria-label="ערוך">
        <Pencil size={16} style={{ color: 'var(--muted)' }} />
      </button>
      <button onClick={remove} aria-label="מחק">
        <Trash2 size={17} style={{ color: 'var(--muted)' }} />
      </button>
    </div>
  )
}

/* ───────────────────────── Tab 2: Log Meal ───────────────────────── */

function emptyManual() {
  return { name: '', calories: '', protein_g: '', carbs_g: '', fat_g: '' }
}

function LogMealTab({ user, onAdded, showToast }) {
  const fileRef = useRef(null)
  const [phase, setPhase] = useState('idle') // idle | analyzing | result | manual
  const [result, setResult] = useState(null)
  const [quantity, setQuantity] = useState(100) // percent
  const [mealType, setMealType] = useState('lunch')
  const [saving, setSaving] = useState(false)
  const [manual, setManual] = useState(emptyManual())

  async function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhase('analyzing')
    // PHASE 2: convert file to base64 and POST to Make.com Scenario A
    const mock = await analyzeFoodImage(null)
    setResult(mock)
    setQuantity(100)
    setPhase('result')
    e.target.value = ''
  }

  async function addToDiary() {
    setSaving(true)
    const factor = quantity / 100
    const { error } = await supabase.from('food_log').insert({
      user_id: user.id,
      date: todayISO(),
      meal_type: mealType,
      items_json: result.items,
      calories: Math.round(result.calories * factor),
      protein_g: Math.round(result.protein_g * factor),
      carbs_g: Math.round(result.carbs_g * factor),
      fat_g: Math.round(result.fat_g * factor),
      confidence: result.confidence,
    })
    setSaving(false)
    if (error) {
      showToast('שגיאה בשמירה 😕')
      return
    }
    showToast('נוסף ליומן! ✅')
    setPhase('idle')
    setResult(null)
    onAdded()
  }

  function startManual(prefill) {
    setManual(prefill || emptyManual())
    setPhase('manual')
  }

  async function saveManual() {
    if (!manual.name.trim()) return showToast('הזן שם מאכל')
    setSaving(true)
    const { error } = await supabase.from('food_log').insert({
      user_id: user.id,
      date: todayISO(),
      meal_type: mealType,
      items_json: [{ name: manual.name.trim() }],
      calories: Math.round(+manual.calories || 0),
      protein_g: Math.round(+manual.protein_g || 0),
      carbs_g: Math.round(+manual.carbs_g || 0),
      fat_g: Math.round(+manual.fat_g || 0),
      confidence: 100,
    })
    setSaving(false)
    if (error) return showToast('שגיאה בשמירה 😕')
    showToast('נוסף ליומן! ✅')
    setManual(emptyManual())
    setPhase('idle')
    onAdded()
  }

  return (
    <>
      {phase === 'idle' && (
        <>
          <section className="card fade-up fade-up-2 flex flex-col items-center py-8 gap-4">
            <button
              onClick={() => fileRef.current?.click()}
              className="w-24 h-24 rounded-full flex items-center justify-center glow-lime"
              style={{ background: 'var(--lime)', color: '#040404' }}
            >
              <Camera size={40} strokeWidth={1.8} />
            </button>
            <div className="text-center">
              <p className="font-bold text-lg">צלם את הארוחה שלך</p>
              <p className="label-muted text-sm mt-1">ה-AI יזהה את המזון ויחשב קלוריות ומאקרוס</p>
            </div>
            <button
              onClick={() => startManual()}
              className="btn-ghost flex items-center justify-center gap-2"
              style={{ color: 'var(--lime)', borderColor: 'var(--lime-border)' }}
            >
              <Pencil size={15} /> הוסף ידנית
            </button>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
          </section>

          <section className="card fade-up fade-up-3">
            <h2 className="font-bold mb-2">⚡ הוספה מהירה</h2>
            <p className="label-muted text-sm mb-3">הקש על מאכל כדי לטעון את הערכים — אפשר לערוך לפני שמירה</p>
            <div className="grid grid-cols-2 gap-2">
              {COMMON_FOODS.map((f) => (
                <button
                  key={f.name}
                  onClick={() =>
                    startManual({
                      name: `${f.name} (${f.portion})`,
                      calories: f.calories,
                      protein_g: f.protein_g,
                      carbs_g: f.carbs_g,
                      fat_g: f.fat_g,
                    })
                  }
                  className="card-2 p-2.5 text-right flex items-center gap-2"
                >
                  <span className="text-xl shrink-0">{f.emoji}</span>
                  <span className="min-w-0">
                    <span className="text-sm font-semibold block truncate">{f.name}</span>
                    <span className="label-muted block" style={{ fontSize: 11 }}>
                      {f.calories} קק"ל · {f.protein_g}g חלבון
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {phase === 'manual' && (
        <section className="card fade-up flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Pencil size={18} style={{ color: 'var(--lime)' }} />
            <h2 className="section-title">הוספת ארוחה ידנית</h2>
          </div>

          <div>
            <label className="label-muted block mb-1.5">שם המאכל</label>
            <input
              className="input-dark"
              value={manual.name}
              onChange={(e) => setManual((m) => ({ ...m, name: e.target.value }))}
              placeholder="לדוגמה: סלט עוף"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <ManualField label='קק"ל' value={manual.calories} onChange={(v) => setManual((m) => ({ ...m, calories: v }))} />
            <ManualField label="חלבון" value={manual.protein_g} onChange={(v) => setManual((m) => ({ ...m, protein_g: v }))} />
            <ManualField label="פחמ׳" value={manual.carbs_g} onChange={(v) => setManual((m) => ({ ...m, carbs_g: v }))} />
            <ManualField label="שומן" value={manual.fat_g} onChange={(v) => setManual((m) => ({ ...m, fat_g: v }))} />
          </div>

          <div>
            <label className="label-muted block mb-1.5">לאיזו ארוחה?</label>
            <div className="grid grid-cols-4 gap-2">
              {MEAL_TYPES.map((mt) => (
                <button
                  key={mt.key}
                  onClick={() => setMealType(mt.key)}
                  className={`chip !px-2 text-center justify-center ${mealType === mt.key ? 'active' : ''}`}
                >
                  {mt.emoji} {mt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button className="btn-primary flex items-center justify-center gap-1.5" onClick={saveManual} disabled={saving}>
              <Check size={17} />
              {saving ? 'שומר...' : 'הוסף ליומן'}
            </button>
            <button className="btn-ghost !w-auto px-4" onClick={() => setPhase('idle')}>
              ביטול
            </button>
          </div>
        </section>
      )}

      {phase === 'analyzing' && (
        <section className="card fade-up flex flex-col items-center py-12 gap-4">
          <div className="spinner" />
          <p className="font-bold">מנתח תמונה... 🔍</p>
          <p className="label-muted text-sm">Claude Vision מזהה את המזון בצלחת</p>
        </section>
      )}

      {phase === 'result' && result && (
        <section className="card fade-up flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="card-2 flex items-center justify-center text-4xl" style={{ width: 64, height: 64 }}>
              {result.emoji}
            </div>
            <div>
              <p className="font-bold">זיהיתי: {result.name}</p>
              <p className="label-muted text-sm">דיוק זיהוי: {result.confidence}%</p>
            </div>
          </div>

          <div className="card-2 p-3 flex flex-col gap-1">
            {result.items.map((it, i) => (
              <p key={i} className="text-sm">
                • {it.name} <span className="label-muted">({it.weight_g}g)</span>
              </p>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <MacroBadge value={Math.round((result.calories * quantity) / 100)} label='קק"ל' color="var(--lime)" />
            <MacroBadge value={Math.round((result.protein_g * quantity) / 100)} label="חלבון" color="var(--blue)" />
            <MacroBadge value={Math.round((result.carbs_g * quantity) / 100)} label="פחמ׳" color="var(--orange)" />
            <MacroBadge value={Math.round((result.fat_g * quantity) / 100)} label="שומן" color="var(--purple)" />
          </div>

          <div>
            <label className="label-muted block mb-1.5">כמות: {quantity}%</label>
            <input type="range" min={25} max={200} step={25} value={quantity} onChange={(e) => setQuantity(+e.target.value)} />
          </div>

          <div>
            <label className="label-muted block mb-1.5">לאיזו ארוחה?</label>
            <div className="grid grid-cols-4 gap-2">
              {MEAL_TYPES.map((mt) => (
                <button
                  key={mt.key}
                  onClick={() => setMealType(mt.key)}
                  className={`chip !px-2 text-center justify-center ${mealType === mt.key ? 'active' : ''}`}
                >
                  {mt.emoji} {mt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button className="btn-primary" onClick={addToDiary} disabled={saving}>
              {saving ? 'שומר...' : '➕ הוסף ליומן'}
            </button>
            <button className="btn-ghost !w-auto px-4" onClick={() => setPhase('idle')}>
              ביטול
            </button>
          </div>
        </section>
      )}
    </>
  )
}

function MacroBadge({ value, label, color }) {
  return (
    <div className="card-2 py-2">
      <p className="font-extrabold" style={{ color }}>
        {value}
      </p>
      <p className="label-muted" style={{ fontSize: 11 }}>
        {label}
      </p>
    </div>
  )
}

function ManualField({ label, value, onChange }) {
  return (
    <div>
      <label className="label-muted block mb-0.5 text-center" style={{ fontSize: 11 }}>
        {label}
      </label>
      <input
        type="number"
        min={0}
        className="input-dark !py-1.5 !px-2 !text-sm text-center w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
      />
    </div>
  )
}

/* ───────────────────────── Tab 3: Fridge → Recipe ───────────────────────── */

function FridgeTab({ showToast }) {
  const fileRef = useRef(null)
  const [phase, setPhase] = useState('idle')
  const [recipe, setRecipe] = useState(null)
  const [saving, setSaving] = useState(false)

  async function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhase('analyzing')
    // PHASE 2: convert file to base64 and POST to Make.com Scenario B
    const mock = await generateRecipeFromFridge(null)
    setRecipe(mock)
    setPhase('result')
    e.target.value = ''
  }

  async function saveRecipe() {
    setSaving(true)
    const { error } = await supabase.from('recipes_cache').insert({
      recipe_name: recipe.name,
      ingredients_hash: recipe.ingredients.join('|'),
      recipe_json: recipe,
      macros_json: recipe.macros,
      cost_ils: recipe.cost_ils,
    })
    setSaving(false)
    showToast(error ? 'שגיאה בשמירה 😕' : 'המתכון נשמר! 📖')
  }

  return (
    <>
      {phase === 'idle' && (
        <section className="card fade-up fade-up-2 flex flex-col items-center py-10 gap-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-28 h-28 rounded-full flex items-center justify-center glow-lime"
            style={{ background: 'var(--lime)', color: '#040404' }}
          >
            <Refrigerator size={44} strokeWidth={1.8} />
          </button>
          <div className="text-center">
            <p className="font-bold text-lg">צלם את המקרר</p>
            <p className="label-muted text-sm mt-1">
              נזהה מה יש לך ונציע מתכון מהיר, זול ועשיר בחלבון
            </p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
        </section>
      )}

      {phase === 'analyzing' && (
        <section className="card fade-up flex flex-col items-center py-12 gap-4">
          <div className="spinner" />
          <p className="font-bold">מזהה מרכיבים... 🥕</p>
          <p className="label-muted text-sm">בונה מתכון מותאם ליעדים שלך</p>
        </section>
      )}

      {phase === 'result' && recipe && (
        <RecipeCard recipe={recipe}>
          <div className="flex gap-2 mt-1">
            <button className="btn-primary flex items-center justify-center gap-1.5" onClick={saveRecipe} disabled={saving}>
              <BookmarkPlus size={17} />
              {saving ? 'שומר...' : 'שמור מתכון'}
            </button>
            <button className="btn-ghost !w-auto px-4" onClick={() => setPhase('idle')}>
              עוד אחד
            </button>
          </div>
        </RecipeCard>
      )}
    </>
  )
}

export function RecipeCard({ recipe, children }) {
  const macros = recipe.macros || recipe.macros_json || {}
  return (
    <section className="card fade-up flex flex-col gap-4">
      {/* emoji image placeholder — PHASE 2: Gemini Imagen photo */}
      <div
        className="rounded-2xl flex items-center justify-center text-7xl py-8"
        style={{ background: 'linear-gradient(135deg, var(--bg-card-2) 0%, rgba(26,26,0,0.6) 100%)', border: '1px solid var(--lime-border)' }}
      >
        {recipe.emoji || '🍽️'}
      </div>

      <div>
        <h2 className="text-xl font-extrabold">{recipe.name}</h2>
        <div className="flex items-center gap-4 mt-1.5 label-muted text-sm">
          <span className="flex items-center gap-1">
            <Clock size={14} /> {recipe.prep_time_min} דק׳
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} /> {recipe.servings} מנות
          </span>
          <span className="flex items-center gap-1" style={{ color: 'var(--lime)' }}>
            <Wallet size={14} /> ₪{recipe.cost_ils}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <MacroBadge value={macros.calories} label='קק"ל' color="var(--lime)" />
        <MacroBadge value={`${macros.protein_g}g`} label="חלבון" color="var(--blue)" />
        <MacroBadge value={`${macros.carbs_g}g`} label="פחמ׳" color="var(--orange)" />
        <MacroBadge value={`${macros.fat_g}g`} label="שומן" color="var(--purple)" />
      </div>

      <div>
        <h3 className="font-bold mb-1.5">🛒 מרכיבים</h3>
        <div className="card-2 p-3 flex flex-col gap-1">
          {(recipe.ingredients || []).map((ing, i) => (
            <p key={i} className="text-sm">
              • {ing}
            </p>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-1.5">👨‍🍳 הוראות הכנה</h3>
        <ol className="flex flex-col gap-2">
          {(recipe.steps || []).map((step, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
              <span
                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-xs"
                style={{ background: 'var(--lime-dim)', color: 'var(--lime)', border: '1px solid var(--lime-border)' }}
              >
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {children}
    </section>
  )
}

/* ───────────────────────── Tab 4: Saved Recipes ───────────────────────── */

function SavedTab() {
  const [saved, setSaved] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('recipes_cache')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setSaved(data || [])
        setLoading(false)
      })
  }, [])

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <div className="spinner" />
      </div>
    )

  if (expanded) {
    const recipe = { ...(expanded.recipe_json || {}), name: expanded.recipe_name, cost_ils: expanded.cost_ils }
    return (
      <>
        <button className="btn-ghost !w-auto px-4 fade-up" onClick={() => setExpanded(null)}>
          → חזרה לרשימה
        </button>
        <RecipeCard recipe={recipe} />
      </>
    )
  }

  return saved.length === 0 ? (
    <section className="card fade-up fade-up-2 text-center py-12">
      <p className="text-4xl mb-3">📖</p>
      <p className="font-bold">אין עדיין מתכונים שמורים</p>
      <p className="label-muted text-sm mt-1">צלם את המקרר וקבל מתכון ראשון!</p>
    </section>
  ) : (
    <div className="grid grid-cols-2 gap-3 fade-up fade-up-2">
      {saved.map((r) => {
        const macros = r.macros_json || {}
        return (
          <button key={r.id} className="card !p-3 text-right flex flex-col gap-2" onClick={() => setExpanded(r)}>
            <div
              className="rounded-xl flex items-center justify-center text-4xl py-4 w-full"
              style={{ background: 'var(--bg-card-2)' }}
            >
              {r.recipe_json?.emoji || '🍽️'}
            </div>
            <p className="font-bold text-sm leading-tight">{r.recipe_name}</p>
            <p className="label-muted" style={{ fontSize: 11 }}>
              {macros.calories} קק"ל · {macros.protein_g}g חלבון
              {r.cost_ils ? ` · ₪${r.cost_ils}` : ''}
            </p>
          </button>
        )
      })}
    </div>
  )
}

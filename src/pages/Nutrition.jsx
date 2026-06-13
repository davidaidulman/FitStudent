import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Camera, Trash2, Refrigerator, BookmarkPlus, Clock, Users, Pencil, Plus, Check, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { analyzeFoodImage, detectFridgeIngredients, suggestRecipesFromIngredients } from '../services/ai'
import { useToast } from '../components/Toast'
import SubTabs from '../components/SubTabs'
import { COMMON_FOODS, recipes as recommendedRecipes } from '../data/mockData'
import { imageFileToBase64 } from '../utils/image'
import { todayISO } from '../utils/dates'

const TABS = [
  { key: 'diary', label: 'יומן' },
  { key: 'log', label: 'הוסף ארוחה' },
  { key: 'fridge', label: 'מהמקרר לצלחת' },
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

      {tab === 'diary' && <DiaryTab diary={diary} reload={loadDiary} profile={profile} showToast={showToast} goTab={(t) => setParams({ tab: t })} />}
      {tab === 'log' && <LogMealTab user={user} onAdded={loadDiary} showToast={showToast} />}
      {tab === 'fridge' && <FridgeTab showToast={showToast} />}
      {tab === 'saved' && <SavedTab />}

      {toast}
    </div>
  )
}

/* ───────────────────────── Tab 1: Diary ───────────────────────── */

function DiaryTab({ diary, reload, profile, showToast, goTab }) {
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
              <button
                onClick={() => goTab('log')}
                className="label-muted text-sm flex items-center gap-1.5"
                style={{ color: 'var(--lime)' }}
              >
                <Plus size={14} /> הוסף ארוחה
              </button>
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
  return { name: '', calories: '', protein_g: '', carbs_g: '', fat_g: '', grams: '', base: null }
}

let _compId = 0
function makeComponent(c) {
  return {
    key: `c${_compId++}`,
    name: c.name,
    calories: Math.round(+c.calories || 0),
    protein_g: Math.round(+c.protein_g || 0),
    carbs_g: Math.round(+c.carbs_g || 0),
    fat_g: Math.round(+c.fat_g || 0),
    grams: c.grams ?? null,
    base: c.base || null,
  }
}

// A meal is built from several components (quick foods, manual items, recipes,
// or a photo result). Components stack, totals sum, then it's saved as one entry.
function LogMealTab({ user, onAdded, showToast }) {
  const fileRef = useRef(null)
  const [meal, setMeal] = useState([])
  const [mealType, setMealType] = useState('lunch')
  const [mode, setMode] = useState('build') // build | analyzing | photo
  const [photo, setPhoto] = useState(null) // { result, quantity }
  const [adding, setAdding] = useState(null) // null | 'manual' | 'recipe'
  const [manual, setManual] = useState(emptyManual())
  const [savedRecipes, setSavedRecipes] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('recipes_cache')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setSavedRecipes(data || []))
  }, [])

  const totals = meal.reduce(
    (a, c) => ({ calories: a.calories + c.calories, protein_g: a.protein_g + c.protein_g, carbs_g: a.carbs_g + c.carbs_g, fat_g: a.fat_g + c.fat_g }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  )

  const addComponent = (c) => setMeal((m) => [...m, makeComponent(c)])
  const removeComponent = (key) => setMeal((m) => m.filter((c) => c.key !== key))

  // rescale a gram-based component when its weight is edited
  function setComponentGrams(key, g) {
    setMeal((m) =>
      m.map((c) => {
        if (c.key !== key) return c
        if (!c.base || g === '' || +g <= 0) return { ...c, grams: g }
        const f = +g / c.base.grams
        return {
          ...c,
          grams: g,
          calories: Math.round(c.base.calories * f),
          protein_g: Math.round(c.base.protein_g * f),
          carbs_g: Math.round(c.base.carbs_g * f),
          fat_g: Math.round(c.base.fat_g * f),
        }
      })
    )
  }

  function addQuick(f) {
    addComponent({
      name: f.name,
      grams: f.grams,
      base: { grams: f.grams, calories: f.calories, protein_g: f.protein_g, carbs_g: f.carbs_g, fat_g: f.fat_g },
      calories: f.calories,
      protein_g: f.protein_g,
      carbs_g: f.carbs_g,
      fat_g: f.fat_g,
    })
  }

  function addRecipe(r) {
    const mc = r.macros || r.macros_json || {}
    addComponent({ name: r.name || r.recipe_name, calories: mc.calories, protein_g: mc.protein_g, carbs_g: mc.carbs_g, fat_g: mc.fat_g })
    setAdding(null)
  }

  function submitManual() {
    if (!manual.name.trim()) return showToast('הזן שם מאכל')
    addComponent({ ...manual, name: manual.name.trim() })
    setManual(emptyManual())
    setAdding(null)
  }

  function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result).split(',')[1]) 
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

async function onFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  setMode('analyzing')
  const base64Image = await fileToBase64(file);
  const mock = await analyzeFoodImage(base64Image);
  setPhoto({ result: mock, quantity: 100 })
  setMode('photo')
  e.target.value = ''
}

  function addPhotoToMeal() {
    const { result, quantity } = photo
    const f = quantity / 100
    addComponent({
      name: result.name,
      calories: result.calories * f,
      protein_g: result.protein_g * f,
      carbs_g: result.carbs_g * f,
      fat_g: result.fat_g * f,
    })
    setPhoto(null)
    setMode('build')
  }

  async function saveMeal() {
    if (meal.length === 0) return showToast('הוסף לפחות פריט אחד')
    setSaving(true)
    const { error } = await supabase.from('food_log').insert({
      user_id: user.id,
      date: todayISO(),
      meal_type: mealType,
      items_json: meal.map((c) => ({ name: c.name })),
      calories: Math.round(totals.calories),
      protein_g: Math.round(totals.protein_g),
      carbs_g: Math.round(totals.carbs_g),
      fat_g: Math.round(totals.fat_g),
      confidence: 100,
    })
    setSaving(false)
    if (error) return showToast('שגיאה בשמירה 😕')
    showToast('נוסף ליומן! ✅')
    setMeal([])
    onAdded()
  }

  if (mode === 'analyzing') {
    return (
      <section className="card fade-up flex flex-col items-center py-12 gap-4">
        <div className="spinner" />
        <p className="font-bold">מנתח תמונה... 🔍</p>
        <p className="label-muted text-sm">Claude Vision מזהה את המזון בצלחת</p>
      </section>
    )
  }

  if (mode === 'photo' && photo) {
    const { result, quantity } = photo
    return (
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
        <div className="grid grid-cols-4 gap-2 text-center">
          <MacroBadge value={Math.round((result.calories * quantity) / 100)} label='קק"ל' color="var(--lime)" />
          <MacroBadge value={Math.round((result.protein_g * quantity) / 100)} label="חלבון" color="var(--blue)" />
          <MacroBadge value={Math.round((result.carbs_g * quantity) / 100)} label="פחמ׳" color="var(--orange)" />
          <MacroBadge value={Math.round((result.fat_g * quantity) / 100)} label="שומן" color="var(--purple)" />
        </div>
        <div>
          <label className="label-muted block mb-1.5">כמות: {quantity}%</label>
          <input
            type="range"
            min={25}
            max={200}
            step={25}
            value={quantity}
            onChange={(e) => setPhoto((p) => ({ ...p, quantity: +e.target.value }))}
          />
        </div>
        <div className="flex gap-2">
          <button className="btn-primary flex items-center justify-center gap-1.5" onClick={addPhotoToMeal}>
            <Plus size={17} /> הוסף לארוחה
          </button>
          <button className="btn-ghost !w-auto px-4" onClick={() => { setPhoto(null); setMode('build') }}>
            ביטול
          </button>
        </div>
      </section>
    )
  }

  return (
    <>
      {/* current meal being built */}
      {meal.length > 0 && (
        <section className="card fade-up glow-lime" style={{ borderColor: 'var(--lime-border)' }}>
          <h2 className="font-bold mb-2" style={{ color: 'var(--lime)' }}>🍽️ הארוחה הנוכחית</h2>
          <div className="flex flex-col gap-2">
            {meal.map((c) => (
              <div key={c.key} className="card-2 p-2.5 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{c.name}</p>
                  <p className="label-muted" style={{ fontSize: 11 }}>
                    {c.calories} קק"ל · {c.protein_g}g חלבון
                  </p>
                </div>
                {c.base && (
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      min={1}
                      className="input-dark !py-1 !px-2 !text-sm !w-16 text-center"
                      value={c.grams ?? ''}
                      onChange={(e) => setComponentGrams(c.key, e.target.value)}
                      aria-label="גרם"
                    />
                    <span className="label-muted" style={{ fontSize: 11 }}>g</span>
                  </div>
                )}
                <button onClick={() => removeComponent(c.key)} aria-label="הסר">
                  <X size={16} style={{ color: 'var(--muted)' }} />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2 text-center mt-3">
            <MacroBadge value={Math.round(totals.calories)} label='קק"ל' color="var(--lime)" />
            <MacroBadge value={Math.round(totals.protein_g)} label="חלבון" color="var(--blue)" />
            <MacroBadge value={Math.round(totals.carbs_g)} label="פחמ׳" color="var(--orange)" />
            <MacroBadge value={Math.round(totals.fat_g)} label="שומן" color="var(--purple)" />
          </div>

          <div className="mt-3">
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

          <button className="btn-primary mt-3 flex items-center justify-center gap-1.5" onClick={saveMeal} disabled={saving}>
            <Check size={17} />
            {saving ? 'שומר...' : `הוסף ליומן (${meal.length} פריטים)`}
          </button>
        </section>
      )}

      {/* manual add mini-form */}
      {adding === 'manual' && (
        <section className="card fade-up flex flex-col gap-3">
          <h2 className="section-title">הוספה ידנית</h2>
          <input
            className="input-dark"
            value={manual.name}
            onChange={(e) => setManual((m) => ({ ...m, name: e.target.value }))}
            placeholder="שם המאכל"
          />
          <div className="grid grid-cols-4 gap-2">
            <ManualField label='קק"ל' value={manual.calories} onChange={(v) => setManual((m) => ({ ...m, calories: v }))} />
            <ManualField label="חלבון" value={manual.protein_g} onChange={(v) => setManual((m) => ({ ...m, protein_g: v }))} />
            <ManualField label="פחמ׳" value={manual.carbs_g} onChange={(v) => setManual((m) => ({ ...m, carbs_g: v }))} />
            <ManualField label="שומן" value={manual.fat_g} onChange={(v) => setManual((m) => ({ ...m, fat_g: v }))} />
          </div>
          <div className="flex gap-2">
            <button className="btn-primary !py-2 text-sm" onClick={submitManual}>הוסף לארוחה</button>
            <button className="btn-ghost !py-2 text-sm !w-auto px-4" onClick={() => setAdding(null)}>ביטול</button>
          </div>
        </section>
      )}

      {/* recipe picker */}
      {adding === 'recipe' && (
        <section className="card fade-up flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="section-title">הוסף מתכון לארוחה</h2>
            <button onClick={() => setAdding(null)} aria-label="סגור"><X size={18} style={{ color: 'var(--muted)' }} /></button>
          </div>
          <p className="label-muted text-sm">מומלצים</p>
          <div className="flex flex-col gap-1.5">
            {recommendedRecipes.map((r) => (
              <button key={r.name} onClick={() => addRecipe(r)} className="card-2 p-2.5 flex items-center gap-2 text-right">
                <span className="text-xl shrink-0">{r.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="text-sm font-semibold block truncate">{r.name}</span>
                  <span className="label-muted block" style={{ fontSize: 11 }}>{r.macros.calories} קק"ל · {r.macros.protein_g}g חלבון</span>
                </span>
                <Plus size={16} style={{ color: 'var(--lime)' }} />
              </button>
            ))}
          </div>
          {savedRecipes.length > 0 && (
            <>
              <p className="label-muted text-sm mt-1">המתכונים שלי</p>
              <div className="flex flex-col gap-1.5">
                {savedRecipes.map((r) => {
                  const mc = r.macros_json || {}
                  return (
                    <button key={r.id} onClick={() => addRecipe(r)} className="card-2 p-2.5 flex items-center gap-2 text-right">
                      <span className="text-xl shrink-0">{r.recipe_json?.emoji || '🍽️'}</span>
                      <span className="min-w-0 flex-1">
                        <span className="text-sm font-semibold block truncate">{r.recipe_name}</span>
                        <span className="label-muted block" style={{ fontSize: 11 }}>{mc.calories} קק"ל · {mc.protein_g}g חלבון</span>
                      </span>
                      <Plus size={16} style={{ color: 'var(--lime)' }} />
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </section>
      )}

      {/* sources to add from */}
      <section className="card fade-up fade-up-2 flex flex-col items-center py-6 gap-3">
        <button
          onClick={() => fileRef.current?.click()}
          className="w-20 h-20 rounded-full flex items-center justify-center glow-lime"
          style={{ background: 'var(--lime)', color: 'var(--on-accent)' }}
        >
          <Camera size={34} strokeWidth={1.8} />
        </button>
        <p className="font-bold">צלם מאכל</p>
        <div className="flex gap-2 w-full">
          <button
            onClick={() => { setManual(emptyManual()); setAdding(adding === 'manual' ? null : 'manual') }}
            className="btn-ghost !py-2 text-sm flex items-center justify-center gap-1.5"
            style={{ color: 'var(--lime)', borderColor: 'var(--lime-border)' }}
          >
            <Pencil size={14} /> ידני
          </button>
          <button
            onClick={() => setAdding(adding === 'recipe' ? null : 'recipe')}
            className="btn-ghost !py-2 text-sm flex items-center justify-center gap-1.5"
            style={{ color: 'var(--lime)', borderColor: 'var(--lime-border)' }}
          >
            <BookmarkPlus size={14} /> מתכון
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
      </section>

      <section className="card fade-up fade-up-3">
        <h2 className="font-bold mb-2">⚡ הוספה מהירה</h2>
        <p className="label-muted text-sm mb-3">הקש להוספה לארוחה - אפשר לצרף כמה פריטים יחד ולכוונן משקל</p>
        <div className="grid grid-cols-2 gap-2">
          {COMMON_FOODS.map((f) => (
            <button key={f.name} onClick={() => addQuick(f)} className="card-2 p-2.5 text-right flex items-center gap-2">
              <span className="text-xl shrink-0">{f.emoji}</span>
              <span className="min-w-0">
                <span className="text-sm font-semibold block truncate">{f.name}</span>
                <span className="label-muted block" style={{ fontSize: 11 }}>
                  {f.grams}g · {f.calories} קק"ל
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>
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
  const [phase, setPhase] = useState('idle') // idle | detecting | review | building | list | result
  const [ingredients, setIngredients] = useState([])
  const [newIng, setNewIng] = useState('')
  const [textInput, setTextInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [recipe, setRecipe] = useState(null)
  const [saving, setSaving] = useState(false)

  async function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhase('detecting')
    const base64 = await imageFileToBase64(file)
    const detected = await detectFridgeIngredients(base64)
    setIngredients(detected)
    setPhase('review')
    e.target.value = ''
  }

  function useTextIngredients() {
    const parsed = textInput
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (parsed.length === 0) return showToast('הקלד לפחות מרכיב אחד')
    setIngredients(parsed)
    setPhase('review')
  }

  function removeIng(i) {
    setIngredients((list) => list.filter((_, j) => j !== i))
  }
  function addIng() {
    if (!newIng.trim()) return
    setIngredients((list) => [...list, newIng.trim()])
    setNewIng('')
  }

  async function buildRecipe() {
    if (ingredients.length === 0) return showToast('הוסף לפחות מרכיב אחד')
    setPhase('building')
    const ranked = await suggestRecipesFromIngredients(ingredients)
    setSuggestions(ranked)
    setPhase('list')
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

  function reset() {
    setIngredients([])
    setTextInput('')
    setSuggestions([])
    setRecipe(null)
    setPhase('idle')
  }

  return (
    <>
      {phase === 'idle' && (
        <>
          <section className="card fade-up fade-up-2 flex flex-col items-center py-8 gap-4">
            <button
              onClick={() => fileRef.current?.click()}
              className="w-24 h-24 rounded-full flex items-center justify-center glow-lime"
              style={{ background: 'var(--lime)', color: 'var(--on-accent)' }}
            >
              <Refrigerator size={40} strokeWidth={1.8} />
            </button>
            <div className="text-center">
              <p className="font-bold text-lg">צלם את המקרר</p>
              <p className="label-muted text-sm mt-1">נזהה מה יש לך ונציע מתכון מהיר, זול ועשיר בחלבון</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
          </section>

          <section className="card fade-up fade-up-3">
            <h2 className="font-bold mb-2">⌨️ או הקלד מה יש לך</h2>
            <p className="label-muted text-sm mb-3">רשום מרכיבים מופרדים בפסיק או שורה - וה-AI יציע מתכון</p>
            <textarea
              className="input-dark"
              rows={3}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="לדוגמה: ביצים, עגבנייה, גבינה לבנה, לחם מלא"
            />
            <button className="btn-primary mt-3" onClick={useTextIngredients}>
              נתח מרכיבים 🔍
            </button>
          </section>
        </>
      )}

      {phase === 'detecting' && (
        <section className="card fade-up flex flex-col items-center py-12 gap-4">
          <div className="spinner" />
          <p className="font-bold">מזהה מרכיבים... 🥕</p>
          <p className="label-muted text-sm">Claude Vision סורק את המקרר</p>
        </section>
      )}

      {phase === 'review' && (
        <section className="card fade-up flex flex-col gap-3">
          <h2 className="section-title">המרכיבים שזוהו 🧺</h2>
          <p className="label-muted text-sm">ערוך, הסר או הוסף מרכיבים לפני בניית המתכון</p>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ing, i) => (
              <span
                key={i}
                className="chip active flex items-center gap-1.5"
                style={{ paddingTop: 6, paddingBottom: 6 }}
              >
                {ing}
                <button onClick={() => removeIng(i)} aria-label="הסר">
                  <X size={13} />
                </button>
              </span>
            ))}
            {ingredients.length === 0 && <p className="label-muted text-sm">אין מרכיבים - הוסף למטה</p>}
          </div>
          <div className="flex gap-2">
            <input
              className="input-dark"
              value={newIng}
              onChange={(e) => setNewIng(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addIng()}
              placeholder="הוסף מרכיב..."
            />
            <button className="btn-ghost !w-auto px-4" onClick={addIng}>
              <Plus size={16} />
            </button>
          </div>
          <div className="flex gap-2 mt-1">
            <button className="btn-primary" onClick={buildRecipe}>
              בנה מתכון 👨‍🍳
            </button>
            <button className="btn-ghost !w-auto px-4" onClick={reset}>
              ביטול
            </button>
          </div>
        </section>
      )}

      {phase === 'building' && (
        <section className="card fade-up flex flex-col items-center py-12 gap-4">
          <div className="spinner" />
          <p className="font-bold">מחפש מתכונים... 👨‍🍳</p>
          <p className="label-muted text-sm">מתאים מתכונים למרכיבים שהזנת</p>
        </section>
      )}

      {phase === 'list' && (
        <section className="card fade-up flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="section-title">מתכונים מתאימים 🍳</h2>
            <button onClick={reset} aria-label="התחל מחדש">
              <X size={18} style={{ color: 'var(--muted)' }} />
            </button>
          </div>
          {suggestions.length === 0 ? (
            <p className="label-muted text-sm py-4 text-center">
              לא נמצאו מתכונים מתאימים - נסה להוסיף עוד מרכיבים
            </p>
          ) : (
            <>
              <p className="label-muted text-sm">מסודר לפי התאמה. ⭐ = צריך להשלים מרכיב או שניים מהמכולת</p>
              <div className="flex flex-col gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s.recipe.name}
                    onClick={() => {
                      setRecipe(s.recipe)
                      setPhase('result')
                    }}
                    className="card-2 p-3 flex items-center gap-3 text-right"
                  >
                    <span className="text-3xl shrink-0">{s.recipe.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="text-sm font-bold block truncate">
                        {s.needsExtra ? '⭐ ' : ''}
                        {s.recipe.name}
                      </span>
                      <span className="label-muted block" style={{ fontSize: 11 }}>
                        {s.recipe.macros.calories} קק"ל · {s.recipe.macros.protein_g}g חלבון · {s.have.length} מתוך שלך
                      </span>
                      {s.needsExtra && (
                        <span className="block mt-0.5" style={{ fontSize: 11, color: 'var(--orange)' }}>
                          להשלים: {s.missing.slice(0, 2).join(', ')}
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
          <button className="btn-ghost !w-auto px-4 self-start" onClick={() => setPhase('review')}>
            → ערוך מרכיבים
          </button>
        </section>
      )}

      {phase === 'result' && recipe && (
        <RecipeCard recipe={recipe}>
          <div className="flex gap-2 mt-1">
            <button className="btn-primary flex items-center justify-center gap-1.5" onClick={saveRecipe} disabled={saving}>
              <BookmarkPlus size={17} />
              {saving ? 'שומר...' : 'שמור מתכון'}
            </button>
            <button className="btn-ghost !w-auto px-4" onClick={() => setPhase('list')}>
              ← לרשימה
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
      {/* emoji image placeholder -PHASE 2: Gemini Imagen photo */}
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

function RecipeGridCard({ emoji, name, macros, cost, onClick }) {
  return (
    <button className="card !p-3 text-right flex flex-col gap-2" onClick={onClick}>
      <div className="rounded-xl flex items-center justify-center text-4xl py-4 w-full" style={{ background: 'var(--bg-card-2)' }}>
        {emoji || '🍽️'}
      </div>
      <p className="font-bold text-sm leading-tight">{name}</p>
      <p className="label-muted" style={{ fontSize: 11 }}>
        {macros?.calories} קק"ל · {macros?.protein_g}g חלבון
      </p>
    </button>
  )
}

function SavedTab() {
  const [saved, setSaved] = useState([])
  const [expanded, setExpanded] = useState(null) // a normalized recipe object
  const [savedView, setSavedView] = useState(false) // whether expanded came from DB (already saved)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast, showToast } = useToast()

  async function load() {
    const { data } = await supabase.from('recipes_cache').select('*').order('created_at', { ascending: false })
    setSaved(data || [])
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])

  async function saveRecipe(recipe) {
    setSaving(true)
    const { error } = await supabase.from('recipes_cache').insert({
      recipe_name: recipe.name,
      ingredients_hash: (recipe.ingredients || []).join('|'),
      recipe_json: recipe,
      macros_json: recipe.macros,
      cost_ils: recipe.cost_ils,
    })
    setSaving(false)
    if (error) return showToast('שגיאה בשמירה 😕')
    showToast('המתכון נשמר! 📖')
    load()
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <div className="spinner" />
      </div>
    )

  if (expanded) {
    return (
      <>
        <button className="btn-ghost !w-auto px-4 fade-up" onClick={() => setExpanded(null)}>
          → חזרה לרשימה
        </button>
        <RecipeCard recipe={expanded}>
          {!savedView && (
            <button
              className="btn-primary flex items-center justify-center gap-1.5 mt-1"
              onClick={() => saveRecipe(expanded)}
              disabled={saving}
            >
              <BookmarkPlus size={17} />
              {saving ? 'שומר...' : 'שמור למתכונים שלי'}
            </button>
          )}
        </RecipeCard>
        {toast}
      </>
    )
  }

  return (
    <>
      {/* Recommended quick recipes -always available, things everyone has at home */}
      <section className="fade-up fade-up-2">
        <h2 className="font-bold mb-2">⭐ מתכונים מומלצים מהירים</h2>
        <div className="grid grid-cols-2 gap-3">
          {recommendedRecipes.map((r) => (
            <RecipeGridCard
              key={r.name}
              emoji={r.emoji}
              name={r.name}
              macros={r.macros}
              cost={r.cost_ils}
              onClick={() => {
                setSavedView(false)
                setExpanded(r)
              }}
            />
          ))}
        </div>
      </section>

      {/* User-saved recipes */}
      <section className="fade-up fade-up-3 mt-2">
        <h2 className="font-bold mb-2">📖 המתכונים שלי</h2>
        {saved.length === 0 ? (
          <p className="label-muted text-sm">עדיין לא שמרת מתכונים - שמור מהמומלצים למעלה או מ"מהמקרר לצלחת"</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {saved.map((r) => (
              <RecipeGridCard
                key={r.id}
                emoji={r.recipe_json?.emoji}
                name={r.recipe_name}
                macros={r.macros_json}
                cost={r.cost_ils}
                onClick={() => {
                  setSavedView(true)
                  setExpanded({ ...(r.recipe_json || {}), name: r.recipe_name, cost_ils: r.cost_ils })
                }}
              />
            ))}
          </div>
        )}
      </section>

      {toast}
    </>
  )
}

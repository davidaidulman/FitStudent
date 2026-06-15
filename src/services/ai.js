// ─────────────────────────────────────────────────────────────
// AI integration layer.
//
// Each feature posts to a Make.com webhook (Phase 2). The real AI keys
// (Gemini / Perplexity) live inside Make.com, never here — only the public
// webhook URLs are read from the environment. If a webhook is not configured,
// or the call fails, we fall back to local mock data so the app never breaks.
// ─────────────────────────────────────────────────────────────
import { foodResults, recipes, planTemplates, defaultVariant, DISCIPLINE_VARIANT } from '../data/mockData'
import { DAY_KEYS } from '../utils/dates'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Public Make.com webhook URLs (safe in the frontend; no secrets here).
const WEBHOOKS = {
  food: import.meta.env.VITE_MAKE_WEBHOOK_FOOD,
  fridgeDetect: import.meta.env.VITE_MAKE_WEBHOOK_FRIDGE_DETECT,
  fridgeRecipe: import.meta.env.VITE_MAKE_WEBHOOK_FRIDGE_RECIPE,
  plan: import.meta.env.VITE_MAKE_WEBHOOK_PLAN,
  calendar: import.meta.env.VITE_MAKE_WEBHOOK_CALENDAR,
}

async function callWebhook(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`webhook ${res.status}`)
  return res.json()
}

// Try the webhook; on missing config or any failure, return the mock instead.
async function withFallback(url, payload, mockFn, mockDelay = 800) {
  if (url) {
    try {
      return await callWebhook(url, payload)
    } catch (e) {
      console.warn('[ai] webhook failed, falling back to mock:', e?.message)
    }
  }
  await sleep(mockDelay)
  return mockFn()
}

// PHASE 2 — Make.com Scenario A: Gemini Vision identifies the food, Perplexity
// verifies the macros. Returns { name, emoji, items, calories, protein_g, ... }.
export async function analyzeFoodImage(imageBase64) {
  return withFallback(
    WEBHOOKS.food,
    { image_base64: imageBase64 },
    () => foodResults[Math.floor(Math.random() * foodResults.length)],
    2000
  )
}

// PHASE 2 — Make.com Scenario B (single-shot): image → a full recipe.
// Kept for convenience; the UI uses detect + suggest below.
export async function generateRecipeFromFridge(imageBase64) {
  return withFallback(
    WEBHOOKS.fridgeRecipe,
    { image_base64: imageBase64 },
    () => recipes[Math.floor(Math.random() * recipes.length)],
    3000
  )
}

// Normalize a detect response into a plain string[] of ingredient names.
// Accepts a bare array, { items: [...] }, or { ingredients: [...] }, where each
// entry may be a string or an object ({ name | item | ingredient }).
function toIngredientList(res) {
  const list = Array.isArray(res) ? res : res?.items || res?.ingredients || []
  return list
    .map((x) => (typeof x === 'string' ? x : x?.name || x?.item || x?.ingredient || ''))
    .map((s) => String(s).trim())
    .filter(Boolean)
}

// PHASE 2 — Make.com Scenario B1: Gemini Vision lists the ingredients it sees in
// the fridge photo (the user then corrects them). Returns string[].
export async function detectFridgeIngredients(imageBase64) {
  const res = await withFallback(
    WEBHOOKS.fridgeDetect,
    { image_base64: imageBase64 },
    () => recipes[Math.floor(Math.random() * recipes.length)].ingredients.slice(0, 5),
    2500
  )
  return toIngredientList(res)
}

// PHASE 2 — single recipe from a (corrected) ingredient list.
export async function recipeFromIngredients(ingredients) {
  const ranked = await suggestRecipesFromIngredients(ingredients)
  return ranked[0]?.recipe || recipes[Math.floor(Math.random() * recipes.length)]
}

// Hebrew-ish loose word match: share a 3-char root prefix
const _root = (w) => w.replace(/[0-9״"׳']/g, '').trim()
const _words = (s) => s.split(/[\s,]+/).map(_root).filter((w) => w.length >= 3)
const _shareRoot = (a, b) => a.slice(0, 3) === b.slice(0, 3)

// Rank recipes by overlap with the user's ingredients. Returns
// { recipe, have:[], missing:[], needsExtra } sorted: most overlap first,
// then recipes missing only a few easy-to-buy items (needsExtra=true).
export function rankRecipesByIngredients(ingredients) {
  const userWords = (ingredients || []).flatMap(_words)
  if (userWords.length === 0) return []
  const scored = recipes
    .map((r) => {
      const have = []
      const missing = []
      r.ingredients.forEach((ing) => {
        const matched = _words(ing).some((w) => userWords.some((u) => _shareRoot(u, w)))
        if (matched) have.push(ing)
        else missing.push(ing)
      })
      return { recipe: r, have, missing, needsExtra: missing.length > 0 }
    })
    .filter((s) => s.have.length > 0)
  scored.sort((a, b) => b.have.length - a.have.length || a.missing.length - b.missing.length)
  return scored
}

// PHASE 2 — Make.com Scenario B2: Gemini builds recipes from the ingredients.
// Accepts a bare array or { recipes: [...] }. Falls back to local ranking.
export async function suggestRecipesFromIngredients(ingredients) {
  const res = await withFallback(
    WEBHOOKS.fridgeRecipe,
    { ingredients },
    () => rankRecipesByIngredients(ingredients),
    1800
  )
  const list = Array.isArray(res) ? res : res?.recipes || res?.results || []
  // keep only well-formed entries the UI can render
  return list.filter((s) => s && s.recipe && s.recipe.name)
}

// PHASE 2 — Make.com Scenario E: Gemini generates a weekly plan from the
// profile. Async. Falls back to the local template generator.
// NOTE: callers must `await` this (Onboarding, Workouts).
export async function generateWorkoutPlan(profile) {
  const { experience, workouts_per_week, workout_type = 'gym', goal, body_type, weight_kg } = profile
  const res = await withFallback(
    WEBHOOKS.plan,
    { goal, experience, workouts_per_week, workout_type, body_type, weight_kg },
    () => buildLocalPlan({ experience, workouts_per_week, workout_type }),
    1200
  )
  return normalizePlan(res, { experience, workouts_per_week, workout_type })
}

// Accept a bare array or { workout_plan | plan | days: [...] } and normalize
// each day to the shape the app stores. Falls back to the local plan if unusable.
function normalizePlan(res, fallbackProfile) {
  const days = Array.isArray(res) ? res : res?.workout_plan || res?.plan || res?.days || []
  if (!Array.isArray(days) || days.length === 0) return buildLocalPlan(fallbackProfile)
  return days.map((d) => {
    const wt = d.workout_type || fallbackProfile.workout_type || 'gym'
    const validKeys = (DISCIPLINE_VARIANT[wt]?.options || []).map((o) => o.key)
    const raw = String(d.workout_variant || '').toLowerCase().trim()
    // keep the variant only if it's a known key, else use the sensible default
    const variant = validKeys.includes(raw) ? raw : defaultVariant(wt, fallbackProfile.experience)
    return {
      day_of_week: d.day_of_week,
      workout_name: d.workout_name || 'מנוחה',
      muscle_groups: d.muscle_groups || '',
      exercises: Array.isArray(d.exercises) ? d.exercises : [],
      workout_type: wt,
      workout_variant: variant,
    }
  })
}

// Local static generator — preset weekly template by discipline + level/style,
// spreading workouts_per_week training days across the week.
function buildLocalPlan({ experience, workouts_per_week, workout_type = 'gym' }) {
  const discipline = planTemplates[workout_type] || planTemplates.gym
  const variant = defaultVariant(workout_type, experience)
  const template = discipline[variant] || Object.values(discipline)[0]
  const count = Math.min(Math.max(workouts_per_week || 3, 1), 6)

  // spread training days evenly across sunday..saturday
  const slots = {
    1: [0],
    2: [0, 3],
    3: [0, 2, 4],
    4: [0, 1, 3, 4],
    5: [0, 1, 2, 4, 5],
    6: [0, 1, 2, 3, 4, 5],
  }[count]

  return DAY_KEYS.map((day, i) => {
    const slotIndex = slots.indexOf(i)
    if (slotIndex === -1) {
      return { day_of_week: day, workout_name: 'מנוחה', muscle_groups: '', exercises: [], workout_type, workout_variant: variant }
    }
    const workout = template[slotIndex % template.length]
    return {
      day_of_week: day,
      workout_name: workout.workout_name,
      muscle_groups: workout.muscle_groups,
      exercises: workout.exercises,
      workout_type,
      workout_variant: variant,
    }
  })
}

// All recommended workouts available for a discipline + variant, so the user
// can choose among several instead of getting one arbitrary suggestion.
export function recommendationsFor(workout_type, variant) {
  const disc = planTemplates[workout_type] || planTemplates.gym
  return disc[variant] || Object.values(disc)[0] || []
}

// Build a single day's workout from a discipline + variant (level/style) — used
// when the user mixes disciplines across the week or edits a single day.
export function workoutForDiscipline(workout_type, variant, index = 0) {
  const disc = planTemplates[workout_type] || planTemplates.gym
  const tmpl = disc[variant] || Object.values(disc)[0]
  const w = tmpl[Math.abs(index) % tmpl.length]
  return {
    workout_name: w.workout_name,
    muscle_groups: w.muscle_groups,
    exercises: w.exercises,
    workout_type,
    workout_variant: variant,
  }
}

// PHASE 2 — Make.com: schedule a workout to Google Calendar
export async function scheduleWorkoutToCalendar(workoutName, userEmail, startTimeIso) {
  if (!WEBHOOKS.calendar) throw new Error('No calendar webhook defined');

  const startTime = new Date(startTimeIso);
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // אימון של שעה

  return await callWebhook(WEBHOOKS.calendar, {
    workout_name: workoutName,
    user_email: userEmail,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString()
  });
}

// PHASE 2: POST to Make.com webhook for Telegram daily-report registration
export async function registerTelegram(telegramId) {
  await sleep(300)
  return { ok: true }
}

// Haptic feedback stub — Phase 2: navigator.vibrate patterns per event type
export function haptic(kind = 'light') {
  // intentionally a no-op in Phase 1
}

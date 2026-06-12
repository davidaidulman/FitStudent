// ─────────────────────────────────────────────────────────────
// AI integration stubs — Phase 1 returns mock data.
// Every function keeps the exact signature Phase 2 will need,
// so swapping in real calls is a body-only change.
// ─────────────────────────────────────────────────────────────
import { foodResults, recipes, planTemplates } from '../data/mockData'
import { DAY_KEYS } from '../utils/dates'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// PHASE 2: POST to Make.com webhook at https://hook.make.com/<scenario-A-food-analysis>
// body: { image_base64, user_id, meal_type } → Claude Vision + Perplexity verified JSON
export async function analyzeFoodImage(imageBase64) {
  await sleep(2000) // simulate Claude Vision latency
  return foodResults[Math.floor(Math.random() * foodResults.length)]
}

// PHASE 2: POST to Make.com webhook at https://hook.make.com/<scenario-B-fridge-recipe>
// body: { image_base64, user_id } → Claude Vision ingredients → Claude recipe → Imagen image
export async function generateRecipeFromFridge(imageBase64) {
  await sleep(3000) // simulate full Scenario B chain latency
  return recipes[Math.floor(Math.random() * recipes.length)]
}

// PHASE 2: POST image to Make.com Scenario B step 1 → Claude Vision returns the
// list of ingredients it detected in the fridge photo (user can then correct it).
export async function detectFridgeIngredients(imageBase64) {
  await sleep(2500)
  const r = recipes[Math.floor(Math.random() * recipes.length)]
  // mock: surface the chosen recipe's ingredients as if "detected", plus staples
  return r.ingredients.slice(0, 5)
}

// PHASE 2: POST the (corrected) ingredient list to Make.com → Claude builds a
// recipe from exactly those ingredients. Phase 1 returns a close mock match.
export async function recipeFromIngredients(ingredients) {
  await sleep(2000)
  const joined = (ingredients || []).join(' ')
  // try to surface a recipe that shares an ingredient keyword; else random
  const match = recipes.find((r) => r.ingredients.some((ing) => joined.includes(ing.split(' ')[0])))
  return match || recipes[Math.floor(Math.random() * recipes.length)]
}

// PHASE 2: replace with Gemini API call via Make.com Scenario E
// ("Create a personalized weekly workout plan... Return JSON {monday:{...}}")
// Phase 1: static template generator — picks a preset weekly template by
// discipline + experience, schedules workouts_per_week training days.
export function generateWorkoutPlan({ experience, workouts_per_week, workout_type = 'gym' }) {
  const discipline = planTemplates[workout_type] || planTemplates.gym
  const template = discipline[experience] || discipline.beginner || planTemplates.gym.beginner
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
      return { day_of_week: day, workout_name: 'מנוחה', muscle_groups: '', exercises: [], workout_type }
    }
    const workout = template[slotIndex % template.length]
    return {
      day_of_week: day,
      workout_name: workout.workout_name,
      muscle_groups: workout.muscle_groups,
      exercises: workout.exercises,
      workout_type,
    }
  })
}

// Build a single day's workout from a discipline template — used when the user
// mixes disciplines across the week (e.g. Sun gym, Mon pilates) in My Plan.
export function workoutForDiscipline(workout_type, experience, variant = 0) {
  const disc = planTemplates[workout_type] || planTemplates.gym
  const tmpl = disc[experience] || disc.beginner || planTemplates.gym.beginner
  const w = tmpl[Math.abs(variant) % tmpl.length]
  return {
    workout_name: w.workout_name,
    muscle_groups: w.muscle_groups,
    exercises: w.exercises,
    workout_type,
  }
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

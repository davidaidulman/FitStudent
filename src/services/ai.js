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

// PHASE 2: replace with Gemini API call via Make.com Scenario E
// ("Create a personalized weekly workout plan... Return JSON {monday:{...}}")
// Phase 1: static template generator — picks a preset weekly template by
// experience, schedules workouts_per_week training days across the week.
export function generateWorkoutPlan({ experience, workouts_per_week, goal }) {
  const template = planTemplates[experience] || planTemplates.beginner
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
      return { day_of_week: day, workout_name: 'מנוחה', muscle_groups: '', exercises: [] }
    }
    const workout = template[slotIndex % template.length]
    return {
      day_of_week: day,
      workout_name: workout.workout_name,
      muscle_groups: workout.muscle_groups,
      exercises: workout.exercises,
    }
  })
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

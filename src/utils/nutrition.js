// Nutrition formulas — exact Mifflin-St Jeor per Build Plan §9.
// PHASE 2: protein target will come from Perplexity research query via Make.com;
// until then we use the 1.6–2.2 g/kg evidence-based range by goal.

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'יושבני', desc: 'ללא פעילות' },
  { value: 'light', label: 'קל', desc: '1–3 אימונים בשבוע' },
  { value: 'moderate', label: 'מתון', desc: '3–5 אימונים בשבוע' },
  { value: 'active', label: 'פעיל', desc: '6–7 אימונים בשבוע' },
  { value: 'very_active', label: 'מאוד פעיל', desc: 'אימונים כפולים' },
]

export function calcBMR({ gender, weight_kg, height_cm, age }) {
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age
  return Math.round(gender === 'male' ? base + 5 : base - 161)
}

export function calcTDEE(bmr, activityLevel) {
  return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.2))
}

export function calcCalorieTarget(tdee, goal) {
  if (goal === 'bulk') return tdee + 300
  if (goal === 'cut') return tdee - 500
  return tdee
}

// Protein g/kg by goal (within the 1.6–2.2 research range)
const PROTEIN_PER_KG = { bulk: 2.0, cut: 2.2, maintain: 1.8 }

export function calcMacros({ calorieTarget, weight_kg, goal }) {
  const protein_g = Math.round(weight_kg * (PROTEIN_PER_KG[goal] || 1.8))
  const fat_g = Math.round((calorieTarget * 0.25) / 9) // fat = 25% of calories
  const carbs_g = Math.round((calorieTarget - protein_g * 4 - fat_g * 9) / 4)
  return { protein_g, fat_g, carbs_g: Math.max(carbs_g, 0) }
}

// Full pipeline: profile form values -> all computed targets
export function calcAllTargets(profile) {
  const bmr = calcBMR(profile)
  const tdee = calcTDEE(bmr, profile.activity_level)
  const calorie_target = calcCalorieTarget(tdee, profile.goal)
  const { protein_g, carbs_g, fat_g } = calcMacros({
    calorieTarget: calorie_target,
    weight_kg: profile.weight_kg,
    goal: profile.goal,
  })
  return {
    bmr,
    tdee,
    calorie_target,
    protein_target_g: protein_g,
    carbs_target_g: carbs_g,
    fat_target_g: fat_g,
  }
}

# FitStudent 🏋️ — Phase 1 Alpha

מערכת מידע לניהול תזונה ואימונים לסטודנטים · קבוצה 42 · יסודות מערכות מידע · BGU תשפ"ו

React SPA + Supabase (auth + database). Mobile-first, dark/lime design, Hebrew RTL.

---

## 1. Local setup

```bash
npm install
npm run dev
```

Open http://localhost:5173

Optional: copy `.env.example` to `.env` (the app falls back to the built-in Supabase keys if absent).

## 2. Supabase setup (one-time, already done for the team project)

1. Open the Supabase Dashboard → **SQL Editor** → **New query**
2. Paste the full contents of [`supabase/schema.sql`](supabase/schema.sql) and run it
3. In **Authentication → Providers → Email**: disable **"Confirm email"** (alpha has no
   verification flow — sign-up must return a session immediately)

That creates all 6 tables (`users`, `food_log`, `workout_log`, `workout_plan`, `weight_log`,
`recipes_cache`) with Row Level Security so every user only sees their own data.

## 3. Deploy to Vercel (one command)

```bash
npx vercel --prod
```

`vercel.json` already contains the SPA rewrite rule so React Router routes work on refresh.
Framework preset: **Vite** (auto-detected). No env vars required (keys are baked in for alpha).

## 4. Demo Mode 🎬

On the login screen, press **"מצב דמו — כניסה בלחיצה אחת"**:

- Logs into the fixed demo account `fitstudent.demo42@gmail.com` / `demo1234`
  (Supabase rejects `@fitstudent.app` addresses — the domain has no MX records,
  so the demo account uses a deliverable domain)
- Creates the account + a preset profile (24M, 178cm, 75kg, bulk, intermediate, 4 workouts/week)
  and a full weekly workout plan on first use
- Perfect for the live presentation — no typing needed

## 5. Phase 2 integration map 🔌

All AI features are stubbed and structured for drop-in replacement:

| Feature | File / function | Replace with |
|---|---|---|
| Meal photo analysis | `src/services/ai.js` → `analyzeFoodImage()` | POST to Make.com Scenario A webhook (Claude Vision + Perplexity verification) |
| Fridge → recipe | `src/services/ai.js` → `generateRecipeFromFridge()` | POST to Make.com Scenario B webhook (Claude Vision → Claude recipe → Gemini Imagen image) |
| Workout plan generation | `src/services/ai.js` → `generateWorkoutPlan()` | Make.com Scenario E → Gemini weekly-plan JSON |
| Protein target research | `src/utils/nutrition.js` → `calcMacros()` (PROTEIN_PER_KG) | Perplexity research query result via Scenario E |
| Telegram daily reports | `src/services/ai.js` → `registerTelegram()` + Profile → Settings | Make.com Scenarios C (07:00) + D (20:00) + Telegram Bot |
| Recipe images | `RecipeCard` emoji placeholder in `src/pages/Nutrition.jsx` | `image_url` from Gemini Imagen, cached in `recipes_cache` |
| Haptics | `src/services/ai.js` → `haptic()` | `navigator.vibrate` patterns |

Image upload flows already capture the file (`<input type="file" accept="image/*">`) — Phase 2
only adds base64 conversion + the webhook POST inside the two stub functions.

## Project structure

```
src/
  lib/supabase.js        Supabase client
  context/AuthContext.jsx Session + profile state (onAuthStateChange)
  services/ai.js         AI stubs (Phase 2 swap points)
  utils/nutrition.js     BMR / TDEE / macro formulas (Mifflin-St Jeor)
  utils/dates.js         Hebrew dates, day-of-week keys
  data/mockData.js       Mock food results, recipes, plan templates, exercise library, tips
  components/            ProgressRing, BottomNav, SubTabs, Toast, Confetti, Splash
  pages/                 Auth, Onboarding (4 steps), Home, Nutrition, Workouts, Profile
supabase/schema.sql      Full DB schema + RLS policies
```

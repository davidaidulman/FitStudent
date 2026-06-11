-- ============================================================
--  FitStudent — Supabase schema (Phase 1)
--  Run in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users profile table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male','female')),
  height_cm NUMERIC,
  weight_kg NUMERIC,
  target_weight_kg NUMERIC,
  body_type TEXT CHECK (body_type IN ('ecto','meso','endo')),
  goal TEXT CHECK (goal IN ('bulk','cut','maintain')),
  activity_level TEXT,
  workouts_per_week INTEGER,
  experience TEXT CHECK (experience IN ('beginner','intermediate','advanced')),
  dietary_restrictions JSONB DEFAULT '[]',
  bmr NUMERIC,
  tdee NUMERIC,
  calorie_target NUMERIC,
  protein_target_g NUMERIC,
  carbs_target_g NUMERIC,
  fat_target_g NUMERIC,
  telegram_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS food_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  meal_type TEXT CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  items_json JSONB DEFAULT '[]',
  calories NUMERIC DEFAULT 0,
  protein_g NUMERIC DEFAULT 0,
  carbs_g NUMERIC DEFAULT 0,
  fat_g NUMERIC DEFAULT 0,
  confidence INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  workout_name TEXT,
  exercises_json JSONB DEFAULT '[]',
  duration_min INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_plan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  day_of_week TEXT,
  workout_name TEXT,
  muscle_groups TEXT,
  exercises_json JSONB DEFAULT '[]',
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weight_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  weight_kg NUMERIC,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipes_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_name TEXT,
  ingredients_hash TEXT,
  recipe_json JSONB,
  image_url TEXT,
  macros_json JSONB,
  cost_ils NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (CRITICAL — users can only see their own data)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users: own row only" ON users
  FOR ALL USING (auth.uid() = id);
CREATE POLICY "Food log: own rows only" ON food_log
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Workout log: own rows only" ON workout_log
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Workout plan: own rows only" ON workout_plan
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Weight log: own rows only" ON weight_log
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Recipes cache: public read, auth write" ON recipes_cache
  FOR SELECT USING (true);
CREATE POLICY "Recipes cache: insert if authenticated" ON recipes_cache
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

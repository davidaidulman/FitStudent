import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dumbbell, ChefHat, Droplets, Lightbulb, ChevronLeft } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import ProgressRing from '../components/ProgressRing'
import { recipes, dailyTips } from '../data/mockData'
import { hebrewToday, todayISO, todayKey, last7Days, DAY_LETTERS_HE } from '../utils/dates'

const WATER_TARGET_ML = 2500

export default function Home() {
  const { user, profile } = useAuth()
  const [todayLogs, setTodayLogs] = useState([])
  const [weekLogs, setWeekLogs] = useState([])
  const [todayWorkout, setTodayWorkout] = useState(null)
  const [waterMl, setWaterMl] = useState(0) // Phase 1: not persisted, resets on reload

  const dayIndex = new Date().getDay()
  const tip = dailyTips[dayIndex % dailyTips.length]
  const recipe = useMemo(() => recipes[Math.floor(Math.random() * recipes.length)], [])

  useEffect(() => {
    if (!user) return
    const days = last7Days()

    supabase
      .from('food_log')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', days[0])
      .then(({ data }) => {
        const logs = data || []
        setWeekLogs(logs)
        setTodayLogs(logs.filter((l) => l.date === todayISO()))
      })

    supabase
      .from('workout_plan')
      .select('*')
      .eq('user_id', user.id)
      .eq('day_of_week', todayKey())
      .maybeSingle()
      .then(({ data }) => setTodayWorkout(data))
  }, [user])

  const totals = todayLogs.reduce(
    (acc, l) => ({
      calories: acc.calories + (+l.calories || 0),
      protein: acc.protein + (+l.protein_g || 0),
      carbs: acc.carbs + (+l.carbs_g || 0),
      fat: acc.fat + (+l.fat_g || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const chartData = last7Days().map((date) => ({
    day: DAY_LETTERS_HE[new Date(date + 'T12:00:00').getDay()],
    date,
    calories: weekLogs.filter((l) => l.date === date).reduce((s, l) => s + (+l.calories || 0), 0),
  }))

  const calTarget = +profile?.calorie_target || 2000
  const isRest = !todayWorkout || todayWorkout.workout_name === 'מנוחה'
  const exercises = todayWorkout?.exercises_json || []

  return (
    <div className="px-4 pt-6 pb-20 flex flex-col gap-4 relative z-10">
      {/* header */}
      <header className="fade-up">
        <h1 className="text-2xl font-black">שלום {profile?.nickname || ''}! 👋</h1>
        <p className="label-muted">{hebrewToday()} 📅</p>
      </header>

      {/* daily targets — calorie + macro rings */}
      <section className="card fade-up fade-up-1">
        <h2 className="section-title mb-4">יעדי היום</h2>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col items-center gap-1">
            <ProgressRing
              size={88}
              stroke={8}
              value={totals.calories}
              max={calTarget}
              color="var(--lime)"
              glow
              label={Math.round(totals.calories)}
              sublabel={`/ ${calTarget}`}
            />
            <span className="label-muted">🔥 קק"ל</span>
          </div>
          <MacroRing value={totals.protein} max={+profile?.protein_target_g || 140} color="var(--blue)" label="חלבון" />
          <MacroRing value={totals.carbs} max={+profile?.carbs_target_g || 220} color="var(--orange)" label="פחמימות" />
          <MacroRing value={totals.fat} max={+profile?.fat_target_g || 65} color="var(--purple)" label="שומן" />
        </div>
      </section>

      {/* next workout */}
      <section className="card fade-up fade-up-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="section-title">📍 האימון הבא</h2>
        </div>
        {isRest ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-lg">יום מנוחה 💤</p>
              <p className="label-muted">הגוף בונה שריר דווקא במנוחה</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-lg">{todayWorkout.workout_name}</p>
              <p className="label-muted">
                {todayWorkout.muscle_groups} · {exercises.length} תרגילים · ~
                {Math.max(exercises.length * 9, 20)} דק׳
              </p>
            </div>
            <Link
              to="/workouts?tab=today"
              className="btn-primary !w-auto px-4 py-2 text-sm flex items-center gap-1"
            >
              התחל
              <ChevronLeft size={15} />
            </Link>
          </div>
        )}
      </section>

      {/* recommended recipe */}
      <section className="card fade-up fade-up-3">
        <h2 className="section-title mb-2">🍽️ מתכון מומלץ להיום</h2>
        <div className="flex items-center gap-3">
          <div
            className="card-2 flex items-center justify-center text-4xl shrink-0"
            style={{ width: 72, height: 72 }}
          >
            {recipe.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate">{recipe.name}</p>
            <p className="label-muted">
              {recipe.macros.calories} קק"ל · {recipe.macros.protein_g}g חלבון · {recipe.prep_time_min} דק׳
            </p>
          </div>
          <Link to="/nutrition?tab=fridge" className="shrink-0">
            <ChefHat size={20} style={{ color: 'var(--lime)' }} />
          </Link>
        </div>
      </section>

      {/* weekly progress chart */}
      <section className="card fade-up fade-up-4">
        <h2 className="section-title mb-3">📊 ההתקדמות השבועית</h2>
        <div style={{ height: 150 }} dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={{
                  background: 'var(--bg-card-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  fontSize: 12,
                }}
                labelStyle={{ color: 'var(--muted)' }}
                formatter={(v) => [`${Math.round(v)} קק"ל`, '']}
              />
              <ReferenceLine
                y={calTarget}
                stroke="#C8F000"
                strokeDasharray="4 4"
                strokeOpacity={0.6}
              />
              <Bar dataKey="calories" radius={[6, 6, 0, 0]}>
                {chartData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.date === todayISO() ? '#C8F000' : 'rgba(200,240,0,0.28)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="label-muted text-center mt-1" style={{ fontSize: 11 }}>
          קלוריות יומיות · קו מקווקו = היעד שלך ({calTarget})
        </p>
      </section>

      {/* water tracker */}
      <section className="card fade-up fade-up-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="section-title flex items-center gap-2">
            <Droplets size={18} style={{ color: 'var(--teal)' }} />
            מעקב מים
          </h2>
          <span className="label-muted">
            {(waterMl / 1000).toFixed(2)} / {WATER_TARGET_ML / 1000} ליטר
          </span>
        </div>
        <div className="h-3 rounded-full overflow-hidden mb-3" style={{ background: 'var(--bg-card-2)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min((waterMl / WATER_TARGET_ML) * 100, 100)}%`,
              background: 'var(--lime)',
              boxShadow: '0 0 12px rgba(200,240,0,0.5)',
            }}
          />
        </div>
        <div className="flex gap-2">
          <button
            className="btn-ghost !py-2 text-sm"
            style={{ color: 'var(--teal)', borderColor: 'rgba(45,212,191,0.3)' }}
            onClick={() => setWaterMl((w) => Math.min(w + 250, 5000))}
          >
            + 250 מ"ל 💧
          </button>
          <button
            className="btn-ghost !py-2 text-sm !w-auto px-4"
            onClick={() => setWaterMl(0)}
          >
            איפוס
          </button>
        </div>
      </section>

      {/* daily tip */}
      <section
        className="card fade-up fade-up-6"
        style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(26,26,0,0.5) 100%)', borderColor: 'var(--lime-border)' }}
      >
        <h2 className="text-sm font-bold mb-1 flex items-center gap-1.5" style={{ color: 'var(--lime)' }}>
          <Lightbulb size={15} />
          המלצת היום
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
          {tip}
        </p>
      </section>
    </div>
  )
}

function MacroRing({ value, max, color, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <ProgressRing
        size={56}
        stroke={5}
        value={value}
        max={max}
        color={color}
        label={`${Math.round(value)}`}
      />
      <span className="label-muted" style={{ fontSize: 11 }}>
        {label}
        <span className="block text-center" style={{ fontSize: 10 }}>
          / {Math.round(max)}g
        </span>
      </span>
    </div>
  )
}

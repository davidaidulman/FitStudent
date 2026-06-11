// Horizontal sub-tab pills used in Nutrition / Workouts / Profile screens
export default function SubTabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`chip ${active === t.key ? 'active' : ''}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

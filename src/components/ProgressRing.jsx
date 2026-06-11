// Animated SVG progress ring — calorie ring (80px) + macro rings (56px)
export default function ProgressRing({
  size = 80,
  stroke = 7,
  value = 0,
  max = 100,
  color = 'var(--lime)',
  label,
  sublabel,
  glow = false,
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = max > 0 ? Math.min(value / max, 1) : 0
  const offset = circumference * (1 - pct)

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--bg-card-2)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="ring-animate"
            style={{
              '--ring-circumference': circumference,
              filter: glow ? `drop-shadow(0 0 8px ${color === 'var(--lime)' ? 'rgba(200,240,0,0.45)' : color})` : 'none',
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.3,0.8,0.3,1)',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {label && (
            <span className="font-extrabold leading-none" style={{ fontSize: size / 4.6 }}>
              {label}
            </span>
          )}
          {sublabel && (
            <span className="label-muted leading-tight" style={{ fontSize: Math.max(size / 8, 9) }}>
              {sublabel}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

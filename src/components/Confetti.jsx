// Celebration burst shown on workout completion
const COLORS = ['#C8F000', '#4D9FFF', '#FF8C42', '#A78BFA', '#2DD4BF', '#F0F0F0']

export default function Confetti({ count = 36 }) {
  const pieces = Array.from({ length: count }, (_, i) => ({
    left: `${(i * 137.5) % 100}%`,
    color: COLORS[i % COLORS.length],
    delay: `${(i % 12) * 0.07}s`,
    duration: `${1.6 + ((i * 7) % 10) / 10}s`,
  }))
  return (
    <>
      {pieces.map((p, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: p.left,
            background: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </>
  )
}

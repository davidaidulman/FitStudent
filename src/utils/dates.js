export const DAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

export const DAY_NAMES_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
export const DAY_LETTERS_HE = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']

export function todayKey() {
  return DAY_KEYS[new Date().getDay()]
}

export function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function dateISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// "יום רביעי, 11 ביוני" style header date
export function hebrewToday() {
  return new Intl.DateTimeFormat('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
}

export function hebrewShortDate(dateStr) {
  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(dateStr))
}

// last 7 days as ISO strings, oldest first (for weekly chart)
export function last7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(dateISO(d))
  }
  return days
}

// ─────────────────────────────────────────────────────────────
// FitStudent mock data — Phase 1
// PHASE 2: foodResults + recipes will be replaced by real AI
// responses coming back from Make.com webhooks (see src/services/ai.js)
// ─────────────────────────────────────────────────────────────

// 5 mock food-image analysis results
export const foodResults = [
  {
    name: 'חזה עוף + אורז לבן + ברוקולי',
    emoji: '🍗',
    items: [
      { name: 'חזה עוף בגריל', weight_g: 150 },
      { name: 'אורז לבן מבושל', weight_g: 200 },
      { name: 'ברוקולי מאודה', weight_g: 100 },
    ],
    calories: 520,
    protein_g: 48,
    carbs_g: 58,
    fat_g: 8,
    confidence: 92,
  },
  {
    name: 'שקשוקה עם לחם מלא',
    emoji: '🍳',
    items: [
      { name: 'שקשוקה (2 ביצים)', weight_g: 250 },
      { name: 'לחם מלא', weight_g: 60 },
    ],
    calories: 430,
    protein_g: 22,
    carbs_g: 38,
    fat_g: 21,
    confidence: 88,
  },
  {
    name: 'קערת יוגורט, גרנולה ובננה',
    emoji: '🥣',
    items: [
      { name: 'יוגורט יווני 5%', weight_g: 200 },
      { name: 'גרנולה', weight_g: 40 },
      { name: 'בננה', weight_g: 100 },
    ],
    calories: 390,
    protein_g: 24,
    carbs_g: 49,
    fat_g: 11,
    confidence: 95,
  },
  {
    name: 'פסטה בולונז',
    emoji: '🍝',
    items: [
      { name: 'פסטה מבושלת', weight_g: 220 },
      { name: 'רוטב בולונז בקר', weight_g: 150 },
      { name: 'פרמזן מגורר', weight_g: 15 },
    ],
    calories: 640,
    protein_g: 34,
    carbs_g: 78,
    fat_g: 20,
    confidence: 85,
  },
  {
    name: 'סלט טונה גדול',
    emoji: '🥗',
    items: [
      { name: 'טונה במים', weight_g: 120 },
      { name: 'ירקות סלט', weight_g: 200 },
      { name: 'שמן זית', weight_g: 10 },
      { name: 'תירס', weight_g: 50 },
    ],
    calories: 350,
    protein_g: 33,
    carbs_g: 18,
    fat_g: 16,
    confidence: 90,
  },
]

// 8 mock fridge→recipe results
export const recipes = [
  {
    name: 'אומלט חלבון עם גבינה וירקות',
    emoji: '🍳',
    prep_time_min: 8,
    servings: 1,
    cost_ils: 9,
    ingredients: ['3 ביצים', 'גבינה לבנה 5% (3 כפות)', 'עגבנייה', 'בצל קטן', 'מעט שמן זית', 'מלח ופלפל'],
    steps: [
      'קוצצים את הבצל והעגבנייה לקוביות קטנות.',
      'מקציפים את הביצים עם מלח ופלפל.',
      'מחממים מחבת עם מעט שמן זית ומזהיבים את הבצל.',
      'מוסיפים את הביצים, ואחרי דקה את העגבנייה והגבינה.',
      'מקפלים את האומלט ומבשלים עוד דקה — מוכן!',
    ],
    macros: { calories: 380, protein_g: 32, carbs_g: 8, fat_g: 24 },
  },
  {
    name: 'מוקפץ עוף ואורז של סטודנטים',
    emoji: '🥡',
    prep_time_min: 20,
    servings: 2,
    cost_ils: 22,
    ingredients: ['400 גרם חזה עוף', 'כוס אורז', 'גזר', 'בצל', 'רוטב סויה (3 כפות)', 'שן שום', 'כף שמן'],
    steps: [
      'מבשלים את האורז לפי ההוראות על האריזה.',
      'חותכים את העוף לקוביות ואת הירקות לרצועות.',
      'מקפיצים את העוף במחבת חמה עם שמן 5–6 דקות.',
      'מוסיפים ירקות ושום ומקפיצים עוד 4 דקות.',
      'מוסיפים סויה ואת האורז המבושל, מערבבים ומגישים.',
    ],
    macros: { calories: 560, protein_g: 49, carbs_g: 62, fat_g: 11 },
  },
  {
    name: 'טוסט טונה ממכר',
    emoji: '🥪',
    prep_time_min: 7,
    servings: 1,
    cost_ils: 8,
    ingredients: ['2 פרוסות לחם מלא', 'קופסת טונה במים', 'כף גבינת שמנת לייט', 'מלפפון חמוץ', 'בצל סגול'],
    steps: [
      'מסננים את הטונה ומערבבים עם גבינת השמנת.',
      'קוצצים מלפפון חמוץ ובצל ומוסיפים לתערובת.',
      'מורחים על הלחם וסוגרים טוסט.',
      'מטגנים בטוסטר 4–5 דקות עד הזהבה.',
    ],
    macros: { calories: 420, protein_g: 35, carbs_g: 40, fat_g: 13 },
  },
  {
    name: 'שייק חלבון בננה-שיבולת',
    emoji: '🥤',
    prep_time_min: 4,
    servings: 1,
    cost_ils: 7,
    ingredients: ['כוס חלב', 'בננה', '3 כפות שיבולת שועל', 'כף חמאת בוטנים', 'קוביות קרח'],
    steps: [
      'שמים את כל המרכיבים בבלנדר.',
      'טוחנים 45 שניות עד מרקם חלק.',
      'מוזגים לכוס גבוהה ושותים קר.',
    ],
    macros: { calories: 450, protein_g: 19, carbs_g: 62, fat_g: 15 },
  },
  {
    name: 'קוסקוס עדשים חם',
    emoji: '🍲',
    prep_time_min: 15,
    servings: 2,
    cost_ils: 10,
    ingredients: ['כוס קוסקוס', 'כוס עדשים מבושלות', 'בצל מטוגן', 'כמון', 'פפריקה', 'שמן זית'],
    steps: [
      'מכינים את הקוסקוס עם מים רותחים לפי ההוראות.',
      'מטגנים בצל עד הזהבה עמוקה.',
      'מערבבים קוסקוס, עדשים, בצל ותבלינים.',
      'מזליפים שמן זית ומגישים חם.',
    ],
    macros: { calories: 480, protein_g: 20, carbs_g: 80, fat_g: 9 },
  },
  {
    name: 'פסטה ברוטב עגבניות וגבינה בולגרית',
    emoji: '🍝',
    prep_time_min: 18,
    servings: 2,
    cost_ils: 14,
    ingredients: ['250 גרם פסטה', 'רסק עגבניות', '2 עגבניות', '100 גרם בולגרית', 'שום', 'בזיליקום'],
    steps: [
      'מבשלים את הפסטה אל-דנטה.',
      'מטגנים שום, מוסיפים עגבניות קצוצות ורסק.',
      'מבשלים את הרוטב 8 דקות על אש בינונית.',
      'מערבבים עם הפסטה ומפוררים בולגרית מעל.',
    ],
    macros: { calories: 620, protein_g: 24, carbs_g: 95, fat_g: 16 },
  },
  {
    name: 'קערת קוטג׳ פירות ואגוזים',
    emoji: '🍓',
    prep_time_min: 5,
    servings: 1,
    cost_ils: 9,
    ingredients: ['גביע קוטג׳ 5%', 'תפוח', 'חופן אגוזי מלך', 'כפית דבש', 'קינמון'],
    steps: [
      'שופכים את הקוטג׳ לקערה.',
      'חותכים תפוח לקוביות ומפזרים מעל.',
      'מוסיפים אגוזים, דבש וקינמון.',
    ],
    macros: { calories: 340, protein_g: 26, carbs_g: 30, fat_g: 14 },
  },
  {
    name: 'פיתה ביצה קשה וטחינה',
    emoji: '🫓',
    prep_time_min: 12,
    servings: 1,
    cost_ils: 6,
    ingredients: ['פיתה מלאה', '2 ביצים קשות', '2 כפות טחינה גולמית', 'עגבנייה', 'פטרוזיליה', 'לימון'],
    steps: [
      'מבשלים את הביצים 9 דקות במים רותחים.',
      'מכינים טחינה עם מים, לימון ומלח.',
      'פורסים ביצים ועגבנייה וממלאים את הפיתה.',
      'מזליפים טחינה ומפזרים פטרוזיליה.',
    ],
    macros: { calories: 460, protein_g: 24, carbs_g: 42, fat_g: 22 },
  },
]

// ─────────────────────────────────────────────────────────────
// Workout disciplines — the user picks one in onboarding; it drives
// both the generated weekly plan (planTemplates) and the exercise library.
// ─────────────────────────────────────────────────────────────

export const DISCIPLINES = [
  { key: 'gym', label: 'חדר כושר', emoji: '🏋️', desc: 'אימוני כוח והתנגדות' },
  { key: 'yoga', label: 'יוגה', emoji: '🧘', desc: 'גמישות, נשימה ושיווי משקל' },
  { key: 'pilates', label: 'פילאטיס', emoji: '🤸', desc: 'ליבה, יציבה ושליטה' },
  { key: 'crossfit', label: 'קרוספיט', emoji: '🔥', desc: 'אימון פונקציונלי עצים' },
]

export const DISCIPLINE_LABELS = Object.fromEntries(DISCIPLINES.map((d) => [d.key, d.label]))
export const DISCIPLINE_EMOJI = Object.fromEntries(DISCIPLINES.map((d) => [d.key, d.emoji]))

// Crossfit workout sections, like a real box programs a session
export const CROSSFIT_SECTIONS = [
  { key: 'warmup', label: 'חימום' },
  { key: 'strength', label: 'כוח' },
  { key: 'aerobic', label: 'אירובי' },
  { key: 'metcon', label: 'מטקון (WOD)' },
  { key: 'finisher', label: 'גמר' },
]
export const CROSSFIT_SECTION_LABELS = Object.fromEntries(CROSSFIT_SECTIONS.map((s) => [s.key, s.label]))

// ─────────────────────────────────────────────────────────────
// Weekly workout-plan templates, keyed by discipline → experience level.
// Each level is an ordered list of TRAINING days (rest days are filled by
// the generator according to workouts_per_week). For non-gym disciplines
// "reps" often means seconds/breaths — see each exercise description.
// ─────────────────────────────────────────────────────────────

const GYM = {
  beginner: [
    {
      workout_name: 'גוף מלא A',
      muscle_groups: 'חזה, גב, רגליים',
      exercises: [
        { name: 'סקוואט במשקל גוף', sets: 3, reps: 12, weight_kg: 0, description: 'שמור על גב ישר וירידה עמוקה' },
        { name: 'לחיצת חזה במכונה', sets: 3, reps: 10, weight_kg: 20, description: 'תנועה מבוקרת, ללא נעילת מרפקים' },
        { name: 'חתירה במכונה', sets: 3, reps: 12, weight_kg: 25, description: 'משוך את השכמות אחורה' },
        { name: 'פלאנק', sets: 3, reps: 30, weight_kg: 0, description: '30 שניות החזקה, גוף בקו ישר' },
      ],
    },
    {
      workout_name: 'גוף מלא B',
      muscle_groups: 'כתפיים, ידיים, רגליים',
      exercises: [
        { name: 'לחיצת כתפיים בישיבה', sets: 3, reps: 10, weight_kg: 8, description: 'גב נשען על המשענת' },
        { name: 'כפיפת מרפקים עם משקולות', sets: 3, reps: 12, weight_kg: 6, description: 'ללא נדנוד הגוף' },
        { name: 'לונג׳ים', sets: 3, reps: 10, weight_kg: 0, description: '10 חזרות לכל רגל' },
        { name: 'כפיפות בטן', sets: 3, reps: 15, weight_kg: 0, description: 'סנטר לא נצמד לחזה' },
      ],
    },
    {
      workout_name: 'גוף מלא C',
      muscle_groups: 'גב, חזה, ליבה',
      exercises: [
        { name: 'משיכת פולי עליון', sets: 3, reps: 10, weight_kg: 30, description: 'משיכה לכיוון החזה העליון' },
        { name: 'שכיבות סמיכה', sets: 3, reps: 10, weight_kg: 0, description: 'אפשר על הברכיים בהתחלה' },
        { name: 'גשר ישבן', sets: 3, reps: 15, weight_kg: 0, description: 'כיווץ חזק למעלה, ירידה איטית' },
        { name: 'פלאנק צדי', sets: 2, reps: 20, weight_kg: 0, description: '20 שניות לכל צד' },
      ],
    },
  ],
  intermediate: [
    {
      workout_name: 'חזה + כתפיים',
      muscle_groups: 'חזה, כתפיים, יד אחורית',
      exercises: [
        { name: 'לחיצת חזה במוט', sets: 4, reps: 8, weight_kg: 50, description: 'מוט יורד לאמצע החזה' },
        { name: 'לחיצת חזה משופע במשקולות', sets: 3, reps: 10, weight_kg: 18, description: 'ספסל בזווית 30°' },
        { name: 'לחיצת כתפיים במשקולות', sets: 4, reps: 10, weight_kg: 14, description: 'ללא קשת מוגזמת בגב' },
        { name: 'הרחקות צד', sets: 3, reps: 14, weight_kg: 7, description: 'מרפקים מעט כפופים' },
        { name: 'פשיטת מרפקים בפולי', sets: 3, reps: 12, weight_kg: 20, description: 'מרפקים צמודים לגוף' },
      ],
    },
    {
      workout_name: 'גב + יד קדמית',
      muscle_groups: 'גב, יד קדמית',
      exercises: [
        { name: 'מתח (או פולי עליון)', sets: 4, reps: 8, weight_kg: 0, description: 'אחיזה רחבה, סנטר מעל המוט' },
        { name: 'חתירת מוט בשיפוע', sets: 4, reps: 10, weight_kg: 40, description: 'גב ישר, משיכה לבטן' },
        { name: 'חתירת משקולת ביד אחת', sets: 3, reps: 10, weight_kg: 16, description: 'ברך נשענת על ספסל' },
        { name: 'כפיפת מרפקים במוט', sets: 3, reps: 10, weight_kg: 20, description: 'ירידה איטית של 2 שניות' },
        { name: 'פטישים', sets: 3, reps: 12, weight_kg: 10, description: 'אחיזה ניטרלית' },
      ],
    },
    {
      workout_name: 'רגליים',
      muscle_groups: 'רגליים, ישבן, ליבה',
      exercises: [
        { name: 'סקוואט במוט', sets: 4, reps: 8, weight_kg: 60, description: 'ירידה עד מקביל לרצפה לפחות' },
        { name: 'לחיצת רגליים', sets: 4, reps: 12, weight_kg: 120, description: 'ללא נעילת ברכיים למעלה' },
        { name: 'דדליפט רומני', sets: 3, reps: 10, weight_kg: 50, description: 'מתיחה בירך האחורית, גב ניטרלי' },
        { name: 'כפיפת ברכיים במכונה', sets: 3, reps: 12, weight_kg: 35, description: 'תנועה איטית ומבוקרת' },
        { name: 'עליות תאומים', sets: 4, reps: 15, weight_kg: 40, description: 'שהייה של שנייה למעלה' },
      ],
    },
    {
      workout_name: 'כתפיים + ידיים',
      muscle_groups: 'כתפיים, ידיים',
      exercises: [
        { name: 'לחיצת כתפיים במוט', sets: 4, reps: 8, weight_kg: 30, description: 'ליבה אסופה, ללא קפיצות' },
        { name: 'הרחקות צד בכבל', sets: 3, reps: 14, weight_kg: 5, description: 'עבודה איטית ומדויקת' },
        { name: 'פרפר הפוך', sets: 3, reps: 14, weight_kg: 8, description: 'לכתף האחורית' },
        { name: 'כפיפת מרפקים בכבל', sets: 3, reps: 12, weight_kg: 18, description: 'מתח רציף לאורך התנועה' },
        { name: 'מקבילים', sets: 3, reps: 10, weight_kg: 0, description: 'ירידה עד 90° במרפק' },
      ],
    },
  ],
  advanced: [
    {
      workout_name: 'דחיקה כבדה',
      muscle_groups: 'חזה, כתפיים, יד אחורית',
      exercises: [
        { name: 'לחיצת חזה במוט', sets: 5, reps: 5, weight_kg: 80, description: 'עבודת כוח — מנוחה 3 דקות' },
        { name: 'לחיצת חזה משופע במוט', sets: 4, reps: 8, weight_kg: 60, description: 'שליטה מלאה בירידה' },
        { name: 'לחיצת כתפיים בעמידה', sets: 4, reps: 6, weight_kg: 40, description: 'ישבן וליבה מכווצים' },
        { name: 'מקבילים עם משקל', sets: 4, reps: 8, weight_kg: 10, description: 'משקל על חגורה' },
        { name: 'הרחקות צד דרופסט', sets: 3, reps: 12, weight_kg: 10, description: 'דרופ אחד לכל סט' },
      ],
    },
    {
      workout_name: 'משיכה כבדה',
      muscle_groups: 'גב, טרפז, יד קדמית',
      exercises: [
        { name: 'דדליפט', sets: 5, reps: 5, weight_kg: 100, description: 'גב ניטרלי, דחיפה מהרצפה' },
        { name: 'מתח עם משקל', sets: 4, reps: 6, weight_kg: 10, description: 'טווח תנועה מלא' },
        { name: 'חתירת T-Bar', sets: 4, reps: 8, weight_kg: 50, description: 'כיווץ שיא בסוף המשיכה' },
        { name: 'משיכת פנים בכבל', sets: 3, reps: 15, weight_kg: 25, description: 'בריאות הכתף — אל תדלג' },
        { name: 'כפיפת מרפקים במוט W', sets: 4, reps: 10, weight_kg: 30, description: 'ללא תנופה' },
      ],
    },
    {
      workout_name: 'רגליים — קוואדים',
      muscle_groups: 'רגליים קדמיות, ישבן',
      exercises: [
        { name: 'סקוואט במוט', sets: 5, reps: 5, weight_kg: 100, description: 'עומק מלא, חגורת כוח' },
        { name: 'לחיצת רגליים כבדה', sets: 4, reps: 10, weight_kg: 200, description: 'כפות רגליים נמוך במשטח' },
        { name: 'לונג׳ הליכה עם משקולות', sets: 3, reps: 12, weight_kg: 20, description: '12 צעדים לכל רגל' },
        { name: 'פשיטת ברכיים', sets: 3, reps: 15, weight_kg: 50, description: 'שנייה החזקה למעלה' },
        { name: 'עליות תאומים בעמידה', sets: 5, reps: 12, weight_kg: 60, description: 'טווח מלא, ללא קפיצות' },
      ],
    },
    {
      workout_name: 'דחיקה — נפח',
      muscle_groups: 'חזה, כתפיים',
      exercises: [
        { name: 'לחיצת משקולות שטוח', sets: 4, reps: 10, weight_kg: 30, description: 'מתיחה עמוקה למטה' },
        { name: 'פרפר בכבלים', sets: 4, reps: 12, weight_kg: 15, description: 'כיווץ של שנייה באמצע' },
        { name: 'לחיצת ארנולד', sets: 4, reps: 10, weight_kg: 18, description: 'סיבוב מלא של פרק היד' },
        { name: 'הרחקות צד', sets: 4, reps: 15, weight_kg: 8, description: 'עד כשל' },
        { name: 'שכיבות סמיכה איטיות', sets: 3, reps: 15, weight_kg: 0, description: '3 שניות ירידה' },
      ],
    },
    {
      workout_name: 'משיכה + רגל אחורית',
      muscle_groups: 'גב, ירך אחורית, ליבה',
      exercises: [
        { name: 'דדליפט רומני', sets: 4, reps: 8, weight_kg: 80, description: 'דגש מתיחה בירך אחורית' },
        { name: 'משיכת פולי צר', sets: 4, reps: 10, weight_kg: 60, description: 'חזה גבוה, משיכה לבטן' },
        { name: 'כפיפת ברכיים בשכיבה', sets: 4, reps: 12, weight_kg: 40, description: 'ללא ניתוק ירכיים' },
        { name: 'גלגלת בטן', sets: 3, reps: 10, weight_kg: 0, description: 'טווח שאתה שולט בו' },
        { name: 'הרמות רגליים בתליה', sets: 3, reps: 12, weight_kg: 0, description: 'ללא נדנוד' },
      ],
    },
  ],
}

// Yoga — "reps" = שניות החזקה / נשימות. weight always 0.
const YOGA = {
  beginner: [
    {
      workout_name: 'זרימת בוקר עדינה',
      muscle_groups: 'גמישות, נשימה',
      exercises: [
        { name: 'נשימת בטן (פראניאמה)', sets: 1, reps: 120, weight_kg: 0, description: '2 דקות נשימה איטית להרגעת מערכת העצבים' },
        { name: 'תנוחת החתול-פרה', sets: 2, reps: 60, weight_kg: 0, description: 'מעבר איטי בין קימור לקמירה בקצב הנשימה' },
        { name: 'תנוחת הכלב מביט מטה', sets: 3, reps: 45, weight_kg: 0, description: 'עקבים לכיוון הרצפה, גב ארוך וישר' },
        { name: 'תנוחת הילד', sets: 2, reps: 60, weight_kg: 0, description: 'מנוחה ומתיחת גב תחתון' },
      ],
    },
    {
      workout_name: 'פתיחת ירכיים',
      muscle_groups: 'ירכיים, גב תחתון',
      exercises: [
        { name: 'תנוחת היונה', sets: 2, reps: 45, weight_kg: 0, description: '45 שניות לכל צד, נשימה עמוקה' },
        { name: 'תנוחת הפרפר בישיבה', sets: 3, reps: 40, weight_kg: 0, description: 'ברכיים יורדות לצדדים בעדינות' },
        { name: 'כיפוף קדמי בישיבה', sets: 3, reps: 40, weight_kg: 0, description: 'גב ארוך, מתיחה בירך אחורית' },
        { name: 'שאוואסנה (מנוחה)', sets: 1, reps: 120, weight_kg: 0, description: 'הרפיה מלאה בסיום' },
      ],
    },
  ],
  intermediate: [
    {
      workout_name: 'ויניאסה זורמת',
      muscle_groups: 'גוף מלא, ליבה',
      exercises: [
        { name: 'ברכת השמש A', sets: 4, reps: 60, weight_kg: 0, description: 'סבב מלא מסונכרן עם הנשימה' },
        { name: 'תנוחת הלוחם II', sets: 3, reps: 45, weight_kg: 0, description: '45 שניות לכל צד, ירך פתוחה' },
        { name: 'תנוחת המשולש', sets: 2, reps: 40, weight_kg: 0, description: 'צד הגוף ארוך, מבט לאצבעות' },
        { name: 'תנוחת העץ (שיווי משקל)', sets: 2, reps: 40, weight_kg: 0, description: '40 שניות לכל רגל' },
        { name: 'שאוואסנה', sets: 1, reps: 150, weight_kg: 0, description: 'הרפיה מודרכת' },
      ],
    },
    {
      workout_name: 'כוח וליבה',
      muscle_groups: 'ליבה, זרועות',
      exercises: [
        { name: 'תנוחת הסירה', sets: 3, reps: 30, weight_kg: 0, description: 'ליבה אסופה, רגליים מורמות' },
        { name: 'פלאנק יוגה (צד)', sets: 3, reps: 30, weight_kg: 0, description: '30 שניות לכל צד' },
        { name: 'תנוחת הכיסא', sets: 3, reps: 45, weight_kg: 0, description: 'ירכיים אחורה, גב ישר' },
        { name: 'גשר / רותם', sets: 3, reps: 40, weight_kg: 0, description: 'הרמת אגן עם כיווץ ישבן' },
      ],
    },
  ],
  advanced: [
    {
      workout_name: 'ויניאסה מתקדמת',
      muscle_groups: 'גוף מלא, איזון',
      exercises: [
        { name: 'ברכת השמש B', sets: 5, reps: 60, weight_kg: 0, description: 'סבב מלא בקצב נמרץ' },
        { name: 'עורב (Bakasana)', sets: 3, reps: 25, weight_kg: 0, description: 'איזון ידיים — התקדם בהדרגה' },
        { name: 'תנוחת הלוחם III', sets: 3, reps: 30, weight_kg: 0, description: 'שיווי משקל על רגל אחת' },
        { name: 'גלגל (Urdhva Dhanurasana)', sets: 3, reps: 30, weight_kg: 0, description: 'פתיחת חזה עמוקה' },
        { name: 'שאוואסנה', sets: 1, reps: 180, weight_kg: 0, description: 'הרפיה ארוכה' },
      ],
    },
  ],
}

// Pilates — "reps" = חזרות מבוקרות או שניות החזקה. weight 0.
const PILATES = {
  beginner: [
    {
      workout_name: 'יסודות מאט פילאטיס',
      muscle_groups: 'ליבה, יציבה',
      exercises: [
        { name: 'נשימת פילאטיס + הפעלת ליבה', sets: 2, reps: 10, weight_kg: 0, description: 'נשיפה תוך משיכת טבור פנימה' },
        { name: 'מאה (The Hundred)', sets: 1, reps: 100, weight_kg: 0, description: '100 נקישות ידיים, ליבה יציבה' },
        { name: 'גלגול אגן (Pelvic Curl)', sets: 3, reps: 10, weight_kg: 0, description: 'חוליה-חוליה מעלה ומטה' },
        { name: 'מתיחת רגל בודדת', sets: 3, reps: 12, weight_kg: 0, description: '12 לכל רגל, ליבה לא זזה' },
      ],
    },
    {
      workout_name: 'ליבה ויציבה',
      muscle_groups: 'ליבה, גב',
      exercises: [
        { name: 'גלגול כדור (Rolling)', sets: 2, reps: 10, weight_kg: 0, description: 'שליטה בגלגול ללא תנופה' },
        { name: 'מסור (Saw)', sets: 2, reps: 8, weight_kg: 0, description: 'סיבוב גו עם מתיחה' },
        { name: 'שחייה (Swimming)', sets: 3, reps: 20, weight_kg: 0, description: 'בשכיבת בטן, גפיים נגדיות' },
        { name: 'פלאנק עם ירידת ברכיים', sets: 3, reps: 30, weight_kg: 0, description: '30 שניות יציבות' },
      ],
    },
  ],
  intermediate: [
    {
      workout_name: 'זרימת ליבה ביניים',
      muscle_groups: 'ליבה, ירך',
      exercises: [
        { name: 'מאה מתקדם', sets: 1, reps: 100, weight_kg: 0, description: 'רגליים בזווית 45°' },
        { name: 'מתיחת שתי רגליים', sets: 3, reps: 12, weight_kg: 0, description: 'פתיחה וסגירה בשליטה' },
        { name: 'מספריים (Scissors)', sets: 3, reps: 16, weight_kg: 0, description: 'החלפת רגליים מבוקרת' },
        { name: 'טיזר (Teaser) מותאם', sets: 3, reps: 8, weight_kg: 0, description: 'הרמת גו ורגליים ל-V' },
        { name: 'גלגול אגן עם הרמת רגל', sets: 2, reps: 10, weight_kg: 0, description: 'יציבות אגן' },
      ],
    },
    {
      workout_name: 'גב וישבן',
      muscle_groups: 'גב, ישבן',
      exercises: [
        { name: 'בעיטות ישבן בשכיבה', sets: 3, reps: 12, weight_kg: 0, description: 'מבלי לקמר גב תחתון' },
        { name: 'הקפות רגל בצד', sets: 3, reps: 12, weight_kg: 0, description: '12 לכל צד' },
        { name: 'שחייה מתקדמת', sets: 3, reps: 30, weight_kg: 0, description: 'קצב יציב' },
        { name: 'פלאנק מלא', sets: 3, reps: 40, weight_kg: 0, description: '40 שניות יציבות מלאה' },
      ],
    },
  ],
  advanced: [
    {
      workout_name: 'מאט מתקדם',
      muscle_groups: 'גוף מלא, ליבה',
      exercises: [
        { name: 'טיזר מלא', sets: 3, reps: 8, weight_kg: 0, description: 'שליטה מלאה בעלייה וירידה' },
        { name: 'בומרנג (Boomerang)', sets: 2, reps: 6, weight_kg: 0, description: 'רצף מורכב של גלגול וסיבוב' },
        { name: 'קורקסקרו (Corkscrew)', sets: 3, reps: 8, weight_kg: 0, description: 'סיבוב רגליים סביב ציר' },
        { name: 'שכיבת שכל (Control Balance)', sets: 2, reps: 8, weight_kg: 0, description: 'איזון על שכמות' },
        { name: 'פלאנק עם ניתוק רגל', sets: 3, reps: 30, weight_kg: 0, description: 'הרמת רגל לסירוגין' },
      ],
    },
  ],
}

// Crossfit — WOD-style. "reps" = חזרות לסבב; משקלים מוצעים בק"ג.
const CROSSFIT = {
  beginner: [
    {
      workout_name: 'WOD מבוא — AMRAP 12',
      muscle_groups: 'גוף מלא, סיבולת',
      exercises: [
        { name: 'אוויר סקוואט', sets: 3, reps: 15, weight_kg: 0, description: 'AMRAP — כמה סבבים ב-12 דקות' },
        { name: 'שכיבות סמיכה (על ברכיים אופציה)', sets: 3, reps: 10, weight_kg: 0, description: 'טכניקה לפני מהירות' },
        { name: 'קפיצות כוכב / ג׳אמפינג ג׳ק', sets: 3, reps: 20, weight_kg: 0, description: 'העלאת דופק' },
        { name: 'פלאנק', sets: 3, reps: 30, weight_kg: 0, description: '30 שניות בין סבבים' },
      ],
    },
    {
      workout_name: 'כוח בסיסי + מטקון',
      muscle_groups: 'רגליים, ליבה',
      exercises: [
        { name: 'דדליפט קל (טכניקה)', sets: 4, reps: 8, weight_kg: 40, description: 'גב ניטרלי, דגש על תבנית' },
        { name: 'קטלבל סווינג', sets: 4, reps: 15, weight_kg: 12, description: 'כוח מהירך, לא מהכתף' },
        { name: 'בקס סטפ-אפ', sets: 3, reps: 12, weight_kg: 0, description: '12 לכל רגל' },
        { name: 'סיט-אפים', sets: 3, reps: 15, weight_kg: 0, description: 'קצב יציב' },
      ],
    },
  ],
  intermediate: [
    {
      workout_name: '"Cindy" — AMRAP 20',
      muscle_groups: 'גוף מלא, סיבולת',
      exercises: [
        { name: 'מתח', sets: 1, reps: 5, weight_kg: 0, description: '5 בכל סבב — כמה סבבים ב-20 דקות' },
        { name: 'שכיבות סמיכה', sets: 1, reps: 10, weight_kg: 0, description: '10 בכל סבב' },
        { name: 'אוויר סקוואט', sets: 1, reps: 15, weight_kg: 0, description: '15 בכל סבב' },
        { name: 'דאבל-אנדר (קפיצה בחבל)', sets: 3, reps: 30, weight_kg: 0, description: 'גמר — סיבולת' },
      ],
    },
    {
      workout_name: 'אולימפי + מטקון',
      muscle_groups: 'גוף מלא, כוח-מתפרץ',
      exercises: [
        { name: 'פאוור קלין', sets: 5, reps: 3, weight_kg: 50, description: 'משיכה מתפרצת, קבלה בכריעה' },
        { name: 'תרוסטרים', sets: 4, reps: 10, weight_kg: 35, description: 'סקוואT ללחיצה מעל הראש' },
        { name: 'בארפי בוקס ג׳אמפ', sets: 4, reps: 10, weight_kg: 0, description: 'קצב גבוה' },
        { name: 'וול-בול', sets: 4, reps: 15, weight_kg: 9, description: 'כדור 9 ק"ג למטרה' },
      ],
    },
  ],
  advanced: [
    {
      workout_name: '"Fran" — 21-15-9',
      muscle_groups: 'גוף מלא, עצימות',
      exercises: [
        { name: 'תרוסטרים', sets: 1, reps: 21, weight_kg: 43, description: '21-15-9 לזמן, מוט 43 ק"ג' },
        { name: 'מתח לחזה (C2B)', sets: 1, reps: 21, weight_kg: 0, description: '21-15-9 לסירוגין עם התרוסטר' },
        { name: 'מאסל-אפ (אופציונלי)', sets: 3, reps: 5, weight_kg: 0, description: 'מיומנות מתקדמת' },
        { name: 'דאבל-אנדר', sets: 3, reps: 50, weight_kg: 0, description: 'סיבולת גמר' },
      ],
    },
    {
      workout_name: 'כוח כבד + EMOM',
      muscle_groups: 'גוף מלא, כוח',
      exercises: [
        { name: 'בק סקוואט כבד', sets: 5, reps: 3, weight_kg: 90, description: '5×3 כוח, מנוחה מלאה' },
        { name: 'דדליפט', sets: 1, reps: 5, weight_kg: 100, description: 'EMOM — 5 כל דקה למשך 8 דקות' },
        { name: 'האנג פאוור סנאץ׳', sets: 6, reps: 2, weight_kg: 45, description: 'מהירות וטכניקה' },
        { name: 'בארפי על מוט', sets: 4, reps: 12, weight_kg: 0, description: 'גמר מטבולי' },
      ],
    },
  ],
}

export const planTemplates = { gym: GYM, yoga: YOGA, pilates: PILATES, crossfit: CROSSFIT }

// ─────────────────────────────────────────────────────────────
// Exercise / movement library — tagged by discipline
// ─────────────────────────────────────────────────────────────

export const MUSCLE_GROUPS = [
  { key: 'chest', label: 'חזה' },
  { key: 'back', label: 'גב' },
  { key: 'legs', label: 'רגליים' },
  { key: 'shoulders', label: 'כתפיים' },
  { key: 'arms', label: 'ידיים' },
  { key: 'core', label: 'ליבה' },
]

export const exercises = [
  { name: 'לחיצת חזה במוט', muscle_group: 'chest', sets_recommendation: '4×8', description: 'תרגיל הבסיס לחזה. הורד את המוט לאמצע החזה בשליטה ודחוף למעלה בכוח.' },
  { name: 'לחיצת חזה משופע במשקולות', muscle_group: 'chest', sets_recommendation: '3×10', description: 'דגש על חזה עליון. ספסל בזווית 30 מעלות, משקולות יורדות לצידי החזה.' },
  { name: 'פרפר בכבלים', muscle_group: 'chest', sets_recommendation: '3×12', description: 'בידוד לחזה. ידיים נפגשות מול מרכז החזה עם כיווץ של שנייה.' },
  { name: 'שכיבות סמיכה', muscle_group: 'chest', sets_recommendation: '3×15', description: 'קלאסיקה במשקל גוף. גוף בקו ישר, חזה נוגע כמעט ברצפה.' },
  { name: 'מתח', muscle_group: 'back', sets_recommendation: '4×6', description: 'מלך תרגילי הגב. אחיזה רחבה, משוך עד שהסנטר עובר את המוט.' },
  { name: 'חתירת מוט בשיפוע', muscle_group: 'back', sets_recommendation: '4×8', description: 'מסה לגב האמצעי. גו נטוי קדימה 45°, מוט נמשך לכיוון הבטן.' },
  { name: 'משיכת פולי עליון', muscle_group: 'back', sets_recommendation: '3×10', description: 'חלופה מצוינת למתח. משוך את המוט לחזה העליון תוך הורדת השכמות.' },
  { name: 'דדליפט', muscle_group: 'back', sets_recommendation: '5×5', description: 'תרגיל הכוח המרכזי. גב ניטרלי לאורך כל התנועה, דחיפה דרך העקבים.' },
  { name: 'סקוואט במוט', muscle_group: 'legs', sets_recommendation: '4×8', description: 'תרגיל הרגליים החשוב ביותר. ירידה לפחות עד מקביל לרצפה.' },
  { name: 'לחיצת רגליים', muscle_group: 'legs', sets_recommendation: '4×12', description: 'עומס גבוה על הרגליים בבטיחות. אל תנעל ברכיים בסוף התנועה.' },
  { name: 'לונג׳ים עם משקולות', muscle_group: 'legs', sets_recommendation: '3×10', description: 'עבודה חד-רגלית לשיווי משקל וישבן. צעד קדימה גדול, ברך אחורית יורדת נמוך.' },
  { name: 'דדליפט רומני', muscle_group: 'legs', sets_recommendation: '3×10', description: 'דגש על ירך אחורית. ירידה איטית עם גב ישר עד מתיחה מלאה.' },
  { name: 'עליות תאומים', muscle_group: 'legs', sets_recommendation: '4×15', description: 'עלייה על קצות האצבעות עם שהייה של שנייה למעלה.' },
  { name: 'לחיצת כתפיים במשקולות', muscle_group: 'shoulders', sets_recommendation: '4×10', description: 'הבסיס לכתפיים. דחוף את המשקולות מעל הראש ללא קשת מוגזמת בגב.' },
  { name: 'הרחקות צד', muscle_group: 'shoulders', sets_recommendation: '3×14', description: 'מעצב את הכתף הצדית. הרם עד גובה הכתפיים עם מרפקים מעט כפופים.' },
  { name: 'משיכת פנים בכבל', muscle_group: 'shoulders', sets_recommendation: '3×15', description: 'בריאות הכתפיים והיציבה. משוך את החבל לכיוון הפנים עם מרפקים גבוהים.' },
  { name: 'כפיפת מרפקים במוט', muscle_group: 'arms', sets_recommendation: '3×10', description: 'הבסיס ליד הקדמית. מרפקים צמודים לגוף, ללא נדנוד.' },
  { name: 'פשיטת מרפקים בפולי', muscle_group: 'arms', sets_recommendation: '3×12', description: 'בידוד ליד האחורית. דחוף את החבל למטה עד יישור מלא של המרפק.' },
  { name: 'פלאנק', muscle_group: 'core', sets_recommendation: '3×45 שנ׳', description: 'יציבות ליבה. גוף בקו ישר מהראש לעקבים, בטן מכווצת.' },
  { name: 'הרמות רגליים בתליה', muscle_group: 'core', sets_recommendation: '3×12', description: 'בטן תחתונה. הרם רגליים ישרות עד 90° ללא נדנוד.' },
]

// Non-gym movements for the library, grouped by discipline.
// muscle_group here stores the discipline key so the existing filter UI works.
export const disciplineMovements = [
  // Yoga
  { name: 'תנוחת הכלב מביט מטה', muscle_group: 'yoga', sets_recommendation: '3×45 שנ׳', description: 'מתיחת גב וגיד הברך. עקבים לכיוון הרצפה, גב ארוך.' },
  { name: 'תנוחת הלוחם II', muscle_group: 'yoga', sets_recommendation: '45 שנ׳ לכל צד', description: 'חיזוק רגליים ופתיחת ירכיים. ברך קדמית מעל הקרסול.' },
  { name: 'תנוחת העץ', muscle_group: 'yoga', sets_recommendation: '40 שנ׳ לכל רגל', description: 'שיווי משקל וריכוז. כף רגל על ירך פנימית, לא על הברך.' },
  { name: 'ברכת השמש A', muscle_group: 'yoga', sets_recommendation: '4 סבבים', description: 'רצף זורם המסנכרן תנועה ונשימה — חימום מצוין.' },
  { name: 'שאוואסנה', muscle_group: 'yoga', sets_recommendation: '2–3 דק׳', description: 'תנוחת מנוחה לסיום. הרפיה מלאה של הגוף.' },
  // Pilates
  { name: 'מאה (The Hundred)', muscle_group: 'pilates', sets_recommendation: '100 נקישות', description: 'הפעלת ליבה ונשימה. רגליים בזווית, גב צמוד למזרן.' },
  { name: 'גלגול אגן (Pelvic Curl)', muscle_group: 'pilates', sets_recommendation: '3×10', description: 'ניוד עמוד שדרה חוליה-חוליה וחיזוק ישבן.' },
  { name: 'טיזר (Teaser)', muscle_group: 'pilates', sets_recommendation: '3×8', description: 'שליטת ליבה מתקדמת — גו ורגליים לצורת V.' },
  { name: 'שחייה (Swimming)', muscle_group: 'pilates', sets_recommendation: '3×20', description: 'חיזוק שרשרת אחורית בשכיבת בטן.' },
  // Crossfit
  { name: 'תרוסטרים', muscle_group: 'crossfit', sets_recommendation: '4×10', description: 'סקוואט קדמי ולחיצה מעל הראש בתנועה אחת רציפה.' },
  { name: 'קטלבל סווינג', muscle_group: 'crossfit', sets_recommendation: '4×15', description: 'כוח מתפרץ מהירך. הקטלבל לגובה הכתף, גב ניטרלי.' },
  { name: 'בארפי', muscle_group: 'crossfit', sets_recommendation: '4×10', description: 'תרגיל גוף-מלא: ירידה, שכיבת סמיכה, קפיצה מעלה.' },
  { name: 'דאבל-אנדר', muscle_group: 'crossfit', sets_recommendation: '3×30', description: 'קפיצה בחבל עם 2 סיבובים לכל קפיצה — סיבולת ותיאום.' },
  { name: 'וול-בול', muscle_group: 'crossfit', sets_recommendation: '4×15', description: 'סקוואט עם זריקת כדור כוח למטרה גבוהה.' },
]

// Quick-add common foods — macros are for the listed portion, whose weight is
// `grams`. The Log screen lets the user override grams for scale-accurate logging.
export const COMMON_FOODS = [
  { name: 'ביצה קשה', emoji: '🥚', portion: 'יחידה', grams: 50, calories: 78, protein_g: 6, carbs_g: 1, fat_g: 5 },
  { name: 'חזה עוף מבושל', emoji: '🍗', portion: '100 גרם', grams: 100, calories: 165, protein_g: 31, carbs_g: 0, fat_g: 4 },
  { name: 'אורז לבן מבושל', emoji: '🍚', portion: 'כוס', grams: 160, calories: 205, protein_g: 4, carbs_g: 45, fat_g: 0 },
  { name: 'שייק חלבון (סקופ)', emoji: '🥤', portion: 'סקופ', grams: 30, calories: 120, protein_g: 24, carbs_g: 3, fat_g: 2 },
  { name: 'יוגורט יווני 5%', emoji: '🥣', portion: 'גביע', grams: 200, calories: 130, protein_g: 18, carbs_g: 8, fat_g: 5 },
  { name: 'בננה', emoji: '🍌', portion: 'בינונית', grams: 120, calories: 105, protein_g: 1, carbs_g: 27, fat_g: 0 },
  { name: 'פרוסת לחם מלא', emoji: '🍞', portion: 'פרוסה', grams: 30, calories: 80, protein_g: 4, carbs_g: 14, fat_g: 1 },
  { name: 'טונה במים', emoji: '🐟', portion: 'קופסה', grams: 140, calories: 130, protein_g: 29, carbs_g: 0, fat_g: 1 },
  { name: 'תפוח', emoji: '🍎', portion: 'בינוני', grams: 180, calories: 95, protein_g: 0, carbs_g: 25, fat_g: 0 },
  { name: 'חמאת בוטנים', emoji: '🥜', portion: 'כף', grams: 16, calories: 95, protein_g: 4, carbs_g: 3, fat_g: 8 },
]

// ─────────────────────────────────────────────────────────────
// 10 daily tips (rotated by day-of-week index)
// ─────────────────────────────────────────────────────────────

export const dailyTips = [
  'לאחר אימון כוח, נסה לאכול 20–40 גרם חלבון תוך 30 דקות לשיקום מיטבי של השריר.',
  'שתיית כוס מים לפני כל ארוחה עוזרת גם להידרציה וגם לתחושת שובע.',
  'שינה של 7–9 שעות חשובה לבניית שריר לא פחות מהאימון עצמו.',
  'ביצים הן אחד ממקורות החלבון הזולים והאיכותיים ביותר לסטודנט — כ-6 גרם חלבון לביצה.',
  'אל תדלג על חימום! 5 דקות חימום מפחיתות משמעותית את סיכון הפציעה.',
  'קפאין 30–45 דקות לפני אימון יכול לשפר ביצועים — אבל לא אחרי 16:00 אם אתה רוצה לישון טוב.',
  'התקדמות איטית ועקבית מנצחת דיאטת קסם. שאף ל-0.5% שינוי במשקל בשבוע.',
  'קטניות כמו עדשים וחומוס הן חלבון + פחמימה + סיבים במחיר של שקלים בודדים.',
  'תעדוף תרגילים מורכבים (סקוואט, דדליפט, לחיצות) לפני תרגילי בידוד באימון.',
  'אכילת חלבון בכל ארוחה (ולא הכל בערב) משפרת את ניצול החלבון לאורך היום.',
]

// preset profile used by Demo Mode
export const demoProfile = {
  nickname: 'דמו',
  age: 24,
  gender: 'male',
  height_cm: 178,
  weight_kg: 75,
  target_weight_kg: 80,
  body_type: 'meso',
  goal: 'bulk',
  activity_level: 'moderate',
  workouts_per_week: 4,
  experience: 'intermediate',
  dietary_restrictions: [],
}

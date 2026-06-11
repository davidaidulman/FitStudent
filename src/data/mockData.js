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
// 3 weekly workout-plan templates (beginner / intermediate / advanced)
// Each: ordered list of TRAINING days (rest days filled by the generator
// according to workouts_per_week). day slots are assigned by the generator.
// ─────────────────────────────────────────────────────────────

export const planTemplates = {
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

// ─────────────────────────────────────────────────────────────
// 20-exercise library
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

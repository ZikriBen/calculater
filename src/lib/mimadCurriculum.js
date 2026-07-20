// מימ״ד prep curriculum — pre-academy admission test (NITE), 3 sections:
// כמותי (quantitative), עברית (Hebrew verbal), English.
// Not grade-specific (target audience is finishing high school / adults),
// so every grade key maps to the same pool — kept per-grade only to fit the
// existing topicsByGrade/quickTopicsByGrade contract in teachers.js.

const MIMAD_TOPICS = {
  easy: [
    "כמותי – יחס וקצב (בעיות קלות)",
    "כמותי – אחוזים בסיסיים",
    "כמותי – משוואה פשוטה במשתנה אחד",
    "כמותי – היקף ושטח של מלבן/משולש",
    "עברית – אוצר מילים (מילים נפוצות)",
    "עברית – השלמת משפט קלה (מילת קישור אחת)",
    "עברית – הבנת הנקרא (קטע קצר)",
    "אנגלית – Sentence completion (single blank, basic vocabulary)",
    "אנגלית – Reading comprehension (short paragraph)",
  ],
  medium: [
    "כמותי – בעיות יחס וקצב (שני משתנים)",
    "כמותי – אחוזים (אחוז מתוך אחוז, שינוי אחוזי)",
    "כמותי – מערכת משוואות (בעיית מחירים, כמו זוגות נעליים)",
    "כמותי – סדרות מספרים (זיהוי חוקיות)",
    "כמותי – גיאומטריה (זוויות במשולש שווה-שוקיים)",
    "כמותי – הסקת מסקנות מטבלה או תרשים",
    "עברית – אוצר מילים מתקדם (מילים ספרותיות/גבוהות)",
    "עברית – השלמת משפט עם שני מקומות חסרים",
    "עברית – הבנת הנקרא (קטע עיוני)",
    "אנגלית – Sentence completion (contextual connector: but/since/when/after)",
    "אנגלית – Reading comprehension (chronological questions)",
    "אנגלית – Vocabulary in context",
  ],
  hard: [
    "כמותי – בעיות מילוליות רב-שלביות (יחס, קצב ואחוזים משולבים)",
    "כמותי – גיאומטריה מתקדמת (שטח והיקף עם יחס בין צלעות)",
    "כמותי – סדרות מספרים לא ליניאריות",
    "כמותי – הסקה מורכבת מתרשים/טבלה עם כמה שלבים",
    "עברית – השלמת משפט מורכבת (3–4 מקומות חסרים, טקסט רטורי)",
    "עברית – אוצר מילים גבוה (מילים נדירות/ספרותיות)",
    "עברית – הבנת הנקרא (קטע מורכב, טיעון והיסק)",
    "אנגלית – Sentence completion (advanced connectors and vocabulary)",
    "אנגלית – Reading comprehension (argumentative/academic passage)",
  ],
};

// One chip per real exam section (not per sub-topic) — tapping one drills
// that section only, with natural variety across its sub-topics from
// MIMAD_TOPICS above (enforced by the "focus topic" lock in the exercise
// prompt, same mechanism as the math/English teachers' quick topics).
const MIMAD_QUICK_TOPICS = [
  { emoji: "📊", label: "כמותי", topic: "כמותי", difficulty: "medium" },
  { emoji: "📖", label: "עברית", topic: "עברית", difficulty: "medium" },
  { emoji: "🔤", label: "English", topic: "אנגלית", difficulty: "medium" },
];

// Not grade-specific — same pools regardless of the student's school grade.
const GRADE_KEYS = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ז'", "ח'", "ט'", "י'", "י״א", "י״ב"];

export const MIMAD_CURRICULUM = Object.fromEntries(GRADE_KEYS.map(g => [g, MIMAD_TOPICS]));
export const MIMAD_QUICK_TOPICS_BY_GRADE = Object.fromEntries(GRADE_KEYS.map(g => [g, MIMAD_QUICK_TOPICS]));

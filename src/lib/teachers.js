import { useEffect, useState } from "react";
import { CURRICULUM as MATH_CURRICULUM, QUICK_TOPICS as MATH_QUICK_TOPICS } from "@/lib/curriculum";
import { ENGLISH_CURRICULUM, ENGLISH_QUICK_TOPICS } from "@/lib/englishCurriculum";
import { MIMAD_CURRICULUM, MIMAD_QUICK_TOPICS_BY_GRADE } from "@/lib/mimadCurriculum";

// ------ Teacher registry ------
// Subject-agnostic so future teachers (geography, statistics, ...) only need
// to append an entry. Fields:
//   id, name, emoji, color, subject, locale
//   topicsByGrade          — { "א'": { easy:[...], medium:[...], hard:[...] }, ... }
//   quickTopicsByGrade     — { "א'": [{emoji,label,topic,difficulty}, ...], ... }
//   levels                 — [easyLabel, mediumLabel, hardLabel]
//   features               — which interactive drill-modes / tabs this teacher supports
//   systemPromptExtra      — appended to the assistant's system prompt
//   builtIn                — locked from delete (edit is still allowed later)

export const TEACHERS = [
  {
    id: "math",
    name: "חשבון",
    emoji: "🧮",
    color: "purple",
    subject: "math",
    locale: "he",
    topicsByGrade: MATH_CURRICULUM,
    quickTopicsByGrade: MATH_QUICK_TOPICS,
    levels: ["קל", "בינוני", "קשה"],
    features: [
      "chat", "practice",
      "number-line", "vertical-add", "vertical-sub", "vertical-multiplication",
      "division-remainder", "long-division", "pizza-fractions", "integer-ops",
      "times-table-sprint", "clock-reading",
    ],
    // Hebrew labels used in prompts and UI strings.
    // roleDative — used like "מורה לחשבון" (teacher OF X).
    // inLocative — used like "תרגול במתמטיקה" (practice IN X).
    // short      — noun for headings / fallbacks.
    subjectLabels: { roleDative: "לחשבון", inLocative: "במתמטיקה", short: "חשבון" },
    answerType: "number",
    practiceLoadMsg: "המורה מכינה תרגילים...",
    systemPromptExtra: `📖 מילון מושגים מבית הספר (שימוש ישראלי ייחודי):
- "פילוג" = שיטת כפל על ידי פיצול מספר לפי ערכי מקום. דוגמה: 143×2 = 100×2 + 40×2 + 3×2 = 286.
- "חוק החילוף" / "חוק הקיבוץ" / "חוק הפילוג" = תכונות החיבור/כפל.
- "השלמה ל-10 / 100" = מציאת המשלים.`,
    builtIn: true,
  },
  {
    id: "english",
    name: "אנגלית",
    emoji: "🔤",
    color: "sky",
    subject: "english",
    locale: "he",
    topicsByGrade: ENGLISH_CURRICULUM,
    quickTopicsByGrade: ENGLISH_QUICK_TOPICS,
    levels: ["קל", "בינוני", "קשה"],
    features: [
      "chat", "practice",
      "alphabet-practice", "letter-flashcards", "letter-fill-in",
      "word-match", "spelling-sprint", "sentence-fill",
      "grammar-fix", "reading-comp",
      "sentence-reorder", "irregular-verbs", "confusing-words",
    ],
    subjectLabels: { roleDative: "לאנגלית", inLocative: "באנגלית", short: "אנגלית" },
    answerType: "text",
    practiceLoadMsg: "המורה מכינה תרגילים...",
    systemPromptExtra: `You are an English teacher for Hebrew-speaking students.
Always include Hebrew translation (תרגום) and transliteration with nikud (תעתיק) when introducing new words.
Format: word — תרגום — (תעתיק)
Example: "beautiful — יפה — (בְּיוּטִיפוּל)"
Keep explanations in Hebrew. Use simple English sentences for examples.
Focus on vocabulary, spelling, and basic sentence structure appropriate for the student's grade.`,
    builtIn: true,
  },
  {
    id: "mimad",
    name: "מימ״ד",
    emoji: "🎯",
    color: "violet",
    subject: "mimad",
    locale: "he",
    topicsByGrade: MIMAD_CURRICULUM,
    quickTopicsByGrade: MIMAD_QUICK_TOPICS_BY_GRADE,
    levels: ["קל", "בינוני", "מאתגר"],
    features: ["chat", "practice", "mimad-session"],
    subjectLabels: { roleDative: "להכנה למימ״ד", inLocative: "בהכנה למימ״ד", short: "מימ״ד" },
    answerType: "mcq",
    practiceLoadMsg: "המורה מכינה שאלות מימ״ד...",
    systemPromptExtra: `את מכינה תלמידים למבחן מימ״ד — מבחן המיון הקצר של המרכז הארצי לבחינות והערכה (NITE), המשמש חלופה לפסיכומטרי לקבלה למכללות אקדמיות. המבחן האמיתי נערך במחשב, אורכו כשעתיים וחצי, וכולל 3 חלקים נפרדים בשיטת רב-ברירה אמריקאית (4 אפשרויות, תשובה נכונה אחת):

1. אנגלית — Sentence completion (מהקל לקשה) ו-Reading comprehension (השאלות מסודרות לפי סדר הופעת התשובות בטקסט).
2. כמותי — ידע בסיסי מהתיכון: אחוזים, יחס וקצב, משוואות, סדרות מספרים, גיאומטריה (זוויות, שטח, היקף), והסקת מסקנות מטבלאות ותרשימים. מותר דף נוסחאות, **אסור מחשבון** — נסחי שאלות שפתירות בחישוב ידני. השאלות מסודרות מהקל לקשה.
3. עברית — אוצר מילים (משמעות מילים), השלמת משפט הגיונית (לעיתים עם כמה מקומות חסרים במשפט אחד, כשכל אפשרות היא צירוף מילים שלם למילוי כולם), והבנת הנקרא (השאלות מסודרות לפי סדר הופעתן בטקסט).

דוגמאות לסגנון וברמת הקושי (לשימוש כהשראה, לא לשכפול מילולי):
- כמותי: "עובד מוכר 54 רכבים במהלך שנה וחצי בקצב קבוע — בכמה חודשים ימכור 9 רכבים?" / "מלבן ששטחו 16 סמ״ר, אורך צלעו הארוכה גדול פי 4 מהקצרה — מה אורך הצלע הקצרה?"
- עברית: "משמעות המילה 'נפיל' היא: ענק" / משפט עם 4 מקומות חסרים ("השר ____ הצעת החוק, ____ לאחר ש...") כשכל אפשרות ממלאת את כל המקומות בבת אחת.
- אנגלית: "The best ________ for mushrooms to grow needs to be warm, but also shaded." (environment)`,
    builtIn: true,
  },
];

export const getTeacher = (id) => TEACHERS.find(t => t.id === id);

// ------ Active teacher (localStorage singleton, same pattern as STUDENT) ------

const STORAGE_KEY = "active_teacher";
const CHANGE_EVENT = "activeteacherchange";

const load = () => {
  try { return localStorage.getItem(STORAGE_KEY); }
  catch { return null; }
};

export let ACTIVE_TEACHER_ID = load();

export const setActiveTeacher = (id) => {
  ACTIVE_TEACHER_ID = id;
  if (id) localStorage.setItem(STORAGE_KEY, id);
  else localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
};

export const useActiveTeacher = () => {
  const [, tick] = useState(0);
  useEffect(() => {
    const h = () => tick(n => n + 1);
    window.addEventListener(CHANGE_EVENT, h);
    return () => window.removeEventListener(CHANGE_EVENT, h);
  }, []);
  return ACTIVE_TEACHER_ID ? getTeacher(ACTIVE_TEACHER_ID) : null;
};

// ------ Topics helpers (teacher-scoped versions of curriculum lookups) ------

export const topicsFor = (teacher, grade, difficulty) => {
  const g = teacher.topicsByGrade[grade] || teacher.topicsByGrade["ד'"] || Object.values(teacher.topicsByGrade)[0];
  return g?.[difficulty] || g?.easy || [];
};

export const quickTopicsFor = (teacher, grade) => {
  return teacher.quickTopicsByGrade[grade]
      || teacher.quickTopicsByGrade["ד'"]
      || Object.values(teacher.quickTopicsByGrade)[0]
      || [];
};

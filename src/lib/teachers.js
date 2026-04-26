import { useEffect, useState } from "react";
import { CURRICULUM as MATH_CURRICULUM, QUICK_TOPICS as MATH_QUICK_TOPICS } from "@/lib/curriculum";

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
      "number-line", "vertical-add-sub", "vertical-multiplication",
      "long-division", "integer-ops",
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

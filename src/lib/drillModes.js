// Registry of interactive drill components.
// Every entry is subject-tagged so a future multi-teacher system can filter
// drills by the active teacher's subject without schema changes.

import { lazy } from "react";

export const DRILL_MODES = [
  {
    id: "number-line",
    subject: "math",
    label: "שכנים על ציר המספרים",
    emoji: "🔢",
    grades: ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ז'", "ח'"],
    topics: ["ציר המספרים", "מספרים עוקבים", "סדר עולה", "קפיצות", "מספרים שליליים"],
    component: lazy(() => import("@/pages/drills/NumberLine")),
  },
  {
    id: "times-table-sprint",
    subject: "math",
    label: "לוח הכפל מהיר",
    emoji: "⚡",
    grades: ["ב'", "ג'", "ד'", "ה'", "ו'"],
    topics: ["לוח הכפל", "כפל בעל-פה", "שינון"],
    component: lazy(() => import("@/pages/drills/TimesTableSprint")),
  },
  {
    id: "clock-reading",
    subject: "math",
    label: "קריאת שעון",
    emoji: "🕒",
    grades: ["א'", "ב'", "ג'", "ד'"],
    topics: ["שעון", "זמן", "שעות ודקות"],
    component: lazy(() => import("@/pages/drills/ClockReading")),
  },
  {
    id: "vertical-add",
    subject: "math",
    label: "חיבור מאונך",
    emoji: "➕",
    grades: ["א'", "ב'", "ג'", "ד'", "ה'", "ו'"],
    topics: ["חיבור מאונך", "נשא"],
    component: lazy(() => import("@/pages/drills/VerticalAddSub")),
  },
  {
    id: "vertical-sub",
    subject: "math",
    label: "חיסור מאונך",
    emoji: "➖",
    grades: ["א'", "ב'", "ג'", "ד'", "ה'", "ו'"],
    topics: ["חיסור מאונך", "שאילה"],
    component: lazy(() => import("@/pages/drills/VerticalAddSub")),
  },
  {
    id: "vertical-multiplication",
    subject: "math",
    label: "כפל מאונך",
    emoji: "📐",
    grades: ["ג'", "ד'", "ה'", "ו'"],
    topics: ["לוח הכפל", "כפל מאונך", "כפל דו-ספרתי בחד-ספרתי", "כפל דו-ספרתי בדו-ספרתי"],
    component: lazy(() => import("@/pages/drills/VerticalPractice")),
  },
  {
    id: "long-division",
    subject: "math",
    label: "חילוק ארוך",
    emoji: "➗",
    grades: ["ד'", "ה'", "ו'"],
    topics: ["חילוק עם שארית", "חילוק ארוך"],
    component: lazy(() => import("@/pages/drills/LongDivision")),
  },
  {
    id: "integer-ops",
    subject: "math",
    label: "שלמים שליליים",
    emoji: "➕➖",
    grades: ["ז'", "ח'"],
    topics: ["חיבור וחיסור שלמים", "מספרים שליליים", "ערך מוחלט"],
    component: lazy(() => import("@/pages/drills/IntegerOps")),
  },
];

export const drillsForGrade = (grade, subject = "math") =>
  DRILL_MODES.filter(d => d.subject === subject && d.grades.includes(grade));

export const drillById = (id) => DRILL_MODES.find(d => d.id === id);

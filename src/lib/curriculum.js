// Per-grade suggested topic pools for default daily practice (Mode B).
// When the student has NOT asked for a specific topic in chat and there is
// no exam context, drills are drawn from the grade's pool. Explicit chat
// requests and exam-driven drills override these (Practice.jsx Mode A).

export const CURRICULUM = {
  "א'": {
    label: "כיתה א'",
    easy: [
      "ספירה עד 20", "חיבור עד 10", "חיסור עד 10",
      "השלמה ל-10", "מספרים שכנים (לפני ואחרי)",
    ],
    medium: [
      "חיבור עד 20 בלי מעבר עשירייה", "חיסור עד 20 בלי מעבר",
      "זוגי ואי-זוגי", "השוואת מספרים (גדול/קטן)",
      "בעיה מילולית קצרצרה בחיבור",
    ],
    hard: [
      "חיבור עם מעבר עשירייה עד 20", "חיסור עם מעבר עשירייה עד 20",
      "בעיה מילולית קצרה (חיבור או חיסור)",
      "סדרות מספרים פשוטות",
    ],
  },
  "ב'": {
    label: "כיתה ב'",
    easy: [
      "חיבור דו-ספרתי בלי מעבר", "חיסור דו-ספרתי בלי מעבר",
      "ערך המקום (עשרות ויחידות)", "השלמה לעשרת השלמה",
      "לוח הכפל של 2 ו-5",
    ],
    medium: [
      "חיבור עם מעבר עשירייה עד 100", "חיסור עם מעבר עשירייה עד 100",
      "לוח הכפל של 2, 5, 10", "בעיה מילולית קצרה בחיבור/חיסור",
      "כפל כחיבור חוזר",
    ],
    hard: [
      "חיבור וחיסור מעורב עד 100", "חילוק פשוט כפיצול שווה",
      "בעיה מילולית דו-שלבית פשוטה", "סדרות מספרים של 2, 5, 10",
    ],
  },
  "ג'": {
    label: "כיתה ג'",
    easy: [
      "חיבור דו-ספרתי ללא עשירייה", "חיסור דו-ספרתי ללא עשירייה",
      "לוח הכפל עד 5", "חילוק פשוט עד 50",
      "השלמה ל-100",
    ],
    medium: [
      "חיבור וחיסור תלת-ספרתי", "לוח הכפל המלא (עד 10)",
      "חילוק עם שארית", "בעיית מילולית קצרה (חיבור/חיסור)",
      "כפל דו-ספרתי בחד-ספרתי פשוט",
    ],
    hard: [
      "בעיית מילולית דו-שלבית", "סדר פעולות פשוט",
      "כפל דו-ספרתי בחד-ספרתי", "חילוק עם שארית במספרים גדולים",
    ],
  },
  "ד'": {
    label: "כיתה ד'",
    easy: [
      "חיבור דו-ספרתי ללא עשירייה", "חיסור דו-ספרתי ללא עשירייה",
      "חיבור עם מעבר עשירייה", "לוח הכפל עד 5",
      "חילוק פשוט עד 50", "השלמה ל-100",
    ],
    medium: [
      "חיבור וחיסור תלת-ספרתי", "לוח הכפל המלא",
      "חילוק עם שארית", "כפל דו-ספרתי בחד-ספרתי",
      "כפל מאונך", "בעיית מילולית קצרה (חיבור/חיסור)",
      "סדר פעולות פשוט",
    ],
    hard: [
      "כפל דו-ספרתי בדו-ספרתי", "חילוק ארוך", "כפל מאונך",
      "בעיית מילולית דו-שלבית", "שברים פשוטים (חצי, רבע, שליש)",
      "סדר פעולות עם סוגריים", "חישובים עם 4 ספרות",
    ],
  },
  "ה'": {
    label: "כיתה ה'",
    easy: [
      "כפל דו-ספרתי בחד-ספרתי", "חילוק ארוך פשוט",
      "שברים פשוטים - זיהוי והשוואה",
      "חיבור וחיסור עשרוני פשוט (מספר אחד אחרי הנקודה)",
      "היקף ושטח של מלבן",
    ],
    medium: [
      "חיבור וחיסור שברים עם מכנה משותף", "כפל דו-ספרתי בדו-ספרתי",
      "חילוק ארוך עם שארית", "בעיות מילוליות דו-שלביות",
      "עשרוניים - חיבור וחיסור", "אחוזים פשוטים (10%, 25%, 50%)",
    ],
    hard: [
      "חיבור וחיסור שברים עם מכנים שונים", "כפל שבר במספר שלם",
      "סדר פעולות עם סוגריים", "בעיות מילוליות רב-שלביות",
      "המרות יחידות מידה", "חישוב אחוזים מסכום",
    ],
  },
  "ו'": {
    label: "כיתה ו'",
    easy: [
      "כפל וחילוק עשרוני בחד-ספרתי", "חיבור וחיסור שברים",
      "אחוזים פשוטים", "היקף ושטח - מלבן ומשולש",
      "יחסים פשוטים",
    ],
    medium: [
      "כפל וחילוק שברים", "המרה בין שבר לעשרוני לאחוז",
      "בעיות יחס ופרופורציה", "שטח של מקבילית וטרפז",
      "סדר פעולות מעורב עם שברים ועשרוניים",
    ],
    hard: [
      "משוואות פשוטות עם נעלם", "בעיות אחוזים מורכבות (הנחה, מע\"מ)",
      "בעיות תנועה (מהירות, זמן, מרחק)", "נפח תיבה וקובייה",
      "בעיות רב-שלביות עם שברים ועשרוניים",
    ],
  },
};

const DEFAULT_GRADE = "ד'";

export const topicsForGrade = (grade, difficulty) => {
  const g = CURRICULUM[grade] || CURRICULUM[DEFAULT_GRADE];
  return g[difficulty] || g.easy;
};

// Quick-pick topics shown on the WelcomeScreen as clickable cards.
// Each entry is { emoji, label, topic, difficulty? } — clicking it seeds practice_context
// and jumps straight into drills on that topic.
export const QUICK_TOPICS = {
  "א'": [
    { emoji: "➕", label: "חיבור עד 10", topic: "חיבור עד 10", difficulty: "easy" },
    { emoji: "➖", label: "חיסור עד 10", topic: "חיסור עד 10", difficulty: "easy" },
    { emoji: "🔟", label: "השלמה ל-10", topic: "השלמה ל-10", difficulty: "easy" },
    { emoji: "🔢", label: "מספרים שכנים", topic: "מספרים שכנים (לפני ואחרי)", difficulty: "easy" },
    { emoji: "📚", label: "ספירה עד 20", topic: "ספירה עד 20", difficulty: "easy" },
    { emoji: "📖", label: "בעיה קצרה", topic: "בעיה מילולית קצרצרה", difficulty: "medium" },
  ],
  "ב'": [
    { emoji: "➕", label: "חיבור עד 100", topic: "חיבור עד 100", difficulty: "medium" },
    { emoji: "➖", label: "חיסור עד 100", topic: "חיסור עד 100", difficulty: "medium" },
    { emoji: "✖️", label: "כפל 2 ו-5", topic: "לוח הכפל של 2 ו-5", difficulty: "easy" },
    { emoji: "🏗️", label: "ערך המקום", topic: "ערך המקום (עשרות ויחידות)", difficulty: "easy" },
    { emoji: "🔢", label: "בעיות מילוליות", topic: "בעיות מילוליות קצרות", difficulty: "medium" },
    { emoji: "🎯", label: "השלמה לעשרת", topic: "השלמה לעשרת שלמה", difficulty: "easy" },
  ],
  "ג'": [
    { emoji: "➕", label: "חיבור וחיסור", topic: "חיבור וחיסור תלת-ספרתי", difficulty: "medium" },
    { emoji: "✖️", label: "לוח הכפל", topic: "לוח הכפל המלא", difficulty: "medium" },
    { emoji: "➗", label: "חילוק", topic: "חילוק עם שארית", difficulty: "medium" },
    { emoji: "🔢", label: "בעיות מילוליות", topic: "בעיות מילוליות", difficulty: "medium" },
    { emoji: "🧩", label: "סדר פעולות", topic: "סדר פעולות פשוט", difficulty: "hard" },
    { emoji: "📐", label: "כפל מאונך", topic: "כפל מאונך", difficulty: "medium" },
  ],
  "ד'": [
    { emoji: "➕", label: "חיבור וחיסור", topic: "חיבור וחיסור תלת-ספרתי", difficulty: "medium" },
    { emoji: "✖️", label: "כפל וחילוק", topic: "כפל וחילוק", difficulty: "medium" },
    { emoji: "📐", label: "כפל מאונך", topic: "כפל מאונך", difficulty: "medium" },
    { emoji: "🔢", label: "בעיות מילוליות", topic: "בעיות מילוליות", difficulty: "medium" },
    { emoji: "🥧", label: "שברים", topic: "שברים פשוטים (חצי, רבע, שליש)", difficulty: "hard" },
    { emoji: "🧩", label: "סדר פעולות", topic: "סדר פעולות עם סוגריים", difficulty: "hard" },
  ],
  "ה'": [
    { emoji: "🥧", label: "שברים", topic: "חיבור וחיסור שברים", difficulty: "medium" },
    { emoji: "✖️", label: "כפל דו-ספרתי", topic: "כפל דו-ספרתי בדו-ספרתי", difficulty: "medium" },
    { emoji: "📐", label: "כפל מאונך", topic: "כפל מאונך", difficulty: "medium" },
    { emoji: "🔢", label: "עשרוניים", topic: "עשרוניים - חיבור וחיסור", difficulty: "medium" },
    { emoji: "💯", label: "אחוזים", topic: "אחוזים פשוטים", difficulty: "medium" },
    { emoji: "🧩", label: "סדר פעולות", topic: "סדר פעולות עם סוגריים", difficulty: "hard" },
  ],
  "ו'": [
    { emoji: "🥧", label: "שברים", topic: "כפל וחילוק שברים", difficulty: "medium" },
    { emoji: "💯", label: "אחוזים", topic: "אחוזים", difficulty: "medium" },
    { emoji: "⚖️", label: "יחס ופרופורציה", topic: "יחסים ופרופורציה", difficulty: "medium" },
    { emoji: "🔢", label: "עשרוניים", topic: "עשרוניים", difficulty: "medium" },
    { emoji: "🧩", label: "סדר פעולות", topic: "סדר פעולות עם שברים ועשרוניים", difficulty: "medium" },
    { emoji: "❓", label: "משוואות", topic: "משוואות פשוטות עם נעלם", difficulty: "hard" },
  ],
};

export const quickTopicsFor = (grade) => QUICK_TOPICS[grade] || QUICK_TOPICS[DEFAULT_GRADE];

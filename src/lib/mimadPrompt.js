// Prompt + schema builder for the dedicated מימ״ד session (exam simulation
// and explained-practice modes — see src/pages/drills/MimadSession.jsx).
//
// Deliberately separate from the generic subject-agnostic Practice.jsx
// engine: this teacher's real exam format (one fixed difficulty, 3 mixed
// sections, optional timed simulation) doesn't fit the generic
// easy/medium/hard stepper the other teachers use.

export const MIMAD_HINT_RULE = `⚠️ כלל "hint" (הכי חשוב לאיכות — רמזים גנריים נחשבים כשלון): הרמז חייב להיות שימושי בפועל, לא ניסוח מסוג "תחשוב טוב" או "שימי לב לפרטים".
- ציינו את החוק/הנוסחה/הטכניקה הרלוונטית בשמה, ואיך להפעיל אותה על הנתונים הספציפיים של השאלה הזו — בלי לבצע את החישוב הסופי ובלי לחשוף את התשובה עצמה.
- מותר 1–2 משפטים (עד כ-30 מילים) — אין הגבלה למילה אחת.
- דוגמאות לרמת האיכות הנדרשת (השראה בלבד, אין לשכפל מילולית): "כדי למצוא מחיר לפני הנחה של X%, יש לחלק ב-(1 − X/100) ולא לחסר את האחוז ישירות מהמחיר הנוכחי." | "בסדרה כזו בדקו קודם את ההפרשים בין איברים סמוכים, ואז את ההפרש בין ההפרשים (הפרש שני)." | "במשולש שווה-שוקיים זוויות הבסיס שוות זו לזו — אם ידוע סכומן אפשר לחלק ב-2 ואז להשלים ל-180°." | "התמקדו בהקשר הלוגי של המשפט (ניגוד? סיבה? תוצאה?), לא רק בתרגום מילולי של המילה החסרה."
- אסור רמזים ריקים כמו "שימי לב לפרטים" או "השתמש בנוסחה המתאימה" בלי לציין איזו נוסחה בדיוק.`;

export const MIMAD_LANGUAGE_RULE = `🌐 כלל שפה מחייב (הכי חשוב — הפרה נחשבת כשלון):
- שאלות מהחלק "כמותי" (מתמטיקה): ה-question, ה-options, ה-answer, ה-hint וה-solution — הכל **בעברית בלבד**. מותרים מספרים, סימנים מתמטיים ומונחים לועזיים רק אם אין להם חלופה עברית מקובלת. אסור לנסח שאלת מתמטיקה באנגלית.
- שאלות מהחלק "עברית": הכל **בעברית בלבד** — question, options, answer, hint, solution.
- שאלות מהחלק "English": ה-question, ה-options וה-answer **באנגלית בלבד** (זהו החלק שבוחן אנגלית). ה-hint וה-solution — **בעברית** (הסבר לתלמיד דובר העברית).
- לסיכום: רק שאלות מהחלק "English" מנוסחות באנגלית. כל שאר השאלות (כמותי, עברית) — עברית מלאה.`;

export const MIMAD_ANSWER_RULE = `⚠️ כללי מבנה קריטיים (רב-ברירה, 4 אפשרויות — בדיוק כמו במבחן מימ״ד האמיתי):
- "options" = מערך של בדיוק 4 מחרוזות, בלי מספור בתוכן (המספור מתווסף אוטומטית בממשק).
- "answer" = זהה מילה במילה לאחת מתוך 4 האפשרויות ב-"options".
- מסיחים סבירים ולא הזויים — טעויות נפוצות אמיתיות (בלבול אחוז מהחלק/מהשלם, סימן טעות בזיהוי חוקיות בסדרה, זווית משלימה שגויה וכו').
- "question": משפט עם כמה מקומות חסרים — כל אפשרות ממלאת את כולם בבת אחת (בדיוק כמו במבחן האמיתי).
- "solution" **חובה בכל שאלה** — הסבר מלא צעד-אחר-צעד איך מגיעים לתשובה (הנוסחה/החוקיות/ההיגיון), לא רק "כי ככה".
- "section" = בדיוק אחד מ: "כמותי", "עברית", "English".
- בחלק הכמותי: אסור מחשבון — נסחו שאלות שפתירות בחישוב ידני/היגיון בלבד.
- רמת הקושי: תמיד ברמת מבחן מימ״ד אמיתי (לא שלב "קל" להתחלה) — ישירות ברמת המבחן, כפי שמודגם בדוגמאות שסופקו.`;

export const MIMAD_SCHEMA = {
  type: "object",
  properties: {
    exercises: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          section: { type: "string", description: "One of: כמותי, עברית, English" },
          options: { type: "array", items: { type: "string" }, description: "Exactly 4 answer choices." },
          answer: { type: "string", description: "Must match one of the options exactly." },
          hint: { type: "string" },
          solution: { type: "string" },
        },
      },
    },
  },
};

export const buildMimadBatchPrompt = ({ teacherRoleText, systemPromptExtra, count, seed, focusSectionLabel }) => {
  const sectionLine = focusSectionLabel
    ? `כל ${count} השאלות חייבות להיות מהחלק "${focusSectionLabel}" בלבד.`
    : `פזרו את ${count} השאלות בין שלושת החלקים (כמותי, עברית, English) בערך שווה ובסדר אקראי (לא 3 ברצף מאותו חלק).`;

  return `${teacherRoleText}
${systemPromptExtra}

צרו בדיוק ${count} שאלות חדשות בסגנון מבחן מימ״ד.
${sectionLine}

${MIMAD_LANGUAGE_RULE}

${MIMAD_ANSWER_RULE}

${MIMAD_HINT_RULE}

זרע אקראיות (לגיוון בין קריאות שונות): ${seed}.
החזירו JSON בלבד לפי הסכמה שסופקה, בדיוק ${count} פריטים במערך exercises.`;
};

// Per-question follow-up chat: the student got a hint/explanation and is still
// stuck. Builds a tutoring prompt scoped to ONE question, carrying the whole
// mini-conversation so far. Always answers in Hebrew (the learner reads Hebrew,
// even for the English section). `allowRevealAnswer` gates whether the tutor may
// state the final answer — false while the student hasn't answered yet (guide
// the method without spoiling), true once revealed or on the post-exam review.
export const buildQuestionChatPrompt = ({ teacherRoleText, question, conversation, allowRevealAnswer }) => {
  const opts = (question.options || []).map((o, i) => `${i + 1}. ${o}`).join("\n");
  const convoText = conversation
    .map((m) => `${m.role === "user" ? "התלמיד/ה" : "את"}: ${m.text}`)
    .join("\n");

  const revealRule = allowRevealAnswer
    ? `מותר לך לחשוף את התשובה הנכונה ולהסביר אותה במלואה, כי ${"התלמיד/ה"} כבר ראה/תה אותה.`
    : `⚠️ התלמיד/ה עדיין לא ענה/תה על השאלה. אל תגלי איזו אפשרות נכונה ואל תיתני את התשובה הסופית — הדריכי צעד-אחר-צעד להבנת השיטה, תני דוגמה קטנה ומקבילה (עם מספרים אחרים) אם צריך, כך שיגיע/תגיע לתשובה בכוחות עצמו/ה.`;

  return `${teacherRoleText}
את עוזרת לתלמיד/ה שנתקע/ה בשאלה ספציפית מתוך תרגול למבחן מימ״ד. עני **תמיד בעברית** (גם אם השאלה באנגלית), בחום ובסבלנות, בשפה פשוטה. פרקי לצעדים קטנים, השתמשי בדוגמה מספרית קטנה כשזה עוזר, והתייחסי בדיוק לנקודה שלא הובנה. שמרי על תשובה קצרה וממוקדת (עד כ-5 משפטים).

השאלה:
${question.question}

האפשרויות:
${opts}

התשובה הנכונה: ${question.answer}
הרמז הרשמי: ${question.hint || "—"}
ההסבר הרשמי: ${question.solution || "—"}

${revealRule}

השיחה עד כה:
${convoText}

כתבי את התגובה הבאה שלך בלבד (בלי הקידומת "את:").`;
};

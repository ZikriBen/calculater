import { useEffect, useState } from "react";

const STORAGE_KEY = "student_profile";
const CHANGE_EVENT = "studentchange";

const defaults = {
  name: "",
  gender: "male",     // "female" | "male"
  grade: "ד'",          // "א'"–"י״ב"
  theme: "neutral",        // "girl" | "boy" | "neutral"
  dayStorageKey: "naama_day",
};

export const GRADES = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ז'", "ח'", "ט'", "י'", "י״א", "י״ב"];

const load = () => {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
  catch { return { ...defaults }; }
};

// Mutable singleton — ES module live bindings keep all imports in sync.
export const STUDENT = load();

export const saveStudent = (patch) => {
  Object.assign(STUDENT, patch);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(STUDENT));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
};

export const useStudent = () => {
  const [, tick] = useState(0);
  useEffect(() => {
    const h = () => tick(n => n + 1);
    window.addEventListener(CHANGE_EVENT, h);
    return () => window.removeEventListener(CHANGE_EVENT, h);
  }, []);
  return STUDENT;
};

// ------ Stage (tone) ------
// Grades map to one of three stages that control the voice of the assistant:
//   kid     — playful, emoji-friendly, simple language (grades א'–ו')
//   teen    — direct, warm but not childish, fewer emojis (grades ז'–י״ב)
//   academy — concise, formal, no emojis (anything else: university labels)

const KID_GRADES = new Set(["א'", "ב'", "ג'", "ד'", "ה'", "ו'"]);
const TEEN_GRADES = new Set(["ז'", "ח'", "ט'", "י'", "י״א", "י״ב"]);

export const stageFor = (grade = STUDENT.grade) => {
  if (KID_GRADES.has(grade)) return "kid";
  if (TEEN_GRADES.has(grade)) return "teen";
  return "academy";
};

// Noun used to refer to the learner in prompts — respects gender AND stage.
export const studentNoun = (g = STUDENT.gender, stage = stageFor()) => {
  if (stage === "kid")     return g === "male" ? "ילד"    : "ילדה";
  if (stage === "teen")    return g === "male" ? "תלמיד"  : "תלמידה";
  return g === "male" ? "סטודנט" : "סטודנטית";
};

// Noun used for the teacher/assistant persona — stage-dependent.
export const teacherTitle = (stage = stageFor()) => {
  if (stage === "kid")  return "המורה הפרטית";
  if (stage === "teen") return "המורה";
  return "המתרגלת";
};

// Level label shown in UI ("בכיתה X" for school, "בשנה X" for uni if relevant).
const gradeContext = (grade = STUDENT.grade, stage = stageFor(grade)) =>
  stage === "academy" ? `(${grade})` : `בכיתה ${grade}`;

// Tone instructions appended to LLM system prompts.
export const toneGuide = (stage = stageFor()) => {
  if (stage === "kid") {
    return `שפה פשוטה ומשחקית בגובה העיניים של ילד/ה בכיתה ${STUDENT.grade}. מותר להשתמש באימוג'ים. משפטים קצרים ומעודדים.`;
  }
  if (stage === "teen") {
    return `שפה ישירה, בהירה וחמה, ברמה של תלמיד/ת חטיבת ביניים/תיכון בכיתה ${STUDENT.grade}. מעט אימוג'ים, הסברים מדויקים, בלי להצטמצם לאינפנטיליות.`;
  }
  return `שפה אקדמית, ענייניות ותמציתית. ללא אימוג'ים. הסברים מדויקים ופורמליים, עם הגדרות, סימונים וצעדי הוכחה במידת הצורך.`;
};

// ------ Prompt helpers (read live from STUDENT) ------

export const genderGuide = (g = STUDENT.gender) => g === "male"
  ? `כל פנייה אל ${STUDENT.name} חייבת להיות בלשון זכר יחיד (אתה, חשוב, נסה, בדוק, שים לב). אסור להשתמש בלשון נקבה.`
  : `כל פנייה אל ${STUDENT.name} חייבת להיות בלשון נקבה יחיד (את, חשבי, נסי, בדקי, שימי לב). אסור להשתמש בלשון זכר.`;

const DEFAULT_SUBJECT = { roleDative: "לחשבון", inLocative: "במתמטיקה", short: "חשבון" };

export const teacherRole = (subject = DEFAULT_SUBJECT, g = STUDENT.gender) => {
  const stage = stageFor();
  const noun = studentNoun(g, stage);
  const title = stage === "kid"
    ? `מורה פרטית ${subject.roleDative}`
    : stage === "teen"
    ? `מורה ${subject.roleDative}`
    : `מתרגלת ${subject.inLocative}`;
  return `את ${title} ל${noun} ${gradeContext()} בשם ${STUDENT.name}.
${genderGuide(g)}
${toneGuide(stage)}
דברי על עצמך בלשון נקבה (אני ${teacherTitle(stage)} שלך, הכנתי לך).`;
};

export const exampleHint = (g = STUDENT.gender) => g === "male"
  ? `"חבר קודם את העשרות ואז את היחידות, זה יותר קל"`
  : `"חברי קודם את העשרות ואז את היחידות, זה יותר קל"`;

// ------ UI strings (gender + stage aware) ------

export const uiStrings = (subject = DEFAULT_SUBJECT, g = STUDENT.gender, stage = stageFor()) => {
  const female = g !== "male";
  const title = teacherTitle(stage);              // המורה / המתרגלת
  const teacherIntroBase =
    stage === "kid"  ? `אני המורה הפרטית שלך ${subject.roleDative}` :
    stage === "teen" ? `אני המורה שלך ${subject.roleDative}` :
                       `אני המתרגלת שלך ${subject.inLocative}`;

  const blurb =
    stage === "kid"
      ? (female
          ? "אני אכין לך תרגילים מותאמים אישית, ואם תרצי – אפשר להעלות תמונה של מבחן ואנתח אותו יחד!"
          : "אני אכין לך תרגילים מותאמים אישית, ואם תרצה – אפשר להעלות תמונה של מבחן וננתח אותו יחד!")
      : stage === "teen"
      ? (female
          ? "תרגולים מותאמים לרמה שלך, עם משוב ברור. אפשר גם להעלות מבחן ולנתח אותו יחד."
          : "תרגולים מותאמים לרמה שלך, עם משוב ברור. אפשר גם להעלות מבחן ולנתח אותו יחד.")
      : "תרגולים ממוקדים ברמה אקדמית, עם פתרון מלא ומשוב תמציתי. ניתן להעלות חומר קיים לניתוח.";

  const startDay =
    stage === "kid"  ? (female ? "בואו נתחיל יום תרגול! 🚀" : "התחלת יום תרגול! 🚀") :
    stage === "teen" ? "בוא/י נתחיל תרגול" :
                       "התחלת סשן תרגול";

  return {
    greeting: `שלום ${STUDENT.name}! 👋`,
    teacherIntro: teacherIntroBase,
    teacherBlurb: blurb,
    startDay,
    uploadExam: "העלאת תמונה של מבחן 📝",
    askTeacher: `שאל/י את ${title} שאלה 💬`,
    thinking: `${title} חושבת...`,
    preparing: `${title} מכינה תרגילים...`,
    checking: `${title} בודקת את התרגילים עכשיו...`,
    savedLabel: "שמור",
    cancelLabel: "ביטול",
    startPractice: female ? "התחלת תרגול" : "התחל תרגול",
  };
};

// ------ Theme tokens ------

export const THEMES = {
  girl: {
    label: "בת",
    emoji: "🌸",
    avatar: "🦋",
    pageBg: "bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50",
    avatarGradient: "from-purple-400 via-pink-400 to-yellow-400",
    iconGradient: "from-purple-500 to-pink-500",
    ctaGradient: "from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
    accentText: "text-purple-700",
    softText: "text-purple-600",
    borderSoft: "border-purple-100",
    dotColors: ["bg-purple-400", "bg-pink-400", "bg-yellow-400"],
  },
  boy: {
    label: "בן",
    emoji: "🚀",
    avatar: "🦖",
    pageBg: "bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50",
    avatarGradient: "from-sky-400 via-cyan-400 to-teal-400",
    iconGradient: "from-sky-500 to-cyan-500",
    ctaGradient: "from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600",
    accentText: "text-sky-700",
    softText: "text-sky-600",
    borderSoft: "border-sky-100",
    dotColors: ["bg-sky-400", "bg-cyan-400", "bg-teal-400"],
  },
  neutral: {
    label: "ניטרלי",
    emoji: "🌟",
    avatar: "🦉",
    pageBg: "bg-gradient-to-br from-emerald-50 via-lime-50 to-yellow-50",
    avatarGradient: "from-emerald-400 via-lime-400 to-yellow-400",
    iconGradient: "from-emerald-500 to-lime-500",
    ctaGradient: "from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600",
    accentText: "text-emerald-700",
    softText: "text-emerald-600",
    borderSoft: "border-emerald-100",
    dotColors: ["bg-emerald-400", "bg-lime-400", "bg-yellow-400"],
  },
};

export const themeTokens = (name = STUDENT.theme) => THEMES[name] || THEMES.neutral;

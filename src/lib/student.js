import { useEffect, useState } from "react";

const STORAGE_KEY = "student_profile";
const CHANGE_EVENT = "studentchange";

const defaults = {
  name: "",
  gender: "male",     // "female" | "male"
  grade: "ד'",          // "א'" | "ב'" | "ג'" | "ד'" | "ה'" | "ו'"
  theme: "neutral",        // "girl" | "boy" | "neutral"
  dayStorageKey: "naama_day",
};

export const GRADES = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'"];

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

// ------ Prompt helpers (read live from STUDENT) ------

export const genderGuide = (g = STUDENT.gender) => g === "male"
  ? `כל פנייה אל ${STUDENT.name} חייבת להיות בלשון זכר יחיד (אתה, חשוב, נסה, בדוק, שים לב). אסור להשתמש בלשון נקבה.`
  : `כל פנייה אל ${STUDENT.name} חייבת להיות בלשון נקבה יחיד (את, חשבי, נסי, בדקי, שימי לב). אסור להשתמש בלשון זכר.`;

export const teacherRole = (g = STUDENT.gender) => {
  const studentNoun = g === "male" ? "ילד" : "ילדה";
  return `את מורה פרטית לחשבון ל${studentNoun} בכיתה ${STUDENT.grade} בשם ${STUDENT.name}.
${genderGuide(g)}
דברי על עצמך בלשון נקבה (אני המורה שלך, הכנתי לך).`;
};

export const exampleHint = (g = STUDENT.gender) => g === "male"
  ? `"חבר קודם את העשרות ואז את היחידות, זה יותר קל"`
  : `"חברי קודם את העשרות ואז את היחידות, זה יותר קל"`;

// ------ UI strings (gender-aware) ------

export const uiStrings = (g = STUDENT.gender) => g === "male" ? {
  greeting: `שלום ${STUDENT.name}! 👋`,
  teacherIntro: "אני המורה הפרטית שלך לחשבון",
  teacherBlurb: "אני אכין לך תרגילים מותאמים אישית, ואם תרצה – אפשר להעלות תמונה של מבחן וננתח אותו יחד!",
  startDay: "התחלת יום תרגול! 🚀",
  uploadExam: "העלאת תמונה של מבחן 📝",
  askTeacher: "שאל/י את המורה שאלה 💬",
  thinking: "המורה חושבת...",
  preparing: "המורה מכינה תרגילים...",
  checking: "המורה בודקת את התרגילים עכשיו...",
  savedLabel: "שמור",
  cancelLabel: "ביטול",
  startPractice: "התחל תרגול",
} : {
  greeting: `שלום ${STUDENT.name}! 👋`,
  teacherIntro: "אני המורה הפרטית שלך לחשבון",
  teacherBlurb: "אני אכין לך תרגילים מותאמים אישית, ואם תרצי – אפשר להעלות תמונה של מבחן ואנתח אותו יחד!",
  startDay: "בואו נתחיל יום תרגול! 🚀",
  uploadExam: "העלאת תמונה של מבחן 📝",
  askTeacher: "שאל/י את המורה שאלה 💬",
  thinking: "המורה חושבת...",
  preparing: "המורה מכינה תרגילים...",
  checking: "המורה בודקת את התרגילים עכשיו...",
  savedLabel: "שמור",
  cancelLabel: "ביטול",
  startPractice: "התחלת תרגול",
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

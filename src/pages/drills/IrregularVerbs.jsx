import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STUDENT, themeTokens, useStudent } from "@/lib/student";

const DRILLS_BY_DIFF = { easy: 8, medium: 10, hard: 12 };

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const readDifficulty = () => {
  try {
    const raw = localStorage.getItem("practice_context");
    if (raw) { const ctx = JSON.parse(raw); return ctx.difficulty || "easy"; }
  } catch {}
  return "easy";
};

const GRADE_ORDER = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'"];
const gradeUp = (grade) => {
  const idx = GRADE_ORDER.indexOf(grade);
  return idx >= 0 && idx < GRADE_ORDER.length - 1 ? GRADE_ORDER[idx + 1] : grade;
};

const VERBS_BY_GRADE = {
  "ב'": [
    { base: "go", past: "went", pp: "gone", he: "ללכת" },
    { base: "eat", past: "ate", pp: "eaten", he: "לאכול" },
    { base: "see", past: "saw", pp: "seen", he: "לראות" },
    { base: "run", past: "ran", pp: "run", he: "לרוץ" },
    { base: "come", past: "came", pp: "come", he: "לבוא" },
    { base: "give", past: "gave", pp: "given", he: "לתת" },
    { base: "take", past: "took", pp: "taken", he: "לקחת" },
    { base: "make", past: "made", pp: "made", he: "לעשות" },
    { base: "say", past: "said", pp: "said", he: "לומר" },
    { base: "get", past: "got", pp: "got", he: "לקבל" },
  ],
  "ג'": [
    { base: "go", past: "went", pp: "gone", he: "ללכת" },
    { base: "eat", past: "ate", pp: "eaten", he: "לאכול" },
    { base: "see", past: "saw", pp: "seen", he: "לראות" },
    { base: "run", past: "ran", pp: "run", he: "לרוץ" },
    { base: "come", past: "came", pp: "come", he: "לבוא" },
    { base: "give", past: "gave", pp: "given", he: "לתת" },
    { base: "take", past: "took", pp: "taken", he: "לקחת" },
    { base: "make", past: "made", pp: "made", he: "לעשות" },
    { base: "write", past: "wrote", pp: "written", he: "לכתוב" },
    { base: "read", past: "read", pp: "read", he: "לקרוא" },
    { base: "draw", past: "drew", pp: "drawn", he: "לצייר" },
    { base: "drink", past: "drank", pp: "drunk", he: "לשתות" },
    { base: "sing", past: "sang", pp: "sung", he: "לשיר" },
    { base: "swim", past: "swam", pp: "swum", he: "לשחות" },
    { base: "fly", past: "flew", pp: "flown", he: "לעוף" },
  ],
  "ד'": [
    { base: "begin", past: "began", pp: "begun", he: "להתחיל" },
    { base: "break", past: "broke", pp: "broken", he: "לשבור" },
    { base: "bring", past: "brought", pp: "brought", he: "להביא" },
    { base: "buy", past: "bought", pp: "bought", he: "לקנות" },
    { base: "catch", past: "caught", pp: "caught", he: "לתפוס" },
    { base: "choose", past: "chose", pp: "chosen", he: "לבחור" },
    { base: "drive", past: "drove", pp: "driven", he: "לנהוג" },
    { base: "fall", past: "fell", pp: "fallen", he: "ליפול" },
    { base: "feel", past: "felt", pp: "felt", he: "להרגיש" },
    { base: "find", past: "found", pp: "found", he: "למצוא" },
    { base: "forget", past: "forgot", pp: "forgotten", he: "לשכוח" },
    { base: "grow", past: "grew", pp: "grown", he: "לגדול" },
    { base: "hide", past: "hid", pp: "hidden", he: "להתחבא" },
    { base: "keep", past: "kept", pp: "kept", he: "לשמור" },
    { base: "know", past: "knew", pp: "known", he: "לדעת" },
  ],
  "ה'": [
    { base: "become", past: "became", pp: "become", he: "להפוך ל" },
    { base: "blow", past: "blew", pp: "blown", he: "לנשוף" },
    { base: "build", past: "built", pp: "built", he: "לבנות" },
    { base: "cost", past: "cost", pp: "cost", he: "לעלות (מחיר)" },
    { base: "dig", past: "dug", pp: "dug", he: "לחפור" },
    { base: "feed", past: "fed", pp: "fed", he: "להאכיל" },
    { base: "fight", past: "fought", pp: "fought", he: "להילחם" },
    { base: "freeze", past: "froze", pp: "frozen", he: "לקפוא" },
    { base: "hang", past: "hung", pp: "hung", he: "לתלות" },
    { base: "hold", past: "held", pp: "held", he: "להחזיק" },
    { base: "lead", past: "led", pp: "led", he: "להוביל" },
    { base: "lend", past: "lent", pp: "lent", he: "להלוות" },
    { base: "lose", past: "lost", pp: "lost", he: "לאבד" },
    { base: "rise", past: "rose", pp: "risen", he: "לעלות" },
    { base: "shake", past: "shook", pp: "shaken", he: "לנער" },
    { base: "shine", past: "shone", pp: "shone", he: "לזרוח" },
    { base: "shoot", past: "shot", pp: "shot", he: "לירות" },
    { base: "shut", past: "shut", pp: "shut", he: "לסגור" },
    { base: "speak", past: "spoke", pp: "spoken", he: "לדבר" },
    { base: "spend", past: "spent", pp: "spent", he: "להוציא/לבלות" },
  ],
  "ו'": [
    { base: "arise", past: "arose", pp: "arisen", he: "לקום/להתעורר" },
    { base: "bear", past: "bore", pp: "borne", he: "לשאת" },
    { base: "beat", past: "beat", pp: "beaten", he: "לנצח" },
    { base: "bind", past: "bound", pp: "bound", he: "לקשור" },
    { base: "bite", past: "bit", pp: "bitten", he: "לנשוך" },
    { base: "breed", past: "bred", pp: "bred", he: "לגדל" },
    { base: "burst", past: "burst", pp: "burst", he: "להתפוצץ" },
    { base: "cast", past: "cast", pp: "cast", he: "להשליך" },
    { base: "creep", past: "crept", pp: "crept", he: "לזחול" },
    { base: "deal", past: "dealt", pp: "dealt", he: "להתעסק" },
    { base: "flee", past: "fled", pp: "fled", he: "לברוח" },
    { base: "forbid", past: "forbade", pp: "forbidden", he: "לאסור" },
    { base: "grind", past: "ground", pp: "ground", he: "לטחון" },
    { base: "leap", past: "leapt", pp: "leapt", he: "לקפוץ" },
    { base: "seek", past: "sought", pp: "sought", he: "לחפש" },
    { base: "sow", past: "sowed", pp: "sown", he: "לזרוע" },
    { base: "strike", past: "struck", pp: "struck", he: "להכות" },
    { base: "swear", past: "swore", pp: "sworn", he: "להישבע" },
    { base: "tear", past: "tore", pp: "torn", he: "לקרוע" },
    { base: "weave", past: "wove", pp: "woven", he: "לארוג" },
  ],
};

VERBS_BY_GRADE["א'"] = VERBS_BY_GRADE["ב'"];
VERBS_BY_GRADE["ז'"] = VERBS_BY_GRADE["ו'"];
VERBS_BY_GRADE["ח'"] = VERBS_BY_GRADE["ו'"];

const verbsFor = (grade) =>
  VERBS_BY_GRADE[grade] || VERBS_BY_GRADE["ד'"];

export default function IrregularVerbs() {
  const navigate = useNavigate();
  useStudent();
  const theme = themeTokens();

  useEffect(() => {
    localStorage.removeItem("practice_context");
    localStorage.removeItem("exam_context");
  }, []);

  const difficulty = useMemo(readDifficulty, []);
  const DRILLS_PER_SESSION = DRILLS_BY_DIFF[difficulty] || 10;

  const problems = useMemo(() => {
    const grade = difficulty === "hard" ? gradeUp(STUDENT.grade) : STUDENT.grade;
    const verbs = shuffle(verbsFor(grade)).slice(0, DRILLS_PER_SESSION);
    return verbs.map(v => {
      const mode = Math.random() < 0.5 ? "past" : "pp";
      return { ...v, mode };
    });
  }, []);

  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [phase, setPhase] = useState("drill");

  return (
    <div className={`min-h-screen ${theme.pageBg}`} dir="rtl">
      <header className="bg-white/70 backdrop-blur-md border-b border-sky-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/chat")}
            className="flex items-center gap-1.5 text-sky-500 hover:text-sky-700 text-sm font-medium transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה
          </button>
          <h1 className="font-bold text-sky-700">פעלים יוצאי דופן 🔄</h1>
          <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
            <span className="text-xs font-semibold text-yellow-700">{Math.min(index + 1, DRILLS_PER_SESSION)}/{DRILLS_PER_SESSION}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-2">
          <div className="flex gap-1.5">
            {problems.map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full ${
                i < index ? "bg-green-400" : i === index ? "bg-gradient-to-r from-sky-400 to-cyan-400" : "bg-gray-200"
              }`} />
            ))}
          </div>
        </div>
      </header>

      {phase !== "done" ? (
        <VerbCard
          key={index}
          problem={problems[index]}
          streak={streak}
          onAnswer={(wasCorrect) => {
            if (wasCorrect) {
              setCorrectCount(c => c + 1);
              setStreak(s => {
                const next = s + 1;
                setBestStreak(b => Math.max(b, next));
                return next;
              });
            } else {
              setStreak(0);
            }
            if (index + 1 < DRILLS_PER_SESSION) setIndex(i => i + 1);
            else setPhase("done");
          }}
        />
      ) : (
        <SessionSummary
          correct={correctCount}
          total={DRILLS_PER_SESSION}
          bestStreak={bestStreak}
          onAgain={() => navigate(0)}
          onHome={() => navigate("/chat")}
        />
      )}
    </div>
  );
}

function VerbCard({ problem, streak, onAnswer }) {
  useStudent();
  const { base, past, pp, he, mode } = problem;

  const answer = mode === "past" ? past : pp;
  const young = ["א'","ב'"].includes(STUDENT.grade);
  const modeLabel = mode === "past" ? "Past Simple" : "Past Participle";
  const modeLabelHe = mode === "past" ? "עבר פשוט" : "עבר שלישי";

  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const normalize = (s) => s.trim().toLowerCase();

  const submit = () => {
    if (value.trim() === "" || feedback) return;
    const ok = normalize(value) === normalize(answer);
    setFeedback(ok ? "correct" : "wrong");
    setTimeout(() => onAnswer(ok), ok ? 600 : 1800);
  };

  const inputBorder =
    feedback === "correct" ? "border-green-500 bg-green-50 text-green-800"
    : feedback === "wrong" ? "border-red-400 bg-red-50 text-red-700"
    : "border-sky-300 bg-white text-gray-800 focus:border-sky-500";

  return (
    <main className="max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-6">
      {streak >= 2 && (
        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-3 py-1 text-orange-700 font-bold text-sm">
          <Zap className="w-4 h-4 fill-orange-400" /> רצף {streak}!
        </div>
      )}

      <div className="bg-white rounded-3xl border-2 border-sky-200 shadow-sm px-6 py-8 w-full text-center">
        <div className="text-sm text-gray-400 mb-2">{he}</div>
        <div className="text-4xl font-black text-sky-800 mb-3" dir="ltr">{base}</div>
        <div className="inline-block bg-sky-50 border border-sky-200 rounded-full px-3 py-1">
          {young
            ? <span className="text-sm font-semibold text-sky-700">{modeLabelHe}</span>
            : <><span className="text-sm font-semibold text-sky-700" dir="ltr">{modeLabel}</span><span className="text-xs text-gray-400 mr-2">({modeLabelHe})</span></>
          }
        </div>
      </div>

      {/* Show the verb table for context */}
      <div className="flex gap-4 text-center text-xs text-gray-400" dir="ltr">
        <div>
          <div className="font-semibold text-gray-500">{young ? "בסיס" : "Base"}</div>
          <div className="font-bold text-sky-700">{base}</div>
        </div>
        <div>
          <div className="font-semibold text-gray-500">{young ? "עבר" : "Past"}</div>
          <div className={`font-bold ${mode === "past" ? "text-sky-400" : "text-gray-300"}`}>
            {mode === "past" ? "?" : past}
          </div>
        </div>
        <div>
          <div className="font-semibold text-gray-500">{young ? "עבר III" : "P.P."}</div>
          <div className={`font-bold ${mode === "pp" ? "text-sky-400" : "text-gray-300"}`}>
            {mode === "pp" ? "?" : pp}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="text"
        dir="ltr"
        value={value}
        disabled={feedback !== null}
        onChange={(e) => setValue(e.target.value.replace(/[^a-zA-Z\s-]/g, "").slice(0, 20))}
        onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
        placeholder={young ? `כתבו את ה${modeLabelHe}...` : `Type the ${modeLabel.toLowerCase()}...`}
        className={`w-full max-w-xs h-16 text-center text-2xl font-bold rounded-2xl border-4 transition-colors focus:outline-none ${inputBorder}`}
      />

      {feedback === "wrong" && (
        <div className="text-center bg-white rounded-2xl border border-gray-200 p-4 w-full max-w-xs">
          <p className="text-red-600 font-semibold mb-2">
            התשובה הנכונה: <span className="text-green-700 font-mono text-xl" dir="ltr">{answer}</span>
          </p>
          <div className="flex justify-center gap-4 text-sm" dir="ltr">
            <span className="text-gray-500">{base}</span>
            <span className="text-gray-500">→</span>
            <span className="font-bold text-gray-700">{past}</span>
            <span className="text-gray-500">→</span>
            <span className="font-bold text-gray-700">{pp}</span>
          </div>
        </div>
      )}

      <Button
        onClick={submit}
        disabled={value.trim() === "" || feedback !== null}
        className="w-full max-w-xs h-12 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold"
      >
        {feedback === "correct" ? "🎉 יופי!" : feedback === "wrong" ? "ממשיכים…" : "✅ בדיקה"}
      </Button>
    </main>
  );
}

function SessionSummary({ correct, total, bestStreak, onAgain, onHome }) {
  const perfect = correct === total;
  return (
    <main className="max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-6 text-center">
      <div className="text-6xl">{perfect ? "🏆" : correct >= total / 2 ? "🎉" : "💪"}</div>
      <h2 className="text-3xl font-black text-sky-700">
        {perfect ? "מושלם!" : "כל הכבוד!"}
      </h2>
      <div className="text-5xl font-black text-sky-700">{correct}/{total}</div>
      {bestStreak >= 3 && (
        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-4 py-1.5 text-orange-700 font-bold">
          <Zap className="w-4 h-4 fill-orange-400" /> רצף הכי ארוך: {bestStreak}
        </div>
      )}
      <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
        <Button onClick={onAgain} className="w-full h-12 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold">
          <RotateCcw className="w-4 h-4 ml-2" /> סבב חדש
        </Button>
        <Button onClick={onHome} variant="outline" className="rounded-2xl h-12 border-sky-200 text-sky-700">
          💬 חזרה לשיחה
        </Button>
      </div>
    </main>
  );
}

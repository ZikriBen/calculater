import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STUDENT, themeTokens, useStudent } from "@/lib/student";

const DRILLS_PER_SESSION = 12;

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Per-grade range for both factors. Grade ב' is intentionally tiny (single
// digits up to 5) so it doubles as an introduction to memorisation.
const factorRange = (grade) => {
  switch (grade) {
    case "א'":
    case "ב'": return [2, 5];
    case "ג'": return [2, 10];
    default:   return [2, 12];
  }
};

const generateProblem = (grade) => {
  const [lo, hi] = factorRange(grade);
  const a = randInt(lo, hi);
  const b = randInt(lo, hi);
  return { a, b, answer: a * b };
};

export default function TimesTableSprint() {
  const navigate = useNavigate();
  useStudent();
  const theme = themeTokens();

  useEffect(() => {
    localStorage.removeItem("practice_context");
    localStorage.removeItem("exam_context");
  }, []);

  const problems = useMemo(
    () => Array.from({ length: DRILLS_PER_SESSION }, () => generateProblem(STUDENT.grade)),
    []
  );

  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [phase, setPhase] = useState("drill");

  return (
    <div className={`min-h-screen ${theme.pageBg}`} dir="rtl">
      <header className="bg-white/70 backdrop-blur-md border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/chat")}
            className="flex items-center gap-1.5 text-purple-500 hover:text-purple-700 text-sm font-medium transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה
          </button>
          <h1 className={`font-bold ${theme.accentText}`}>לוח הכפל מהיר ⚡</h1>
          <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
            <span className="text-xs font-semibold text-yellow-700">{Math.min(index + 1, DRILLS_PER_SESSION)}/{DRILLS_PER_SESSION}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-2">
          <div className="flex gap-1.5">
            {problems.map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full ${
                i < index ? "bg-green-400" : i === index ? `bg-gradient-to-r ${theme.ctaGradient}` : "bg-gray-200"
              }`} />
            ))}
          </div>
        </div>
      </header>

      {phase !== "done" ? (
        <SprintCard
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
          theme={theme}
        />
      )}
    </div>
  );
}

function SprintCard({ problem, streak, onAnswer }) {
  useStudent();
  const theme = themeTokens();
  const { a, b, answer } = problem;

  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState(null); // null | "correct" | "wrong"
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = () => {
    if (value === "" || feedback) return;
    const ok = Number(value) === answer;
    setFeedback(ok ? "correct" : "wrong");
    setTimeout(() => onAnswer(ok), ok ? 600 : 1400);
  };

  const inputBorder =
    feedback === "correct" ? "border-green-500 bg-green-50 text-green-800"
    : feedback === "wrong" ? "border-red-400 bg-red-50 text-red-700"
    : "border-purple-300 bg-white text-gray-800 focus:border-purple-500";

  return (
    <main className="max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-8">
      {streak >= 2 && (
        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-3 py-1 text-orange-700 font-bold text-sm">
          <Zap className="w-4 h-4 fill-orange-400" /> רצף {streak}!
        </div>
      )}

      <div className="bg-white rounded-3xl border-2 border-purple-200 shadow-sm px-8 py-10 w-full">
        <div className="text-center text-5xl sm:text-6xl font-black text-purple-700 tracking-wider" dir="ltr">
          {a} × {b} = ?
        </div>
      </div>

      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={value}
        disabled={feedback !== null}
        onChange={(e) => setValue(e.target.value.replace(/\D/g, "").slice(0, 4))}
        onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
        className={`w-32 h-20 text-center text-5xl font-black rounded-2xl border-4 transition-colors focus:outline-none ${inputBorder}`}
      />

      {feedback === "wrong" && (
        <p className="text-red-600 font-semibold">
          התשובה הנכונה: <span className="text-green-700">{answer}</span>
        </p>
      )}

      <Button
        onClick={submit}
        disabled={value === "" || feedback !== null}
        className={`w-full max-w-xs h-12 rounded-2xl bg-gradient-to-r ${theme.ctaGradient} text-white font-bold`}
      >
        {feedback === "correct" ? "🎉 יופי!" : feedback === "wrong" ? "ממשיכות…" : "✅ בדיקה"}
      </Button>
    </main>
  );
}

function SessionSummary({ correct, total, bestStreak, onAgain, onHome, theme }) {
  const perfect = correct === total;
  return (
    <main className="max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-6 text-center">
      <div className="text-6xl">{perfect ? "🏆" : correct >= total / 2 ? "🎉" : "💪"}</div>
      <h2 className={`text-3xl font-black ${theme.accentText}`}>
        {perfect ? "מושלם!" : "כל הכבוד!"}
      </h2>
      <div className="text-5xl font-black text-purple-700">{correct}/{total}</div>
      {bestStreak >= 3 && (
        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-4 py-1.5 text-orange-700 font-bold">
          <Zap className="w-4 h-4 fill-orange-400" /> רצף הכי ארוך: {bestStreak}
        </div>
      )}
      <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
        <Button onClick={onAgain} className={`w-full h-12 rounded-2xl bg-gradient-to-r ${theme.ctaGradient} text-white font-bold`}>
          <RotateCcw className="w-4 h-4 ml-2" /> סבב חדש
        </Button>
        <Button onClick={onHome} variant="outline" className="rounded-2xl h-12 border-purple-200 text-purple-700">
          💬 חזרה לשיחה
        </Button>
      </div>
    </main>
  );
}

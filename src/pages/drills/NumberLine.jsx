import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STUDENT, themeTokens, useStudent } from "@/lib/student";

const DRILLS_PER_SESSION = 5;
const TICKS = 7; // number of positions on the line

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Per-grade configuration: which step sizes are allowed, and the [min, max]
// window for the starting value. Negative starts are intentional from ה' onwards
// so that lines straddle zero (negative-numbers topic in middle school).
const configByGrade = (grade) => {
  switch (grade) {
    case "א'":
      return { steps: [1], startRange: [0, 14] };
    case "ב'":
      return { steps: [1, 2, 5], startRange: [0, 70] };
    case "ג'":
      return { steps: [1, 2, 5, 10, 25], startRange: [0, 400] };
    case "ד'":
      return { steps: [1, 10, 25, 50, 100], startRange: [-20, 600] };
    case "ה'":
    case "ו'":
      return { steps: [1, 5, 10, 25, 50, 100, 250], startRange: [-100, 5000] };
    case "ז'":
    case "ח'":
      return { steps: [1, 2, 5, 10, 25, 100], startRange: [-50, 50] };
    default:
      return { steps: [1, 10, 50, 100, 500, 1000], startRange: [-200, 10000] };
  }
};

// One problem = a sequence of TICKS numbers in arithmetic progression, with
// some indices blanked out for the student to fill.
const generateProblem = (grade) => {
  const { steps, startRange } = configByGrade(grade);
  const step = choice(steps);
  // Snap start to a multiple of step so numbers look clean.
  const rawStart = randInt(startRange[0], startRange[1]);
  // Floor-mod so snapping behaves correctly for negative values too.
  const offset = ((rawStart % step) + step) % step;
  const start = rawStart - offset;
  const values = Array.from({ length: TICKS }, (_, i) => start + i * step);

  // Pick 2–3 indices to hide. Never hide both endpoints — the kid needs anchors.
  const candidates = [1, 2, 3, 4, 5]; // skip 0 and TICKS-1
  const hideCount = randInt(2, 3);
  const hidden = new Set();
  while (hidden.size < hideCount) hidden.add(choice(candidates));
  return { values, step, hidden: [...hidden].sort((a, b) => a - b) };
};

export default function NumberLine() {
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
          <h1 className={`font-bold ${theme.accentText}`}>שכנים על ציר המספרים 🔢</h1>
          <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
            <span className="text-xs font-semibold text-yellow-700">{index + 1}/{DRILLS_PER_SESSION}</span>
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
        <NumberLineDrill
          key={index}
          problem={problems[index]}
          onComplete={(wasCorrect) => {
            if (wasCorrect) setCorrectCount(c => c + 1);
            if (index + 1 < DRILLS_PER_SESSION) setIndex(i => i + 1);
            else setPhase("done");
          }}
        />
      ) : (
        <SessionSummary
          correct={correctCount}
          total={DRILLS_PER_SESSION}
          onAgain={() => navigate(0)}
          onHome={() => navigate("/chat")}
          theme={theme}
        />
      )}
    </div>
  );
}

function NumberLineDrill({ problem, onComplete }) {
  useStudent();
  const theme = themeTokens();
  const { values, step, hidden } = problem;
  const hiddenSet = useMemo(() => new Set(hidden), [hidden]);

  const [entries, setEntries] = useState({});
  const [checked, setChecked] = useState(false);
  const inputRefs = useRef({});

  const setEntry = (idx, value) => {
    // Allow an optional leading minus, then digits.
    const sign = value.trim().startsWith("-") ? "-" : "";
    const sanitized = sign + value.replace(/[^\d]/g, "");
    setEntries(prev => ({ ...prev, [idx]: sanitized }));
  };

  const allFilled = hidden.every(i => (entries[i] ?? "") !== "");
  const cellState = (i) => {
    if (!hiddenSet.has(i)) return "given";
    if (!checked) return "pending";
    return Number(entries[i]) === values[i] ? "correct" : "wrong";
  };
  const allCorrect = checked && hidden.every(i => Number(entries[i]) === values[i]);

  // Focus first blank when problem mounts.
  useEffect(() => {
    if (hidden.length) inputRefs.current[hidden[0]]?.focus();
  }, [hidden]);

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col items-center gap-6">
      <p className="text-purple-700 text-sm text-center">
        מלאי את המספרים החסרים על ציר המספרים.<br />
        ההפרש בין כל שני שכנים הוא <span className="font-bold">{step}</span>.
      </p>

      <div className="bg-white rounded-3xl border-2 border-purple-200 shadow-sm px-4 py-8 w-full">
        <div className="relative" dir="ltr">
          {/* The line itself */}
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-purple-300 rounded-full" />
          <div className="relative flex justify-between items-center">
            {values.map((v, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-1 h-4 bg-purple-400 rounded-full" />
                {cellState(i) === "given" ? (
                  <div className="w-12 h-10 sm:w-14 sm:h-12 flex items-center justify-center rounded-lg bg-purple-50 border border-purple-100 text-purple-800 text-lg sm:text-xl font-bold">
                    {v}
                  </div>
                ) : (
                  <NumberInput
                    ref={(el) => (inputRefs.current[i] = el)}
                    value={entries[i] ?? ""}
                    onChange={(val) => setEntry(i, val)}
                    state={cellState(i)}
                    expected={values[i]}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 w-full max-w-xs">
        {!checked ? (
          <Button
            onClick={() => setChecked(true)}
            disabled={!allFilled}
            className={`w-full h-12 rounded-2xl bg-gradient-to-r ${theme.ctaGradient} text-white font-bold`}
          >
            ✅ בדיקה
          </Button>
        ) : allCorrect ? (
          <div className="w-full text-center">
            <div className="text-4xl">🎉</div>
            <p className="text-green-700 font-bold mt-2">מעולה!</p>
            <Button
              onClick={() => onComplete(true)}
              className={`w-full h-12 rounded-2xl bg-gradient-to-r ${theme.ctaGradient} text-white font-bold mt-4`}
            >
              הבא →
            </Button>
          </div>
        ) : (
          <div className="w-full text-center space-y-3">
            <p className="text-red-600 font-semibold">כמעט! התשובות האדומות שגויות.</p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => setChecked(false)}
                variant="outline"
                className="rounded-2xl border-purple-200 text-purple-700"
              >
                תקני ונסי שוב
              </Button>
              <Button
                onClick={() => onComplete(false)}
                variant="outline"
                className="rounded-2xl border-gray-200 text-gray-600"
              >
                דלגי →
              </Button>
            </div>
          </div>
        )}
      </div>

      <details className="text-xs text-purple-500 self-stretch mt-2">
        <summary className="cursor-pointer font-semibold">📖 איך פותרים?</summary>
        <div className="mt-2 text-sm text-gray-700 leading-relaxed space-y-1">
          <p>1. בודקים מהו ההפרש בין שני שכנים על הציר (כאן: {step}).</p>
          <p>2. כדי למצוא מספר חסר — מוסיפים את ההפרש לשכן משמאל, או מחסירים אותו מהשכן מימין.</p>
        </div>
      </details>
    </main>
  );
}

const NumberInput = forwardRef(function NumberInput({ value, onChange, state, expected }, ref) {
  const border =
    state === "correct" ? "border-green-500 bg-green-50 text-green-800"
    : state === "wrong" ? "border-red-400 bg-red-50 text-red-700"
    : "border-purple-300 bg-white text-gray-800 focus-within:border-purple-500";
  return (
    <div className="relative">
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={6}
        className={`w-12 h-10 sm:w-14 sm:h-12 text-center rounded-lg text-lg sm:text-xl font-bold border-2 focus:outline-none transition-colors ${border}`}
      />
      {state === "wrong" && (
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-green-700 font-bold whitespace-nowrap">
          {expected}
        </span>
      )}
    </div>
  );
});

function SessionSummary({ correct, total, onAgain, onHome, theme }) {
  const perfect = correct === total;
  return (
    <main className="max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-6 text-center">
      <div className="text-6xl">{perfect ? "🏆" : correct >= total / 2 ? "🎉" : "💪"}</div>
      <h2 className={`text-3xl font-black ${theme.accentText}`}>
        {perfect ? "מושלם!" : "כל הכבוד!"}
      </h2>
      <div className="text-5xl font-black text-purple-700">{correct}/{total}</div>
      <p className="text-purple-600">
        {perfect ? "פתרת את כל התרגילים נכון! 🌟" : `פתרת ${correct} מתוך ${total} תרגילים נכונים.`}
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
        <Button
          onClick={onAgain}
          className={`w-full h-12 rounded-2xl bg-gradient-to-r ${theme.ctaGradient} text-white font-bold`}
        >
          <RotateCcw className="w-4 h-4 ml-2" /> סבב חדש
        </Button>
        <Button onClick={onHome} variant="outline" className="rounded-2xl h-12 border-purple-200 text-purple-700">
          💬 חזרה לשיחה
        </Button>
      </div>
    </main>
  );
}

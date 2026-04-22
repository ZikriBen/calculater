import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STUDENT, themeTokens, useStudent } from "@/lib/student";

const DRILLS_PER_SESSION = 5;

// Pick a random integer in [min, max] inclusive.
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Problem generator by grade. Always single-digit multiplier for now (single partial product).
// Each problem guarantees at least one column with a carry so the scratch row is useful.
const generateProblem = (grade) => {
  const rangeByGrade = {
    "א'": { m: [10, 20], x: [2, 5] },
    "ב'": { m: [11, 50], x: [2, 5] },
    "ג'": { m: [12, 99], x: [2, 9] },
    "ד'": { m: [100, 999], x: [2, 9] },
    "ה'": { m: [100, 999], x: [2, 9] },
    "ו'": { m: [100, 999], x: [2, 9] },
  };
  const r = rangeByGrade[grade] || rangeByGrade["ד'"];
  // Retry a few times to prefer problems with at least one carry.
  for (let tries = 0; tries < 5; tries++) {
    const m = randInt(r.m[0], r.m[1]);
    const x = randInt(r.x[0], r.x[1]);
    const hasCarry = String(m).split("").some(d => Number(d) * x >= 10);
    if (hasCarry || tries === 4) return { multiplicand: m, multiplier: x };
  }
  return { multiplicand: randInt(r.m[0], r.m[1]), multiplier: randInt(r.x[0], r.x[1]) };
};

const digitsOf = (n) => String(n).split("").map(Number);

const padLeft = (digits, width) => {
  const pad = Array(Math.max(0, width - digits.length)).fill(null);
  return [...pad, ...digits];
};

export default function VerticalPractice() {
  const navigate = useNavigate();
  useStudent();
  const theme = themeTokens();

  // Clear any Practice handoff context on mount — we've handled it by landing here.
  useEffect(() => {
    localStorage.removeItem("practice_context");
    localStorage.removeItem("exam_context");
  }, []);

  // Generate the full session up front so rerenders don't reshuffle.
  const problems = useMemo(
    () => Array.from({ length: DRILLS_PER_SESSION }, () => generateProblem(STUDENT.grade)),
    []
  );

  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState("drill"); // drill | reviewing | done

  const problem = problems[index];

  return (
    <div className={`min-h-screen ${theme.pageBg}`} dir="rtl">
      <header className="bg-white/70 backdrop-blur-md border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-purple-500 hover:text-purple-700 text-sm font-medium transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה
          </button>
          <h1 className={`font-bold ${theme.accentText}`}>כפל מאונך 📐</h1>
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
        <VerticalDrill
          key={index}
          problem={problem}
          onComplete={(wasCorrect) => {
            if (wasCorrect) setCorrectCount(c => c + 1);
            if (index + 1 < DRILLS_PER_SESSION) {
              setIndex(i => i + 1);
            } else {
              setPhase("done");
            }
          }}
        />
      ) : (
        <SessionSummary
          correct={correctCount}
          total={DRILLS_PER_SESSION}
          onAgain={() => navigate(0)}
          onHome={() => navigate("/")}
          theme={theme}
        />
      )}
    </div>
  );
}

function VerticalDrill({ problem, onComplete }) {
  useStudent();
  const theme = themeTokens();

  const { multiplicand, multiplier } = problem;
  const multiplicandDigits = useMemo(() => digitsOf(multiplicand), [multiplicand]);
  const multiplierDigits = useMemo(() => digitsOf(multiplier), [multiplier]);
  const resultDigits = useMemo(() => digitsOf(multiplicand * multiplier), [multiplicand, multiplier]);

  const width = Math.max(multiplicandDigits.length, resultDigits.length);
  const topRow = padLeft(multiplicandDigits, width);
  const multiplierRow = padLeft(multiplierDigits, width);
  const expectedResultRow = padLeft(resultDigits, width);

  const [entries, setEntries] = useState({});
  const [carries, setCarries] = useState({});
  const [checked, setChecked] = useState(false);
  const inputRefs = useRef([]);

  const setEntry = (col, value) => {
    const sanitized = value.replace(/\D/g, "").slice(-1);
    setEntries(prev => ({ ...prev, [col]: sanitized }));
    if (sanitized && col > 0) inputRefs.current[col - 1]?.focus();
  };

  const setCarry = (col, value) => {
    const sanitized = value.replace(/\D/g, "").slice(-1);
    setCarries(prev => ({ ...prev, [col]: sanitized }));
  };

  const perCell = expectedResultRow.map((exp, col) => {
    if (exp === null) return { expected: null, entered: "", correct: null };
    const entered = entries[col] ?? "";
    const correct = checked ? String(entered) === String(exp) : null;
    return { expected: exp, entered, correct };
  });

  const allFilled = perCell.every(c => c.expected === null || c.entered !== "");
  const allCorrect = checked && perCell.every(c => c.expected === null || c.correct);

  return (
    <main className="max-w-md mx-auto px-4 py-6 flex flex-col items-center gap-6">
      <p className="text-purple-700 text-sm text-center">
        פתרי את תרגיל הכפל המאונך.<br />
        מלאי מימין לשמאל: יחידות → עשרות → מאות.<br />
        במשבצות המקווקוות בראש אפשר לרשום נשא.
      </p>

      <div
        className="bg-white rounded-3xl border-2 border-purple-200 shadow-sm px-6 py-6 font-mono"
        dir="ltr"
      >
        <div className="flex flex-col items-end gap-2">
          {/* Optional carry scratch row */}
          <div className="flex gap-2">
            {topRow.map((_, i) => (
              <input
                key={`carry-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={carries[i] || ""}
                onChange={(e) => setCarry(i, e.target.value)}
                aria-label={`carry column ${i}`}
                className="w-10 h-6 sm:w-12 sm:h-7 text-center text-sm font-semibold rounded-md border border-dashed border-gray-300 bg-gray-50/60 text-gray-500 focus:outline-none focus:border-purple-400 focus:bg-white"
              />
            ))}
          </div>

          <div className="flex gap-2">
            {topRow.map((d, i) => (
              <DigitCell key={`top-${i}`} value={d} readonly />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-purple-600 pr-2">×</span>
            {multiplierRow.map((d, i) => (
              <DigitCell key={`mul-${i}`} value={d} readonly />
            ))}
          </div>

          <div className="w-full border-b-4 border-purple-400 my-1" />

          <div className="flex gap-2">
            {perCell.map((cell, i) => (
              <DigitInput
                key={`res-${i}`}
                ref={(el) => (inputRefs.current[i] = el)}
                value={cell.entered}
                onChange={(v) => setEntry(i, v)}
                correct={cell.correct}
                expected={cell.expected}
                disabled={cell.expected === null}
              />
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
            <p className="text-red-600 font-semibold">כמעט! הספרות האדומות שגויות.</p>
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
        <summary className="cursor-pointer font-semibold">📖 איך פותרים כפל מאונך?</summary>
        <div className="mt-2 text-sm text-gray-700 leading-relaxed space-y-1">
          <p>1. כופלים את המספר התחתון בכל ספרה של המספר העליון, מימין לשמאל (יחידות → עשרות → מאות).</p>
          <p>2. אם התוצאה בספרה מסוימת גדולה מ-9, רושמים את ספרת היחידות בשורת התוצאה, ואת ספרת העשרות שומרים כ"נשא" מעל הטור הבא (במשבצת המקווקוות).</p>
          <p>3. בטור הבא מוסיפים את הנשא לתוצאה.</p>
        </div>
      </details>
    </main>
  );
}

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

function DigitCell({ value, readonly }) {
  if (value === null) {
    return <div className="w-10 h-12 sm:w-12 sm:h-14" />;
  }
  return (
    <div
      className={`w-10 h-12 sm:w-12 sm:h-14 flex items-center justify-center rounded-lg text-2xl sm:text-3xl font-bold ${
        readonly ? "bg-purple-50 text-purple-800 border border-purple-100" : ""
      }`}
    >
      {value}
    </div>
  );
}

const DigitInput = forwardRef(function DigitInput(
  { value, onChange, correct, expected, disabled },
  ref
) {
  if (disabled) return <div className="w-10 h-12 sm:w-12 sm:h-14" />;
  const borderColor =
    correct === true ? "border-green-500 bg-green-50 text-green-800"
    : correct === false ? "border-red-400 bg-red-50 text-red-700"
    : "border-purple-300 bg-white text-gray-800 focus-within:border-purple-500";
  return (
    <div className="relative">
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={1}
        className={`w-10 h-12 sm:w-12 sm:h-14 text-center rounded-lg text-2xl sm:text-3xl font-bold border-2 focus:outline-none transition-colors ${borderColor}`}
      />
      {correct === false && (
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-green-700 font-bold">
          {expected}
        </span>
      )}
    </div>
  );
});

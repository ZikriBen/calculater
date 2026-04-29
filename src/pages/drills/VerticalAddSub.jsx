import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, RotateCcw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STUDENT, themeTokens, useStudent } from "@/lib/student";

const DRILLS_PER_SESSION = 5;

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Per-grade operand range. Subtraction always produces a non-negative result
// (a >= b), so even first graders can use it.
const rangeByGrade = (grade) => {
  switch (grade) {
    case "א'": return [2, 20];
    case "ב'": return [10, 99];
    case "ג'": return [50, 999];
    case "ד'": return [100, 9999];
    default:   return [100, 99999];
  }
};

const generateProblem = (grade, forcedOp) => {
  const [lo, hi] = rangeByGrade(grade);
  const op = forcedOp || (Math.random() < 0.5 ? "+" : "-");
  for (let tries = 0; tries < 6; tries++) {
    let a = randInt(lo, hi);
    let b = randInt(lo, hi);
    if (op === "-" && a < b) [a, b] = [b, a];
    const aDigits = String(a).split("").map(Number);
    const bDigits = String(b).split("").map(Number);
    // Prefer problems that exercise carry/borrow.
    const interesting = op === "+"
      ? hasCarry(aDigits, bDigits)
      : hasBorrow(aDigits, bDigits);
    if (interesting || tries === 5) {
      return { op, a, b, result: op === "+" ? a + b : a - b };
    }
  }
  return null;
};

const hasCarry = (a, b) => {
  const w = Math.max(a.length, b.length);
  const ap = padLeft(a, w);
  const bp = padLeft(b, w);
  let carry = 0;
  for (let i = w - 1; i >= 0; i--) {
    const s = ap[i] + bp[i] + carry;
    if (s >= 10) return true;
    carry = 0;
  }
  return false;
};

const hasBorrow = (a, b) => {
  const w = Math.max(a.length, b.length);
  const ap = padLeft(a, w);
  const bp = padLeft(b, w);
  let borrow = 0;
  for (let i = w - 1; i >= 0; i--) {
    if (ap[i] - borrow < bp[i]) return true;
    borrow = 0;
  }
  return false;
};

const padLeft = (digits, width) => {
  const pad = Array(Math.max(0, width - digits.length)).fill(null);
  return [...pad, ...digits];
};

export default function VerticalAddSub() {
  const navigate = useNavigate();
  const { drillId } = useParams();
  useStudent();
  const theme = themeTokens();

  const forcedOp = drillId === "vertical-add" ? "+"
                 : drillId === "vertical-sub" ? "-"
                 : null;
  const headingTitle = forcedOp === "+" ? "חיבור מאונך ➕"
                     : forcedOp === "-" ? "חיסור מאונך ➖"
                     : "חיבור וחיסור מאונך ➕➖";

  useEffect(() => {
    localStorage.removeItem("practice_context");
    localStorage.removeItem("exam_context");
  }, []);

  const problems = useMemo(
    () => Array.from({ length: DRILLS_PER_SESSION }, () => generateProblem(STUDENT.grade, forcedOp)),
    [forcedOp]
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
          <h1 className={`font-bold ${theme.accentText}`}>{headingTitle}</h1>
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
        <AddSubDrill
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

function AddSubDrill({ problem, onComplete }) {
  useStudent();
  const theme = themeTokens();
  const { op, a, b, result } = problem;

  const aDigits = useMemo(() => String(a).split("").map(Number), [a]);
  const bDigits = useMemo(() => String(b).split("").map(Number), [b]);
  const resultDigits = useMemo(() => String(result).split("").map(Number), [result]);

  const operandWidth = Math.max(aDigits.length, bDigits.length);
  // Addition can grow by one digit; subtraction never grows.
  const width = Math.max(operandWidth, resultDigits.length);
  const topRow = padLeft(aDigits, width);
  const bottomRow = padLeft(bDigits, width);
  const expectedResultRow = padLeft(resultDigits, width);

  const [entries, setEntries] = useState({});
  const [scratch, setScratch] = useState({});
  const [borrows, setBorrows] = useState({}); // borrows[col] = true means col borrowed 1 from col-1
  const [checked, setChecked] = useState(false);
  const inputRefs = useRef([]);

  const setEntry = (col, value) => {
    const sanitized = value.replace(/\D/g, "").slice(-1);
    setEntries(prev => ({ ...prev, [col]: sanitized }));
    if (sanitized && col > 0) inputRefs.current[col - 1]?.focus();
  };

  const setScratchCell = (col, value) => {
    const sanitized = value.replace(/\D/g, "").slice(-1);
    setScratch(prev => ({ ...prev, [col]: sanitized }));
  };

  const toggleBorrow = (col) => {
    if (col <= 0) return;
    if (topRow[col - 1] === null) return;
    setBorrows(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const perCell = expectedResultRow.map((exp, col) => {
    if (exp === null) return { expected: null, entered: "", correct: null };
    const entered = entries[col] ?? "";
    const correct = checked ? String(entered) === String(exp) : null;
    return { expected: exp, entered, correct };
  });

  const allFilled = perCell.every(c => c.expected === null || c.entered !== "");
  const allCorrect = checked && perCell.every(c => c.expected === null || c.correct);

  const opSymbol = op === "+" ? "+" : "−";
  const opColor = op === "+" ? "text-green-600" : "text-red-500";
  const scratchLabel = op === "+" ? "נשא" : "שאילה";

  return (
    <main className="max-w-md mx-auto px-4 py-6 flex flex-col items-center gap-6">
      <p className="text-purple-700 text-sm text-center">
        פתרי את התרגיל המאונך.<br />
        מלאי מימין לשמאל: יחידות → עשרות → מאות.<br />
        {op === "+"
          ? "במשבצות המקווקוות בראש אפשר לרשום נשא."
          : "צריכה לשאול? לחצי על הספרה שלמעלה כדי לסמן שאילה."}
      </p>

      <div
        className="bg-white rounded-3xl border-2 border-purple-200 shadow-sm px-6 py-6 font-mono"
        dir="ltr"
      >
        <div className="flex flex-col items-end gap-2">
          {op === "+" && (
            <div className="flex gap-2">
              {topRow.map((_, i) => (
                <input
                  key={`scratch-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={scratch[i] || ""}
                  onChange={(e) => setScratchCell(i, e.target.value)}
                  aria-label={`scratch column ${i}`}
                  className="w-10 h-6 sm:w-12 sm:h-7 text-center text-sm font-semibold rounded-md border border-dashed border-gray-300 bg-gray-50/60 text-gray-500 focus:outline-none focus:border-purple-400 focus:bg-white"
                />
              ))}
            </div>
          )}

          <div className="flex gap-2">
            {topRow.map((d, i) => (
              <TopDigitCell
                key={`top-${i}`}
                value={d}
                decremented={op === "-" && !!borrows[i + 1]}
                borrowed={op === "-" && !!borrows[i]}
                onTap={op === "-" ? () => toggleBorrow(i) : undefined}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-3xl font-bold ${opColor} pr-2`}>{opSymbol}</span>
            {bottomRow.map((d, i) => (
              <DigitCell key={`bot-${i}`} value={d} readonly />
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
        <summary className="cursor-pointer font-semibold">📖 איך פותרים?</summary>
        <div className="mt-2 text-sm text-gray-700 leading-relaxed space-y-1">
          {op === "+" ? (
            <>
              <p>1. מחברים טור-טור מימין לשמאל (יחידות → עשרות → מאות).</p>
              <p>2. אם הסכום בטור גדול מ-9, רושמים את ספרת היחידות בשורת התוצאה ושומרים את העשרות כ"נשא" מעל הטור הבא.</p>
              <p>3. בטור הבא מחברים גם את הנשא.</p>
            </>
          ) : (
            <>
              <p>1. מחסרים טור-טור מימין לשמאל.</p>
              <p>2. אם הספרה למעלה קטנה מהספרה למטה — "שואלים" 1 מהטור משמאל (הוא קטן ב-1 והטור הנוכחי גדל ב-10).</p>
              <p>3. בטור הבא לא שוכחים להוריד את ה-1 ששאלנו.</p>
            </>
          )}
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
  if (value === null) return <div className="w-10 h-12 sm:w-12 sm:h-14" />;
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

function TopDigitCell({ value, decremented, borrowed, onTap }) {
  if (value === null) return <div className="w-10 h-12 sm:w-12 sm:h-14" />;
  const tappable = !!onTap;
  const newValue = decremented ? value - 1 : null;
  return (
    <button
      type="button"
      onClick={onTap}
      disabled={!tappable}
      className={`relative w-10 h-12 sm:w-12 sm:h-14 flex items-center justify-center rounded-lg text-2xl sm:text-3xl font-bold bg-purple-50 text-purple-800 border border-purple-100 ${
        tappable ? "cursor-pointer hover:bg-purple-100 active:bg-purple-200" : ""
      }`}
      aria-label={tappable ? "סמני שאילה" : undefined}
    >
      {decremented && (
        <span className="absolute -top-3 right-1 text-sm font-bold text-orange-600">
          {newValue}
        </span>
      )}
      {borrowed && (
        <span className="absolute -top-3 left-0 text-sm font-bold text-orange-600">
          1
        </span>
      )}
      <span className={decremented ? "line-through text-purple-400" : ""}>{value}</span>
    </button>
  );
}

const DigitInput = forwardRef(function DigitInput({ value, onChange, correct, expected, disabled }, ref) {
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

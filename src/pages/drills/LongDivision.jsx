import { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Star, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STUDENT, themeTokens, useStudent } from "@/lib/student";

const DRILLS_PER_SESSION = 5;
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateProblem = (grade) => {
  const rangesByGrade = {
    "ד'": { dividend: [100, 999], divisor: [2, 9] },
    "ה'": { dividend: [200, 9999], divisor: [2, 12] },
    "ו'": { dividend: [1000, 99999], divisor: [2, 25] },
  };
  const r = rangesByGrade[grade] || rangesByGrade["ה'"];
  const divisor = randInt(r.divisor[0], r.divisor[1]);
  const minQ = Math.ceil(r.dividend[0] / divisor);
  const maxQ = Math.floor(r.dividend[1] / divisor);
  const quotient = randInt(minQ, maxQ);
  const dividend = divisor * quotient;
  return { dividend, divisor };
};

// Build the canonical long-division steps.
// Each step represents one quotient digit emitted at position qPos (index into
// dividend digits, left-to-right). chunkStart..chunkEnd is the slice of dividend
// digits combined with the previous remainder to form the chunk being divided.
function buildSteps(dividend, divisor) {
  const ds = String(dividend).split("").map(Number);
  const steps = [];
  let cv = 0;
  let chunkStart = 0;
  let started = false; // emit q digits only after first chunk >= divisor
  for (let i = 0; i < ds.length; i++) {
    cv = cv * 10 + ds[i];
    if (cv >= divisor || i === ds.length - 1) {
      if (!started && cv < divisor) {
        // dividend < divisor: emit single 0 step at last col
        steps.push({
          chunkStart, chunkEnd: i, chunkValue: cv,
          qPos: i, qDigit: 0, product: 0, remainder: cv,
        });
        return steps;
      }
      const q = Math.floor(cv / divisor);
      const product = q * divisor;
      const remainder = cv - product;
      steps.push({
        chunkStart, chunkEnd: i, chunkValue: cv,
        qPos: i, qDigit: q, product, remainder,
      });
      started = true;
      cv = remainder;
      chunkStart = i + 1;
    }
  }
  return steps;
}

const digitsOf = (n) => String(n).split("").map(Number);

export default function LongDivision() {
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
          <button onClick={() => navigate("/chat")} className="flex items-center gap-1.5 text-purple-500 hover:text-purple-700 text-sm font-medium">
            <ArrowRight className="w-4 h-4" />
            חזרה
          </button>
          <h1 className={`font-bold ${theme.accentText}`}>חילוק ארוך ➗</h1>
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
        <LongDivisionDrill
          key={index}
          problem={problems[index]}
          theme={theme}
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

function LongDivisionDrill({ problem, theme, onComplete }) {
  const { dividend, divisor } = problem;
  const dividendDigits = digitsOf(dividend);
  const width = dividendDigits.length;
  const steps = useMemo(() => buildSteps(dividend, divisor), [dividend, divisor]);

  // Expected result row per step: for non-last steps it's the next step's full
  // chunk (previous remainder digits + brought-down digit). For the last step,
  // it's just the final remainder. Padded with leading zeros to the full width.
  const expectedResult = (k) => {
    const s = steps[k];
    const rLen = Math.max(1, digitsOf(s.remainder).length);
    if (k + 1 < steps.length) {
      const len = rLen + 1;
      return String(steps[k + 1].chunkValue).padStart(len, "0").split("").map(Number);
    }
    return String(s.remainder).padStart(rLen, "0").split("").map(Number);
  };

  const initialEntries = steps.map((s, k) => ({
    q: "",
    product: Array(digitsOf(s.product).length || 1).fill(""),
    result: Array(expectedResult(k).length).fill(""),
  }));
  const [entries, setEntries] = useState(initialEntries);
  const [errors, setErrors] = useState({});
  const [hasError, setHasError] = useState(false);
  const [done, setDone] = useState(false);

  const clearError = (key) => {
    if (!errors[key]) return;
    setErrors(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const updateQ = (k, val) => {
    const v = val.replace(/\D/g, "").slice(-1);
    setEntries(prev => prev.map((e, i) => i === k ? { ...e, q: v } : e));
    clearError(`q-${k}`);
    setHasError(false);
  };
  const updateProduct = (k, i, val) => {
    const v = val.replace(/\D/g, "").slice(-1);
    setEntries(prev => prev.map((e, n) => n === k ? { ...e, product: e.product.map((x, j) => j === i ? v : x) } : e));
    clearError(`product-${k}-${i}`);
    setHasError(false);
  };
  const updateResult = (k, i, val) => {
    const v = val.replace(/\D/g, "").slice(-1);
    setEntries(prev => prev.map((e, n) => n === k ? { ...e, result: e.result.map((x, j) => j === i ? v : x) } : e));
    clearError(`result-${k}-${i}`);
    setHasError(false);
  };

  const checkAll = () => {
    const errs = {};
    steps.forEach((s, k) => {
      if (parseInt(entries[k].q || "-1", 10) !== s.qDigit) errs[`q-${k}`] = true;
      const prodExpected = digitsOf(s.product).length === 0 ? [0] : digitsOf(s.product);
      prodExpected.forEach((d, i) => {
        if (parseInt(entries[k].product[i] || "-1", 10) !== d) errs[`product-${k}-${i}`] = true;
      });
      const resExpected = expectedResult(k);
      resExpected.forEach((d, i) => {
        if (parseInt(entries[k].result[i] || "-1", 10) !== d) errs[`result-${k}-${i}`] = true;
      });
    });
    if (Object.keys(errs).length === 0) {
      setErrors({});
      setHasError(false);
      setDone(true);
    } else {
      setErrors(errs);
      setHasError(true);
    }
  };

  const finalQ = steps.map(s => s.qDigit).join("");

  return (
    <main className="max-w-md mx-auto px-4 py-6 flex flex-col items-center gap-5">
      <p className="text-purple-700 text-sm text-center" dir="rtl">
        מלאי את כל המספרים — מנה, מכפלות והפרשים — ואז לחצי בדיקה.
      </p>

      <div className="bg-white rounded-3xl border-2 border-purple-200 shadow-sm px-4 py-5 font-mono" dir="ltr">
        <DivisionGrid
          width={width}
          divisor={divisor}
          dividendDigits={dividendDigits}
          steps={steps}
          entries={entries}
          errors={errors}
          onQ={updateQ}
          onProduct={updateProduct}
          onResult={updateResult}
        />
      </div>

      <div className="w-full max-w-xs flex flex-col items-center gap-2">
        {!done ? (
          <>
            <Button
              onClick={checkAll}
              className={`w-full h-12 rounded-2xl bg-gradient-to-r ${theme.ctaGradient} text-white font-bold`}
            >
              ✅ בדיקה
            </Button>
            {hasError && (
              <p className="text-red-600 text-sm text-center">יש שגיאות מסומנות באדום. תקני ונסי שוב.</p>
            )}
            <button
              onClick={() => onComplete(false)}
              className="text-xs text-gray-500 underline"
            >
              דלגי לתרגיל הבא
            </button>
          </>
        ) : (
          <div className="text-center w-full">
            <div className="text-4xl">🎉</div>
            <p className="text-green-700 font-bold mt-2" dir="rtl">
              {dividend} ÷ {divisor} = {finalQ}
            </p>
            <Button
              onClick={() => onComplete(true)}
              className={`w-full h-12 rounded-2xl bg-gradient-to-r ${theme.ctaGradient} text-white font-bold mt-4`}
            >
              הבא →
            </Button>
          </div>
        )}
      </div>

      <details className="text-xs text-purple-500 self-stretch mt-2" dir="rtl">
        <summary className="cursor-pointer font-semibold">📖 איך פותרים?</summary>
        <div className="mt-2 text-sm text-gray-700 leading-relaxed space-y-1">
          <p>1. בודקים כמה פעמים המחלק נכנס בספרה (או בקבוצת הספרות) השמאלית. רושמים זאת בשורת המנה למעלה.</p>
          <p>2. כופלים את המנה במחלק וכותבים את המכפלה מתחת.</p>
          <p>3. מחסרים. מורידים את הספרה הבאה של המחולק לצד התוצאה.</p>
          <p>4. חוזרים עד שאין עוד ספרות. מה שנשאר זו השארית.</p>
        </div>
      </details>
    </main>
  );
}

// LTR grid: each column is one dividend digit slot.
// Layout (top to bottom): quotient row, separator line, divisor + ")" + dividend row,
// then per step: product row, sub-line, remainder row (with brought-down digit).
// Every row of the grid is `width + 2` Slots wide. The first two Slots are the
// "leading" area (divisor cell, bracket cell). Remaining Slots are aligned to
// dividend columns 0..width-1.
function DivisionGrid({
  width, divisor, dividendDigits, steps, entries, errors,
  onQ, onProduct, onResult,
}) {
  const cols = Array.from({ length: width }).map((_, i) => i);
  const Leading = ({ a = null, b = null }) => (
    <>
      <Slot>{a}</Slot>
      <Slot>{b}</Slot>
    </>
  );

  // Quotient row
  const quotientRow = (
    <Row key="quotient">
      <Leading />
      {cols.map(c => {
        const stepForCol = steps.find(s => s.qPos === c);
        const sIdx = stepForCol ? steps.indexOf(stepForCol) : -1;
        if (sIdx < 0) return <Slot key={c} />;
        return (
          <Slot key={c}>
            <CellInput
              value={entries[sIdx].q}
              onChange={(v) => onQ(sIdx, v)}
              error={!!errors[`q-${sIdx}`]}
              autoFocus={sIdx === 0}
            />
          </Slot>
        );
      })}
    </Row>
  );

  // Top line: continuous bar across all dividend cols. The leftmost segment
  // extends back into the gap so it meets the vertical bracket bar in slot b
  // of the dividend row, forming an L-shaped long-division bracket.
  const topLine = (
    <Row key="topline">
      <Leading />
      {cols.map(c => (
        <Slot key={c}>
          <div
            className="border-t-2 border-purple-500"
            style={{
              width: c === 0 ? "calc(100% + 0.25rem)" : "100%",
              marginLeft: c === 0 ? "-0.25rem" : 0,
            }}
          />
        </Slot>
      ))}
    </Row>
  );

  // Divisor + vertical bracket bar + dividend digits.
  const dividendRow = (
    <Row key="dividend">
      <Slot>
        <span className="text-2xl font-bold text-purple-800">{divisor}</span>
      </Slot>
      <Slot>
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRight: "2px solid #8b5cf6",
          }}
        />
      </Slot>
      {dividendDigits.map((d, i) => (
        <Slot key={i}>
          <DigitTile>{d}</DigitTile>
        </Slot>
      ))}
    </Row>
  );

  return (
    <div className="flex flex-col items-start gap-1">
      {quotientRow}
      {topLine}
      {dividendRow}
      {steps.map((s, sIdx) => {
        const productDigits = digitsOf(s.product).length === 0 ? [0] : digitsOf(s.product);
        const productLen = productDigits.length;
        const productStart = s.chunkEnd - productLen + 1;

        const rLen = Math.max(1, digitsOf(s.remainder).length);
        const hasNext = sIdx + 1 < steps.length;
        const resultStart = s.chunkEnd - rLen + 1;
        const resultEnd = hasNext ? s.chunkEnd + 1 : s.chunkEnd;
        const broughtDownCol = hasNext ? s.chunkEnd + 1 : -1;
        const arrowSteps = sIdx + 1;

        return (
          <div key={`step-${sIdx}`} className="flex flex-col items-start gap-1">
            <Row>
              <Leading b={<MinusSign />} />
              {cols.map(c => {
                if (c < productStart || c > s.chunkEnd) return <Slot key={c} />;
                const idx = c - productStart;
                return (
                  <Slot key={c}>
                    <CellInput
                      value={entries[sIdx].product[idx] || ""}
                      onChange={(v) => onProduct(sIdx, idx, v)}
                      error={!!errors[`product-${sIdx}-${idx}`]}
                    />
                  </Slot>
                );
              })}
            </Row>

            <Row>
              <Leading />
              {cols.map(c => (
                <Slot key={c}>
                  {c >= productStart && c <= s.chunkEnd
                    ? <div className="w-full border-t-2 border-purple-300" />
                    : null}
                </Slot>
              ))}
            </Row>

            <Row>
              <Leading />
              {cols.map(c => {
                if (c < resultStart || c > resultEnd) return <Slot key={c} />;
                const idx = c - resultStart;
                const isBrought = c === broughtDownCol;
                return (
                  <Slot key={c}>
                    <CellInput
                      value={entries[sIdx].result[idx] || ""}
                      onChange={(v) => onResult(sIdx, idx, v)}
                      error={!!errors[`result-${sIdx}-${idx}`]}
                      arrowSteps={isBrought ? arrowSteps : 0}
                    />
                  </Slot>
                );
              })}
            </Row>
          </div>
        );
      })}
    </div>
  );
}

function Row({ children }) {
  return <div className="flex items-center gap-1">{children}</div>;
}

function DigitTile({ children }) {
  return (
    <div className="w-10 h-12 flex items-center justify-center text-2xl font-bold text-purple-800 bg-purple-50 border border-purple-100 rounded-lg">
      {children}
    </div>
  );
}

function Slot({ children }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ width: "2.75rem", height: "3rem", flex: "0 0 auto" }}
    >
      {children}
    </div>
  );
}

function ArrowDown({ steps }) {
  // Span from the bottom edge of the dividend digit (so the arrow doesn't
  // cross through the number) down to just above the target result cell.
  // Per-step stack ≈ 9.75rem (3 rows × 3rem + 3 gaps × 0.25rem); subtract one
  // row-height so the top edge sits flush with the dividend cell's bottom.
  const heightRem = steps * 9.75 - 3.25;
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: "50%",
        bottom: "100%",
        transform: "translateX(-50%)",
        marginBottom: "0.25rem",
        width: 2,
        height: `${heightRem}rem`,
        background: "#fb923c",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: -2,
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: "8px solid #fb923c",
        }}
      />
    </div>
  );
}

function MinusSign() {
  return (
    <span
      className="text-2xl font-bold text-purple-500"
      style={{ transform: "translateY(-1.5rem)" }}
    >
      −
    </span>
  );
}

function CellInput({ value, onChange, error, autoFocus, arrowSteps }) {
  const ref = useRef(null);
  useEffect(() => { if (autoFocus) ref.current?.focus(); }, [autoFocus]);
  return (
    <div className="relative">
      {arrowSteps > 0 && <ArrowDown steps={arrowSteps} />}
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={1}
        className={`w-10 h-12 text-center rounded-lg text-2xl font-bold border-2 focus:outline-none transition-colors ${
          error ? "border-red-400 bg-red-50 text-red-700" : "border-purple-300 bg-white text-gray-800 focus:border-purple-500"
        }`}
      />
    </div>
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

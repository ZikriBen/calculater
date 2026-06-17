import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STUDENT, themeTokens, useStudent } from "@/lib/student";

const DRILLS_PER_SESSION = 8;
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateProblem = (grade) => {
  const ranges = {
    "ב'": { dividend: [10, 50], divisor: [2, 5] },
    "ג'": { dividend: [10, 99], divisor: [2, 9] },
    "ד'": { dividend: [20, 200], divisor: [2, 12] },
  };
  const r = ranges[grade] || ranges["ג'"];
  for (let attempt = 0; attempt < 50; attempt++) {
    const divisor = randInt(r.divisor[0], r.divisor[1]);
    const dividend = randInt(r.dividend[0], r.dividend[1]);
    const remainder = dividend % divisor;
    if (remainder > 0) {
      return { dividend, divisor, quotient: Math.floor(dividend / divisor), remainder };
    }
  }
  const divisor = randInt(r.divisor[0], r.divisor[1]);
  const quotient = randInt(2, Math.floor(r.dividend[1] / divisor));
  const remainder = randInt(1, divisor - 1);
  const dividend = quotient * divisor + remainder;
  return { dividend, divisor, quotient, remainder };
};

export default function DivisionRemainder() {
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
          <h1 className={`font-bold ${theme.accentText}`}>חילוק עם שארית 🧩</h1>
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
        <RemainderCard
          key={index}
          problem={problems[index]}
          theme={theme}
          onAnswer={(wasCorrect) => {
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

function RemainderCard({ problem, theme, onAnswer }) {
  const { dividend, divisor, quotient, remainder } = problem;
  const [qVal, setQVal] = useState("");
  const [rVal, setRVal] = useState("");
  const [feedback, setFeedback] = useState(null);
  const qRef = useRef(null);

  useEffect(() => { qRef.current?.focus(); }, []);

  const submit = () => {
    if (qVal === "" || rVal === "" || feedback) return;
    const qOk = Number(qVal) === quotient;
    const rOk = Number(rVal) === remainder;
    const ok = qOk && rOk;
    setFeedback(ok ? "correct" : "wrong");
    setTimeout(() => onAnswer(ok), ok ? 600 : 1800);
  };

  const inputCls = (field) => {
    if (!feedback) return "border-purple-300 bg-white text-gray-800 focus:border-purple-500";
    if (feedback === "correct") return "border-green-500 bg-green-50 text-green-800";
    const val = field === "q" ? Number(qVal) : Number(rVal);
    const expected = field === "q" ? quotient : remainder;
    return val === expected
      ? "border-green-500 bg-green-50 text-green-800"
      : "border-red-400 bg-red-50 text-red-700";
  };

  return (
    <main className="max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-6">
      <div className="bg-white rounded-3xl border-2 border-purple-200 shadow-sm px-6 py-8 w-full">
        <div className="text-center text-4xl sm:text-5xl font-black text-purple-700 tracking-wider" dir="ltr">
          {dividend} ÷ {divisor} = ?
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full items-center">
        <div className="flex items-center gap-3">
          <label className="text-lg font-bold text-purple-700 w-16 text-left">מנה:</label>
          <input
            ref={qRef}
            type="text"
            inputMode="numeric"
            value={qVal}
            disabled={feedback !== null}
            onChange={(e) => setQVal(e.target.value.replace(/\D/g, "").slice(0, 4))}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            className={`w-24 h-16 text-center text-3xl font-black rounded-2xl border-4 transition-colors focus:outline-none ${inputCls("q")}`}
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-lg font-bold text-purple-700 w-16 text-left">שארית:</label>
          <input
            type="text"
            inputMode="numeric"
            value={rVal}
            disabled={feedback !== null}
            onChange={(e) => setRVal(e.target.value.replace(/\D/g, "").slice(0, 4))}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            className={`w-24 h-16 text-center text-3xl font-black rounded-2xl border-4 transition-colors focus:outline-none ${inputCls("r")}`}
          />
        </div>
      </div>

      {feedback === "wrong" && (
        <div className="text-center">
          <p className="text-red-600 font-semibold text-lg">
            {dividend} ÷ {divisor} = <span className="text-green-700">{quotient}</span> שארית <span className="text-green-700">{remainder}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            כי {quotient} × {divisor} = {quotient * divisor}, ועוד {remainder} זה {dividend}
          </p>
        </div>
      )}

      <Button
        onClick={submit}
        disabled={qVal === "" || rVal === "" || feedback !== null}
        className={`w-full max-w-xs h-12 rounded-2xl bg-gradient-to-r ${theme.ctaGradient} text-white font-bold`}
      >
        {feedback === "correct" ? "🎉 מעולה!" : feedback === "wrong" ? "ממשיכים…" : "✅ בדיקה"}
      </Button>

      <details className="text-xs text-purple-500 self-stretch mt-2" dir="rtl">
        <summary className="cursor-pointer font-semibold">📖 איך פותרים?</summary>
        <div className="mt-2 text-sm text-gray-700 leading-relaxed space-y-1">
          <p>1. שואלים: כמה פעמים המחלק ({divisor}) נכנס במחולק ({dividend})?</p>
          <p>2. מוצאים את המספר הכי גדול שכשכופלים אותו ב-{divisor} מקבלים מספר שקטן או שווה ל-{dividend}.</p>
          <p>3. זו המנה. מה שנשאר — זו השארית.</p>
          <p>4. בדיקה: מנה × מחלק + שארית = מחולק</p>
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

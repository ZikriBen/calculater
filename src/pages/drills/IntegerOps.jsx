import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Star, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STUDENT, themeTokens, useStudent } from "@/lib/student";

const DRILLS_PER_SESSION = 6;
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateProblem = (grade) => {
  const range = grade === "ח'" ? 30 : 20;
  const a = randInt(-range, range);
  const b = randInt(-range, range);
  const op = Math.random() < 0.5 ? "+" : "-";
  const answer = op === "+" ? a + b : a - b;
  return { a, b, op, answer };
};

const fmt = (n) => (n < 0 ? `(${n})` : String(n));

export default function IntegerOps() {
  const navigate = useNavigate();
  useStudent();
  const theme = themeTokens();

  const problems = useMemo(
    () => Array.from({ length: DRILLS_PER_SESSION }, () => generateProblem(STUDENT.grade)),
    []
  );

  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [phase, setPhase] = useState("drill");
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(null);

  const p = problems[index];

  const onCheck = () => {
    const v = parseInt(answer, 10);
    const ok = v === p.answer;
    setChecked(ok ? "ok" : "err");
    if (ok) setCorrect(c => c + 1);
  };

  const onNext = () => {
    setAnswer(""); setChecked(null);
    if (index + 1 < DRILLS_PER_SESSION) setIndex(i => i + 1);
    else setPhase("done");
  };

  return (
    <div className={`min-h-screen ${theme.pageBg}`} dir="rtl">
      <header className="bg-white/70 backdrop-blur-md border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/chat")} className="flex items-center gap-1.5 text-purple-500 hover:text-purple-700 text-sm font-medium">
            <ArrowRight className="w-4 h-4" />
            חזרה
          </button>
          <h1 className={`font-bold ${theme.accentText}`}>שלמים שליליים ➕➖</h1>
          <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
            <span className="text-xs font-semibold text-yellow-700">{index + 1}/{DRILLS_PER_SESSION}</span>
          </div>
        </div>
      </header>

      {phase === "drill" ? (
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="text-5xl font-bold mb-10" dir="ltr">
            {fmt(p.a)} {p.op} {fmt(p.b)} = ?
          </div>
          <NumberLine value={p.answer} show={checked !== null} range={40} />
          <div className="max-w-xs mx-auto mt-8">
            <input
              type="number"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              disabled={checked !== null}
              className="w-full rounded-xl border-2 border-purple-200 px-4 py-3 text-3xl text-center focus:border-purple-500 outline-none"
              dir="ltr"
              placeholder="?"
            />
          </div>
          <div className="mt-8">
            {checked === null ? (
              <Button onClick={onCheck} disabled={!answer} size="lg" className={`bg-gradient-to-r ${theme.ctaGradient} text-white rounded-2xl h-14 px-12 text-base font-semibold`}>
                בדיקה
              </Button>
            ) : (
              <div className="space-y-4">
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold ${checked === "ok" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {checked === "ok" ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                  {checked === "ok" ? "כל הכבוד!" : `הפתרון הנכון: ${p.answer}`}
                </div>
                <div>
                  <Button onClick={onNext} size="lg" className={`bg-gradient-to-r ${theme.ctaGradient} text-white rounded-2xl h-14 px-12 text-base font-semibold`}>
                    הבא ←
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className={`text-3xl font-bold ${theme.accentText} mb-2`}>סיימת!</h2>
          <p className="text-lg text-slate-600 mb-8">ענית נכון על {correct} מתוך {DRILLS_PER_SESSION}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate(0)} variant="outline" size="lg" className="rounded-2xl h-14 px-8">עוד סבב</Button>
            <Button onClick={() => navigate("/chat")} size="lg" className={`bg-gradient-to-r ${theme.ctaGradient} text-white rounded-2xl h-14 px-8`}>בית</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function NumberLine({ value, show, range }) {
  const ticks = [];
  for (let n = -range; n <= range; n += 5) ticks.push(n);
  const pct = (n) => ((n + range) / (2 * range)) * 100;
  return (
    <div className="relative w-full max-w-md mx-auto mb-4" dir="ltr">
      <div className="relative h-12">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-400 -translate-y-1/2" />
        {ticks.map(n => (
          <div key={n} className="absolute top-1/2 -translate-y-1/2" style={{ left: `${pct(n)}%` }}>
            <div className="w-0.5 h-3 bg-slate-400 -translate-x-1/2" />
            <div className="text-[10px] text-slate-500 -translate-x-1/2 mt-1">{n}</div>
          </div>
        ))}
        {show && value >= -range && value <= range && (
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${pct(value)}%` }}>
            <div className="w-4 h-4 rounded-full bg-green-500 ring-4 ring-green-200" />
          </div>
        )}
      </div>
    </div>
  );
}

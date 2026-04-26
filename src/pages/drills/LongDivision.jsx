import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Star, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STUDENT, themeTokens, useStudent } from "@/lib/student";

const DRILLS_PER_SESSION = 5;
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateProblem = (grade) => {
  const rangesByGrade = {
    "ד'": { dividend: [20, 99], divisor: [2, 9] },
    "ה'": { dividend: [50, 999], divisor: [2, 12] },
    "ו'": { dividend: [100, 9999], divisor: [2, 25] },
  };
  const r = rangesByGrade[grade] || rangesByGrade["ה'"];
  const divisor = randInt(r.divisor[0], r.divisor[1]);
  const dividend = randInt(r.dividend[0], r.dividend[1]);
  return { dividend, divisor };
};

export default function LongDivision() {
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
  const [quotient, setQuotient] = useState("");
  const [remainder, setRemainder] = useState("");
  const [checked, setChecked] = useState(null);

  const p = problems[index];
  const expectedQ = Math.floor(p.dividend / p.divisor);
  const expectedR = p.dividend % p.divisor;

  const onCheck = () => {
    const q = parseInt(quotient, 10);
    const r = parseInt(remainder || "0", 10);
    const ok = q === expectedQ && r === expectedR;
    setChecked(ok ? "ok" : "err");
    if (ok) setCorrect(c => c + 1);
  };

  const onNext = () => {
    setQuotient(""); setRemainder(""); setChecked(null);
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
          <h1 className={`font-bold ${theme.accentText}`}>חילוק ארוך ➗</h1>
          <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
            <span className="text-xs font-semibold text-yellow-700">{index + 1}/{DRILLS_PER_SESSION}</span>
          </div>
        </div>
      </header>

      {phase === "drill" ? (
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="text-5xl font-bold mb-8" dir="ltr">
            {p.dividend} ÷ {p.divisor} = ?
          </div>
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <label className="text-right text-sm font-semibold text-slate-600">מנה</label>
            <input
              type="number"
              value={quotient}
              onChange={e => setQuotient(e.target.value)}
              disabled={checked !== null}
              className="rounded-xl border-2 border-purple-200 px-4 py-3 text-2xl text-center focus:border-purple-500 outline-none"
              dir="ltr"
            />
            <label className="text-right text-sm font-semibold text-slate-600">שארית</label>
            <input
              type="number"
              value={remainder}
              onChange={e => setRemainder(e.target.value)}
              disabled={checked !== null}
              className="rounded-xl border-2 border-purple-200 px-4 py-3 text-2xl text-center focus:border-purple-500 outline-none"
              dir="ltr"
              placeholder="0"
            />
          </div>

          <div className="mt-8">
            {checked === null ? (
              <Button onClick={onCheck} disabled={!quotient} size="lg" className={`bg-gradient-to-r ${theme.ctaGradient} text-white rounded-2xl h-14 px-12 text-base font-semibold`}>
                בדיקה
              </Button>
            ) : (
              <div className="space-y-4">
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold ${checked === "ok" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {checked === "ok" ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                  {checked === "ok" ? "כל הכבוד!" : `הפתרון הנכון: ${expectedQ} ושארית ${expectedR}`}
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

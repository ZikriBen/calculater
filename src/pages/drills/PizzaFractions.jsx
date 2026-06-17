import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STUDENT, themeTokens, useStudent } from "@/lib/student";

const DRILLS_PER_SESSION = 8;
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[randInt(0, arr.length - 1)];
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

const DENOMINATORS_BY_GRADE = {
  "ד'": [2, 3, 4, 6, 8],
  "ה'": [2, 3, 4, 5, 6, 8, 10],
  "ו'": [2, 3, 4, 5, 6, 8, 10, 12],
};

const PROBLEM_TYPES_BY_GRADE = {
  "ד'": ["identify", "compare", "equivalent"],
  "ה'": ["identify", "compare", "equivalent", "add"],
  "ו'": ["identify", "compare", "equivalent", "add", "subtract"],
};

function generateProblem(grade) {
  const denoms = DENOMINATORS_BY_GRADE[grade] || DENOMINATORS_BY_GRADE["ד'"];
  const types = PROBLEM_TYPES_BY_GRADE[grade] || PROBLEM_TYPES_BY_GRADE["ד'"];
  const type = pick(types);

  if (type === "identify") {
    const denom = pick(denoms);
    const numer = randInt(1, denom - 1);
    return { type, denom, numer, answer: { numer, denom } };
  }

  if (type === "compare") {
    const d1 = pick(denoms);
    const d2 = pick(denoms.filter(d => d !== d1));
    const n1 = randInt(1, d1 - 1);
    const n2 = randInt(1, d2 - 1);
    const v1 = n1 / d1;
    const v2 = n2 / d2;
    if (Math.abs(v1 - v2) < 0.01) return generateProblem(grade);
    const bigger = v1 > v2 ? "left" : "right";
    return { type, left: { numer: n1, denom: d1 }, right: { numer: n2, denom: d2 }, answer: bigger };
  }

  if (type === "equivalent") {
    const denom = pick(denoms.filter(d => d >= 4));
    const numer = randInt(1, denom - 1);
    const g = gcd(numer, denom);
    const simplifiedN = numer / g;
    const simplifiedD = denom / g;
    const multipliers = [2, 3, 4, 5].filter(m => m * simplifiedD <= 12 && m * simplifiedD !== denom);
    if (multipliers.length === 0) return generateProblem(grade);
    const mult = pick(multipliers);
    const targetD = simplifiedD * mult;
    const targetN = simplifiedN * mult;
    return { type, denom, numer, targetDenom: targetD, answer: { numer: targetN, denom: targetD } };
  }

  if (type === "add") {
    const denom = pick(denoms.filter(d => d >= 3));
    const n1 = randInt(1, denom - 2);
    const n2 = randInt(1, denom - n1);
    return {
      type, denom,
      left: { numer: n1, denom },
      right: { numer: n2, denom },
      answer: { numer: n1 + n2, denom },
    };
  }

  if (type === "subtract") {
    const denom = pick(denoms.filter(d => d >= 3));
    const total = randInt(2, denom - 1);
    const sub = randInt(1, total - 1);
    return {
      type, denom,
      left: { numer: total, denom },
      right: { numer: sub, denom },
      answer: { numer: total - sub, denom },
    };
  }

  return generateProblem(grade);
}

function PizzaSvg({ totalSlices, filledSlices, size = 140, fillColor = "#f97316", emptyColor = "#fef3c7", strokeColor = "#c2410c" }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;

  const slicePath = (i) => {
    const startAngle = (i * 2 * Math.PI) / totalSlices - Math.PI / 2;
    const endAngle = ((i + 1) * 2 * Math.PI) / totalSlices - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = 2 * Math.PI / totalSlices > Math.PI ? 1 : 0;
    return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`;
  };

  const pepperoni = (i) => {
    const midAngle = ((i + 0.5) * 2 * Math.PI) / totalSlices - Math.PI / 2;
    const pr = r * 0.55;
    return { x: cx + pr * Math.cos(midAngle), y: cy + pr * Math.sin(midAngle) };
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill={emptyColor} stroke={strokeColor} strokeWidth="2.5" />
      {Array.from({ length: totalSlices }, (_, i) => (
        <g key={i}>
          <path
            d={slicePath(i)}
            fill={i < filledSlices ? fillColor : emptyColor}
            stroke={strokeColor}
            strokeWidth="1.5"
          />
          {i < filledSlices && (
            <circle
              cx={pepperoni(i).x}
              cy={pepperoni(i).y}
              r={Math.min(r / totalSlices * 0.6, 8)}
              fill="#dc2626"
              opacity="0.7"
            />
          )}
        </g>
      ))}
    </svg>
  );
}

function FractionDisplay({ numer, denom, large }) {
  const sz = large ? "text-3xl" : "text-2xl";
  return (
    <span className={`inline-flex flex-col items-center ${sz} font-black text-purple-800 leading-none`}>
      <span>{numer}</span>
      <span className="w-full border-t-2 border-purple-700 my-0.5" />
      <span>{denom}</span>
    </span>
  );
}

export default function PizzaFractions() {
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
          <h1 className={`font-bold ${theme.accentText}`}>שברים עם פיצה 🍕</h1>
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
        <ProblemCard
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

function ProblemCard({ problem, theme, onAnswer }) {
  switch (problem.type) {
    case "identify": return <IdentifyCard problem={problem} theme={theme} onAnswer={onAnswer} />;
    case "compare": return <CompareCard problem={problem} theme={theme} onAnswer={onAnswer} />;
    case "equivalent": return <EquivalentCard problem={problem} theme={theme} onAnswer={onAnswer} />;
    case "add": return <AddSubCard problem={problem} theme={theme} onAnswer={onAnswer} op="+" />;
    case "subtract": return <AddSubCard problem={problem} theme={theme} onAnswer={onAnswer} op="−" />;
    default: return null;
  }
}

function IdentifyCard({ problem, theme, onAnswer }) {
  const { denom, numer, answer } = problem;
  const [numVal, setNumVal] = useState("");
  const [denVal, setDenVal] = useState("");
  const [feedback, setFeedback] = useState(null);
  const numRef = useRef(null);

  useEffect(() => { numRef.current?.focus(); }, []);

  const submit = () => {
    if (numVal === "" || denVal === "" || feedback) return;
    const g = gcd(Number(numVal), Number(denVal));
    const simpN = Number(numVal) / g;
    const simpD = Number(denVal) / g;
    const gA = gcd(answer.numer, answer.denom);
    const ok = simpN === answer.numer / gA && simpD === answer.denom / gA;
    setFeedback(ok ? "correct" : "wrong");
    setTimeout(() => onAnswer(ok), ok ? 600 : 1500);
  };

  return (
    <main className="max-w-md mx-auto px-4 py-8 flex flex-col items-center gap-5">
      <p className="text-purple-700 font-bold text-lg text-center">
        איזה חלק מהפיצה צבוע? 🍕
      </p>
      <div className="bg-white rounded-3xl border-2 border-orange-200 shadow-sm p-6">
        <PizzaSvg totalSlices={denom} filledSlices={numer} size={180} />
      </div>
      <FractionInput
        numRef={numRef}
        numVal={numVal}
        denVal={denVal}
        onNumChange={setNumVal}
        onDenChange={setDenVal}
        onSubmit={submit}
        feedback={feedback}
        answer={answer}
      />
      <SubmitButton feedback={feedback} disabled={numVal === "" || denVal === ""} onClick={submit} theme={theme} />
      {feedback === "wrong" && (
        <p className="text-red-600 font-semibold">
          התשובה: <FractionDisplay numer={answer.numer} denom={answer.denom} />
        </p>
      )}
    </main>
  );
}

function CompareCard({ problem, theme, onAnswer }) {
  const { left, right, answer } = problem;
  const [chosen, setChosen] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const choose = (side) => {
    if (feedback) return;
    setChosen(side);
    const ok = side === answer;
    setFeedback(ok ? "correct" : "wrong");
    setTimeout(() => onAnswer(ok), ok ? 600 : 1500);
  };

  const borderFor = (side) => {
    if (!feedback) return chosen === side ? "border-purple-500" : "border-orange-200";
    if (side === answer) return "border-green-500";
    if (side === chosen) return "border-red-400";
    return "border-orange-200";
  };

  return (
    <main className="max-w-md mx-auto px-4 py-8 flex flex-col items-center gap-5">
      <p className="text-purple-700 font-bold text-lg text-center">
        באיזו פיצה יש יותר? לחצו על הגדולה! 🍕
      </p>
      <div className="flex gap-6 items-center">
        {[["left", left], ["right", right]].map(([side, frac]) => (
          <button
            key={side}
            onClick={() => choose(side)}
            className={`bg-white rounded-3xl border-4 shadow-sm p-4 transition-all hover:scale-105 ${borderFor(side)}`}
          >
            <PizzaSvg totalSlices={frac.denom} filledSlices={frac.numer} size={130} />
            <div className="mt-2 flex justify-center">
              <FractionDisplay numer={frac.numer} denom={frac.denom} />
            </div>
          </button>
        ))}
      </div>
      {feedback === "correct" && <p className="text-green-700 font-bold text-xl">🎉 נכון!</p>}
      {feedback === "wrong" && (
        <p className="text-red-600 font-semibold">
          <FractionDisplay numer={problem[answer].numer} denom={problem[answer].denom} /> גדול יותר!
        </p>
      )}
    </main>
  );
}

function EquivalentCard({ problem, theme, onAnswer }) {
  const { denom, numer, targetDenom, answer } = problem;
  const [numVal, setNumVal] = useState("");
  const [feedback, setFeedback] = useState(null);
  const ref = useRef(null);

  useEffect(() => { ref.current?.focus(); }, []);

  const submit = () => {
    if (numVal === "" || feedback) return;
    const ok = Number(numVal) === answer.numer;
    setFeedback(ok ? "correct" : "wrong");
    setTimeout(() => onAnswer(ok), ok ? 600 : 1500);
  };

  return (
    <main className="max-w-md mx-auto px-4 py-8 flex flex-col items-center gap-5">
      <p className="text-purple-700 font-bold text-lg text-center">
        מצאו שבר שקול! ⚖️
      </p>
      <div className="flex gap-6 items-center">
        <div className="bg-white rounded-3xl border-2 border-orange-200 shadow-sm p-4">
          <PizzaSvg totalSlices={denom} filledSlices={numer} size={130} />
          <div className="mt-2 flex justify-center">
            <FractionDisplay numer={numer} denom={denom} />
          </div>
        </div>
        <span className="text-3xl font-black text-purple-500">=</span>
        <div className="bg-white rounded-3xl border-2 border-purple-200 shadow-sm p-4">
          <PizzaSvg totalSlices={targetDenom} filledSlices={answer.numer} size={130}
            fillColor="#a78bfa" emptyColor="#ede9fe" strokeColor="#7c3aed" />
          <div className="mt-2 flex justify-center items-center gap-1">
            <span className="inline-flex flex-col items-center text-2xl font-black text-purple-800 leading-none">
              <span>
                <input
                  ref={ref}
                  type="text"
                  inputMode="numeric"
                  value={numVal}
                  disabled={feedback !== null}
                  onChange={(e) => setNumVal(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
                  className={`w-12 h-10 text-center text-2xl font-black rounded-lg border-2 focus:outline-none transition-colors ${
                    !feedback ? "border-purple-300 bg-white" :
                    feedback === "correct" ? "border-green-500 bg-green-50" : "border-red-400 bg-red-50"
                  }`}
                />
              </span>
              <span className="w-full border-t-2 border-purple-700 my-0.5" />
              <span>{targetDenom}</span>
            </span>
          </div>
        </div>
      </div>
      <SubmitButton feedback={feedback} disabled={numVal === ""} onClick={submit} theme={theme} />
      {feedback === "wrong" && (
        <p className="text-red-600 font-semibold">
          התשובה: <FractionDisplay numer={answer.numer} denom={answer.denom} />
        </p>
      )}
    </main>
  );
}

function AddSubCard({ problem, theme, onAnswer, op }) {
  const { left, right, answer } = problem;
  const [numVal, setNumVal] = useState("");
  const [feedback, setFeedback] = useState(null);
  const ref = useRef(null);

  useEffect(() => { ref.current?.focus(); }, []);

  const submit = () => {
    if (numVal === "" || feedback) return;
    const ok = Number(numVal) === answer.numer;
    setFeedback(ok ? "correct" : "wrong");
    setTimeout(() => onAnswer(ok), ok ? 600 : 1500);
  };

  return (
    <main className="max-w-md mx-auto px-4 py-8 flex flex-col items-center gap-5">
      <p className="text-purple-700 font-bold text-lg text-center">
        {op === "+" ? "חברו את השברים!" : "חסרו את השברים!"} 🍕
      </p>
      <div className="flex gap-3 items-center flex-wrap justify-center">
        <div className="bg-white rounded-2xl border-2 border-orange-200 shadow-sm p-3">
          <PizzaSvg totalSlices={left.denom} filledSlices={left.numer} size={110} />
          <div className="mt-1 flex justify-center">
            <FractionDisplay numer={left.numer} denom={left.denom} />
          </div>
        </div>
        <span className="text-3xl font-black text-purple-500">{op}</span>
        <div className="bg-white rounded-2xl border-2 border-orange-200 shadow-sm p-3">
          <PizzaSvg totalSlices={right.denom} filledSlices={right.numer} size={110}
            fillColor="#fb923c" emptyColor="#fef3c7" strokeColor="#c2410c" />
          <div className="mt-1 flex justify-center">
            <FractionDisplay numer={right.numer} denom={right.denom} />
          </div>
        </div>
        <span className="text-3xl font-black text-purple-500">=</span>
        <div className="flex flex-col items-center">
          <span className="inline-flex flex-col items-center text-2xl font-black text-purple-800 leading-none">
            <span>
              <input
                ref={ref}
                type="text"
                inputMode="numeric"
                value={numVal}
                disabled={feedback !== null}
                onChange={(e) => setNumVal(e.target.value.replace(/\D/g, "").slice(0, 2))}
                onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
                className={`w-12 h-10 text-center text-2xl font-black rounded-lg border-2 focus:outline-none transition-colors ${
                  !feedback ? "border-purple-300 bg-white" :
                  feedback === "correct" ? "border-green-500 bg-green-50" : "border-red-400 bg-red-50"
                }`}
              />
            </span>
            <span className="w-full border-t-2 border-purple-700 my-0.5" />
            <span>{answer.denom}</span>
          </span>
        </div>
      </div>
      <SubmitButton feedback={feedback} disabled={numVal === ""} onClick={submit} theme={theme} />
      {feedback === "wrong" && (
        <p className="text-red-600 font-semibold">
          התשובה: <FractionDisplay numer={answer.numer} denom={answer.denom} />
        </p>
      )}
    </main>
  );
}

function FractionInput({ numRef, numVal, denVal, onNumChange, onDenChange, onSubmit, feedback, answer }) {
  const inputCls = (field) => {
    if (!feedback) return "border-purple-300 bg-white";
    if (feedback === "correct") return "border-green-500 bg-green-50";
    const val = field === "num" ? Number(numVal) : Number(denVal);
    const expected = field === "num" ? answer.numer : answer.denom;
    const g = gcd(answer.numer, answer.denom);
    const simpExpected = field === "num" ? answer.numer / g : answer.denom / g;
    const gU = gcd(Number(numVal) || 1, Number(denVal) || 1);
    const simpVal = field === "num" ? (Number(numVal) || 0) / gU : (Number(denVal) || 1) / gU;
    return simpVal === simpExpected ? "border-green-500 bg-green-50" : "border-red-400 bg-red-50";
  };

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex flex-col items-center text-2xl font-black text-purple-800 leading-none">
        <input
          ref={numRef}
          type="text"
          inputMode="numeric"
          value={numVal}
          disabled={feedback !== null}
          onChange={(e) => onNumChange(e.target.value.replace(/\D/g, "").slice(0, 2))}
          onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
          className={`w-14 h-12 text-center text-2xl font-black rounded-lg border-2 focus:outline-none transition-colors ${inputCls("num")}`}
        />
        <span className="w-full border-t-2 border-purple-700 my-1" />
        <input
          type="text"
          inputMode="numeric"
          value={denVal}
          disabled={feedback !== null}
          onChange={(e) => onDenChange(e.target.value.replace(/\D/g, "").slice(0, 2))}
          onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
          className={`w-14 h-12 text-center text-2xl font-black rounded-lg border-2 focus:outline-none transition-colors ${inputCls("den")}`}
        />
      </span>
    </div>
  );
}

function SubmitButton({ feedback, disabled, onClick, theme }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || feedback !== null}
      className={`w-full max-w-xs h-12 rounded-2xl bg-gradient-to-r ${theme.ctaGradient} text-white font-bold`}
    >
      {feedback === "correct" ? "🎉 מעולה!" : feedback === "wrong" ? "ממשיכים…" : "✅ בדיקה"}
    </Button>
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

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STUDENT, themeTokens, useStudent } from "@/lib/student";

const DRILLS_PER_SESSION = 5;

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Per-grade allowed minute increments: easier grades only see whole/half hours,
// older grades see arbitrary 5-minute (and eventually any-minute) marks.
const minuteOptionsForGrade = (grade) => {
  switch (grade) {
    case "א'": return [0];                          // שעה עגולה
    case "ב'": return [0, 30];                      // עגולה + חצי
    case "ג'": return [0, 15, 30, 45];              // רבעי שעה
    case "ד'": return [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    default:   return Array.from({ length: 60 }, (_, i) => i); // any minute
  }
};

const generateProblem = (grade) => {
  const hour = randInt(1, 12);
  const minute = choice(minuteOptionsForGrade(grade));
  return { hour, minute };
};

export default function ClockReading() {
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
          <h1 className={`font-bold ${theme.accentText}`}>קריאת שעון 🕒</h1>
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
        <ClockDrill
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

function ClockDrill({ problem, onComplete }) {
  useStudent();
  const theme = themeTokens();
  const { hour, minute } = problem;

  const [hourInput, setHourInput] = useState("");
  const [minuteInput, setMinuteInput] = useState("");
  const [checked, setChecked] = useState(false);
  const hourRef = useRef(null);
  const minuteRef = useRef(null);

  useEffect(() => { hourRef.current?.focus(); }, []);

  const allFilled = hourInput !== "" && minuteInput !== "";
  const hourCorrect = Number(hourInput) === hour;
  // Accept the minute either with a leading zero or without.
  const minuteCorrect = Number(minuteInput) === minute;
  const allCorrect = hourCorrect && minuteCorrect;

  const fieldClass = (filled, correct) => {
    if (!checked) return "border-purple-300 bg-white text-gray-800 focus:border-purple-500";
    if (correct) return "border-green-500 bg-green-50 text-green-800";
    return "border-red-400 bg-red-50 text-red-700";
  };

  return (
    <main className="max-w-md mx-auto px-4 py-6 flex flex-col items-center gap-6">
      <p className="text-purple-700 text-sm text-center">
        איזו שעה מציג השעון? כתבי שעה ודקות.
      </p>

      <ClockFace hour={hour} minute={minute} />

      <div className="flex items-center gap-3" dir="ltr">
        <input
          ref={hourRef}
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={hourInput}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 2);
            setHourInput(v);
            if (v.length === 2) minuteRef.current?.focus();
          }}
          disabled={checked && allCorrect}
          aria-label="שעות"
          className={`w-20 h-20 text-center text-4xl font-black rounded-2xl border-4 focus:outline-none transition-colors ${fieldClass(hourInput, hourCorrect)}`}
        />
        <span className="text-5xl font-black text-purple-600">:</span>
        <input
          ref={minuteRef}
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={minuteInput}
          onChange={(e) => setMinuteInput(e.target.value.replace(/\D/g, "").slice(0, 2))}
          disabled={checked && allCorrect}
          aria-label="דקות"
          className={`w-20 h-20 text-center text-4xl font-black rounded-2xl border-4 focus:outline-none transition-colors ${fieldClass(minuteInput, minuteCorrect)}`}
        />
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
            <p className="text-red-600 font-semibold">
              התשובה הנכונה: <span className="text-green-700 font-mono" dir="ltr">{hour}:{String(minute).padStart(2, "0")}</span>
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => { setChecked(false); setHourInput(""); setMinuteInput(""); hourRef.current?.focus(); }}
                variant="outline"
                className="rounded-2xl border-purple-200 text-purple-700"
              >
                נסי שוב
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
        <summary className="cursor-pointer font-semibold">📖 איך קוראים את השעון?</summary>
        <div className="mt-2 text-sm text-gray-700 leading-relaxed space-y-1">
          <p>1. <span className="font-bold">המחוג הקצר</span> מצביע על השעה (1–12).</p>
          <p>2. <span className="font-bold">המחוג הארוך</span> מצביע על הדקות. כל מספר על השעון = 5 דקות.</p>
          <p>3. אם המחוג הארוך על 12 — 0 דקות (שעה עגולה). על 6 — 30 דקות (חצי).</p>
        </div>
      </details>
    </main>
  );
}

function ClockFace({ hour, minute }) {
  // Hour hand: 30° per hour + 0.5° per minute.
  const hourAngle = ((hour % 12) * 30) + (minute * 0.5);
  // Minute hand: 6° per minute.
  const minuteAngle = minute * 6;
  return (
    <svg viewBox="0 0 200 200" className="w-64 h-64 sm:w-72 sm:h-72 drop-shadow-md">
      <circle cx="100" cy="100" r="95" fill="white" stroke="#a78bfa" strokeWidth="4" />

      {/* Minute ticks */}
      {Array.from({ length: 60 }).map((_, i) => {
        const angle = (i * 6 - 90) * (Math.PI / 180);
        const isHour = i % 5 === 0;
        const r1 = isHour ? 82 : 87;
        const r2 = 92;
        return (
          <line
            key={`tick-${i}`}
            x1={100 + r1 * Math.cos(angle)}
            y1={100 + r1 * Math.sin(angle)}
            x2={100 + r2 * Math.cos(angle)}
            y2={100 + r2 * Math.sin(angle)}
            stroke={isHour ? "#7c3aed" : "#c4b5fd"}
            strokeWidth={isHour ? 2.5 : 1}
            strokeLinecap="round"
          />
        );
      })}

      {/* Hour numbers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const num = i + 1;
        const angle = (num * 30 - 90) * (Math.PI / 180);
        const r = 70;
        return (
          <text
            key={`num-${num}`}
            x={100 + r * Math.cos(angle)}
            y={100 + r * Math.sin(angle)}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-purple-700"
            fontSize="18"
            fontWeight="800"
          >
            {num}
          </text>
        );
      })}

      {/* Hour hand */}
      <line
        x1="100" y1="100"
        x2="100" y2="48"
        stroke="#7c3aed"
        strokeWidth="6"
        strokeLinecap="round"
        transform={`rotate(${hourAngle} 100 100)`}
      />
      {/* Minute hand */}
      <line
        x1="100" y1="100"
        x2="100" y2="22"
        stroke="#a78bfa"
        strokeWidth="4"
        strokeLinecap="round"
        transform={`rotate(${minuteAngle} 100 100)`}
      />
      <circle cx="100" cy="100" r="6" fill="#7c3aed" />
      <circle cx="100" cy="100" r="2" fill="white" />
    </svg>
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

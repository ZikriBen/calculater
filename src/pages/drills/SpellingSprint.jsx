import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw, Star, Zap, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STUDENT, themeTokens, useStudent } from "@/lib/student";
import { vocabFor } from "@/lib/englishCurriculum";

const DRILLS_BY_DIFF = { easy: 8, medium: 10, hard: 12 };

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const readDifficulty = () => {
  try {
    const raw = localStorage.getItem("practice_context");
    if (raw) { const ctx = JSON.parse(raw); return ctx.difficulty || "easy"; }
  } catch {}
  return "easy";
};

const pickWords = (grade, difficulty) => {
  const count = DRILLS_BY_DIFF[difficulty] || 10;
  const tiers = difficulty === "easy"
    ? [vocabFor(grade, "easy")]
    : difficulty === "medium"
    ? [vocabFor(grade, "easy"), vocabFor(grade, "medium")]
    : [vocabFor(grade, "medium"), vocabFor(grade, "hard")];
  const all = tiers.flat();
  return shuffle(all).slice(0, count);
};

export default function SpellingSprint() {
  const navigate = useNavigate();
  useStudent();
  const theme = themeTokens();

  const difficulty = useMemo(readDifficulty, []);
  const DRILLS_PER_SESSION = DRILLS_BY_DIFF[difficulty] || 10;

  useEffect(() => {
    localStorage.removeItem("practice_context");
    localStorage.removeItem("exam_context");
  }, []);

  const words = useMemo(() => pickWords(STUDENT.grade, difficulty), [difficulty]);

  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [phase, setPhase] = useState("drill");

  return (
    <div className={`min-h-screen ${theme.pageBg}`} dir="rtl">
      <header className="bg-white/70 backdrop-blur-md border-b border-sky-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/chat")}
            className="flex items-center gap-1.5 text-sky-500 hover:text-sky-700 text-sm font-medium transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה
          </button>
          <h1 className="font-bold text-sky-700">איות מהיר ✍️</h1>
          <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
            <span className="text-xs font-semibold text-yellow-700">{Math.min(index + 1, DRILLS_PER_SESSION)}/{DRILLS_PER_SESSION}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-2">
          <div className="flex gap-1.5">
            {words.map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full ${
                i < index ? "bg-green-400" : i === index ? "bg-gradient-to-r from-sky-400 to-cyan-400" : "bg-gray-200"
              }`} />
            ))}
          </div>
        </div>
      </header>

      {phase !== "done" ? (
        <SpellingCard
          key={index}
          word={words[index]}
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
        />
      )}
    </div>
  );
}

function SpellingCard({ word, streak, onAnswer }) {
  useStudent();
  const theme = themeTokens();
  const { en, he, tr } = word;

  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const normalize = (s) => s.trim().toLowerCase().replace(/[^a-z]/g, "");

  const submit = () => {
    if (value.trim() === "" || feedback) return;
    const ok = normalize(value) === normalize(en);
    setFeedback(ok ? "correct" : "wrong");
    setTimeout(() => onAnswer(ok), ok ? 600 : 1800);
  };

  const hintText = () => {
    const letters = en.split("");
    const revealed = Math.ceil(letters.length / 3);
    return letters.map((l, i) => (i < revealed ? l : "_")).join(" ");
  };

  const inputBorder =
    feedback === "correct" ? "border-green-500 bg-green-50 text-green-800"
    : feedback === "wrong" ? "border-red-400 bg-red-50 text-red-700"
    : "border-sky-300 bg-white text-gray-800 focus:border-sky-500";

  return (
    <main className="max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-6">
      {streak >= 2 && (
        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-3 py-1 text-orange-700 font-bold text-sm">
          <Zap className="w-4 h-4 fill-orange-400" /> רצף {streak}!
        </div>
      )}

      <div className="bg-white rounded-3xl border-2 border-sky-200 shadow-sm px-8 py-8 w-full text-center">
        <div className="text-4xl font-black text-sky-800 mb-2">{he}</div>
        <div className="text-lg text-gray-400 mb-1" dir="rtl">{tr}</div>
        <div className="text-xs text-gray-400">מה המילה באנגלית?</div>
      </div>

      {showHint && !feedback && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-center">
          <span className="text-amber-800 font-mono tracking-widest text-lg" dir="ltr">{hintText()}</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="text"
        dir="ltr"
        value={value}
        disabled={feedback !== null}
        onChange={(e) => setValue(e.target.value.replace(/[^a-zA-Z\s-]/g, "").slice(0, 30))}
        onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
        placeholder={["א'","ב'"].includes(STUDENT.grade) ? "כתבו באנגלית..." : "Type in English..."}
        className={`w-full max-w-xs h-16 text-center text-2xl font-bold rounded-2xl border-4 transition-colors focus:outline-none ${inputBorder}`}
      />

      {feedback === "wrong" && (
        <div className="text-center">
          <p className="text-red-600 font-semibold">
            התשובה הנכונה: <span className="text-green-700 font-mono text-xl" dir="ltr">{en}</span>
          </p>
        </div>
      )}

      <div className="flex gap-3 w-full max-w-xs">
        {!feedback && (
          <Button
            variant="outline"
            onClick={() => setShowHint(h => !h)}
            className="flex-1 h-12 rounded-2xl border-amber-200 text-amber-700"
          >
            {showHint ? <EyeOff className="w-4 h-4 ml-1" /> : <Eye className="w-4 h-4 ml-1" />}
            {showHint ? "הסתר רמז" : "רמז"}
          </Button>
        )}
        <Button
          onClick={submit}
          disabled={value.trim() === "" || feedback !== null}
          className={`flex-1 h-12 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold`}
        >
          {feedback === "correct" ? "🎉 יופי!" : feedback === "wrong" ? "ממשיכים…" : "✅ בדיקה"}
        </Button>
      </div>
    </main>
  );
}

function SessionSummary({ correct, total, bestStreak, onAgain, onHome }) {
  const perfect = correct === total;
  return (
    <main className="max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-6 text-center">
      <div className="text-6xl">{perfect ? "🏆" : correct >= total / 2 ? "🎉" : "💪"}</div>
      <h2 className="text-3xl font-black text-sky-700">
        {perfect ? "מושלם!" : "כל הכבוד!"}
      </h2>
      <div className="text-5xl font-black text-sky-700">{correct}/{total}</div>
      {bestStreak >= 3 && (
        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-4 py-1.5 text-orange-700 font-bold">
          <Zap className="w-4 h-4 fill-orange-400" /> רצף הכי ארוך: {bestStreak}
        </div>
      )}
      <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
        <Button onClick={onAgain} className="w-full h-12 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold">
          <RotateCcw className="w-4 h-4 ml-2" /> סבב חדש
        </Button>
        <Button onClick={onHome} variant="outline" className="rounded-2xl h-12 border-sky-200 text-sky-700">
          💬 חזרה לשיחה
        </Button>
      </div>
    </main>
  );
}

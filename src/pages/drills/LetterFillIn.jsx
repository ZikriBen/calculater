import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STUDENT, themeTokens, useStudent } from "@/lib/student";
import { ALPHABET, LETTER_NAMES } from "@/lib/englishLetters";

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

const WORDS_BY_GRADE = {
  "א'": [
    { word: "cat", he: "חתול", emoji: "🐱" },
    { word: "dog", he: "כלב", emoji: "🐶" },
    { word: "sun", he: "שמש", emoji: "☀️" },
    { word: "mom", he: "אמא", emoji: "👩" },
    { word: "dad", he: "אבא", emoji: "👨" },
    { word: "red", he: "אדום", emoji: "🔴" },
    { word: "big", he: "גדול", emoji: "🐘" },
    { word: "hat", he: "כובע", emoji: "🎩" },
    { word: "cup", he: "כוס", emoji: "🥤" },
    { word: "bus", he: "אוטובוס", emoji: "🚌" },
    { word: "bed", he: "מיטה", emoji: "🛏️" },
    { word: "pen", he: "עט", emoji: "🖊️" },
    { word: "box", he: "קופסה", emoji: "📦" },
    { word: "egg", he: "ביצה", emoji: "🥚" },
    { word: "leg", he: "רגל", emoji: "🦵" },
    { word: "sit", he: "לשבת", emoji: "🪑" },
    { word: "run", he: "לרוץ", emoji: "🏃" },
    { word: "map", he: "מפה", emoji: "🗺️" },
  ],
  "ב'": [
    { word: "fish", he: "דג", emoji: "🐟" },
    { word: "ball", he: "כדור", emoji: "⚽" },
    { word: "tree", he: "עץ", emoji: "🌳" },
    { word: "book", he: "ספר", emoji: "📖" },
    { word: "cake", he: "עוגה", emoji: "🎂" },
    { word: "hand", he: "יד", emoji: "✋" },
    { word: "milk", he: "חלב", emoji: "🥛" },
    { word: "bird", he: "ציפור", emoji: "🐦" },
    { word: "star", he: "כוכב", emoji: "⭐" },
    { word: "rain", he: "גשם", emoji: "🌧️" },
    { word: "door", he: "דלת", emoji: "🚪" },
    { word: "frog", he: "צפרדע", emoji: "🐸" },
    { word: "ship", he: "ספינה", emoji: "🚢" },
    { word: "king", he: "מלך", emoji: "👑" },
    { word: "moon", he: "ירח", emoji: "🌙" },
    { word: "duck", he: "ברווז", emoji: "🦆" },
    { word: "ring", he: "טבעת", emoji: "💍" },
    { word: "lamp", he: "מנורה", emoji: "💡" },
  ],
  "ג'": [
    { word: "apple", he: "תפוח", emoji: "🍎" },
    { word: "house", he: "בית", emoji: "🏠" },
    { word: "water", he: "מים", emoji: "💧" },
    { word: "table", he: "שולחן", emoji: "🪑" },
    { word: "green", he: "ירוק", emoji: "💚" },
    { word: "chair", he: "כיסא", emoji: "🪑" },
    { word: "happy", he: "שמח", emoji: "😊" },
    { word: "juice", he: "מיץ", emoji: "🧃" },
    { word: "plane", he: "מטוס", emoji: "✈️" },
    { word: "queen", he: "מלכה", emoji: "👸" },
    { word: "train", he: "רכבת", emoji: "🚂" },
    { word: "cloud", he: "ענן", emoji: "☁️" },
    { word: "light", he: "אור", emoji: "💡" },
    { word: "music", he: "מוזיקה", emoji: "🎵" },
    { word: "beach", he: "חוף", emoji: "🏖️" },
    { word: "clock", he: "שעון", emoji: "🕐" },
    { word: "bread", he: "לחם", emoji: "🍞" },
    { word: "snake", he: "נחש", emoji: "🐍" },
  ],
};

const wordsFor = (grade) => WORDS_BY_GRADE[grade] || WORDS_BY_GRADE["ב'"];

const generateProblems = (grade, difficulty) => {
  const count = DRILLS_BY_DIFF[difficulty] || 10;
  const words = shuffle(wordsFor(grade));
  return words.slice(0, count).map(entry => {
    const { word, he, emoji } = entry;
    const chars = word.split("");
    const blankIdx = grade === "א'"
      ? 0
      : Math.floor(Math.random() * chars.length);
    const missing = chars[blankIdx];
    const displayed = chars.map((c, i) => i === blankIdx ? "_" : c).join("");
    const distractors = shuffle(ALPHABET.filter(l => l.toLowerCase() !== missing.toLowerCase()))
      .slice(0, 3)
      .map(l => l.toLowerCase());
    const options = shuffle([missing.toLowerCase(), ...distractors]);
    return { displayed, answer: missing.toLowerCase(), options, he, emoji, fullWord: word };
  });
};

export default function LetterFillIn() {
  const navigate = useNavigate();
  useStudent();
  const theme = themeTokens();

  const difficulty = useMemo(readDifficulty, []);
  const DRILLS_PER_SESSION = DRILLS_BY_DIFF[difficulty] || 10;

  useEffect(() => {
    localStorage.removeItem("practice_context");
    localStorage.removeItem("exam_context");
  }, []);

  const problems = useMemo(
    () => generateProblems(STUDENT.grade, difficulty),
    [difficulty]
  );

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
          <h1 className="font-bold text-sky-700">השלמת אותיות ✏️</h1>
          <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
            <span className="text-xs font-semibold text-yellow-700">{Math.min(index + 1, DRILLS_PER_SESSION)}/{DRILLS_PER_SESSION}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-2">
          <div className="flex gap-1.5">
            {problems.map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full ${
                i < index ? "bg-green-400" : i === index ? "bg-gradient-to-r from-sky-400 to-cyan-400" : "bg-gray-200"
              }`} />
            ))}
          </div>
        </div>
      </header>

      {phase !== "done" ? (
        <LetterQuestion
          key={index}
          problem={problems[index]}
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
        <Summary
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

function LetterQuestion({ problem, streak, onAnswer }) {
  const { displayed, answer, options, he, emoji, fullWord } = problem;
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const handleSelect = (opt) => {
    if (feedback) return;
    setSelected(opt);
    const ok = opt === answer;
    setFeedback(ok ? "correct" : "wrong");
    setTimeout(() => onAnswer(ok), ok ? 600 : 1500);
  };

  const optionClass = (opt) => {
    const base = "rounded-2xl w-16 h-16 font-bold text-2xl transition-all duration-200 border-2 uppercase";
    if (feedback && opt === answer) return `${base} bg-green-50 border-green-400 text-green-800`;
    if (feedback === "wrong" && opt === selected) return `${base} bg-red-50 border-red-400 text-red-700`;
    if (feedback) return `${base} bg-gray-50 border-gray-200 text-gray-400 cursor-default`;
    return `${base} bg-white border-gray-200 hover:border-sky-300 hover:bg-sky-50 text-gray-800 cursor-pointer`;
  };

  return (
    <main className="max-w-md mx-auto px-4 py-8 flex flex-col items-center gap-6">
      {streak >= 2 && (
        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-3 py-1 text-orange-700 font-bold text-sm">
          <Zap className="w-4 h-4 fill-orange-400" /> רצף {streak}!
        </div>
      )}

      <div className="text-sm text-gray-500">איזו אות חסרה?</div>

      <div className="bg-white rounded-3xl border-2 border-sky-200 shadow-sm px-8 py-8 text-center w-full max-w-[280px]">
        <div className="text-5xl mb-3">{emoji}</div>
        <div className="text-4xl font-black text-sky-800 tracking-[0.3em] font-mono" dir="ltr">
          {displayed.split("").map((ch, i) => (
            <span key={i} className={ch === "_" ? "text-amber-500 border-b-4 border-amber-400 px-1" : ""}>
              {ch}
            </span>
          ))}
        </div>
        <div className="text-lg text-gray-500 mt-3">{he}</div>
      </div>

      <div className="flex justify-center gap-3">
        {options.map((opt, i) => (
          <button
            key={i}
            disabled={feedback !== null}
            onClick={() => handleSelect(opt)}
            className={optionClass(opt)}
            dir="ltr"
          >
            {opt}
          </button>
        ))}
      </div>

      {feedback === "correct" && (
        <div className="text-center">
          <div className="text-4xl mb-1">🎉</div>
          <div className="text-green-600 font-bold text-lg" dir="ltr">{fullWord}</div>
        </div>
      )}

      {feedback === "wrong" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
          <div className="text-amber-800 font-semibold">
            האות החסרה: <span className="text-green-700 text-3xl font-mono uppercase" dir="ltr">{answer}</span>
          </div>
          <div className="text-sm text-gray-500 mt-1 font-bold" dir="ltr">{fullWord}</div>
          <div className="text-xs text-gray-400 mt-1">
            {answer.toUpperCase()} = {LETTER_NAMES[answer.toUpperCase()]}
          </div>
        </div>
      )}
    </main>
  );
}

function Summary({ correct, total, bestStreak, onAgain, onHome }) {
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

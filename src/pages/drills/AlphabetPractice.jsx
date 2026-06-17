import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STUDENT, themeTokens, useStudent } from "@/lib/student";

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

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const LETTER_NAMES = {
  A: "אֵיי", B: "בִּי", C: "סִי", D: "דִי", E: "אִי", F: "אֶף",
  G: "גִ׳י", H: "אֵיצ׳", I: "אַיי", J: "גֵ׳יי", K: "קֵיי", L: "אֶל",
  M: "אֶם", N: "אֶן", O: "אוֹ", P: "פִּי", Q: "קְיוּ", R: "אָר",
  S: "אֶס", T: "טִי", U: "יוּ", V: "וִי", W: "דַבְּלְיוּ", X: "אֶקְס",
  Y: "וַויי", Z: "זֶד",
};

const LETTER_WORDS = {
  A: { word: "Apple", he: "תפוח", emoji: "🍎" },
  B: { word: "Ball", he: "כדור", emoji: "⚽" },
  C: { word: "Cat", he: "חתול", emoji: "🐱" },
  D: { word: "Dog", he: "כלב", emoji: "🐶" },
  E: { word: "Egg", he: "ביצה", emoji: "🥚" },
  F: { word: "Fish", he: "דג", emoji: "🐟" },
  G: { word: "Girl", he: "ילדה", emoji: "👧" },
  H: { word: "House", he: "בית", emoji: "🏠" },
  I: { word: "Ice cream", he: "גלידה", emoji: "🍦" },
  J: { word: "Juice", he: "מיץ", emoji: "🧃" },
  K: { word: "King", he: "מלך", emoji: "👑" },
  L: { word: "Lion", he: "אריה", emoji: "🦁" },
  M: { word: "Moon", he: "ירח", emoji: "🌙" },
  N: { word: "Nose", he: "אף", emoji: "👃" },
  O: { word: "Orange", he: "תפוז", emoji: "🍊" },
  P: { word: "Pizza", he: "פיצה", emoji: "🍕" },
  Q: { word: "Queen", he: "מלכה", emoji: "👸" },
  R: { word: "Rain", he: "גשם", emoji: "🌧️" },
  S: { word: "Sun", he: "שמש", emoji: "☀️" },
  T: { word: "Tree", he: "עץ", emoji: "🌳" },
  U: { word: "Umbrella", he: "מטריה", emoji: "☂️" },
  V: { word: "Violin", he: "כינור", emoji: "🎻" },
  W: { word: "Water", he: "מים", emoji: "💧" },
  X: { word: "X-ray", he: "צילום רנטגן", emoji: "🩻" },
  Y: { word: "Yellow", he: "צהוב", emoji: "💛" },
  Z: { word: "Zebra", he: "זברה", emoji: "🦓" },
};

const generateProblems = (grade, difficulty) => {
  const count = DRILLS_BY_DIFF[difficulty] || 10;
  const types = grade === "א'"
    ? ["identify", "identify", "match_case", "emoji_letter"]
    : grade === "ב'"
    ? ["identify", "match_case", "emoji_letter", "next_letter"]
    : ["match_case", "next_letter", "emoji_letter", "identify"];

  const problems = [];
  const usedLetters = new Set();

  while (problems.length < count) {
    const type = types[Math.floor(Math.random() * types.length)];
    const letter = ALPHABET[Math.floor(Math.random() * 26)];
    const key = `${type}-${letter}`;
    if (usedLetters.has(key)) continue;
    usedLetters.add(key);

    if (type === "identify") {
      const distractors = shuffle(ALPHABET.filter(l => l !== letter)).slice(0, 3);
      const options = shuffle([letter, ...distractors]);
      problems.push({
        type: "identify",
        prompt: `מהי האות הזו?`,
        display: Math.random() < 0.5 ? letter : letter.toLowerCase(),
        answer: letter,
        options: options.map(l => ({ label: `${l} (${LETTER_NAMES[l]})`, value: l })),
      });
    } else if (type === "match_case") {
      const isUpper = Math.random() < 0.5;
      const shown = isUpper ? letter : letter.toLowerCase();
      const target = isUpper ? letter.toLowerCase() : letter;
      const targetLabel = isUpper ? "הקטנה" : "הגדולה";
      const distractors = shuffle(ALPHABET.filter(l => l !== letter)).slice(0, 3)
        .map(l => isUpper ? l.toLowerCase() : l);
      const options = shuffle([target, ...distractors]);
      problems.push({
        type: "match_case",
        prompt: `מצאו את האות ${targetLabel} של:`,
        display: shown,
        answer: target,
        options: options.map(l => ({ label: l, value: l })),
      });
    } else if (type === "next_letter") {
      const idx = ALPHABET.indexOf(letter);
      if (idx >= 25) continue;
      const next = ALPHABET[idx + 1];
      const distractors = shuffle(ALPHABET.filter(l => l !== next && l !== letter)).slice(0, 3);
      const options = shuffle([next, ...distractors]);
      problems.push({
        type: "next_letter",
        prompt: `איזו אות באה אחרי?`,
        display: letter,
        answer: next,
        options: options.map(l => ({ label: l, value: l })),
      });
    } else if (type === "emoji_letter") {
      const info = LETTER_WORDS[letter];
      const distractors = shuffle(ALPHABET.filter(l => l !== letter)).slice(0, 3);
      const options = shuffle([letter, ...distractors]);
      problems.push({
        type: "emoji_letter",
        prompt: `באיזו אות מתחילה המילה?`,
        display: `${info.emoji} ${info.word}`,
        displayHe: info.he,
        answer: letter,
        options: options.map(l => ({ label: l, value: l })),
      });
    }
  }
  return problems;
};

export default function AlphabetPractice() {
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
          <h1 className="font-bold text-sky-700">אותיות ABC 🔤</h1>
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
        <LetterCard
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

function LetterCard({ problem, streak, onAnswer }) {
  const { prompt, display, displayHe, answer, options, type } = problem;
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const handleSelect = (opt) => {
    if (feedback) return;
    setSelected(opt.value);
    const ok = opt.value === answer;
    setFeedback(ok ? "correct" : "wrong");
    setTimeout(() => onAnswer(ok), ok ? 600 : 1500);
  };

  const optionClass = (opt) => {
    const base = "rounded-2xl px-5 py-4 font-bold text-xl transition-all duration-200 border-2 min-w-[70px]";
    if (feedback && opt.value === answer) return `${base} bg-green-50 border-green-400 text-green-800`;
    if (feedback === "wrong" && opt.value === selected) return `${base} bg-red-50 border-red-400 text-red-700`;
    if (feedback) return `${base} bg-gray-50 border-gray-200 text-gray-400 cursor-default`;
    return `${base} bg-white border-gray-200 hover:border-sky-300 hover:bg-sky-50 text-gray-800 cursor-pointer`;
  };

  return (
    <main className="max-w-md mx-auto px-4 py-8 flex flex-col items-center gap-5">
      {streak >= 2 && (
        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-3 py-1 text-orange-700 font-bold text-sm">
          <Zap className="w-4 h-4 fill-orange-400" /> רצף {streak}!
        </div>
      )}

      <div className="text-lg font-semibold text-gray-600">{prompt}</div>

      <div className="bg-white rounded-3xl border-2 border-sky-200 shadow-sm px-8 py-8 text-center min-w-[200px]">
        <div className={`font-black text-sky-800 ${type === "emoji_letter" ? "text-4xl" : "text-7xl"}`} dir="ltr">
          {display}
        </div>
        {displayHe && (
          <div className="text-sm text-gray-400 mt-2">{displayHe}</div>
        )}
        {type === "identify" && (
          <div className="text-sm text-gray-400 mt-2">
            ({LETTER_NAMES[answer]})
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {options.map((opt, i) => (
          <button
            key={i}
            disabled={feedback !== null}
            onClick={() => handleSelect(opt)}
            className={optionClass(opt)}
            dir="ltr"
          >
            {opt.label}
          </button>
        ))}
      </div>

      {feedback === "correct" && (
        <div className="text-center">
          <div className="text-4xl mb-1">🎉</div>
          <div className="text-green-600 font-bold">כל הכבוד!</div>
        </div>
      )}

      {feedback === "wrong" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
          <div className="text-amber-800 font-semibold">
            התשובה הנכונה: <span className="text-green-700 text-2xl font-mono" dir="ltr">{answer}</span>
          </div>
          {LETTER_WORDS[answer] && (
            <div className="text-sm text-gray-500 mt-1">
              {LETTER_WORDS[answer].emoji} {LETTER_WORDS[answer].word} = {LETTER_WORDS[answer].he}
            </div>
          )}
        </div>
      )}
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

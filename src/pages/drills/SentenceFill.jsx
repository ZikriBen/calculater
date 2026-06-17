import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STUDENT, themeTokens, useStudent } from "@/lib/student";

const DRILLS_BY_DIFF = { easy: 6, medium: 8, hard: 10 };

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

const GRADE_ORDER = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'"];
const gradeUp = (grade) => {
  const idx = GRADE_ORDER.indexOf(grade);
  return idx >= 0 && idx < GRADE_ORDER.length - 1 ? GRADE_ORDER[idx + 1] : grade;
};

const SENTENCES_BY_GRADE = {
  "א'": [
    { sentence: "I have a ___.", answer: "cat", hint: "חתול", options: ["cat", "car", "cup", "cap"] },
    { sentence: "The ___ is red.", answer: "ball", hint: "כדור", options: ["ball", "bell", "bill", "bull"] },
    { sentence: "I see the ___.", answer: "dog", hint: "כלב", options: ["dog", "dig", "dug", "log"] },
    { sentence: "The ___ is hot.", answer: "sun", hint: "שמש", options: ["sun", "son", "run", "fun"] },
    { sentence: "I like ___.", answer: "mom", hint: "אמא", options: ["mom", "mop", "map", "mat"] },
    { sentence: "The sky is ___.", answer: "blue", hint: "כחול", options: ["blue", "blow", "blur", "blew"] },
    { sentence: "This is a ___ house.", answer: "big", hint: "גדול", options: ["big", "bag", "bug", "bit"] },
    { sentence: "She said ___.", answer: "yes", hint: "כן", options: ["yes", "yet", "yell", "year"] },
    { sentence: "A ___ swims.", answer: "fish", hint: "דג", options: ["fish", "dish", "wish", "fist"] },
    { sentence: "I read a ___.", answer: "book", hint: "ספר", options: ["book", "boot", "boom", "cook"] },
  ],
  "ב'": [
    { sentence: "I go to ___.", answer: "school", hint: "בית ספר", options: ["school", "stool", "scout", "scold"] },
    { sentence: "Sit on the ___.", answer: "chair", hint: "כיסא", options: ["chair", "chain", "charm", "chart"] },
    { sentence: "I eat ___.", answer: "cake", hint: "עוגה", options: ["cake", "cape", "came", "cane"] },
    { sentence: "The ___ is pretty.", answer: "flower", hint: "פרח", options: ["flower", "floor", "flour", "float"] },
    { sentence: "It is ___ outside.", answer: "rain", hint: "גשם", options: ["rain", "rail", "raid", "race"] },
    { sentence: "My ___ is a boy.", answer: "brother", hint: "אח", options: ["brother", "bother", "butter", "better"] },
    { sentence: "My ___ is nice.", answer: "teacher", hint: "מורה", options: ["teacher", "toaster", "trailer", "theater"] },
    { sentence: "Good ___!", answer: "morning", hint: "בוקר", options: ["morning", "mooring", "meaning", "moving"] },
    { sentence: "Let's ___ together.", answer: "play", hint: "לשחק", options: ["play", "plan", "plate", "plane"] },
    { sentence: "I ___ at night.", answer: "sleep", hint: "לישון", options: ["sleep", "slide", "slice", "slope"] },
  ],
  "ג'": [
    { sentence: "We eat in the ___.", answer: "kitchen", hint: "מטבח", options: ["kitchen", "kitten", "ketchup", "kingdom"] },
    { sentence: "I ___ my name.", answer: "write", hint: "לכתוב", options: ["write", "wrote", "right", "white"] },
    { sentence: "Can I ___ water?", answer: "drink", hint: "לשתות", options: ["drink", "drive", "dream", "dress"] },
    { sentence: "The ___ is big.", answer: "elephant", hint: "פיל", options: ["elephant", "elevator", "electric", "element"] },
    { sentence: "I like ___.", answer: "summer", hint: "קיץ", options: ["summer", "supper", "suffer", "sudden"] },
    { sentence: "She is ___.", answer: "beautiful", hint: "יפה", options: ["beautiful", "butterfly", "balanced", "becoming"] },
    { sentence: "This is ___.", answer: "different", hint: "שונה", options: ["different", "difficult", "distance", "dinosaur"] },
    { sentence: "It is very ___.", answer: "important", hint: "חשוב", options: ["important", "impossible", "impatient", "improper"] },
    { sentence: "Let's go ___.", answer: "together", hint: "ביחד", options: ["together", "tomorrow", "tonight", "tornado"] },
    { sentence: "I ___ you.", answer: "remember", hint: "לזכור", options: ["remember", "remove", "remind", "remain"] },
  ],
  "ד'": [
    { sentence: "What is the ___?", answer: "question", hint: "שאלה", options: ["question", "quarter", "quality", "quickly"] },
    { sentence: "I ___ a lot.", answer: "travel", hint: "לטייל", options: ["travel", "trouble", "traffic", "trailer"] },
    { sentence: "It is ___.", answer: "dangerous", hint: "מסוכן", options: ["dangerous", "delicious", "different", "dinosaur"] },
    { sentence: "I go to the ___.", answer: "library", hint: "ספרייה", options: ["library", "liberty", "license", "limited"] },
    { sentence: "This is my ___.", answer: "favourite", hint: "אהוב", options: ["favourite", "festival", "finished", "familiar"] },
    { sentence: "What a ___!", answer: "surprise", hint: "הפתעה", options: ["surprise", "supreme", "surface", "survive"] },
    { sentence: "I need an ___.", answer: "umbrella", hint: "מטרייה", options: ["umbrella", "uniform", "universe", "unusual"] },
    { sentence: "This bed is ___.", answer: "comfortable", hint: "נוח", options: ["comfortable", "communicate", "complicated", "competition"] },
    { sentence: "What a ___ day!", answer: "wonderful", hint: "נפלא", options: ["wonderful", "wandering", "worksheet", "waterfall"] },
    { sentence: "Let me give an ___.", answer: "example", hint: "דוגמה", options: ["example", "examine", "excited", "exercise"] },
  ],
  "ה'": [
    { sentence: "This is an ___.", answer: "adventure", hint: "הרפתקה", options: ["adventure", "advantage", "advertise", "apartment"] },
    { sentence: "Can you ___ it?", answer: "describe", hint: "לתאר", options: ["describe", "discover", "distance", "discount"] },
    { sentence: "We ___ the party.", answer: "celebrate", hint: "לחגוג", options: ["celebrate", "calculate", "challenge", "chocolate"] },
    { sentence: "Use your ___.", answer: "imagination", hint: "דמיון", options: ["imagination", "information", "instruction", "immigration"] },
    { sentence: "In my ___, it's good.", answer: "opinion", hint: "דעה", options: ["opinion", "opening", "operate", "observe"] },
    { sentence: "Check the ___.", answer: "temperature", hint: "טמפרטורה", options: ["temperature", "telephone", "television", "tournament"] },
    { sentence: "I ___ the answer.", answer: "knowledge", hint: "ידע", options: ["knowledge", "knockout", "keyboard", "kangaroo"] },
    { sentence: "It is ___.", answer: "necessary", hint: "הכרחי", options: ["necessary", "naturally", "narrative", "negotiate"] },
    { sentence: "This is a great ___.", answer: "opportunity", hint: "הזדמנות", options: ["opportunity", "organization", "observation", "information"] },
    { sentence: "I want ___.", answer: "experience", hint: "ניסיון", options: ["experience", "experiment", "expensive", "explosion"] },
  ],
  "ו'": [
    { sentence: "A great ___.", answer: "achievement", hint: "הישג", options: ["achievement", "arrangement", "advertisement", "appointment"] },
    { sentence: "The ___ is clear.", answer: "conclusion", hint: "מסקנה", options: ["conclusion", "confusion", "connection", "condition"] },
    { sentence: "___ is important.", answer: "education", hint: "חינוך", options: ["education", "equipment", "evaluation", "excitement"] },
    { sentence: "This ___ works.", answer: "technology", hint: "טכנולוגיה", options: ["technology", "television", "tournament", "territory"] },
    { sentence: "It happened ___.", answer: "immediately", hint: "מיד", options: ["immediately", "importantly", "individually", "independently"] },
    { sentence: "She is a ___.", answer: "professional", hint: "מקצועי", options: ["professional", "problematic", "philosophical", "presidential"] },
    { sentence: "I ___ agree.", answer: "definitely", hint: "בהחלט", options: ["definitely", "desperately", "differently", "delightfully"] },
    { sentence: "We ___ it.", answer: "investigate", hint: "לחקור", options: ["investigate", "incorporate", "interactive", "independent"] },
    { sentence: "It is a good ___.", answer: "suggestion", hint: "הצעה", options: ["suggestion", "surrounded", "suspicious", "successful"] },
    { sentence: "The ___ is nice.", answer: "community", hint: "קהילה", options: ["community", "comparison", "commitment", "commentary"] },
  ],
};

SENTENCES_BY_GRADE["ז'"] = SENTENCES_BY_GRADE["ו'"];
SENTENCES_BY_GRADE["ח'"] = SENTENCES_BY_GRADE["ו'"];

const sentencesFor = (grade) =>
  SENTENCES_BY_GRADE[grade] || SENTENCES_BY_GRADE["ד'"];

export default function SentenceFill() {
  const navigate = useNavigate();
  useStudent();
  const theme = themeTokens();

  const difficulty = useMemo(readDifficulty, []);
  const DRILLS_PER_SESSION = DRILLS_BY_DIFF[difficulty] || 8;

  useEffect(() => {
    localStorage.removeItem("practice_context");
    localStorage.removeItem("exam_context");
  }, []);

  const problems = useMemo(() => {
    const grade = difficulty === "hard" ? gradeUp(STUDENT.grade) : STUDENT.grade;
    return shuffle(sentencesFor(grade)).slice(0, DRILLS_PER_SESSION);
  }, [difficulty]);

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
          <h1 className="font-bold text-sky-700">השלמת משפטים 📝</h1>
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
        <FillCard
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

function FillCard({ problem, streak, onAnswer }) {
  useStudent();
  const { sentence, answer, hint, options } = problem;
  const shuffledOptions = useMemo(() => shuffle(options), [options]);

  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const handleSelect = (opt) => {
    if (feedback) return;
    setSelected(opt);
    const ok = opt.toLowerCase() === answer.toLowerCase();
    setFeedback(ok ? "correct" : "wrong");
    setTimeout(() => onAnswer(ok), ok ? 600 : 1400);
  };

  const optionClass = (opt) => {
    const base = "rounded-2xl px-5 py-3 font-bold text-lg transition-all duration-200 border-2";
    if (feedback && opt.toLowerCase() === answer.toLowerCase()) return `${base} bg-green-50 border-green-400 text-green-800`;
    if (feedback === "wrong" && opt === selected) return `${base} bg-red-50 border-red-400 text-red-700`;
    if (opt === selected) return `${base} bg-sky-50 border-sky-400 text-sky-800`;
    if (feedback) return `${base} bg-gray-50 border-gray-200 text-gray-400 cursor-default`;
    return `${base} bg-white border-gray-200 hover:border-sky-300 hover:bg-sky-50 text-gray-800 cursor-pointer`;
  };

  return (
    <main className="max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-6">
      {streak >= 2 && (
        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-3 py-1 text-orange-700 font-bold text-sm">
          <Zap className="w-4 h-4 fill-orange-400" /> רצף {streak}!
        </div>
      )}

      <div className="bg-white rounded-3xl border-2 border-sky-200 shadow-sm px-6 py-8 w-full text-center">
        <div className="text-2xl sm:text-3xl font-black text-sky-800 mb-3" dir="ltr">
          {sentence.replace("___", "______")}
        </div>
        <div className="text-sm text-gray-400">רמז: {hint}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
        {shuffledOptions.map((opt) => (
          <button
            key={opt}
            disabled={feedback !== null}
            onClick={() => handleSelect(opt)}
            className={optionClass(opt)}
            dir="ltr"
          >
            {opt}
          </button>
        ))}
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

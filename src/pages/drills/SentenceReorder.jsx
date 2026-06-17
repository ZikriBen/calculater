import { useEffect, useMemo, useState } from "react";
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
    { words: ["I", "have", "a", "cat"], hint: "יש לי חתול" },
    { words: ["The", "dog", "is", "big"], hint: "הכלב גדול" },
    { words: ["I", "like", "red", "balls"], hint: "אני אוהב כדורים אדומים" },
    { words: ["She", "is", "my", "mom"], hint: "היא אמא שלי" },
    { words: ["He", "has", "a", "book"], hint: "יש לו ספר" },
    { words: ["The", "sun", "is", "hot"], hint: "השמש חמה" },
    { words: ["I", "see", "a", "bird"], hint: "אני רואה ציפור" },
    { words: ["We", "are", "at", "school"], hint: "אנחנו בבית הספר" },
    { words: ["The", "fish", "can", "swim"], hint: "הדג יכול לשחות" },
    { words: ["I", "am", "very", "happy"], hint: "אני מאוד שמח" },
  ],
  "ב'": [
    { words: ["She", "goes", "to", "school", "every", "day"], hint: "היא הולכת לבית הספר כל יום" },
    { words: ["My", "teacher", "is", "very", "nice"], hint: "המורה שלי מאוד נחמדה" },
    { words: ["I", "play", "with", "my", "friends"], hint: "אני משחק עם החברים שלי" },
    { words: ["The", "cat", "sleeps", "on", "the", "bed"], hint: "החתול ישן על המיטה" },
    { words: ["We", "eat", "breakfast", "in", "the", "morning"], hint: "אנחנו אוכלים ארוחת בוקר בבוקר" },
    { words: ["He", "can", "run", "very", "fast"], hint: "הוא יכול לרוץ מהר מאוד" },
    { words: ["My", "brother", "likes", "to", "read"], hint: "האח שלי אוהב לקרוא" },
    { words: ["The", "flowers", "are", "red", "and", "yellow"], hint: "הפרחים אדומים וצהובים" },
    { words: ["Do", "you", "like", "ice", "cream"], hint: "אתה אוהב גלידה?" },
    { words: ["It", "is", "raining", "outside", "today"], hint: "יורד גשם בחוץ היום" },
  ],
  "ג'": [
    { words: ["I", "went", "to", "the", "zoo", "yesterday"], hint: "הלכתי לגן החיות אתמול" },
    { words: ["She", "is", "taller", "than", "her", "brother"], hint: "היא גבוהה יותר מאחיה" },
    { words: ["We", "will", "go", "to", "the", "beach", "tomorrow"], hint: "נלך לחוף מחר" },
    { words: ["The", "elephant", "is", "the", "biggest", "animal"], hint: "הפיל הוא החיה הגדולה ביותר" },
    { words: ["My", "father", "works", "in", "a", "big", "hospital"], hint: "אבא שלי עובד בבית חולים גדול" },
    { words: ["There", "are", "many", "books", "in", "the", "library"], hint: "יש הרבה ספרים בספרייה" },
    { words: ["I", "like", "summer", "because", "it", "is", "hot"], hint: "אני אוהב קיץ כי חם" },
    { words: ["Can", "you", "help", "me", "with", "my", "homework"], hint: "אתה יכול לעזור לי עם שיעורי הבית?" },
    { words: ["The", "children", "played", "in", "the", "park", "together"], hint: "הילדים שיחקו בפארק ביחד" },
    { words: ["She", "has", "never", "seen", "snow", "before"], hint: "היא מעולם לא ראתה שלג" },
  ],
  "ד'": [
    { words: ["If", "it", "rains", "we", "will", "stay", "at", "home"], hint: "אם ירד גשם נישאר בבית" },
    { words: ["She", "has", "been", "studying", "English", "for", "three", "years"], hint: "היא לומדת אנגלית שלוש שנים" },
    { words: ["The", "cake", "was", "made", "by", "my", "grandmother"], hint: "העוגה הוכנה על ידי סבתא שלי" },
    { words: ["He", "is", "the", "fastest", "runner", "in", "our", "class"], hint: "הוא הרץ המהיר ביותר בכיתה" },
    { words: ["You", "should", "always", "brush", "your", "teeth", "before", "bed"], hint: "תמיד כדאי לצחצח שיניים לפני השינה" },
    { words: ["I", "have", "never", "been", "to", "London", "before"], hint: "מעולם לא הייתי בלונדון" },
    { words: ["The", "movie", "was", "more", "interesting", "than", "the", "book"], hint: "הסרט היה מעניין יותר מהספר" },
    { words: ["My", "mother", "asked", "me", "to", "clean", "my", "room"], hint: "אמא שלי ביקשה ממני לנקות את החדר" },
    { words: ["We", "couldn't", "go", "outside", "because", "of", "the", "storm"], hint: "לא יכולנו לצאת בגלל הסערה" },
    { words: ["Do", "you", "know", "where", "the", "nearest", "bus", "stop", "is"], hint: "אתה יודע איפה תחנת האוטובוס הקרובה?" },
  ],
  "ה'": [
    { words: ["By", "the", "time", "we", "arrived", "the", "concert", "had", "already", "started"], hint: "עד שהגענו הקונצרט כבר התחיל" },
    { words: ["If", "I", "were", "you", "I", "would", "study", "harder"], hint: "אם הייתי במקומך הייתי לומד יותר" },
    { words: ["Not", "only", "is", "she", "smart", "but", "she", "is", "also", "kind"], hint: "היא לא רק חכמה אלא גם נחמדה" },
    { words: ["The", "teacher", "told", "us", "that", "the", "test", "would", "be", "difficult"], hint: "המורה אמרה לנו שהמבחן יהיה קשה" },
    { words: ["Neither", "the", "students", "nor", "the", "teacher", "knew", "the", "answer"], hint: "לא התלמידים ולא המורה ידעו את התשובה" },
    { words: ["She", "has", "been", "living", "in", "this", "city", "since", "she", "was", "born"], hint: "היא גרה בעיר הזו מאז שנולדה" },
    { words: ["I", "wish", "I", "could", "speak", "three", "languages", "fluently"], hint: "הלוואי שיכולתי לדבר שלוש שפות בשטף" },
    { words: ["The", "book", "which", "I", "borrowed", "from", "the", "library", "was", "excellent"], hint: "הספר שהשאלתי מהספרייה היה מצוין" },
  ],
  "ו'": [
    { words: ["Had", "I", "known", "about", "the", "problem", "I", "would", "have", "acted", "differently"], hint: "אילו ידעתי על הבעיה הייתי פועל אחרת" },
    { words: ["Despite", "having", "studied", "all", "night", "she", "still", "failed", "the", "exam"], hint: "למרות שלמדה כל הלילה היא נכשלה" },
    { words: ["The", "more", "you", "practice", "the", "better", "your", "English", "will", "become"], hint: "ככל שמתרגלים יותר האנגלית משתפרת" },
    { words: ["It", "is", "essential", "that", "every", "student", "complete", "the", "assignment", "on", "time"], hint: "חיוני שכל תלמיד ישלים את המטלה בזמן" },
    { words: ["Hardly", "had", "we", "left", "the", "house", "when", "it", "started", "to", "rain"], hint: "בקושי יצאנו מהבית כשהתחיל לרדת גשם" },
    { words: ["She", "would", "rather", "read", "a", "book", "than", "watch", "television"], hint: "היא מעדיפה לקרוא ספר מאשר לצפות בטלוויזיה" },
    { words: ["The", "report", "must", "be", "submitted", "by", "the", "end", "of", "the", "week"], hint: "הדו״ח חייב להיות מוגש עד סוף השבוע" },
    { words: ["Not", "until", "I", "read", "the", "article", "did", "I", "understand", "the", "issue"], hint: "רק כשקראתי את הכתבה הבנתי את הנושא" },
  ],
};

SENTENCES_BY_GRADE["ז'"] = SENTENCES_BY_GRADE["ו'"];
SENTENCES_BY_GRADE["ח'"] = SENTENCES_BY_GRADE["ו'"];

const sentencesFor = (grade) =>
  SENTENCES_BY_GRADE[grade] || SENTENCES_BY_GRADE["ד'"];

export default function SentenceReorder() {
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
          <h1 className="font-bold text-sky-700">סדר מילים 🔀</h1>
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
        <ReorderCard
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

function ReorderCard({ problem, streak, onAnswer }) {
  useStudent();
  const { words, hint } = problem;
  const correctSentence = words.join(" ");

  const scrambled = useMemo(() => {
    let s = shuffle(words);
    while (s.join(" ") === correctSentence) s = shuffle(words);
    return s;
  }, [words]);

  const [pool, setPool] = useState(scrambled);
  const [placed, setPlaced] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const addWord = (idx) => {
    if (feedback) return;
    setPlaced(p => [...p, pool[idx]]);
    setPool(p => p.filter((_, i) => i !== idx));
  };

  const removeWord = (idx) => {
    if (feedback) return;
    setPool(p => [...p, placed[idx]]);
    setPlaced(p => p.filter((_, i) => i !== idx));
  };

  const check = () => {
    if (placed.length !== words.length) return;
    const ok = placed.join(" ") === correctSentence;
    setFeedback(ok ? "correct" : "wrong");
    setTimeout(() => onAnswer(ok), ok ? 600 : 2000);
  };

  const reset = () => {
    if (feedback) return;
    setPool(scrambled);
    setPlaced([]);
  };

  return (
    <main className="max-w-md mx-auto px-4 py-8 flex flex-col items-center gap-5">
      {streak >= 2 && (
        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-3 py-1 text-orange-700 font-bold text-sm">
          <Zap className="w-4 h-4 fill-orange-400" /> רצף {streak}!
        </div>
      )}

      <div className="text-sm text-gray-500 text-center">{hint}</div>

      {/* Placed words area */}
      <div className="bg-white rounded-2xl border-2 border-sky-200 shadow-sm p-4 w-full min-h-[60px]" dir="ltr">
        {placed.length === 0 ? (
          <div className="text-gray-300 text-center text-sm py-2">לחצו על המילים לפי הסדר הנכון</div>
        ) : (
          <div className="flex flex-wrap gap-2 justify-center">
            {placed.map((w, i) => (
              <button
                key={`placed-${i}`}
                onClick={() => removeWord(i)}
                disabled={feedback !== null}
                className={`px-3 py-1.5 rounded-xl font-semibold text-base transition-all border-2 ${
                  feedback === "correct" ? "bg-green-50 border-green-400 text-green-800" :
                  feedback === "wrong" ? "bg-red-50 border-red-400 text-red-700" :
                  "bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100 cursor-pointer"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Word pool */}
      <div className="flex flex-wrap gap-2 justify-center" dir="ltr">
        {pool.map((w, i) => (
          <button
            key={`pool-${i}`}
            onClick={() => addWord(i)}
            disabled={feedback !== null}
            className="px-3 py-1.5 rounded-xl font-semibold text-base bg-white border-2 border-gray-200 text-gray-700 hover:border-sky-300 hover:bg-sky-50 transition-all cursor-pointer"
          >
            {w}
          </button>
        ))}
      </div>

      {feedback === "wrong" && (
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">הסדר הנכון:</p>
          <p className="text-lg font-bold text-green-700" dir="ltr">{correctSentence}</p>
        </div>
      )}

      <div className="flex gap-3 w-full max-w-xs">
        {!feedback && (
          <Button
            variant="outline"
            onClick={reset}
            disabled={placed.length === 0}
            className="flex-1 h-11 rounded-2xl border-gray-200 text-gray-600"
          >
            איפוס
          </Button>
        )}
        <Button
          onClick={check}
          disabled={placed.length !== words.length || feedback !== null}
          className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold"
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

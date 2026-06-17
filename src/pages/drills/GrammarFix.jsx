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

const GRADE_ORDER = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'"];
const gradeUp = (grade) => {
  const idx = GRADE_ORDER.indexOf(grade);
  return idx >= 0 && idx < GRADE_ORDER.length - 1 ? GRADE_ORDER[idx + 1] : grade;
};

const GRAMMAR_BY_GRADE = {
  "א'": [
    { sentence: "I ___ a boy.", answer: "am", hint: "אני (להיות)", options: ["am", "is", "are"] },
    { sentence: "She ___ happy.", answer: "is", hint: "היא (להיות)", options: ["am", "is", "are"] },
    { sentence: "They ___ friends.", answer: "are", hint: "הם (להיות)", options: ["am", "is", "are"] },
    { sentence: "He ___ a cat.", answer: "has", hint: "יש לו", options: ["has", "have", "is"] },
    { sentence: "I ___ a dog.", answer: "have", hint: "יש לי", options: ["has", "have", "is"] },
    { sentence: "This is ___ apple.", answer: "an", hint: "תפוח (a/an)", options: ["a", "an", "the"] },
    { sentence: "This is ___ book.", answer: "a", hint: "ספר (a/an)", options: ["a", "an", "the"] },
    { sentence: "The cat ___ small.", answer: "is", hint: "החתול (להיות)", options: ["am", "is", "are"] },
    { sentence: "We ___ in school.", answer: "are", hint: "אנחנו (להיות)", options: ["am", "is", "are"] },
    { sentence: "It ___ big.", answer: "is", hint: "זה (להיות)", options: ["am", "is", "are"] },
    { sentence: "___ you happy?", answer: "Are", hint: "האם אתה (להיות)", options: ["Am", "Is", "Are"] },
    { sentence: "I ___ not sad.", answer: "am", hint: "אני לא (להיות)", options: ["am", "is", "are"] },
    { sentence: "She ___ two cats.", answer: "has", hint: "יש לה", options: ["has", "have", "is"] },
    { sentence: "We ___ three books.", answer: "have", hint: "יש לנו", options: ["has", "have", "is"] },
    { sentence: "This is ___ egg.", answer: "an", hint: "ביצה (a/an)", options: ["a", "an", "the"] },
  ],
  "ב'": [
    { sentence: "She ___ to school.", answer: "goes", hint: "היא הולכת", options: ["go", "goes", "going"] },
    { sentence: "I ___ every day.", answer: "play", hint: "אני משחק", options: ["play", "plays", "playing"] },
    { sentence: "He ___ milk.", answer: "drinks", hint: "הוא שותה", options: ["drink", "drinks", "drinking"] },
    { sentence: "They ___ in the park.", answer: "run", hint: "הם רצים", options: ["run", "runs", "running"] },
    { sentence: "The dog ___ fast.", answer: "runs", hint: "הכלב רץ", options: ["run", "runs", "running"] },
    { sentence: "I ___ reading now.", answer: "am", hint: "אני קורא עכשיו", options: ["am", "is", "are"] },
    { sentence: "She ___ eating.", answer: "is", hint: "היא אוכלת עכשיו", options: ["am", "is", "are"] },
    { sentence: "We ___ playing.", answer: "are", hint: "אנחנו משחקים עכשיו", options: ["am", "is", "are"] },
    { sentence: "Do you ___ English?", answer: "speak", hint: "האם אתה מדבר", options: ["speak", "speaks", "speaking"] },
    { sentence: "Does she ___ cake?", answer: "like", hint: "האם היא אוהבת", options: ["like", "likes", "liking"] },
    { sentence: "My mom ___ well.", answer: "cooks", hint: "אמא שלי מבשלת", options: ["cook", "cooks", "cooking"] },
    { sentence: "The birds ___ in the sky.", answer: "fly", hint: "הציפורים עפות", options: ["fly", "flies", "flying"] },
    { sentence: "He ___ sleeping now.", answer: "is", hint: "הוא ישן עכשיו", options: ["am", "is", "are"] },
    { sentence: "___ she your sister?", answer: "Is", hint: "האם היא", options: ["Am", "Is", "Are"] },
    { sentence: "The children ___ happy.", answer: "are", hint: "הילדים (להיות)", options: ["am", "is", "are"] },
  ],
  "ג'": [
    { sentence: "I ___ to the store yesterday.", answer: "went", hint: "הלכתי (עבר)", options: ["go", "went", "going"] },
    { sentence: "She ___ a picture last night.", answer: "drew", hint: "היא ציירה (עבר)", options: ["draw", "drew", "draws"] },
    { sentence: "We ___ pizza yesterday.", answer: "ate", hint: "אכלנו (עבר)", options: ["eat", "ate", "eating"] },
    { sentence: "He ___ the book last week.", answer: "read", hint: "הוא קרא (עבר)", options: ["read", "reads", "reading"] },
    { sentence: "They ___ to music.", answer: "listened", hint: "הם הקשיבו (עבר)", options: ["listen", "listened", "listening"] },
    { sentence: "I ___ play tomorrow.", answer: "will", hint: "אני אשחק (עתיד)", options: ["will", "was", "did"] },
    { sentence: "She ___ not come yesterday.", answer: "did", hint: "היא לא באה (עבר)", options: ["do", "did", "does"] },
    { sentence: "There ___ many children.", answer: "are", hint: "יש הרבה ילדים", options: ["is", "are", "was"] },
    { sentence: "There ___ a cat on the roof.", answer: "is", hint: "יש חתול (יחיד)", options: ["is", "are", "was"] },
    { sentence: "I ___ already finished.", answer: "have", hint: "כבר סיימתי", options: ["have", "has", "had"] },
    { sentence: "She ___ never seen snow.", answer: "has", hint: "היא מעולם לא ראתה", options: ["have", "has", "had"] },
    { sentence: "The flowers ___ beautiful.", answer: "are", hint: "הפרחים (להיות)", options: ["is", "are", "was"] },
    { sentence: "He ___ his homework every day.", answer: "does", hint: "הוא עושה (הווה)", options: ["do", "does", "did"] },
    { sentence: "We ___ see a movie last Friday.", answer: "didn't", hint: "לא ראינו (עבר שלילי)", options: ["don't", "didn't", "doesn't"] },
    { sentence: "My father ___ a teacher.", answer: "is", hint: "אבא שלי (להיות)", options: ["am", "is", "are"] },
  ],
  "ד'": [
    { sentence: "If it rains, I ___ stay home.", answer: "will", hint: "אם ירד גשם, אני (עתיד)", options: ["will", "would", "was"] },
    { sentence: "She ___ been waiting for an hour.", answer: "has", hint: "היא חיכתה (הווה מושלם)", options: ["has", "have", "had"] },
    { sentence: "They ___ playing when it started raining.", answer: "were", hint: "הם שיחקו כש... (עבר מתמשך)", options: ["was", "were", "are"] },
    { sentence: "He ___ to school by bus every day.", answer: "goes", hint: "הוא נוסע (הרגל)", options: ["go", "goes", "going"] },
    { sentence: "I have ___ seen that movie.", answer: "already", hint: "כבר ראיתי", options: ["already", "yet", "never"] },
    { sentence: "She hasn't finished ___.", answer: "yet", hint: "היא עוד לא סיימה", options: ["already", "yet", "never"] },
    { sentence: "The cake was ___ by my mom.", answer: "made", hint: "העוגה הוכנה (סביל)", options: ["make", "made", "making"] },
    { sentence: "This is the ___ book I've ever read.", answer: "best", hint: "הספר הכי טוב", options: ["good", "better", "best"] },
    { sentence: "She is ___ than her sister.", answer: "taller", hint: "היא גבוהה יותר", options: ["tall", "taller", "tallest"] },
    { sentence: "He runs ___ than me.", answer: "faster", hint: "הוא רץ מהר יותר", options: ["fast", "faster", "fastest"] },
    { sentence: "I ___ never been to London.", answer: "have", hint: "מעולם לא הייתי", options: ["have", "has", "had"] },
    { sentence: "The homework ___ be finished by tomorrow.", answer: "must", hint: "חייב להיגמר", options: ["must", "can", "may"] },
    { sentence: "You ___ ask before you take.", answer: "should", hint: "כדאי שתשאל", options: ["should", "would", "could"] },
    { sentence: "He ___ swim when he was five.", answer: "could", hint: "הוא יכול היה (עבר)", options: ["can", "could", "will"] },
    { sentence: "___ I open the window?", answer: "May", hint: "האם מותר לי", options: ["May", "Must", "Will"] },
  ],
  "ה'": [
    { sentence: "By the time we arrived, the movie ___.", answer: "had started", hint: "הסרט כבר התחיל (עבר מושלם)", options: ["has started", "had started", "started"] },
    { sentence: "If I ___ rich, I would travel.", answer: "were", hint: "אם הייתי (תנאי)", options: ["was", "were", "am"] },
    { sentence: "She asked me ___ I was going.", answer: "where", hint: "היא שאלה לאן", options: ["where", "what", "when"] },
    { sentence: "The book ___ was on the table is mine.", answer: "that", hint: "הספר ש... (מילת קישור)", options: ["that", "what", "where"] },
    { sentence: "Neither the cat ___ the dog was outside.", answer: "nor", hint: "לא... וגם לא...", options: ["nor", "or", "and"] },
    { sentence: "He told me ___ he liked the movie.", answer: "that", hint: "הוא אמר לי ש...", options: ["that", "what", "which"] },
    { sentence: "She ___ studying English since 2020.", answer: "has been", hint: "היא לומדת מאז (הווה מושלם מתמשך)", options: ["has been", "had been", "was"] },
    { sentence: "The letter ___ written by hand.", answer: "was", hint: "המכתב נכתב (סביל עבר)", options: ["was", "were", "is"] },
    { sentence: "I wish I ___ fly.", answer: "could", hint: "הלוואי שיכולתי", options: ["can", "could", "will"] },
    { sentence: "Not only is she smart, ___ she is kind.", answer: "but", hint: "לא רק... אלא גם", options: ["but", "and", "or"] },
    { sentence: "He ___ rather stay home than go out.", answer: "would", hint: "הוא מעדיף (תנאי)", options: ["would", "will", "should"] },
    { sentence: "The students ___ to study for the test.", answer: "need", hint: "התלמידים צריכים", options: ["need", "needs", "needed"] },
    { sentence: "She speaks English ___ than French.", answer: "better", hint: "היא מדברת טוב יותר", options: ["good", "better", "best"] },
    { sentence: "This is the ___ difficult exam.", answer: "most", hint: "הכי קשה (שם תואר ארוך)", options: ["more", "most", "much"] },
    { sentence: "I don't know ___ to do.", answer: "what", hint: "אני לא יודע מה", options: ["what", "that", "which"] },
  ],
  "ו'": [
    { sentence: "Had I known, I ___ have helped.", answer: "would", hint: "אילו ידעתי, הייתי (תנאי 3)", options: ["would", "will", "could"] },
    { sentence: "The report ___ submitted by Friday.", answer: "must be", hint: "הדו״ח חייב להיות מוגש (סביל)", options: ["must be", "must", "must have"] },
    { sentence: "She ___ to the party unless she finishes.", answer: "won't go", hint: "היא לא תלך אלא אם (תנאי)", options: ["won't go", "didn't go", "doesn't go"] },
    { sentence: "___ having studied hard, he failed.", answer: "Despite", hint: "למרות ש...", options: ["Despite", "Because", "Although"] },
    { sentence: "The more you practice, the ___ you get.", answer: "better", hint: "ככל שמתרגלים יותר...", options: ["better", "best", "good"] },
    { sentence: "He suggested ___ we leave early.", answer: "that", hint: "הוא הציע ש...", options: ["that", "what", "which"] },
    { sentence: "I ___ rather not discuss it.", answer: "would", hint: "הייתי מעדיף שלא", options: ["would", "will", "should"] },
    { sentence: "The project, ___ took two years, is done.", answer: "which", hint: "הפרויקט, ש... (מילת קישור)", options: ["which", "what", "that"] },
    { sentence: "Hardly ___ he arrived when it started.", answer: "had", hint: "בקושי הגיע כש... (היפוך)", options: ["had", "has", "did"] },
    { sentence: "She acts as ___ she were the boss.", answer: "if", hint: "היא מתנהגת כאילו", options: ["if", "though", "when"] },
    { sentence: "It is essential that he ___ on time.", answer: "be", hint: "חיוני שהוא יהיה (subjunctive)", options: ["be", "is", "was"] },
    { sentence: "I look forward ___ hearing from you.", answer: "to", hint: "אני מצפה ל...", options: ["to", "for", "at"] },
    { sentence: "She is used ___ waking up early.", answer: "to", hint: "היא רגילה ל...", options: ["to", "for", "at"] },
    { sentence: "He insisted ___ paying the bill.", answer: "on", hint: "הוא התעקש ל... (מילת יחס)", options: ["on", "in", "at"] },
    { sentence: "We should take ___ account the risks.", answer: "into", hint: "לקחת בחשבון", options: ["into", "in", "on"] },
  ],
};

GRAMMAR_BY_GRADE["ז'"] = GRAMMAR_BY_GRADE["ו'"];
GRAMMAR_BY_GRADE["ח'"] = GRAMMAR_BY_GRADE["ו'"];

const grammarFor = (grade) =>
  GRAMMAR_BY_GRADE[grade] || GRAMMAR_BY_GRADE["ד'"];

export default function GrammarFix() {
  const navigate = useNavigate();
  useStudent();
  const theme = themeTokens();

  useEffect(() => {
    localStorage.removeItem("practice_context");
    localStorage.removeItem("exam_context");
  }, []);

  const difficulty = useMemo(readDifficulty, []);
  const DRILLS_PER_SESSION = DRILLS_BY_DIFF[difficulty] || 10;

  const problems = useMemo(() => {
    const grade = difficulty === "hard" ? gradeUp(STUDENT.grade) : STUDENT.grade;
    return shuffle(grammarFor(grade)).slice(0, DRILLS_PER_SESSION);
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
          <h1 className="font-bold text-sky-700">דקדוק אנגלי 🔧</h1>
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
        <GrammarCard
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

function GrammarCard({ problem, streak, onAnswer }) {
  useStudent();
  const { sentence, answer, hint, options } = problem;
  const shuffledOptions = useMemo(() => shuffle(options), [options]);

  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const parts = sentence.split("___");

  const handleSelect = (opt) => {
    if (feedback) return;
    setSelected(opt);
    const ok = opt === answer;
    setFeedback(ok ? "correct" : "wrong");
    setTimeout(() => onAnswer(ok), ok ? 600 : 1400);
  };

  const optionClass = (opt) => {
    const base = "rounded-2xl px-6 py-3 font-bold text-lg transition-all duration-200 border-2";
    if (feedback && opt === answer) return `${base} bg-green-50 border-green-400 text-green-800`;
    if (feedback === "wrong" && opt === selected) return `${base} bg-red-50 border-red-400 text-red-700`;
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
          {parts[0]}<span className="inline-block min-w-[60px] border-b-4 border-sky-300 mx-1">
            {feedback ? <span className={feedback === "correct" ? "text-green-600" : "text-red-500"}>{selected}</span> : " "}
          </span>{parts[1]}
        </div>
        <div className="text-sm text-gray-400 mt-2">{hint}</div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 w-full">
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

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

const CONFUSING_BY_GRADE = {
  "א'": [
    { sentence: "I have ___ cats.", answer: "two", options: ["two", "to", "too"], hint: "יש לי שתי חתולות (מספר)", rule: "two = 2 (מספר), to = ל (מילת יחס), too = גם / יותר מדי" },
    { sentence: "I want ___ play.", answer: "to", options: ["two", "to", "too"], hint: "אני רוצה ל... (מילת יחס)", rule: "two = 2, to = ל (מילת יחס), too = גם / יותר מדי" },
    { sentence: "I am happy ___!", answer: "too", options: ["two", "to", "too"], hint: "גם אני שמח!", rule: "two = 2, to = ל, too = גם / יותר מדי" },
    { sentence: "This is ___ book.", answer: "a", options: ["a", "an"], hint: "זה ספר (עיצור)", rule: "a = לפני עיצור (book, cat), an = לפני תנועה (apple, egg)" },
    { sentence: "This is ___ apple.", answer: "an", options: ["a", "an"], hint: "זה תפוח (תנועה)", rule: "a = לפני עיצור, an = לפני תנועה (a, e, i, o, u)" },
    { sentence: "This is ___ egg.", answer: "an", options: ["a", "an"], hint: "זו ביצה (תנועה)", rule: "a = עיצור, an = תנועה" },
    { sentence: "This is ___ dog.", answer: "a", options: ["a", "an"], hint: "זה כלב (עיצור)", rule: "a = עיצור, an = תנועה" },
    { sentence: "I ___ happy.", answer: "am", options: ["am", "is", "are"], hint: "אני שמח (I + ?)", rule: "I am, he/she/it is, we/you/they are" },
    { sentence: "She ___ nice.", answer: "is", options: ["am", "is", "are"], hint: "היא נחמדה (she + ?)", rule: "I am, he/she/it is, we/you/they are" },
    { sentence: "They ___ here.", answer: "are", options: ["am", "is", "are"], hint: "הם כאן (they + ?)", rule: "I am, he/she/it is, we/you/they are" },
  ],
  "ב'": [
    { sentence: "___ going to the park.", answer: "They're", options: ["They're", "Their", "There"], hint: "הם הולכים (they are)", rule: "They're = They are, Their = שלהם, There = שם" },
    { sentence: "I like ___ dog.", answer: "their", options: ["they're", "their", "there"], hint: "אני אוהב את הכלב שלהם", rule: "They're = They are, Their = שלהם, There = שם" },
    { sentence: "The book is over ___.", answer: "there", options: ["they're", "their", "there"], hint: "הספר שם (מקום)", rule: "They're = They are, Their = שלהם, There = שם" },
    { sentence: "___ my best friend.", answer: "You're", options: ["You're", "Your"], hint: "אתה החבר הכי טוב שלי (you are)", rule: "You're = You are, Your = שלך" },
    { sentence: "Is this ___ bag?", answer: "your", options: ["you're", "your"], hint: "זו התיק שלך?", rule: "You're = You are, Your = שלך" },
    { sentence: "___ a sunny day.", answer: "It's", options: ["It's", "Its"], hint: "זה יום שמשי (it is)", rule: "It's = It is, Its = שלו (של דבר)" },
    { sentence: "The cat licked ___ paw.", answer: "its", options: ["it's", "its"], hint: "החתול ליקק את הכף שלו", rule: "It's = It is, Its = שלו (שייכות)" },
    { sentence: "I am ___ than you.", answer: "taller", options: ["taller", "more tall"], hint: "אני גבוה יותר ממך", rule: "Short adjectives: add -er (taller, faster). Long adjectives: use more (more beautiful)" },
    { sentence: "She is ___ than the movie.", answer: "more interesting", options: ["more interesting", "interestinger"], hint: "היא מעניינת יותר מהסרט", rule: "Short: -er. Long (3+ syllables): more + adjective" },
    { sentence: "He can sing ___ than me.", answer: "better", options: ["better", "more good", "gooder"], hint: "הוא שר טוב יותר ממני", rule: "good → better → best (irregular!)" },
  ],
  "ג'": [
    { sentence: "She ___ her homework yesterday.", answer: "did", options: ["did", "does", "do"], hint: "היא עשתה (עבר)", rule: "do/does = הווה, did = עבר" },
    { sentence: "I ___ not like spinach.", answer: "do", options: ["do", "does", "did"], hint: "אני לא אוהב (הווה, I)", rule: "I/you/we/they do, he/she/it does" },
    { sentence: "He ___ not want to go.", answer: "does", options: ["do", "does", "did"], hint: "הוא לא רוצה (הווה, he)", rule: "I/you/we/they do, he/she/it does" },
    { sentence: "I have ___ friends than her.", answer: "fewer", options: ["fewer", "less"], hint: "יש לי פחות חברים (ספיר)", rule: "fewer = countable (friends, books), less = uncountable (water, time)" },
    { sentence: "There is ___ water in the glass.", answer: "less", options: ["fewer", "less"], hint: "יש פחות מים (לא ספיר)", rule: "fewer = ספיר, less = לא ספיר" },
    { sentence: "She is taller ___ me.", answer: "than", options: ["than", "then"], hint: "היא גבוהה יותר ממני (השוואה)", rule: "than = מ... (השוואה), then = אז (זמן)" },
    { sentence: "First eat, ___ play.", answer: "then", options: ["than", "then"], hint: "קודם תאכל, אז תשחק (זמן)", rule: "than = השוואה, then = אז (סדר זמנים)" },
    { sentence: "The movie was very ___.", answer: "good", options: ["good", "well"], hint: "הסרט היה טוב (שם תואר)", rule: "good = adjective (a good book), well = adverb (she sings well)" },
    { sentence: "She sings very ___.", answer: "well", options: ["good", "well"], hint: "היא שרה טוב (תואר הפועל)", rule: "good = שם תואר, well = תואר הפועל" },
    { sentence: "I ___ my keys at home.", answer: "left", options: ["left", "forgot", "leaved"], hint: "השארתי את המפתחות בבית", rule: "leave → left (irregular), forget → forgot (irregular)" },
  ],
  "ד'": [
    { sentence: "The weather will ___ our plans.", answer: "affect", options: ["affect", "effect"], hint: "מזג האוויר ישפיע על (פועל)", rule: "affect = verb (to affect), effect = noun (the effect)" },
    { sentence: "The ___ was amazing.", answer: "effect", options: ["affect", "effect"], hint: "ההשפעה הייתה מדהימה (שם עצם)", rule: "affect = פועל, effect = שם עצם" },
    { sentence: "Can I have a ___ of cake?", answer: "piece", options: ["piece", "peace"], hint: "חתיכת עוגה", rule: "piece = חתיכה, peace = שלום" },
    { sentence: "We want world ___.", answer: "peace", options: ["piece", "peace"], hint: "אנחנו רוצים שלום", rule: "piece = חתיכה, peace = שלום" },
    { sentence: "I need your ___.", answer: "advice", options: ["advice", "advise"], hint: "אני צריך את העצה שלך (שם עצם)", rule: "advice = noun (עצה), advise = verb (לייעץ)" },
    { sentence: "I ___ you to study.", answer: "advise", options: ["advice", "advise"], hint: "אני ממליץ לך (פועל)", rule: "advice = שם עצם, advise = פועל" },
    { sentence: "The ___ is very important.", answer: "principal", options: ["principal", "principle"], hint: "המנהל חשוב מאוד (אדם)", rule: "principal = מנהל/ראשי, principle = עיקרון" },
    { sentence: "It is a basic ___.", answer: "principle", options: ["principal", "principle"], hint: "זה עיקרון בסיסי", rule: "principal = מנהל, principle = עיקרון" },
    { sentence: "I ___ the test.", answer: "passed", options: ["passed", "past"], hint: "עברתי את המבחן (פועל)", rule: "passed = verb (עבר), past = noun/adj (העבר)" },
    { sentence: "In the ___, life was different.", answer: "past", options: ["passed", "past"], hint: "בעבר החיים היו שונים (שם עצם)", rule: "passed = פועל, past = שם עצם" },
  ],
  "ה'": [
    { sentence: "I will ___ your gift.", answer: "accept", options: ["accept", "except"], hint: "אקבל את המתנה שלך (פועל)", rule: "accept = לקבל, except = חוץ מ" },
    { sentence: "Everyone came ___ Tom.", answer: "except", options: ["accept", "except"], hint: "כולם באו חוץ מ...", rule: "accept = לקבל, except = חוץ מ" },
    { sentence: "The ___ was very clear.", answer: "weather", options: ["weather", "whether"], hint: "מזג האוויר היה נקי", rule: "weather = מזג אוויר, whether = האם (שאלה)" },
    { sentence: "I don't know ___ to go.", answer: "whether", options: ["weather", "whether"], hint: "אני לא יודע אם ללכת", rule: "weather = מזג אוויר, whether = האם" },
    { sentence: "Who is ___?", answer: "there", options: ["there", "their", "they're"], hint: "מי שם?", rule: "there = שם, their = שלהם, they're = they are" },
    { sentence: "___ very tired today.", answer: "They're", options: ["There", "Their", "They're"], hint: "הם עייפים (they are)", rule: "there = שם, their = שלהם, they're = they are" },
    { sentence: "___ books are on the table.", answer: "Their", options: ["There", "Their", "They're"], hint: "הספרים שלהם על השולחן", rule: "there = שם, their = שלהם, they're = they are" },
    { sentence: "She gave me good ___.", answer: "advice", options: ["advice", "advise"], hint: "היא נתנה לי עצה (שם עצם)", rule: "advice (noun) = עצה, advise (verb) = לייעץ" },
    { sentence: "I would ___ you to wait.", answer: "advise", options: ["advice", "advise"], hint: "הייתי ממליץ לך (פועל)", rule: "advice (noun), advise (verb)" },
    { sentence: "The ___ reason is money.", answer: "principal", options: ["principal", "principle"], hint: "הסיבה העיקרית (ראשי)", rule: "principal = עיקרי/מנהל, principle = עיקרון" },
  ],
  "ו'": [
    { sentence: "His behavior was ___.", answer: "discreet", options: ["discreet", "discrete"], hint: "ההתנהגות שלו הייתה זהירה/עדינה", rule: "discreet = זהיר/חשאי, discrete = נפרד/בדיד" },
    { sentence: "These are two ___ issues.", answer: "discrete", options: ["discreet", "discrete"], hint: "אלה שני נושאים נפרדים", rule: "discreet = זהיר, discrete = נפרד" },
    { sentence: "She tried to ___ that nothing happened.", answer: "imply", options: ["imply", "infer"], hint: "היא ניסתה לרמוז (הדובר רומז)", rule: "imply = לרמוז (speaker), infer = להסיק (listener)" },
    { sentence: "From his words, I ___ that he was lying.", answer: "infer", options: ["imply", "infer"], hint: "הסקתי שהוא שיקר (השומע מסיק)", rule: "imply = לרמוז, infer = להסיק" },
    { sentence: "The new law will ___ everyone.", answer: "affect", options: ["affect", "effect"], hint: "החוק החדש ישפיע על כולם", rule: "affect = verb, effect = noun (usually)" },
    { sentence: "We need to ___ a change.", answer: "effect", options: ["affect", "effect"], hint: "אנחנו צריכים לחולל שינוי (פועל נדיר)", rule: "effect as verb = לחולל/להגשים (formal)" },
    { sentence: "I need to ___ my essay.", answer: "revise", options: ["revise", "review"], hint: "אני צריך לתקן/לשפר את החיבור", rule: "revise = לתקן/לשנות, review = לסקור/לבדוק" },
    { sentence: "Please ___ the document before signing.", answer: "review", options: ["revise", "review"], hint: "בבקשה עברו על המסמך לפני החתימה", rule: "revise = לשנות, review = לעבור/לסקור" },
    { sentence: "The sunset was a ___ sight.", answer: "beautiful", options: ["beautiful", "beauteous"], hint: "השקיעה הייתה מראה יפה (נפוץ)", rule: "beautiful = common usage, beauteous = literary/archaic" },
    { sentence: "She is the ___ of the two sisters.", answer: "elder", options: ["elder", "older"], hint: "היא הבכורה מבין שתי האחיות (משפחה)", rule: "elder = for family members, older = general comparison" },
  ],
};

CONFUSING_BY_GRADE["ז'"] = CONFUSING_BY_GRADE["ו'"];
CONFUSING_BY_GRADE["ח'"] = CONFUSING_BY_GRADE["ו'"];

const confusingFor = (grade) =>
  CONFUSING_BY_GRADE[grade] || CONFUSING_BY_GRADE["ד'"];

export default function ConfusingWords() {
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
    return shuffle(confusingFor(grade)).slice(0, DRILLS_PER_SESSION);
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
          <h1 className="font-bold text-sky-700">מילים מבלבלות 🤔</h1>
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
        <ConfusingCard
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

function ConfusingCard({ problem, streak, onAnswer }) {
  useStudent();
  const { sentence, answer, options, hint, rule } = problem;
  const shuffledOptions = useMemo(() => shuffle(options), [options]);

  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const parts = sentence.split("___");

  const handleSelect = (opt) => {
    if (feedback) return;
    setSelected(opt);
    const ok = opt.toLowerCase() === answer.toLowerCase();
    setFeedback(ok ? "correct" : "wrong");
    setTimeout(() => onAnswer(ok), ok ? 600 : 2200);
  };

  const optionClass = (opt) => {
    const base = "rounded-2xl px-5 py-3 font-bold text-lg transition-all duration-200 border-2";
    if (feedback && opt.toLowerCase() === answer.toLowerCase()) return `${base} bg-green-50 border-green-400 text-green-800`;
    if (feedback === "wrong" && opt === selected) return `${base} bg-red-50 border-red-400 text-red-700`;
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

      <div className="bg-white rounded-3xl border-2 border-sky-200 shadow-sm px-6 py-6 w-full text-center">
        <div className="text-2xl sm:text-3xl font-black text-sky-800 mb-2" dir="ltr">
          {parts[0]}<span className="inline-block min-w-[50px] border-b-4 border-sky-300 mx-1">
            {feedback ? <span className={feedback === "correct" ? "text-green-600" : "text-red-500"}>{selected}</span> : " "}
          </span>{parts[1]}
        </div>
        <div className="text-sm text-gray-400">{hint}</div>
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

      {feedback && (
        <div className={`rounded-2xl p-4 w-full text-center text-sm ${
          feedback === "correct" ? "bg-green-50 border border-green-200 text-green-700" : "bg-amber-50 border border-amber-200 text-amber-800"
        }`}>
          <span className="font-semibold">💡 כלל: </span>{rule}
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

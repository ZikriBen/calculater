import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { ArrowRight, Star, CheckCircle2, XCircle, Lightbulb, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { STUDENT, genderGuide, teacherRole, exampleHint, themeTokens, useStudent } from "@/lib/student";
import { topicsForGrade, CURRICULUM } from "@/lib/curriculum";

const pickVariety = (diff) => {
  const pool = topicsForGrade(STUDENT.grade, diff);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
};

const DIFFICULTIES = ["easy", "medium", "hard"];
const DIFF_CONFIG = {
  easy:   { label: "קל",     emoji: "🟢", color: "from-green-400 to-emerald-400",  bg: "bg-green-50",   border: "border-green-200",  badge: "bg-green-100 text-green-800" },
  medium: { label: "בינוני", emoji: "🟡", color: "from-yellow-400 to-amber-400",   bg: "bg-yellow-50",  border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-800" },
  hard:   { label: "מאתגר",  emoji: "🔴", color: "from-red-400 to-rose-400",       bg: "bg-red-50",     border: "border-red-200",    badge: "bg-red-100 text-red-800" },
};

const TOPIC_GLOSSARY = `מילון נושאים (עברית בית-ספר):
- "פילוג" = שיטה לכפל על ידי פיצול מספר לפי ערכי מקום. למשל 143×2 = 100×2 + 40×2 + 3×2 = 200+80+6 = 286. תרגיל פילוג = מראים את הפיצול במפורש, לא רק מבקשים תשובה.
- "חוק החילוף" = a+b=b+a או a×b=b×a.
- "חוק הקיבוץ" = (a+b)+c = a+(b+c).
- "השלמה ל-10 / ל-100" = מציאת המספר המשלים לעגול קרוב.
- "בעיה מילולית" = שאלה בסיפור, דורשת הבנה ותרגום לחשבון.`;

const EXERCISE_PROMPT = (difficulty, examContext, variety, seed) => {
  const diffLabel = difficulty === 'easy' ? 'קל' : difficulty === 'medium' ? 'בינוני' : 'מאתגר';
  const hintRule = `לכל תרגיל הוסיפי "hint" — רמז קצר בעברית בגוף שני, משפט אחד עד 12 מילים, שמכוון את ${STUDENT.name} איך לגשת בלי לתת את התשובה. ${genderGuide()} דוגמה: ${exampleHint()}.`;
  const answerRule = `⚠️ כלל קריטי לשדה "answer":
- חובה שיהיה **רק המספר הסופי** (למשל "69", "286", "7.5").
- אסור לחלוטין ביטויים, סימני שוויון, הסברים, או פיצולים. לא "(20+3)×3=69" ולא "20×3 + 3×3 = 69".
- הסיבה: הילדה מזינה תשובה בודדת בתיבת קלט אחת. ההשוואה מול "answer" חייבת להצליח רק על המספר הסופי.
⚠️ כלל קריטי לשדה "question":
- אסור להכניס שדות למילוי בצורת "__" או "___" (אין UI לשדות משניים). יש רק תיבת תשובה אחת לתוצאה הסופית.
- אם מדובר בפילוג — כתבי את הנחיית הפיצול בתוך "hint", לא בתוך "question". ה-question יציג רק את השאלה הסופית, למשל "23 × 3 = ?".
- solution (אופציונלי) = מחרוזת הסבר הדרך המלאה ("23 × 3 = 20×3 + 3×3 = 60 + 9 = 69"). המשוב יציג אותה בסיום.`;
  const schemaLine = `החזר JSON בלבד: {"exercises": [{"question": "...", "answer": "מספר בלבד", "hint": "...", "solution": "(אופציונלי) הסבר הדרך"}, ...]}`;

  // Mode A: focused practice (exam context OR explicit chat request) — stay ON-topic.
  if (examContext) {
    const { topics, wrong_topics, wrong_examples } = examContext;
    const focusTopics = wrong_topics?.length ? wrong_topics : topics;
    const examplesText = wrong_examples?.length
      ? `\nהתרגילים שהיא טעתה בהם במבחן (השתמשי בהם כהשראה לסוג השאלות): ${wrong_examples.join(', ')}`
      : '';
    const isExamFlow = wrong_topics?.length || wrong_examples?.length;
    const contextIntro = isExamFlow
      ? `${STUDENT.name} הגישה מבחן. עליך לייצר תרגול מותאם אישית.`
      : `${STUDENT.name} ביקשה לתרגל נושא ספציפי.`;
    const topicRules = `
⚠️ כלל מחייב: כל 5 התרגילים חייבים להיות **באותו נושא שביקשה** (${focusTopics?.join(', ') || 'חשבון כללי'}). אסור לגמרי להכניס תרגילים מנושאים אחרים.
למשל: אם הנושא "בעיות מילוליות" — כל 5 התרגילים חייבים להיות בעיות מילוליות. אסור תרגיל חשבון ישיר כמו "3 × 4 =".
אם הנושא "כפל" — כל 5 התרגילים חייבים להיות תרגילי כפל. אסור לחיבור, חיסור או חילוק.

גיוון בתוך הנושא:
- שנו מספרים, הקשרים, וסיפורים בין התרגילים (אל תחזרו על אותם מספרים).
- גיוון מותר רק במסגרת הנושא — למשל בבעיות מילוליות: פעם חיבור, פעם חיסור, פעם בעיה דו-שלבית.
- זרע אקראיות: ${seed}.`;
    return `${teacherRole()}
${contextIntro}
נושא למיקוד: ${focusTopics?.join(', ') || 'חשבון כללי'}.${examplesText}
צרי בדיוק 5 תרגילים ברמה "${diffLabel}".

${TOPIC_GLOSSARY}

${topicRules}
${hintRule}
${schemaLine}
תרגילים קצרים וברורים.`;
  }

  // Mode B: default daily practice — mix of topics, diverse.
  const varietyLine = `כל תרגיל חייב להיות מסוג שונה. השתמשי בחמישה מהסוגים הבאים, כל תרגיל בסוג שונה: ${variety.join(' | ')}.`;
  const diversityRules = `
כללי גיוון חובה:
- שני תרגילים לא יחזרו על אותו סוג פעולה.
- אסור להשתמש באותם מספרים יותר מפעם אחת בכל הסט.
- גוון מבנה השאלה (לפעמים "7 × 8 =", לפעמים "כמה זה 12 + 15?", לפעמים בעיה מילולית קצרה בת משפט אחד).
- השתמשי במספרים מגוונים — אל תתחילי תמיד ב-10, 20, 100.
- זרע אקראיות: ${seed}.`;
  return `${teacherRole()}
צרי בדיוק 5 תרגילי חשבון ברמה "${diffLabel}" מתאימים לכיתה ${STUDENT.grade}.
${varietyLine}
${diversityRules}
${hintRule}
${schemaLine}
תרגילים קצרים וברורים. רק מספרים בתשובות.`;
};

const FEEDBACK_PROMPT = (answeredExercises) => `${teacherRole()} בדקי את תשובות ${STUDENT.name} ותני משוב ישיר, בגוף שני, בעברית.

${answeredExercises}

פורמט:
- משפט מעודד פתיחה בהתאם לכללי הלשון שצוינו
- לכל טעות: הסבר קצר מה הייתה הטעות
- עידוד לסיום
${genderGuide()}`;

export default function Practice() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("loading"); // loading | exercises | feedback | done | error
  const [errorMsg, setErrorMsg] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [exercises, setExercises] = useState([]);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState("");
  const [results, setResults] = useState([]); // [{correct: bool}]
  const [dayNumber, setDayNumber] = useState(() => parseInt(localStorage.getItem(STUDENT.dayStorageKey) || "1"));
  const [diffIndex, setDiffIndex] = useState(0);
  const [examContext, setExamContext] = useState(null);

  useEffect(() => {
    // Load context: prefer exam analysis, else a chat-requested practice topic.
    const examStored = localStorage.getItem("exam_context");
    const practiceStored = localStorage.getItem("practice_context");
    const ctx = examStored ? JSON.parse(examStored)
      : practiceStored ? JSON.parse(practiceStored)
      : null;

    // Some topics are handled by dedicated drill pages (no LLM).
    const allTopics = [...(ctx?.topics || []), ...(ctx?.wrong_topics || [])];
    const wantsVertical = allTopics.some(t => /כפל\s*מאונך/.test(t));
    if (wantsVertical) {
      // Leave context intact for the dedicated page to read and clear.
      navigate("/practice/vertical", { replace: true });
      return;
    }

    setExamContext(ctx);

    const startDiff = ctx?.difficulty || "easy";
    const startIdx = DIFFICULTIES.indexOf(startDiff);
    loadExercises(startDiff, startIdx >= 0 ? startIdx : 0, ctx);

    // Clear after use so next visit starts fresh
    localStorage.removeItem("exam_context");
    localStorage.removeItem("practice_context");
  }, []);

  const [openHints, setOpenHints] = useState({});

  const loadExercises = async (diff, idx, ctx = examContext) => {
    setPhase("loading");
    setAnswers({});
    setFeedback("");
    setResults([]);
    setOpenHints({});
    try {
      const variety = pickVariety(diff);
      const seed = Math.random().toString(36).slice(2, 10) + "-" + Date.now();
      const result = await api.integrations.Core.InvokeLLM({
        prompt: EXERCISE_PROMPT(diff, ctx, variety, seed),
        response_json_schema: {
          type: "object",
          properties: {
            exercises: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  answer: { type: "string", description: "FINAL numeric answer only, no expressions." },
                  hint: { type: "string" },
                  solution: { type: "string", description: "Optional step-by-step derivation, shown only in feedback." }
                }
              }
            }
          }
        }
      });
      setExercises(result.exercises || []);
      setDifficulty(diff);
      setDiffIndex(idx);
      setPhase("exercises");
    } catch (e) {
      console.error("[Practice] loadExercises failed:", e);
      console.error("[Practice] error details:", { message: e?.message, status: e?.status, stack: e?.stack });
      const techDetail = e?.message || String(e);
      const friendly = e?.status === 402
        ? "נגמרו קרדיטי ה-AI לחודש זה. יש לשדרג את החשבון בדאשבורד כדי להמשיך."
        : "אופס, משהו השתבש כאן 😕";
      setErrorMsg(`${friendly}\n\nפרטי השגיאה: ${techDetail}`);
      setPhase("error");
    }
  };

  const extractFinalNumber = (s) => {
    const str = String(s ?? "").replace(/,/g, "");
    const matches = str.match(/-?\d+(?:\.\d+)?/g);
    return matches ? matches[matches.length - 1] : str.trim();
  };

  const handleSubmit = async () => {
    setPhase("checking");
    const answeredList = exercises.map((ex, i) => {
      const userNum = extractFinalNumber(answers[i]);
      const correctNum = extractFinalNumber(ex.answer);
      return {
        question: ex.question,
        userAnswer: answers[i] || "?",
        correctAnswer: correctNum,
        solution: ex.solution || "",
        correct: userNum !== "" && Number(userNum) === Number(correctNum),
      };
    });

    setResults(answeredList);

    const answeredText = answeredList.map((a, i) =>
      `${i + 1}. ${a.question} → ${STUDENT.name} ענתה: ${a.userAnswer} | נכון: ${a.correctAnswer}`
    ).join('\n');

    try {
      const response = await api.integrations.Core.InvokeLLM({
        prompt: FEEDBACK_PROMPT(answeredText)
      });
      setFeedback(response);
      setPhase("feedback");
    } catch (e) {
      setFeedback(`כל הכבוד ${STUDENT.name}! ☺️`);
      setPhase("feedback");
    }
  };

  const handleNext = () => {
    const nextIdx = diffIndex + 1;
    if (nextIdx < DIFFICULTIES.length) {
      loadExercises(DIFFICULTIES[nextIdx], nextIdx);
    } else {
      // All done — bump day
      const newDay = dayNumber + 1;
      localStorage.setItem(STUDENT.dayStorageKey, String(newDay));
      setDayNumber(newDay);
      setPhase("done");
    }
  };

  const cfg = DIFF_CONFIG[difficulty];
  const score = results.filter(r => r.correct).length;
  useStudent();
  const theme = themeTokens();

  return (
    <div className={`min-h-screen ${theme.pageBg}`} dir="rtl">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-purple-500 hover:text-purple-700 text-sm font-medium transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה לשיחה
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1.5">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
              <span className="text-sm font-semibold text-yellow-700">יום {dayNumber}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">

        {/* LOADING */}
        {(phase === "loading" || phase === "checking") && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-3xl animate-bounce shadow-lg">
              {phase === "checking" ? "📝" : "🦋"}
            </div>
            <p className="text-purple-600 font-medium">
              {phase === "checking" ? "המורה בודקת את התרגילים עכשיו..." : "המורה מכינה תרגילים..."}
            </p>
          </div>
        )}

        {/* ERROR */}
        {phase === "error" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-4">
            <div className="text-5xl">😕</div>
            <p className="text-purple-800 font-semibold text-lg whitespace-pre-line max-w-lg">{errorMsg}</p>
            <p className="text-xs text-purple-400">(פתח את Console בדפדפן לפרטים מלאים)</p>
            <Button onClick={() => navigate("/")} variant="outline" className="rounded-2xl border-purple-200 text-purple-700">
              חזרה לשיחה
            </Button>
          </div>
        )}

        {/* EXERCISES */}
        {phase === "exercises" && (
          <div className="space-y-4">
            {/* Context banner */}
            {examContext?.summary && (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3 text-sm text-purple-700 flex gap-2 items-start">
                <span className="text-lg flex-shrink-0">🎯</span>
                <span>
                  {examContext.wrong_topics?.length || examContext.wrong_examples?.length
                    ? <>תרגול מותאם למבחן שלך: <strong>{examContext.summary}</strong></>
                    : <>תרגול לפי הבקשה שלך: <strong>{examContext.summary}</strong></>}
                </span>
              </div>
            )}
            {/* BIG Difficulty banner */}
            <div className={`rounded-3xl border-2 ${cfg.border} bg-gradient-to-r ${cfg.color} p-4 shadow-md`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{cfg.emoji}</span>
                  <div className="text-white drop-shadow-sm">
                    <div className="text-xs font-semibold opacity-90">רמת קושי</div>
                    <div className="text-2xl font-black">{cfg.label}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-white font-semibold opacity-90">שלב {diffIndex + 1} מתוך {DIFFICULTIES.length}</span>
                  <div className="flex gap-1.5">
                    {DIFFICULTIES.map((d, i) => (
                      <div key={d} className={`w-10 h-2.5 rounded-full transition-all ${
                        i < diffIndex ? "bg-white/90" : i === diffIndex ? "bg-white" : "bg-white/30"
                      }`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-purple-900">פתרי את התרגילים 📝</h2>

            <div className="space-y-3">
              {exercises.map((ex, i) => (
                <div key={i} className={`${cfg.bg} border-2 ${cfg.border} rounded-2xl p-4`}>
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400 font-bold text-sm flex-shrink-0 w-6">{i + 1}.</span>
                    <span className="flex-1 font-medium text-gray-800 text-base" dir="ltr" style={{ textAlign: 'left' }}>
                      {ex.question}
                    </span>
                    <span className="text-gray-400 text-sm flex-shrink-0">=</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={answers[i] || ""}
                      onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                      placeholder="?"
                      className="w-20 text-center border-2 border-purple-300 rounded-xl px-2 py-2 text-base font-bold focus:outline-none focus:border-purple-500 bg-white flex-shrink-0"
                      dir="ltr"
                    />
                  </div>
                  {ex.hint && (
                    <div className="mt-2 pr-9">
                      <button
                        type="button"
                        onClick={() => setOpenHints(h => ({ ...h, [i]: !h[i] }))}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-full px-3 py-1 transition-colors"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        רמז
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openHints[i] ? 'rotate-180' : ''}`} />
                      </button>
                      {openHints[i] && (
                        <div className="mt-2 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                          💡 {ex.hint}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < exercises.length}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-base mt-2"
            >
              ✅ שלחי לבדיקה
            </Button>
          </div>
        )}

        {/* FEEDBACK */}
        {phase === "feedback" && (
          <div className="space-y-4">
            {/* Score */}
            <div className="bg-white rounded-3xl border border-purple-100 shadow-sm p-6 text-center">
              <div className="text-5xl font-black text-purple-700 mb-1">{score}/{exercises.length}</div>
              <p className="text-purple-500 font-medium">
                {score === exercises.length ? "מושלם! כל התרגילים נכונים! 🌟" :
                 score >= exercises.length / 2 ? "כל הכבוד! עבודה טובה! 🎉" : "נסי שוב, אתי מצליחה! 💪"}
              </p>
            </div>

            {/* Per-exercise results */}
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i} className={`rounded-2xl px-4 py-3 border ${
                  r.correct ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                }`}>
                  <div className="flex items-center gap-3">
                    {r.correct
                      ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    }
                    <span className="flex-1 text-sm text-gray-700" dir="ltr" style={{ textAlign: 'left' }}>{r.question}</span>
                    <div className="flex items-center gap-2 flex-shrink-0 text-sm">
                      <span className={r.correct ? "text-green-600 font-bold" : "text-red-400 line-through"}>{r.userAnswer}</span>
                      {!r.correct && <span className="text-green-600 font-bold">{r.correctAnswer}</span>}
                    </div>
                  </div>
                  {!r.correct && r.solution && (
                    <div className="mt-2 pr-8 text-xs text-gray-600 bg-white/70 rounded-lg px-3 py-1.5" dir="ltr" style={{ textAlign: 'left' }}>
                      💡 {r.solution}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Feedback text */}
            {feedback && (
              <div className="bg-white rounded-2xl border border-purple-100 px-5 py-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🦋</span>
                  <span className="text-sm font-semibold text-purple-700">המורה אומרת:</span>
                </div>
                <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-strong:text-purple-800 prose-ul:my-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{feedback}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Next / Done */}
            {diffIndex + 1 < DIFFICULTIES.length ? (
              <Button
                onClick={handleNext}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-base"
              >
                קדימה לרמה {DIFF_CONFIG[DIFFICULTIES[diffIndex + 1]].emoji} {DIFF_CONFIG[DIFFICULTIES[diffIndex + 1]].label} →
              </Button>
            ) : (
              <Button onClick={handleNext} className="w-full h-12 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-bold text-base">
                🎉 סיימתי להיום!
              </Button>
            )}
          </div>
        )}

        {/* DONE */}
        {phase === "done" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
            <div className="text-7xl animate-bounce">🎉</div>
            <h2 className="text-3xl font-black text-purple-800">כל הכבוד {STUDENT.name}!</h2>
            <p className="text-purple-600 text-lg">סיימת את כל רמות הקושי ליום {dayNumber - 1}!</p>
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-5 py-2.5">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
              <span className="font-bold text-yellow-700">מחר ממשיכים ביום {dayNumber} 🌟</span>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
              <Button
                onClick={() => loadExercises("easy", 0)}
                variant="outline"
                className="rounded-2xl h-12 border-purple-200 text-purple-700 font-semibold"
              >
                🔁 עוד תרגול
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="rounded-2xl h-12 border-purple-200 text-purple-700 font-semibold"
              >
                💬 חזרה לשיחה
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
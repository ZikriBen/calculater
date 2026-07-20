// Dedicated מימ״ד session: two modes on top of the same LLM-generated
// question pool —
//   "exam"     — timed simulation, no feedback until the end, then a full
//                score + per-question review (real exam conditions).
//   "practice" — one question at a time, a real hint before answering, and
//                immediate correct/incorrect + full explanation after.
// Kept separate from the generic Practice.jsx engine: מימ״ד doesn't have an
// easy/medium/hard ladder, it's one fixed exam-calibrated difficulty across
// 3 mixed sections (כמותי / עברית / English).

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw, Star, Lightbulb, ChevronDown, CheckCircle2, XCircle, Clock, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { themeTokens, teacherRole, useStudent } from "@/lib/student";
import { useActiveTeacher } from "@/lib/teachers";
import { api } from "@/api/client";
import { buildMimadBatchPrompt, buildQuestionChatPrompt, MIMAD_SCHEMA } from "@/lib/mimadPrompt";

const dirFor = (s) => /[֐-׿]/.test(s || "") ? "rtl" : "ltr";

const normalize = (s) => String(s ?? "")
  .trim().toLowerCase()
  .replace(/[.,!?;:'"״׳`]/g, "")
  .replace(/\s+/g, " ");

const isCorrect = (q, given) => given != null && normalize(given) === normalize(q?.answer);

const fmtTime = (s) => {
  const total = Math.max(0, s ?? 0);
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const seed = () => Math.random().toString(36).slice(2, 10) + "-" + Date.now();

const TIMER_PRESETS = [
  { minutes: 10, questions: 6, label: "מהיר", sub: "10 דקות · 6 שאלות" },
  { minutes: 20, questions: 12, label: "בינוני", sub: "20 דקות · 12 שאלות" },
  { minutes: 45, questions: 24, label: "מלא", sub: "45 דקות · 24 שאלות" },
];

const PRACTICE_TOTAL = 15;
const BATCH_SIZE = 5;

export default function MimadSession() {
  const navigate = useNavigate();
  const teacher = useActiveTeacher();
  useStudent();
  const theme = themeTokens();

  const [mode, setMode] = useState(null); // "exam" | "practice"
  const [screen, setScreen] = useState("pick-mode"); // pick-mode | pick-timer | loading | running | done | error
  const [loadProgress, setLoadProgress] = useState({ done: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState("");

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [hintOpen, setHintOpen] = useState(false);

  const [totalSeconds, setTotalSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const timedOutRef = useRef(false);

  useEffect(() => {
    localStorage.removeItem("practice_context");
    localStorage.removeItem("exam_context");
  }, []);

  useEffect(() => {
    if (mode !== "exam" || screen !== "running" || timeLeft == null) return;
    if (timeLeft <= 0) {
      timedOutRef.current = true;
      setScreen("done");
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => (s == null ? s : s - 1)), 1000);
    return () => clearTimeout(t);
  }, [mode, screen, timeLeft]);

  const fetchBatch = async (count) => {
    const prompt = buildMimadBatchPrompt({
      teacherRoleText: teacherRole(teacher?.subjectLabels),
      systemPromptExtra: teacher?.systemPromptExtra || "",
      count,
      seed: seed(),
    });
    const result = await api.integrations.Core.InvokeLLM({ prompt, response_json_schema: MIMAD_SCHEMA });
    return result?.exercises || [];
  };

  const fetchAll = async (totalCount) => {
    const batches = Math.ceil(totalCount / BATCH_SIZE);
    setLoadProgress({ done: 0, total: batches });
    let collected = [];
    for (let b = 0; b < batches && collected.length < totalCount; b++) {
      const count = Math.min(BATCH_SIZE, totalCount - collected.length);
      const batch = await fetchBatch(count);
      collected = [...collected, ...batch];
      setLoadProgress({ done: b + 1, total: batches });
      if (batch.length === 0) break;
    }
    return collected.slice(0, totalCount);
  };

  const resetSessionState = () => {
    setIndex(0);
    setAnswers({});
    setRevealed({});
    setHintOpen(false);
    timedOutRef.current = false;
  };

  const startExam = async (preset) => {
    setMode("exam");
    resetSessionState();
    setScreen("loading");
    setErrorMsg("");
    try {
      const qs = await fetchAll(preset.questions);
      setQuestions(qs);
      setTotalSeconds(preset.minutes * 60);
      setTimeLeft(preset.minutes * 60);
      setScreen("running");
    } catch (e) {
      setErrorMsg(e?.message || String(e));
      setScreen("error");
    }
  };

  const startPractice = async () => {
    setMode("practice");
    resetSessionState();
    setScreen("loading");
    setErrorMsg("");
    try {
      const qs = await fetchAll(PRACTICE_TOTAL);
      setQuestions(qs);
      setScreen("running");
    } catch (e) {
      setErrorMsg(e?.message || String(e));
      setScreen("error");
    }
  };

  const handleSelect = (opt) => {
    if (mode === "practice" && revealed[index]) return;
    setAnswers((a) => ({ ...a, [index]: opt }));
    if (mode === "practice") setRevealed((r) => ({ ...r, [index]: true }));
  };

  const handleNext = () => {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      setHintOpen(false);
    } else {
      setScreen("done");
    }
  };

  const backToModes = () => {
    setMode(null);
    setScreen("pick-mode");
    setQuestions([]);
  };

  const score = questions.reduce((acc, q, i) => acc + (isCorrect(q, answers[i]) ? 1 : 0), 0);
  const current = questions[index];

  return (
    <div className={`min-h-screen ${theme.pageBg}`} dir="rtl">
      <header className="bg-white/70 backdrop-blur-md border-b border-violet-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/chat")}
            className="flex items-center gap-1.5 text-violet-500 hover:text-violet-700 text-sm font-medium transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה
          </button>
          <h1 className="font-bold text-violet-700">
            {mode === "exam" ? "סימולציית מבחן 🕐" : mode === "practice" ? "תרגול עם הסברים 📝" : "מימ״ד 🎯"}
          </h1>
          {screen === "running" && mode === "exam" && (
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 border font-bold text-sm ${
              timeLeft <= 60 ? "bg-red-50 border-red-200 text-red-700" : "bg-violet-50 border-violet-200 text-violet-700"
            }`}>
              <Clock className="w-4 h-4" />
              {fmtTime(timeLeft)}
            </div>
          )}
          {screen === "running" && mode === "practice" && (
            <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
              <span className="text-xs font-semibold text-yellow-700">{index + 1}/{questions.length}</span>
            </div>
          )}
          {(screen === "pick-mode" || screen === "pick-timer" || screen === "loading") && <div className="w-14" />}
        </div>
      </header>

      {screen === "pick-mode" && (
        <main className="max-w-md mx-auto px-4 py-10 flex flex-col gap-4">
          <h2 className="text-xl font-black text-violet-800 text-center mb-2">איך תרצה להתאמן היום?</h2>
          <button
            type="button"
            onClick={() => setScreen("pick-timer")}
            className="bg-white rounded-3xl border-2 border-violet-200 shadow-sm p-5 text-right hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="text-3xl mb-1">🕐</div>
            <div className="font-black text-lg text-violet-800">סימולציית מבחן</div>
            <div className="text-sm text-gray-500 mt-1">תנאי מבחן אמיתיים: טיימר, בלי משוב עד הסוף. בסיום — ציון וסקירה מלאה.</div>
          </button>
          <button
            type="button"
            onClick={startPractice}
            className="bg-white rounded-3xl border-2 border-violet-200 shadow-sm p-5 text-right hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="text-3xl mb-1">📝</div>
            <div className="font-black text-lg text-violet-800">תרגול עם הסברים</div>
            <div className="text-sm text-gray-500 mt-1">רמז אמיתי לפני כל שאלה, ותשובה + הסבר מלא מיד אחרי.</div>
          </button>
        </main>
      )}

      {screen === "pick-timer" && (
        <main className="max-w-md mx-auto px-4 py-10 flex flex-col gap-4">
          <h2 className="text-xl font-black text-violet-800 text-center mb-2">כמה זמן יש לך?</h2>
          {TIMER_PRESETS.map((p) => (
            <button
              key={p.minutes}
              type="button"
              onClick={() => startExam(p)}
              className="bg-white rounded-3xl border-2 border-violet-200 shadow-sm p-5 text-right hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-between"
            >
              <div>
                <div className="font-black text-lg text-violet-800">{p.label}</div>
                <div className="text-sm text-gray-500">{p.sub}</div>
              </div>
              <Clock className="w-6 h-6 text-violet-400 flex-shrink-0" />
            </button>
          ))}
          <Button onClick={() => setScreen("pick-mode")} variant="outline" className="rounded-2xl h-12 border-violet-200 text-violet-700">
            חזרה לבחירת מצב
          </Button>
        </main>
      )}

      {screen === "loading" && (
        <main className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 flex items-center justify-center text-3xl animate-bounce shadow-lg">
            🎯
          </div>
          <p className="text-violet-600 font-medium">
            מכינה שאלות...{loadProgress.total > 1 ? ` (${loadProgress.done}/${loadProgress.total})` : ""}
          </p>
        </main>
      )}

      {screen === "error" && (
        <main className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-4">
          <div className="text-5xl">😕</div>
          <p className="text-violet-800 font-semibold text-lg whitespace-pre-line max-w-lg">{errorMsg || "אופס, משהו השתבש כאן 😕"}</p>
          <Button onClick={backToModes} variant="outline" className="rounded-2xl border-violet-200 text-violet-700">
            חזרה לבחירת מצב
          </Button>
        </main>
      )}

      {screen === "running" && current && (
        <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-4">
          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full ${
                i < index ? "bg-green-400" : i === index ? "bg-gradient-to-r from-violet-400 to-purple-400" : "bg-gray-200"
              }`} />
            ))}
          </div>

          <div className="bg-white rounded-3xl border-2 border-violet-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-violet-400">שאלה {index + 1} מתוך {questions.length}</span>
              {current.section && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">{current.section}</span>
              )}
            </div>

            <div
              className="text-lg font-bold text-gray-800 mb-4"
              dir={dirFor(current.question)}
              style={{ textAlign: dirFor(current.question) === "rtl" ? "right" : "left" }}
            >
              {current.question}
            </div>

            {mode === "practice" && !revealed[index] && (
              <div className="mb-3">
                <button
                  type="button"
                  onClick={() => setHintOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-full px-3 py-1 transition-colors"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  רמז
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${hintOpen ? "rotate-180" : ""}`} />
                </button>
                {hintOpen && (
                  <div
                    className="mt-2 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2"
                    dir={dirFor(current.hint)}
                    style={{ textAlign: dirFor(current.hint) === "rtl" ? "right" : "left" }}
                  >
                    💡 {current.hint}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              {(current.options || []).map((opt, oi) => {
                const locked = mode === "practice" && revealed[index];
                let cls = "bg-white border-gray-200 hover:border-violet-300 text-gray-700";
                if (locked) {
                  if (opt === current.answer) cls = "bg-green-50 border-green-400 text-green-800";
                  else if (opt === answers[index]) cls = "bg-red-50 border-red-400 text-red-700";
                  else cls = "bg-gray-50 border-gray-200 text-gray-400";
                } else if (answers[index] === opt) {
                  cls = "bg-violet-100 border-violet-400 text-violet-800";
                }
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={locked}
                    onClick={() => handleSelect(opt)}
                    dir={dirFor(opt)}
                    style={{ textAlign: dirFor(opt) === "rtl" ? "right" : "left" }}
                    className={`rounded-xl px-3 py-2.5 text-sm font-semibold border-2 transition-colors ${cls}`}
                  >
                    {oi + 1}. {opt}
                  </button>
                );
              })}
            </div>

            {mode === "practice" && revealed[index] && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className={`flex items-center gap-2 mb-2 font-bold ${isCorrect(current, answers[index]) ? "text-green-600" : "text-red-500"}`}>
                  {isCorrect(current, answers[index]) ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  {isCorrect(current, answers[index]) ? "נכון!" : "לא נכון"}
                </div>
                <div
                  className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2"
                  dir={dirFor(current.solution)}
                  style={{ textAlign: dirFor(current.solution) === "rtl" ? "right" : "left" }}
                >
                  💡 {current.solution}
                </div>
              </div>
            )}

            {mode === "practice" && (
              <QuestionChat
                key={`chat-${index}`}
                question={current}
                allowRevealAnswer={!!revealed[index]}
                teacher={teacher}
              />
            )}
          </div>

          {(mode === "exam" || (mode === "practice" && revealed[index])) ? (
            <Button
              onClick={handleNext}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-bold text-base"
            >
              {index + 1 < questions.length ? "הבא ←" : mode === "exam" ? "סיים מבחן" : "לסיכום"}
            </Button>
          ) : (
            // Practice mode, not yet answered — make the next step obvious even
            // when the chat is expanded and the options are scrolled out of view.
            <div className="text-center text-sm text-violet-600 bg-violet-50 border border-violet-200 rounded-2xl px-4 py-3 font-medium">
              👆 בחר/י תשובה למעלה כדי לראות אם צדקת ולהמשיך לשאלה הבאה
            </div>
          )}
        </main>
      )}

      {screen === "done" && (
        <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <div className="bg-white rounded-3xl border border-violet-100 shadow-sm p-6 text-center">
            <div className="text-5xl font-black text-violet-700 mb-1">{score}/{questions.length}</div>
            {mode === "exam" && (
              <p className="text-sm text-gray-500 mb-1">
                {timedOutRef.current ? "הזמן נגמר" : `זמן שנוצל: ${fmtTime(totalSeconds - (timeLeft ?? 0))} מתוך ${fmtTime(totalSeconds)}`}
              </p>
            )}
            <p className="text-violet-500 font-medium">
              {score === questions.length ? "מושלם! 🌟" : score >= questions.length / 2 ? "כל הכבוד! עבודה טובה! 🎉" : "המשך להתאמן, זה משתפר! 💪"}
            </p>
          </div>

          <div className="space-y-2">
            {questions.map((q, i) => {
              const given = answers[i];
              const ok = isCorrect(q, given);
              return (
                <div key={i} className={`rounded-2xl px-4 py-3 border ${ok ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                  <div className="flex items-start gap-3">
                    {ok ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />}
                    <div className="flex-1 text-sm text-gray-700 space-y-1">
                      <div dir={dirFor(q.question)} style={{ textAlign: dirFor(q.question) === "rtl" ? "right" : "left" }}>{q.question}</div>
                      <div className={ok ? "text-green-600 font-bold" : "text-red-400 line-through"} dir={dirFor(given || "")} style={{ textAlign: dirFor(given || "") === "rtl" ? "right" : "left" }}>
                        התשובה שלך: {given || "לא ענית"}
                      </div>
                      {!ok && (
                        <div className="text-green-600 font-bold" dir={dirFor(q.answer)} style={{ textAlign: dirFor(q.answer) === "rtl" ? "right" : "left" }}>
                          התשובה הנכונה: {q.answer}
                        </div>
                      )}
                    </div>
                  </div>
                  {q.solution && (
                    <div className="mt-2 pr-8 text-xs text-gray-600 bg-white/70 rounded-lg px-3 py-1.5" dir={dirFor(q.solution)} style={{ textAlign: dirFor(q.solution) === "rtl" ? "right" : "left" }}>
                      💡 {q.solution}
                    </div>
                  )}
                  <div className="pr-8">
                    <QuestionChat key={`review-chat-${i}`} question={q} allowRevealAnswer teacher={teacher} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 max-w-xs mx-auto pt-2">
            <Button onClick={backToModes} className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold">
              <RotateCcw className="w-4 h-4 ml-2" /> סבב נוסף
            </Button>
            <Button onClick={() => navigate("/chat")} variant="outline" className="rounded-2xl h-12 border-violet-200 text-violet-700">
              💬 חזרה לשיחה
            </Button>
          </div>
        </main>
      )}
    </div>
  );
}

// Small per-question tutoring chat. Scoped to a single question and remounted
// (via `key`) whenever the question changes, so each question keeps its own
// short thread. `allowRevealAnswer` is forwarded to the prompt builder.
function QuestionChat({ question, allowRevealAnswer, teacher }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const convo = [...messages, { role: "user", text }];
    setMessages(convo);
    setInput("");
    setLoading(true);
    try {
      const reply = await api.integrations.Core.InvokeLLM({
        prompt: buildQuestionChatPrompt({
          teacherRoleText: teacherRole(teacher?.subjectLabels),
          question,
          conversation: convo,
          allowRevealAnswer,
        }),
      });
      setMessages((m) => [...m, { role: "assistant", text: String(reply || "").trim() || "אני כאן 🙂 נסו לנסח שוב." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "אופס, לא הצלחתי לענות כרגע. נסו שוב בעוד רגע." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-100 hover:bg-violet-200 rounded-full px-3 py-1 transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        עדיין לא הבנתי? שאל/י את המורה
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-2 border border-violet-200 rounded-2xl bg-violet-50/50 p-3" dir="rtl">
          <div ref={listRef} className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {messages.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-2">
                אפשר לשאול כל דבר על השאלה הזו — למשל "לא הבנתי את הרמז, אפשר דוגמה?"
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm rounded-2xl px-3 py-2 max-w-[85%] whitespace-pre-line ${
                  m.role === "user"
                    ? "bg-violet-500 text-white self-end rounded-br-sm"
                    : "bg-white text-gray-700 self-start rounded-bl-sm border border-gray-100"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="bg-white text-gray-400 self-start rounded-2xl rounded-bl-sm border border-gray-100 px-3 py-2 text-sm">
                המורה כותבת…
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder="כתוב/כתבי שאלה…"
              className="flex-1 text-sm border-2 border-violet-200 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-400 bg-white"
            />
            <button
              type="button"
              onClick={send}
              disabled={loading || !input.trim()}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-violet-500 text-white disabled:opacity-40 flex-shrink-0"
            >
              <Send className="w-4 h-4 -scale-x-100" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

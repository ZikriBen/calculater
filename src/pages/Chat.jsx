import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { STUDENT, teacherRole, genderGuide, themeTokens, uiStrings, useStudent } from "@/lib/student";
import Header from "@/components/tutor/Header";
import WelcomeScreen from "@/components/tutor/WelcomeScreen";
import ChatMessage from "@/components/tutor/ChatMessage";
import InputBar from "@/components/tutor/InputBar";

const buildChatSystemPrompt = () => {
  const female = STUDENT.gender !== "male";
  const suffixE = female ? "ה" : "";
  const objPronoun = female ? "ה" : "ו";
  const askingVerb = female ? "מבקשת" : "מבקש";
  const ctaLabel = female ? "התחילי תרגול" : "התחל תרגול";
  return `תפקיד:
${teacherRole()}

🧠 מצב עבודה 1: ניתוח מבחן (כאשר מצורפת תמונה)
כאשר המשתמש מצרף תמונה של מבחן:
1. נתחי את המבחן - אילו נושאים, אילו טעויות, איזה סוג טעויות
2. סכמי: "${STUDENT.name} צריכ${suffixE} חיזוק ב: ..."
3. אמרי ל${objPronoun} שהכנת תרגול מותאם אישית

🧠 מצב עבודה 2: שיחה חופשית
עני על שאלות בחשבון, הסבירי מושגים, עזרי להבין טעויות.
שפה פשוטה לכיתה ${STUDENT.grade}. כתבי בעברית בלבד.
${genderGuide()}

📖 מילון מושגים מבית הספר (שימי לב, יש מושגים ששימוש ישראלי ייחודי):
- "פילוג" = שיטת כפל על ידי פיצול מספר לפי ערכי מקום. דוגמה: 143×2 = 100×2 + 40×2 + 3×2 = 286. כשהילדה מבקשת תרגול ב"פילוג", צרי תרגילים שמראים את הפיצול במפורש.
- "חוק החילוף" / "חוק הקיבוץ" / "חוק הפילוג" = תכונות החיבור/כפל.
- "השלמה ל-10 / 100" = מציאת המשלים.
אם ילדה משתמשת במושג שלא ברור — שאלי אותה להסביר, ולאחר שתסביר, עדכני את התרגול בהתאם לנושא שהבהירה.

🎯 כש${askingVerb}ים תרגול בנושא ספציפי:
אם ${STUDENT.name} ${askingVerb}${suffixE} לתרגל נושא ספציפי (למשל "אני רוצה בעיות מילוליות", "תני לי תרגילי כפל"), אל תכתבי את התרגילים בצ'אט. במקום זאת, אמרי משפט קצר של אישור בסגנון:
"מעולה! הכנתי לך תרגול ב${'{נושא}'} — לח${female ? 'צי' : 'ץ'} על '${ctaLabel}' למטה ונתחיל 🌟"
התרגילים עצמם ייוצרו במסך התרגול הנפרד, אל תציגי אותם כאן.

📄 פורמט פלט:
- Markdown בלבד (כותרות עם #, הדגשות עם **, רשימות עם - או *).
- אסור להשתמש בתגיות HTML כלשהן (למשל <details>, <summary>, <br>, <div>) — רק מרקדאון רגיל.
- אם רוצים רמז נסתר, פשוט כתבי "💡 רמז: ..." בשורה נפרדת. אל תנסי ליצור אלמנט מתקפל.`;
};

const PRACTICE_INTENT_SCHEMA = {
  type: "object",
  properties: {
    wants_practice: { type: "boolean", description: "True if the student is asking to practice / do exercises / drills on a topic" },
    topics: { type: "array", items: { type: "string" }, description: "Specific math topics the student wants to practice (in Hebrew). Empty if not specified." },
    difficulty: { type: "string", enum: ["easy", "medium", "hard"], description: "Difficulty the student requested. Default to 'easy' if not specified." },
    summary: { type: "string", description: "One short Hebrew sentence describing the requested practice, e.g. 'בעיות מילוליות ברמה קלה'" }
  }
};

const PRACTICE_INTENT_PROMPT = (userMsg, history, currentContext) => `אתה מנתח כוונה של תלמידה. ההודעה האחרונה שלה:
"${userMsg}"

היסטוריית שיחה אחרונה:
${history}

הקשר תרגול נוכחי שנשמר: ${currentContext ? JSON.stringify(currentContext) : 'אין'}

שאלה: האם לתרגול הבא שייווצר צריך להיות נושא ספציפי?
כללים:
1. אם ההודעה האחרונה **מבקשת** לתרגל נושא מסוים ("אני רוצה X", "תני לי X", "בואי נתרגל X") — החזר wants_practice=true עם topics=[X].
2. אם ההודעה האחרונה **מסבירה/מתקנת/מבהירה** נושא שכבר ביקשה קודם (למשל: "פילוג זה כמו 143×2 = 100×2 + 40×2 + 3×2"), החזר wants_practice=true עם topics=[הנושא שהיא מסבירה]. **זה עדיין תרגול באותו נושא.**
3. אם ההיסטוריה מראה שהיא ביקשה לתרגל נושא, וההודעה הנוכחית עדיין בהקשר של אותה בקשה (שאלות המשך, הבהרות, "כן"/"תתחילי"), החזר wants_practice=true עם אותו נושא.
4. אם היא סתם משוחחת (שואלת שאלה כללית, מקבלת הסבר ללא בקשה לתרגל), החזר wants_practice=false.
5. אם נושא חדש מופיע אחרי נושא ישן — **הנושא החדש מנצח**. אל תחזיר את הנושא הישן.

דוגמאות גלוסריות לנושאים שאולי לא מוכרים לך:
- "פילוג" = שיטת כפל לפי פיצול למקומות (למשל 143×2 = 100×2 + 40×2 + 3×2).
- "חוק החילוף" = a+b = b+a, a×b = b×a.
- "חוק הקיבוץ" = (a+b)+c = a+(b+c).
- "השלמה ל-10/100" = מציאת המשלים.

החזר JSON לפי הסכמה.`;

const EXAM_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    topics: { type: "array", items: { type: "string" }, description: "Main math topics in the exam" },
    difficulty: { type: "string", enum: ["easy", "medium", "hard"], description: "Overall exam difficulty level" },
    wrong_topics: { type: "array", items: { type: "string" }, description: "Topics where the student made mistakes" },
    wrong_examples: { type: "array", items: { type: "string" }, description: "Example questions the student got wrong (as written in the exam)" },
    summary: { type: "string", description: "Short summary in Hebrew of what needs reinforcement" }
  }
};

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [dayNumber, setDayNumber] = useState(() => {
    return parseInt(localStorage.getItem(STUDENT.dayStorageKey) || "1");
  });
  const [pendingPractice, setPendingPractice] = useState(() => {
    const stored = localStorage.getItem("practice_context") || localStorage.getItem("exam_context");
    return stored ? JSON.parse(stored) : null;
  });
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (role, content, imageUrl = null) => {
    setMessages(prev => [...prev, { role, content, imageUrl, id: Date.now() }]);
  };

  const sendMessage = async (text, imageFile = null) => {
    if (!text && !imageFile) return;
    setHasStarted(true);

    let imageUrl = null;
    let uploadedUrl = null;

    if (imageFile) {
      try {
        const result = await api.integrations.Core.UploadFile({ file: imageFile });
        uploadedUrl = result.file_url;
        imageUrl = uploadedUrl;
      } catch (e) {
        console.error(e);
      }
    }

    addMessage("user", text || "📷 תמונת מבחן", imageUrl);
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const userPrompt = text || "נא לנתח את המבחן בתמונה";

      if (uploadedUrl) {
        // Run analysis + chat response in parallel
        const [analysisResult, response] = await Promise.all([
          api.integrations.Core.InvokeLLM({
            prompt: `נתח את מבחן החשבון בתמונה. זהה את הנושאים, רמת הקושי, ובאיזה נושאים הילדה טעתה.`,
            file_urls: [uploadedUrl],
            model: "claude_sonnet_4_6",
            response_json_schema: EXAM_ANALYSIS_SCHEMA
          }),
          api.integrations.Core.InvokeLLM({
            prompt: `${buildChatSystemPrompt()}\n\nהודעה נוכחית: ${userPrompt}`,
            file_urls: [uploadedUrl],
            model: "claude_sonnet_4_6"
          })
        ]);

        // Store exam context for the practice page
        localStorage.setItem("exam_context", JSON.stringify(analysisResult));
        addMessage("assistant", response);
      } else {
        const historyText = conversationHistory.map(m => `${m.role === 'user' ? STUDENT.name : 'מורה'}: ${m.content}`).join('\n');
        const [response, intent] = await Promise.all([
          api.integrations.Core.InvokeLLM({
            prompt: `${buildChatSystemPrompt()}

היסטוריית שיחה:
${historyText}

הודעה נוכחית: ${userPrompt}`
          }),
          api.integrations.Core.InvokeLLM({
            prompt: PRACTICE_INTENT_PROMPT(userPrompt, historyText, pendingPractice),
            response_json_schema: PRACTICE_INTENT_SCHEMA,
          }).catch(() => null),
        ]);

        if (intent?.wants_practice && intent.topics?.length) {
          const ctx = {
            topics: intent.topics,
            difficulty: intent.difficulty || "easy",
            summary: intent.summary || intent.topics.join(", "),
          };
          localStorage.setItem("practice_context", JSON.stringify(ctx));
          setPendingPractice(ctx);
        }
        addMessage("assistant", response);
      }
    } catch (e) {
      const msg = e?.status === 402
        ? "😕 נגמרו קרדיטי ה-AI לחודש זה. כדי להמשיך יש לשדרג את החשבון בדאשבורד."
        : "אופס, משהו השתבש. נסי שוב! 😊";
      addMessage("assistant", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPractice = () => {
    navigate("/practice");
  };

  const handleReset = () => {
    setHasStarted(false);
    setMessages([]);
    localStorage.setItem(STUDENT.dayStorageKey, "1");
    setDayNumber(1);
  };

  useStudent();
  const theme = themeTokens();
  const s = uiStrings();

  return (
    <div className={`min-h-screen ${theme.pageBg} flex flex-col`} dir="rtl">
      <Header dayNumber={dayNumber} onReset={hasStarted ? handleReset : null} onPractice={handleStartPractice} />

      <main className="flex-1 overflow-y-auto px-4 py-4 max-w-3xl mx-auto w-full">
        {!hasStarted ? (
          <WelcomeScreen
            onStart={handleStartPractice}
            onUploadExam={(file) => {
              setHasStarted(true);
              sendMessage("", file);
            }}
            onChat={() => setHasStarted(true)}
          />
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tr-sm px-5 py-4 shadow-sm border border-purple-100 max-w-xs">
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-sm text-muted-foreground mr-1">{s.thinking}</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />

            {/* CTA to practice */}
            {!isLoading && messages.length > 0 && (
              <div className="flex flex-col items-center pt-2 gap-1.5">
                <button
                  onClick={handleStartPractice}
                  className={`bg-gradient-to-r ${theme.ctaGradient} text-white rounded-2xl px-6 py-3 text-sm font-semibold shadow-md transition-all`}
                >
                  📚 {s.startPractice} {pendingPractice?.summary ? `: ${pendingPractice.summary}` : ""} →
                </button>
                {pendingPractice?.summary && (
                  <span className="text-xs text-purple-500">לחיצה תיצור תרגילים ב: {pendingPractice.topics?.join(', ') || pendingPractice.summary}</span>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {hasStarted && (
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-purple-100 px-4 pt-3 pb-4 max-w-3xl mx-auto w-full">
          <InputBar onSend={sendMessage} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}
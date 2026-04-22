import { useState, useRef, useEffect } from "react";
import { api } from "@/api/client";
import Header from "@/components/tutor/Header";
import WelcomeScreen from "@/components/tutor/WelcomeScreen";
import ChatMessage from "@/components/tutor/ChatMessage";
import InputBar from "@/components/tutor/InputBar";
import CommandButtons from "@/components/tutor/CommandButtons";
import ExerciseForm from "@/components/tutor/ExerciseForm";
import { STUDENT, teacherRole, genderGuide, themeTokens, useStudent } from "@/lib/student";

export default function Tutor() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dayNumber, setDayNumber] = useState(1);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [exerciseMode, setExerciseMode] = useState(null); // { exercises, difficulty }
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const DIFFICULTIES = ["easy", "medium", "hard"];

  const exerciseSystemPrompt = (difficulty, topic) => `${teacherRole()}
צרי בדיוק 5 תרגילי חשבון ברמה "${difficulty === 'easy' ? 'קל' : difficulty === 'medium' ? 'בינוני' : 'מאתגר'}" בנושא "${topic || 'חשבון כללי'}".
החזירי JSON בלבד בפורמט:
{"exercises": [{"question": "...", "answer": "..."}, ...]}
רק מספרים בתשובות. תרגילים קצרים וברורים.`;

  const femalePronoun = STUDENT.gender === 'male' ? '' : 'ה';
  const systemPrompt = `תפקיד:
${teacherRole()}

המטרה שלך:
ללמד, לזהות טעויות, ולבנות תרגול מותאם אישית שמחזק חולשות.

🧠 מצב עבודה 1: ניתוח מבחן (כאשר מצורפת תמונה)
כאשר המשתמש מצרף תמונה של מבחן:
1. נתחי את המבחן:
   - אילו נושאים מופיעים
   - אילו שאלות ${STUDENT.name} טע${femalePronoun ? 'תה' : 'ה'} בהן
   - איזה סוג טעויות (חישוב, הבנה, סדר פעולות, קריאה וכו')
2. סכמי בקצרה: "${STUDENT.name} צריכ${femalePronoun} חיזוק ב: ..."
3. זהי דפוסים בלשון נקבה: טעויות חוזרות שלה, קושי ברמת קושי מסוימת
4. רק אחרי הניתוח: צרי תרגול מותאם אישית שממוקד בדיוק בחולשות

🧠 מצב עבודה 2: תרגול רגיל (ללא תמונה)
צרי יום תרגול רגיל לפי המבנה הבא.

📚 מבנה יום תרגול:
⭐ יום X

לכל נושא:
📘 כותרת הנושא

🟢 קל (30%):
[תרגילים קלים]

🟡 בינוני (40%):
[תרגילים בינוניים]

🔴 מאתגר (30%):
[תרגילים מאתגרים]

לפחות 20 תרגילים לכל נושא, ממוספרים.

🧾 חוקים חשובים:
- אל תציגי תשובות אלא אם ביקשו "בדיקה"
- אל תסבירי אלא אם ביקשו
- שפה פשוטה לילדה בכיתה ד'
- תרגילים ברורים ומרווחים
- כתבי בעברית בלבד
- כל תרגיל בשורה נפרדת עם מספר

📌 פורמט תרגילים:
1. 345 + 278 = 
2. בעיה מילולית: קצרה וברורה

🧩 פקודות:
"אפס יום" → התחל מחדש מיום 1
"עוד תרגילים" → עוד מאותו סוג שהיה קודם
"יותר קשה" → העלה רמה
"יותר קל" → הורד רמה
"בדיקה" → הצג פתרונות לתרגילים האחרונים

התחלה: אם אין תמונה → התחל מיום ${dayNumber} ברמה קלה עם נושא חשבון מתאים לכיתה ד'

📄 פורמט פלט:
- Markdown בלבד (כותרות עם #, הדגשות עם **, רשימות עם - או *).
- אסור להשתמש בתגיות HTML כלשהן (למשל <details>, <summary>, <br>, <div>) — רק מרקדאון רגיל.
- אם רוצים רמז נסתר, פשוט כתבי "💡 רמז: ..." בשורה נפרדת. אל תנסי ליצור אלמנט מתקפל.`;

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

      const userPrompt = text || "נא לנתח את המבחן בתמונה וליצור תרגול מותאם";

      const response = await api.integrations.Core.InvokeLLM({
        prompt: `${systemPrompt}

היסטוריית שיחה:
${conversationHistory.map(m => `${m.role === 'user' ? STUDENT.name : 'מורה'}: ${m.content}`).join('\n')}

הודעה נוכחית: ${userPrompt}`,
        file_urls: uploadedUrl ? [uploadedUrl] : undefined,
        model: uploadedUrl ? "claude_sonnet_4_6" : "automatic"
      });

      addMessage("assistant", response);

      if (text === "אפס יום") {
        setDayNumber(1);
        setMessages([]);
      }

      // After exam analysis, auto-start exercise mode
      if (uploadedUrl) {
        setTimeout(() => startExerciseMode("easy"), 800);
      }
    } catch (e) {
      addMessage("assistant", "אופס, משהו השתבש. נסי שוב! 😊");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommand = (cmd) => {
    if (cmd === "עוד תרגילים") {
      startExerciseMode("easy");
    } else {
      sendMessage(cmd);
    }
  };

  const handleStart = () => {
    // Start exercise form mode with easy difficulty
    startExerciseMode("easy");
  };

  const startExerciseMode = async (difficulty) => {
    setHasStarted(true);
    setIsLoading(true);
    try {
      const result = await api.integrations.Core.InvokeLLM({
        prompt: exerciseSystemPrompt(difficulty, currentTopic),
        response_json_schema: {
          type: "object",
          properties: {
            exercises: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  answer: { type: "string" }
                }
              }
            }
          }
        }
      });
      setExerciseMode({ exercises: result.exercises, difficulty });
    } catch (e) {
      addMessage("assistant", "אופס, לא הצלחתי לייצר תרגילים. נסי שוב! 😊");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExerciseSubmit = async (exercises, answers) => {
    // Build check prompt
    const answeredExercises = exercises.map((ex, i) => 
      `${i+1}. ${ex.question} → תשובת ${STUDENT.name}: ${answers[i] || '?'} | תשובה נכונה: ${ex.answer}`
    ).join('\n');

    const currentDifficulty = exerciseMode.difficulty;
    const nextDifficultyIndex = DIFFICULTIES.indexOf(currentDifficulty) + 1;
    const nextDifficulty = DIFFICULTIES[nextDifficultyIndex];

    setExerciseMode(null);
    addMessage("user", `✏️ סיימתי את שלב ה${currentDifficulty === 'easy' ? 'קל' : currentDifficulty === 'medium' ? 'בינוני' : 'מאתגר'}`);
    setIsLoading(true);

    try {
      const response = await api.integrations.Core.InvokeLLM({
        prompt: `${systemPrompt}

בדקי את התשובות של ${STUDENT.name} ותני משוב **ישיר** בגוף שני:

${answeredExercises}

פורמט המשוב:
- שורה ראשונה: משפט מעודד כללי
- לכל תרגיל שנכשל: ✏️ תרגיל X - הסבר קצר מה הייתה הטעות ומה התשובה הנכונה
- שורה אחרונה: עידוד קדימה לשלב הבא

כתבי בעברית, בגוף שני ישיר אל ${STUDENT.name}.
${genderGuide()}`
      });

      addMessage("assistant", response);

      // Move to next difficulty automatically
      if (nextDifficulty) {
        setTimeout(() => startExerciseMode(nextDifficulty), 800);
      } else {
        // All done
        addMessage("assistant", `🎉 כל הכבוד ${STUDENT.name}! סיימת את כל רמות הקושי להיום! רוצי עוד תרגילים או לסיים?`);
        setDayNumber(d => d + 1);
      }
    } catch (e) {
      addMessage("assistant", "אופס, משהו השתבש. נסי שוב! 😊");
    } finally {
      setIsLoading(false);
    }
  };

  useStudent();
  const theme = themeTokens();

  return (
    <div className={`min-h-screen ${theme.pageBg} flex flex-col`} dir="rtl">
      <Header dayNumber={dayNumber} onReset={hasStarted ? () => { setHasStarted(false); setMessages([]); setExerciseMode(null); setDayNumber(1); } : null} />

      <main className="flex-1 overflow-y-auto px-4 py-4 max-w-3xl mx-auto w-full">
        {!hasStarted ? (
          <WelcomeScreen onStart={handleStart} onUploadExam={(file) => {
            setHasStarted(true);
            sendMessage("", file);
          }} />
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
                    <span className="text-sm text-muted-foreground mr-1">המורה חושבת...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />

            {/* Exercise Form - appears after messages */}
            {exerciseMode && !isLoading && (
              <ExerciseForm
                exercises={exerciseMode.exercises}
                difficulty={exerciseMode.difficulty}
                onSubmit={handleExerciseSubmit}
              />
            )}
          </div>
        )}
      </main>

      {hasStarted && (
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-purple-100 px-4 pt-3 pb-4 max-w-3xl mx-auto w-full">
          <CommandButtons onCommand={handleCommand} />
          <InputBar onSend={sendMessage} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}
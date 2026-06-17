import { useNavigate } from "react-router-dom";
import { STUDENT, themeTokens, useStudent } from "@/lib/student";
import { TEACHERS, setActiveTeacher } from "@/lib/teachers";
import StudentSettings from "@/components/StudentSettings";

const COLOR_STYLES = {
  purple:  { card: "from-purple-400 via-pink-400 to-yellow-400",  ring: "ring-purple-200 hover:ring-purple-400",  label: "text-purple-700"  },
  sky:     { card: "from-sky-400 via-cyan-400 to-teal-400",       ring: "ring-sky-200 hover:ring-sky-400",        label: "text-sky-700"     },
  emerald: { card: "from-emerald-400 via-lime-400 to-yellow-400", ring: "ring-emerald-200 hover:ring-emerald-400",label: "text-emerald-700" },
  amber:   { card: "from-amber-400 via-orange-400 to-red-400",    ring: "ring-amber-200 hover:ring-amber-400",    label: "text-amber-700"   },
  rose:    { card: "from-rose-400 via-pink-400 to-fuchsia-400",   ring: "ring-rose-200 hover:ring-rose-400",      label: "text-rose-700"    },
  indigo:  { card: "from-indigo-400 via-blue-400 to-cyan-400",    ring: "ring-indigo-200 hover:ring-indigo-400",  label: "text-indigo-700"  },
  slate:   { card: "from-slate-400 via-gray-400 to-zinc-400",     ring: "ring-slate-200 hover:ring-slate-400",    label: "text-slate-700"   },
};

const COMING_SOON = [
  { id: "_science",   name: "מדעים",     emoji: "🔬", color: "emerald" },
  { id: "_history",   name: "היסטוריה",  emoji: "🏺", color: "amber"   },
  { id: "_bible",     name: "תנ״ך",      emoji: "📜", color: "rose"    },
  { id: "_geography", name: "גיאוגרפיה", emoji: "🌍", color: "indigo"  },
];

export default function TeacherPicker() {
  useStudent();
  const theme = themeTokens();
  const navigate = useNavigate();

  const pick = (id) => {
    setActiveTeacher(id);
    navigate("/chat");
  };

  return (
    <div className={`min-h-screen ${theme.pageBg} flex flex-col`} dir="rtl">
      <header className="bg-white/70 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${theme.iconGradient} flex items-center justify-center shadow-md text-xl`}>
              {theme.emoji}
            </div>
            <div>
              <h1 className={`font-bold text-lg ${theme.accentText} leading-none`}>
                שלום {STUDENT.name || "תלמיד/ה"}! 👋
              </h1>
              <p className="text-xs text-gray-500 mt-1">איזה מורה את/ה רוצה היום?</p>
            </div>
          </div>
          <StudentSettings />
        </div>
      </header>

      <main className="flex-1 px-4 py-8 max-w-3xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TEACHERS.map((t) => {
            const c = COLOR_STYLES[t.color] || COLOR_STYLES.purple;
            const extraDrills = t.features.filter(f => !["chat","practice"].includes(f)).length;
            return (
              <button
                key={t.id}
                onClick={() => pick(t.id)}
                className={`group text-right bg-white rounded-3xl p-4 shadow-sm ring-2 ${c.ring} transition-all hover:shadow-lg hover:-translate-y-0.5`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.card} flex items-center justify-center text-2xl shadow-md mb-2`}>
                  {t.emoji}
                </div>
                <div className={`text-lg font-black ${c.label}`}>{t.name}</div>
                <div className="text-[11px] text-gray-500 mt-1 leading-tight">
                  {t.features.includes("practice") && "תרגול"}
                  {t.features.includes("chat") && " · שיחה"}
                  {extraDrills > 0 && " · מיני־משחקים"}
                </div>
              </button>
            );
          })}

          {COMING_SOON.map((t) => {
            const c = COLOR_STYLES[t.color] || COLOR_STYLES.slate;
            return (
              <div
                key={t.id}
                className="relative text-right bg-white/60 rounded-3xl p-4 shadow-sm ring-2 ring-gray-200/70 cursor-not-allowed opacity-70"
                title="בקרוב"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.card} opacity-60 flex items-center justify-center text-2xl shadow-inner mb-2`}>
                  {t.emoji}
                </div>
                <div className={`text-lg font-black ${c.label} opacity-70`}>{t.name}</div>
                <div className="text-[11px] text-gray-400 mt-1">בקרוב ✨</div>
                <span className="absolute top-2 left-2 text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 font-semibold">בקרוב</span>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          אפשר להחליף מורה בכל עת מתוך התפריט העליון.
        </p>
      </main>
    </div>
  );
}

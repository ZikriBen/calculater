import { Star, Calculator, Home, BookOpen, Repeat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { STUDENT, themeTokens, useStudent, uiStrings } from "@/lib/student";
import { useActiveTeacher, setActiveTeacher } from "@/lib/teachers";
import StudentSettings from "@/components/StudentSettings";

export default function Header({ dayNumber, onReset, onPractice }) {
  useStudent();
  const teacher = useActiveTeacher();
  const t = themeTokens();
  const s = uiStrings(teacher?.subjectLabels);
  const navigate = useNavigate();
  const switchTeacher = () => { setActiveTeacher(null); navigate("/"); };
  return (
    <header className={`bg-white/70 backdrop-blur-md border-b ${t.borderSoft} sticky top-0 z-10`}>
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between" dir="rtl">
        <div className="flex items-center gap-3">
          <button
            onClick={switchTeacher}
            className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${t.iconGradient} flex items-center justify-center shadow-md text-xl`}
            title="החלפת מורה"
          >
            {teacher?.emoji || <Calculator className="w-5 h-5 text-white" />}
          </button>
          <div>
            <h1 className={`font-bold text-lg ${t.accentText} leading-none`}>
              {teacher ? `${teacher.name} · ${STUDENT.name}` : `המורה של ${STUDENT.name}`}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">{s.teacherIntro.replace(/^אני /, "")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1.5">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
            <span className="text-sm font-semibold text-yellow-700">יום {dayNumber}</span>
          </div>
          {onPractice && (
            <button
              onClick={onPractice}
              className={`flex items-center gap-1 text-xs text-white bg-gradient-to-r ${t.ctaGradient} rounded-full px-3 py-1.5 transition-colors font-semibold shadow-sm`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              תרגול
            </button>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              תפריט
            </button>
          )}
          <button
            onClick={switchTeacher}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5 transition-colors"
            title="החלפת מורה"
          >
            <Repeat className="w-3.5 h-3.5" />
            מורים
          </button>
          <StudentSettings />
        </div>
      </div>
    </header>
  );
}

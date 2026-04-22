import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ImagePlus, Play, MessageCircle } from "lucide-react";
import { STUDENT, themeTokens, uiStrings, useStudent } from "@/lib/student";
import { quickTopicsFor } from "@/lib/curriculum";

export default function WelcomeScreen({ onStart, onUploadExam, onChat }) {
  const navigate = useNavigate();
  useStudent();
  const t = themeTokens();
  const s = uiStrings();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onUploadExam(file);
  };

  const quickTopics = quickTopicsFor(STUDENT.grade);

  const startTopic = (item) => {
    localStorage.setItem("practice_context", JSON.stringify({
      topics: [item.topic],
      difficulty: item.difficulty || "easy",
      summary: item.label,
    }));
    navigate("/practice");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4" dir="rtl">
      {/* Avatar */}
      <div className="relative mb-6">
        <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${t.avatarGradient} flex items-center justify-center text-5xl shadow-xl`}>
          {t.avatar}
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>

      <h2 className={`text-3xl font-bold ${t.accentText} mb-2`}>{s.greeting}</h2>
      <p className={`${t.softText} text-lg mb-1`}>{s.teacherIntro}</p>
      <p className="text-muted-foreground text-sm mb-10 max-w-xs">
        {s.teacherBlurb}
      </p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button
          onClick={onStart}
          size="lg"
          className={`bg-gradient-to-r ${t.ctaGradient} text-white rounded-2xl h-14 text-base font-semibold shadow-lg gap-2`}
        >
          <Play className="w-5 h-5" />
          {s.startDay}
        </Button>

        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          size="lg"
          className="border-2 border-purple-200 text-purple-700 rounded-2xl h-14 text-base font-semibold hover:bg-purple-50 gap-2"
        >
          <ImagePlus className="w-5 h-5" />
          {s.uploadExam}
        </Button>

        {onChat && (
          <Button
            onClick={onChat}
            variant="outline"
            size="lg"
            className="border-2 border-pink-200 text-pink-600 rounded-2xl h-12 text-sm font-semibold hover:bg-pink-50 gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            {s.askTeacher}
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="mt-10 w-full max-w-sm">
        <p className={`${t.softText} text-xs font-semibold mb-2 text-center`}>או בחר/י נושא לתרגול ישיר:</p>
        <div className="grid grid-cols-3 gap-2.5">
          {quickTopics.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => startTopic(item)}
              className={`bg-white rounded-2xl p-3 shadow-sm border ${t.borderSoft} flex flex-col items-center gap-1 hover:shadow-md hover:scale-[1.03] active:scale-95 transition-all`}
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className={`text-[11px] ${t.softText} font-semibold text-center leading-tight`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
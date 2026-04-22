import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ChevronLeft } from "lucide-react";

const DIFFICULTY_LABELS = {
  easy: { label: "🟢 קל", color: "bg-green-50 border-green-200", headerColor: "bg-green-100 text-green-800" },
  medium: { label: "🟡 בינוני", color: "bg-yellow-50 border-yellow-200", headerColor: "bg-yellow-100 text-yellow-800" },
  hard: { label: "🔴 מאתגר", color: "bg-red-50 border-red-200", headerColor: "bg-red-100 text-red-800" },
};

export default function ExerciseForm({ exercises, difficulty, onSubmit, onBack }) {
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);

  const config = DIFFICULTY_LABELS[difficulty];

  const handleCheck = () => {
    onSubmit(exercises, answers);
  };

  if (results) return null;

  return (
    <div dir="rtl" className={`rounded-2xl border-2 ${config.color} p-4 space-y-4`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${config.headerColor}`}>
          {config.label}
        </span>
        {onBack && (
          <button onClick={onBack} className="text-xs text-purple-400 hover:text-purple-600 flex items-center gap-1">
            <ChevronLeft className="w-3 h-3" />
            חזרה
          </button>
        )}
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        {exercises.map((ex, i) => (
          <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2 border border-purple-100">
            <input
              type="text"
              inputMode="numeric"
              value={answers[i] || ""}
              onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
              placeholder="?"
              className="w-16 text-center border-2 border-purple-200 rounded-xl px-2 py-1.5 text-sm font-bold focus:outline-none focus:border-purple-400 bg-purple-50 flex-shrink-0"
              dir="ltr"
            />
            <span className="text-gray-400 text-sm">=</span>
            <span className="flex-1 text-sm text-gray-800 leading-relaxed" dir="ltr" style={{ textAlign: 'left' }}>{ex.question}</span>
            <span className="text-sm font-bold text-purple-400 flex-shrink-0">{i + 1}.</span>
          </div>
        ))}
      </div>

      {/* Submit */}
      <Button
        onClick={handleCheck}
        disabled={Object.keys(answers).length < exercises.length}
        className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold h-11"
      >
        ✅ שלחי לבדיקה
      </Button>
    </div>
  );
}
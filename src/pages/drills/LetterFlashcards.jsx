import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STUDENT, themeTokens, useStudent } from "@/lib/student";
import { ALPHABET, LETTER_NAMES, LETTER_WORDS, LETTER_SOUNDS } from "@/lib/englishLetters";

const CARDS_PER_SESSION = { "א'": 10, "ב'": 16, "ג'": 26 };

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const buildDeck = (grade) => {
  const count = CARDS_PER_SESSION[grade] || 26;
  const letters = shuffle([...ALPHABET]).slice(0, count);
  return letters.map(letter => ({
    letter,
    lower: letter.toLowerCase(),
    name: LETTER_NAMES[letter],
    sound: LETTER_SOUNDS[letter],
    ...LETTER_WORDS[letter],
  }));
};

export default function LetterFlashcards() {
  const navigate = useNavigate();
  useStudent();
  const theme = themeTokens();

  useEffect(() => {
    localStorage.removeItem("practice_context");
    localStorage.removeItem("exam_context");
  }, []);

  const cards = useMemo(() => buildDeck(STUDENT.grade), []);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownSet, setKnownSet] = useState(new Set());
  const [phase, setPhase] = useState("learn");

  const card = cards[index];
  const total = cards.length;

  const handleFlip = () => setFlipped(f => !f);

  const handleKnown = () => {
    setKnownSet(prev => { const s = new Set(prev); s.add(index); return s; });
    advance();
  };

  const advance = () => {
    setFlipped(false);
    if (index + 1 < total) setIndex(i => i + 1);
    else setPhase("done");
  };

  const handleNext = () => {
    setFlipped(false);
    if (index + 1 < total) setIndex(i => i + 1);
    else setPhase("done");
  };

  const handlePrev = () => {
    if (index > 0) {
      setFlipped(false);
      setIndex(i => i - 1);
    }
  };

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
          <h1 className="font-bold text-sky-700">כרטיסיות אותיות 🔤</h1>
          <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1">
            <span className="text-xs font-semibold text-yellow-700">{index + 1}/{total}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-2">
          <div className="flex gap-1">
            {cards.map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${
                knownSet.has(i) ? "bg-green-400" : i < index ? "bg-sky-300" : i === index ? "bg-sky-500" : "bg-gray-200"
              }`} />
            ))}
          </div>
        </div>
      </header>

      {phase === "learn" ? (
        <main className="max-w-md mx-auto px-4 py-8 flex flex-col items-center gap-5">
          <p className="text-sm text-gray-500">לחצו על הכרטיס כדי להפוך אותו</p>

          <div
            className="w-full max-w-[300px] h-[360px] cursor-pointer [perspective:1000px]"
            onClick={handleFlip}
          >
            <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? "[transform:rotateY(180deg)]" : ""}`}>
              {/* Front */}
              <div className="absolute inset-0 [backface-visibility:hidden] bg-gradient-to-br from-sky-50 to-white rounded-3xl border-2 border-sky-200 shadow-lg flex flex-col items-center justify-center gap-4 p-6">
                <div className="text-8xl font-black text-sky-800" dir="ltr">
                  {card.letter}{card.lower}
                </div>
                <div className="text-2xl font-bold text-sky-500" dir="rtl">
                  {card.name}
                </div>
                <div className="mt-2 flex items-center gap-2 text-gray-400 text-sm">
                  <RotateCw className="w-4 h-4" /> הפכו לגלות עוד
                </div>
              </div>

              {/* Back */}
              <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-amber-50 to-white rounded-3xl border-2 border-amber-200 shadow-lg flex flex-col items-center justify-center gap-3 p-6">
                <div className="text-6xl">{card.emoji}</div>
                <div className="text-3xl font-black text-amber-800" dir="ltr">
                  {card.word}
                </div>
                <div className="text-lg text-gray-600">{card.he}</div>
                <div className="mt-2 bg-sky-50 border border-sky-200 rounded-xl px-4 py-2 text-center">
                  <div className="text-xs text-gray-400 mb-1">איך קוראים?</div>
                  <div className="text-xl font-bold text-sky-700" dir="rtl">{card.sound}</div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  <span className="font-bold text-sky-600" dir="ltr">{card.letter}</span> = {card.name}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full max-w-[300px]">
            <button
              onClick={handlePrev}
              disabled={index === 0}
              className="p-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-default"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <Button
              onClick={handleKnown}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold"
            >
              ידעתי! ✅
            </Button>

            <button
              onClick={handleNext}
              className="p-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            {knownSet.size} מתוך {total} אותיות מוכרות
          </p>
        </main>
      ) : (
        <main className="max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-6 text-center">
          <div className="text-6xl">{knownSet.size === total ? "🏆" : knownSet.size >= total / 2 ? "🎉" : "💪"}</div>
          <h2 className="text-3xl font-black text-sky-700">
            {knownSet.size === total ? "מושלם!" : "כל הכבוד!"}
          </h2>
          <div className="text-lg text-gray-600">
            הכרתם {knownSet.size} מתוך {total} אותיות
          </div>
          <div className="text-5xl font-black text-sky-700">{knownSet.size}/{total}</div>

          {knownSet.size < total && (
            <p className="text-sm text-gray-500">
              נסו שוב כדי ללמוד את האותיות שנשארו!
            </p>
          )}

          <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
            <Button onClick={() => navigate(0)} className="w-full h-12 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold">
              <RotateCcw className="w-4 h-4 ml-2" /> סבב חדש
            </Button>
            <Button onClick={() => navigate("/chat")} variant="outline" className="rounded-2xl h-12 border-sky-200 text-sky-700">
              💬 חזרה לשיחה
            </Button>
          </div>
        </main>
      )}
    </div>
  );
}

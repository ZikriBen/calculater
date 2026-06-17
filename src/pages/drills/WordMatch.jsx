import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw, Star, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STUDENT, themeTokens, useStudent } from "@/lib/student";
import { vocabFor } from "@/lib/englishCurriculum";

const PAIRS_BY_DIFF = { easy: 5, medium: 6, hard: 8 };

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

const pickPairs = (grade, difficulty) => {
  const tiers = difficulty === "easy"
    ? [vocabFor(grade, "easy")]
    : difficulty === "medium"
    ? [vocabFor(grade, "easy"), vocabFor(grade, "medium")]
    : [vocabFor(grade, "easy"), vocabFor(grade, "medium"), vocabFor(grade, "hard")];
  const all = tiers.flat();
  return shuffle(all).slice(0, PAIRS_BY_DIFF[difficulty] || 6);
};

export default function WordMatch() {
  const navigate = useNavigate();
  useStudent();
  const theme = themeTokens();

  const difficulty = useMemo(readDifficulty, []);

  useEffect(() => {
    localStorage.removeItem("practice_context");
    localStorage.removeItem("exam_context");
  }, []);

  const [round, setRound] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [phase, setPhase] = useState("play");

  const allPairs = useMemo(() => {
    const sets = [];
    for (let r = 0; r < 3; r++) sets.push(pickPairs(STUDENT.grade, difficulty));
    return sets;
  }, [difficulty]);

  const handleRoundDone = (correct, attempts) => {
    setTotalCorrect(c => c + correct);
    setTotalAttempts(a => a + attempts);
    if (round + 1 < allPairs.length) {
      setRound(r => r + 1);
    } else {
      setPhase("done");
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
          <h1 className="font-bold text-sky-700">התאמת מילים 🃏</h1>
          <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
            <span className="text-xs font-semibold text-yellow-700">סבב {round + 1}/{allPairs.length}</span>
          </div>
        </div>
      </header>

      {phase === "play" ? (
        <MatchBoard
          key={round}
          pairs={allPairs[round]}
          onDone={handleRoundDone}
          theme={theme}
        />
      ) : (
        <Summary
          correct={totalCorrect}
          attempts={totalAttempts}
          onAgain={() => navigate(0)}
          onHome={() => navigate("/chat")}
          theme={theme}
        />
      )}
    </div>
  );
}

function MatchBoard({ pairs, onDone, theme }) {
  const enCards = useMemo(() => shuffle(pairs.map((w, i) => ({ id: `en-${i}`, word: w.en, tr: w.tr, pairIdx: i, side: "en" }))), [pairs]);
  const heCards = useMemo(() => shuffle(pairs.map((w, i) => ({ id: `he-${i}`, word: w.he, pairIdx: i, side: "he" }))), [pairs]);

  const [selectedEn, setSelectedEn] = useState(null);
  const [selectedHe, setSelectedHe] = useState(null);
  const [matched, setMatched] = useState(new Set());
  const [wrongPair, setWrongPair] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);

  useEffect(() => {
    if (selectedEn === null || selectedHe === null) return;

    setAttempts(a => a + 1);

    if (selectedEn.pairIdx === selectedHe.pairIdx) {
      setCorrect(c => c + 1);
      setMatched(prev => {
        const next = new Set(prev);
        next.add(selectedEn.pairIdx);
        return next;
      });
      setTimeout(() => {
        setSelectedEn(null);
        setSelectedHe(null);
      }, 500);
    } else {
      setWrongPair({ en: selectedEn.id, he: selectedHe.id });
      setTimeout(() => {
        setSelectedEn(null);
        setSelectedHe(null);
        setWrongPair(null);
      }, 800);
    }
  }, [selectedEn, selectedHe]);

  useEffect(() => {
    if (matched.size === pairs.length && pairs.length > 0) {
      setTimeout(() => onDone(correct + (matched.size === pairs.length ? 0 : 0), attempts), 600);
    }
  }, [matched.size]);

  const cardClass = (card, isSelected, isMatched, isWrong) => {
    const base = "rounded-2xl p-2 text-center font-bold transition-all duration-200 cursor-pointer select-none border-2 h-[68px] flex flex-col items-center justify-center";
    if (isMatched) return `${base} bg-green-50 border-green-300 text-green-700 opacity-60 cursor-default`;
    if (isWrong) return `${base} bg-red-50 border-red-400 text-red-700 animate-pulse`;
    if (isSelected) return `${base} bg-sky-50 border-sky-400 text-sky-800 shadow-md scale-105`;
    return `${base} bg-white border-gray-200 hover:border-sky-300 hover:shadow-sm text-gray-800`;
  };

  return (
    <main className="max-w-lg mx-auto px-4 py-6">
      <p className="text-center text-sm text-gray-500 mb-4">
        לחצו על מילה באנגלית ועל התרגום שלה בעברית
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <div className="text-center text-xs font-semibold text-sky-600 mb-1">{["א'","ב'"].includes(STUDENT.grade) ? "אנגלית 🇬🇧" : "English 🇬🇧"}</div>
          {enCards.map(card => {
            const isMatched = matched.has(card.pairIdx);
            const isSelected = selectedEn?.id === card.id;
            const isWrong = wrongPair?.en === card.id;
            return (
              <button
                key={card.id}
                disabled={isMatched || (selectedEn !== null && selectedHe !== null)}
                onClick={() => { if (!isMatched && !isSelected) setSelectedEn(card); }}
                className={cardClass(card, isSelected, isMatched, isWrong)}
              >
                <span className="text-base leading-tight" dir="ltr">{card.word}</span>
                <span className="text-[10px] text-gray-400 leading-tight" dir="rtl">{card.tr}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-center text-xs font-semibold text-sky-600 mb-1">עברית 🇮🇱</div>
          {heCards.map(card => {
            const isMatched = matched.has(card.pairIdx);
            const isSelected = selectedHe?.id === card.id;
            const isWrong = wrongPair?.he === card.id;
            return (
              <button
                key={card.id}
                disabled={isMatched || (selectedEn !== null && selectedHe !== null)}
                onClick={() => { if (!isMatched && !isSelected) setSelectedHe(card); }}
                className={cardClass(card, isSelected, isMatched, isWrong)}
              >
                <span className="text-base">{card.word}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-center">
        <div className="flex justify-center gap-1.5">
          {pairs.map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full transition-colors ${matched.has(i) ? "bg-green-400" : "bg-gray-200"}`} />
          ))}
        </div>
      </div>
    </main>
  );
}

function Summary({ correct, attempts, onAgain, onHome, theme }) {
  const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
  const perfect = accuracy === 100;
  return (
    <main className="max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-6 text-center">
      <div className="text-6xl">{perfect ? "🏆" : accuracy >= 70 ? "🎉" : "💪"}</div>
      <h2 className="text-3xl font-black text-sky-700">
        {perfect ? "מושלם!" : "כל הכבוד!"}
      </h2>
      <div className="text-lg text-gray-600">
        {correct} התאמות נכונות מתוך {attempts} ניסיונות
      </div>
      <div className="text-4xl font-black text-sky-700">{accuracy}%</div>
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

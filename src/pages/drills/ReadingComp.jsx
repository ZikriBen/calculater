import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STUDENT, themeTokens, useStudent } from "@/lib/student";

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

const GRADE_ORDER = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'"];
const gradeUp = (grade) => {
  const idx = GRADE_ORDER.indexOf(grade);
  return idx >= 0 && idx < GRADE_ORDER.length - 1 ? GRADE_ORDER[idx + 1] : grade;
};

const PASSAGES_BY_GRADE = {
  "א'": [
    {
      title: "My Dog",
      text: "I have a dog. His name is Rex. Rex is brown. He likes to run in the park. Rex is my best friend.",
      hint: "יש לי כלב. שמו רקס. רקס חום. הוא אוהב לרוץ בפארק. רקס הוא החבר הכי טוב שלי.",
      questions: [
        { q: "What is the dog's name?", answer: "Rex", options: ["Rex", "Max", "Buddy", "Sam"] },
        { q: "What color is the dog?", answer: "Brown", options: ["Brown", "White", "Black", "Red"] },
        { q: "Where does Rex like to run?", answer: "In the park", options: ["In the park", "In the house", "At school", "In the garden"] },
      ],
    },
    {
      title: "The Red Ball",
      text: "Tom has a red ball. He plays with the ball every day. His sister Mia wants to play too. They play together. They are happy.",
      hint: "לטום יש כדור אדום. הוא משחק עם הכדור כל יום. אחותו מיה רוצה לשחק גם. הם משחקים ביחד. הם שמחים.",
      questions: [
        { q: "What color is the ball?", answer: "Red", options: ["Red", "Blue", "Green", "Yellow"] },
        { q: "Who is Mia?", answer: "Tom's sister", options: ["Tom's sister", "Tom's mom", "Tom's friend", "Tom's teacher"] },
        { q: "How do they feel?", answer: "Happy", options: ["Happy", "Sad", "Tired", "Angry"] },
      ],
    },
  ],
  "ב'": [
    {
      title: "My School",
      text: "My school is big. I have many friends at school. My teacher is Mrs. Green. She is very nice. We learn to read and write. I like math too. After school, I play with my friends.",
      hint: "בית הספר שלי גדול. יש לי הרבה חברים. המורה שלי היא גברת גרין. היא מאוד נחמדה. אנחנו לומדים לקרוא ולכתוב. אני אוהב גם חשבון. אחרי בית הספר אני משחק עם החברים.",
      questions: [
        { q: "Who is Mrs. Green?", answer: "The teacher", options: ["The teacher", "The mom", "A friend", "The sister"] },
        { q: "What do they learn at school?", answer: "To read and write", options: ["To read and write", "To cook", "To swim", "To drive"] },
        { q: "What does the student do after school?", answer: "Plays with friends", options: ["Plays with friends", "Goes to sleep", "Watches TV", "Does homework"] },
      ],
    },
    {
      title: "The Cat and the Bird",
      text: "A small cat sits by the window. She sees a bird in the tree. The bird is yellow. The cat wants to catch it, but the bird flies away. The cat is sad.",
      hint: "חתולה קטנה יושבת ליד החלון. היא רואה ציפור על העץ. הציפור צהובה. החתולה רוצה לתפוס אותה, אבל הציפור עפה. החתולה עצובה.",
      questions: [
        { q: "Where is the cat?", answer: "By the window", options: ["By the window", "On the tree", "In the garden", "On the bed"] },
        { q: "What color is the bird?", answer: "Yellow", options: ["Yellow", "Red", "Blue", "Green"] },
        { q: "Why is the cat sad?", answer: "The bird flew away", options: ["The bird flew away", "She is hungry", "She is lost", "She is cold"] },
      ],
    },
  ],
  "ג'": [
    {
      title: "A Trip to the Zoo",
      text: "Last Saturday, my family went to the zoo. We saw many animals — lions, elephants, and monkeys. The monkeys were very funny. They jumped from tree to tree. My little brother was scared of the lions, but I told him they can't get out. We ate ice cream before going home. It was a great day!",
      questions: [
        { q: "When did the family go to the zoo?", answer: "Last Saturday", options: ["Last Saturday", "Last Monday", "Yesterday", "Last week"] },
        { q: "Why was the brother scared?", answer: "Because of the lions", options: ["Because of the lions", "Because of the monkeys", "Because of the elephants", "Because it was dark"] },
        { q: "What did they eat before going home?", answer: "Ice cream", options: ["Ice cream", "Pizza", "Cake", "Sandwiches"] },
        { q: "What were the monkeys doing?", answer: "Jumping from tree to tree", options: ["Jumping from tree to tree", "Eating bananas", "Sleeping", "Swimming"] },
      ],
    },
    {
      title: "The Lost Key",
      text: "Anna lost her house key. She looked in her bag, but it wasn't there. She checked her pockets — nothing. Then she remembered: she left it on the kitchen table! She ran home and found the key exactly where she thought. Anna was so happy. From now on, she keeps the key in her pocket.",
      questions: [
        { q: "What did Anna lose?", answer: "Her house key", options: ["Her house key", "Her phone", "Her book", "Her wallet"] },
        { q: "Where did she find the key?", answer: "On the kitchen table", options: ["On the kitchen table", "In her bag", "In her pocket", "At school"] },
        { q: "What will Anna do from now on?", answer: "Keep the key in her pocket", options: ["Keep the key in her pocket", "Leave it at school", "Give it to her mom", "Hide it under the mat"] },
      ],
    },
  ],
  "ד'": [
    {
      title: "The Science Project",
      text: "Maya and her partner Ben worked on a science project for two weeks. They built a small volcano that could actually erupt. They used baking soda and vinegar to make the eruption. On the day of the presentation, everyone in the class was amazed. The teacher gave them the highest grade. Maya felt proud because they worked really hard on it.",
      questions: [
        { q: "What did Maya and Ben build?", answer: "A small volcano", options: ["A small volcano", "A robot", "A rocket", "A bridge"] },
        { q: "What made the volcano erupt?", answer: "Baking soda and vinegar", options: ["Baking soda and vinegar", "Water and salt", "Fire and paper", "Oil and water"] },
        { q: "How did the class react?", answer: "They were amazed", options: ["They were amazed", "They were bored", "They were scared", "They laughed"] },
        { q: "Why did Maya feel proud?", answer: "They worked really hard", options: ["They worked really hard", "It was easy", "The teacher helped them", "They copied it"] },
      ],
    },
    {
      title: "A Letter from Grandma",
      text: "Dear Daniel, I hope you are doing well. I'm writing to tell you that I'm coming to visit next month! I will bring your favourite chocolate cake. We can go to the beach together if the weather is nice. I miss you very much. Please say hello to your parents. Love, Grandma.",
      questions: [
        { q: "Who wrote the letter?", answer: "Grandma", options: ["Grandma", "Daniel", "Mom", "A friend"] },
        { q: "When is Grandma coming?", answer: "Next month", options: ["Next month", "Next week", "Tomorrow", "Next year"] },
        { q: "What will Grandma bring?", answer: "Chocolate cake", options: ["Chocolate cake", "A present", "Flowers", "A book"] },
        { q: "Where might they go together?", answer: "To the beach", options: ["To the beach", "To the zoo", "To school", "To the park"] },
      ],
    },
  ],
  "ה'": [
    {
      title: "The Invention of the Telephone",
      text: "Alexander Graham Bell invented the telephone in 1876. Before that, people could only communicate by letters or telegraph. The first words spoken on the telephone were: \"Mr. Watson, come here. I want to see you.\" Bell's invention changed the world forever. Today, we carry phones in our pockets and can talk to anyone, anywhere in the world, in seconds.",
      questions: [
        { q: "Who invented the telephone?", answer: "Alexander Graham Bell", options: ["Alexander Graham Bell", "Thomas Edison", "Albert Einstein", "Benjamin Franklin"] },
        { q: "In what year was it invented?", answer: "1876", options: ["1876", "1900", "1776", "1920"] },
        { q: "How did people communicate before the telephone?", answer: "By letters or telegraph", options: ["By letters or telegraph", "By email", "By radio", "By television"] },
        { q: "What is different about phones today?", answer: "We carry them in our pockets", options: ["We carry them in our pockets", "They are bigger", "They only make calls", "They need wires"] },
      ],
    },
    {
      title: "Water: Our Most Important Resource",
      text: "Water covers about 71% of Earth's surface, but only 3% of it is fresh water. Most fresh water is frozen in glaciers and ice caps. People need clean water for drinking, cooking, and farming. In many parts of the world, people don't have access to clean water. Scientists are working on new ways to clean dirty water and turn salt water into drinking water. Saving water is everyone's responsibility.",
      questions: [
        { q: "How much of Earth's surface is covered by water?", answer: "About 71%", options: ["About 71%", "About 50%", "About 90%", "About 30%"] },
        { q: "Where is most fresh water found?", answer: "In glaciers and ice caps", options: ["In glaciers and ice caps", "In rivers", "In lakes", "Underground"] },
        { q: "What are scientists working on?", answer: "Ways to clean water", options: ["Ways to clean water", "Building more dams", "Finding new rivers", "Making it rain more"] },
        { q: "What is the main message of this text?", answer: "Water is precious and we should save it", options: ["Water is precious and we should save it", "Water is everywhere", "Scientists are smart", "Glaciers are melting"] },
      ],
    },
  ],
  "ו'": [
    {
      title: "The Power of Habits",
      text: "According to researchers, about 40% of our daily actions are habits, not conscious decisions. A habit has three parts: a cue (something that triggers the action), a routine (the action itself), and a reward (what you get from it). For example, feeling bored (cue) might lead you to check your phone (routine) and feel entertained (reward). The good news is that habits can be changed. By identifying the cue and replacing the routine while keeping the reward, you can build better habits over time.",
      questions: [
        { q: "What percentage of daily actions are habits?", answer: "About 40%", options: ["About 40%", "About 20%", "About 60%", "About 80%"] },
        { q: "What are the three parts of a habit?", answer: "Cue, routine, and reward", options: ["Cue, routine, and reward", "Start, middle, and end", "Morning, noon, and night", "Think, act, and rest"] },
        { q: "In the example, what is the 'cue'?", answer: "Feeling bored", options: ["Feeling bored", "Checking the phone", "Feeling entertained", "Being tired"] },
        { q: "How can you change a habit?", answer: "Replace the routine, keep the reward", options: ["Replace the routine, keep the reward", "Stop doing everything", "Ignore the cue", "Just try harder"] },
      ],
    },
    {
      title: "Plastic in the Ocean",
      text: "Every year, approximately 8 million tons of plastic end up in the ocean. This pollution harms marine life in devastating ways. Sea turtles mistake plastic bags for jellyfish and eat them. Fish consume tiny pieces of plastic called microplastics, which then enter our food chain when we eat the fish. Several countries have banned single-use plastic bags and straws. However, experts say that recycling alone won't solve the problem — we need to produce less plastic in the first place.",
      questions: [
        { q: "How much plastic enters the ocean yearly?", answer: "About 8 million tons", options: ["About 8 million tons", "About 1 million tons", "About 100 million tons", "About 800 thousand tons"] },
        { q: "Why do sea turtles eat plastic bags?", answer: "They look like jellyfish", options: ["They look like jellyfish", "They are hungry", "They like the taste", "They can't see well"] },
        { q: "What are microplastics?", answer: "Tiny pieces of plastic", options: ["Tiny pieces of plastic", "Small sea animals", "A type of fish food", "Plastic bottles"] },
        { q: "What do experts say about recycling?", answer: "It alone won't solve the problem", options: ["It alone won't solve the problem", "It is the best solution", "It is not important", "Everyone should recycle more"] },
      ],
    },
  ],
};

PASSAGES_BY_GRADE["ז'"] = PASSAGES_BY_GRADE["ו'"];
PASSAGES_BY_GRADE["ח'"] = PASSAGES_BY_GRADE["ו'"];

const passagesFor = (grade) =>
  PASSAGES_BY_GRADE[grade] || PASSAGES_BY_GRADE["ד'"];

export default function ReadingComp() {
  const navigate = useNavigate();
  useStudent();
  const theme = themeTokens();

  const difficulty = useMemo(readDifficulty, []);

  useEffect(() => {
    localStorage.removeItem("practice_context");
    localStorage.removeItem("exam_context");
  }, []);

  const passages = useMemo(() => {
    const grade = difficulty === "hard" ? gradeUp(STUDENT.grade) : STUDENT.grade;
    return shuffle(passagesFor(grade));
  }, [difficulty]);
  const [passageIdx, setPassageIdx] = useState(0);
  const [phase, setPhase] = useState("read");
  const [results, setResults] = useState([]);

  const current = passages[passageIdx];
  const totalQuestions = passages.reduce((s, p) => s + p.questions.length, 0);
  const totalCorrect = results.reduce((s, r) => s + r, 0);

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
          <h1 className="font-bold text-sky-700">הבנת הנקרא 📖</h1>
          <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
            <span className="text-xs font-semibold text-yellow-700">טקסט {passageIdx + 1}/{passages.length}</span>
          </div>
        </div>
      </header>

      {phase === "read" && (
        <ReadingPhase
          passage={current}
          showHint={["א'", "ב'"].includes(STUDENT.grade)}
          onReady={() => setPhase("questions")}
        />
      )}

      {phase === "questions" && (
        <QuestionsPhase
          key={passageIdx}
          passage={current}
          onDone={(correctCount) => {
            setResults(r => [...r, correctCount]);
            if (passageIdx + 1 < passages.length) {
              setPassageIdx(i => i + 1);
              setPhase("read");
            } else {
              setPhase("done");
            }
          }}
        />
      )}

      {phase === "done" && (
        <Summary
          correct={totalCorrect + (results.length < passages.length ? 0 : 0)}
          total={totalQuestions}
          passages={passages.length}
          onAgain={() => navigate(0)}
          onHome={() => navigate("/chat")}
        />
      )}
    </div>
  );
}

function ReadingPhase({ passage, showHint, onReady }) {
  return (
    <main className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="bg-white rounded-3xl border-2 border-sky-200 shadow-sm p-6">
        <h2 className="text-xl font-black text-sky-800 mb-4 text-center" dir="ltr">{passage.title}</h2>
        <p className="text-lg leading-relaxed text-gray-800 whitespace-pre-line" dir="ltr">
          {passage.text}
        </p>
        {showHint && passage.hint && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 leading-relaxed">{passage.hint}</p>
          </div>
        )}
      </div>

      <p className="text-center text-sm text-gray-500">
        קראו את הטקסט ולחצו "מוכנים" כשסיימתם
      </p>

      <Button
        onClick={onReady}
        className="w-full max-w-xs mx-auto h-12 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold"
      >
        ✅ מוכנים לשאלות!
      </Button>
    </main>
  );
}

function QuestionsPhase({ passage, onDone }) {
  const [qIdx, setQIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selected, setSelected] = useState(null);

  const question = passage.questions[qIdx];
  const shuffledOptions = useMemo(() => shuffle(question.options), [question]);

  const handleSelect = (opt) => {
    if (feedback) return;
    setSelected(opt);
    const ok = opt === question.answer;
    if (ok) setCorrect(c => c + 1);
    setFeedback(ok ? "correct" : "wrong");
    setTimeout(() => {
      if (qIdx + 1 < passage.questions.length) {
        setQIdx(i => i + 1);
        setFeedback(null);
        setSelected(null);
      } else {
        onDone(correct + (ok ? 1 : 0));
      }
    }, ok ? 600 : 1400);
  };

  const optionClass = (opt) => {
    const base = "rounded-2xl px-4 py-3 font-semibold text-base transition-all duration-200 border-2 text-right";
    if (feedback && opt === question.answer) return `${base} bg-green-50 border-green-400 text-green-800`;
    if (feedback === "wrong" && opt === selected) return `${base} bg-red-50 border-red-400 text-red-700`;
    if (feedback) return `${base} bg-gray-50 border-gray-200 text-gray-400 cursor-default`;
    return `${base} bg-white border-gray-200 hover:border-sky-300 hover:bg-sky-50 text-gray-800 cursor-pointer`;
  };

  return (
    <main className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex justify-center gap-1.5">
        {passage.questions.map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-colors ${
            i < qIdx ? "bg-green-400" : i === qIdx ? "bg-sky-400" : "bg-gray-200"
          }`} />
        ))}
      </div>

      <div className="bg-white rounded-3xl border-2 border-sky-200 shadow-sm p-6 text-center">
        <div className="text-xs text-gray-400 mb-2">שאלה {qIdx + 1} מתוך {passage.questions.length}</div>
        <div className="text-xl font-bold text-sky-800" dir="ltr">{question.q}</div>
      </div>

      <div className="flex flex-col gap-3">
        {shuffledOptions.map((opt) => (
          <button
            key={opt}
            disabled={feedback !== null}
            onClick={() => handleSelect(opt)}
            className={optionClass(opt)}
            dir="ltr"
          >
            {opt}
          </button>
        ))}
      </div>
    </main>
  );
}

function Summary({ correct, total, passages, onAgain, onHome }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const perfect = pct === 100;
  return (
    <main className="max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-6 text-center">
      <div className="text-6xl">{perfect ? "🏆" : pct >= 70 ? "🎉" : "💪"}</div>
      <h2 className="text-3xl font-black text-sky-700">
        {perfect ? "מושלם!" : "כל הכבוד!"}
      </h2>
      <div className="text-lg text-gray-600">
        {correct} תשובות נכונות מתוך {total} שאלות
      </div>
      <div className="text-4xl font-black text-sky-700">{pct}%</div>
      <div className="text-sm text-gray-400">{passages} טקסטים</div>
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

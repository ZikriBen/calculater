// English vocabulary curriculum for Hebrew speakers.
// Each word entry: { en, he, tr } — English, Hebrew, תעתיק with ניקוד.
// Organised by grade → difficulty.

const VOCAB = {
  "א'": {
    easy: [
      { en: "cat", he: "חתול", tr: "קֶט" },
      { en: "dog", he: "כלב", tr: "דּוֹג" },
      { en: "ball", he: "כדור", tr: "בּוֹל" },
      { en: "sun", he: "שמש", tr: "סַן" },
      { en: "red", he: "אדום", tr: "רֶד" },
      { en: "blue", he: "כחול", tr: "בּלוּ" },
      { en: "one", he: "אחד", tr: "וַון" },
      { en: "two", he: "שניים", tr: "טוּ" },
      { en: "mom", he: "אמא", tr: "מוֹם" },
      { en: "dad", he: "אבא", tr: "דֶּד" },
      { en: "big", he: "גדול", tr: "בִּיג" },
      { en: "yes", he: "כן", tr: "יֶס" },
      { en: "no", he: "לא", tr: "נוֹ" },
      { en: "hi", he: "שלום", tr: "הַיי" },
    ],
    medium: [
      { en: "fish", he: "דג", tr: "פִישׁ" },
      { en: "bird", he: "ציפור", tr: "בֶּרְד" },
      { en: "tree", he: "עץ", tr: "טְרִי" },
      { en: "book", he: "ספר", tr: "בּוּק" },
      { en: "hand", he: "יד", tr: "הֶנְד" },
      { en: "head", he: "ראש", tr: "הֶד" },
      { en: "green", he: "ירוק", tr: "גְרִין" },
      { en: "three", he: "שלוש", tr: "תְ׳רִי" },
      { en: "four", he: "ארבע", tr: "פוֹר" },
      { en: "five", he: "חמש", tr: "פַייב" },
      { en: "boy", he: "ילד", tr: "בּוֹי" },
      { en: "girl", he: "ילדה", tr: "גֶּרְל" },
    ],
    hard: [
      { en: "house", he: "בית", tr: "הַאוּס" },
      { en: "water", he: "מים", tr: "ווֹטֶר" },
      { en: "happy", he: "שמח", tr: "הֶפִּי" },
      { en: "small", he: "קטן", tr: "סְמוֹל" },
      { en: "milk", he: "חלב", tr: "מִילְק" },
      { en: "apple", he: "תפוח", tr: "אֶפְּל" },
      { en: "door", he: "דלת", tr: "דּוֹר" },
      { en: "star", he: "כוכב", tr: "סְטָאר" },
      { en: "baby", he: "תינוק", tr: "בֵּיבִּי" },
      { en: "run", he: "לרוץ", tr: "רַן" },
    ],
  },

  "ב'": {
    easy: [
      { en: "school", he: "בית ספר", tr: "סְקוּל" },
      { en: "table", he: "שולחן", tr: "טֵיבְּל" },
      { en: "chair", he: "כיסא", tr: "צֶ׳יר" },
      { en: "pen", he: "עט", tr: "פֶּן" },
      { en: "bag", he: "תיק", tr: "בֶּג" },
      { en: "cake", he: "עוגה", tr: "קֵייק" },
      { en: "egg", he: "ביצה", tr: "אֶג" },
      { en: "six", he: "שש", tr: "סִיקְס" },
      { en: "seven", he: "שבע", tr: "סֶבְן" },
      { en: "eight", he: "שמונה", tr: "אֵייט" },
      { en: "nine", he: "תשע", tr: "נַיין" },
      { en: "ten", he: "עשר", tr: "טֶן" },
    ],
    medium: [
      { en: "flower", he: "פרח", tr: "פְלַאוְוֶר" },
      { en: "rain", he: "גשם", tr: "רֵיין" },
      { en: "snow", he: "שלג", tr: "סְנוֹ" },
      { en: "smile", he: "חיוך", tr: "סְמַייל" },
      { en: "sleep", he: "לישון", tr: "סְלִיפּ" },
      { en: "play", he: "לשחק", tr: "פְּלֵיי" },
      { en: "black", he: "שחור", tr: "בְּלֶק" },
      { en: "white", he: "לבן", tr: "ווַייט" },
      { en: "orange", he: "כתום", tr: "אוֹרֶנְג׳" },
      { en: "pink", he: "ורוד", tr: "פִּינְק" },
      { en: "ear", he: "אוזן", tr: "אִיר" },
      { en: "nose", he: "אף", tr: "נוֹז" },
    ],
    hard: [
      { en: "family", he: "משפחה", tr: "פֶמְלִי" },
      { en: "brother", he: "אח", tr: "בְּרַדֶ׳ר" },
      { en: "sister", he: "אחות", tr: "סִיסְטֶר" },
      { en: "friend", he: "חבר", tr: "פְרֶנְד" },
      { en: "teacher", he: "מורה", tr: "טִיצֶ׳ר" },
      { en: "garden", he: "גינה", tr: "גָּארְדֶן" },
      { en: "window", he: "חלון", tr: "ווִינְדוֹ" },
      { en: "morning", he: "בוקר", tr: "מוֹרְנִינְג" },
      { en: "night", he: "לילה", tr: "נַייט" },
      { en: "clock", he: "שעון", tr: "קְלוֹק" },
    ],
  },

  "ג'": {
    easy: [
      { en: "kitchen", he: "מטבח", tr: "קִיטְשֶׁן" },
      { en: "bedroom", he: "חדר שינה", tr: "בֶּדְרוּם" },
      { en: "clothes", he: "בגדים", tr: "קְלוֹדְ׳ז" },
      { en: "shirt", he: "חולצה", tr: "שֶׁרְט" },
      { en: "shoes", he: "נעליים", tr: "שׁוּז" },
      { en: "bread", he: "לחם", tr: "בְּרֶד" },
      { en: "chicken", he: "עוף", tr: "צִ׳יקֶן" },
      { en: "rice", he: "אורז", tr: "רַייס" },
      { en: "drink", he: "לשתות", tr: "דְרִינְק" },
      { en: "write", he: "לכתוב", tr: "רַייט" },
      { en: "read", he: "לקרוא", tr: "רִיד" },
      { en: "open", he: "לפתוח", tr: "אוֹפֶּן" },
    ],
    medium: [
      { en: "animal", he: "חיה", tr: "אֶנִימָל" },
      { en: "monkey", he: "קוף", tr: "מַנְקִי" },
      { en: "rabbit", he: "ארנב", tr: "רֶבִּיט" },
      { en: "elephant", he: "פיל", tr: "אֶלֶפַנְט" },
      { en: "horse", he: "סוס", tr: "הוֹרְס" },
      { en: "summer", he: "קיץ", tr: "סַמֶר" },
      { en: "winter", he: "חורף", tr: "ווִינְטֶר" },
      { en: "spring", he: "אביב", tr: "סְפְּרִינְג" },
      { en: "weather", he: "מזג אוויר", tr: "ווֶדֶ׳ר" },
      { en: "country", he: "ארץ", tr: "קַנְטְרִי" },
      { en: "city", he: "עיר", tr: "סִיטִי" },
      { en: "river", he: "נהר", tr: "רִיבֶר" },
    ],
    hard: [
      { en: "beautiful", he: "יפה", tr: "בְּיוּטִיפוּל" },
      { en: "different", he: "שונה", tr: "דִיפְרֶנְט" },
      { en: "important", he: "חשוב", tr: "אִימְפּוֹרְטֶנְט" },
      { en: "together", he: "ביחד", tr: "טוּגֶדֶ׳ר" },
      { en: "between", he: "בין", tr: "בִּיטְוִין" },
      { en: "because", he: "כי", tr: "בִּיקוֹז" },
      { en: "chocolate", he: "שוקולד", tr: "צָ׳וֹקְלֶט" },
      { en: "sandwich", he: "סנדוויץ'", tr: "סֶנְדְווִיצ׳" },
      { en: "birthday", he: "יום הולדת", tr: "בֶּרְתְ׳דֵיי" },
      { en: "remember", he: "לזכור", tr: "רִימֶמְבֶּר" },
    ],
  },

  "ד'": {
    easy: [
      { en: "breakfast", he: "ארוחת בוקר", tr: "בְּרֶקְפֶסְט" },
      { en: "lunch", he: "ארוחת צהריים", tr: "לַנְצ׳" },
      { en: "dinner", he: "ארוחת ערב", tr: "דִינֶר" },
      { en: "market", he: "שוק", tr: "מָארְקֶט" },
      { en: "money", he: "כסף", tr: "מַנִי" },
      { en: "street", he: "רחוב", tr: "סְטְרִיט" },
      { en: "hospital", he: "בית חולים", tr: "הוֹסְפִּיטָל" },
      { en: "doctor", he: "רופא", tr: "דּוֹקְטוֹר" },
      { en: "drive", he: "לנהוג", tr: "דְרַייב" },
      { en: "travel", he: "לטייל", tr: "טְרֶבְל" },
      { en: "answer", he: "תשובה", tr: "אֶנְסֶר" },
      { en: "question", he: "שאלה", tr: "קְוֶסְטְשֶׁן" },
    ],
    medium: [
      { en: "holiday", he: "חופשה", tr: "הוֹלִידֵיי" },
      { en: "language", he: "שפה", tr: "לֶנְגְווִיג׳" },
      { en: "newspaper", he: "עיתון", tr: "נְיוּזְפֵּייפֶּר" },
      { en: "mountain", he: "הר", tr: "מַאוּנְטֶן" },
      { en: "island", he: "אי", tr: "אַיילֶנְד" },
      { en: "problem", he: "בעיה", tr: "פְּרוֹבְּלֶם" },
      { en: "strange", he: "מוזר", tr: "סְטְרֵיינְג׳" },
      { en: "already", he: "כבר", tr: "אוֹלְרֶדִי" },
      { en: "example", he: "דוגמה", tr: "אֶגְזֶמְפְּל" },
      { en: "picture", he: "תמונה", tr: "פִּיקְצֶ׳ר" },
    ],
    hard: [
      { en: "dangerous", he: "מסוכן", tr: "דֵיינְגֶ׳רֶס" },
      { en: "exercise", he: "תרגיל", tr: "אֶקְסֶרְסַייז" },
      { en: "furniture", he: "רהיטים", tr: "פֶרְנִיצֶ׳ר" },
      { en: "library", he: "ספרייה", tr: "לַייבְּרֶרִי" },
      { en: "favourite", he: "אהוב", tr: "פֵייבְרִיט" },
      { en: "surprise", he: "הפתעה", tr: "סֶרְפְּרַייז" },
      { en: "vegetable", he: "ירק", tr: "בֶ׳גְ׳טָבְּל" },
      { en: "umbrella", he: "מטרייה", tr: "אַמְבְּרֶלָה" },
      { en: "comfortable", he: "נוח", tr: "קַמְפוֹרְטָבְּל" },
      { en: "wonderful", he: "נפלא", tr: "ווַנְדֶרְפוּל" },
    ],
  },

  "ה'": {
    easy: [
      { en: "adventure", he: "הרפתקה", tr: "אֶדְבֶנְצֶ׳ר" },
      { en: "character", he: "דמות", tr: "קֶרֶקְטֶר" },
      { en: "describe", he: "לתאר", tr: "דִיסְקְרַייבּ" },
      { en: "discover", he: "לגלות", tr: "דִיסְקַבֶר" },
      { en: "government", he: "ממשלה", tr: "גַבֶרְנְמֶנְט" },
      { en: "journey", he: "מסע", tr: "גֶ׳רְנִי" },
      { en: "museum", he: "מוזיאון", tr: "מְיוּזִיאָם" },
      { en: "neighbor", he: "שכן", tr: "נֵייבֶּר" },
      { en: "sentence", he: "משפט", tr: "סֶנְטֶנְס" },
      { en: "thousand", he: "אלף", tr: "תָ׳אוּזֶנְד" },
    ],
    medium: [
      { en: "celebrate", he: "לחגוג", tr: "סֶלֶבְּרֵייט" },
      { en: "communicate", he: "לתקשר", tr: "קוֹמְיוּנִיקֵייט" },
      { en: "environment", he: "סביבה", tr: "אֶנְבַיירוֹנְמֶנְט" },
      { en: "experience", he: "ניסיון", tr: "אֶקְסְפִּירִיאֶנְס" },
      { en: "imagination", he: "דמיון", tr: "אִימֶגִ׳ינֵיישֶׁן" },
      { en: "opinion", he: "דעה", tr: "אוֹפִּינְיֶן" },
      { en: "population", he: "אוכלוסייה", tr: "פּוֹפְּיוּלֵיישֶׁן" },
      { en: "recognize", he: "לזהות", tr: "רֶקוֹגְנַייז" },
      { en: "temperature", he: "טמפרטורה", tr: "טֶמְפְּרֶצֶ׳ר" },
      { en: "volunteer", he: "מתנדב", tr: "בוֹלַנְטִיר" },
    ],
    hard: [
      { en: "atmosphere", he: "אטמוספרה", tr: "אֶטְמוֹסְפִיר" },
      { en: "consequence", he: "תוצאה", tr: "קוֹנְסֶקְוֶנְס" },
      { en: "determination", he: "נחישות", tr: "דִיטֶרְמִינֵיישֶׁן" },
      { en: "explanation", he: "הסבר", tr: "אֶקְסְפְּלֶנֵיישֶׁן" },
      { en: "independent", he: "עצמאי", tr: "אִינְדִיפֶּנְדֶנְט" },
      { en: "opportunity", he: "הזדמנות", tr: "אוֹפּוֹרְטוּנִיטִי" },
      { en: "responsibility", he: "אחריות", tr: "רִיסְפּוֹנְסִיבִּילִיטִי" },
      { en: "knowledge", he: "ידע", tr: "נוֹלֶג׳" },
      { en: "necessary", he: "הכרחי", tr: "נֶסֶסֶרִי" },
      { en: "unfortunately", he: "לצערי", tr: "אַנְפוֹרְצֶ׳נֶטְלִי" },
    ],
  },

  "ו'": {
    easy: [
      { en: "achievement", he: "הישג", tr: "אֶצִ׳יבְמֶנְט" },
      { en: "competition", he: "תחרות", tr: "קוֹמְפֶּטִישֶׁן" },
      { en: "conclusion", he: "מסקנה", tr: "קוֹנְקְלוּזֶ׳ן" },
      { en: "education", he: "חינוך", tr: "אֶדְיוּקֵיישֶׁן" },
      { en: "generation", he: "דור", tr: "גֶ׳נֶרֵיישֶׁן" },
      { en: "ingredient", he: "מרכיב", tr: "אִינְגְרִידִיאֶנְט" },
      { en: "literature", he: "ספרות", tr: "לִיטֶרֶצֶ׳ר" },
      { en: "paragraph", he: "פסקה", tr: "פֶּרֶגְרָאף" },
      { en: "suggestion", he: "הצעה", tr: "סַגֶ׳סְטְשֶׁן" },
      { en: "technology", he: "טכנולוגיה", tr: "טֶקְנוֹלוֹגִ׳י" },
    ],
    medium: [
      { en: "apparently", he: "כנראה", tr: "אֶפֶּרֶנְטְלִי" },
      { en: "circumstances", he: "נסיבות", tr: "סֶרְקַמְסְטֶנְסֶז" },
      { en: "development", he: "פיתוח", tr: "דִיבֶלוֹפְּמֶנְט" },
      { en: "immediately", he: "מיד", tr: "אִימִידִיאֶטְלִי" },
      { en: "investigate", he: "לחקור", tr: "אִינְבֶסְטִיגֵייט" },
      { en: "professional", he: "מקצועי", tr: "פְּרוֹפֶשֶׁנָל" },
      { en: "community", he: "קהילה", tr: "קוֹמְיוּנִיטִי" },
      { en: "definitely", he: "בהחלט", tr: "דֶפִינִיטְלִי" },
      { en: "eventually", he: "בסופו של דבר", tr: "אִיבֶנְצוּאָלִי" },
      { en: "experiment", he: "ניסוי", tr: "אֶקְסְפֶּרִימֶנְט" },
    ],
    hard: [
      { en: "accommodate", he: "להכיל", tr: "אֶקוֹמוֹדֵייט" },
      { en: "controversial", he: "שנוי במחלוקת", tr: "קוֹנְטְרוֹבֶרְשָׁל" },
      { en: "encyclopedia", he: "אנציקלופדיה", tr: "אֶנְסַיקְלוֹפִּידִיאָה" },
      { en: "extraordinary", he: "יוצא דופן", tr: "אֶקְסְטְרוֹרְדִינֶרִי" },
      { en: "guarantee", he: "ערבות", tr: "גֶּרֶנְטִי" },
      { en: "manufacture", he: "לייצר", tr: "מֶנְיוּפֶקְצֶ׳ר" },
      { en: "particularly", he: "במיוחד", tr: "פָּארְטִיקְיוּלֶרְלִי" },
      { en: "significance", he: "משמעות", tr: "סִיגְנִיפִיקֶנְס" },
      { en: "approximately", he: "בקירוב", tr: "אֶפְּרוֹקְסִימֶטְלִי" },
      { en: "psychological", he: "פסיכולוגי", tr: "סַייקוֹלוֹגִ׳יקָל" },
    ],
  },
};

// Grades ז'-ח' share ו' vocab at higher difficulty, plus additional words
VOCAB["ז'"] = VOCAB["ו'"];
VOCAB["ח'"] = VOCAB["ו'"];

// Grades that aren't explicitly listed fall back to the closest match
const gradeFor = (g) => VOCAB[g] || VOCAB["ד'"];

export const ENGLISH_CURRICULUM = Object.fromEntries(
  Object.entries(VOCAB).map(([grade, pool]) => [
    grade,
    {
      easy: pool.easy.map(w => w.en),
      medium: pool.medium.map(w => w.en),
      hard: pool.hard.map(w => w.en),
    },
  ])
);

export const ENGLISH_QUICK_TOPICS = Object.fromEntries(
  Object.keys(VOCAB).map(grade => [
    grade,
    [
      { emoji: "🃏", label: "התאמת מילים", topic: "word-match", difficulty: "easy" },
      { emoji: "✍️", label: "איות מהיר", topic: "spelling-sprint", difficulty: "medium" },
      { emoji: "📝", label: "השלמת משפטים", topic: "sentence-fill", difficulty: "hard" },
    ],
  ])
);

export const vocabFor = (grade, difficulty) => {
  const pool = gradeFor(grade);
  return pool?.[difficulty] || pool?.easy || [];
};

export const allVocabFor = (grade) => {
  const pool = gradeFor(grade);
  return [...(pool?.easy || []), ...(pool?.medium || []), ...(pool?.hard || [])];
};

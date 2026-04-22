import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STUDENT, THEMES, GRADES, saveStudent, themeTokens, useStudent } from "@/lib/student";

export default function StudentSettings() {
  useStudent();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(STUDENT.name);
  const [gender, setGender] = useState(STUDENT.gender);
  const [grade, setGrade] = useState(STUDENT.grade);
  const [theme, setTheme] = useState(STUDENT.theme);
  const tokens = themeTokens();

  const onOpen = (next) => {
    if (next) {
      setName(STUDENT.name);
      setGender(STUDENT.gender);
      setGrade(STUDENT.grade);
      setTheme(STUDENT.theme);
    }
    setOpen(next);
  };

  const handleSave = () => {
    const trimmed = name.trim() || STUDENT.name;
    saveStudent({ name: trimmed, gender, grade, theme });
    setOpen(false);
  };

  return (
    <>
      <button
        dir="rtl"
        onClick={() => onOpen(true)}
        title="הגדרות תלמיד/ה"
        className={`w-9 h-9 rounded-full bg-gradient-to-br ${tokens.avatarGradient} flex items-center justify-center text-center text-lg leading-none shadow-sm hover:scale-105 transition-transform`}
      >
        {tokens.emoji}
      </button>

      <Dialog open={open} onOpenChange={onOpen}>
        <DialogContent dir="rtl" className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">הגדרות תלמיד/ה</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="student-name">שם</Label>
              <Input
                id="student-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="הכנס שם"
                className={name ? "" : "text-gray-400"}
              />
            </div>

            <div className="space-y-1.5">
              <Label>מין</Label>
              <div className="flex gap-2">
                {[{ v: "female", l: "בת 👧" }, { v: "male", l: "בן 👦" }].map(o => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => setGender(o.v)}
                    className={`flex-1 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-all ${
                      gender === o.v
                        ? "border-purple-500 bg-purple-50 text-purple-800"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>כיתה (רמת התרגילים)</Label>
              <div className="grid grid-cols-6 gap-1.5">
                {GRADES.map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGrade(g)}
                    className={`rounded-lg border-2 py-2 text-sm font-semibold transition-all ${
                      grade === g
                        ? "border-purple-500 bg-purple-50 text-purple-800"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>ערכת נושא</Label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(THEMES).map(([key, t]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTheme(key)}
                    className={`rounded-xl border-2 px-2 py-3 flex flex-col items-center gap-1 transition-all ${
                      theme === key ? "border-gray-800 ring-2 ring-gray-300" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarGradient} flex items-center justify-center text-xl`}>
                      {t.avatar}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
            <Button onClick={handleSave} className={`bg-gradient-to-r ${tokens.ctaGradient} text-white`}>
              שמור
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

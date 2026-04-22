import { Button } from "@/components/ui/button";

const COMMANDS = [
  { label: "🔁 עוד תרגילים", cmd: "עוד תרגילים" },
  { label: "🔴 יותר קשה", cmd: "יותר קשה" },
  { label: "🟢 יותר קל", cmd: "יותר קל" },
  { label: "✅ בדיקה", cmd: "בדיקה" },
  { label: "🔄 אפס יום", cmd: "אפס יום" },
];

export default function CommandButtons({ onCommand }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide" dir="rtl">
      {COMMANDS.map((c) => (
        <Button
          key={c.cmd}
          variant="outline"
          size="sm"
          onClick={() => onCommand(c.cmd)}
          className="whitespace-nowrap rounded-full border-purple-200 text-purple-700 hover:bg-purple-50 text-xs flex-shrink-0 h-8"
        >
          {c.label}
        </Button>
      ))}
    </div>
  );
}
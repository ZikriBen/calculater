import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, ImagePlus } from "lucide-react";

export default function InputBar({ onSend, isLoading }) {
  const [text, setText] = useState("");
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isLoading) textareaRef.current?.focus();
  }, [isLoading]);

  const handleSend = () => {
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onSend("", file);
      e.target.value = "";
    }
  };

  return (
    <div className="flex gap-2 items-end" dir="rtl">
      <Button
        variant="outline"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="h-11 w-11 rounded-2xl border-purple-200 text-purple-500 hover:bg-purple-50 flex-shrink-0"
        title="העלי תמונת מבחן"
      >
        <ImagePlus className="w-5 h-5" />
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="כתבי הודעה או פקודה..."
          disabled={isLoading}
          rows={1}
          autoFocus
          className="w-full resize-none rounded-2xl border border-purple-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 text-right placeholder:text-purple-300 disabled:opacity-50"
          style={{ minHeight: "44px", maxHeight: "120px", overflowY: "hidden" }}
          onInput={(e) => {
            e.target.style.height = "auto";
            const next = Math.min(e.target.scrollHeight, 120);
            e.target.style.height = next + "px";
            e.target.style.overflowY = e.target.scrollHeight > 120 ? "auto" : "hidden";
          }}
        />
      </div>

      <Button
        onClick={handleSend}
        disabled={!text.trim() || isLoading}
        size="icon"
        className="h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md shadow-purple-200 flex-shrink-0"
      >
        <Send className="w-4 h-4 text-white" />
      </Button>
    </div>
  );
}
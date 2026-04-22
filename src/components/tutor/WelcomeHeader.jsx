import React from 'react';
import { Sparkles, Star } from 'lucide-react';

export default function WelcomeHeader({ dayNumber }) {
  return (
    <div dir="rtl" className="text-center space-y-3">
      <div className="flex items-center justify-center gap-2">
        <Star className="w-6 h-6 text-accent fill-accent" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary">
          שלום אביגיל! 🌸
        </h1>
        <Star className="w-6 h-6 text-accent fill-accent" />
      </div>
      <p className="text-muted-foreground text-lg">
        המורה הפרטי שלך לחשבון
      </p>
      {dayNumber > 0 && (
        <div className="inline-flex items-center gap-2 bg-secondary rounded-full px-5 py-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-semibold text-secondary-foreground">
            ⭐ יום {dayNumber}
          </span>
        </div>
      )}
    </div>
  );
}
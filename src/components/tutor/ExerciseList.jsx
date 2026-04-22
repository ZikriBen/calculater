import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const difficultyConfig = {
  easy: { emoji: '🟢', label: 'קל', color: 'bg-green-100 text-green-700 border-green-200' },
  medium: { emoji: '🟡', label: 'בינוני', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  hard: { emoji: '🔴', label: 'מאתגר', color: 'bg-red-100 text-red-700 border-red-200' },
};

export default function ExerciseList({ exercises, topic, showAnswers }) {
  if (!exercises?.length) return null;

  const grouped = {
    easy: exercises.filter(e => e.difficulty === 'easy'),
    medium: exercises.filter(e => e.difficulty === 'medium'),
    hard: exercises.filter(e => e.difficulty === 'hard'),
  };

  return (
    <Card dir="rtl" className="overflow-hidden">
      <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          📘 {topic}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {Object.entries(grouped).map(([level, items]) => {
          if (!items.length) return null;
          const config = difficultyConfig[level];
          return (
            <div key={level} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={config.color}>
                  {config.emoji} {config.label}
                </Badge>
                <span className="text-xs text-muted-foreground">({items.length} תרגילים)</span>
              </div>
              <div className="space-y-2.5">
                {items.map((ex, idx) => (
                  <ExerciseItem key={ex.id || idx} exercise={ex} index={idx + 1} showAnswer={showAnswers} />
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ExerciseItem({ exercise, index, showAnswer }) {
  return (
    <div className="flex items-start gap-3 py-2 px-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
      <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
        {index}
      </span>
      <div className="flex-1 space-y-1">
        <p className="text-foreground font-medium leading-relaxed whitespace-pre-wrap" style={{ direction: 'rtl', fontVariantNumeric: 'tabular-nums' }}>
          {exercise.question}
        </p>
        {showAnswer && exercise.answer && (
          <p className="text-sm text-primary font-semibold mt-1">
            ✅ תשובה: {exercise.answer}
          </p>
        )}
      </div>
    </div>
  );
}
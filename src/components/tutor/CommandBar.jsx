import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Plus, ChevronUp, ChevronDown, CheckCircle } from 'lucide-react';

const commands = [
  { id: 'reset', label: 'אפס יום', icon: RotateCcw, variant: 'outline' },
  { id: 'more', label: 'עוד תרגילים', icon: Plus, variant: 'outline' },
  { id: 'harder', label: 'יותר קשה', icon: ChevronUp, variant: 'outline' },
  { id: 'easier', label: 'יותר קל', icon: ChevronDown, variant: 'outline' },
  { id: 'check', label: 'בדיקה', icon: CheckCircle, variant: 'default' },
];

export default function CommandBar({ onCommand, disabled }) {
  return (
    <div dir="rtl" className="flex flex-wrap justify-center gap-2">
      {commands.map(cmd => (
        <Button
          key={cmd.id}
          variant={cmd.variant}
          size="sm"
          onClick={() => onCommand(cmd.id)}
          disabled={disabled}
          className="rounded-full gap-1.5 text-sm font-medium"
        >
          <cmd.icon className="w-4 h-4" />
          {cmd.label}
        </Button>
      ))}
    </div>
  );
}
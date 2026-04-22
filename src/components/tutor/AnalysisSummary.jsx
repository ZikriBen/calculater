import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Target, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AnalysisSummary({ analysis }) {
  if (!analysis) return null;

  return (
    <Card dir="rtl" className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Target className="w-5 h-5 text-primary" />
          ניתוח המבחן 📋
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {analysis.summary && (
          <p className="text-foreground leading-relaxed">{analysis.summary}</p>
        )}

        {analysis.weaknesses?.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
              <AlertTriangle className="w-4 h-4" />
              צריך חיזוק ב:
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.weaknesses.map((w, i) => (
                <Badge key={i} variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
                  {w}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {analysis.patterns?.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <TrendingUp className="w-4 h-4" />
              דפוסים שזיהיתי:
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {analysis.patterns.map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

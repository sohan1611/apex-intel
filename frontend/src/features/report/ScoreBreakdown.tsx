'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { ScoreBreakdown as ScoreBreakdownType } from '@/types/report';
import SignalBadge from '@/components/ui/SignalBadge';

interface ScoreBreakdownProps {
  score: ScoreBreakdownType;
}

function getBarColor(value: number, max: number): string {
  const pct = (value / max) * 100;
  if (pct > 70) return 'bg-emerald-500';
  if (pct > 40) return 'bg-amber-500';
  return 'bg-red-500';
}

export default function ScoreBreakdown({ score }: ScoreBreakdownProps) {
  const dimensions = [
    { label: 'Market Opportunity', value: score.market_opportunity, max: 30 },
    { label: 'Competition Intensity', value: score.competition_intensity, max: 25 },
    { label: 'Execution Feasibility', value: score.execution_feasibility, max: 20 },
    { label: 'Risk Exposure', value: score.risk_exposure, max: 25 },
  ];

  return (
    <div>
      {/* Bar charts */}
      {dimensions.map((d) => (
        <div key={d.label} className="flex items-center gap-4 mb-4">
          <span className="text-sm text-text-secondary w-48 shrink-0">
            {d.label}
          </span>
          <div className="flex-1 bg-bg-primary rounded-full h-3 overflow-hidden">
            <div
              className={cn(
                'rounded-full h-full transition-all duration-700 ease-out',
                getBarColor(d.value, d.max)
              )}
              style={{ width: `${(d.value / d.max) * 100}%` }}
            />
          </div>
          <span className="font-mono text-sm text-text-primary w-16 text-right shrink-0">
            {d.value}/{d.max}
          </span>
        </div>
      ))}

      {/* Total score */}
      <div className="border-t border-border-default pt-6 mt-6">
        <div className="flex items-center gap-6">
          <span className="text-5xl font-mono font-bold text-text-primary">
            {score.total_score}
            <span className="text-2xl text-text-tertiary">/100</span>
          </span>
          <SignalBadge signal={score.investment_signal} />
        </div>

        {/* Justification */}
        {score.justification && (
          <p className="text-sm text-text-secondary leading-relaxed mt-4 max-w-2xl">
            {score.justification}
          </p>
        )}
      </div>
    </div>
  );
}

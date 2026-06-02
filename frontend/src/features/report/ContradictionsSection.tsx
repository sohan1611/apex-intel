'use client';

import { cn } from '@/lib/utils';
import type { Contradiction } from '@/types/report';
import { CheckCircle2, Zap } from 'lucide-react';

interface ContradictionsSectionProps {
  contradictions: Contradiction[];
}

export default function ContradictionsSection({ contradictions }: ContradictionsSectionProps) {
  if (!contradictions || contradictions.length === 0) {
    return (
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-emerald-400 w-5 h-5" />
          <span className="text-sm text-emerald-400">
            No contradictions detected — agent outputs are consistent.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {contradictions.map((item, index) => {
        const isResolved = item.resolved;

        return (
          <div
            key={index}
            className={cn(
              'bg-bg-tertiary rounded-xl p-5 mb-3 border border-border-subtle border-l-3',
              isResolved ? 'border-l-emerald-500' : 'border-l-amber-500'
            )}
          >
            {/* Top row */}
            <div className="flex items-start gap-3">
              <Zap
                className={cn(
                  'w-5 h-5 shrink-0 mt-0.5',
                  isResolved ? 'text-emerald-400' : 'text-amber-400'
                )}
              />
              <span className="font-medium text-text-primary flex-1">
                {item.description}
              </span>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-md shrink-0',
                  isResolved
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-amber-500/15 text-amber-400'
                )}
              >
                {isResolved ? 'Resolved' : 'Unresolved'}
              </span>
            </div>

            {/* Resolution */}
            <div className="mt-3 ml-8">
              <span className="text-xs uppercase tracking-wider text-text-tertiary">
                Resolution:
              </span>
              <p className="text-sm text-text-secondary italic mt-1 leading-relaxed">
                {item.resolution_or_flag}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

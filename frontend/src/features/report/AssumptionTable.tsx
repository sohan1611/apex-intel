'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { AssumptionEntry } from '@/types/report';
import SourceTag from '@/components/ui/SourceTag';

interface AssumptionTableProps {
  assumptions: AssumptionEntry[];
}

const difficultyStyles: Record<string, string> = {
  HARD: 'bg-red-500/15 text-red-400',
  MEDIUM: 'bg-amber-500/15 text-amber-400',
  EASY: 'bg-emerald-500/15 text-emerald-400',
};

const impactStyles: Record<string, string> = {
  FATAL: 'bg-red-500/15 text-red-400',
  MODERATE: 'bg-amber-500/15 text-amber-400',
  LOW: 'bg-blue-500/15 text-blue-400',
};

export default function AssumptionTable({ assumptions }: AssumptionTableProps) {
  if (!assumptions || assumptions.length === 0) {
    return (
      <p className="text-sm text-text-tertiary">No assumptions documented</p>
    );
  }

  return (
    <div className="bg-bg-tertiary rounded-xl border border-border-subtle overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-bg-secondary">
          <tr>
            <th className="text-xs uppercase tracking-wider text-text-tertiary px-4 py-3 font-medium">
              Assumption
            </th>
            <th className="text-xs uppercase tracking-wider text-text-tertiary px-4 py-3 font-medium">
              Validation Difficulty
            </th>
            <th className="text-xs uppercase tracking-wider text-text-tertiary px-4 py-3 font-medium">
              Impact if False
            </th>
            <th className="text-xs uppercase tracking-wider text-text-tertiary px-4 py-3 font-medium">
              Source
            </th>
          </tr>
        </thead>
        <tbody>
          {assumptions.map((item, index) => (
            <tr
              key={index}
              className={cn(
                'border-b border-border-subtle hover:bg-bg-secondary/50 transition-colors',
                index === assumptions.length - 1 && 'border-b-0'
              )}
            >
              <td className="px-4 py-4 text-sm text-text-primary max-w-[300px]">
                {item.assumption}
              </td>
              <td className="px-4 py-4 text-sm">
                <span
                  className={cn(
                    'text-xs font-medium uppercase px-2 py-0.5 rounded-md inline-block',
                    difficultyStyles[item.validation_difficulty]
                  )}
                >
                  {item.validation_difficulty}
                </span>
              </td>
              <td className="px-4 py-4 text-sm">
                <span
                  className={cn(
                    'text-xs font-medium uppercase px-2 py-0.5 rounded-md inline-block',
                    impactStyles[item.impact_if_false]
                  )}
                >
                  {item.impact_if_false}
                </span>
              </td>
              <td className="px-4 py-4 text-sm">
                <SourceTag source={item.source} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

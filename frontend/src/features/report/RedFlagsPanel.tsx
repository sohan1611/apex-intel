'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { RedFlag } from '@/types/report';
import SeverityBadge from '@/components/ui/SeverityBadge';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface RedFlagsPanelProps {
  flags: RedFlag[];
}

export default function RedFlagsPanel({ flags }: RedFlagsPanelProps) {
  if (!flags || flags.length === 0) {
    return (
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-emerald-400 w-5 h-5" />
          <span className="text-sm text-emerald-400">
            No critical red flags identified — analysis appears clean.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-500/5 border border-red-500/20 rounded-xl overflow-hidden">
      {flags.map((flag, index) => (
        <div
          key={index}
          className={cn(
            'p-4 flex items-start gap-3',
            index < flags.length - 1 && 'border-b border-red-500/10'
          )}
        >
          <AlertTriangle className="text-red-400 w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm text-text-primary font-medium">
                {flag.flag}
              </span>
              <SeverityBadge severity={flag.severity} />
            </div>
            {flag.related_agents && flag.related_agents.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {flag.related_agents.map((agent) => (
                  <span
                    key={agent}
                    className="bg-bg-secondary text-text-tertiary text-xs px-2 py-0.5 rounded-md"
                  >
                    {agent}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

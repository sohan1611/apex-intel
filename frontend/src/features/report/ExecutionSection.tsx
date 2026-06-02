'use client';

import React from 'react';
import type { ExecutionFeasibility } from '@/types/report';
import SeverityBadge from '@/components/ui/SeverityBadge';
import SourceTag from '@/components/ui/SourceTag';
import { Settings, DollarSign, Clock } from 'lucide-react';

interface ExecutionSectionProps {
  execution: ExecutionFeasibility | null;
}

export default function ExecutionSection({ execution }: ExecutionSectionProps) {
  if (!execution) {
    return (
      <p className="text-sm text-text-tertiary">
        No execution feasibility data available
      </p>
    );
  }

  return (
    <div>
      {/* Metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Operational Difficulty */}
        <div className="bg-bg-tertiary rounded-xl p-5 border border-border-subtle">
          <div className="text-xs uppercase tracking-wider text-text-tertiary mb-2 flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            Operational Difficulty
          </div>
          <SeverityBadge severity={execution.operational_difficulty} />
        </div>

        {/* Capital Requirements */}
        <div className="bg-bg-tertiary rounded-xl p-5 border border-border-subtle">
          <div className="text-xs uppercase tracking-wider text-text-tertiary mb-2 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            Capital Requirements
          </div>
          <SeverityBadge severity={execution.capital_requirements} />
        </div>

        {/* Time to Market */}
        <div className="bg-bg-tertiary rounded-xl p-5 border border-border-subtle">
          <div className="text-xs uppercase tracking-wider text-text-tertiary mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Time to Market
          </div>
          <span className="text-sm font-medium text-text-primary">
            {execution.time_to_market}
          </span>
        </div>
      </div>

      {/* Rationale card */}
      <div className="bg-bg-tertiary rounded-xl p-5 border border-border-subtle mt-4">
        <div className="text-xs uppercase tracking-wider text-text-tertiary mb-2">
          Rationale
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">
          {execution.rationale}
        </p>
        <div className="mt-3 flex justify-end">
          <SourceTag source={execution.source} />
        </div>
      </div>
    </div>
  );
}

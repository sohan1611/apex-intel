'use client';

import { cn } from '@/lib/utils';
import type { PipelinePhase } from '@/types/report';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AgentStatusRow } from './AgentStatusRow';

interface PhaseCardProps {
  phase: PipelinePhase;
  index: number;
}

const BORDER_COLORS: Record<string, string> = {
  completed: 'border-l-status-completed',
  running: 'border-l-status-running',
  queued: 'border-l-bg-tertiary',
  failed: 'border-l-status-failed',
};

const PROGRESS_COLORS: Record<string, string> = {
  completed: 'bg-status-completed',
  running: 'bg-status-running',
  queued: 'bg-bg-tertiary',
  failed: 'bg-status-failed',
};

export function PhaseCard({ phase, index }: PhaseCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border-default bg-bg-secondary overflow-hidden transition-all duration-300',
        'border-l-[3px]',
        BORDER_COLORS[phase.status] ?? 'border-l-bg-tertiary'
      )}
    >
      {/* Phase Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
              phase.status === 'completed'
                ? 'bg-status-completed/10 text-status-completed'
                : phase.status === 'running'
                ? 'bg-status-running/10 text-status-running'
                : 'bg-bg-tertiary text-text-muted'
            )}
          >
            {index + 1}
          </span>
          <div>
            <h3 className="text-sm font-medium text-text-primary">
              {phase.name}
            </h3>
          </div>
        </div>
        <StatusBadge status={phase.status} />
      </div>

      {/* Progress */}
      <div className="px-4 pb-3">
        <ProgressBar
          value={phase.progress}
          colorClass={PROGRESS_COLORS[phase.status]}
        />
      </div>

      {/* Agents */}
      {phase.agents && phase.agents.length > 0 && (
        <div className="border-t border-border-default px-2 py-2">
          {phase.agents.map((agent) => (
            <AgentStatusRow
              key={agent.name}
              name={agent.name}
              status={agent.status}
            />
          ))}
        </div>
      )}
    </div>
  );
}

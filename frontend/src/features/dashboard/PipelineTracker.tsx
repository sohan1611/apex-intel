'use client';

import type { PipelinePhase } from '@/types/report';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PhaseCard } from './PhaseCard';

interface PipelineTrackerProps {
  phases: PipelinePhase[];
}

export function PipelineTracker({ phases }: PipelineTrackerProps) {
  // Calculate overall progress
  const overallProgress =
    phases.length > 0
      ? Math.round(
          phases.reduce((sum, p) => sum + p.progress, 0) / phases.length
        )
      : 0;

  const completedCount = phases.filter((p) => p.status === 'completed').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">
          Pipeline Progress
        </h2>
        <span className="text-xs font-medium text-text-tertiary tabular-nums">
          {completedCount}/{phases.length} phases complete
        </span>
      </div>

      {/* Phase Cards */}
      <div className="space-y-3 stagger-children">
        {phases.map((phase, i) => (
          <PhaseCard key={phase.id} phase={phase} index={i} />
        ))}
      </div>

      {/* Overall Progress */}
      <div className="rounded-lg border border-border-default bg-bg-secondary p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-secondary">
            Overall Progress
          </span>
          <span className="text-sm font-semibold text-text-primary tabular-nums">
            {overallProgress}%
          </span>
        </div>
        <ProgressBar value={overallProgress} size="md" />
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PipelineTracker } from '@/features/dashboard/PipelineTracker';
import { MOCK_PIPELINE_PHASES } from '@/lib/mock-data';
import type { PipelinePhase } from '@/types/report';
import { useAnalysisStatus } from '@/hooks/use-api';

// Simulation Logic removed in favor of real backend status.

function derivePhaseStatus(progress: number): 'queued' | 'running' | 'completed' {
  if (progress >= 100) return 'completed';
  if (progress > 0) return 'running';
  return 'queued';
}

function deriveAgentStatuses(
  phase: PipelinePhase,
  progress: number
): PipelinePhase {
  if (!phase.agents || phase.agents.length === 0) {
    return { ...phase, progress, status: derivePhaseStatus(progress) };
  }

  const total = phase.agents.length;
  const completedFraction = progress / 100;
  const completedCount = Math.floor(completedFraction * total);
  const hasRunning = progress > 0 && progress < 100;

  const agents = phase.agents.map((agent, i) => {
    if (i < completedCount) return { ...agent, status: 'completed' as const };
    if (i === completedCount && hasRunning) return { ...agent, status: 'running' as const };
    return { ...agent, status: 'waiting' as const };
  });

  return {
    ...phase,
    progress,
    status: derivePhaseStatus(progress),
    agents,
  };
}

// Page Component

export default function AnalysisDashboardPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data, isLoading, isError, error } = useAnalysisStatus(id);

  const isComplete = data?.status === 'completed';
  const isFailed = data?.status === 'failed';

  // Map backend progress (0-100) to 5 distinct phases
  const overallProgress = data?.progress || 0;
  
  // Quick mapper: 5 phases, each takes up 20% of the overall progress
  const phaseProgress = [0, 1, 2, 3, 4].map((idx) => {
    const phaseStart = idx * 20;
    const phaseEnd = (idx + 1) * 20;
    if (overallProgress >= phaseEnd) return 100;
    if (overallProgress <= phaseStart) return 0;
    return ((overallProgress - phaseStart) / 20) * 100;
  });

  const phases: PipelinePhase[] = MOCK_PIPELINE_PHASES.map((phase, i) =>
    deriveAgentStatuses(phase, phaseProgress[i])
  );

  const currentPhaseStatus = isComplete ? 'completed' : isFailed ? 'failed' : 'running';

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 px-6 pt-16 pb-12">
          <div className="mx-auto max-w-2xl text-center">
            <AlertCircle className="h-12 w-12 text-signal-weak mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-text-primary mb-2">Failed to load analysis status</h1>
            <p className="text-text-secondary">{error?.message || 'An unknown error occurred.'}</p>
            <Link href="/analyze" className="mt-6 inline-flex items-center text-accent-primary hover:underline">
              ← Return to Analyze Page
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <PageHeader
        title={`Analyzing ID: ${id}`}
        subtitle={`Current phase: ${data?.current_phase || 'Initializing...'}`}
      >
        <div className="mt-2 flex items-center gap-4">
          <StatusBadge status={currentPhaseStatus} size="md" />
          <span className="text-sm font-mono text-text-secondary">{overallProgress}%</span>
        </div>
      </PageHeader>

      <main className="flex-1 px-6 pb-12">
        <div className="mx-auto max-w-7xl">
          {/* Two-column layout */}
            <div className="lg:col-span-3 lg:col-start-2">
              <PipelineTracker phases={phases} />
            </div>

          {/* Completion Banner */}
          <div
            className={cn(
              'mt-8 overflow-hidden transition-all duration-700 ease-out',
              isComplete
                ? 'max-h-40 opacity-100 translate-y-0'
                : 'max-h-0 opacity-0 translate-y-4'
            )}
          >
            <div className="rounded-lg border border-status-completed/30 bg-status-completed/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-status-completed flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Analysis Complete
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Your investment memo is ready. Click below to view the full report.
                  </p>
                </div>
              </div>
              <Link
                href={`/report/${id}`}
                className="flex items-center gap-2 rounded-lg bg-accent-primary hover:bg-accent-hover text-white px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-accent-primary/20 flex-shrink-0"
              >
                View Investment Memo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {isFailed && (
            <div className="mt-8 rounded-lg border border-signal-weak/30 bg-signal-weak/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-signal-weak flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Analysis Failed
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {data?.error_log?.error
                      ? data.error_log.error.includes('RESOURCE_EXHAUSTED') || data.error_log.error.includes('quota')
                        ? 'The AI service daily quota has been exceeded. Please try again after midnight Pacific Time.'
                        : `Error: ${data.error_log.error}`
                      : 'The backend orchestrator encountered an error while processing this request.'}
                  </p>
                </div>
              </div>
              <Link
                href="/analyze"
                className="flex items-center gap-2 rounded-lg border border-border-default bg-bg-secondary hover:bg-bg-tertiary text-text-primary px-5 py-2.5 text-sm font-medium transition-all duration-200 flex-shrink-0"
              >
                ← Try Again
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PipelineTracker } from '@/features/dashboard/PipelineTracker';
import { AgentActivityLog } from '@/features/dashboard/AgentActivityLog';
import { MOCK_PIPELINE_PHASES, MOCK_AGENT_LOGS } from '@/lib/mock-data';
import type { PipelinePhase, AgentLogEntry } from '@/types/report';

// Additional logs for later phases

const EXTENDED_LOGS: AgentLogEntry[] = [
  {
    id: 'log-013',
    timestamp: '2026-05-28T14:31:10Z',
    agent: 'Competitor Analysis Agent',
    message: 'Competitor mapping complete. 8 direct, 12 indirect competitors identified.',
    type: 'success',
  },
  {
    id: 'log-014',
    timestamp: '2026-05-28T14:31:18Z',
    agent: 'Financial Model Agent',
    message: 'Revenue model complete. Projected $2.4M ARR at 18-month mark.',
    type: 'success',
  },
  {
    id: 'log-015',
    timestamp: '2026-05-28T14:31:25Z',
    agent: 'Team Evaluation Agent',
    message: 'Analyzing founding team backgrounds and domain expertise.',
    type: 'info',
  },
  {
    id: 'log-016',
    timestamp: '2026-05-28T14:31:32Z',
    agent: 'Risk Assessment Agent',
    message: 'Risk assessment complete. 2 critical, 1 high, 1 medium risk identified.',
    type: 'warning',
  },
  {
    id: 'log-017',
    timestamp: '2026-05-28T14:31:38Z',
    agent: 'Team Evaluation Agent',
    message: 'Team evaluation complete. Strong technical background, limited go-to-market experience.',
    type: 'success',
  },
  {
    id: 'log-018',
    timestamp: '2026-05-28T14:31:45Z',
    agent: 'Cross-Reference Validator',
    message: 'Cross-referencing claims across 5 agent outputs. Checking for contradictions.',
    type: 'info',
  },
  {
    id: 'log-019',
    timestamp: '2026-05-28T14:31:52Z',
    agent: 'Source Verifier',
    message: 'Verified 18/23 sources. 5 sources marked as low-confidence.',
    type: 'warning',
  },
  {
    id: 'log-020',
    timestamp: '2026-05-28T14:31:58Z',
    agent: 'Cross-Reference Validator',
    message: 'Contradiction detection complete. 1 minor inconsistency resolved.',
    type: 'success',
  },
  {
    id: 'log-021',
    timestamp: '2026-05-28T14:32:05Z',
    agent: 'Insight Aggregator',
    message: 'Aggregating insights from all agents into unified analysis.',
    type: 'info',
  },
  {
    id: 'log-022',
    timestamp: '2026-05-28T14:32:12Z',
    agent: 'Memo Composer',
    message: 'Composing investment memo. Structuring executive summary and key findings.',
    type: 'info',
  },
  {
    id: 'log-023',
    timestamp: '2026-05-28T14:32:20Z',
    agent: 'Memo Composer',
    message: 'Investment memo draft complete. Proceeding to scoring.',
    type: 'success',
  },
  {
    id: 'log-024',
    timestamp: '2026-05-28T14:32:28Z',
    agent: 'Signal Scorer',
    message: 'Calculating composite investment score across 12 dimensions.',
    type: 'info',
  },
  {
    id: 'log-025',
    timestamp: '2026-05-28T14:32:35Z',
    agent: 'Confidence Calibrator',
    message: 'Calibrating confidence intervals. Final score: 67/100. Signal: MODERATE.',
    type: 'success',
  },
];

// Simulation Logic

/** Progress simulation states for each phase */
const SIMULATION_TIMELINE = [
  // tick 0: Initial state (Phase 1 done, Phase 2 at 40%)
  { phaseProgress: [100, 40, 0, 0, 0], logCount: 12 },
  // tick 1
  { phaseProgress: [100, 60, 0, 0, 0], logCount: 14 },
  // tick 2
  { phaseProgress: [100, 80, 0, 0, 0], logCount: 16 },
  // tick 3: Phase 2 complete, Phase 3 starts
  { phaseProgress: [100, 100, 20, 0, 0], logCount: 18 },
  // tick 4
  { phaseProgress: [100, 100, 60, 0, 0], logCount: 19 },
  // tick 5: Phase 3 done, Phase 4 starts
  { phaseProgress: [100, 100, 100, 30, 0], logCount: 20 },
  // tick 6
  { phaseProgress: [100, 100, 100, 70, 0], logCount: 22 },
  // tick 7: Phase 4 done, Phase 5 starts
  { phaseProgress: [100, 100, 100, 100, 40], logCount: 23 },
  // tick 8
  { phaseProgress: [100, 100, 100, 100, 80], logCount: 24 },
  // tick 9: All done
  { phaseProgress: [100, 100, 100, 100, 100], logCount: 25 },
];

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
  const [tick, setTick] = useState(0);
  const isComplete = tick >= SIMULATION_TIMELINE.length - 1;

  // Advance simulation
  useEffect(() => {
    if (tick >= SIMULATION_TIMELINE.length - 1) {
      return;
    }

    const timer = setInterval(() => {
      setTick((prev) => {
        const next = prev + 1;
        if (next >= SIMULATION_TIMELINE.length - 1) {
          clearInterval(timer);
        }
        return Math.min(next, SIMULATION_TIMELINE.length - 1);
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [tick]);

  // Derive current state
  const currentTimeline = SIMULATION_TIMELINE[tick];

  const phases: PipelinePhase[] = MOCK_PIPELINE_PHASES.map((phase, i) =>
    deriveAgentStatuses(phase, currentTimeline.phaseProgress[i])
  );

  const allLogs = [...MOCK_AGENT_LOGS, ...EXTENDED_LOGS];
  const visibleLogs = allLogs.slice(0, currentTimeline.logCount);

  const currentPhaseStatus = isComplete ? 'completed' : 'running';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <PageHeader
        title="Analyzing: NutriSync — AI Nutrition Platform"
        subtitle=""
      >
        <div className="mt-2">
          <StatusBadge status={currentPhaseStatus} size="md" />
        </div>
      </PageHeader>

      <main className="flex-1 px-6 pb-12">
        <div className="mx-auto max-w-7xl">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Column: Pipeline (60%) */}
            <div className="lg:col-span-3">
              <PipelineTracker phases={phases} />
            </div>

            {/* Right Column: Activity Log (40%) */}
            <div className="lg:col-span-2">
              <AgentActivityLog logs={visibleLogs} isComplete={isComplete} />
            </div>
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
                    Investment memo generated with 67/100 score · MODERATE signal
                  </p>
                </div>
              </div>
              <Link
                href="/report/rpt-nutrisync-001"
                className="flex items-center gap-2 rounded-lg bg-accent-primary hover:bg-accent-hover text-white px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-accent-primary/20 flex-shrink-0"
              >
                View Investment Memo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

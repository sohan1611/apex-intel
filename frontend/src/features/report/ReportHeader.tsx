import { MetricCard } from '@/components/ui/MetricCard';
import { SignalBadge } from '@/components/ui/SignalBadge';
import { formatPercentage, formatDate } from '@/lib/utils';
import type { FullReport } from '@/types/report';

interface ReportHeaderProps {
  report: FullReport;
}

/**
 * Top-level header for a full investment report.
 * Displays the report title, analysis date, and four key
 * summary metrics (Score, Signal, Confidence, Red Flags).
 */
export default function ReportHeader({ report }: ReportHeaderProps) {
  const displayName = report.companyName || report.input_content || 'Analysis Report';
  const totalScore = report.score?.total_score ?? report.score?.total ?? report.investmentScore ?? 0;
  const signal = report.score?.investment_signal ?? report.investment_signal ?? null;
  const confidence = report.overall_confidence_score ?? report.confidenceScore ?? null;
  const redFlagCount = report.red_flags?.length ?? report.redFlagCount ?? 0;

  return (
    <header>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            {displayName}
          </h1>
          <p className="text-sm text-text-tertiary mt-1">
            Analyzed {formatDate(report.created_at)}
          </p>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary bg-bg-secondary border border-border-default rounded-lg hover:text-text-primary hover:bg-bg-tertiary transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Print Report
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {/* Score */}
        <MetricCard
          label="Score"
          value={`${totalScore}/100`}
        />

        {/* Signal — custom card matching MetricCard styling with SignalBadge */}
        <div className="relative bg-bg-tertiary rounded-xl p-4 border border-border-subtle">
          <p className="text-xs uppercase tracking-wider text-text-tertiary mb-1">
            Signal
          </p>
          <SignalBadge signal={signal} />
        </div>

        {/* Confidence */}
        <MetricCard
          label="Confidence"
          value={confidence != null ? formatPercentage(confidence) : '—'}
        />

        {/* Red Flags */}
        <MetricCard
          label="Red Flags"
          value={redFlagCount}
          variant={redFlagCount > 0 ? 'danger' : 'default'}
        />
      </div>
    </header>
  );
}

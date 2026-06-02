import MetricCard from '@/components/ui/MetricCard';
import SignalBadge from '@/components/ui/SignalBadge';
import { formatPercentage, formatDate } from '@/lib/utils';
import type { FullReport } from '@/types/report';

interface ReportHeaderProps {
  report: FullReport;
}

/**
 * Top-level header for a full investment report.
 * Displays the report title, analysis date, version, and four key
 * summary metrics (Score, Signal, Confidence, Red Flags).
 */
export default function ReportHeader({ report }: ReportHeaderProps) {
  return (
    <header>
      <h1 className="text-2xl font-semibold text-text-primary">
        {report.input_content}
      </h1>
      <p className="text-sm text-text-tertiary mt-1">
        Analyzed {formatDate(report.created_at)} &middot; v{report.version}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {/* Score */}
        <MetricCard
          label="Score"
          value={`${report.score.total_score}/100`}
        />

        {/* Signal — custom card matching MetricCard styling with SignalBadge */}
        <div className="relative bg-bg-tertiary rounded-xl p-4 border border-border-subtle">
          <p className="text-xs uppercase tracking-wider text-text-tertiary mb-1">
            Signal
          </p>
          <SignalBadge signal={report.score.investment_signal} />
        </div>

        {/* Confidence */}
        <MetricCard
          label="Confidence"
          value={formatPercentage(report.overall_confidence_score)}
        />

        {/* Red Flags */}
        <MetricCard
          label="Red Flags"
          value={report.red_flags.length}
          variant={report.red_flags.length > 0 ? 'danger' : 'default'}
        />
      </div>
    </header>
  );
}

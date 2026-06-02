import SignalBadge from '@/components/ui/SignalBadge';
import ConfidenceBar from '@/components/ui/ConfidenceBar';
import { formatPercentage } from '@/lib/utils';

interface InvestmentSignalCardProps {
  signal: 'STRONG' | 'MODERATE' | 'WEAK' | null;
  score: number | null;
  confidence: number | null;
}

/**
 * Hero-style card showcasing the investment signal, total score,
 * and confidence level with a decorative gradient background.
 */
export default function InvestmentSignalCard({
  signal,
  score,
  confidence,
}: InvestmentSignalCardProps) {
  return (
    <div className="bg-gradient-to-br from-bg-tertiary to-bg-secondary rounded-2xl p-8 border border-border-default relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-accent-primary/5 blur-3xl" />

      <div className="relative flex flex-col sm:flex-row items-center gap-8">
        {/* Score display */}
        <div className="flex items-baseline">
          <span className="text-5xl font-mono font-bold text-text-primary">
            {score ?? '—'}
          </span>
          <span className="text-2xl text-text-tertiary ml-1">/100</span>
        </div>

        {/* Signal badge */}
        <div className="flex items-center">
          <SignalBadge signal={signal} />
        </div>

        {/* Confidence section */}
        <div className="flex-1 min-w-[160px]">
          <p className="text-xs uppercase tracking-wider text-text-tertiary mb-1">
            Confidence
          </p>
          <p className="text-2xl font-mono font-semibold text-text-primary">
            {confidence != null ? formatPercentage(confidence) : '—'}
          </p>
          {confidence != null && (
            <div className="mt-2">
              <ConfidenceBar value={confidence} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

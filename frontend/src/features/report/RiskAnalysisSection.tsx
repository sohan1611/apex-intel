'use client';

import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { SourceTag } from '@/components/ui/SourceTag';

interface RiskEntryData {
  risk: string;
  severity: string;
  rationale: string;
  source: string;
}

interface RiskAnalysisSectionProps {
  risks: RiskEntryData[];
}

const severityOrder: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export default function RiskAnalysisSection({ risks }: RiskAnalysisSectionProps) {
  if (!risks || risks.length === 0) {
    return (
      <p className="text-sm text-text-tertiary italic">No risk data available</p>
    );
  }

  const sorted = [...risks].sort(
    (a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3)
  );

  return (
    <div>
      {sorted.map((risk, index) => (
        <div
          key={index}
          className="bg-bg-tertiary rounded-xl p-5 border border-border-subtle mb-3"
        >
          {/* Top row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <SeverityBadge severity={risk.severity} />
              <span className="font-medium text-text-primary text-sm">{risk.risk}</span>
            </div>
            <SourceTag source={risk.source} />
          </div>

          {/* Rationale */}
          {risk.rationale && (
            <p className="mt-3 text-sm text-text-secondary leading-relaxed">
              {risk.rationale}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

'use client';

import { cn } from '@/lib/utils';
import type { ReportListItem } from '@/types/report';

interface KPIBarProps {
  reports: ReportListItem[];
  className?: string;
}

export function KPIBar({ reports, className }: KPIBarProps) {
  const total = reports.length;
  const completed = reports.filter(
    (r) => (r.status ?? '').toLowerCase() === 'completed'
  ).length;
  const strong = reports.filter(
    (r) => (r.investment_signal ?? r.investmentSignal) === 'STRONG'
  ).length;
  const avgScore =
    completed > 0
      ? Math.round(
          reports
            .filter((r) => (r.total_score ?? r.investmentScore) != null)
            .reduce((sum, r) => sum + ((r.total_score ?? r.investmentScore) ?? 0), 0) /
            completed
        )
      : 0;

  const kpis = [
    { label: 'Total Reports', value: total },
    { label: 'Completed', value: completed },
    { label: 'Strong Signal', value: strong },
    { label: 'Avg Score', value: avgScore },
  ];

  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-4 gap-4',
        className
      )}
    >
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="rounded-lg border border-border-default bg-bg-secondary p-4"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
            {kpi.label}
          </p>
          <p className="mt-1 text-2xl font-semibold text-text-primary tabular-nums">
            {kpi.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export default KPIBar;

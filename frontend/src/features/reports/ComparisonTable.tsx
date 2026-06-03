'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SignalBadge } from '@/components/ui/SignalBadge';
import type { FullReport } from '@/types/report';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ComparisonTableProps {
  reports: FullReport[];
}

type RowKind = 'signal' | 'numeric' | 'fraction' | 'percentage' | 'count';

interface DimensionRow {
  label: string;
  /** How to pull a raw comparable number from a report */
  getValue: (r: FullReport) => number | null;
  /** How to render the cell */
  render: (r: FullReport) => React.ReactNode;
  kind: RowKind;
  /** For counts — higher is worse (red flags, contradictions) */
  higherIsWorse?: boolean;
}

interface RowGroup {
  title: string;
  rows: DimensionRow[];
}

/* ------------------------------------------------------------------ */
/*  Row definitions                                                    */
/* ------------------------------------------------------------------ */

const ROW_GROUPS: RowGroup[] = [
  {
    title: 'Verdict',
    rows: [
      {
        label: 'Investment Score',
        getValue: (r) => r.investmentScore ?? null,
        render: (r) => (
          <span className="font-mono text-xl font-bold">
            {r.investmentScore ?? '—'}
          </span>
        ),
        kind: 'numeric',
      },
      {
        label: 'Investment Signal',
        getValue: (r) =>
          r.investmentSignal === 'STRONG'
            ? 3
            : r.investmentSignal === 'MODERATE'
              ? 2
              : 1,
        render: (r) => <SignalBadge signal={r.investmentSignal} />,
        kind: 'signal',
      },
      {
        label: 'Confidence Score',
        getValue: (r) => r.confidenceScore ?? null,
        render: (r) => (
          <span className="font-mono">
            {r.confidenceScore != null ? `${r.confidenceScore}%` : '—'}
          </span>
        ),
        kind: 'percentage',
      },
    ],
  },
  {
    title: 'Score Breakdown',
    rows: [
      {
        label: 'Market Opportunity',
        getValue: (r) => r.scoreBreakdown?.marketOpportunity ?? null,
        render: (r) => (
          <span className="font-mono">
            {r.scoreBreakdown?.marketOpportunity ?? '—'}/30
          </span>
        ),
        kind: 'fraction',
      },
      {
        label: 'Competition Intensity',
        getValue: (r) => r.scoreBreakdown?.competitionIntensity ?? null,
        render: (r) => (
          <span className="font-mono">
            {r.scoreBreakdown?.competitionIntensity ?? '—'}/25
          </span>
        ),
        kind: 'fraction',
      },
      {
        label: 'Execution Feasibility',
        getValue: (r) => r.scoreBreakdown?.executionFeasibility ?? null,
        render: (r) => (
          <span className="font-mono">
            {r.scoreBreakdown?.executionFeasibility ?? '—'}/20
          </span>
        ),
        kind: 'fraction',
      },
      {
        label: 'Risk Exposure',
        getValue: (r) => r.scoreBreakdown?.riskExposure ?? null,
        render: (r) => (
          <span className="font-mono">
            {r.scoreBreakdown?.riskExposure ?? '—'}/25
          </span>
        ),
        kind: 'fraction',
      },
    ],
  },
  {
    title: 'Risk Indicators',
    rows: [
      {
        label: 'Red Flags',
        getValue: (r) => r.redFlagCount ?? 0,
        render: (r) => {
          const v = r.redFlagCount ?? 0;
          return (
            <span className={cn('font-mono', v > 0 && 'text-red-400')}>
              {v}
            </span>
          );
        },
        kind: 'count',
        higherIsWorse: true,
      },
      {
        label: 'Contradictions',
        getValue: (r) => r.contradictionCount ?? 0,
        render: (r) => (
          <span className="font-mono">{r.contradictionCount ?? 0}</span>
        ),
        kind: 'count',
        higherIsWorse: true,
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Determine best / worst index for a row across reports */
function rankValues(
  values: (number | null)[],
  higherIsWorse = false,
): ('best' | 'worst' | 'mid')[] {
  const validEntries = values
    .map((v, i) => ({ v, i }))
    .filter((e) => e.v !== null) as { v: number; i: number }[];

  if (validEntries.length < 2) return values.map(() => 'mid');

  const sorted = [...validEntries].sort((a, b) => a.v! - b.v!);
  const bestIdx = higherIsWorse
    ? sorted[0].i
    : sorted[sorted.length - 1].i;
  const worstIdx = higherIsWorse
    ? sorted[sorted.length - 1].i
    : sorted[0].i;

  return values.map((_, i) => {
    if (i === bestIdx) return 'best';
    if (i === worstIdx) return 'worst';
    return 'mid';
  });
}

function rankColor(rank: 'best' | 'worst' | 'mid') {
  switch (rank) {
    case 'best':
      return 'text-green-400';
    case 'worst':
      return 'text-red-400';
    default:
      return 'text-text-secondary';
  }
}

/* ------------------------------------------------------------------ */
/*  Desktop table                                                      */
/* ------------------------------------------------------------------ */

function DesktopTable({ reports }: { reports: FullReport[] }) {
  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-border-default bg-bg-secondary">
      <table className="w-full border-collapse">
        {/* Header */}
        <thead>
          <tr className="border-b border-border-default">
            <th className="sticky left-0 z-10 bg-bg-secondary w-48 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Dimension
            </th>
            {reports.map((r) => (
              <th
                key={r.id}
                className="px-5 py-4 text-center min-w-[180px]"
              >
                <p className="text-sm font-semibold text-text-primary truncate max-w-[180px] mx-auto">
                  {r.companyName}
                </p>
                <Link
                  href={`/report/${r.id}`}
                  className="text-xs text-accent-primary hover:underline mt-0.5 inline-block"
                >
                  View Memo →
                </Link>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {ROW_GROUPS.map((group, gi) => (
            <GroupRows key={group.title} group={group} reports={reports} isLast={gi === ROW_GROUPS.length - 1} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GroupRows({
  group,
  reports,
  isLast,
}: {
  group: RowGroup;
  reports: FullReport[];
  isLast: boolean;
}) {
  return (
    <>
      {/* Group header */}
      <tr className="border-t-2 border-border-default">
        <td
          colSpan={reports.length + 1}
          className="sticky left-0 bg-bg-tertiary/50 px-5 py-2 text-xs font-bold uppercase tracking-widest text-text-muted"
        >
          {group.title}
        </td>
      </tr>
      {/* Rows */}
      {group.rows.map((row, ri) => {
        const values = reports.map((r) => row.getValue(r));
        const ranks = rankValues(values, row.higherIsWorse);

        return (
          <tr
            key={row.label}
            className={cn(
              'transition-colors hover:bg-bg-tertiary/30',
              ri < group.rows.length - 1 && 'border-b border-border-subtle',
              ri === group.rows.length - 1 && !isLast && 'border-b border-border-default',
            )}
          >
            <td className="sticky left-0 z-10 bg-bg-secondary text-text-tertiary text-sm font-medium px-5 py-3 w-48">
              {row.label}
            </td>
            {reports.map((r, ci) => (
              <td
                key={r.id}
                className={cn(
                  'px-5 py-3 text-center',
                  row.kind !== 'signal' && rankColor(ranks[ci]),
                )}
              >
                {row.render(r)}
              </td>
            ))}
          </tr>
        );
      })}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile cards                                                       */
/* ------------------------------------------------------------------ */

function MobileCards({ reports }: { reports: FullReport[] }) {
  return (
    <div className="md:hidden flex flex-col gap-5">
      {reports.map((r) => (
        <div
          key={r.id}
          className="bg-bg-secondary border border-border-default rounded-lg p-5"
        >
          {/* Card header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-text-primary truncate mr-3">
              {r.companyName}
            </h3>
            <Link
              href={`/report/${r.id}`}
              className="text-xs text-accent-primary hover:underline whitespace-nowrap"
            >
              View Memo →
            </Link>
          </div>

          {/* Dimension rows */}
          {ROW_GROUPS.map((group) => (
            <div key={group.title} className="mb-3 last:mb-0">
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">
                {group.title}
              </p>
              {group.rows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-1.5 border-b border-border-subtle last:border-0"
                >
                  <span className="text-sm text-text-tertiary">
                    {row.label}
                  </span>
                  <span className="text-sm">{row.render(r)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Exports                                                            */
/* ------------------------------------------------------------------ */

export default function ComparisonTable({ reports }: ComparisonTableProps) {
  if (!reports.length) {
    return (
      <div className="text-center py-16 text-text-tertiary text-sm">
        No reports to compare. Please select reports from the library.
      </div>
    );
  }

  return (
    <>
      <DesktopTable reports={reports} />
      <MobileCards reports={reports} />
    </>
  );
}

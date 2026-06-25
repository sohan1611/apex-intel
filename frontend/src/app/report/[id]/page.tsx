'use client';

import { Navbar } from '@/components/layout/Navbar';
import ReportSidebar from '@/features/report/ReportSidebar';
import MobileTabBar from '@/features/report/MobileTabBar';
import ReportHeader from '@/features/report/ReportHeader';
import InvestmentSignalCard from '@/features/report/InvestmentSignalCard';
import RedFlagsPanel from '@/features/report/RedFlagsPanel';
import CompanyBriefSection from '@/features/report/CompanyBriefSection';
import MarketAnalysisSection from '@/features/report/MarketAnalysisSection';
import CompetitorMatrix from '@/features/report/CompetitorMatrix';
import RiskAnalysisSection from '@/features/report/RiskAnalysisSection';
import AssumptionTable from '@/features/report/AssumptionTable';
import ExecutionSection from '@/features/report/ExecutionSection';
import ContradictionsSection from '@/features/report/ContradictionsSection';
import ScoreBreakdown from '@/features/report/ScoreBreakdown';
import { SignalBadge } from '@/components/ui/SignalBadge';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { useReport } from '@/hooks/use-api';
import { useParams } from 'next/navigation';
import { Loader2, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import { formatPercentage, formatDate } from '@/lib/utils';

// -- Section jump targets --

const JUMP_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'red-flags', label: 'Red Flags' },
  { id: 'company-brief', label: 'Company' },
  { id: 'market-analysis', label: 'Market' },
  { id: 'competitors', label: 'Competitors' },
  { id: 'risk-analysis', label: 'Risks' },
  { id: 'assumptions', label: 'Assumptions' },
  { id: 'execution', label: 'Execution' },
  { id: 'contradictions', label: 'Contradictions' },
  { id: 'score-breakdown', label: 'Score' },
];

// -- Helper to format large numbers --

function formatLargeNumber(n: number | undefined | null): string {
  if (n == null) return 'N/A';
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(0)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

/**
 * Report Viewer Page
 *
 * Displays a full investment analysis report with a fixed sidebar navigation
 * on desktop and a sticky horizontal tab bar on mobile.
 */
export default function ReportPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: report, isLoading, isError, error } = useReport(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
        </main>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="h-12 w-12 text-signal-weak mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">Failed to load report</h1>
          <p className="text-text-secondary">{error?.message || 'Report not found or unavailable.'}</p>
        </main>
      </div>
    );
  }

  // Derived stats for executive summary and quick stats
  const totalScore = report.score?.total_score ?? report.investmentScore ?? 0;
  const signal = report.score?.investment_signal ?? report.investment_signal ?? 'MODERATE';
  const confidence = report.overall_confidence_score ?? 0;
  const redFlagCount = report.red_flags?.length ?? 0;
  const competitorCount = report.competitors?.length ?? 0;
  const riskCount = (report.skeptic_analysis ?? []).length;
  const assumptionCount = (report.assumptions ?? []).length;
  const contradictionCount = (report.contradictions ?? []).length;
  const tamEstimate = report.market_analysis?.tam_estimate;

  const handleJump = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />

      {/* Sticky Jump-to-Section Bar */}
      <div className="sticky top-14 z-40 bg-bg-secondary border-b border-border-default lg:ml-56">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {JUMP_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => handleJump(section.id)}
              className="text-xs px-3 py-1.5 rounded-full bg-bg-tertiary border border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/80 transition-colors whitespace-nowrap flex-shrink-0"
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      <ReportSidebar />
      <MobileTabBar />

      <main className="lg:ml-56 p-6 lg:p-10">
        <div className="max-w-4xl mx-auto">
          {/* Executive Summary */}
          <section className="mb-12">
            <div className="rounded-lg bg-bg-secondary border-l-4 border-l-accent-primary p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-3">Executive Summary</h2>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                {report.score?.justification ?? 'No executive summary available.'}
              </p>
              <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-border-default">
                <div className="flex flex-col">
                  <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Score</span>
                  <span className="text-3xl font-bold text-text-primary mt-1">
                    {totalScore}
                    <span className="text-lg text-text-muted font-normal">/100</span>
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Signal</span>
                  <div className="mt-2">
                    <SignalBadge signal={signal} />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Confidence</span>
                  <span className="text-3xl font-bold text-text-primary mt-1">
                    {formatPercentage(confidence)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-text-muted">Red Flags</span>
                  <span className="text-lg font-semibold text-text-primary">{redFlagCount}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Stats Row */}
          <div className="flex flex-wrap gap-2 mb-12">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-bg-tertiary text-xs text-text-secondary border border-border-default">
              TAM: {formatLargeNumber(tamEstimate)}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-bg-tertiary text-xs text-text-secondary border border-border-default">
              Competitors: {competitorCount}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-bg-tertiary text-xs text-text-secondary border border-border-default">
              Risks: {riskCount}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-bg-tertiary text-xs text-text-secondary border border-border-default">
              Assumptions: {assumptionCount}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-bg-tertiary text-xs text-text-secondary border border-border-default">
              Contradictions: {contradictionCount}
            </span>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-between border-b border-border-default pb-4 mb-8">
            <div className="flex items-center gap-2 text-xs text-text-tertiary">
              <Clock className="h-4 w-4" />
              Generated on {report.created_at ? formatDate(report.created_at) : new Date().toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 text-xs text-signal-strong/80 font-medium">
              <ShieldCheck className="h-4 w-4" />
              AI-Verified Analysis
            </div>
          </div>

          {/* Overview */}
          <section id="overview" className="mb-12 scroll-mt-20">
            <ReportHeader report={report} />
            <div className="mt-6">
              <InvestmentSignalCard
                signal={report.score?.investment_signal ?? report.investment_signal ?? 'MODERATE'}
                score={report.score?.total_score ?? report.investmentScore ?? 0}
                confidence={report.overall_confidence_score ?? 0}
              />
            </div>
          </section>

          {/* Red Flags */}
          {report.red_flags && report.red_flags.length > 0 && (
            <CollapsibleSection id="red-flags" title="Red Flags" className="mb-8" badge={
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-signal-weak/10 text-xs font-bold text-signal-weak">
                {report.red_flags.length}
              </span>
            }>
              <RedFlagsPanel flags={report.red_flags} />
            </CollapsibleSection>
          )}

          {/* Company Brief */}
          <CollapsibleSection id="company-brief" title="Company Brief" className="mb-8">
            <CompanyBriefSection brief={report.company_brief} />
          </CollapsibleSection>

          {/* Market Analysis */}
          <CollapsibleSection id="market-analysis" title="Market Analysis" className="mb-8">
            <MarketAnalysisSection market={report.market_analysis} />
          </CollapsibleSection>

          {/* Competitors */}
          <CollapsibleSection id="competitors" title="Competitors" className="mb-8">
            <CompetitorMatrix competitors={report.competitors} />
          </CollapsibleSection>

          {/* Risk Analysis */}
          <CollapsibleSection id="risk-analysis" title="Risk Analysis" className="mb-8">
            <RiskAnalysisSection risks={report.skeptic_analysis ?? []} />
          </CollapsibleSection>

          {/* Assumptions */}
          <CollapsibleSection id="assumptions" title="Assumptions" className="mb-8">
            <AssumptionTable assumptions={report.assumptions ?? []} />
          </CollapsibleSection>

          {/* Execution */}
          <CollapsibleSection id="execution" title="Execution Feasibility" className="mb-8">
            <ExecutionSection execution={report.execution_feasibility} />
          </CollapsibleSection>

          {/* Contradictions */}
          <CollapsibleSection id="contradictions" title="Contradictions" className="mb-8">
            <ContradictionsSection contradictions={report.contradictions ?? []} />
          </CollapsibleSection>

          {/* Score Breakdown */}
          <CollapsibleSection id="score-breakdown" title="Score Breakdown" className="mb-8">
            <ScoreBreakdown score={report.score} />
          </CollapsibleSection>

          {/* Bottom spacing */}
          <div className="h-24" />
        </div>
      </main>
    </div>
  );
}

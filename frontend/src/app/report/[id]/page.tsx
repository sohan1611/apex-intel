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
import { MOCK_REPORT } from '@/lib/mock-data';

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
  const report = MOCK_REPORT;

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
              <p className="text-sm text-text-secondary leading-relaxed">
                {report.companyName ?? 'This company'} demonstrates moderate market potential with
                significant competitive headwinds. The AI nutrition space is growing but crowded, and
                execution risks around regulatory compliance and data moat defensibility temper the
                opportunity.
              </p>
              <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-border-default">
                <div className="flex flex-col">
                  <span className="text-xs text-text-muted">Score</span>
                  <span className="text-lg font-semibold text-text-primary">
                    {totalScore}
                    <span className="text-sm text-text-muted font-normal">/100</span>
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-text-muted">Signal</span>
                  <div className="mt-1">
                    <SignalBadge signal={signal} />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-text-muted">Confidence</span>
                  <span className="text-lg font-semibold text-text-primary">
                    {Math.round(confidence * 100)}%
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

          {/* Overview */}
          <section id="overview" className="mb-12">
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
            <section id="red-flags" className="mb-12">
              <SectionTitle title="Red Flags" />
              <RedFlagsPanel flags={report.red_flags} />
            </section>
          )}

          {/* Company Brief */}
          <section id="company-brief" className="mb-12">
            <SectionTitle title="Company Brief" />
            <CompanyBriefSection brief={report.company_brief} />
          </section>

          {/* Market Analysis */}
          <section id="market-analysis" className="mb-12">
            <SectionTitle title="Market Analysis" />
            <MarketAnalysisSection market={report.market_analysis} />
          </section>

          {/* Competitors */}
          <section id="competitors" className="mb-12">
            <SectionTitle title="Competitors" />
            <CompetitorMatrix competitors={report.competitors} />
          </section>

          {/* Risk Analysis */}
          <section id="risk-analysis" className="mb-12">
            <SectionTitle title="Risk Analysis" />
            <RiskAnalysisSection risks={report.skeptic_analysis ?? []} />
          </section>

          {/* Assumptions */}
          <section id="assumptions" className="mb-12">
            <SectionTitle title="Assumptions" />
            <AssumptionTable assumptions={report.assumptions ?? []} />
          </section>

          {/* Execution */}
          <section id="execution" className="mb-12">
            <SectionTitle title="Execution Feasibility" />
            <ExecutionSection execution={report.execution_feasibility} />
          </section>

          {/* Contradictions */}
          <section id="contradictions" className="mb-12">
            <SectionTitle title="Contradictions" />
            <ContradictionsSection contradictions={report.contradictions ?? []} />
          </section>

          {/* Score Breakdown */}
          <section id="score-breakdown" className="mb-12">
            <SectionTitle title="Score Breakdown" />
            <ScoreBreakdown score={report.score} />
          </section>

          {/* Bottom spacing */}
          <div className="h-24" />
        </div>
      </main>
    </div>
  );
}

/**
 * Reusable section title with divider line.
 */
function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-default">
      {title}
    </h2>
  );
}

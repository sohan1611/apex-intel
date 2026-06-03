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
import { MOCK_REPORT } from '@/lib/mock-data';

/**
 * Report Viewer Page
 *
 * Displays a full investment analysis report with a fixed sidebar navigation
 * on desktop and a sticky horizontal tab bar on mobile.
 */
export default function ReportPage() {
  const report = MOCK_REPORT;

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <ReportSidebar />
      <MobileTabBar />

      <main className="lg:ml-56 p-6 lg:p-10">
        <div className="max-w-4xl mx-auto">
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

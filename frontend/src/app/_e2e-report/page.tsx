'use client';
import { Navbar } from '@/components/layout/Navbar';
import ReportHeader from '@/features/report/ReportHeader';
import InvestmentSignalCard from '@/features/report/InvestmentSignalCard';

export default function MockReport() {
  const report = {
    id: '123',
    companyName: 'E2E Startup',
    created_at: new Date().toISOString(),
    investment_signal: 'STRONG',
    investmentScore: 85,
    overall_confidence_score: 92,
    red_flags: [],
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="p-6 lg:p-10">
        <div className="max-w-4xl mx-auto">
          <section className="mb-12">
            <ReportHeader report={report as any} />
            <div className="mt-6">
              <InvestmentSignalCard
                signal="STRONG"
                score={85}
                confidence={92}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

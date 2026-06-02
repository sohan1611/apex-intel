'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { PageHeader } from '@/components/layout/PageHeader';
import { Footer } from '@/components/layout/Footer';
import { MOCK_COMPARISON_REPORTS } from '@/lib/mock-data';
import ComparisonTable from '@/features/reports/ComparisonTable';

export default function ComparePage() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get('ids') ?? '';

  /* For mock data — we always use MOCK_COMPARISON_REPORTS regardless of ids */
  const reports = useMemo(() => {
    // In a real app, filter by ids. For mock, return all comparison reports.
    return MOCK_COMPARISON_REPORTS;
  }, [idsParam]);

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title={`Comparing ${reports.length} Reports`}
          action={
            <Link
              href="/reports"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Library
            </Link>
          }
        />

        <div className="mt-8">
          <ComparisonTable reports={reports} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

'use client';

import { useMemo, Suspense } from 'react';
import Link from 'next/link';
import { ChevronLeft, GitCompareArrows, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { PageHeader } from '@/components/layout/PageHeader';
import { Footer } from '@/components/layout/Footer';
import { MOCK_COMPARISON_REPORTS } from '@/lib/mock-data';
import ComparisonTable from '@/features/reports/ComparisonTable';

function CompareContent() {
  /* For mock data -- we always use MOCK_COMPARISON_REPORTS regardless of ids */
  const reports = useMemo(() => {
    // In a real app, filter by ids. For mock, return all comparison reports.
    return MOCK_COMPARISON_REPORTS;
  }, []);

  // Toggle this to false to use real data checks; kept false so mock data shows normally
  const showEmptyState = false;
  const isEmpty = showEmptyState || reports.length === 0;

  if (isEmpty) {
    return (
      <>
        <PageHeader
          title="Compare Reports"
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

        <div className="flex-1 flex items-center justify-center py-24">
          <div className="flex flex-col items-center text-center max-w-md">
            <div className="rounded-full bg-bg-tertiary p-4 mb-4">
              <GitCompareArrows className="h-12 w-12 text-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No Reports Selected for Comparison
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              Select 2 or more reports from the Reports Library to compare their analysis results
              side by side.
            </p>
            <Link
              href="/reports"
              className="inline-flex items-center gap-2 rounded-lg bg-accent-primary hover:bg-accent-hover text-white px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-accent-primary/20"
            >
              Go to Reports Library
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
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
    </>
  );
}

export default function ComparePage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-6 py-1"><div className="h-2 bg-slate-700 rounded"></div><div className="space-y-3"><div className="grid grid-cols-3 gap-4"><div className="h-2 bg-slate-700 rounded col-span-2"></div><div className="h-2 bg-slate-700 rounded col-span-1"></div></div><div className="h-2 bg-slate-700 rounded"></div></div></div></div>}>
          <CompareContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

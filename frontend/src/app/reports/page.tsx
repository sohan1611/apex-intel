'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowUpDown,
  FileText,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { PageHeader } from '@/components/layout/PageHeader';
import { Footer } from '@/components/layout/Footer';
import { KPIBar } from '@/components/ui/KPIBar';
import { SignalBadge } from '@/components/ui/SignalBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useReports } from '@/hooks/use-api';
import type { ReportListItem } from '@/types/report';
import ReportSelectionBar from '@/features/reports/ReportSelectionBar';
import { useSession } from 'next-auth/react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 5;

type SignalFilter = 'ALL' | 'STRONG' | 'MODERATE' | 'WEAK';
type StatusFilter = 'ALL' | 'Completed' | 'Processing' | 'Failed';
type SortField = 'score' | 'date' | null;
type SortDir = 'asc' | 'desc';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */



function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ReportsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const tier = (session?.user as any)?.tier || 'FREE';
  const { data } = useReports();
  const rawReports = data || [];

  // Wrap in useMemo to fix exhaustive-deps warning
  const reportsData = useMemo(() => rawReports, [rawReports]);

  /* -- filters & sort -- */
  const [search, setSearch] = useState('');
  const [signalFilter, setSignalFilter] = useState<SignalFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  /* -- selection -- */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  /* -- pagination -- */
  const [page, setPage] = useState(1);

  /* ---- filtering ---- */
  const filtered = useMemo(() => {
    let list: ReportListItem[] = [...reportsData];

    // text search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) =>
        (r.companyName ?? r.title ?? '').toLowerCase().includes(q),
      );
    }

    // signal
    if (signalFilter !== 'ALL') {
      list = list.filter((r) => r.investmentSignal === signalFilter);
    }

    // status
    if (statusFilter !== 'ALL') {
      list = list.filter(
        (r) => (r.status ?? '').toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    return list;
  }, [reportsData, search, signalFilter, statusFilter]);

  /* ---- sorting ---- */
  const sorted = useMemo(() => {
    if (!sortField) return filtered;

    const copy = [...filtered];
    copy.sort((a, b) => {
      let aVal: number;
      let bVal: number;

      if (sortField === 'score') {
        aVal = a.investmentScore ?? -1;
        bVal = b.investmentScore ?? -1;
      } else {
        aVal = new Date(a.createdAt ?? 0).getTime();
        bVal = new Date(b.createdAt ?? 0).getTime();
      }

      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return copy;
  }, [filtered, sortField, sortDir]);

  /* ---- pagination ---- */
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  /* ---- toggle sort ---- */
  const handleSort = useCallback(
    (field: 'score' | 'date') => {
      if (sortField === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDir('desc');
      }
    },
    [sortField],
  );

  /* ---- selection helpers ---- */
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  /* ---- reset page on filter change ---- */
  const handleSearch = useCallback((v: string) => {
    setSearch(v);
    setPage(1);
  }, []);

  const handleSignalChange = useCallback((v: SignalFilter) => {
    setSignalFilter(v);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((v: StatusFilter) => {
    setStatusFilter(v);
    setPage(1);
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        {/* Page Header */}
        <PageHeader
          title="Reports Library"
          subtitle={`${reportsData.length} reports`}
          action={
            <Link
              href="/analyze"
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition-all"
            >
              <Plus className="h-4 w-4" />
              New Analysis
            </Link>
          }
        />

        <div className="mt-6">
          <KPIBar reports={reportsData} />
        </div>

        {/* Filters Bar */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-bg-primary border border-border-default rounded-lg pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-primary/50 transition"
            />
          </div>

          {/* Signal filter */}
          <div className="relative">
            <select
              value={signalFilter}
              onChange={(e) =>
                handleSignalChange(e.target.value as SignalFilter)
              }
              className="appearance-none bg-bg-secondary border border-border-default rounded-lg px-3 py-2 pr-8 text-sm text-text-primary cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent-primary/50"
            >
              <option value="ALL">Signal: All</option>
              <option value="STRONG">Strong</option>
              <option value="MODERATE">Moderate</option>
              <option value="WEAK">Weak</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) =>
                handleStatusChange(e.target.value as StatusFilter)
              }
              className="appearance-none bg-bg-secondary border border-border-default rounded-lg px-3 py-2 pr-8 text-sm text-text-primary cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent-primary/50"
            >
              <option value="ALL">Status: All</option>
              <option value="Completed">Completed</option>
              <option value="Processing">Processing</option>
              <option value="Failed">Failed</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
          </div>
        </div>

        {/* Selection Bar */}
        {selectedIds.length > 0 && (
          <div className="mt-4">
            <ReportSelectionBar
              selectedIds={selectedIds}
              onClear={clearSelection}
            />
          </div>
        )}

        {/* Reports Table */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-border-default bg-bg-secondary">
          <table className="w-full border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-border-default">
                {/* Checkbox col */}
                <th className="w-12 px-4 py-3" />
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Company / Idea
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Signal
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  <button
                    onClick={() => handleSort('score')}
                    className="inline-flex items-center gap-1 hover:text-text-primary transition-colors cursor-pointer"
                  >
                    Score
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  <button
                    onClick={() => handleSort('date')}
                    className="inline-flex items-center gap-1 hover:text-text-primary transition-colors cursor-pointer"
                  >
                    Date
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8">
                    <EmptyState
                      icon={FileText}
                      title="No reports found"
                      description="You haven't generated any reports matching these filters yet."
                      action={
                        <div className="flex items-center gap-3 mt-4">
                          <Link href="/analyze" className="inline-flex items-center justify-center gap-2 bg-text-primary text-bg-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-text-secondary transition-colors">
                            <Plus className="h-4 w-4" />
                            New Analysis
                          </Link>
                          {getPlanRank(tier) === 0 && (
                            <Link href="/pricing" className="inline-flex items-center justify-center gap-2 bg-accent-primary border border-accent-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-accent-hover transition-colors">
                              ✨ Upgrade to Pro
                            </Link>
                          )}
                        </div>
                      }
                    />
                  </td>
                </tr>
              ) : (
                paginated.map((report) => {
                  const isCompleted =
                    (report.status ?? '').toLowerCase() === 'completed';
                  const isSelected = selectedIds.includes(report.id);

                  return (
                    <tr
                      key={report.id}
                      onClick={() => router.push(`/report/${report.id}`)}
                      className={cn(
                        'border-b border-border-subtle last:border-0 transition-colors cursor-pointer',
                        'hover:bg-bg-tertiary/50',
                        isSelected && 'bg-accent-primary/5',
                      )}
                    >
                      {/* Checkbox */}
                      <td
                        className="w-12 px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          disabled={!isCompleted}
                          checked={isSelected}
                          onChange={() => toggleSelect(report.id)}
                          className={cn(
                            'h-4 w-4 rounded border-border-default accent-accent-primary cursor-pointer',
                            !isCompleted && 'opacity-30 cursor-not-allowed',
                          )}
                        />
                      </td>

                      {/* Company / Idea */}
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-text-primary">
                          {truncate(
                            report.companyName ?? report.title ?? '',
                            40,
                          )}
                        </span>
                      </td>

                      {/* Signal */}
                      <td className="px-4 py-3">
                        {report.investmentSignal ? (
                          <SignalBadge signal={report.investmentSignal} />
                        ) : (
                          <span className="text-text-muted text-sm">—</span>
                        )}
                      </td>

                      {/* Score */}
                      <td className="px-4 py-3 font-mono text-text-primary text-sm">
                        {report.investmentScore ?? '—'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {report.status ? (
                          <StatusBadge status={report.status} />
                        ) : (
                          <span className="text-text-muted text-sm">—</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-text-tertiary text-sm">
                        {report.createdAt
                          ? formatDate(report.createdAt)
                          : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <button
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={cn(
              'inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition cursor-pointer',
              safePage <= 1
                ? 'text-text-muted cursor-not-allowed'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary',
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <span className="text-sm text-text-tertiary">
            Page {safePage} of {totalPages}
          </span>

          <button
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className={cn(
              'inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition cursor-pointer',
              safePage >= totalPages
                ? 'text-text-muted cursor-not-allowed'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary',
            )}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

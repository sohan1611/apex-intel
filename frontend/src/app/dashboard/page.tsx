'use client';

import Link from 'next/link';
import {
  Plus,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Target,
  ChevronRight,
  FileText,
  GitCompareArrows,
  Activity,
  Bot,
  AlertTriangle,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { SignalBadge } from '@/components/ui/SignalBadge';
import { useReports } from '@/hooks/use-api';
import { formatDate } from '@/lib/utils';

// -- Quick action items -------------------------------------------------------

const QUICK_ACTIONS = [
  {
    href: '/analyze',
    icon: Plus,
    label: 'Start New Analysis',
    desc: 'Run a fresh due-diligence report',
  },
  {
    href: '/reports',
    icon: FileText,
    label: 'View Reports Library',
    desc: 'Browse all completed analyses',
  },
  {
    href: '/reports/compare',
    icon: GitCompareArrows,
    label: 'Compare Reports',
    desc: 'Side-by-side report comparison',
  },
] as const;

// -- Page component -----------------------------------------------------------

export default function DashboardPage() {
  const { data } = useReports();
  const reportsData = data || [];

  const completedReports = reportsData.filter(
    (r) => r.status === 'completed'
  );

  const strongSignalCount = reportsData.filter(
    (r) => r.investmentSignal === 'STRONG'
  ).length;

  const avgScore = Math.round(
    completedReports.reduce((sum, r) => sum + (r.investmentScore ?? 0), 0) /
      (completedReports.length || 1)
  );

  const recentReports = [...reportsData]
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? '').getTime() -
        new Date(a.createdAt ?? '').getTime()
    )
    .slice(0, 5);

  const topOpportunities = [...completedReports]
    .sort((a, b) => (b.investmentScore ?? 0) - (a.investmentScore ?? 0))
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        {/* ---- Page Header ---- */}
        <PageHeader
          title="Dashboard"
          subtitle="Your investment analysis overview"
          action={
            <Link
              href="/analyze"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                         bg-accent-primary hover:bg-accent-hover text-white
                         transition-colors shadow-sm shadow-accent-primary/25"
            >
              <Plus className="h-4 w-4" />
              New Analysis
            </Link>
          }
          className="px-0"
        />

        {/* ---- KPI Row ---- */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
          <MetricCard
            label="Total Analyses"
            value={reportsData.length}
            icon={<BarChart3 className="h-4 w-4" />}
          />
          <MetricCard
            label="Completed"
            value={completedReports.length}
            variant="success"
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
          <MetricCard
            label="Strong Signals"
            value={strongSignalCount}
            variant="success"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <MetricCard
            label="Avg Score"
            value={avgScore}
            subtitle="out of 100"
            icon={<Target className="h-4 w-4" />}
          />
        </div>

        {/* ---- Two-Column Layout ---- */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Recent Analyses */}
          <div className="lg:col-span-2 rounded-lg border border-border-default bg-bg-secondary">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
              <h2 className="text-sm font-semibold text-text-primary">
                Recent Analyses
              </h2>
              <Link
                href="/reports"
                className="text-xs text-accent-primary hover:text-accent-hover transition-colors"
              >
                View All
              </Link>
            </div>

            <div className="divide-y divide-border-default">
              {recentReports.map((report) => (
                <Link
                  key={report.id}
                  href={`/report/${report.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-bg-tertiary/40 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-primary/10 border border-accent-primary/20 text-xs font-semibold text-accent-primary">
                      {((report.companyName || report.title) ?? '?')[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {report.companyName || report.title || report.id}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {formatDate(report.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <SignalBadge signal={report.investmentSignal} />
                    {report.investmentScore != null && (
                      <span className="text-sm font-mono text-text-secondary">
                        {report.investmentScore}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-text-tertiary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="rounded-lg border border-border-default bg-bg-secondary">
              <div className="px-5 py-4 border-b border-border-default">
                <h2 className="text-sm font-semibold text-text-primary">
                  Quick Actions
                </h2>
              </div>
              <div className="divide-y divide-border-default">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-bg-tertiary/40 transition-colors group"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-primary/10 border border-accent-primary/20">
                        <Icon className="h-4 w-4 text-accent-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary">
                          {action.label}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          {action.desc}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-text-tertiary transition-colors shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Top Opportunities */}
            <div className="rounded-lg border border-border-default bg-bg-secondary">
              <div className="px-5 py-4 border-b border-border-default">
                <h2 className="text-sm font-semibold text-text-primary">
                  Top Opportunities
                </h2>
              </div>
              <div className="divide-y divide-border-default">
                {topOpportunities.map((report, i) => (
                  <Link
                    key={report.id}
                    href={`/report/${report.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-bg-tertiary/40 transition-colors group"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-primary/10 border border-accent-primary/20 text-[10px] font-bold text-accent-primary">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {report.companyName || report.title || report.id}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-mono font-semibold text-signal-strong">
                        {report.investmentScore}
                      </span>
                      <SignalBadge signal={report.investmentSignal} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---- Platform Activity ---- */}
        <div className="mt-6 rounded-lg border border-border-default bg-bg-secondary">
          <div className="px-5 py-4 border-b border-border-default">
            <h2 className="text-sm font-semibold text-text-primary">
              Platform Activity
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border-default">
            <div className="flex items-center gap-3 px-5 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-primary/10 border border-accent-primary/20">
                <Bot className="h-5 w-5 text-accent-primary" />
              </div>
              <div>
                <p className="text-xl font-semibold font-mono text-text-primary">
                  9,450
                </p>
                <p className="text-xs text-text-tertiary">Agent Runs</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-signal-strong/10 border border-signal-strong/20">
                <Activity className="h-5 w-5 text-signal-strong" />
              </div>
              <div>
                <p className="text-xl font-semibold font-mono text-text-primary">
                  892
                </p>
                <p className="text-xs text-text-tertiary">
                  Reports Generated
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-signal-moderate/10 border border-signal-moderate/20">
                <AlertTriangle className="h-5 w-5 text-signal-moderate" />
              </div>
              <div>
                <p className="text-xl font-semibold font-mono text-text-primary">
                  234
                </p>
                <p className="text-xs text-text-tertiary">
                  Contradictions Found
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

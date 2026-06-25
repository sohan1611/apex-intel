'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Plus,
  CheckCircle2,
  ChevronRight,
  FileText,
  GitCompareArrows,
  Activity,
  CreditCard,
  Clock,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Globe,
  Star
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SignalBadge } from '@/components/ui/SignalBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
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
  const { data: session, status: sessionStatus } = useSession();
  const { data, isLoading: reportsLoading } = useReports();
  
  // Loading State (Skeleton)
  if (sessionStatus === 'loading' || reportsLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-primary">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
          <div className="animate-pulse space-y-8">
            <div className="h-24 bg-bg-secondary rounded-lg w-full max-w-md"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-48 bg-bg-secondary rounded-lg"></div>
              <div className="h-48 bg-bg-secondary rounded-lg"></div>
              <div className="h-48 bg-bg-secondary rounded-lg"></div>
            </div>
            <div className="h-64 bg-bg-secondary rounded-lg w-full"></div>
          </div>
        </main>
      </div>
    );
  }

  const reportsData = data || [];
  const completedReports = reportsData.filter((r) => r.status === 'completed');

  const avgScore = completedReports.length > 0 
    ? Math.round(completedReports.reduce((sum, r) => sum + (r.investmentScore ?? 0), 0) / completedReports.length)
    : 0;

  const highestScore = completedReports.length > 0
    ? Math.max(...completedReports.map(r => r.investmentScore ?? 0))
    : 0;

  const recentReports = [...reportsData]
    .sort((a, b) => new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime())
    .slice(0, 5);

  const topOpportunities = [...completedReports]
    .sort((a, b) => (b.investmentScore ?? 0) - (a.investmentScore ?? 0))
    .slice(0, 3);

  // User limits logic
  const backendUser = (session?.user as any) || {};
  const firstName = backendUser.name?.split(' ')[0] || 'Investor';
  const tier = backendUser.tier || 'FREE';
  const limit = tier === 'PRO' ? 50 : tier === 'PRO_LITE' ? 15 : 2;
  const used = backendUser.analyses_used || 0;
  const credits = backendUser.purchased_credits || 0;
  const remaining = Math.max(0, limit - used) + credits;
  const resetDateString = backendUser.monthly_reset_date ? formatDate(backendUser.monthly_reset_date).split(',')[0] : 'Never';
  const progressValue = Math.min(100, Math.round((used / limit) * 100));

  const modelName = tier === 'FREE' ? 'Gemini 2.5 Flash Lite' : 'Gemini 2.5 Flash';
  const pipelineType = tier === 'FREE' ? 'Optimized Pipeline' : 'Full 9-Agent Due Diligence';
  const isPro = tier !== 'FREE';

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        
        {/* ---- Page Header ---- */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-2">
            Welcome back, {firstName}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-text-secondary">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent-primary/10 text-accent-primary font-medium border border-accent-primary/20">
              {tier} Plan
            </span>
            <span className="hidden sm:inline text-border-default">•</span>
            <span>{remaining} analyses remaining this month</span>
            <span className="hidden sm:inline text-border-default">•</span>
            <span>Resets on {resetDateString}</span>
          </div>
        </div>

        {/* ---- Top 3 Cards ---- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1: Current Plan */}
          <div className="rounded-xl border border-border-default bg-bg-secondary p-6 flex flex-col shadow-sm">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-accent-primary" /> Current Plan
            </h2>
            <div className="space-y-3 text-sm flex-1">
              <div className="flex justify-between">
                <span className="text-text-secondary">AI Model</span>
                <span className="font-medium text-text-primary">{modelName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Pipeline Type</span>
                <span className="font-medium text-text-primary">{pipelineType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Monthly Limit</span>
                <span className="font-medium text-text-primary">{limit} analyses/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Purchased Credits</span>
                <span className="font-medium text-text-primary">{credits}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Usage */}
          <div className="rounded-xl border border-border-default bg-bg-secondary p-6 flex flex-col shadow-sm">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent-primary" /> Usage Progress
            </h2>
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-bold text-text-primary">{used} <span className="text-base font-normal text-text-tertiary">/ {limit}</span></span>
                <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Analyses Used</span>
              </div>
              <ProgressBar value={progressValue} size="md" colorClass={progressValue >= 90 ? 'bg-signal-weak' : 'bg-accent-primary'} />
              <div className="mt-4 space-y-2">
                {credits > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Credits Remaining</span>
                    <span className="font-medium text-accent-primary">+{credits} runs</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Next Reset</span>
                  <span className="font-medium text-text-primary">{resetDateString}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Upgrade / Health */}
          {isPro ? (
            <div className="rounded-xl border border-accent-primary/20 bg-gradient-to-br from-bg-secondary to-accent-primary/5 p-6 flex flex-col shadow-sm">
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                <Star className="h-4 w-4 text-accent-primary" /> Pro Member
              </h2>
              <div className="flex-1 flex flex-col justify-center text-center">
                <CheckCircle2 className="h-8 w-8 text-accent-primary mx-auto mb-3" />
                <p className="text-base font-medium text-text-primary mb-1">You're using Apex Intel Pro.</p>
                <p className="text-sm text-text-secondary">Thank you for supporting the platform and trusting our AI due diligence.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-accent-primary/30 bg-gradient-to-br from-bg-secondary to-accent-primary/5 p-6 flex flex-col shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Zap className="h-24 w-24 text-accent-primary" />
              </div>
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3 relative z-10">
                Unlock Full Due Diligence
              </h2>
              <ul className="space-y-2 mb-4 text-sm text-text-secondary relative z-10 flex-1">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-primary" /> Premium AI Models</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-primary" /> Full 9-Agent Analysis</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-primary" /> Faster Processing</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-primary" /> More Monthly Analyses</li>
              </ul>
              <Link
                href="/pricing"
                className="w-full relative z-10 text-center bg-accent-primary hover:bg-accent-hover text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Upgrade Plan
              </Link>
            </div>
          )}
        </div>

        {/* ---- Dashboard Health & User Insights Row ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Account Health */}
          <div className="rounded-xl border border-border-default bg-bg-secondary p-5 flex flex-col shadow-sm">
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">Account Health</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-primary flex items-center gap-2"><Globe className="h-4 w-4 text-text-muted" /> Google Connected</span>
                <CheckCircle2 className="h-4 w-4 text-status-completed" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-primary flex items-center gap-2"><CreditCard className="h-4 w-4 text-text-muted" /> Subscription Active</span>
                <CheckCircle2 className="h-4 w-4 text-status-completed" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-primary flex items-center gap-2"><Lock className="h-4 w-4 text-text-muted" /> Reports Private</span>
                <CheckCircle2 className="h-4 w-4 text-status-completed" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-primary flex items-center gap-2"><Cpu className="h-4 w-4 text-text-muted" /> Backend Online</span>
                <CheckCircle2 className="h-4 w-4 text-status-completed" />
              </div>
            </div>
          </div>

          {/* User Insights */}
          {completedReports.length > 0 && (
            <div className="lg:col-span-3 rounded-xl border border-border-default bg-bg-secondary p-5 shadow-sm flex flex-col justify-center">
              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">Your Analysis Insights</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-border-default">
                <div className="px-4 py-2 sm:py-0 first:pl-0">
                  <p className="text-2xl font-bold text-text-primary">{completedReports.length}</p>
                  <p className="text-xs text-text-tertiary mt-1">Total Reports</p>
                </div>
                <div className="px-4 py-2 sm:py-0">
                  <p className="text-2xl font-bold text-text-primary">{avgScore}</p>
                  <p className="text-xs text-text-tertiary mt-1">Average Score</p>
                </div>
                <div className="px-4 py-2 sm:py-0">
                  <p className="text-2xl font-bold text-text-primary">{highestScore}</p>
                  <p className="text-xs text-text-tertiary mt-1">Highest Score</p>
                </div>
                <div className="px-4 py-2 sm:py-0 min-w-0">
                  <p className="text-lg font-bold text-text-primary truncate">{completedReports[0]?.companyName || completedReports[0]?.title || 'N/A'}</p>
                  <p className="text-xs text-text-tertiary mt-1">Most Recent</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ---- Main Two-Column Layout ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Recent Analyses */}
          <div className="lg:col-span-2 rounded-xl border border-border-default bg-bg-secondary flex flex-col shadow-sm">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border-default">
              <h2 className="text-base font-semibold text-text-primary">
                Recent Evaluations
              </h2>
              <Link
                href="/reports"
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex-1 overflow-hidden">
              {recentReports.length === 0 ? (
                <div className="p-12">
                  <EmptyState 
                    icon={Activity}
                    title="No analyses yet"
                    description="Generate your first startup investment memo in just a few minutes."
                    action={
                      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link href="/analyze" className="inline-flex items-center justify-center gap-2 bg-text-primary text-bg-primary px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-text-secondary transition-colors w-full sm:w-auto">
                          New Analysis
                        </Link>
                        <Link href="/analyze" className="inline-flex items-center justify-center gap-2 bg-bg-tertiary border border-border-default text-text-primary px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-bg-elevated transition-colors w-full sm:w-auto">
                          Try Example
                        </Link>
                      </div>
                    }
                  />
                </div>
              ) : (
                <div className="divide-y divide-border-default">
                  {recentReports.map((report) => (
                    <Link
                      key={report.id}
                      href={`/report/${report.id}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-bg-tertiary/40 transition-colors group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-primary/10 border border-accent-primary/20 text-sm font-bold text-accent-primary">
                          {((report.companyName || report.title) ?? '?')[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-medium text-text-primary truncate">
                            {report.companyName || report.title || report.id}
                          </p>
                          <p className="text-xs text-text-tertiary mt-0.5">
                            {formatDate(report.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <SignalBadge signal={report.investmentSignal} />
                        {report.investmentScore != null && (
                          <span className="text-base font-mono font-semibold text-text-secondary">
                            {report.investmentScore}
                          </span>
                        )}
                        <ChevronRight className="h-5 w-5 text-text-muted group-hover:text-text-primary transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="rounded-xl border border-border-default bg-bg-secondary flex flex-col shadow-sm">
              <div className="px-6 py-5 border-b border-border-default">
                <h2 className="text-base font-semibold text-text-primary">
                  Quick Actions
                </h2>
              </div>
              <div className="divide-y divide-border-default flex-1">
                {QUICK_ACTIONS.map((action, idx) => {
                  const Icon = action.icon;
                  const isFirstAndEmpty = idx === 0 && recentReports.length === 0;
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className={`flex items-center gap-4 px-6 py-4 transition-colors group ${
                        isFirstAndEmpty ? 'bg-accent-primary/5 hover:bg-accent-primary/10' : 'hover:bg-bg-tertiary/40'
                      }`}
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                        isFirstAndEmpty ? 'bg-accent-primary text-white border-accent-primary' : 'bg-bg-tertiary border-border-hover group-hover:border-text-secondary text-text-secondary group-hover:text-text-primary'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${isFirstAndEmpty ? 'text-accent-primary' : 'text-text-primary'}`}>
                          {action.label}
                        </p>
                        <p className="text-xs text-text-tertiary mt-0.5">
                          {action.desc}
                        </p>
                      </div>
                      <ChevronRight className={`h-5 w-5 shrink-0 transition-colors ${isFirstAndEmpty ? 'text-accent-primary' : 'text-text-muted group-hover:text-text-primary'}`} />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Top Opportunities */}
            <div className="rounded-xl border border-border-default bg-bg-secondary flex flex-col shadow-sm">
              <div className="px-6 py-5 border-b border-border-default">
                <h2 className="text-base font-semibold text-text-primary">
                  Top Opportunities
                </h2>
              </div>
              <div className="divide-y divide-border-default flex-1">
                {topOpportunities.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Your highest-rated startups will automatically appear here after your first completed report.
                    </p>
                  </div>
                ) : (
                  topOpportunities.map((report, i) => (
                    <Link
                      key={report.id}
                      href={`/report/${report.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-bg-tertiary/40 transition-colors group"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg-tertiary border border-border-hover text-xs font-bold text-text-secondary">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {report.companyName || report.title || report.id}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-mono font-semibold text-text-primary">
                          {report.investmentScore}
                        </span>
                        <SignalBadge signal={report.investmentSignal} />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ---- Trust Footer ---- */}
        <div className="mt-12 mb-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs text-text-tertiary">
          <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Secure Google Authentication</div>
          <div className="flex items-center gap-1.5"><Lock className="h-4 w-4" /> Private Encrypted Reports</div>
          <div className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> AI Analysis Timestamped</div>
        </div>

      </main>

      <Footer />
    </div>
  );
}

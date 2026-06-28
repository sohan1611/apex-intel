'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Users,
  AlertTriangle,
  FlaskConical,
  Cog,
  GitCompareArrows,
  Target,
  Lightbulb,
  FileText,
  Globe,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAnalyze, useReports } from '@/hooks/use-api';
import { useSession } from 'next-auth/react';

// -- Helpers --

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// -- Example data --

const EXAMPLES: { type: 'text' | 'url'; label: string; content: string }[] = [
  {
    type: 'text',
    label: 'Text Description',
    content:
      'AI-powered nutrition platform targeting diabetics with CGM integration and personalized meal planning',
  },
  {
    type: 'url',
    label: 'Company URL',
    content: 'https://notion.so',
  },
  {
    type: 'text',
    label: 'Text Description',
    content:
      'B2B SaaS tool for automated compliance reporting in fintech, targeting Series A-C companies',
  },
];

const ANALYSIS_PILLS: { icon: React.ReactNode; label: string }[] = [
  { icon: <TrendingUp className="h-3.5 w-3.5" />, label: 'Market Sizing' },
  { icon: <Users className="h-3.5 w-3.5" />, label: 'Competition' },
  { icon: <AlertTriangle className="h-3.5 w-3.5" />, label: 'Risk & Red Flags' },
  { icon: <FlaskConical className="h-3.5 w-3.5" />, label: 'Assumptions' },
  { icon: <Cog className="h-3.5 w-3.5" />, label: 'Execution' },
  { icon: <GitCompareArrows className="h-3.5 w-3.5" />, label: 'Contradictions' },
  { icon: <Target className="h-3.5 w-3.5" />, label: 'Investment Score' },
];

const TIPS = [
  'Include target market and revenue model for best results',
  'URLs are scraped for company data automatically',
  'Analysis takes 2-3 minutes with 9 specialized agents',
];

// -- Page component --

type InputMode = 'text' | 'url';

export default function AnalyzePage() {
  const router = useRouter();
  const [mode, setMode] = useState<InputMode>('text');
  const [textValue, setTextValue] = useState('');
  const [urlValue, setUrlValue] = useState('');
  const [urlTouched, setUrlTouched] = useState(false);

  const { status } = useSession();
  const analyzeMutation = useAnalyze();
  const { data: reportsData } = useReports();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/analyze');
    }
  }, [status, router]);

  const currentValue = mode === 'text' ? textValue : urlValue;
  const isUrlInvalid = mode === 'url' && urlTouched && urlValue.length > 0 && !isValidUrl(urlValue);
  const isDisabled = currentValue.trim().length === 0 || (mode === 'url' && !isValidUrl(urlValue)) || analyzeMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;
    
    analyzeMutation.mutate(
      {
        input_type: mode,
        content: currentValue,
      },
      {
        onSuccess: (data) => {
          router.push(`/analysis/${data.analysis_id}`);
        },
      }
    );
  };

  const handleExampleClick = (example: (typeof EXAMPLES)[number]) => {
    if (example.type === 'text') {
      setMode('text');
      setTextValue(example.content);
    } else {
      setMode('url');
      setUrlValue(example.content);
      setUrlTouched(false);
    }
  };

  const recentReports = reportsData?.slice(0, 3) || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <PageHeader
        title="New Analysis"
        subtitle="Submit a startup idea or company URL for due diligence analysis."
      />

      <main className="flex-1 px-6 pb-16">
        <div className="mx-auto max-w-2xl">
          {/* --- Input Card --- */}
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-border-default bg-bg-secondary p-6 animate-fade-in"
          >
            {/* Segmented Control */}
            <div className="flex rounded-lg bg-bg-tertiary p-1 mb-6">
              <button
                type="button"
                onClick={() => setMode('text')}
                className={cn(
                  'flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200',
                  mode === 'text'
                    ? 'bg-accent-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                Text Description
              </button>
              <button
                type="button"
                onClick={() => setMode('url')}
                className={cn(
                  'flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200',
                  mode === 'url'
                    ? 'bg-accent-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                Company URL
              </button>
            </div>

            {/* Text Input */}
            {mode === 'text' && (
              <textarea
                rows={6}
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="Describe the startup idea, business model, target market, and any other relevant details..."
                className={cn(
                  'w-full rounded-lg border border-border-default bg-bg-primary p-4 text-sm text-text-primary',
                  'placeholder:text-text-muted resize-none',
                  'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent',
                  'transition-all duration-200'
                )}
              />
            )}

            {/* URL Input */}
            {mode === 'url' && (
              <input
                type="text"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                onBlur={() => setUrlTouched(true)}
                placeholder="https://example.com"
                className={cn(
                  'w-full rounded-lg border bg-bg-primary p-4 text-sm text-text-primary',
                  'placeholder:text-text-muted',
                  'focus:outline-none focus:ring-2 focus:border-transparent',
                  'transition-all duration-200',
                  isUrlInvalid
                    ? 'border-signal-weak focus:ring-signal-weak'
                    : 'border-border-default focus:ring-accent-primary'
                )}
              />
            )}

            {/* URL Validation Error */}
            {isUrlInvalid && (
              <p className="mt-2 text-xs text-signal-weak">
                Please enter a valid URL (e.g., https://example.com)
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isDisabled}
              className={cn(
                'w-full mt-4 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all duration-200',
                isDisabled
                  ? 'bg-bg-tertiary text-text-muted cursor-not-allowed'
                  : 'bg-accent-primary hover:bg-accent-hover text-white hover:shadow-lg hover:shadow-accent-primary/20'
              )}
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting Analysis...
                </>
              ) : (
                <>
                  Run Analysis
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="text-xs text-text-tertiary mt-2 text-center">
              {analyzeMutation.isError && (
                <span className="text-signal-weak block mb-1">
                  {analyzeMutation.error?.message?.includes('429')
                    ? 'AI capacity is temporarily busy. Please try again in a few minutes.'
                    : analyzeMutation.error?.message?.includes('403')
                    ? 'Your current plan does not allow this action.'
                    : 'Something went wrong while generating your report. Please try again.'}
                </span>
              )}
              Estimated analysis time: ~2-3 minutes
            </p>
          </form>

          {/* --- Try an Example --- */}
          <div className="mt-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h3 className="text-sm font-medium text-text-secondary mb-3">Try an Example</h3>
            <div className="grid gap-2">
              {EXAMPLES.map((example, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleExampleClick(example)}
                  className="rounded-lg border border-border-default bg-bg-tertiary/50 hover:bg-bg-tertiary p-3 cursor-pointer transition-colors text-left group"
                >
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-text-muted mb-1">
                    {example.type === 'url' ? (
                      <Globe className="h-3 w-3" />
                    ) : (
                      <FileText className="h-3 w-3" />
                    )}
                    {example.label}
                  </span>
                  <p className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                    {example.content}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* --- What We Evaluate --- */}
          <div className="mt-8 animate-fade-in" style={{ animationDelay: '150ms' }}>
            <h3 className="text-sm font-medium text-text-secondary mb-3">
              What Apex Intel Evaluates
            </h3>
            <div className="flex flex-wrap gap-2">
              {ANALYSIS_PILLS.map((pill) => (
                <span
                  key={pill.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-secondary border border-border-default text-xs text-text-secondary"
                >
                  {pill.icon}
                  {pill.label}
                </span>
              ))}
            </div>
          </div>

          {/* --- Analysis Tips --- */}
          <div className="mt-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="rounded-lg border border-border-default bg-bg-secondary p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-text-muted" />
                <h3 className="text-sm font-medium text-text-secondary">Analysis Tips</h3>
              </div>
              <ul className="space-y-2">
                {TIPS.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-text-muted flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* --- Recent Analyses --- */}
          {recentReports.length > 0 && (
            <div className="mt-10 animate-fade-in" style={{ animationDelay: '250ms' }}>
              <h3 className="text-sm font-medium text-text-tertiary mb-3">
                Recent Analyses
              </h3>
              <div className="rounded-lg border border-border-default bg-bg-secondary overflow-hidden divide-y divide-border-default">
                {recentReports.map((report) => {
                  const displayName = report.input_content ?? report.id;
                  const signal = report.investment_signal;
                  const dateStr = report.created_at ?? '';
                  return (
                    <Link
                      key={report.id}
                      href={`/report/${report.id}`}
                      className="flex items-center justify-between px-4 py-3.5 hover:bg-bg-tertiary/30 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {displayName}
                          </p>
                          {dateStr && (
                            <p className="text-xs text-text-muted mt-0.5">
                              {formatDate(dateStr)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {signal && <StatusBadge status={signal} />}
                        <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-text-tertiary transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

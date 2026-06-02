'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MOCK_REPORTS_LIST } from '@/lib/mock-data';

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

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

// ──────────────────────────────────────────────
// Analysis Input Page
// ──────────────────────────────────────────────

type InputMode = 'text' | 'url';

export default function AnalyzePage() {
  const router = useRouter();
  const [mode, setMode] = useState<InputMode>('text');
  const [textValue, setTextValue] = useState('');
  const [urlValue, setUrlValue] = useState('');
  const [urlTouched, setUrlTouched] = useState(false);

  const currentValue = mode === 'text' ? textValue : urlValue;
  const isUrlInvalid = mode === 'url' && urlTouched && urlValue.length > 0 && !isValidUrl(urlValue);
  const isDisabled = currentValue.trim().length === 0 || (mode === 'url' && !isValidUrl(urlValue));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;
    router.push('/analysis/mock-analysis-id');
  };

  const recentReports = MOCK_REPORTS_LIST.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <PageHeader
        title="New Analysis"
        subtitle="Submit a startup idea or company URL for due diligence analysis."
      />

      <main className="flex-1 px-6 pb-16">
        {/* ─── Input Card ─────────────────────────── */}
        <div className="mx-auto max-w-2xl">
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
              Run Analysis
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="text-xs text-text-tertiary mt-2 text-center">
              Estimated analysis time: ~2-3 minutes
            </p>
          </form>

          {/* ─── Recent Analyses ────────────────────── */}
          {recentReports.length > 0 && (
            <div className="mt-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
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

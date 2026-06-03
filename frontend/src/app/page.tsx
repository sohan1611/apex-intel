import Link from 'next/link';
import { Layers, FileText, ShieldCheck } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';

// Feature Card Data

const FEATURES = [
  {
    icon: Layers,
    title: '9 Specialized Agents',
    desc: 'Market research, competitor analysis, risk assessment, and more — running in parallel.',
  },
  {
    icon: FileText,
    title: 'Structured Memos, Not Chat',
    desc: 'Professional investment memos with scored insights, source attribution, and confidence metrics.',
  },
  {
    icon: ShieldCheck,
    title: 'Source-Verified Insights',
    desc: 'Every claim attributed as search-based or inferred. No hallucination. No generic summaries.',
  },
] as const;

// Pipeline Steps

const PIPELINE_STEPS = [
  { label: 'Data Structuring', sub: null },
  { label: 'Parallel Analysis', sub: '5 agents' },
  { label: 'Contradiction Detection', sub: null },
  { label: 'Synthesis', sub: null },
  { label: 'Scoring', sub: null },
] as const;

// Sample Risks

const SAMPLE_RISKS = [
  {
    severity: 'critical' as const,
    title: 'FDA Compliance Uncertainty',
    source: 'search',
  },
  {
    severity: 'high' as const,
    title: 'Crowded Competitive Landscape',
    source: 'search',
  },
  {
    severity: 'medium' as const,
    title: 'Data Moat Concerns',
    source: 'inferred',
  },
];

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-signal-weak/10 text-signal-weak border-signal-weak/20',
  high: 'bg-signal-moderate/10 text-signal-moderate border-signal-moderate/20',
  medium: 'bg-accent-primary/10 text-accent-primary border-accent-primary/20',
};

// Landing Page

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-24 pb-16 px-6">
          <div className="mx-auto max-w-3xl text-center">
            {/* Decorative badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-secondary px-4 py-1.5 text-xs text-text-tertiary mb-8 animate-fade-in">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-primary animate-pulse-dot" />
              AI-Powered Due Diligence
            </div>

            <h1 className="text-4xl md:text-5xl font-semibold text-text-primary tracking-tight leading-tight animate-fade-in">
              Due Diligence,{' '}
              <span className="bg-gradient-to-r from-accent-primary to-blue-300 bg-clip-text text-transparent">
                Automated.
              </span>
            </h1>

            <p className="text-lg text-text-secondary max-w-xl mx-auto mt-4 leading-relaxed animate-fade-in" style={{ animationDelay: '100ms' }}>
              AI-powered investment analysis that surfaces what matters. Market
              sizing, risk profiles, and competitive landscapes — in minutes.
            </p>

            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 bg-accent-primary hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-medium mt-8 transition-all duration-200 hover:shadow-lg hover:shadow-accent-primary/20 animate-fade-in"
              style={{ animationDelay: '200ms' }}
            >
              Start Analysis
              <span className="text-white/70">→</span>
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="px-6 mt-20">
          <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-lg border border-border-default bg-bg-secondary p-6 transition-all duration-300 hover:border-border-hover hover:bg-bg-secondary/80"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary/10 border border-accent-primary/20 mb-4 group-hover:bg-accent-primary/15 transition-colors">
                    <Icon className="h-5 w-5 text-accent-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pipeline Visualization */}
        <section className="px-6 mt-24">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-xl font-semibold text-text-primary text-center mb-12">
              How It Works
            </h2>

            {/* Desktop: horizontal stepper */}
            <div className="hidden md:flex items-start justify-between relative">
              {/* Connecting line */}
              <div className="absolute top-5 left-[10%] right-[10%] h-px bg-border-default" />

              {PIPELINE_STEPS.map((step, i) => (
                <div
                  key={step.label}
                  className="relative flex flex-col items-center text-center z-10"
                  style={{ width: '20%' }}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold border-2 transition-colors ${
                      i === 0
                        ? 'bg-accent-primary border-accent-primary text-white'
                        : 'bg-bg-primary border-accent-primary/40 text-accent-primary'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="mt-3 text-sm font-medium text-text-primary">
                    {step.label}
                  </span>
                  {step.sub && (
                    <span className="mt-1 text-xs text-text-tertiary">
                      {step.sub}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile: vertical stepper */}
            <div className="flex flex-col md:hidden gap-0">
              {PIPELINE_STEPS.map((step, i) => (
                <div key={step.label} className="flex items-start gap-4">
                  {/* Line + circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold border-2 flex-shrink-0 ${
                        i === 0
                          ? 'bg-accent-primary border-accent-primary text-white'
                          : 'bg-bg-primary border-accent-primary/40 text-accent-primary'
                      }`}
                    >
                      {i + 1}
                    </div>
                    {i < PIPELINE_STEPS.length - 1 && (
                      <div className="w-px h-8 bg-border-default" />
                    )}
                  </div>
                  {/* Text */}
                  <div className="pt-1.5 pb-4">
                    <span className="text-sm font-medium text-text-primary">
                      {step.label}
                    </span>
                    {step.sub && (
                      <span className="block mt-0.5 text-xs text-text-tertiary">
                        {step.sub}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sample Report Preview */}
        <section className="px-6 mt-24 pb-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-xl font-semibold text-text-primary text-center mb-2">
              Investment-Grade Output
            </h2>
            <p className="text-sm text-text-tertiary text-center mb-10">
              See what an Apex Intel memo looks like
            </p>

            <div className="rounded-lg border border-border-default bg-bg-secondary p-6 md:p-8">
              {/* Report header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    NutriSync — AI Nutrition Platform
                  </h3>
                  <p className="text-sm text-text-tertiary mt-1">
                    Due diligence report · May 28, 2026
                  </p>
                </div>
                <StatusBadge status="MODERATE" size="md" />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <MetricCard
                  label="Score"
                  value="67/100"
                />
                <MetricCard
                  label="Signal"
                  value="MODERATE"
                />
                <MetricCard
                  label="Confidence"
                  value="64%"
                />
                <MetricCard
                  label="Red Flags"
                  value={2}
                  variant="danger"
                />
              </div>

              {/* Sample Risks */}
              <div className="border-t border-border-default pt-5">
                <h4 className="text-xs font-medium uppercase tracking-wider text-text-tertiary mb-3">
                  Key Risks Identified
                </h4>
                <div className="space-y-2.5">
                  {SAMPLE_RISKS.map((risk) => (
                    <div
                      key={risk.title}
                      className="flex items-center justify-between py-2 px-3 rounded-md bg-bg-primary/50"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                            SEVERITY_COLORS[risk.severity]
                          }`}
                        >
                          {risk.severity}
                        </span>
                        <span className="text-sm text-text-secondary">
                          {risk.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider hidden sm:inline">
                        {risk.source}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

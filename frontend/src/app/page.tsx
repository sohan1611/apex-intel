import Link from 'next/link';
import {
  Layers,
  FileText,
  ShieldCheck,
  FileInput,
  Bot,
  SearchCheck,
  FileBarChart,
  GitCompareArrows,
  FlaskConical,
  AlertTriangle,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';

// -- Feature Card Data --

const FEATURES = [
  {
    icon: Layers,
    title: 'Market Intelligence',
    desc: 'Automated market sizing, competitor mapping, and positioning analysis -- executed in parallel.',
  },
  {
    icon: FileText,
    title: 'Structured Investment Memos',
    desc: 'Professional due-diligence memos with scored insights, source attribution, and confidence metrics.',
  },
  {
    icon: ShieldCheck,
    title: 'Source-Verified Claims',
    desc: 'Every insight is attributed to a verifiable source or explicitly marked as an inference.',
  },
] as const;

// -- Workflow Steps --

const WORKFLOW_STEPS = [
  {
    icon: FileInput,
    title: 'Input',
    desc: 'Submit a startup URL, pitch deck, or concept text',
  },
  {
    icon: Bot,
    title: 'Evaluation Engine',
    desc: 'Multi-agent system processes market, execution, and competitive vectors',
  },
  {
    icon: SearchCheck,
    title: 'Cross-Validation',
    desc: 'Identifies contradictions, challenges assumptions, and verifies sources',
  },
  {
    icon: FileBarChart,
    title: 'Investment Memo',
    desc: 'Comprehensive report with risk scoring and go/no-go signals',
  },
] as const;

// -- Why Apex Intel Cards --

const WHY_CARDS = [
  {
    icon: ShieldCheck,
    title: 'Source Verification',
    desc: 'Every claim is attributed as search-verified or inference-based. No black-box conclusions.',
  },
  {
    icon: GitCompareArrows,
    title: 'Contradiction Detection',
    desc: 'Cross-references all agent outputs to surface conflicting data and inconsistencies.',
  },
  {
    icon: FlaskConical,
    title: 'Assumption Validation',
    desc: 'Identifies hidden assumptions and rates their validation difficulty and impact if proven false.',
  },
  {
    icon: AlertTriangle,
    title: 'Risk Intelligence',
    desc: 'Systematic risk identification with severity scoring and multi-agent corroboration.',
  },
] as const;

// -- Sample Risks --

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

// -- Trusted-By Names --

const TRUSTED_BY = ['Sequoia', 'a16z', 'Benchmark', 'Lightspeed', 'Accel'];

// -- Landing Page --

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* ---- 1. Hero Section ---- */}
        <section className="pt-24 pb-12 px-6">
          <div className="mx-auto max-w-4xl text-center">
            {/* Decorative badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-secondary px-3 py-1 text-xs text-text-secondary mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-primary" />
              Investment Intelligence Platform
            </div>

            <h1 className="text-4xl md:text-6xl font-semibold text-text-primary tracking-tight leading-[1.1]">
              Startup Evaluation,{' '}
              <span className="text-accent-primary">
                Systematized.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mt-6 leading-relaxed">
              Execute comprehensive due diligence in minutes. We aggregate market signals,
              evaluate competitive moats, and systematically assess execution risks.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Link
                href="/analyze"
                className="inline-flex items-center justify-center gap-2 bg-text-primary text-bg-primary px-6 py-3 rounded-md font-medium hover:bg-text-secondary transition-colors w-full sm:w-auto"
              >
                Start Evaluation
                <span className="text-bg-tertiary">&rarr;</span>
              </Link>
              <Link
                href="/report/mock-report-id"
                className="inline-flex items-center justify-center gap-2 border border-border-default hover:border-border-hover bg-bg-secondary text-text-primary px-6 py-3 rounded-md font-medium transition-colors w-full sm:w-auto"
              >
                View Sample Memo
              </Link>
            </div>
          </div>
        </section>

        {/* ---- 2. Trusted By Section ---- */}
        <section className="px-6 mt-12">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-5">
              Trusted by Leading Investment Teams
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {TRUSTED_BY.map((name) => (
                <span
                  key={name}
                  className="text-text-muted font-semibold text-lg tracking-tight opacity-40 select-none"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ---- 3. Platform Metrics Section ---- */}
        <section className="px-6 mt-16">
          <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Analyses Completed" value="1,247" />
            <MetricCard label="Companies Evaluated" value="892" />
            <MetricCard label="Avg Confidence" value="73%" />
            <MetricCard label="Agent Decisions" value="11.2K+" />
          </div>
        </section>

        {/* ---- 4. Feature Grid ---- */}
        <section className="px-6 mt-16">
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

        {/* ---- 5. Workflow Explainer ---- */}
        <section className="px-6 mt-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-xl font-semibold text-text-primary text-center mb-12">
              How It Works
            </h2>

            {/* Desktop: 4-column grid */}
            <div className="hidden md:grid grid-cols-4 gap-6 relative">
              {/* Connecting line */}
              <div className="absolute top-10 left-[12%] right-[12%] h-px bg-border-default z-0" />

              {WORKFLOW_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="relative z-10 flex flex-col items-center text-center rounded-lg border border-border-default bg-bg-secondary p-6 transition-all duration-300 hover:border-border-hover"
                  >
                    {/* Numbered circle */}
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold border-2 mb-3 ${
                        i === 0
                          ? 'bg-accent-primary border-accent-primary text-white'
                          : 'bg-bg-primary border-accent-primary/40 text-accent-primary'
                      }`}
                    >
                      {i + 1}
                    </div>
                    {/* Icon */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary/10 border border-accent-primary/20 mb-3">
                      <Icon className="h-5 w-5 text-accent-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1">
                      {step.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Mobile: vertical flow */}
            <div className="md:hidden flex flex-col gap-0">
              {WORKFLOW_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="flex items-start gap-4">
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
                      {i < WORKFLOW_STEPS.length - 1 && (
                        <div className="w-px h-12 bg-border-default" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="pt-1 pb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4 text-accent-primary" />
                        <span className="text-sm font-semibold text-text-primary">
                          {step.title}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---- 6. Why Apex Intel Section ---- */}
        <section className="px-6 mt-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-10">
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Why Apex Intel
              </h2>
              <p className="text-sm text-text-tertiary">
                Every insight is earned, not generated
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {WHY_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="rounded-lg border border-border-default bg-bg-secondary p-6 transition-all duration-300 hover:border-border-hover"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary/10 border border-accent-primary/20 mb-4">
                      <Icon className="h-5 w-5 text-accent-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-text-primary mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---- 7. Sample Report Preview ---- */}
        <section className="px-6 mt-20">
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
                    NutriSync -- AI Nutrition Platform
                  </h3>
                  <p className="text-sm text-text-tertiary mt-1">
                    Due diligence report - May 28, 2026
                  </p>
                </div>
                <StatusBadge status="MODERATE" size="md" />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <MetricCard label="Score" value="67/100" />
                <MetricCard label="Signal" value="MODERATE" />
                <MetricCard label="Confidence" value="64%" />
                <MetricCard label="Red Flags" value={2} variant="danger" />
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

        {/* ---- 8. CTA Banner ---- */}
        <section className="px-6 mt-20 mb-0">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-xl border border-border-default bg-bg-secondary p-8 md:p-12 text-center">
              <h2 className="text-2xl font-semibold text-text-primary mb-3">
                Ready to analyze your next investment?
              </h2>
              <p className="text-sm text-text-secondary max-w-lg mx-auto mb-8">
                Get a comprehensive due diligence memo in minutes, not weeks.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/analyze"
                  className="inline-flex items-center justify-center gap-2 bg-text-primary text-bg-primary px-6 py-3 rounded-md font-medium hover:bg-text-secondary transition-colors w-full sm:w-auto"
                >
                  Start Evaluation
                  <span className="text-bg-tertiary">&rarr;</span>
                </Link>
                <Link
                  href="/report/mock-report-id"
                  className="inline-flex items-center justify-center gap-2 border border-border-default hover:border-border-hover bg-bg-secondary text-text-primary px-6 py-3 rounded-md font-medium transition-colors w-full sm:w-auto"
                >
                  View Sample Memo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ---- 9. Footer ---- */}
      <Footer />
    </div>
  );
}

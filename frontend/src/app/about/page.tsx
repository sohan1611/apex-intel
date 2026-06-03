'use client';

import Link from 'next/link';
import {
  Database,
  TrendingUp,
  Users,
  ShieldAlert,
  FlaskConical,
  Cog,
  GitCompareArrows,
  FileBarChart,
  Target,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        
        {/* Hero Section */}
        <section className="text-center pt-16 pb-8">
          <h1 className="text-4xl md:text-5xl font-semibold text-text-primary tracking-tight mb-4">
            About Apex Intel
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            AI-powered investment intelligence that replaces weeks of manual due diligence with structured, source-verified analysis in minutes.
          </p>
        </section>

        {/* Mission Section */}
        <section className="mt-12">
          <div className="rounded-lg border border-border-default bg-bg-secondary p-8 text-center max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">Our Mission</h2>
            <p className="text-base text-text-secondary leading-relaxed">
              Apex Intel exists to democratize investment due diligence. We believe every investor, from solo angels to institutional funds, deserves access to the same caliber of analysis that top-tier firms produce internally. Our platform combines 9 specialized AI agents with rigorous source verification to deliver investment memos that are transparent, defensible, and actionable.
            </p>
          </div>
        </section>

        {/* 9-Agent Architecture */}
        <section className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-2">The 9-Agent Architecture</h2>
            <p className="text-sm text-text-secondary">
              Each analysis deploys nine specialized AI agents working in concert
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Database, title: 'Data Structuring Agent', desc: 'Strips marketing language and extracts objective company facts' },
              { icon: TrendingUp, title: 'Market Research Agent', desc: 'Estimates TAM/SAM/SOM and identifies market trends' },
              { icon: Users, title: 'Competitor Analysis Agent', desc: 'Maps competitive landscape with pricing and positioning' },
              { icon: ShieldAlert, title: 'Skeptic Agent', desc: 'Identifies risks with severity ratings and rationale' },
              { icon: FlaskConical, title: 'Assumption Validator', desc: 'Surfaces hidden assumptions and rates impact if false' },
              { icon: Cog, title: 'Execution Feasibility Agent', desc: 'Assesses operational difficulty and capital requirements' },
              { icon: GitCompareArrows, title: 'Contradiction Detector', desc: 'Cross-references all outputs for conflicting data' },
              { icon: FileBarChart, title: 'Synthesizer', desc: 'Combines all findings into a unified investment memo' },
              { icon: Target, title: 'Scoring Engine', desc: 'Computes weighted investment score with signal classification' }
            ].map((agent, i) => {
              const Icon = agent.icon;
              return (
                <div key={i} className="rounded-lg border border-border-default bg-bg-secondary p-5 flex flex-col items-start hover:border-border-hover transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-accent-primary" />
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">{agent.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{agent.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Analysis Pipeline */}
        <section className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-2">The Analysis Pipeline</h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col gap-0">
              {[
                { title: 'Data Ingestion', desc: 'Raw input is processed, URLs are scraped, and company data is structured' },
                { title: 'Parallel Analysis', desc: 'Five agents run simultaneously: market, competitor, skeptic, assumption, execution' },
                { title: 'Cross-Validation', desc: 'Contradiction detector compares all outputs for inconsistencies' },
                { title: 'Synthesis', desc: 'All findings are merged into a comprehensive investment memo' },
                { title: 'Scoring', desc: 'Weighted scoring engine generates final investment signal' }
              ].map((phase, i, arr) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold border-2 border-accent-primary/40 text-accent-primary bg-bg-primary flex-shrink-0">
                      {i + 1}
                    </div>
                    {i < arr.length - 1 && <div className="w-px h-16 bg-border-default my-1" />}
                  </div>
                  <div className="pt-1 pb-4">
                    <h3 className="text-base font-semibold text-text-primary mb-1">{phase.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{phase.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Source Attribution */}
        <section className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-2">Source Attribution System</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="rounded-lg border border-border-default bg-bg-secondary p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-signal-strong/10 text-signal-strong border-signal-strong/20">
                  Search-Verified
                </span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Claims backed by real-time web search results with source URLs. The system actively looks for evidence to support or refute assertions.
              </p>
            </div>
            
            <div className="rounded-lg border border-border-default bg-bg-secondary p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-accent-primary/10 text-accent-primary border-accent-primary/20">
                  Inferred Insight
                </span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Conclusions drawn from pattern analysis, logical deduction, or industry knowledge, clearly marked as inference so you know what is factual vs. derived.
              </p>
            </div>
          </div>
        </section>

        {/* Confidence Scoring */}
        <section className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-2">Confidence Scoring</h2>
            <p className="text-sm text-text-secondary">
              Total Score: 0-100, weighted across 4 dimensions
            </p>
          </div>

          <div className="max-w-4xl mx-auto rounded-lg border border-border-default bg-bg-secondary p-6">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 mb-8">
              <div className="flex flex-col items-center p-4 rounded-lg bg-bg-primary border border-border-default">
                <span className="text-2xl font-bold text-text-primary mb-1">30%</span>
                <span className="text-xs font-medium text-text-secondary text-center uppercase tracking-wider">Market Opportunity</span>
                <span className="text-xs text-text-tertiary mt-2 text-center">TAM/SAM viability</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-bg-primary border border-border-default">
                <span className="text-2xl font-bold text-text-primary mb-1">25%</span>
                <span className="text-xs font-medium text-text-secondary text-center uppercase tracking-wider">Competition Intensity</span>
                <span className="text-xs text-text-tertiary mt-2 text-center">Competitive positioning</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-bg-primary border border-border-default">
                <span className="text-2xl font-bold text-text-primary mb-1">20%</span>
                <span className="text-xs font-medium text-text-secondary text-center uppercase tracking-wider">Execution Feasibility</span>
                <span className="text-xs text-text-tertiary mt-2 text-center">Operational readiness</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-bg-primary border border-border-default">
                <span className="text-2xl font-bold text-text-primary mb-1">25%</span>
                <span className="text-xs font-medium text-text-secondary text-center uppercase tracking-wider">Risk Exposure</span>
                <span className="text-xs text-text-tertiary mt-2 text-center">Risk severity and count</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-6 border-t border-border-default">
              <span className="text-sm font-semibold text-signal-strong flex items-center gap-1">STRONG <span className="font-normal text-text-muted">(≥75)</span></span>
              <span className="text-sm font-semibold text-signal-moderate flex items-center gap-1">MODERATE <span className="font-normal text-text-muted">(50-74)</span></span>
              <span className="text-sm font-semibold text-signal-weak flex items-center gap-1">WEAK <span className="font-normal text-text-muted">(&lt;50)</span></span>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16 mb-8 text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Ready to try Apex Intel?</h2>
          <Link
            href="/analyze"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent-primary hover:bg-accent-hover text-white px-6 py-3 text-sm font-medium transition-all duration-200 shadow-lg shadow-accent-primary/20"
          >
            Start New Analysis
          </Link>
        </section>

      </main>

      <Footer />
    </div>
  );
}

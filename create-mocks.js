const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src', 'app');

const mocks = {
  'e2e-navbar': `
    import { Navbar } from '@/components/layout/Navbar';
    export default function MockNavbar() {
      return <div className="min-h-screen bg-bg-primary"><Navbar /><div className="pt-20 text-center">Navbar E2E Test</div></div>;
    }
  `,
  'e2e-dashboard': `
    import { Navbar } from '@/components/layout/Navbar';
    import { MetricCard } from '@/components/ui/MetricCard';
    import { Zap, AlertTriangle, ShieldCheck, TrendingUp, Clock, Plus, BarChart2 } from 'lucide-react';
    import { cn } from '@/lib/utils';
    export default function MockDashboard() {
      return (
        <div className="min-h-screen flex flex-col bg-bg-primary font-sans text-text-primary">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 pt-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-primary">Welcome back, E2E User</h1>
                <p className="text-text-secondary mt-1">Here is the latest intelligence on your portfolio.</p>
              </div>
              <button className="flex items-center gap-2 bg-accent-primary hover:bg-accent-hover text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm">
                <Plus className="w-4 h-4" /> New Analysis
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MetricCard label="Total Analyses" value="4" icon={<BarChart2 />} />
                  <MetricCard label="Average Score" value="72" icon={<TrendingUp />} />
                </div>
                <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Analyses</h3>
                  <div className="flex flex-col gap-3">
                    <div className="p-4 rounded-lg bg-bg-tertiary border border-border-subtle flex justify-between">
                      <div><p className="font-medium">Stripe</p><p className="text-xs text-text-tertiary">Just now</p></div>
                      <div className="flex gap-2"><span className="px-2 py-1 text-xs bg-status-completed/20 text-status-completed rounded">85/100</span></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-4 space-y-6">
                <div className="bg-bg-secondary border border-border-default rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-accent-primary" />
                    <h2 className="text-lg font-semibold text-text-primary">Subscription</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-border-subtle pb-4">
                      <div><p className="text-sm text-text-secondary">Current Plan</p><p className="font-bold text-text-primary text-xl mt-1">PRO_LITE</p></div>
                      <div className="text-right"><p className="text-sm text-text-secondary">Model</p><p className="font-medium text-text-primary text-sm mt-1">Premium</p></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2"><span className="text-text-secondary">Monthly Usage</span><span className="font-medium">4 / 5</span></div>
                      <div className="w-full bg-bg-tertiary rounded-full h-2 overflow-hidden"><div className="bg-red-500 h-2 rounded-full" style={{ width: '80%' }}></div></div>
                      <p className="text-xs text-text-tertiary mt-2">Resets on July 1, 2026</p>
                    </div>
                    <div className="bg-bg-tertiary rounded-lg p-3 flex justify-between items-center border border-border-subtle">
                      <div><p className="text-xs text-text-secondary">Credits</p><p className="font-bold text-text-primary">5 Available</p></div>
                      <button className="text-xs text-accent-primary font-medium hover:underline">Buy More</button>
                    </div>
                    <button className="w-full py-2.5 bg-bg-tertiary hover:bg-border-default text-text-primary rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-green-500" /> Pro Member
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      );
    }
  `,
  'e2e-analyze': `
    import { Navbar } from '@/components/layout/Navbar';
    import { PageHeader } from '@/components/layout/PageHeader';
    import { FileText, Globe } from 'lucide-react';
    export default function MockAnalyze() {
      return (
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <PageHeader title="New Analysis" subtitle="Submit a startup idea or company URL for due diligence analysis." />
          <main className="flex-1 px-6 pb-16">
            <div className="mx-auto max-w-2xl">
              <div className="bg-bg-secondary border border-border-default rounded-xl p-2 flex mb-8">
                <button className="flex-1 py-2.5 rounded-lg flex justify-center items-center gap-2 text-sm font-medium transition-colors bg-bg-primary shadow border border-border-default text-text-primary"><FileText className="h-4 w-4" /> Text Input</button>
                <button className="flex-1 py-2.5 rounded-lg flex justify-center items-center gap-2 text-sm font-medium transition-colors text-text-secondary hover:text-text-primary"><Globe className="h-4 w-4" /> Website URL</button>
              </div>
              <div className="bg-bg-secondary border border-border-default rounded-xl shadow-sm overflow-hidden p-6 mb-8">
                <textarea className="w-full bg-bg-primary border border-border-default rounded-lg p-4 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 min-h-[160px] resize-y mb-4" placeholder="Describe the company, market, or product..." defaultValue="E2E Startup Description"></textarea>
                <div className="flex justify-end"><button className="rounded-lg bg-accent-primary hover:bg-accent-hover text-white px-6 py-2.5 text-sm font-medium transition-all shadow-sm">Start Analysis</button></div>
              </div>
            </div>
          </main>
        </div>
      );
    }
  `,
  'e2e-waiting': `
    import { Navbar } from '@/components/layout/Navbar';
    import { PageHeader } from '@/components/layout/PageHeader';
    import { StatusBadge } from '@/components/ui/StatusBadge';
    import { PipelineTracker } from '@/features/dashboard/PipelineTracker';
    import { MOCK_PIPELINE_PHASES } from '@/lib/mock-data';
    export default function MockWaiting() {
      const phases = MOCK_PIPELINE_PHASES.map((p, i) => ({ ...p, status: i < 2 ? 'completed' : i === 2 ? 'running' : 'waiting', progress: i < 2 ? 100 : i === 2 ? 50 : 0 }));
      return (
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <PageHeader title="Analyzing ID: 12345" subtitle="Current phase: Analyzing Market Dynamics">
            <div className="mt-2 flex items-center gap-4"><StatusBadge status="running" size="md" /><span className="text-sm font-mono text-text-secondary">50%</span></div>
          </PageHeader>
          <main className="flex-1 px-6 pb-12"><div className="mx-auto max-w-7xl"><div className="lg:col-span-3 lg:col-start-2"><PipelineTracker phases={phases} /></div></div></main>
        </div>
      );
    }
  `,
  'e2e-reports-library': `
    import { Navbar } from '@/components/layout/Navbar';
    import { PageHeader } from '@/components/layout/PageHeader';
    export default function MockReports() {
      return (
        <div className="min-h-screen bg-bg-primary">
          <Navbar />
          <PageHeader title="Reports Library" subtitle="Access and compare all your historical intelligence reports." />
          <main className="px-6 pb-16"><div className="max-w-7xl mx-auto mt-6 bg-bg-secondary rounded border p-12 text-center text-text-secondary">Mock Reports Library Table</div></main>
        </div>
      );
    }
  `,
  'e2e-compare': `
    import { Navbar } from '@/components/layout/Navbar';
    import { PageHeader } from '@/components/layout/PageHeader';
    export default function MockCompare() {
      return (
        <div className="min-h-screen bg-bg-primary">
          <Navbar />
          <PageHeader title="Compare Reports" subtitle="Side-by-side benchmarking" />
          <main className="px-6 pb-16"><div className="max-w-7xl mx-auto mt-6 bg-bg-secondary rounded border p-12 text-center text-text-secondary">Mock Compare Matrix</div></main>
        </div>
      );
    }
  `,
  'e2e-admin': `
    import { Navbar } from '@/components/layout/Navbar';
    import { PageHeader } from '@/components/layout/PageHeader';
    import { MetricCard } from '@/components/ui/MetricCard';
    import { Users, FileText, Zap, ShieldAlert } from 'lucide-react';
    export default function MockAdmin() {
      return (
        <div className="min-h-screen flex flex-col bg-bg-primary">
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 pt-20">
            <PageHeader title="Admin Control Center" subtitle="Platform analytics and user management" className="px-0" />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard label="Total Users" value={142} icon={<Users className="h-4 w-4" />} />
              <MetricCard label="Total Reports" value={892} icon={<FileText className="h-4 w-4" />} />
              <MetricCard label="Pro Users" value={28} icon={<Zap className="h-4 w-4 text-signal-moderate" />} />
              <MetricCard label="Pro Lite Users" value={54} icon={<ShieldAlert className="h-4 w-4" />} />
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="rounded-lg border border-border-default bg-bg-secondary p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-4">Daily Analyses (30 Days)</h2>
                <div className="h-48 w-full flex items-end justify-between gap-1">
                  {Array.from({ length: 30 }).map((_, i) => (<div key={i} className="bg-accent-primary/50 rounded-t-sm w-full" style={{ height: \`\${Math.max(10, Math.random() * 100)}%\` }} />))}
                </div>
              </div>
            </div>
          </main>
        </div>
      );
    }
  `
};

Object.entries(mocks).forEach(([dir, content]) => {
  const fullDir = path.join(srcDir, dir);
  if (!fs.existsSync(fullDir)) fs.mkdirSync(fullDir, { recursive: true });
  fs.writeFileSync(path.join(fullDir, 'page.tsx'), content);
});
console.log('Mocks generated');

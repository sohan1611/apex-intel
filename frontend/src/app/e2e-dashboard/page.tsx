
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
  
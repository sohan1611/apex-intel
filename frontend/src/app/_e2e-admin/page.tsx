
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
                  {Array.from({ length: 30 }).map((_, i) => (<div key={i} className="bg-accent-primary/50 rounded-t-sm w-full" style={{ height: `${Math.max(10, Math.random() * 100)}%` }} />))}
                </div>
              </div>
            </div>
          </main>
        </div>
      );
    }
  
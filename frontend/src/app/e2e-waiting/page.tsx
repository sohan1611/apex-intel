
    import { Navbar } from '@/components/layout/Navbar';
    import { PageHeader } from '@/components/layout/PageHeader';
    import { StatusBadge } from '@/components/ui/StatusBadge';
    import { PipelineTracker } from '@/features/dashboard/PipelineTracker';
    import { MOCK_PIPELINE_PHASES } from '@/lib/mock-data';
    export default function MockWaiting() {
      const phases = MOCK_PIPELINE_PHASES.map((p, i) => ({ ...p, status: (i < 2 ? 'completed' : i === 2 ? 'running' : 'waiting') as any, progress: i < 2 ? 100 : i === 2 ? 50 : 0 }));
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
  
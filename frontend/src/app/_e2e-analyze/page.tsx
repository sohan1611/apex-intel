
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
  
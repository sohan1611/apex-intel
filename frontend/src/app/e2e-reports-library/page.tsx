
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
  
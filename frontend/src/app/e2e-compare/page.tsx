
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
  
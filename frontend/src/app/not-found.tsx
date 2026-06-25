import Link from 'next/link';
import { Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4">
      <div className="bg-bg-secondary border border-border-default rounded-lg p-8 max-w-md w-full text-center">
        <Search className="mx-auto h-12 w-12 text-text-muted mb-4" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Page Not Found</h2>
        <p className="text-text-secondary text-sm mb-6">
          The page or report you are looking for does not exist or you do not have permission to view it.
        </p>
        <Link
          href="/dashboard"
          className="inline-block w-full bg-text-primary text-bg-primary font-medium py-2 px-4 rounded hover:bg-text-secondary transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4">
      <div className="bg-bg-secondary border border-border-default rounded-lg p-8 max-w-md w-full text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-signal-weak mb-4" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Something went wrong</h2>
        <p className="text-text-secondary text-sm mb-6">
          An unexpected error occurred. Our team has been notified.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full bg-text-primary text-bg-primary font-medium py-2 px-4 rounded hover:bg-text-secondary transition-colors"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="w-full bg-bg-tertiary text-text-primary font-medium py-2 px-4 rounded hover:bg-bg-tertiary/80 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

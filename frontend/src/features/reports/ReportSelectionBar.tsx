'use client';

import { cn } from '@/lib/utils';
import { ArrowRight, X } from 'lucide-react';
import Link from 'next/link';

interface ReportSelectionBarProps {
  selectedIds: string[];
  onClear: () => void;
}

export default function ReportSelectionBar({
  selectedIds,
  onClear,
}: ReportSelectionBarProps) {
  const count = selectedIds.length;
  const canCompare = count >= 2 && count <= 4;
  const compareHref = `/reports/compare?ids=${selectedIds.join(',')}`;

  return (
    <div
      className={cn(
        'bg-bg-secondary border border-accent-primary/30 rounded-lg p-3',
        'flex items-center justify-between gap-4',
        'transition-all duration-300 ease-out',
        'animate-[slideUp_0.25s_ease-out]',
      )}
    >
      {/* Left: count */}
      <span className="text-sm font-medium text-text-primary">
        {count} selected
      </span>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        {canCompare ? (
          <Link
            href={compareHref}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold',
              'bg-accent-primary text-white',
              'hover:brightness-110 transition-all duration-150',
            )}
          >
            Compare
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold',
              'bg-accent-primary/40 text-white/60 cursor-not-allowed',
            )}
            title={
              count < 2
                ? 'Select at least 2 reports'
                : 'Select at most 4 reports'
            }
          >
            Compare
            <ArrowRight className="h-4 w-4" />
          </span>
        )}

        <button
          onClick={onClear}
          className="inline-flex items-center gap-1 text-sm text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>
    </div>
  );
}

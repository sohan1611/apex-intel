import { cn } from '@/lib/utils';
import { Check, X, Clock, Loader2 } from 'lucide-react';

interface StatusBadgeProps {
  /** Pipeline or report status */
  status: string;
  /** Optional size variant */
  size?: 'sm' | 'md';
  /** Additional CSS classes */
  className?: string;
}

const statusConfig: Record<
  string,
  { classes: string; icon: React.ReactNode; label: string }
> = {
  queued: {
    classes: 'bg-zinc-700 text-zinc-400',
    icon: <Clock className="h-3 w-3" />,
    label: 'Queued',
  },
  processing: {
    classes: 'bg-blue-500/10 text-blue-400',
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    label: 'Processing',
  },
  running: {
    classes: 'bg-blue-500/10 text-blue-400',
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    label: 'Running',
  },
  completed: {
    classes: 'bg-green-500/10 text-green-400',
    icon: <Check className="h-3 w-3" />,
    label: 'Completed',
  },
  failed: {
    classes: 'bg-red-500/10 text-red-400',
    icon: <X className="h-3 w-3" />,
    label: 'Failed',
  },
  // Investment signal statuses
  STRONG: {
    classes: 'bg-green-500/10 text-green-400',
    icon: <Check className="h-3 w-3" />,
    label: 'Strong',
  },
  MODERATE: {
    classes: 'bg-amber-500/10 text-amber-400',
    icon: <Clock className="h-3 w-3" />,
    label: 'Moderate',
  },
  WEAK: {
    classes: 'bg-red-500/10 text-red-400',
    icon: <X className="h-3 w-3" />,
    label: 'Weak',
  },
};

const sizeClasses: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

/**
 * Status badge for reports and pipeline phases.
 * Displays an icon + label with semantic coloring.
 * Supports pipeline statuses (queued, processing, running, completed, failed)
 * and investment signals (STRONG, MODERATE, WEAK).
 */
export function StatusBadge({ status, size = 'sm', className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    classes: 'bg-zinc-700 text-zinc-400',
    icon: <Clock className="h-3 w-3" />,
    label: status,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md font-medium',
        sizeClasses[size],
        config.classes,
        className
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

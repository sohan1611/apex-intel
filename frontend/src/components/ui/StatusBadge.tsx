import { cn } from '@/lib/utils';
import { Check, X, Clock, Loader2 } from 'lucide-react';

interface StatusBadgeProps {
  /** Pipeline or report status */
  status: 'queued' | 'processing' | 'completed' | 'failed';
  /** Additional CSS classes */
  className?: string;
}

const statusConfig: Record<
  StatusBadgeProps['status'],
  { classes: string; icon: React.ReactNode; label: string }
> = {
  queued: {
    classes: 'bg-zinc-700 text-zinc-400',
    icon: <Clock className="h-3 w-3" />,
    label: 'Queued',
  },
  processing: {
    classes: 'bg-blue-500/10 text-blue-400 animate-pulse-subtle',
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    label: 'Processing',
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
};

/**
 * Status badge for reports and pipeline phases.
 * Displays an icon + label with semantic coloring:
 * - Queued: neutral zinc with clock icon
 * - Processing: blue with spinning loader and pulse animation
 * - Completed: green with checkmark
 * - Failed: red with X icon
 */
export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium',
        config.classes,
        className
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

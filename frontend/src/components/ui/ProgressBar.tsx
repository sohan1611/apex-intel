import { cn } from '@/lib/utils';

interface ProgressBarProps {
  /** Progress value from 0 to 100 */
  value: number;
  /** Whether to show the percentage label */
  showLabel?: boolean;
  /** Whether to apply pulse animation (useful for active/in-progress states) */
  animated?: boolean;
  /** Optional Tailwind background color class for the fill */
  color?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Slim progress bar with optional label and pulse animation.
 * Used for pipeline phases, upload progress, and loading states.
 */
export default function ProgressBar({
  value,
  showLabel = false,
  animated = false,
  color,
  className,
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-end mb-1">
          <span className="text-xs font-mono text-text-secondary">{clampedValue}%</span>
        </div>
      )}
      <div className="bg-bg-tertiary rounded-full h-1.5 overflow-hidden">
        <div
          className={cn(
            'rounded-full h-1.5 transition-all duration-500 ease-out',
            color || 'bg-accent-primary',
            animated && clampedValue < 100 && 'animate-pulse-subtle'
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}

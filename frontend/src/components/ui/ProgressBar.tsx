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
  /** Alias for color — used by PhaseCard */
  colorClass?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

const sizeHeights: Record<string, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-2.5',
};

/**
 * Slim progress bar with optional label and pulse animation.
 * Used for pipeline phases, upload progress, and loading states.
 */
export function ProgressBar({
  value,
  showLabel = false,
  animated = false,
  color,
  colorClass,
  size = 'sm',
  className,
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, Math.round(value)));
  const fillColor = colorClass || color || 'bg-accent-primary';
  const height = sizeHeights[size] ?? sizeHeights.sm;

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-end mb-1">
          <span className="text-xs font-mono text-text-secondary">{clampedValue}%</span>
        </div>
      )}
      <div className={cn('bg-bg-tertiary rounded-full overflow-hidden', height)}>
        <div
          className={cn(
            'rounded-full transition-all duration-500 ease-out h-full',
            fillColor,
            animated && clampedValue < 100 && 'animate-pulse'
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}

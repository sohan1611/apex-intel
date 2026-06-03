'use client';

import { cn } from '@/lib/utils';

interface ScoreGaugeProps {
  /** Score value from 0 to 100 */
  score: number;
  /** Optional label displayed below the gauge */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Circular gauge component that visualizes a score (0-100) using an SVG ring.
 * Color transitions: red (<50) → amber (50-74) → green (≥75).
 * Animates on mount with a smooth stroke-dashoffset transition.
 */
export function ScoreGauge({ score, label, size = 'lg', className }: ScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // SVG dimensions
  const dimensions = size === 'sm' ? 80 : 120;
  const strokeWidth = size === 'sm' ? 6 : 8;
  const radius = (dimensions - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  // Score-based color
  let strokeColor: string;
  let textColor: string;
  if (clampedScore >= 75) {
    strokeColor = '#22C55E'; // green-500
    textColor = 'text-green-400';
  } else if (clampedScore >= 50) {
    strokeColor = '#F59E0B'; // amber-500
    textColor = 'text-amber-400';
  } else {
    strokeColor = '#EF4444'; // red-500
    textColor = 'text-red-400';
  }

  const center = dimensions / 2;
  const fontSize = size === 'sm' ? 'text-lg' : 'text-3xl';

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: dimensions, height: dimensions }}>
        <svg
          width={dimensions}
          height={dimensions}
          viewBox={`0 0 ${dimensions} ${dimensions}`}
          className="-rotate-90"
        >
          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#27272A"
            strokeWidth={strokeWidth}
          />
          {/* Score ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="animate-gauge-fill"
            style={
              {
                '--gauge-circumference': circumference,
                '--gauge-offset': offset,
                transition: 'stroke-dashoffset 1.2s ease-out',
              } as React.CSSProperties
            }
          />
        </svg>
        {/* Center score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-mono font-bold', fontSize, textColor)}>
            {clampedScore}
          </span>
        </div>
      </div>
      {label && (
        <span className="text-xs text-text-tertiary font-medium">{label}</span>
      )}
    </div>
  );
}

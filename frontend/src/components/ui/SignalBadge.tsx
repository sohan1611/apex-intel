'use client';

import { cn } from '@/lib/utils';
import type { SignalStrength } from '@/types/report';

interface SignalBadgeProps {
  signal: SignalStrength | string | null | undefined;
  className?: string;
}

const SIGNAL_STYLES: Record<string, string> = {
  STRONG: 'bg-signal-strong/10 text-signal-strong border-signal-strong/20',
  MODERATE: 'bg-signal-moderate/10 text-signal-moderate border-signal-moderate/20',
  WEAK: 'bg-signal-weak/10 text-signal-weak border-signal-weak/20',
};

export function SignalBadge({ signal, className }: SignalBadgeProps) {
  if (!signal) return <span className="text-text-muted text-sm">—</span>;

  const styles = SIGNAL_STYLES[signal] ?? 'bg-bg-tertiary text-text-secondary border-border-default';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
        styles,
        className
      )}
    >
      {signal}
    </span>
  );
}

export default SignalBadge;

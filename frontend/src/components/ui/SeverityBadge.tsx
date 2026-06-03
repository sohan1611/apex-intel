'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SeverityBadgeProps {
  severity: string;
}

const severityStyles: Record<string, string> = {
  HIGH: 'bg-red-500/15 text-red-400',
  MEDIUM: 'bg-amber-500/15 text-amber-400',
  LOW: 'bg-blue-500/15 text-blue-400',
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-md px-2 py-0.5 text-xs font-medium uppercase tracking-wider',
        severityStyles[severity]
      )}
    >
      {severity}
    </span>
  );
}

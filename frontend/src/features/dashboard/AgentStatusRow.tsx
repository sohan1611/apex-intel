'use client';

import { cn } from '@/lib/utils';
import type { AgentStatus } from '@/types/report';
import { Check, Loader2, Circle, XCircle } from 'lucide-react';

interface AgentStatusRowProps {
  name: string;
  status: AgentStatus;
}

const STATUS_CONFIG: Record<
  AgentStatus,
  { icon: React.ReactNode; label: string; textClass: string }
> = {
  completed: {
    icon: <Check className="h-3.5 w-3.5" />,
    label: 'Done',
    textClass: 'text-status-completed',
  },
  running: {
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    label: 'Running',
    textClass: 'text-status-running',
  },
  waiting: {
    icon: <Circle className="h-3.5 w-3.5" />,
    label: 'Queued',
    textClass: 'text-text-muted',
  },
  failed: {
    icon: <XCircle className="h-3.5 w-3.5" />,
    label: 'Failed',
    textClass: 'text-status-failed',
  },
};

export function AgentStatusRow({ name, status }: AgentStatusRowProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex items-center justify-between py-1.5 px-3 rounded-md hover:bg-bg-primary/30 transition-colors">
      <div className="flex items-center gap-2.5">
        <span className={cn('flex-shrink-0', config.textClass)}>
          {config.icon}
        </span>
        <span className="text-sm text-text-secondary">{name}</span>
      </div>
      <span className={cn('text-xs font-medium', config.textClass)}>
        {config.label}
      </span>
    </div>
  );
}

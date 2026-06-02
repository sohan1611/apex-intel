'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { AgentLogEntry } from '@/types/report';

interface AgentActivityLogProps {
  logs: AgentLogEntry[];
  isComplete?: boolean;
}

const LOG_TYPE_COLORS: Record<string, string> = {
  info: 'text-text-secondary',
  success: 'text-status-completed',
  warning: 'text-signal-moderate',
  error: 'text-status-failed',
};

const LOG_TYPE_DOTS: Record<string, string> = {
  info: 'bg-text-tertiary',
  success: 'bg-status-completed',
  warning: 'bg-signal-moderate',
  error: 'bg-status-failed',
};

/** Map agent status to log type for backward compat with mock data */
function deriveLogType(log: AgentLogEntry): string {
  if (log.type) return log.type;
  // Fallback: derive from status field
  switch (log.status) {
    case 'completed': return 'success';
    case 'running': return 'info';
    case 'failed': return 'error';
    case 'waiting': return 'info';
    default: return 'info';
  }
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function AgentActivityLog({ logs, isComplete = false }: AgentActivityLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length]);

  return (
    <div className="rounded-lg border border-border-default bg-bg-secondary overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-default bg-bg-secondary">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-semibold text-text-primary">
            Agent Activity
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {!isComplete && (
            <span className="flex items-center gap-1.5 text-xs text-status-completed">
              <span className="h-2 w-2 rounded-full bg-status-completed animate-pulse-dot" />
              Live
            </span>
          )}
          {isComplete && (
            <span className="text-xs text-text-tertiary">Complete</span>
          )}
        </div>
      </div>

      {/* Log entries */}
      <div
        ref={scrollRef}
        className="overflow-y-auto max-h-[600px] p-3 space-y-1"
      >
        {logs.map((log, idx) => {
          const logType = deriveLogType(log);
          return (
            <div
              key={log.id ?? `log-${idx}`}
              className="flex items-start gap-2.5 py-1.5 px-2 rounded-md hover:bg-bg-primary/30 transition-colors group"
            >
              {/* Type dot */}
              <span
                className={cn(
                  'mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0',
                  LOG_TYPE_DOTS[logType] ?? 'bg-text-tertiary'
                )}
              />

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-[10px] text-text-muted tabular-nums">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span className="text-xs font-medium text-accent-primary truncate">
                    {log.agent}
                  </span>
                </div>
                <p
                  className={cn(
                    'text-sm leading-relaxed',
                    LOG_TYPE_COLORS[logType] ?? 'text-text-secondary'
                  )}
                >
                  {log.message}
                </p>
              </div>
            </div>
          );
        })}

        {/* Cursor blink for live mode */}
        {!isComplete && (
          <div className="flex items-center gap-2 py-2 px-2">
            <span className="h-1.5 w-1.5 rounded-full bg-text-muted" />
            <span className="inline-block w-2 h-4 bg-accent-primary/60 animate-pulse rounded-sm" />
          </div>
        )}
      </div>
    </div>
  );
}

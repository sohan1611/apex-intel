import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with clsx — the standard cn() utility */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as a currency string (e.g. $12.4B, $3.1M, $500K) */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

/** Format a number as a percentage string (e.g. "72%") */
export function formatPercentage(value: number | null | undefined): string {
  if (value == null) return '—';
  // If value is 0-1 range, convert to 0-100
  const pct = value <= 1 ? Math.round(value * 100) : Math.round(value);
  return `${pct}%`;
}

/** Format a score as "X/100" */
export function formatScore(value: number | null | undefined): string {
  if (value == null) return '—';
  return `${Math.round(value)}/100`;
}

/** Format an ISO date string to a readable format */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Truncate text to a maximum length with ellipsis */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/** Get Tailwind text color class for an investment signal */
export function getSignalColor(signal: string | null | undefined): string {
  switch (signal) {
    case 'STRONG': return 'text-signal-strong';
    case 'MODERATE': return 'text-signal-moderate';
    case 'WEAK': return 'text-signal-weak';
    default: return 'text-text-tertiary';
  }
}

/** Get Tailwind text color class for a severity level */
export function getSeverityColor(severity: string | null | undefined): string {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
    case 'HIGH': return 'text-red-400';
    case 'MEDIUM': return 'text-amber-400';
    case 'LOW': return 'text-blue-400';
    default: return 'text-text-tertiary';
  }
}

/** Compute a human-readable "time ago" string from a date */
export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: 'default' | 'danger' | 'success';
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: 'text-text-primary',
  danger: 'text-red-400',
  success: 'text-emerald-400',
};

export function MetricCard({
  label,
  value,
  subtitle,
  variant = 'default',
  icon,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'relative bg-bg-tertiary rounded-xl p-4 border border-border-subtle',
        className
      )}
    >
      {icon && (
        <div className="absolute top-4 right-4 text-text-tertiary">
          {icon}
        </div>
      )}
      <p className="text-xs uppercase tracking-wider text-text-tertiary mb-1">
        {label}
      </p>
      <p
        className={cn(
          'text-2xl font-semibold font-mono',
          variantStyles[variant] ?? variantStyles.default
        )}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-text-tertiary mt-1">{subtitle}</p>
      )}
    </div>
  );
}

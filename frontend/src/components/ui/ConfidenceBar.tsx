'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ConfidenceBarProps {
  value: number;
  label?: string;
}

export default function ConfidenceBar({ value, label }: ConfidenceBarProps) {
  const percentage = Math.round(Math.min(Math.max(value, 0), 1) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1.5">
        {label && (
          <span className="text-xs text-text-tertiary">{label}</span>
        )}
        <span className="text-xs font-mono text-text-primary ml-auto">
          {percentage}%
        </span>
      </div>
      <div className="bg-bg-primary rounded-full h-2 w-full overflow-hidden">
        <div
          className="bg-accent-primary rounded-full h-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

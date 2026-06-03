'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileJson, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExportDropdownProps {
  /** ID of the report to export */
  reportId: string;
  /** Title/name of the report for the filename */
  reportTitle: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Export dropdown with PDF and JSON download options.
 * Closes on outside click. Currently triggers mock downloads
 * that will be connected to real export APIs later.
 */
export function ExportDropdown({ reportId, reportTitle, className }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleExportPDF = () => {
    // Mock PDF download — will connect to real API
    const filename = `${reportTitle.replace(/\s+/g, '_').toLowerCase()}_report.pdf`;
    console.log(`[ExportDropdown] Initiating PDF export: ${filename} (report: ${reportId})`);
    setIsOpen(false);
  };

  const handleExportJSON = () => {
    // Mock JSON download — will connect to real API
    const filename = `${reportTitle.replace(/\s+/g, '_').toLowerCase()}_report.json`;
    console.log(`[ExportDropdown] Initiating JSON export: ${filename} (report: ${reportId})`);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
                   bg-bg-tertiary text-text-secondary border border-border-default
                   hover:bg-bg-elevated hover:text-text-primary transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Export
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      <div
        className={cn(
          'absolute right-0 mt-1 w-44 rounded-lg bg-bg-secondary border border-border-default shadow-xl shadow-black/30 overflow-hidden z-50',
          'transition-all duration-200 origin-top-right',
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        )}
      >
        <button
          onClick={handleExportPDF}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-text-secondary
                     hover:bg-bg-tertiary hover:text-text-primary transition-colors text-left"
        >
          <Download className="h-4 w-4 text-text-muted" />
          Export as PDF
        </button>
        <div className="border-t border-border-subtle" />
        <button
          onClick={handleExportJSON}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-text-secondary
                     hover:bg-bg-tertiary hover:text-text-primary transition-colors text-left"
        >
          <FileJson className="h-4 w-4 text-text-muted" />
          Export as JSON
        </button>
      </div>
    </div>
  );
}

'use client';

import { cn } from '@/lib/utils';

/** Column definition for the DataTable. */
export interface DataTableColumn<T> {
  /** Unique key identifying this column */
  key: string;
  /** Column header label */
  label: string;
  /** Optional fixed width (e.g., '120px', '20%') */
  width?: string;
  /** Custom render function for cell content */
  render?: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Data rows */
  data: T[];
  /** Callback when a row is clicked */
  onRowClick?: (row: T, index: number) => void;
  /** Enable row selection with checkboxes */
  selectable?: boolean;
  /** Set of selected row IDs (requires items to have an 'id' field) */
  selectedIds?: Set<string>;
  /** Callback when selection changes */
  onSelect?: (id: string, selected: boolean) => void;
  /** Additional CSS classes for the table container */
  className?: string;
  /** Message to display when data is empty */
  emptyMessage?: string;
}

/**
 * Generic data table component with sortable columns, selectable rows,
 * and responsive horizontal scrolling on mobile.
 * Supports custom cell renderers for flexible content display.
 */
export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  selectable = false,
  selectedIds,
  onSelect,
  className,
  emptyMessage = 'No data available.',
}: DataTableProps<T>) {
  const getId = (row: T): string => String(row.id ?? '');

  return (
    <div className={cn('overflow-x-auto rounded-lg border border-border-default', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-bg-tertiary">
            {selectable && (
              <th className="px-4 py-3 w-10">
                <span className="sr-only">Select</span>
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs uppercase tracking-wider text-text-tertiary font-medium"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-4 py-12 text-center text-text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const rowId = getId(row);
              const isSelected = selectable && selectedIds?.has(rowId);

              return (
                <tr
                  key={rowId || rowIndex}
                  className={cn(
                    'border-b border-border-subtle transition-colors',
                    onRowClick && 'cursor-pointer',
                    isSelected
                      ? 'bg-accent-subtle'
                      : 'hover:bg-bg-tertiary/50'
                  )}
                  onClick={() => onRowClick?.(row, rowIndex)}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected ?? false}
                        onChange={(e) => {
                          e.stopPropagation();
                          onSelect?.(rowId, e.target.checked);
                        }}
                        className="h-4 w-4 rounded border-border-default bg-bg-secondary text-accent-primary
                                   focus:ring-accent-primary focus:ring-offset-0 cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-text-secondary">
                      {col.render
                        ? col.render(row, rowIndex)
                        : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

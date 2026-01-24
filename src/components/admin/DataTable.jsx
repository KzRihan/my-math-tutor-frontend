'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function DataTable({
  columns,
  data,
  searchable = true,
  searchPlaceholder = 'Search...',
  actions,
  onRowClick,
  emptyMessage = 'No data found',
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Filter data based on search
  const filteredData = data.filter((row) => {
    if (!searchQuery) return true;
    return columns.some((col) => {
      const value = row[col.accessor];
      return value?.toString().toLowerCase().includes(searchQuery.toLowerCase());
    });
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    const aStr = aValue?.toString() || '';
    const bStr = bValue?.toString() || '';
    return sortDirection === 'asc' 
      ? aStr.localeCompare(bStr) 
      : bStr.localeCompare(aStr);
  });

  const handleSort = (accessor) => {
    if (sortColumn === accessor) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(accessor);
      setSortDirection('asc');
    }
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      {(searchable || actions) && (
        <div className="p-4 border-b border-[var(--card-border)] flex items-center justify-between gap-4">
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 text-sm text-foreground placeholder:text-foreground-secondary bg-white border border-neutral-200 dark:border-transparent rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                style={{ backgroundColor: 'var(--search-bg)' }}
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          )}
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--card-border)] bg-neutral-50 dark:bg-neutral-800/50">
              {columns.map((col) => (
                <th
                  key={col.accessor}
                  onClick={() => col.sortable !== false && handleSort(col.accessor)}
                  className={cn(
                    'text-left py-3 px-4 text-xs font-semibold text-foreground-secondary uppercase tracking-wider',
                    col.sortable !== false && 'cursor-pointer hover:text-foreground transition-colors',
                    col.className
                  )}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable !== false && sortColumn === col.accessor && (
                      <svg className={cn('w-3 h-3 transition-transform', sortDirection === 'desc' && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--card-border)]">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-foreground-secondary">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.accessor} className={cn('py-4 px-4 text-foreground', col.cellClassName)}>
                      {col.cell ? col.cell(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--card-border)] flex items-center justify-between">
        <p className="text-sm text-foreground-secondary">
          Showing {sortedData.length} of {data.length} results
        </p>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary btn-sm" disabled>
            Previous
          </button>
          <button className="btn btn-secondary btn-sm" disabled>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

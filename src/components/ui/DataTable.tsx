import React from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({ 
  data, 
  columns, 
  isLoading, 
  onRowClick,
  emptyMessage = "No records found"
}: DataTableProps<T>) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 border-b border-border">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={cn("px-4 py-3 text-left font-medium text-muted-foreground", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                   <div className="flex justify-center"><Spinner /></div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                   {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr 
                  key={row.id} 
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn(
                    "bg-background hover:bg-secondary/20 transition-colors",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((col, idx) => (
                    <td key={idx} className={cn("px-4 py-3", col.className)}>
                      {col.cell ? col.cell(row) : (row[col.accessorKey!] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
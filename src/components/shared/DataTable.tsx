import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ArrowUpDown, ArrowUp, ArrowDown, Inbox } from 'lucide-react';

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  cell?: (row: T) => React.ReactNode;
}

export interface SortState {
  key: string;
  direction: 'asc' | 'desc';
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  sort?: SortState | null;
  onSort?: (sort: SortState) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  skeletonRows?: number;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  sort,
  onSort,
  emptyTitle = 'No results found',
  emptyDescription = 'Try adjusting your search or filters.',
  rowKey,
  onRowClick,
  skeletonRows = 10,
}: DataTableProps<T>) {
  const handleSort = (columnId: string) => {
    if (!onSort) return;
    if (sort?.key === columnId) {
      onSort({
        key: columnId,
        direction: sort.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      onSort({ key: columnId, direction: 'asc' });
    }
  };

  const getSortIcon = (columnId: string) => {
    if (sort?.key !== columnId) {
      return <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground/50" />;
    }
    return sort.direction === 'asc' ? (
      <ArrowUp className="h-3 w-3 ml-1 text-primary" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1 text-primary" />
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/50">
              {columns.map((col) => (
                <TableHead key={col.id} className={cn('text-xs font-semibold', col.headerClassName)}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((col) => (
                  <TableCell key={col.id} className={col.className}>
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/50">
              {columns.map((col) => (
                <TableHead key={col.id} className={cn('text-xs font-semibold', col.headerClassName)}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        </Table>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Inbox className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold mb-1">{emptyTitle}</h3>
          <p className="text-xs text-muted-foreground max-w-[280px]">{emptyDescription}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/50">
            {columns.map((col) => (
              <TableHead key={col.id} className={cn('text-xs font-semibold', col.headerClassName)}>
                {col.sortable && onSort ? (
                  <button
                    className="flex items-center gap-0.5 hover:text-foreground transition-colors"
                    onClick={() => handleSort(col.accessorKey as string || col.id)}
                  >
                    {col.header}
                    {getSortIcon(col.accessorKey as string || col.id)}
                  </button>
                ) : (
                  col.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={rowKey(row)}
              className={cn(
                'transition-colors',
                onRowClick && 'cursor-pointer hover:bg-muted/50'
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <TableCell key={col.id} className={cn('text-sm', col.className)}>
                  {col.cell
                    ? col.cell(row)
                    : col.accessorKey
                      ? String((row as Record<string, unknown>)[col.accessorKey as string] ?? '')
                      : null}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
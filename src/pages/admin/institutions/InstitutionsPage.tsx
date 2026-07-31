import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DataTable, ColumnDef, SortState } from '@/components/shared/DataTable';
import { DataTablePagination } from '@/components/shared/DataTablePagination';
import { InstitutionFilters } from './InstitutionFilters';
import { adminService } from '@/services/admin.service';
import {
  Institution,
  InstitutionFilters as IFilters,
  InstitutionStatus,
  PaginationConfig,
} from '@/types/institution.types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { MoreHorizontal, Eye, Pencil, Power, PowerOff, Trash2 } from 'lucide-react';

export const InstitutionsPage = () => {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [sort, setSort] = useState<SortState | null>(null);
  const [filters, setFilters] = useState<IFilters>({
    search: '',
    status: 'all',
    category: 'all',
    state: 'all',
    repositoryCompletion: 'all',
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    institution: Institution | null;
  }>({
    open: false,
    institution: null,
  });

  // Debounce search input to avoid excessive API calls
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 400);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [filters.search]);

  const fetchInstitutions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getInstitutions({
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: debouncedSearch || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        category: filters.category !== 'all' ? filters.category : undefined,
        state: filters.state !== 'all' ? filters.state : undefined,
        repositoryCompletion:
          filters.repositoryCompletion !== 'all' ? filters.repositoryCompletion : undefined,
        sortBy: sort?.key || undefined,
        sortDirection: sort?.direction || undefined,
      });
      setInstitutions(response.data);
      setPagination(response.pagination);
    } catch {
      toast.error('Failed to load institutions');
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.pageSize,
    debouncedSearch,
    filters.status,
    filters.category,
    filters.state,
    filters.repositoryCompletion,
    sort,
  ]);

  useEffect(() => {
    fetchInstitutions();
  }, [fetchInstitutions]);

  // Reset to page 1 when filters change (but not search, which is debounced)
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filters.status, filters.category, filters.state, filters.repositoryCompletion]);

  // Reset to page 1 when debounced search changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [debouncedSearch]);

  const handleStatusChange = async (institution: Institution, newStatus: InstitutionStatus) => {
    try {
      await adminService.updateInstitutionStatus(
        institution.id,
        newStatus as 'ACTIVE' | 'INACTIVE'
      );
      toast.success(
        `${institution.name} has been ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`
      );
      fetchInstitutions();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.institution) return;
    try {
      await adminService.deleteInstitution(deleteDialog.institution.id);
      toast.success(`${deleteDialog.institution.name} has been deleted`);
      setDeleteDialog({ open: false, institution: null });
      fetchInstitutions();
    } catch {
      toast.error('Failed to delete institution');
    }
  };

  const getStatusBadge = (status: InstitutionStatus) => {
    const config: Record<
      InstitutionStatus,
      { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
    > = {
      ACTIVE: { label: 'Active', variant: 'default' },
      INACTIVE: { label: 'Inactive', variant: 'secondary' },
      PENDING: { label: 'Pending', variant: 'outline' },
      SUSPENDED: { label: 'Suspended', variant: 'destructive' },
    };
    const { label, variant } = config[status] || { label: status, variant: 'outline' as const };
    return (
      <Badge variant={variant} className="text-[10px] font-medium">
        {label}
      </Badge>
    );
  };

  const columns: ColumnDef<Institution>[] = [
    {
      id: 'logo',
      header: '',
      className: 'w-12',
      headerClassName: 'w-12',
      cell: row => (
        <div className="flex items-center justify-center">
          <div className="h-9 w-9 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-border/50 flex items-center justify-center">
            <img
              src={
                row.logo ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name.slice(0, 2))}&background=3b82f6&color=fff&size=40&bold=true`
              }
              alt={row.name}
              className="h-9 w-9 object-cover"
              onError={e => {
                (e.target as HTMLImageElement).src =
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name.slice(0, 2))}&background=3b82f6&color=fff&size=40&bold=true`;
              }}
            />
          </div>
        </div>
      ),
    },
    {
      id: 'name',
      header: 'Institution Name',
      accessorKey: 'name',
      sortable: true,
      className: 'min-w-[200px]',
      cell: row => (
        <div className="flex flex-col">
          <span className="text-sm font-medium truncate max-w-[250px]">{row.name}</span>
          <span className="text-[10px] text-muted-foreground">
            {row.city || '—'}, {row.state || '—'}
          </span>
        </div>
      ),
    },
    {
      id: 'code',
      header: 'Code',
      accessorKey: 'code',
      sortable: true,
      className: 'w-[120px]',
      cell: row => (
        <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{row.code}</code>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      className: 'w-[130px]',
      cell: row => (
        <Badge variant="outline" className="text-[10px] font-normal">
          {row.category}
        </Badge>
      ),
    },
    {
      id: 'state',
      header: 'State',
      accessorKey: 'state',
      sortable: true,
      className: 'w-[120px]',
      cell: row => <span className="text-xs">{row.state}</span>,
    },
    {
      id: 'usersCount',
      header: 'Users',
      accessorKey: 'usersCount',
      sortable: true,
      className: 'w-[80px] text-center',
      headerClassName: 'text-center',
      cell: row => <span className="text-xs font-medium">{row.usersCount}</span>,
    },
    {
      id: 'repositoryCompletion',
      header: 'Repository %',
      accessorKey: 'repositoryCompletion',
      sortable: true,
      className: 'w-[140px]',
      cell: row => (
        <div className="flex items-center gap-2">
          <Progress
            value={row.repositoryCompletion}
            className={cn(
              'h-1.5 flex-1',
              row.repositoryCompletion < 50 && '[&>div]:bg-red-500',
              row.repositoryCompletion >= 50 &&
                row.repositoryCompletion < 75 &&
                '[&>div]:bg-amber-500',
              row.repositoryCompletion >= 75 && '[&>div]:bg-emerald-500'
            )}
          />
          <span className="text-[10px] font-medium w-8 text-right">
            {row.repositoryCompletion}%
          </span>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      className: 'w-[100px]',
      cell: row => getStatusBadge(row.status),
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'w-[60px] text-center',
      headerClassName: 'text-center',
      cell: row => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={e => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              className="text-xs gap-2 cursor-pointer"
              onClick={e => {
                e.stopPropagation();
                navigate(`/admin/institutions/${row.id}`);
              }}
            >
              <Eye className="h-3.5 w-3.5" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs gap-2 cursor-pointer"
              onClick={e => {
                e.stopPropagation();
                navigate(`/admin/institutions/${row.id}/edit`);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {row.status === 'ACTIVE' ? (
              <DropdownMenuItem
                className="text-xs gap-2 cursor-pointer"
                onClick={e => {
                  e.stopPropagation();
                  handleStatusChange(row, 'INACTIVE');
                }}
              >
                <PowerOff className="h-3.5 w-3.5" />
                Deactivate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="text-xs gap-2 cursor-pointer"
                onClick={e => {
                  e.stopPropagation();
                  handleStatusChange(row, 'ACTIVE');
                }}
              >
                <Power className="h-3.5 w-3.5" />
                Activate
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs gap-2 cursor-pointer text-destructive focus:text-destructive"
              onClick={e => {
                e.stopPropagation();
                setDeleteDialog({ open: true, institution: row });
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col min-h-[calc(100vh-10rem)]"
    >
      {/* Header - sticky at top */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Institutions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage registered institutions and their accreditation status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
            <Upload className="h-3.5 w-3.5" />
            Import
          </Button>
          <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button
            size="sm"
            className="gap-2 h-8 text-xs"
            onClick={() => navigate('/admin/institutions/create')}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Institution
          </Button>
        </div>
      </div>

      {/* Scrollable content area - takes remaining space */}
      <div className="flex-1 flex flex-col min-h-0 gap-5">
        {/* Filters */}
        <InstitutionFilters filters={filters} onFilterChange={setFilters} />

        {/* Summary */}
        {!loading && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {pagination.total} institution{pagination.total !== 1 ? 's' : ''} found
            </Badge>
            {sort && (
              <Badge variant="outline" className="text-[10px] gap-1">
                Sorted by {sort.key} ({sort.direction})
              </Badge>
            )}
          </div>
        )}

        {/* Table - flex-1 so it fills available space */}
        <div className="flex-1 min-h-0">
          <DataTable
            columns={columns}
            data={institutions}
            loading={loading}
            sort={sort}
            onSort={setSort}
            rowKey={row => String(row.id)}
            emptyTitle="No institutions found"
            emptyDescription="Try adjusting your search or filter criteria to find institutions."
          />
        </div>

        {/* Pagination - sticks to bottom */}
        {!loading && pagination.total > 0 && (
          <DataTablePagination
            pagination={pagination}
            onPageChange={page => setPagination(prev => ({ ...prev, page }))}
            onPageSizeChange={pageSize => setPagination(prev => ({ ...prev, pageSize, page: 1 }))}
          />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={open =>
          setDeleteDialog({ open, institution: open ? deleteDialog.institution : null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Institution</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteDialog.institution?.name}</strong>?
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

import { useState, useEffect, useCallback } from 'react';
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
import { institutionService } from '@/services/institution.service';
import {
  Institution,
  InstitutionFilters as IFilters,
  InstitutionStatus,
  PaginationConfig,
} from '@/types/institution.types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { MoreHorizontal, Eye, Pencil, Power, PowerOff, Trash2, UserCog } from 'lucide-react';
import { InstitutionLogo } from './components/InstitutionLogo';
import { StatusBadge } from './components/StatusBadge';
import { InstitutionDetailsDialog } from './components/InstitutionDetailsDialog';
import { EditInstitutionDialog } from './components/EditInstitutionDialog';
import { ImpersonateDialog } from './components/ImpersonateDialog';

export const InstitutionsPage = () => {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [sort, setSort] = useState<SortState | null>(null);
  const [filters, setFilters] = useState<IFilters>({
    search: '',
    status: 'all',
    category: 'all',
    state: 'all',
    repositoryCompletion: 'all',
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; institution: Institution | null }>({
    open: false,
    institution: null,
  });
  const [viewDialog, setViewDialog] = useState<{ open: boolean; institution: Institution | null }>({
    open: false,
    institution: null,
  });
  const [editDialog, setEditDialog] = useState<{ open: boolean; institution: Institution | null }>({
    open: false,
    institution: null,
  });
  const [deactivateDialog, setDeactivateDialog] = useState<{ open: boolean; institution: Institution | null }>({
    open: false,
    institution: null,
  });
  const [impersonateDialog, setImpersonateDialog] = useState<{ open: boolean; institution: Institution | null }>({
    open: false,
    institution: null,
  });

  const fetchInstitutions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await institutionService.getInstitutions({
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: filters.search || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        category: filters.category !== 'all' ? filters.category : undefined,
        state: filters.state !== 'all' ? filters.state : undefined,
        repositoryCompletion: filters.repositoryCompletion !== 'all' ? filters.repositoryCompletion : undefined,
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
  }, [pagination.page, pagination.pageSize, filters, sort]);

  useEffect(() => {
    fetchInstitutions();
  }, [fetchInstitutions]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [filters]);

  const handleStatusChange = async (institution: Institution, newStatus: InstitutionStatus) => {
    try {
      await institutionService.updateInstitutionStatus(institution.id, newStatus);
      toast.success(`${institution.name} has been ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchInstitutions();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.institution) return;
    try {
      await institutionService.deleteInstitution(deleteDialog.institution.id);
      toast.success(`${deleteDialog.institution.name} has been deleted`);
      setDeleteDialog({ open: false, institution: null });
      fetchInstitutions();
    } catch {
      toast.error('Failed to delete institution');
    }
  };

  const handleImpersonate = (institution: Institution) => {
    setImpersonateDialog({ open: true, institution });
  };

  const columns: ColumnDef<Institution>[] = [
    {
      id: 'logo',
      header: '',
      className: 'w-12',
      cell: (row) => <InstitutionLogo name={row.name} logo={row.logo} size="sm" />,
    },
    {
      id: 'name',
      header: 'Institution Name',
      accessorKey: 'name',
      sortable: true,
      className: 'min-w-[200px]',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium truncate max-w-[250px]">{row.name}</span>
          <span className="text-[10px] text-muted-foreground">{row.city}, {row.state}</span>
        </div>
      ),
    },
    {
      id: 'code',
      header: 'Code',
      accessorKey: 'code',
      sortable: true,
      className: 'w-[120px]',
      cell: (row) => (
        <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{row.code}</code>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      className: 'w-[130px]',
      cell: (row) => (
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
      cell: (row) => <span className="text-xs">{row.state}</span>,
    },
    {
      id: 'usersCount',
      header: 'Users',
      accessorKey: 'usersCount',
      sortable: true,
      className: 'w-[80px] text-center',
      headerClassName: 'text-center',
      cell: (row) => (
        <span className="text-xs font-medium">{row.usersCount}</span>
      ),
    },
    {
      id: 'repositoryCompletion',
      header: 'Repository %',
      accessorKey: 'repositoryCompletion',
      sortable: true,
      className: 'w-[140px]',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Progress
            value={row.repositoryCompletion}
            className={cn(
              'h-1.5 flex-1',
              row.repositoryCompletion < 50 && '[&>div]:bg-red-500',
              row.repositoryCompletion >= 50 && row.repositoryCompletion < 75 && '[&>div]:bg-amber-500',
              row.repositoryCompletion >= 75 && '[&>div]:bg-emerald-500'
            )}
          />
          <span className="text-[10px] font-medium w-8 text-right">{row.repositoryCompletion}%</span>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      className: 'w-[100px]',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'w-[60px] text-center',
      headerClassName: 'text-center',
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              className="text-xs gap-2 cursor-pointer"
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  const fullDetails = await institutionService.getInstitutionById(row.id);
                  setViewDialog({ open: true, institution: fullDetails || row });
                } catch {
                  setViewDialog({ open: true, institution: row });
                }
              }}
            >
              <Eye className="h-3.5 w-3.5" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs gap-2 cursor-pointer"
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  const fullDetails = await institutionService.getInstitutionById(row.id);
                  setEditDialog({ open: true, institution: fullDetails || row });
                } catch {
                  setEditDialog({ open: true, institution: row });
                }
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </DropdownMenuItem>
            {row.status === 'active' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-xs gap-2 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImpersonate(row);
                  }}
                >
                  <UserCog className="h-3.5 w-3.5" />
                  Impersonate
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            {row.status === 'active' ? (
              <DropdownMenuItem
                className="text-xs gap-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeactivateDialog({ open: true, institution: row });
                }}
              >
                <PowerOff className="h-3.5 w-3.5" />
                Deactivate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="text-xs gap-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(row, 'active');
                }}
              >
                <Power className="h-3.5 w-3.5" />
                Activate
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs gap-2 cursor-pointer text-destructive focus:text-destructive"
              onClick={(e) => {
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
      className="flex-1 flex flex-col justify-between space-y-6"
    >
      <div className="space-y-6 flex-1">
        {/* Header */}
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
            <Button size="sm" className="gap-2 h-8 text-xs" onClick={() => navigate('/admin/institutions/create')}>
              <Plus className="h-3.5 w-3.5" />
              Add Institution
            </Button>
          </div>
        </div>

        {/* Filters */}
        <InstitutionFilters
          filters={filters}
          onFilterChange={setFilters}
          states={institutionService.getStates()}
          categories={institutionService.getCategories()}
        />

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

        {/* Table */}
        <DataTable
          columns={columns}
          data={institutions}
          loading={loading}
          sort={sort}
          onSort={setSort}
          rowKey={(row) => row.id}
          emptyTitle="No institutions found"
          emptyDescription="Try adjusting your search or filter criteria to find institutions."
        />
      </div>

      {/* Pagination Footer - Pushed to bottom */}
      {!loading && pagination.total > 0 && (
        <div className="mt-auto pt-4 border-t border-border/40">
          <DataTablePagination
            pagination={pagination}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            onPageSizeChange={(pageSize) => setPagination((prev) => ({ ...prev, pageSize, page: 1 }))}
          />
        </div>
      )}

      {/* View Details Dialog */}
      <InstitutionDetailsDialog
        institution={viewDialog.institution}
        open={viewDialog.open}
        onOpenChange={(open) => setViewDialog({ open, institution: open ? viewDialog.institution : null })}
        onEdit={(institution) => setEditDialog({ open: true, institution })}
        onImpersonate={handleImpersonate}
      />

      {/* Impersonate Dialog */}
      <ImpersonateDialog
        institution={impersonateDialog.institution}
        open={impersonateDialog.open}
        onOpenChange={(open) =>
          setImpersonateDialog({ open, institution: open ? impersonateDialog.institution : null })
        }
      />

      {/* Edit Dialog */}
      <EditInstitutionDialog
        institution={editDialog.institution}
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ open, institution: open ? editDialog.institution : null })}
        onSaved={() => fetchInstitutions()}
      />

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog
        open={deactivateDialog.open}
        onOpenChange={(open) =>
          setDeactivateDialog({ open, institution: open ? deactivateDialog.institution : null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <PowerOff className="h-4 w-4 text-destructive" />
              Deactivate Institution
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate <strong>{deactivateDialog.institution?.name}</strong>?
              Deactivated institutions will no longer be able to log in to the platform. You can
              reactivate them at any time from this page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deactivateDialog.institution) {
                  handleStatusChange(deactivateDialog.institution, 'inactive');
                }
                setDeactivateDialog({ open: false, institution: null });
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <PowerOff className="h-3.5 w-3.5 mr-1.5" />
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, institution: open ? deleteDialog.institution : null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Institution</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteDialog.institution?.name}</strong>? This action
              cannot be undone and will remove all associated data.
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
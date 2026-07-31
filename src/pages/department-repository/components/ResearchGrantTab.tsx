import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { researchService } from '@/services/research.service';
import { GrantResponse, CreateGrantRequest, PaginatedData } from '@/types/research.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Download,
  RefreshCw,
  AlertCircle,
  Banknote,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

// ── Select options ──

const GRANT_CATEGORY_OPTIONS = ['Government', 'Industry', 'International'];
const GRANT_STATUS_OPTIONS = ['Ongoing', 'Completed'];

// ── Empty form ──

const emptyGrantForm = (): CreateGrantRequest => ({
  grantTitle: '',
  fundingAgency: '',
  principalInvestigator: '',
  coInvestigators: undefined,
  grantCategory: undefined,
  amountSanctioned: 0,
  amountReceived: undefined,
  startDate: '',
  endDate: undefined,
  status: undefined,
});

type GrantForm = CreateGrantRequest;

export const ResearchGrantTab = () => {
  const { user } = useAuth();
  const departmentId = user?.departmentId ?? 0;

  // Data state
  const [data, setData] = useState<PaginatedData<GrantResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState<GrantResponse | null>(null);

  // Form state
  const [formData, setFormData] = useState<GrantForm>(emptyGrantForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch grants from API ──

  const fetchGrants = useCallback(
    async (currentPage: number, search?: string) => {
      if (!departmentId) return;
      setLoading(true);
      setError(null);
      try {
        const result = await researchService.listGrants(departmentId, {
          page: currentPage,
          size: PAGE_SIZE,
          search: search || undefined,
        });
        setData(result);
        setTotalPages(result.totalPages);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load grants';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [departmentId]
  );

  useEffect(() => {
    fetchGrants(page, submittedSearch);
  }, [departmentId, page, submittedSearch, fetchGrants]);

  // ── Handlers ──

  const handleSearch = () => {
    setPage(0);
    setSubmittedSearch(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSubmittedSearch('');
    setPage(0);
  };

  // ── Create ──

  const openCreateDialog = () => {
    setFormData(emptyGrantForm());
    setCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!departmentId) return;
    if (
      !formData.grantTitle ||
      !formData.fundingAgency ||
      !formData.principalInvestigator ||
      !formData.amountSanctioned ||
      !formData.startDate
    ) {
      toast.error(
        'Grant Title, Funding Agency, Principal Investigator, Amount Sanctioned, and Start Date are required'
      );
      return;
    }
    setSaving(true);
    try {
      await researchService.createGrant(departmentId, formData);
      toast.success('Grant created successfully');
      setCreateDialogOpen(false);
      fetchGrants(page, submittedSearch);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create grant';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Edit ──

  const openEditDialog = (grant: GrantResponse) => {
    setSelectedGrant(grant);
    setFormData({
      grantTitle: grant.grantTitle,
      fundingAgency: grant.fundingAgency,
      principalInvestigator: grant.principalInvestigator,
      coInvestigators: grant.coInvestigators ?? undefined,
      grantCategory: grant.grantCategory ?? undefined,
      amountSanctioned: grant.amountSanctioned,
      amountReceived: grant.amountReceived ?? undefined,
      startDate: grant.startDate,
      endDate: grant.endDate ?? undefined,
      status: grant.status ?? undefined,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!departmentId || !selectedGrant) return;
    setSaving(true);
    try {
      await researchService.updateGrant(departmentId, selectedGrant.id, formData);
      toast.success('Grant updated successfully');
      setEditDialogOpen(false);
      setSelectedGrant(null);
      fetchGrants(page, submittedSearch);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update grant';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──

  const openDeleteDialog = (grant: GrantResponse) => {
    setSelectedGrant(grant);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!departmentId || !selectedGrant) return;
    setDeleting(true);
    try {
      await researchService.deleteGrant(departmentId, selectedGrant.id);
      toast.success('Grant deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedGrant(null);
      fetchGrants(page, submittedSearch);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete grant';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // ── Download Template ──

  const handleDownloadTemplate = () => {
    const headers = [
      'Grant Title',
      'Funding Agency',
      'Principal Investigator',
      'Co-Investigators',
      'Grant Category',
      'Amount Sanctioned',
      'Amount Received',
      'Start Date',
      'End Date',
      'Status',
    ];

    const sampleRow = [
      'AI Research Fund',
      'DST',
      'Dr. Rajesh Kumar',
      'Dr. Amit Singh',
      'Government',
      '5000000',
      '2500000',
      '2024-01-01',
      '2026-12-31',
      'Ongoing',
    ];

    const csvContent = `\ufeff${headers.join(',')}\n${sampleRow.join(',')}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'research_grants_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ── Pagination ──

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // ── Helpers ──

  const getStatusBadge = (status: string | null) => {
    if (status === 'Ongoing') return 'bg-blue-500/10 text-blue-600';
    if (status === 'Completed') return 'bg-emerald-500/10 text-emerald-600';
    return 'bg-gray-500/10 text-gray-600';
  };

  const getCategoryBadge = (category: string | null) => {
    if (category === 'Government') return 'bg-violet-500/10 text-violet-600';
    if (category === 'Industry') return 'bg-amber-500/10 text-amber-600';
    if (category === 'International') return 'bg-cyan-500/10 text-cyan-600';
    return 'bg-gray-500/10 text-gray-600';
  };

  const formatAmount = (amount: number | null | undefined): string => {
    if (amount == null) return '-';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  // ── Render ──

  if (!departmentId) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <p className="text-sm font-medium">Department ID not available</p>
          <p className="text-xs text-muted-foreground mt-1">
            Your user account is not associated with a department. Contact your administrator.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* ── Actions Card ── */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Research Grants</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                {data ? `${data.totalElements} total` : '...'}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => fetchGrants(page, submittedSearch)}
                disabled={loading}
              >
                <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="text-xs h-8" onClick={openCreateDialog}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Grant
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={handleDownloadTemplate}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Download Template
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              disabled
              title="Upload CSV API not available yet"
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Data Table ── */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold">Grant Records</CardTitle>
              <CardDescription className="text-xs">
                {loading
                  ? 'Loading grant data...'
                  : data
                    ? `Showing page ${data.page + 1} of ${totalPages} (${data.totalElements} records)`
                    : 'No data loaded'}
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="h-8 text-xs pl-8 pr-8"
                placeholder="Search grants..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {searchQuery && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={handleClearSearch}
                >
                  <span className="text-[10px]">✕</span>
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="table-fixed w-full min-w-[1000px]">
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-[10px] font-semibold w-8 text-center">#</TableHead>
                  <TableHead className="text-[10px] font-semibold w-44">Grant Title</TableHead>
                  <TableHead className="text-[10px] font-semibold w-20">Category</TableHead>
                  <TableHead className="text-[10px] font-semibold w-20">Agency</TableHead>
                  <TableHead className="text-[10px] font-semibold w-24">PI</TableHead>
                  <TableHead className="text-[10px] font-semibold w-16">Sanctioned</TableHead>
                  <TableHead className="text-[10px] font-semibold w-14">Start</TableHead>
                  <TableHead className="text-[10px] font-semibold w-14">End</TableHead>
                  <TableHead className="text-[10px] font-semibold w-12">Status</TableHead>
                  <TableHead className="text-[10px] font-semibold text-center w-16">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Loading skeleton */}
                {loading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skel-${i}`}>
                      <TableCell className="text-center">
                        <Skeleton className="h-4 w-4 mx-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-14" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-18" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-10" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12 mx-auto" />
                      </TableCell>
                    </TableRow>
                  ))}

                {/* Error state */}
                {!loading && error && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-destructive">
                        <AlertCircle className="h-8 w-8" />
                        <p className="text-xs font-medium">{error}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => fetchGrants(page, submittedSearch)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" /> Retry
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Empty state */}
                {!loading && !error && (!data || data.content.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Banknote className="h-8 w-8 opacity-40" />
                        <p className="text-xs">
                          {submittedSearch
                            ? 'No grants match your search.'
                            : 'No grants available. Add one to get started.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Data rows */}
                {!loading &&
                  !error &&
                  data?.content.map((grant, index) => (
                    <TableRow key={grant.id} className="hover:bg-muted/20">
                      <TableCell className="text-[10px] text-center text-muted-foreground font-mono p-1.5">
                        {data.page * data.size + index + 1}
                      </TableCell>
                      <TableCell
                        className="text-[10px] p-1.5 font-medium truncate max-w-[160px]"
                        title={grant.grantTitle}
                      >
                        {grant.grantTitle}
                      </TableCell>
                      <TableCell className="text-[10px] p-1.5">
                        <Badge
                          variant="secondary"
                          className={cn('text-[9px]', getCategoryBadge(grant.grantCategory))}
                        >
                          {grant.grantCategory || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="text-[10px] p-1.5 truncate max-w-[80px]"
                        title={grant.fundingAgency}
                      >
                        {grant.fundingAgency}
                      </TableCell>
                      <TableCell
                        className="text-[10px] p-1.5 truncate max-w-[100px]"
                        title={grant.principalInvestigator}
                      >
                        {grant.principalInvestigator}
                      </TableCell>
                      <TableCell className="text-[10px] p-1.5 font-mono">
                        {formatAmount(grant.amountSanctioned)}
                      </TableCell>
                      <TableCell className="text-[10px] p-1.5 font-mono">
                        {grant.startDate}
                      </TableCell>
                      <TableCell className="text-[10px] p-1.5 font-mono">
                        {grant.endDate || '-'}
                      </TableCell>
                      <TableCell className="text-[10px] p-1.5">
                        <Badge
                          variant="secondary"
                          className={cn('text-[9px]', getStatusBadge(grant.status))}
                        >
                          {grant.status || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center p-1.5">
                        <div className="flex items-center justify-center gap-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => openEditDialog(grant)}
                            title="Edit"
                          >
                            <Pencil className="h-3 w-3 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => openDeleteDialog(grant)}
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {/* ── Pagination ── */}
          {data && data.totalPages > 1 && (
            <div className="p-3 border-t">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(Math.max(0, page - 1))}
                      className={cn(
                        page === 0 && 'pointer-events-none opacity-50',
                        'cursor-pointer'
                      )}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) pageNum = i;
                    else if (page <= 2) pageNum = i;
                    else if (page >= totalPages - 3) pageNum = totalPages - 5 + i;
                    else pageNum = page - 2 + i;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={pageNum === page}
                          className="cursor-pointer"
                        >
                          {pageNum + 1}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
                      className={cn(
                        page >= totalPages - 1 && 'pointer-events-none opacity-50',
                        'cursor-pointer'
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ════════════════════════════════════════════════ */}
      {/* CREATE DIALOG */}
      {/* ════════════════════════════════════════════════ */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Add Grant</DialogTitle>
            <DialogDescription className="text-xs">
              Fill in the details to add a new research grant. Required fields are marked with *.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Grant Title *</Label>
              <Input
                className="h-9 text-xs"
                placeholder="e.g. AI Research Fund"
                value={formData.grantTitle}
                onChange={e => setFormData(prev => ({ ...prev, grantTitle: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Funding Agency *</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="e.g. DST"
                  value={formData.fundingAgency}
                  onChange={e => setFormData(prev => ({ ...prev, fundingAgency: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Principal Investigator *</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={formData.principalInvestigator}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, principalInvestigator: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Co-Investigators</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="e.g. Dr. Amit Singh"
                  value={formData.coInvestigators || ''}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, coInvestigators: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Grant Category</Label>
                <Select
                  value={formData.grantCategory || ''}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, grantCategory: v || undefined }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRANT_CATEGORY_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="text-xs">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Amount Sanctioned (INR) *</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 5000000"
                  value={formData.amountSanctioned || ''}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, amountSanctioned: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Amount Received (INR)</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 2500000"
                  value={formData.amountReceived ?? ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      amountReceived: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Start Date *</Label>
                <Input
                  className="h-9 text-xs"
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">End Date</Label>
                <Input
                  className="h-9 text-xs"
                  type="date"
                  value={formData.endDate || ''}
                  onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Status</Label>
                <Select
                  value={formData.status || ''}
                  onValueChange={v => setFormData(prev => ({ ...prev, status: v || undefined }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRANT_STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="text-xs">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs"
              onClick={handleCreate}
              disabled={
                saving ||
                !formData.grantTitle ||
                !formData.fundingAgency ||
                !formData.principalInvestigator ||
                !formData.amountSanctioned ||
                !formData.startDate
              }
            >
              {saving ? 'Creating...' : 'Create Grant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════════════ */}
      {/* EDIT DIALOG */}
      {/* ════════════════════════════════════════════════ */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Edit Grant</DialogTitle>
            <DialogDescription className="text-xs">Update the grant details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Grant Title</Label>
              <Input
                className="h-9 text-xs"
                value={formData.grantTitle}
                onChange={e => setFormData(prev => ({ ...prev, grantTitle: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Funding Agency</Label>
                <Input
                  className="h-9 text-xs"
                  value={formData.fundingAgency}
                  onChange={e => setFormData(prev => ({ ...prev, fundingAgency: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">PI</Label>
                <Input
                  className="h-9 text-xs"
                  value={formData.principalInvestigator}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, principalInvestigator: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Co-Investigators</Label>
                <Input
                  className="h-9 text-xs"
                  value={formData.coInvestigators || ''}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, coInvestigators: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Category</Label>
                <Select
                  value={formData.grantCategory || ''}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, grantCategory: v || undefined }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRANT_CATEGORY_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="text-xs">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Amount Sanctioned</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amountSanctioned || ''}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, amountSanctioned: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Amount Received</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amountReceived ?? ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      amountReceived: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Start Date</Label>
                <Input
                  className="h-9 text-xs"
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">End Date</Label>
                <Input
                  className="h-9 text-xs"
                  type="date"
                  value={formData.endDate || ''}
                  onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Status</Label>
                <Select
                  value={formData.status || ''}
                  onValueChange={v => setFormData(prev => ({ ...prev, status: v || undefined }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRANT_STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="text-xs">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" className="text-xs" onClick={handleUpdate} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════════════ */}
      {/* DELETE CONFIRMATION DIALOG */}
      {/* ════════════════════════════════════════════════ */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Delete Grant</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete{' '}
              <strong>&ldquo;{selectedGrant?.grantTitle}&rdquo;</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="text-xs"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { researchService } from '@/services/research.service';
import { ConsultancyResponse, CreateConsultancyRequest, PaginatedData } from '@/types/research.types';
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
  Briefcase,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

// ── Select options ──

const STATUS_OPTIONS = ['Active', 'Completed'];

// ── Empty form ──

const emptyConsultancyForm = (): CreateConsultancyRequest => ({
  consultancyTitle: '',
  clientOrganization: '',
  facultyLead: '',
  teamMembers: undefined,
  consultancyValue: 0,
  startDate: '',
  endDate: undefined,
  status: undefined,
  outcomeSummary: undefined,
});

type ConsultancyForm = CreateConsultancyRequest;

export const ResearchConsultancyTab = () => {
  const { user } = useAuth();
  const departmentId = user?.departmentId ?? 0;

  // Data state
  const [data, setData] = useState<PaginatedData<ConsultancyResponse> | null>(null);
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
  const [selectedConsultancy, setSelectedConsultancy] = useState<ConsultancyResponse | null>(null);

  // Form state
  const [formData, setFormData] = useState<ConsultancyForm>(emptyConsultancyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch consultancies from API ──

  const fetchConsultancies = useCallback(async (currentPage: number, search?: string) => {
    if (!departmentId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await researchService.listConsultancies(departmentId, {
        page: currentPage,
        size: PAGE_SIZE,
        search: search || undefined,
      });
      setData(result);
      setTotalPages(result.totalPages);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load consultancy projects';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchConsultancies(page, submittedSearch);
  }, [departmentId, page, submittedSearch, fetchConsultancies]);

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
    setFormData(emptyConsultancyForm());
    setCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!departmentId) return;
    if (!formData.consultancyTitle || !formData.clientOrganization || !formData.facultyLead || !formData.consultancyValue || !formData.startDate) {
      toast.error('Title, Client, Faculty Lead, Value, and Start Date are required');
      return;
    }
    setSaving(true);
    try {
      await researchService.createConsultancy(departmentId, formData);
      toast.success('Consultancy project created successfully');
      setCreateDialogOpen(false);
      fetchConsultancies(page, submittedSearch);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create consultancy project';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Edit ──

  const openEditDialog = (consultancy: ConsultancyResponse) => {
    setSelectedConsultancy(consultancy);
    setFormData({
      consultancyTitle: consultancy.consultancyTitle,
      clientOrganization: consultancy.clientOrganization,
      facultyLead: consultancy.facultyLead,
      teamMembers: consultancy.teamMembers ?? undefined,
      consultancyValue: consultancy.consultancyValue,
      startDate: consultancy.startDate,
      endDate: consultancy.endDate ?? undefined,
      status: consultancy.status ?? undefined,
      outcomeSummary: consultancy.outcomeSummary ?? undefined,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!departmentId || !selectedConsultancy) return;
    setSaving(true);
    try {
      await researchService.updateConsultancy(departmentId, selectedConsultancy.id, formData);
      toast.success('Consultancy project updated successfully');
      setEditDialogOpen(false);
      setSelectedConsultancy(null);
      fetchConsultancies(page, submittedSearch);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update consultancy project';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──

  const openDeleteDialog = (consultancy: ConsultancyResponse) => {
    setSelectedConsultancy(consultancy);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!departmentId || !selectedConsultancy) return;
    setDeleting(true);
    try {
      await researchService.deleteConsultancy(departmentId, selectedConsultancy.id);
      toast.success('Consultancy project deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedConsultancy(null);
      fetchConsultancies(page, submittedSearch);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete consultancy project';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // ── Download Template ──

  const handleDownloadTemplate = () => {
    const headers = [
      'Consultancy Title',
      'Client Organization',
      'Faculty Lead',
      'Team Members',
      'Consultancy Value',
      'Start Date',
      'End Date',
      'Status',
      'Outcome Summary',
    ];

    const sampleRow = [
      'Software Development for Banking',
      'SBI Bank',
      'Dr. Rajesh Kumar',
      'Dr. Amit Singh, Priya Sharma',
      '1500000',
      '2024-01-15',
      '2024-06-15',
      'Completed',
      'Successfully delivered',
    ];

    const csvContent = `\ufeff${headers.join(',')}\n${sampleRow.join(',')}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'research_consultancy_projects_template.csv';
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
    if (status === 'Completed') return 'bg-emerald-500/10 text-emerald-600';
    if (status === 'Active') return 'bg-blue-500/10 text-blue-600';
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
            <CardTitle className="text-sm font-semibold">Consultancy Projects</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                {data ? `${data.totalElements} total` : '...'}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => fetchConsultancies(page, submittedSearch)}
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
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Consultancy
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleDownloadTemplate}>
              <Download className="h-3.5 w-3.5 mr-1.5" /> Download Template
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8" disabled title="Upload CSV API not available yet">
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
              <CardTitle className="text-sm font-semibold">Consultancy Records</CardTitle>
              <CardDescription className="text-xs">
                {loading
                  ? 'Loading consultancy data...'
                  : data
                    ? `Showing page ${data.page + 1} of ${totalPages} (${data.totalElements} records)`
                    : 'No data loaded'}
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="h-8 text-xs pl-8 pr-8"
                placeholder="Search consultancies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
            <Table className="table-fixed w-full min-w-[950px]">
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-[10px] font-semibold w-8 text-center">#</TableHead>
                  <TableHead className="text-[10px] font-semibold w-40">Title</TableHead>
                  <TableHead className="text-[10px] font-semibold w-20">Client</TableHead>
                  <TableHead className="text-[10px] font-semibold w-22">Faculty Lead</TableHead>
                  <TableHead className="text-[10px] font-semibold w-16">Value</TableHead>
                  <TableHead className="text-[10px] font-semibold w-14">Start</TableHead>
                  <TableHead className="text-[10px] font-semibold w-14">End</TableHead>
                  <TableHead className="text-[10px] font-semibold w-12">Status</TableHead>
                  <TableHead className="text-[10px] font-semibold text-center w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Loading skeleton */}
                {loading && (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skel-${i}`}>
                      <TableCell className="text-center"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-18" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                    </TableRow>
                  ))
                )}

                {/* Error state */}
                {!loading && error && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-destructive">
                        <AlertCircle className="h-8 w-8" />
                        <p className="text-xs font-medium">{error}</p>
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => fetchConsultancies(page, submittedSearch)}>
                          <RefreshCw className="h-3 w-3 mr-1" /> Retry
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Empty state */}
                {!loading && !error && (!data || data.content.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Briefcase className="h-8 w-8 opacity-40" />
                        <p className="text-xs">
                          {submittedSearch
                            ? 'No consultancy projects match your search.'
                            : 'No consultancy projects available. Add one to get started.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Data rows */}
                {!loading && !error && data?.content.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-muted/20">
                    <TableCell className="text-[10px] text-center text-muted-foreground font-mono p-1.5">
                      {data.page * data.size + index + 1}
                    </TableCell>
                    <TableCell className="text-[10px] p-1.5 font-medium truncate max-w-[150px]" title={item.consultancyTitle}>
                      {item.consultancyTitle}
                    </TableCell>
                    <TableCell className="text-[10px] p-1.5 truncate max-w-[80px]" title={item.clientOrganization}>
                      {item.clientOrganization}
                    </TableCell>
                    <TableCell className="text-[10px] p-1.5 truncate max-w-[100px]" title={item.facultyLead}>
                      {item.facultyLead}
                    </TableCell>
                    <TableCell className="text-[10px] p-1.5 font-mono">{formatAmount(item.consultancyValue)}</TableCell>
                    <TableCell className="text-[10px] p-1.5 font-mono">{item.startDate}</TableCell>
                    <TableCell className="text-[10px] p-1.5 font-mono">{item.endDate || '-'}</TableCell>
                    <TableCell className="text-[10px] p-1.5">
                      <Badge variant="secondary" className={cn('text-[9px]', getStatusBadge(item.status))}>
                        {item.status || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center p-1.5">
                      <div className="flex items-center justify-center gap-0">
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => openEditDialog(item)} title="Edit">
                          <Pencil className="h-3 w-3 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => openDeleteDialog(item)} title="Delete">
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
                      className={cn(page === 0 && 'pointer-events-none opacity-50', 'cursor-pointer')}
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
                        <PaginationLink onClick={() => handlePageChange(pageNum)} isActive={pageNum === page} className="cursor-pointer">
                          {pageNum + 1}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
                      className={cn(page >= totalPages - 1 && 'pointer-events-none opacity-50', 'cursor-pointer')}
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
            <DialogTitle className="text-sm">Add Consultancy Project</DialogTitle>
            <DialogDescription className="text-xs">
              Fill in the details to add a new consultancy project. Required fields are marked with *.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Consultancy Title *</Label>
              <Input className="h-9 text-xs" placeholder="e.g. Software Development for Banking"
                value={formData.consultancyTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, consultancyTitle: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Client Organization *</Label>
                <Input className="h-9 text-xs" placeholder="e.g. SBI Bank"
                  value={formData.clientOrganization}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientOrganization: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Faculty Lead *</Label>
                <Input className="h-9 text-xs" placeholder="e.g. Dr. Rajesh Kumar"
                  value={formData.facultyLead}
                  onChange={(e) => setFormData(prev => ({ ...prev, facultyLead: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Team Members</Label>
                <Input className="h-9 text-xs" placeholder="e.g. Dr. Amit Singh, Priya Sharma"
                  value={formData.teamMembers || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, teamMembers: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Consultancy Value (INR) *</Label>
                <Input className="h-9 text-xs" type="number" min="0" step="0.01" placeholder="e.g. 1500000"
                  value={formData.consultancyValue || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, consultancyValue: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Start Date *</Label>
                <Input className="h-9 text-xs" type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">End Date</Label>
                <Input className="h-9 text-xs" type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Status</Label>
                <Select
                  value={formData.status || ''}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, status: v || undefined }))}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Outcome Summary</Label>
                <Input className="h-9 text-xs" placeholder="e.g. Successfully delivered"
                  value={formData.outcomeSummary || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, outcomeSummary: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button size="sm" className="text-xs" onClick={handleCreate}
              disabled={saving || !formData.consultancyTitle || !formData.clientOrganization || !formData.facultyLead || !formData.consultancyValue || !formData.startDate}>
              {saving ? 'Creating...' : 'Create Project'}
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
            <DialogTitle className="text-sm">Edit Consultancy Project</DialogTitle>
            <DialogDescription className="text-xs">Update the consultancy project details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Consultancy Title</Label>
              <Input className="h-9 text-xs"
                value={formData.consultancyTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, consultancyTitle: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Client Organization</Label>
                <Input className="h-9 text-xs"
                  value={formData.clientOrganization}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientOrganization: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Faculty Lead</Label>
                <Input className="h-9 text-xs"
                  value={formData.facultyLead}
                  onChange={(e) => setFormData(prev => ({ ...prev, facultyLead: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Team Members</Label>
                <Input className="h-9 text-xs"
                  value={formData.teamMembers || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, teamMembers: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Value</Label>
                <Input className="h-9 text-xs" type="number" min="0" step="0.01"
                  value={formData.consultancyValue || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, consultancyValue: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Start Date</Label>
                <Input className="h-9 text-xs" type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">End Date</Label>
                <Input className="h-9 text-xs" type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Status</Label>
                <Select
                  value={formData.status || ''}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, status: v || undefined }))}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Outcome</Label>
                <Input className="h-9 text-xs"
                  value={formData.outcomeSummary || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, outcomeSummary: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
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
            <DialogTitle className="text-sm">Delete Consultancy Project</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete <strong>&ldquo;{selectedConsultancy?.consultancyTitle}&rdquo;</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" size="sm" className="text-xs" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

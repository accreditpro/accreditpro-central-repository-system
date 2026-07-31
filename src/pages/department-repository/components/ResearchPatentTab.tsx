import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { researchService } from '@/services/research.service';
import { PatentResponse, CreatePatentRequest, PaginatedData } from '@/types/research.types';
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
  Shield,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

// ── Select options ──

const PATENT_STATUS_OPTIONS = ['Filed', 'Published', 'Granted'];
const YES_NO_OPTIONS = ['Yes', 'No'];

// ── Empty form ──

const emptyPatentForm = (): CreatePatentRequest => ({
  patentTitle: '',
  inventors: '',
  studentInventors: undefined,
  patentNumber: undefined,
  applicationNumber: '',
  country: 'India',
  filingDate: '',
  publicationDate: undefined,
  grantDate: undefined,
  patentStatus: undefined,
  commercialized: undefined,
  revenueGenerated: undefined,
});

type PatentForm = CreatePatentRequest;

export const ResearchPatentTab = () => {
  const { user } = useAuth();
  const departmentId = user?.departmentId ?? 0;

  // Data state
  const [data, setData] = useState<PaginatedData<PatentResponse> | null>(null);
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
  const [selectedPatent, setSelectedPatent] = useState<PatentResponse | null>(null);

  // Form state
  const [formData, setFormData] = useState<PatentForm>(emptyPatentForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch patents from API ──

  const fetchPatents = useCallback(
    async (currentPage: number, search?: string) => {
      if (!departmentId) return;
      setLoading(true);
      setError(null);
      try {
        const result = await researchService.listPatents(departmentId, {
          page: currentPage,
          size: PAGE_SIZE,
          search: search || undefined,
        });
        setData(result);
        setTotalPages(result.totalPages);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load patents';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [departmentId]
  );

  useEffect(() => {
    fetchPatents(page, submittedSearch);
  }, [departmentId, page, submittedSearch, fetchPatents]);

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
    setFormData(emptyPatentForm());
    setCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!departmentId) return;
    if (
      !formData.patentTitle ||
      !formData.inventors ||
      !formData.applicationNumber ||
      !formData.country ||
      !formData.filingDate
    ) {
      toast.error(
        'Patent Title, Inventors, Application Number, Country, and Filing Date are required'
      );
      return;
    }
    setSaving(true);
    try {
      await researchService.createPatent(departmentId, formData);
      toast.success('Patent created successfully');
      setCreateDialogOpen(false);
      fetchPatents(page, submittedSearch);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create patent';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Edit ──

  const openEditDialog = (patent: PatentResponse) => {
    setSelectedPatent(patent);
    setFormData({
      patentTitle: patent.patentTitle,
      inventors: patent.inventors,
      studentInventors: patent.studentInventors ?? undefined,
      patentNumber: patent.patentNumber ?? undefined,
      applicationNumber: patent.applicationNumber,
      country: patent.country,
      filingDate: patent.filingDate,
      publicationDate: patent.publicationDate ?? undefined,
      grantDate: patent.grantDate ?? undefined,
      patentStatus: patent.patentStatus ?? undefined,
      commercialized: patent.commercialized ?? undefined,
      revenueGenerated: patent.revenueGenerated ?? undefined,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!departmentId || !selectedPatent) return;
    setSaving(true);
    try {
      await researchService.updatePatent(departmentId, selectedPatent.id, formData);
      toast.success('Patent updated successfully');
      setEditDialogOpen(false);
      setSelectedPatent(null);
      fetchPatents(page, submittedSearch);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update patent';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──

  const openDeleteDialog = (patent: PatentResponse) => {
    setSelectedPatent(patent);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!departmentId || !selectedPatent) return;
    setDeleting(true);
    try {
      await researchService.deletePatent(departmentId, selectedPatent.id);
      toast.success('Patent deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedPatent(null);
      fetchPatents(page, submittedSearch);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete patent';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // ── Download Template ──

  const handleDownloadTemplate = () => {
    const headers = [
      'Patent Title',
      'Inventors (Faculty)',
      'Student Inventors',
      'Patent Number',
      'Application Number',
      'Country',
      'Filing Date',
      'Publication Date',
      'Grant Date',
      'Patent Status',
      'Commercialized',
      'Revenue Generated',
    ];

    const sampleRow = [
      'AI-Based Fraud Detection System',
      'Dr. Rajesh Kumar, Dr. Amit Singh',
      'Priya Sharma',
      'IN202411001234',
      'IN/PCT/2024/001234',
      'India',
      '2024-01-15',
      '2024-06-15',
      '',
      'Published',
      'No',
      '',
    ];

    const csvContent = `\ufeff${headers.join(',')}\n${sampleRow.join(',')}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'research_patents_template.csv';
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
    if (status === 'Granted') return 'bg-emerald-500/10 text-emerald-600';
    if (status === 'Published') return 'bg-blue-500/10 text-blue-600';
    if (status === 'Filed') return 'bg-amber-500/10 text-amber-600';
    return 'bg-gray-500/10 text-gray-600';
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
            <CardTitle className="text-sm font-semibold">Patents</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                {data ? `${data.totalElements} total` : '...'}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => fetchPatents(page, submittedSearch)}
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
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Patent
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
              <CardTitle className="text-sm font-semibold">Patent Records</CardTitle>
              <CardDescription className="text-xs">
                {loading
                  ? 'Loading patent data...'
                  : data
                    ? `Showing page ${data.page + 1} of ${totalPages} (${data.totalElements} records)`
                    : 'No data loaded'}
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="h-8 text-xs pl-8 pr-8"
                placeholder="Search patents..."
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
                  <TableHead className="text-[10px] font-semibold w-48">Patent Title</TableHead>
                  <TableHead className="text-[10px] font-semibold w-28">Inventors</TableHead>
                  <TableHead className="text-[10px] font-semibold w-20">App. No.</TableHead>
                  <TableHead className="text-[10px] font-semibold w-14">Country</TableHead>
                  <TableHead className="text-[10px] font-semibold w-16">Filing Date</TableHead>
                  <TableHead className="text-[10px] font-semibold w-14">Status</TableHead>
                  <TableHead className="text-[10px] font-semibold w-12">Comm.</TableHead>
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
                        <Skeleton className="h-4 w-36" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-10" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-14" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12 mx-auto" />
                      </TableCell>
                    </TableRow>
                  ))}

                {/* Error state */}
                {!loading && error && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-destructive">
                        <AlertCircle className="h-8 w-8" />
                        <p className="text-xs font-medium">{error}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => fetchPatents(page, submittedSearch)}
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
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Shield className="h-8 w-8 opacity-40" />
                        <p className="text-xs">
                          {submittedSearch
                            ? 'No patents match your search.'
                            : 'No patents available. Add one to get started.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Data rows */}
                {!loading &&
                  !error &&
                  data?.content.map((patent, index) => (
                    <TableRow key={patent.id} className="hover:bg-muted/20">
                      <TableCell className="text-[10px] text-center text-muted-foreground font-mono p-1.5">
                        {data.page * data.size + index + 1}
                      </TableCell>
                      <TableCell
                        className="text-[10px] p-1.5 font-medium truncate max-w-[180px]"
                        title={patent.patentTitle}
                      >
                        {patent.patentTitle}
                      </TableCell>
                      <TableCell
                        className="text-[10px] p-1.5 truncate max-w-[110px]"
                        title={patent.inventors}
                      >
                        {patent.inventors}
                      </TableCell>
                      <TableCell
                        className="text-[10px] p-1.5 font-mono truncate max-w-[80px]"
                        title={patent.applicationNumber}
                      >
                        {patent.applicationNumber}
                      </TableCell>
                      <TableCell className="text-[10px] p-1.5">{patent.country}</TableCell>
                      <TableCell className="text-[10px] p-1.5 font-mono">
                        {patent.filingDate}
                      </TableCell>
                      <TableCell className="text-[10px] p-1.5">
                        <Badge
                          variant="secondary"
                          className={cn('text-[9px]', getStatusBadge(patent.patentStatus))}
                        >
                          {patent.patentStatus || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[10px] p-1.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[9px]',
                            patent.commercialized === 'Yes'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'text-muted-foreground'
                          )}
                        >
                          {patent.commercialized || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center p-1.5">
                        <div className="flex items-center justify-center gap-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => openEditDialog(patent)}
                            title="Edit"
                          >
                            <Pencil className="h-3 w-3 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => openDeleteDialog(patent)}
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
            <DialogTitle className="text-sm">Add Patent</DialogTitle>
            <DialogDescription className="text-xs">
              Fill in the details to add a new patent. Required fields are marked with *.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Patent Title *</Label>
              <Input
                className="h-9 text-xs"
                placeholder="e.g. AI-Based Fraud Detection System"
                value={formData.patentTitle}
                onChange={e => setFormData(prev => ({ ...prev, patentTitle: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Inventors (Faculty) *</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="e.g. Dr. Rajesh Kumar, Dr. Amit Singh"
                  value={formData.inventors}
                  onChange={e => setFormData(prev => ({ ...prev, inventors: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Student Inventors</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="e.g. Priya Sharma"
                  value={formData.studentInventors || ''}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, studentInventors: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Patent Number</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="e.g. IN202411001234"
                  value={formData.patentNumber || ''}
                  onChange={e => setFormData(prev => ({ ...prev, patentNumber: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Application Number *</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="e.g. IN/PCT/2024/001234"
                  value={formData.applicationNumber}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, applicationNumber: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Country *</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="e.g. India"
                  value={formData.country}
                  onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Filing Date *</Label>
                <Input
                  className="h-9 text-xs"
                  type="date"
                  value={formData.filingDate}
                  onChange={e => setFormData(prev => ({ ...prev, filingDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Publication Date</Label>
                <Input
                  className="h-9 text-xs"
                  type="date"
                  value={formData.publicationDate || ''}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, publicationDate: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Grant Date</Label>
                <Input
                  className="h-9 text-xs"
                  type="date"
                  value={formData.grantDate || ''}
                  onChange={e => setFormData(prev => ({ ...prev, grantDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Patent Status</Label>
                <Select
                  value={formData.patentStatus || ''}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, patentStatus: v || undefined }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PATENT_STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="text-xs">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Commercialized</Label>
                <Select
                  value={formData.commercialized || ''}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, commercialized: v || undefined }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {YES_NO_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="text-xs">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Revenue Generated (INR)</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 500000"
                  value={formData.revenueGenerated ?? ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      revenueGenerated: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
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
                !formData.patentTitle ||
                !formData.inventors ||
                !formData.applicationNumber ||
                !formData.country ||
                !formData.filingDate
              }
            >
              {saving ? 'Creating...' : 'Create Patent'}
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
            <DialogTitle className="text-sm">Edit Patent</DialogTitle>
            <DialogDescription className="text-xs">Update the patent details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Patent Title</Label>
              <Input
                className="h-9 text-xs"
                value={formData.patentTitle}
                onChange={e => setFormData(prev => ({ ...prev, patentTitle: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Inventors</Label>
                <Input
                  className="h-9 text-xs"
                  value={formData.inventors}
                  onChange={e => setFormData(prev => ({ ...prev, inventors: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Student Inventors</Label>
                <Input
                  className="h-9 text-xs"
                  value={formData.studentInventors || ''}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, studentInventors: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Patent Number</Label>
                <Input
                  className="h-9 text-xs"
                  value={formData.patentNumber || ''}
                  onChange={e => setFormData(prev => ({ ...prev, patentNumber: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Application Number</Label>
                <Input
                  className="h-9 text-xs"
                  value={formData.applicationNumber}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, applicationNumber: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Country</Label>
                <Input
                  className="h-9 text-xs"
                  value={formData.country}
                  onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Filing Date</Label>
                <Input
                  className="h-9 text-xs"
                  type="date"
                  value={formData.filingDate}
                  onChange={e => setFormData(prev => ({ ...prev, filingDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Publication Date</Label>
                <Input
                  className="h-9 text-xs"
                  type="date"
                  value={formData.publicationDate || ''}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, publicationDate: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Grant Date</Label>
                <Input
                  className="h-9 text-xs"
                  type="date"
                  value={formData.grantDate || ''}
                  onChange={e => setFormData(prev => ({ ...prev, grantDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Patent Status</Label>
                <Select
                  value={formData.patentStatus || ''}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, patentStatus: v || undefined }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PATENT_STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="text-xs">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Commercialized</Label>
                <Select
                  value={formData.commercialized || ''}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, commercialized: v || undefined }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {YES_NO_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="text-xs">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Revenue Generated (INR)</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.revenueGenerated ?? ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      revenueGenerated: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
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
            <DialogTitle className="text-sm">Delete Patent</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete{' '}
              <strong>&ldquo;{selectedPatent?.patentTitle}&rdquo;</strong>? This action cannot be
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

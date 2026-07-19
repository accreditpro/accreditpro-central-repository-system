import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { researchService } from '@/services/research.service';
import { SponsoredProjectResponse, CreateSponsoredProjectRequest, PaginatedData } from '@/types/research.types';
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
  FolderKanban,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

// ── Select options ──

const PROJECT_STATUS_OPTIONS = ['Ongoing', 'Completed'];

// ── Empty form ──

const emptyProjectForm = (): CreateSponsoredProjectRequest => ({
  projectTitle: '',
  sponsorOrganization: '',
  principalInvestigator: '',
  coInvestigators: undefined,
  projectValue: 0,
  startDate: '',
  endDate: undefined,
  projectStatus: undefined,
  projectOutcome: undefined,
});

type ProjectForm = CreateSponsoredProjectRequest;

export const ResearchSponsoredProjectTab = () => {
  const { user } = useAuth();
  const departmentId = user?.departmentId ?? 0;

  // Data state
  const [data, setData] = useState<PaginatedData<SponsoredProjectResponse> | null>(null);
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
  const [selectedProject, setSelectedProject] = useState<SponsoredProjectResponse | null>(null);

  // Form state
  const [formData, setFormData] = useState<ProjectForm>(emptyProjectForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch projects from API ──

  const fetchProjects = useCallback(async (currentPage: number, search?: string) => {
    if (!departmentId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await researchService.listSponsoredProjects(departmentId, {
        page: currentPage,
        size: PAGE_SIZE,
        search: search || undefined,
      });
      setData(result);
      setTotalPages(result.totalPages);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load sponsored projects';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchProjects(page, submittedSearch);
  }, [departmentId, page, submittedSearch, fetchProjects]);

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
    setFormData(emptyProjectForm());
    setCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!departmentId) return;
    if (!formData.projectTitle || !formData.sponsorOrganization || !formData.principalInvestigator || !formData.projectValue || !formData.startDate) {
      toast.error('Project Title, Sponsor, PI, Project Value, and Start Date are required');
      return;
    }
    setSaving(true);
    try {
      await researchService.createSponsoredProject(departmentId, formData);
      toast.success('Sponsored project created successfully');
      setCreateDialogOpen(false);
      fetchProjects(page, submittedSearch);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create sponsored project';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Edit ──

  const openEditDialog = (project: SponsoredProjectResponse) => {
    setSelectedProject(project);
    setFormData({
      projectTitle: project.projectTitle,
      sponsorOrganization: project.sponsorOrganization,
      principalInvestigator: project.principalInvestigator,
      coInvestigators: project.coInvestigators ?? undefined,
      projectValue: project.projectValue,
      startDate: project.startDate,
      endDate: project.endDate ?? undefined,
      projectStatus: project.projectStatus ?? undefined,
      projectOutcome: project.projectOutcome ?? undefined,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!departmentId || !selectedProject) return;
    setSaving(true);
    try {
      await researchService.updateSponsoredProject(departmentId, selectedProject.id, formData);
      toast.success('Sponsored project updated successfully');
      setEditDialogOpen(false);
      setSelectedProject(null);
      fetchProjects(page, submittedSearch);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update sponsored project';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──

  const openDeleteDialog = (project: SponsoredProjectResponse) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!departmentId || !selectedProject) return;
    setDeleting(true);
    try {
      await researchService.deleteSponsoredProject(departmentId, selectedProject.id);
      toast.success('Sponsored project deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedProject(null);
      fetchProjects(page, submittedSearch);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete sponsored project';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // ── Download Template ──

  const handleDownloadTemplate = () => {
    const headers = [
      'Project Title',
      'Sponsor Organization',
      'Principal Investigator',
      'Co-Investigators',
      'Project Value',
      'Start Date',
      'End Date',
      'Project Status',
      'Project Outcome',
    ];

    const sampleRow = [
      'IoT-based Smart Agriculture',
      'ICAR',
      'Dr. Amit Singh',
      'Dr. Rajesh Kumar',
      '2500000',
      '2024-01-01',
      '2025-12-31',
      'Ongoing',
      'Prototype developed',
    ];

    const csvContent = `\ufeff${headers.join(',')}\n${sampleRow.join(',')}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'research_sponsored_projects_template.csv';
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
            <CardTitle className="text-sm font-semibold">Sponsored Projects</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                {data ? `${data.totalElements} total` : '...'}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => fetchProjects(page, submittedSearch)}
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
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Project
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
              <CardTitle className="text-sm font-semibold">Project Records</CardTitle>
              <CardDescription className="text-xs">
                {loading
                  ? 'Loading project data...'
                  : data
                    ? `Showing page ${data.page + 1} of ${totalPages} (${data.totalElements} records)`
                    : 'No data loaded'}
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="h-8 text-xs pl-8 pr-8"
                placeholder="Search projects..."
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
            <Table className="table-fixed w-full min-w-[1000px]">
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-[10px] font-semibold w-8 text-center">#</TableHead>
                  <TableHead className="text-[10px] font-semibold w-44">Project Title</TableHead>
                  <TableHead className="text-[10px] font-semibold w-20">Sponsor</TableHead>
                  <TableHead className="text-[10px] font-semibold w-24">PI</TableHead>
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
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
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
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => fetchProjects(page, submittedSearch)}>
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
                        <FolderKanban className="h-8 w-8 opacity-40" />
                        <p className="text-xs">
                          {submittedSearch
                            ? 'No sponsored projects match your search.'
                            : 'No sponsored projects available. Add one to get started.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Data rows */}
                {!loading && !error && data?.content.map((project, index) => (
                  <TableRow key={project.id} className="hover:bg-muted/20">
                    <TableCell className="text-[10px] text-center text-muted-foreground font-mono p-1.5">
                      {data.page * data.size + index + 1}
                    </TableCell>
                    <TableCell className="text-[10px] p-1.5 font-medium truncate max-w-[160px]" title={project.projectTitle}>
                      {project.projectTitle}
                    </TableCell>
                    <TableCell className="text-[10px] p-1.5 truncate max-w-[80px]" title={project.sponsorOrganization}>
                      {project.sponsorOrganization}
                    </TableCell>
                    <TableCell className="text-[10px] p-1.5 truncate max-w-[100px]" title={project.principalInvestigator}>
                      {project.principalInvestigator}
                    </TableCell>
                    <TableCell className="text-[10px] p-1.5 font-mono">{formatAmount(project.projectValue)}</TableCell>
                    <TableCell className="text-[10px] p-1.5 font-mono">{project.startDate}</TableCell>
                    <TableCell className="text-[10px] p-1.5 font-mono">{project.endDate || '-'}</TableCell>
                    <TableCell className="text-[10px] p-1.5">
                      <Badge variant="secondary" className={cn('text-[9px]', getStatusBadge(project.projectStatus))}>
                        {project.projectStatus || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center p-1.5">
                      <div className="flex items-center justify-center gap-0">
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => openEditDialog(project)} title="Edit">
                          <Pencil className="h-3 w-3 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => openDeleteDialog(project)} title="Delete">
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
            <DialogTitle className="text-sm">Add Sponsored Project</DialogTitle>
            <DialogDescription className="text-xs">
              Fill in the details to add a new sponsored project. Required fields are marked with *.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Project Title *</Label>
              <Input className="h-9 text-xs" placeholder="e.g. IoT-based Smart Agriculture"
                value={formData.projectTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, projectTitle: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Sponsor Organization *</Label>
                <Input className="h-9 text-xs" placeholder="e.g. ICAR"
                  value={formData.sponsorOrganization}
                  onChange={(e) => setFormData(prev => ({ ...prev, sponsorOrganization: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Principal Investigator *</Label>
                <Input className="h-9 text-xs" placeholder="e.g. Dr. Amit Singh"
                  value={formData.principalInvestigator}
                  onChange={(e) => setFormData(prev => ({ ...prev, principalInvestigator: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Co-Investigators</Label>
                <Input className="h-9 text-xs" placeholder="e.g. Dr. Rajesh Kumar"
                  value={formData.coInvestigators || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, coInvestigators: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Project Value (INR) *</Label>
                <Input className="h-9 text-xs" type="number" min="0" step="0.01" placeholder="e.g. 2500000"
                  value={formData.projectValue || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectValue: Number(e.target.value) }))} />
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
                <Label className="text-xs font-medium">Project Status</Label>
                <Select
                  value={formData.projectStatus || ''}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, projectStatus: v || undefined }))}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Project Outcome</Label>
                <Input className="h-9 text-xs" placeholder="e.g. Prototype developed"
                  value={formData.projectOutcome || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectOutcome: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button size="sm" className="text-xs" onClick={handleCreate}
              disabled={saving || !formData.projectTitle || !formData.sponsorOrganization || !formData.principalInvestigator || !formData.projectValue || !formData.startDate}>
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
            <DialogTitle className="text-sm">Edit Sponsored Project</DialogTitle>
            <DialogDescription className="text-xs">Update the project details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Project Title</Label>
              <Input className="h-9 text-xs"
                value={formData.projectTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, projectTitle: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Sponsor Organization</Label>
                <Input className="h-9 text-xs"
                  value={formData.sponsorOrganization}
                  onChange={(e) => setFormData(prev => ({ ...prev, sponsorOrganization: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">PI</Label>
                <Input className="h-9 text-xs"
                  value={formData.principalInvestigator}
                  onChange={(e) => setFormData(prev => ({ ...prev, principalInvestigator: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Co-Investigators</Label>
                <Input className="h-9 text-xs"
                  value={formData.coInvestigators || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, coInvestigators: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Project Value</Label>
                <Input className="h-9 text-xs" type="number" min="0" step="0.01"
                  value={formData.projectValue || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectValue: Number(e.target.value) }))} />
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
                  value={formData.projectStatus || ''}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, projectStatus: v || undefined }))}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Outcome</Label>
                <Input className="h-9 text-xs"
                  value={formData.projectOutcome || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectOutcome: e.target.value }))} />
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
            <DialogTitle className="text-sm">Delete Sponsored Project</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete <strong>&ldquo;{selectedProject?.projectTitle}&rdquo;</strong>? This action cannot be undone.
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

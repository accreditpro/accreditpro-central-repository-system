import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { researchService } from '@/services/research.service';
import { PublicationResponse, CreatePublicationRequest, PaginatedData } from '@/types/research.types';
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
  FileText,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

// ── Select options ──

const PUBLICATION_TYPE_OPTIONS = ['Journal', 'Conference', 'Book Chapter'];
const STATUS_OPTIONS = ['Accepted', 'Published'];

// ── Empty form ──

const emptyPublicationForm = (): CreatePublicationRequest => ({
  publicationTitle: '',
  publicationType: undefined,
  authors: '',
  studentAuthors: undefined,
  correspondingAuthor: undefined,
  journalConferenceName: undefined,
  publisher: undefined,
  issnIsbn: undefined,
  doi: undefined,
  indexedIn: undefined,
  impactFactor: undefined,
  citationCount: undefined,
  publicationDate: '',
  academicYear: undefined,
  status: undefined,
  publicationUrl: undefined,
});

type PublicationForm = CreatePublicationRequest;

export const ResearchPublicationTab = () => {
  const { user } = useAuth();
  const departmentId = user?.departmentId ?? 0;

  // Data state
  const [data, setData] = useState<PaginatedData<PublicationResponse> | null>(null);
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
  const [selectedPublication, setSelectedPublication] = useState<PublicationResponse | null>(null);

  // Form state
  const [formData, setFormData] = useState<PublicationForm>(emptyPublicationForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch publications from API ──

  const fetchPublications = useCallback(async (currentPage: number, search?: string) => {
    if (!departmentId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await researchService.listPublications(departmentId, {
        page: currentPage,
        size: PAGE_SIZE,
        search: search || undefined,
      });
      setData(result);
      setTotalPages(result.totalPages);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load publications';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchPublications(page, submittedSearch);
  }, [departmentId, page, submittedSearch, fetchPublications]);

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
    setFormData(emptyPublicationForm());
    setCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!departmentId) return;
    if (!formData.publicationTitle || !formData.authors || !formData.publicationDate) {
      toast.error('Publication Title, Authors, and Publication Date are required');
      return;
    }
    setSaving(true);
    try {
      await researchService.createPublication(departmentId, formData);
      toast.success('Publication created successfully');
      setCreateDialogOpen(false);
      fetchPublications(page, submittedSearch);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create publication';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Edit ──

  const openEditDialog = (pub: PublicationResponse) => {
    setSelectedPublication(pub);
    setFormData({
      publicationTitle: pub.publicationTitle,
      publicationType: pub.publicationType ?? undefined,
      authors: pub.authors,
      studentAuthors: pub.studentAuthors ?? undefined,
      correspondingAuthor: pub.correspondingAuthor ?? undefined,
      journalConferenceName: pub.journalConferenceName ?? undefined,
      publisher: pub.publisher ?? undefined,
      issnIsbn: pub.issnIsbn ?? undefined,
      doi: pub.doi ?? undefined,
      indexedIn: pub.indexedIn ?? undefined,
      impactFactor: pub.impactFactor ?? undefined,
      citationCount: pub.citationCount ?? undefined,
      publicationDate: pub.publicationDate,
      academicYear: pub.academicYear ?? undefined,
      status: pub.status ?? undefined,
      publicationUrl: pub.publicationUrl ?? undefined,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!departmentId || !selectedPublication) return;
    setSaving(true);
    try {
      await researchService.updatePublication(departmentId, selectedPublication.id, formData);
      toast.success('Publication updated successfully');
      setEditDialogOpen(false);
      setSelectedPublication(null);
      fetchPublications(page, submittedSearch);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update publication';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──

  const openDeleteDialog = (pub: PublicationResponse) => {
    setSelectedPublication(pub);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!departmentId || !selectedPublication) return;
    setDeleting(true);
    try {
      await researchService.deletePublication(departmentId, selectedPublication.id);
      toast.success('Publication deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedPublication(null);
      fetchPublications(page, submittedSearch);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete publication';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // ── Download Template ──

  const handleDownloadTemplate = () => {
    const headers = [
      'Publication Title',
      'Publication Type',
      'Authors (Faculty)',
      'Student Authors',
      'Corresponding Author',
      'Journal / Conference Name',
      'Publisher',
      'ISSN / ISBN',
      'DOI',
      'Indexed In',
      'Impact Factor',
      'Citation Count',
      'Publication Date',
      'Academic Year',
      'Status',
      'Publication URL',
    ];

    const sampleRow = [
      'Sample Publication Title',
      'Journal',
      'Dr. Rajesh Kumar, Dr. Amit Singh',
      'Priya Sharma',
      'Dr. Rajesh Kumar',
      'IEEE Transactions on AI',
      'IEEE',
      '1234-5678',
      '10.1109/TAI.2024.001',
      'SCI, Scopus',
      '5.5',
      '25',
      '2024-03-15',
      '2023-24',
      'Published',
      'https://doi.org/example',
    ];

    const csvContent = `\ufeff${headers.join(',')}\n${sampleRow.join(',')}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'research_publications_template.csv';
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
    if (status === 'Published') return 'bg-emerald-500/10 text-emerald-600';
    if (status === 'Accepted') return 'bg-blue-500/10 text-blue-600';
    return 'bg-gray-500/10 text-gray-600';
  };

  const getTypeBadge = (type: string | null) => {
    if (type === 'Journal') return 'bg-violet-500/10 text-violet-600';
    if (type === 'Conference') return 'bg-amber-500/10 text-amber-600';
    if (type === 'Book Chapter') return 'bg-cyan-500/10 text-cyan-600';
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
            <CardTitle className="text-sm font-semibold">Publications</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                {data ? `${data.totalElements} total` : '...'}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => fetchPublications(page, submittedSearch)}
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
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Publication
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
              <CardTitle className="text-sm font-semibold">Publication Records</CardTitle>
              <CardDescription className="text-xs">
                {loading
                  ? 'Loading publication data...'
                  : data
                    ? `Showing page ${data.page + 1} of ${totalPages} (${data.totalElements} records)`
                    : 'No data loaded'}
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="h-8 text-xs pl-8 pr-8"
                placeholder="Search publications..."
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
            <Table className="table-fixed w-full min-w-[1200px]">
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-[10px] font-semibold w-8 text-center">#</TableHead>
                  <TableHead className="text-[10px] font-semibold w-48">Title</TableHead>
                  <TableHead className="text-[10px] font-semibold w-20">Type</TableHead>
                  <TableHead className="text-[10px] font-semibold w-28">Authors</TableHead>
                  <TableHead className="text-[10px] font-semibold w-28">Journal / Conference</TableHead>
                  <TableHead className="text-[10px] font-semibold w-12">Year</TableHead>
                  <TableHead className="text-[10px] font-semibold w-12">Impact Factor</TableHead>
                  <TableHead className="text-[10px] font-semibold w-14">Citations</TableHead>
                  <TableHead className="text-[10px] font-semibold w-14">Status</TableHead>
                  <TableHead className="text-[10px] font-semibold text-center w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Loading skeleton */}
                {loading && (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skel-${i}`}>
                      <TableCell className="text-center"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                    </TableRow>
                  ))
                )}

                {/* Error state */}
                {!loading && error && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-destructive">
                        <AlertCircle className="h-8 w-8" />
                        <p className="text-xs font-medium">{error}</p>
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => fetchPublications(page, submittedSearch)}>
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
                        <FileText className="h-8 w-8 opacity-40" />
                        <p className="text-xs">
                          {submittedSearch
                            ? 'No publications match your search.'
                            : 'No publications available. Add one to get started.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Data rows */}
                {!loading && !error && data?.content.map((pub, index) => (
                  <TableRow key={pub.id} className="hover:bg-muted/20">
                    <TableCell className="text-[10px] text-center text-muted-foreground font-mono p-1.5">
                      {data.page * data.size + index + 1}
                    </TableCell>
                    <TableCell className="text-[10px] p-1.5 font-medium truncate max-w-[180px]" title={pub.publicationTitle}>
                      {pub.publicationTitle}
                    </TableCell>
                    <TableCell className="text-[10px] p-1.5">
                      <Badge variant="secondary" className={cn('text-[9px]', getTypeBadge(pub.publicationType))}>
                        {pub.publicationType || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[10px] p-1.5 truncate max-w-[110px]" title={pub.authors}>
                      {pub.authors}
                    </TableCell>
                    <TableCell className="text-[10px] p-1.5 truncate max-w-[110px]" title={pub.journalConferenceName ?? ''}>
                      {pub.journalConferenceName || '-'}
                    </TableCell>
                    <TableCell className="text-[10px] p-1.5 font-mono">{pub.publicationDate?.substring(0, 4) || '-'}</TableCell>
                    <TableCell className="text-[10px] p-1.5 font-mono">{pub.impactFactor?.toFixed(1) ?? '-'}</TableCell>
                    <TableCell className="text-[10px] p-1.5 font-mono">{pub.citationCount ?? '-'}</TableCell>
                    <TableCell className="text-[10px] p-1.5">
                      <Badge variant="secondary" className={cn('text-[9px]', getStatusBadge(pub.status))}>
                        {pub.status || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center p-1.5">
                      <div className="flex items-center justify-center gap-0">
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => openEditDialog(pub)} title="Edit">
                          <Pencil className="h-3 w-3 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => openDeleteDialog(pub)} title="Delete">
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
            <DialogTitle className="text-sm">Add Publication</DialogTitle>
            <DialogDescription className="text-xs">
              Fill in the details to add a new publication. Required fields are marked with *.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Publication Title *</Label>
              <Input className="h-9 text-xs" placeholder="e.g. Deep Learning for Image Classification"
                value={formData.publicationTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, publicationTitle: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Publication Type</Label>
                <Select
                  value={formData.publicationType || ''}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, publicationType: v || undefined }))}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {PUBLICATION_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Authors (Faculty) *</Label>
                <Input className="h-9 text-xs" placeholder="e.g. Dr. Rajesh Kumar, Dr. Amit Singh"
                  value={formData.authors}
                  onChange={(e) => setFormData(prev => ({ ...prev, authors: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Student Authors</Label>
                <Input className="h-9 text-xs" placeholder="e.g. Priya Sharma"
                  value={formData.studentAuthors || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentAuthors: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Corresponding Author</Label>
                <Input className="h-9 text-xs" placeholder="e.g. Dr. Rajesh Kumar"
                  value={formData.correspondingAuthor || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, correspondingAuthor: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Journal / Conference Name</Label>
                <Input className="h-9 text-xs" placeholder="e.g. IEEE Transactions on AI"
                  value={formData.journalConferenceName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, journalConferenceName: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Publisher</Label>
                <Input className="h-9 text-xs" placeholder="e.g. IEEE"
                  value={formData.publisher || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, publisher: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">ISSN / ISBN</Label>
                <Input className="h-9 text-xs" placeholder="e.g. 1234-5678"
                  value={formData.issnIsbn || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, issnIsbn: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">DOI</Label>
                <Input className="h-9 text-xs" placeholder="e.g. 10.1109/TAI.2024.001"
                  value={formData.doi || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, doi: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Indexed In</Label>
                <Input className="h-9 text-xs" placeholder="e.g. SCI, Scopus"
                  value={formData.indexedIn || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, indexedIn: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Impact Factor</Label>
                <Input className="h-9 text-xs" type="number" step="0.001" min="0" placeholder="e.g. 5.5"
                  value={formData.impactFactor ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, impactFactor: e.target.value ? Number(e.target.value) : undefined }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Citation Count</Label>
                <Input className="h-9 text-xs" type="number" min="0" placeholder="e.g. 25"
                  value={formData.citationCount ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, citationCount: e.target.value ? Number(e.target.value) : undefined }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Publication Date *</Label>
                <Input className="h-9 text-xs" type="date"
                  value={formData.publicationDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, publicationDate: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Academic Year</Label>
                <Input className="h-9 text-xs" placeholder="e.g. 2023-24"
                  value={formData.academicYear || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Publication URL</Label>
              <Input className="h-9 text-xs" placeholder="e.g. https://doi.org/10.1109/TAI.2024.001"
                value={formData.publicationUrl || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, publicationUrl: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button size="sm" className="text-xs" onClick={handleCreate}
              disabled={saving || !formData.publicationTitle || !formData.authors || !formData.publicationDate}>
              {saving ? 'Creating...' : 'Create Publication'}
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
            <DialogTitle className="text-sm">Edit Publication</DialogTitle>
            <DialogDescription className="text-xs">Update the publication details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Publication Title</Label>
              <Input className="h-9 text-xs"
                value={formData.publicationTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, publicationTitle: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Publication Type</Label>
                <Select
                  value={formData.publicationType || ''}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, publicationType: v || undefined }))}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {PUBLICATION_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Authors</Label>
                <Input className="h-9 text-xs"
                  value={formData.authors}
                  onChange={(e) => setFormData(prev => ({ ...prev, authors: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Student Authors</Label>
                <Input className="h-9 text-xs"
                  value={formData.studentAuthors || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentAuthors: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Journal / Conference</Label>
                <Input className="h-9 text-xs"
                  value={formData.journalConferenceName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, journalConferenceName: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">DOI</Label>
                <Input className="h-9 text-xs"
                  value={formData.doi || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, doi: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Impact Factor</Label>
                <Input className="h-9 text-xs" type="number" step="0.001"
                  value={formData.impactFactor ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, impactFactor: e.target.value ? Number(e.target.value) : undefined }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Citation Count</Label>
                <Input className="h-9 text-xs" type="number" min="0"
                  value={formData.citationCount ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, citationCount: e.target.value ? Number(e.target.value) : undefined }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Publication Date</Label>
                <Input className="h-9 text-xs" type="date"
                  value={formData.publicationDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, publicationDate: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Academic Year</Label>
                <Input className="h-9 text-xs"
                  value={formData.academicYear || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Publication URL</Label>
              <Input className="h-9 text-xs"
                value={formData.publicationUrl || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, publicationUrl: e.target.value }))} />
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
            <DialogTitle className="text-sm">Delete Publication</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete <strong>&ldquo;{selectedPublication?.publicationTitle}&rdquo;</strong>? This action cannot be undone.
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

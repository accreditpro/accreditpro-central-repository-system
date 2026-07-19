import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { alumniService } from '@/services/alumni.service';
import { AlumniDetailResponse, CreateAlumniRequest, PaginatedData } from '@/types/alumni.types';
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
  Users2,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

const ALUMNI_STATUS_OPTIONS = ['Active', 'Inactive', 'Unverified', 'Deceased'];

const emptyAlumniForm = (): CreateAlumniRequest => ({
  alumniId: '',
  alumniName: '',
  rollNumber: '',
  programId: undefined,
  specializationId: undefined,
  graduationYear: '',
  personalEmail: undefined,
  mobileNumber: undefined,
  currentCity: undefined,
  currentCountry: 'India',
  linkedinProfile: undefined,
  alumniStatus: 'Active',
});

type AlumniForm = CreateAlumniRequest;

export const AlumniDetailTab = () => {
  const { user } = useAuth();
  const departmentId = user?.departmentId ?? 0;

  const [data, setData] = useState<PaginatedData<AlumniDetailResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniDetailResponse | null>(null);

  const [formData, setFormData] = useState<AlumniForm>(emptyAlumniForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchAlumni = useCallback(async (currentPage: number, search?: string) => {
    if (!departmentId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await alumniService.listAlumni(departmentId, {
        page: currentPage,
        size: PAGE_SIZE,
        search: search || undefined,
      });
      setData(result);
      setTotalPages(result.totalPages);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load alumni';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchAlumni(page, submittedSearch);
  }, [departmentId, page, submittedSearch, fetchAlumni]);

  const handleSearch = () => { setPage(0); setSubmittedSearch(searchQuery); };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleSearch(); };
  const handleClearSearch = () => { setSearchQuery(''); setSubmittedSearch(''); setPage(0); };

  const openCreateDialog = () => { setFormData(emptyAlumniForm()); setCreateDialogOpen(true); };

  const handleCreate = async () => {
    if (!departmentId) return;
    if (!formData.alumniId || !formData.alumniName || !formData.rollNumber || !formData.graduationYear) {
      toast.error('Alumni ID, Name, Roll Number, and Graduation Year are required');
      return;
    }
    setSaving(true);
    try {
      await alumniService.createAlumni(departmentId, formData);
      toast.success('Alumni created successfully');
      setCreateDialogOpen(false);
      fetchAlumni(page, submittedSearch);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create alumni';
      toast.error(msg);
    } finally { setSaving(false); }
  };

  const openEditDialog = (alumni: AlumniDetailResponse) => {
    setSelectedAlumni(alumni);
    setFormData({
      alumniId: alumni.alumniId,
      alumniName: alumni.alumniName,
      rollNumber: alumni.rollNumber,
      programId: alumni.programId ?? undefined,
      specializationId: alumni.specializationId ?? undefined,
      graduationYear: alumni.graduationYear,
      personalEmail: alumni.personalEmail ?? undefined,
      mobileNumber: alumni.mobileNumber ?? undefined,
      currentCity: alumni.currentCity ?? undefined,
      currentCountry: alumni.currentCountry ?? 'India',
      linkedinProfile: alumni.linkedinProfile ?? undefined,
      alumniStatus: alumni.alumniStatus || 'Active',
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!departmentId || !selectedAlumni) return;
    setSaving(true);
    try {
      await alumniService.updateAlumni(departmentId, selectedAlumni.id, formData);
      toast.success('Alumni updated successfully');
      setEditDialogOpen(false);
      setSelectedAlumni(null);
      fetchAlumni(page, submittedSearch);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update alumni';
      toast.error(msg);
    } finally { setSaving(false); }
  };

  const openDeleteDialog = (alumni: AlumniDetailResponse) => { setSelectedAlumni(alumni); setDeleteDialogOpen(true); };

  const handleDelete = async () => {
    if (!departmentId || !selectedAlumni) return;
    setDeleting(true);
    try {
      await alumniService.deleteAlumni(departmentId, selectedAlumni.id);
      toast.success('Alumni deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedAlumni(null);
      fetchAlumni(page, submittedSearch);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete alumni';
      toast.error(msg);
    } finally { setDeleting(false); }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'Alumni ID', 'Alumni Name', 'Roll Number', 'Department', 'Program',
      'Specialization', 'Graduation Year', 'Personal Email', 'Mobile Number',
      'Current City', 'Current Country', 'LinkedIn Profile', 'Alumni Status',
    ];
    const sampleRow = [
      'ALM2020001', 'Rahul Verma', '16CS001', 'CSE', 'B.Tech', 'AI',
      '2020', 'rahul.verma@gmail.com', '9876543212', 'Bangalore', 'India',
      'https://linkedin.com/in/rahulverma', 'Active',
    ];
    const csvContent = `\ufeff${headers.join(',')}\n${sampleRow.join(',')}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'alumni_details_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePageChange = (newPage: number) => setPage(newPage);

  const getStatusBadge = (status: string) => {
    if (status === 'Active') return 'bg-emerald-500/10 text-emerald-600';
    if (status === 'Inactive') return 'bg-gray-500/10 text-gray-600';
    if (status === 'Unverified') return 'bg-amber-500/10 text-amber-600';
    if (status === 'Deceased') return 'bg-red-500/10 text-red-600';
    return 'bg-gray-500/10 text-gray-600';
  };

  if (!departmentId) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <p className="text-sm font-medium">Department ID not available</p>
          <p className="text-xs text-muted-foreground mt-1">Contact your administrator.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Alumni Details</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">{data ? `${data.totalElements} total` : '...'}</Badge>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => fetchAlumni(page, submittedSearch)} disabled={loading}>
                <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="text-xs h-8" onClick={openCreateDialog}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Alumni
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

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold">Alumni Records</CardTitle>
              <CardDescription className="text-xs">
                {loading ? 'Loading...' : data ? `Page ${data.page + 1} of ${totalPages} (${data.totalElements} records)` : ''}
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input className="h-8 text-xs pl-8 pr-8" placeholder="Search alumni..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyDown} />
              {searchQuery && (
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={handleClearSearch}>
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
                  <TableHead className="text-[10px] font-semibold w-24">Alumni ID</TableHead>
                  <TableHead className="text-[10px] font-semibold w-28">Name</TableHead>
                  <TableHead className="text-[10px] font-semibold w-16">Roll No.</TableHead>
                  <TableHead className="text-[10px] font-semibold w-14">Year</TableHead>
                  <TableHead className="text-[10px] font-semibold w-28">Email</TableHead>
                  <TableHead className="text-[10px] font-semibold w-16">Mobile</TableHead>
                  <TableHead className="text-[10px] font-semibold w-20">City</TableHead>
                  <TableHead className="text-[10px] font-semibold w-12">Status</TableHead>
                  <TableHead className="text-[10px] font-semibold text-center w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skel-${i}`}>
                    {Array.from({ length: 10 }).map((__, j) => (
                      <TableCell key={j} className={j === 0 ? 'text-center' : ''}>
                        <Skeleton className={`h-4 ${j === 0 ? 'w-4 mx-auto' : 'w-full'}`} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {!loading && error && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-destructive">
                        <AlertCircle className="h-8 w-8" />
                        <p className="text-xs font-medium">{error}</p>
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => fetchAlumni(page, submittedSearch)}>
                          <RefreshCw className="h-3 w-3 mr-1" /> Retry
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!loading && !error && (!data || data.content.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Users2 className="h-8 w-8 opacity-40" />
                        <p className="text-xs">{submittedSearch ? 'No alumni match your search.' : 'No alumni records available.'}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!loading && !error && data?.content.map((alumni, index) => (
                  <TableRow key={alumni.id} className="hover:bg-muted/20">
                    <TableCell className="text-[10px] text-center text-muted-foreground font-mono p-1.5">{data.page * data.size + index + 1}</TableCell>
                    <TableCell className="text-[10px] p-1.5 font-mono">{alumni.alumniId}</TableCell>
                    <TableCell className="text-xs p-1.5 font-medium">{alumni.alumniName}</TableCell>
                    <TableCell className="text-[10px] p-1.5 font-mono">{alumni.rollNumber}</TableCell>
                    <TableCell className="text-[10px] p-1.5">{alumni.graduationYear}</TableCell>
                    <TableCell className="text-[10px] p-1.5 truncate max-w-[110px]" title={alumni.personalEmail ?? ''}>{alumni.personalEmail || '-'}</TableCell>
                    <TableCell className="text-[10px] p-1.5">{alumni.mobileNumber || '-'}</TableCell>
                    <TableCell className="text-[10px] p-1.5">{alumni.currentCity || '-'}</TableCell>
                    <TableCell className="text-[10px] p-1.5">
                      <Badge variant="secondary" className={cn('text-[9px]', getStatusBadge(alumni.alumniStatus))}>{alumni.alumniStatus}</Badge>
                    </TableCell>
                    <TableCell className="text-center p-1.5">
                      <div className="flex items-center justify-center gap-0">
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => openEditDialog(alumni)} title="Edit">
                          <Pencil className="h-3 w-3 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => openDeleteDialog(alumni)} title="Delete">
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {data && data.totalPages > 1 && (
            <div className="p-3 border-t">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => handlePageChange(Math.max(0, page - 1))}
                      className={cn(page === 0 && 'pointer-events-none opacity-50', 'cursor-pointer')} />
                  </PaginationItem>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) pageNum = i;
                    else if (page <= 2) pageNum = i;
                    else if (page >= totalPages - 3) pageNum = totalPages - 5 + i;
                    else pageNum = page - 2 + i;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink onClick={() => handlePageChange(pageNum)} isActive={pageNum === page} className="cursor-pointer">{pageNum + 1}</PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
                      className={cn(page >= totalPages - 1 && 'pointer-events-none opacity-50', 'cursor-pointer')} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── CREATE DIALOG ── */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Add Alumni</DialogTitle>
            <DialogDescription className="text-xs">Fill in the details. Required fields marked with *.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Alumni ID *</Label>
                <Input className="h-9 text-xs" placeholder="e.g. ALM2020001" value={formData.alumniId}
                  onChange={(e) => setFormData(prev => ({ ...prev, alumniId: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Alumni Name *</Label>
                <Input className="h-9 text-xs" placeholder="Full name" value={formData.alumniName}
                  onChange={(e) => setFormData(prev => ({ ...prev, alumniName: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Roll Number *</Label>
                <Input className="h-9 text-xs" placeholder="e.g. 16CS001" value={formData.rollNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Graduation Year *</Label>
                <Input className="h-9 text-xs" placeholder="e.g. 2020" value={formData.graduationYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, graduationYear: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Personal Email</Label>
                <Input className="h-9 text-xs" type="email" placeholder="email@example.com" value={formData.personalEmail || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, personalEmail: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Mobile Number</Label>
                <Input className="h-9 text-xs" placeholder="e.g. 9876543210" value={formData.mobileNumber || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Current City</Label>
                <Input className="h-9 text-xs" placeholder="e.g. Bangalore" value={formData.currentCity || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentCity: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Current Country</Label>
                <Input className="h-9 text-xs" placeholder="e.g. India" value={formData.currentCountry || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentCountry: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">LinkedIn Profile</Label>
                <Input className="h-9 text-xs" placeholder="https://linkedin.com/in/..." value={formData.linkedinProfile || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedinProfile: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Alumni Status</Label>
                <Select value={formData.alumniStatus || 'Active'}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, alumniStatus: v }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {ALUMNI_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button size="sm" className="text-xs" onClick={handleCreate}
              disabled={saving || !formData.alumniId || !formData.alumniName || !formData.rollNumber || !formData.graduationYear}>
              {saving ? 'Creating...' : 'Create Alumni'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── EDIT DIALOG ── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Edit Alumni</DialogTitle>
            <DialogDescription className="text-xs">Update alumni details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Alumni ID</Label>
                <Input className="h-9 text-xs" value={formData.alumniId}
                  onChange={(e) => setFormData(prev => ({ ...prev, alumniId: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Name</Label>
                <Input className="h-9 text-xs" value={formData.alumniName}
                  onChange={(e) => setFormData(prev => ({ ...prev, alumniName: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Roll Number</Label>
                <Input className="h-9 text-xs" value={formData.rollNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Graduation Year</Label>
                <Input className="h-9 text-xs" value={formData.graduationYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, graduationYear: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Email</Label>
                <Input className="h-9 text-xs" type="email" value={formData.personalEmail || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, personalEmail: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Mobile</Label>
                <Input className="h-9 text-xs" value={formData.mobileNumber || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">City</Label>
                <Input className="h-9 text-xs" value={formData.currentCity || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentCity: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Country</Label>
                <Input className="h-9 text-xs" value={formData.currentCountry || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentCountry: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">LinkedIn</Label>
                <Input className="h-9 text-xs" value={formData.linkedinProfile || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedinProfile: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Status</Label>
                <Select value={formData.alumniStatus || 'Active'}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, alumniStatus: v }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {ALUMNI_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

      {/* ── DELETE CONFIRMATION ── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Delete Alumni</DialogTitle>
            <DialogDescription className="text-xs">
              Delete <strong>{selectedAlumni?.alumniName}</strong> (ID: {selectedAlumni?.alumniId})? This cannot be undone.
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

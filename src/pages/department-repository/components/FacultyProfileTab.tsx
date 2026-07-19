import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { facultyService } from '@/services/faculty.service';
import { FacultyProfileResponse, CreateFacultyRequest, UpdateFacultyRequest, PaginatedData } from '@/types/faculty.types';
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
  PaginationEllipsis,
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
  FileText,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ── Enum mapping helpers (API enum values → display values) ──

const GENDER_MAP: Record<string, string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
};

const DESIGNATION_MAP: Record<string, string> = {
  PROFESSOR: 'Professor',
  ASSOCIATE_PROFESSOR: 'Associate Professor',
  ASSISTANT_PROFESSOR: 'Assistant Professor',
};

const STATUS_MAP: Record<string, string> = {
  ACTIVE: 'Active',
  RELIEVED: 'Relieved',
};

const REVERSE_GENDER: Record<string, string> = { Male: 'MALE', Female: 'FEMALE', Other: 'OTHER' };
const REVERSE_DESIGNATION: Record<string, string> = {
  Professor: 'PROFESSOR',
  'Associate Professor': 'ASSOCIATE_PROFESSOR',
  'Assistant Professor': 'ASSISTANT_PROFESSOR',
};
const REVERSE_STATUS: Record<string, string> = { Active: 'ACTIVE', Relieved: 'RELIEVED' };

const PAGE_SIZE = 20;

// ── Empty faculty form for the Create dialog ──

const emptyFacultyForm = (): CreateFacultyRequest => ({
  employeeId: '',
  facultyName: '',
  gender: undefined,
  dateOfBirth: undefined,
  panNumber: undefined,
  officialEmail: undefined,
  personalEmail: undefined,
  mobileNumber: undefined,
  designation: undefined,
  status: 'ACTIVE',
});

type FacultyForm = CreateFacultyRequest;

export const FacultyProfileTab = () => {
  const { user } = useAuth();
  const departmentId = user?.departmentId ?? 0;

  // Data state
  const [data, setData] = useState<PaginatedData<FacultyProfileResponse> | null>(null);
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
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyProfileResponse | null>(null);

  // Form state
  const [formData, setFormData] = useState<FacultyForm>(emptyFacultyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch faculty profiles from API ──

  const fetchProfiles = useCallback(async (currentPage: number, search?: string) => {
    if (!departmentId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await facultyService.listProfiles(departmentId, {
        page: currentPage,
        size: PAGE_SIZE,
        search: search || undefined,
      });
      setData(result);
      setTotalPages(result.totalPages);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load faculty profiles';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  // Fetch profiles when page or submitted search changes
  useEffect(() => {
    fetchProfiles(page, submittedSearch);
  }, [departmentId, page, submittedSearch, fetchProfiles]);

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
    setFormData(emptyFacultyForm());
    setCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!departmentId) return;
    setSaving(true);
    try {
      const payload: CreateFacultyRequest = {
        ...formData,
        gender: formData.gender ? REVERSE_GENDER[formData.gender] : undefined,
        designation: formData.designation ? REVERSE_DESIGNATION[formData.designation] : undefined,
        status: formData.status ? REVERSE_STATUS[formData.status] || formData.status : 'ACTIVE',
      };
      await facultyService.createProfile(departmentId, payload);
      toast.success('Faculty profile created successfully');
      setCreateDialogOpen(false);
      fetchProfiles(page, searchQuery);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create faculty profile';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Edit ──

  const openEditDialog = (faculty: FacultyProfileResponse) => {
    setSelectedFaculty(faculty);
    setFormData({
      employeeId: faculty.employeeId,
      facultyName: faculty.facultyName,
      gender: faculty.gender ? GENDER_MAP[faculty.gender] || faculty.gender : undefined,
      dateOfBirth: faculty.dateOfBirth ?? undefined,
      panNumber: faculty.panNumber ?? undefined,
      officialEmail: faculty.officialEmail ?? undefined,
      personalEmail: faculty.personalEmail ?? undefined,
      mobileNumber: faculty.mobileNumber ?? undefined,
      designation: faculty.designation ? DESIGNATION_MAP[faculty.designation] || faculty.designation : undefined,
      status: faculty.status ? STATUS_MAP[faculty.status] || faculty.status : 'ACTIVE',
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!departmentId || !selectedFaculty) return;
    setSaving(true);
    try {
      const payload: UpdateFacultyRequest = {
        ...formData,
        gender: formData.gender ? REVERSE_GENDER[formData.gender] : undefined,
        designation: formData.designation ? REVERSE_DESIGNATION[formData.designation] : undefined,
        status: formData.status ? REVERSE_STATUS[formData.status] || formData.status : undefined,
      };
      await facultyService.updateProfile(departmentId, selectedFaculty.id, payload);
      toast.success('Faculty profile updated successfully');
      setEditDialogOpen(false);
      setSelectedFaculty(null);
      fetchProfiles(page, searchQuery);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update faculty profile';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──

  const openDeleteDialog = (faculty: FacultyProfileResponse) => {
    setSelectedFaculty(faculty);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!departmentId || !selectedFaculty) return;
    setDeleting(true);
    try {
      await facultyService.deleteProfile(departmentId, selectedFaculty.id);
      toast.success('Faculty profile deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedFaculty(null);
      fetchProfiles(page, searchQuery);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete faculty profile';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // ── Download Template ──

  const handleDownloadTemplate = () => {
    const headers = [
      'Employee ID',
      'Faculty Name',
      'Gender',
      'Date of Birth',
      'PAN Number',
      'Official Email',
      'Personal Email',
      'Mobile Number',
      'Academic Unit',
      'Designation',
      'Status',
    ];

    const sampleRow = [
      'EMP010',
      'Dr. Sample Faculty',
      'Male',
      '1990-01-15',
      'ABCDE1234F',
      'faculty@institution.edu',
      'faculty@gmail.com',
      '9876543210',
      user?.department || 'CSE',
      'Professor',
      'Active',
    ];

    const csvContent = `\ufeff${headers.join(',')}\n${sampleRow.join(',')}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'faculty_profiles_template.csv';
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

  const formatDesignation = (val: string | null | undefined): string =>
    val ? (DESIGNATION_MAP[val] || val) : '-';

  const formatStatus = (val: string | null | undefined): string =>
    val ? (STATUS_MAP[val] || val) : '-';

  const formatGender = (val: string | null | undefined): string =>
    val ? (GENDER_MAP[val] || val) : '-';

  const getWorkflowBadgeVariant = (status: string | null | undefined) => {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-500/10 text-emerald-600';
      case 'REJECTED': return 'bg-red-500/10 text-red-600';
      case 'HOD_REVIEW':
      case 'IQAC_VERIFICATION': return 'bg-blue-500/10 text-blue-600';
      case 'SUBMITTED':
      case 'VALIDATED': return 'bg-indigo-500/10 text-indigo-600';
      default: return 'bg-amber-500/10 text-amber-600';
    }
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
            <CardTitle className="text-sm font-semibold">Faculty Profiles</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                {data ? `${data.totalElements} total` : '...'}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => fetchProfiles(page, searchQuery)}
                disabled={loading}
              >
                <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="h-8 text-xs pl-8 pr-8"
                placeholder="Search by name or employee ID..."
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
            <Button variant="secondary" size="sm" className="text-xs h-8" onClick={handleSearch}>
              <Search className="h-3.5 w-3.5 mr-1" /> Search
            </Button>
            <Button size="sm" className="text-xs h-8" onClick={openCreateDialog}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Faculty
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleDownloadTemplate}>
              <Download className="h-3.5 w-3.5 mr-1" /> Download Template
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8">
              <Upload className="h-3.5 w-3.5 mr-1" /> Upload CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Faculty Data Table ── */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Faculty Records</CardTitle>
          <CardDescription className="text-xs">
            {loading
              ? 'Loading faculty data...'
              : data
                ? `Showing page ${data.page + 1} of ${totalPages} (${data.totalElements} records)`
                : 'No data loaded'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-[10px] font-semibold w-8 text-center">#</TableHead>
                  <TableHead className="text-[10px] font-semibold">Employee ID</TableHead>
                  <TableHead className="text-[10px] font-semibold">Faculty Name</TableHead>
                  <TableHead className="text-[10px] font-semibold">Gender</TableHead>
                  <TableHead className="text-[10px] font-semibold">Date of Birth</TableHead>
                  <TableHead className="text-[10px] font-semibold">PAN Number</TableHead>
                  <TableHead className="text-[10px] font-semibold">Official Email</TableHead>
                  <TableHead className="text-[10px] font-semibold">Personal Email</TableHead>
                  <TableHead className="text-[10px] font-semibold">Mobile</TableHead>
                  <TableHead className="text-[10px] font-semibold">Academic Unit</TableHead>
                  <TableHead className="text-[10px] font-semibold">Designation</TableHead>
                  <TableHead className="text-[10px] font-semibold">Status</TableHead>
                  <TableHead className="text-[10px] font-semibold text-center w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Loading skeleton */}
                {loading && (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell className="text-center"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                    </TableRow>
                  ))
                )}

                {/* Error state */}
                {!loading && error && (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-destructive">
                        <AlertCircle className="h-8 w-8" />
                        <p className="text-xs font-medium">{error}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => fetchProfiles(page, searchQuery)}
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
                    <TableCell colSpan={14} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <User className="h-8 w-8 opacity-40" />
                        <p className="text-xs">
                          {searchQuery
                            ? 'No faculty match your search. Try a different query.'
                            : 'No faculty profiles available. Add one to get started.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Data rows */}
                {!loading && !error && data?.content.map((faculty, index) => (
                  <TableRow key={faculty.id} className="hover:bg-muted/20">
                    <TableCell className="text-[10px] text-center text-muted-foreground font-mono p-1.5">
                      {data.page * data.size + index + 1}
                    </TableCell>
                    <TableCell className="text-[10px] p-1.5 font-mono">{faculty.employeeId}</TableCell>
                    <TableCell className="text-xs p-1.5 font-medium">{faculty.facultyName}</TableCell>
                    <TableCell className="text-[10px] p-1.5">{formatGender(faculty.gender)}</TableCell>
                    <TableCell className="text-[10px] p-1.5">{faculty.dateOfBirth || '-'}</TableCell>
                    <TableCell className="text-[10px] p-1.5">{faculty.panNumber || '-'}</TableCell>
                    <TableCell className="text-[10px] p-1.5 truncate max-w-[140px]">{faculty.officialEmail || '-'}</TableCell>
                    <TableCell className="text-[10px] p-1.5 truncate max-w-[140px]">{faculty.personalEmail || '-'}</TableCell>
                    <TableCell className="text-[10px] p-1.5">{faculty.mobileNumber || '-'}</TableCell>
                    <TableCell className="text-[10px] p-1.5">{user?.department || '-'}</TableCell>
                    <TableCell className="text-[10px] p-1.5">
                      <Badge variant="outline" className="text-[9px] font-normal">
                        {formatDesignation(faculty.designation)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[10px] p-1.5">
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-[9px]',
                          faculty.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-gray-500/10 text-gray-600'
                        )}
                      >
                        {formatStatus(faculty.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center p-1.5">
                      <div className="flex items-center justify-center gap-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => openEditDialog(faculty)}
                          title="Edit"
                        >
                          <Pencil className="h-3 w-3 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => openDeleteDialog(faculty)}
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
                      className={cn(page === 0 && 'pointer-events-none opacity-50', 'cursor-pointer')}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (page <= 2) {
                      pageNum = i;
                    } else if (page >= totalPages - 3) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
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
                      className={cn(page >= totalPages - 1 && 'pointer-events-none opacity-50', 'cursor-pointer')}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Upload History / Summary Card ── */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Quick Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-sm font-bold">{data?.totalElements ?? '-'}</p>
              <p className="text-[9px] text-muted-foreground">Total Faculty</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/5 text-center">
              <p className="text-sm font-bold text-emerald-600">
                {data ? data.content.filter(f => f.status === 'ACTIVE').length : '-'}
              </p>
              <p className="text-[9px] text-muted-foreground">Active</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-500/5 text-center">
              <p className="text-sm font-bold text-gray-600">
                {data ? data.content.filter(f => f.status === 'RELIEVED').length : '-'}
              </p>
              <p className="text-[9px] text-muted-foreground">Relieved</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/5 text-center">
              <p className="text-sm font-bold text-blue-600">{totalPages}</p>
              <p className="text-[9px] text-muted-foreground">Total Pages</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ════════════════════════════════════════════════ */}
      {/* CREATE DIALOG */}
      {/* ════════════════════════════════════════════════ */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Add Faculty Profile</DialogTitle>
            <DialogDescription className="text-xs">
              Fill in the details to create a new faculty profile. Required fields are marked with *.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Employee ID *</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="e.g. EMP010"
                  value={formData.employeeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Faculty Name *</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="Full name"
                  value={formData.facultyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, facultyName: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Gender</Label>
                <Select
                  value={formData.gender || ''}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, gender: v || undefined }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male" className="text-xs">Male</SelectItem>
                    <SelectItem value="Female" className="text-xs">Female</SelectItem>
                    <SelectItem value="Other" className="text-xs">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Date of Birth</Label>
                <Input
                  className="h-9 text-xs"
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">PAN Number</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="e.g. ABCPK1234A"
                  value={formData.panNumber || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, panNumber: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Mobile Number</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="e.g. 9876543210"
                  value={formData.mobileNumber || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Official Email</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="email@institution.edu"
                  type="email"
                  value={formData.officialEmail || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, officialEmail: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Personal Email</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="personal@email.com"
                  type="email"
                  value={formData.personalEmail || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, personalEmail: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Designation</Label>
                <Select
                  value={formData.designation || ''}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, designation: v || undefined }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Professor" className="text-xs">Professor</SelectItem>
                    <SelectItem value="Associate Professor" className="text-xs">Associate Professor</SelectItem>
                    <SelectItem value="Assistant Professor" className="text-xs">Assistant Professor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Status</Label>
                <Select
                  value={formData.status || 'ACTIVE'}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE" className="text-xs">Active</SelectItem>
                    <SelectItem value="RELIEVED" className="text-xs">Relieved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs"
              onClick={handleCreate}
              disabled={saving || !formData.employeeId || !formData.facultyName}
            >
              {saving ? 'Creating...' : 'Create Profile'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════════════ */}
      {/* EDIT DIALOG */}
      {/* ════════════════════════════════════════════════ */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Edit Faculty Profile</DialogTitle>
            <DialogDescription className="text-xs">
              Update faculty details. Leave a field empty to keep its current value.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Employee ID</Label>
                <Input
                  className="h-9 text-xs"
                  value={formData.employeeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Faculty Name</Label>
                <Input
                  className="h-9 text-xs"
                  value={formData.facultyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, facultyName: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Gender</Label>
                <Select
                  value={formData.gender || ''}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, gender: v || undefined }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male" className="text-xs">Male</SelectItem>
                    <SelectItem value="Female" className="text-xs">Female</SelectItem>
                    <SelectItem value="Other" className="text-xs">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Date of Birth</Label>
                <Input
                  className="h-9 text-xs"
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">PAN Number</Label>
                <Input
                  className="h-9 text-xs"
                  value={formData.panNumber || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, panNumber: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Mobile Number</Label>
                <Input
                  className="h-9 text-xs"
                  value={formData.mobileNumber || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Official Email</Label>
                <Input
                  className="h-9 text-xs"
                  type="email"
                  value={formData.officialEmail || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, officialEmail: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Personal Email</Label>
                <Input
                  className="h-9 text-xs"
                  type="email"
                  value={formData.personalEmail || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, personalEmail: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Designation</Label>
                <Select
                  value={formData.designation || ''}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, designation: v || undefined }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Professor" className="text-xs">Professor</SelectItem>
                    <SelectItem value="Associate Professor" className="text-xs">Associate Professor</SelectItem>
                    <SelectItem value="Assistant Professor" className="text-xs">Assistant Professor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Status</Label>
                <Select
                  value={formData.status || 'ACTIVE'}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE" className="text-xs">Active</SelectItem>
                    <SelectItem value="RELIEVED" className="text-xs">Relieved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs"
              onClick={handleUpdate}
              disabled={saving || !formData.employeeId || !formData.facultyName}
            >
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
            <DialogTitle className="text-sm">Delete Faculty Profile</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete <strong>{selectedFaculty?.facultyName}</strong> (ID: {selectedFaculty?.employeeId})? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setDeleteDialogOpen(false)}>
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

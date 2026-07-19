import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { studentService } from '@/services/student.service';
import { StudentProfileResponse, CreateStudentRequest, PaginatedData } from '@/types/student.types';
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
  Users,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

// ── Empty student form ──

const emptyStudentForm = (): CreateStudentRequest => ({
  registrationNumber: '',
  studentId: '',
  rollNumber: '',
  studentName: '',
  gender: undefined,
  dateOfBirth: undefined,
  aadhaarNumber: undefined,
  emailAddress: undefined,
  mobileNumber: undefined,
  programOfferingId: 0,
  currentSemester: undefined,
  studentStatus: 'Active',
});

type StudentForm = CreateStudentRequest;

export const StudentProfileTab = () => {
  const { user } = useAuth();
  const departmentId = user?.departmentId ?? 0;

  // Data state
  const [data, setData] = useState<PaginatedData<StudentProfileResponse> | null>(null);
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
  const [selectedStudent, setSelectedStudent] = useState<StudentProfileResponse | null>(null);

  // Form state
  const [formData, setFormData] = useState<StudentForm>(emptyStudentForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch student profiles from API ──

  const fetchProfiles = useCallback(async (currentPage: number, search?: string) => {
    if (!departmentId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await studentService.listProfiles(departmentId, {
        page: currentPage,
        size: PAGE_SIZE,
        search: search || undefined,
      });
      setData(result);
      setTotalPages(result.totalPages);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load student profiles';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

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
    setFormData(emptyStudentForm());
    setCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!departmentId) return;
    if (!formData.registrationNumber || !formData.studentId || !formData.rollNumber || !formData.studentName || !formData.programOfferingId) {
      toast.error('Registration Number, Student ID, Roll Number, Student Name, and Program are required');
      return;
    }
    setSaving(true);
    try {
      await studentService.createProfile(departmentId, formData);
      toast.success('Student profile created successfully');
      setCreateDialogOpen(false);
      fetchProfiles(page, searchQuery);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create student profile';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Edit ──

  const openEditDialog = (student: StudentProfileResponse) => {
    setSelectedStudent(student);
    setFormData({
      registrationNumber: student.registrationNumber,
      studentId: student.studentId,
      rollNumber: student.rollNumber,
      studentName: student.studentName,
      gender: student.gender ?? undefined,
      dateOfBirth: student.dateOfBirth ?? undefined,
      aadhaarNumber: student.aadhaarNumber ?? undefined,
      emailAddress: student.emailAddress ?? undefined,
      mobileNumber: student.mobileNumber ?? undefined,
      programOfferingId: student.programOfferingId ?? 0,
      currentSemester: student.currentSemester ?? undefined,
      studentStatus: student.studentStatus || 'Active',
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!departmentId || !selectedStudent) return;
    setSaving(true);
    try {
      await studentService.updateProfile(departmentId, selectedStudent.id, formData);
      toast.success('Student profile updated successfully');
      setEditDialogOpen(false);
      setSelectedStudent(null);
      fetchProfiles(page, searchQuery);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update student profile';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──

  const openDeleteDialog = (student: StudentProfileResponse) => {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!departmentId || !selectedStudent) return;
    setDeleting(true);
    try {
      await studentService.deleteProfile(departmentId, selectedStudent.id);
      toast.success('Student profile deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedStudent(null);
      fetchProfiles(page, searchQuery);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete student profile';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // ── Download Template ──

  const handleDownloadTemplate = () => {
    const headers = [
      'Student Registration Number',
      'Student ID',
      'Roll Number',
      'Student Name',
      'Gender',
      'Date of Birth',
      'Aadhaar Number',
      'Email Address',
      'Mobile Number',
      'Academic Unit',
      'Program',
      'Current Semester/Year',
      'Student Status',
    ];

    const sampleRow = [
      'REG2025001',
      'STU001',
      '25CS001',
      'Sample Student',
      'Male',
      '2003-01-15',
      '1234-5678-9012',
      'student@institution.edu',
      '9876543210',
      user?.department || 'CSE',
      'B.Tech CSE AI R22',
      '3',
      'Active',
    ];

    const csvContent = `\ufeff${headers.join(',')}\n${sampleRow.join(',')}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_profiles_template.csv';
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

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500/10 text-emerald-600';
      case 'Graduated': return 'bg-blue-500/10 text-blue-600';
      case 'Discontinued': return 'bg-red-500/10 text-red-600';
      default: return 'bg-gray-500/10 text-gray-600';
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
            <CardTitle className="text-sm font-semibold">Student Profiles</CardTitle>
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
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="text-xs h-8" onClick={openCreateDialog}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Student
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
              <CardTitle className="text-sm font-semibold">Student Records</CardTitle>
              <CardDescription className="text-xs">
                {loading
                  ? 'Loading student data...'
                  : data
                    ? `Showing page ${data.page + 1} of ${totalPages} (${data.totalElements} records)`
                    : 'No data loaded'}
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="h-8 text-xs pl-8 pr-8"
                placeholder="Search records..."
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
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-[10px] font-semibold w-8 text-center">#</TableHead>
                  <TableHead className="text-[10px] font-semibold">Student Registration Number</TableHead>
                  <TableHead className="text-[10px] font-semibold">Student ID</TableHead>
                  <TableHead className="text-[10px] font-semibold">Roll Number</TableHead>
                  <TableHead className="text-[10px] font-semibold">Student Name</TableHead>
                  <TableHead className="text-[10px] font-semibold">Gender</TableHead>
                  <TableHead className="text-[10px] font-semibold">Date of Birth</TableHead>
                  <TableHead className="text-[10px] font-semibold">Aadhaar Number</TableHead>
                  <TableHead className="text-[10px] font-semibold">Email</TableHead>
                  <TableHead className="text-[10px] font-semibold">Mobile</TableHead>
                  <TableHead className="text-[10px] font-semibold">Academic Unit</TableHead>
                  <TableHead className="text-[10px] font-semibold">Program</TableHead>
                  <TableHead className="text-[10px] font-semibold">Current Semester</TableHead>
                  <TableHead className="text-[10px] font-semibold">Status</TableHead>
                  <TableHead className="text-[10px] font-semibold text-center w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Loading skeleton */}
                {loading && (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skel-${i}`}>
                      <TableCell className="text-center"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                    </TableRow>
                  ))
                )}

                {/* Error state */}
                {!loading && error && (
                  <TableRow>
                    <TableCell colSpan={15} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-destructive">
                        <AlertCircle className="h-8 w-8" />
                        <p className="text-xs font-medium">{error}</p>
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => fetchProfiles(page, searchQuery)}>
                          <RefreshCw className="h-3 w-3 mr-1" /> Retry
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Empty state */}
                {!loading && !error && (!data || data.content.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={15} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Users className="h-8 w-8 opacity-40" />
                        <p className="text-xs">
                          {submittedSearch
                            ? 'No students match your search. Try a different query.'
                            : 'No student profiles available. Add one to get started.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Data rows */}
                {!loading && !error && data?.content.map((student, index) => (
                  <TableRow key={student.id} className="hover:bg-muted/20">
                    <TableCell className="text-[10px] text-center text-muted-foreground font-mono p-1.5">
                      {data.page * data.size + index + 1}
                    </TableCell>
                    <TableCell className="text-[10px] p-1.5 font-mono">{student.registrationNumber}</TableCell>
                    <TableCell className="text-[10px] p-1.5 font-mono">{student.studentId}</TableCell>
                    <TableCell className="text-[10px] p-1.5 font-mono">{student.rollNumber}</TableCell>
                    <TableCell className="text-xs p-1.5 font-medium">{student.studentName}</TableCell>
                    <TableCell className="text-[10px] p-1.5">{student.gender || '-'}</TableCell>
                    <TableCell className="text-[10px] p-1.5">{student.dateOfBirth || '-'}</TableCell>
                    <TableCell className="text-[10px] p-1.5 font-mono">{student.aadhaarNumber || '-'}</TableCell>
                    <TableCell className="text-[10px] p-1.5 truncate max-w-[140px]">{student.emailAddress || '-'}</TableCell>
                    <TableCell className="text-[10px] p-1.5">{student.mobileNumber || '-'}</TableCell>
                    <TableCell className="text-[10px] p-1.5">{user?.department || '-'}</TableCell>
                    <TableCell className="text-[10px] p-1.5">
                      <Badge variant="outline" className="text-[9px] font-normal">
                        {student.programOfferingId ? `ID: ${student.programOfferingId}` : '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[10px] p-1.5 font-mono">{student.currentSemester ?? '-'}</TableCell>
                    <TableCell className="text-[10px] p-1.5">
                      <Badge variant="secondary" className={cn('text-[9px]', getStatusBadgeStyle(student.studentStatus))}>
                        {student.studentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center p-1.5">
                      <div className="flex items-center justify-center gap-0">
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => openEditDialog(student)} title="Edit">
                          <Pencil className="h-3 w-3 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => openDeleteDialog(student)} title="Delete">
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
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Add Student Profile</DialogTitle>
            <DialogDescription className="text-xs">
              Fill in the details to create a new student profile. Required fields are marked with *.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Registration Number *</Label>
                <Input className="h-9 text-xs" placeholder="e.g. REG2025001" value={formData.registrationNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Student ID *</Label>
                <Input className="h-9 text-xs" placeholder="e.g. STU001" value={formData.studentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Roll Number *</Label>
                <Input className="h-9 text-xs" placeholder="e.g. 25CS001" value={formData.rollNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Student Name *</Label>
                <Input className="h-9 text-xs" placeholder="Full name" value={formData.studentName}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Gender</Label>
                <Select value={formData.gender || ''} onValueChange={(v) => setFormData(prev => ({ ...prev, gender: v || undefined }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male" className="text-xs">Male</SelectItem>
                    <SelectItem value="Female" className="text-xs">Female</SelectItem>
                    <SelectItem value="Other" className="text-xs">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Date of Birth</Label>
                <Input className="h-9 text-xs" type="date" value={formData.dateOfBirth || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Aadhaar Number</Label>
                <Input className="h-9 text-xs" placeholder="e.g. 1234-5678-9012" value={formData.aadhaarNumber || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, aadhaarNumber: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Mobile Number</Label>
                <Input className="h-9 text-xs" placeholder="e.g. 9876543210" value={formData.mobileNumber || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Email Address</Label>
                <Input className="h-9 text-xs" type="email" placeholder="student@institution.edu" value={formData.emailAddress || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, emailAddress: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Program Offering ID *</Label>
                <Input className="h-9 text-xs" type="number" placeholder="e.g. 5" value={formData.programOfferingId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, programOfferingId: parseInt(e.target.value, 10) || 0 }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Current Semester</Label>
                <Input className="h-9 text-xs" type="number" placeholder="e.g. 3" min={1} max={8}
                  value={formData.currentSemester ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentSemester: e.target.value ? parseInt(e.target.value, 10) : undefined }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Student Status</Label>
                <Select value={formData.studentStatus || 'Active'} onValueChange={(v) => setFormData(prev => ({ ...prev, studentStatus: v }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active" className="text-xs">Active</SelectItem>
                    <SelectItem value="Graduated" className="text-xs">Graduated</SelectItem>
                    <SelectItem value="Discontinued" className="text-xs">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button size="sm" className="text-xs" onClick={handleCreate}
              disabled={saving || !formData.registrationNumber || !formData.studentId || !formData.rollNumber || !formData.studentName || !formData.programOfferingId}>
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
            <DialogTitle className="text-sm">Edit Student Profile</DialogTitle>
            <DialogDescription className="text-xs">Update student details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Registration Number</Label>
                <Input className="h-9 text-xs" value={formData.registrationNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Student ID</Label>
                <Input className="h-9 text-xs" value={formData.studentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Roll Number</Label>
                <Input className="h-9 text-xs" value={formData.rollNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Student Name</Label>
                <Input className="h-9 text-xs" value={formData.studentName}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Gender</Label>
                <Select value={formData.gender || ''} onValueChange={(v) => setFormData(prev => ({ ...prev, gender: v || undefined }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male" className="text-xs">Male</SelectItem>
                    <SelectItem value="Female" className="text-xs">Female</SelectItem>
                    <SelectItem value="Other" className="text-xs">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Date of Birth</Label>
                <Input className="h-9 text-xs" type="date" value={formData.dateOfBirth || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Aadhaar Number</Label>
                <Input className="h-9 text-xs" value={formData.aadhaarNumber || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, aadhaarNumber: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Mobile Number</Label>
                <Input className="h-9 text-xs" value={formData.mobileNumber || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Email Address</Label>
                <Input className="h-9 text-xs" type="email" value={formData.emailAddress || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, emailAddress: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Program Offering ID</Label>
                <Input className="h-9 text-xs" type="number" value={formData.programOfferingId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, programOfferingId: parseInt(e.target.value, 10) || 0 }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Current Semester</Label>
                <Input className="h-9 text-xs" type="number" min={1} max={8} value={formData.currentSemester ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentSemester: e.target.value ? parseInt(e.target.value, 10) : undefined }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Student Status</Label>
                <Select value={formData.studentStatus || 'Active'} onValueChange={(v) => setFormData(prev => ({ ...prev, studentStatus: v }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active" className="text-xs">Active</SelectItem>
                    <SelectItem value="Graduated" className="text-xs">Graduated</SelectItem>
                    <SelectItem value="Discontinued" className="text-xs">Discontinued</SelectItem>
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

      {/* ════════════════════════════════════════════════ */}
      {/* DELETE CONFIRMATION DIALOG */}
      {/* ════════════════════════════════════════════════ */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Delete Student Profile</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete <strong>{selectedStudent?.studentName}</strong> (ID: {selectedStudent?.studentId})? This action cannot be undone.
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

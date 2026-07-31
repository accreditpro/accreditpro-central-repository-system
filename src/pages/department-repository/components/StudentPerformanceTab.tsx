import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { studentService } from '@/services/student.service';
import {
  StudentProfileResponse,
  PerformanceResponse,
  CreatePerformanceRequest,
} from '@/types/student.types';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Plus,
  Pencil,
  Download,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ── Constants ──

const ACADEMIC_YEAR_OPTIONS = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22'];
const GRADUATION_STATUS_OPTIONS = ['Graduated', 'Continuing'];
const SEMESTER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

// ── Empty form ──

const emptyPerformanceForm = (): CreatePerformanceRequest => ({
  semester: 1,
  sgpa: undefined,
  cgpa: undefined,
  backlogCount: 0,
  attendancePercentage: undefined,
  academicYearId: undefined,
  graduationStatus: undefined,
});

type PerformanceForm = CreatePerformanceRequest;

export const StudentPerformanceTab = () => {
  const { user } = useAuth();
  const departmentId = user?.departmentId ?? 0;

  // Student selector
  const [students, setStudents] = useState<StudentProfileResponse[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Performance data
  const [performances, setPerformances] = useState<PerformanceResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPerformance, setSelectedPerformance] = useState<PerformanceResponse | null>(null);

  // Form
  const [formData, setFormData] = useState<PerformanceForm>(emptyPerformanceForm());
  const [saving, setSaving] = useState(false);

  // ── Fetch student list ──

  useEffect(() => {
    if (!departmentId) return;
    setStudentsLoading(true);
    studentService
      .listProfiles(departmentId, { size: 500 })
      .then(result => {
        setStudents(result.content);
        if (result.content.length === 1) {
          setSelectedStudentId(result.content[0].id);
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to load students';
        toast.error(msg);
      })
      .finally(() => setStudentsLoading(false));
  }, [departmentId]);

  // ── Fetch performances for selected student ──

  const fetchPerformances = useCallback(
    async (studentId: number) => {
      if (!departmentId) return;
      setLoading(true);
      setError(null);
      try {
        const result = await studentService.listPerformances(departmentId, studentId);
        setPerformances(result);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load performances';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [departmentId]
  );

  useEffect(() => {
    if (selectedStudentId) {
      fetchPerformances(selectedStudentId);
    }
  }, [selectedStudentId, fetchPerformances]);

  // ── Search filtering ──

  const performanceMatchesSearch = (p: PerformanceResponse, query: string): boolean => {
    const q = query.toLowerCase();
    return (
      String(p.semester).includes(q) ||
      String(p.sgpa ?? '').includes(q) ||
      String(p.cgpa ?? '').includes(q) ||
      String(p.backlogCount).includes(q) ||
      String(p.attendancePercentage ?? '').includes(q) ||
      (p.graduationStatus?.toLowerCase().includes(q) ?? false)
    );
  };

  const filteredPerformances = searchQuery
    ? performances.filter(p => performanceMatchesSearch(p, searchQuery))
    : performances;

  // ── Create ──

  const openCreateDialog = () => {
    setFormData(emptyPerformanceForm());
    setCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!departmentId || !selectedStudentId) return;
    if (!formData.semester) {
      toast.error('Semester is required');
      return;
    }
    setSaving(true);
    try {
      await studentService.addPerformance(departmentId, selectedStudentId, formData);
      toast.success('Performance record added successfully');
      setCreateDialogOpen(false);
      fetchPerformances(selectedStudentId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add performance record';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Edit ──

  const openEditDialog = (performance: PerformanceResponse) => {
    setSelectedPerformance(performance);
    setFormData({
      semester: performance.semester,
      sgpa: performance.sgpa ?? undefined,
      cgpa: performance.cgpa ?? undefined,
      backlogCount: performance.backlogCount,
      attendancePercentage: performance.attendancePercentage ?? undefined,
      academicYearId: performance.academicYearId ?? undefined,
      graduationStatus: performance.graduationStatus ?? undefined,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!departmentId || !selectedStudentId || !selectedPerformance) return;
    setSaving(true);
    try {
      await studentService.updatePerformance(
        departmentId,
        selectedStudentId,
        selectedPerformance.id,
        formData
      );
      toast.success('Performance record updated successfully');
      setEditDialogOpen(false);
      setSelectedPerformance(null);
      fetchPerformances(selectedStudentId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update performance record';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Download Template ──

  const handleDownloadTemplate = () => {
    const headers = [
      'Student Registration Number',
      'Academic Year',
      'Semester',
      'SGPA',
      'CGPA',
      'Backlog Count',
      'Attendance Percentage',
      'Graduation Status',
    ];

    const sampleRow = ['REG2025001', '2025-26', '1', '8.50', '8.20', '0', '92.50', 'Continuing'];

    const csvContent = `\ufeff${headers.join(',')}\n${sampleRow.join(',')}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_academic_performance_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ── Helpers ──

  const getAcademicYearLabel = (yearId: number | null | undefined): string => {
    if (!yearId || yearId < 1 || yearId > ACADEMIC_YEAR_OPTIONS.length) return '-';
    return ACADEMIC_YEAR_OPTIONS[yearId - 1];
  };

  const getGraduationStatusBadge = (status: string | null) => {
    if (status === 'Graduated') return 'bg-blue-500/10 text-blue-600';
    if (status === 'Continuing') return 'bg-emerald-500/10 text-emerald-600';
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
      {/* ── Student Selector ── */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Select Student</CardTitle>
        </CardHeader>
        <CardContent>
          {studentsLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select
              value={selectedStudentId ? String(selectedStudentId) : ''}
              onValueChange={v => {
                setSelectedStudentId(Number(v));
                setSearchQuery('');
              }}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Choose a student..." />
              </SelectTrigger>
              <SelectContent>
                {students.map(s => (
                  <SelectItem key={s.id} value={String(s.id)} className="text-xs">
                    {s.studentName} ({s.rollNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {!selectedStudentId ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-muted-foreground">No student selected</p>
            <p className="text-xs text-muted-foreground mt-1">
              Choose a student from the dropdown above to view or manage their academic performance.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── Actions Card ── */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Academic Performance</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {performances.length} record{performances.length !== 1 ? 's' : ''}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => selectedStudentId && fetchPerformances(selectedStudentId)}
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
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Performance
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
                  <CardTitle className="text-sm font-semibold">Performance Records</CardTitle>
                  <CardDescription className="text-xs">
                    {loading
                      ? 'Loading performance data...'
                      : `Showing ${filteredPerformances.length} of ${performances.length} record${performances.length !== 1 ? 's' : ''}`}
                  </CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    className="h-8 text-xs pl-8 pr-8"
                    placeholder="Search records..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setSearchQuery('')}
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
                      <TableHead className="text-[10px] font-semibold">Academic Year</TableHead>
                      <TableHead className="text-[10px] font-semibold">Semester</TableHead>
                      <TableHead className="text-[10px] font-semibold">SGPA</TableHead>
                      <TableHead className="text-[10px] font-semibold">CGPA</TableHead>
                      <TableHead className="text-[10px] font-semibold">Backlog Count</TableHead>
                      <TableHead className="text-[10px] font-semibold">Attendance %</TableHead>
                      <TableHead className="text-[10px] font-semibold">Graduation Status</TableHead>
                      <TableHead className="text-[10px] font-semibold text-center w-16">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Loading skeleton */}
                    {loading &&
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={`skel-${i}`}>
                          <TableCell className="text-center">
                            <Skeleton className="h-4 w-4 mx-auto" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-10" />
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
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
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
                              onClick={() =>
                                selectedStudentId && fetchPerformances(selectedStudentId)
                              }
                            >
                              <RefreshCw className="h-3 w-3 mr-1" /> Retry
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Empty state */}
                    {!loading && !error && filteredPerformances.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <BarChart3 className="h-8 w-8 opacity-40" />
                            <p className="text-xs">
                              {searchQuery
                                ? 'No performance records match your search.'
                                : 'No performance records found for this student. Click "Add Performance" to create one.'}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Data rows */}
                    {!loading &&
                      !error &&
                      filteredPerformances.map((p, index) => (
                        <TableRow key={p.id} className="hover:bg-muted/20">
                          <TableCell className="text-[10px] text-center text-muted-foreground font-mono p-1.5">
                            {index + 1}
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5">
                            {getAcademicYearLabel(p.academicYearId)}
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5 font-mono font-medium">
                            Sem {p.semester}
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5 font-mono">
                            {p.sgpa?.toFixed(2) ?? '-'}
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5 font-mono">
                            {p.cgpa?.toFixed(2) ?? '-'}
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5">
                            <Badge
                              variant="secondary"
                              className={cn(
                                'text-[9px]',
                                p.backlogCount > 0
                                  ? 'bg-red-500/10 text-red-600'
                                  : 'bg-emerald-500/10 text-emerald-600'
                              )}
                            >
                              {p.backlogCount}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5 font-mono">
                            {p.attendancePercentage != null
                              ? `${p.attendancePercentage.toFixed(1)}%`
                              : '-'}
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5">
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[9px]',
                                p.graduationStatus && getGraduationStatusBadge(p.graduationStatus)
                              )}
                            >
                              {p.graduationStatus || '-'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center p-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => openEditDialog(p)}
                              title="Edit"
                            >
                              <Pencil className="h-3 w-3 text-blue-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* CREATE DIALOG */}
      {/* ════════════════════════════════════════════════ */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Add Performance Record</DialogTitle>
            <DialogDescription className="text-xs">
              Fill in the details to add a new academic performance record. Required fields are
              marked with *.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Semester *</Label>
                <Select
                  value={String(formData.semester)}
                  onValueChange={v => setFormData(prev => ({ ...prev, semester: Number(v) }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTER_OPTIONS.map(sem => (
                      <SelectItem key={sem} value={String(sem)} className="text-xs">
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Academic Year</Label>
                <Select
                  value={formData.academicYearId ? String(formData.academicYearId) : ''}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, academicYearId: v ? Number(v) : undefined }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACADEMIC_YEAR_OPTIONS.map((year, idx) => (
                      <SelectItem key={idx + 1} value={String(idx + 1)} className="text-xs">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">SGPA</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  placeholder="e.g. 8.50"
                  value={formData.sgpa ?? ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      sgpa: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">CGPA</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  placeholder="e.g. 8.20"
                  value={formData.cgpa ?? ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      cgpa: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Backlog Count</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  min="0"
                  placeholder="e.g. 0"
                  value={formData.backlogCount ?? 0}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, backlogCount: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Attendance Percentage</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="e.g. 92.50"
                  value={formData.attendancePercentage ?? ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      attendancePercentage: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Graduation Status</Label>
                <Select
                  value={formData.graduationStatus || ''}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, graduationStatus: v || undefined }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADUATION_STATUS_OPTIONS.map(opt => (
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
              disabled={saving || !formData.semester}
            >
              {saving ? 'Adding...' : 'Add Performance'}
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
            <DialogTitle className="text-sm">Edit Performance Record</DialogTitle>
            <DialogDescription className="text-xs">
              Update the performance record details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Semester</Label>
                <Select
                  value={String(formData.semester)}
                  onValueChange={v => setFormData(prev => ({ ...prev, semester: Number(v) }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTER_OPTIONS.map(sem => (
                      <SelectItem key={sem} value={String(sem)} className="text-xs">
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Academic Year</Label>
                <Select
                  value={formData.academicYearId ? String(formData.academicYearId) : ''}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, academicYearId: v ? Number(v) : undefined }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACADEMIC_YEAR_OPTIONS.map((year, idx) => (
                      <SelectItem key={idx + 1} value={String(idx + 1)} className="text-xs">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">SGPA</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.sgpa ?? ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      sgpa: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">CGPA</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.cgpa ?? ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      cgpa: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Backlog Count</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  min="0"
                  value={formData.backlogCount ?? 0}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, backlogCount: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Attendance %</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.attendancePercentage ?? ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      attendancePercentage: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Graduation Status</Label>
                <Select
                  value={formData.graduationStatus || ''}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, graduationStatus: v || undefined }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADUATION_STATUS_OPTIONS.map(opt => (
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
    </motion.div>
  );
};

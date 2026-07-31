import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { studentService } from '@/services/student.service';
import {
  StudentProfileResponse,
  AdmissionResponse,
  UpdateAdmissionRequest,
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
  UserPlus,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ── Admission Type select options ──

const ADMISSION_TYPE_OPTIONS = ['Convener', 'Management', 'Lateral Entry', 'NRI', 'Spot'];
const ADMISSION_CATEGORY_OPTIONS = ['General', 'OBC', 'SC', 'ST', 'EWS'];
const ADMISSION_QUOTA_OPTIONS = ['Convener', 'Management', 'NRI', 'Spot'];
const ADMISSION_STATUS_OPTIONS = ['Admitted', 'Cancelled'];
const ACADEMIC_YEAR_OPTIONS = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22'];

// ── Empty form ──

const emptyAdmissionForm = (): UpdateAdmissionRequest => ({
  academicYearId: undefined,
  admissionType: undefined,
  admissionCategory: undefined,
  admissionRank: undefined,
  admissionQuota: undefined,
  stateOfOrigin: undefined,
  country: 'India',
  admissionStatus: 'Admitted',
});

type AdmissionForm = UpdateAdmissionRequest;

// ── Helper: Map admission rank to the year label ──

const getAcademicYearLabel = (yearId: number | null | undefined): string => {
  if (!yearId || yearId < 1 || yearId > ACADEMIC_YEAR_OPTIONS.length) return '-';
  return ACADEMIC_YEAR_OPTIONS[yearId - 1];
};

export const StudentAdmissionTab = () => {
  const { user } = useAuth();
  const departmentId = user?.departmentId ?? 0;

  // Student selector
  const [students, setStudents] = useState<StudentProfileResponse[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Admission data
  const [admission, setAdmission] = useState<AdmissionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form
  const [formData, setFormData] = useState<AdmissionForm>(emptyAdmissionForm());
  const [saving, setSaving] = useState(false);

  // ── Fetch student list ──

  useEffect(() => {
    if (!departmentId) return;
    setStudentsLoading(true);
    studentService
      .listProfiles(departmentId, { size: 500 })
      .then(result => {
        setStudents(result.content);
        // Auto-select first student if only one
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

  // ── Fetch admission for selected student ──

  const fetchAdmission = useCallback(
    async (studentId: number) => {
      if (!departmentId) return;
      setLoading(true);
      setError(null);
      setAdmission(null);
      try {
        const result = await studentService.getAdmission(departmentId, studentId);
        setAdmission(result);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '';
        // 404 means no admission record yet — that's fine
        if (msg.includes('404') || msg.includes('not found') || msg.includes('Not Found')) {
          setAdmission(null);
          setError(null);
        } else {
          setError(msg);
          toast.error(msg);
        }
      } finally {
        setLoading(false);
      }
    },
    [departmentId]
  );

  useEffect(() => {
    if (selectedStudentId) {
      fetchAdmission(selectedStudentId);
    }
  }, [selectedStudentId, fetchAdmission]);

  // ── Search filtering ──

  const admissionMatchesSearch = (admission: AdmissionResponse, query: string): boolean => {
    const q = query.toLowerCase();
    return (
      (admission.admissionType?.toLowerCase().includes(q) ?? false) ||
      (admission.admissionCategory?.toLowerCase().includes(q) ?? false) ||
      String(admission.admissionRank ?? '').includes(q) ||
      (admission.admissionQuota?.toLowerCase().includes(q) ?? false) ||
      (admission.stateOfOrigin?.toLowerCase().includes(q) ?? false) ||
      (admission.country?.toLowerCase().includes(q) ?? false) ||
      (admission.admissionStatus?.toLowerCase().includes(q) ?? false)
    );
  };

  const filteredAdmission =
    admission && searchQuery
      ? admissionMatchesSearch(admission, searchQuery)
        ? admission
        : null
      : admission;

  // ── Dialog open for Add/Edit ──

  const openAddDialog = () => {
    setFormData(emptyAdmissionForm());
    setIsEditing(false);
    setDialogOpen(true);
  };

  const openEditDialog = () => {
    if (!admission) return;
    setFormData({
      academicYearId: admission.academicYearId ?? undefined,
      admissionType: admission.admissionType ?? undefined,
      admissionCategory: admission.admissionCategory ?? undefined,
      admissionRank: admission.admissionRank ?? undefined,
      admissionQuota: admission.admissionQuota ?? undefined,
      stateOfOrigin: admission.stateOfOrigin ?? undefined,
      country: admission.country ?? 'India',
      admissionStatus: admission.admissionStatus ?? 'Admitted',
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  // ── Save (PUT) ──

  const handleSave = async () => {
    if (!departmentId || !selectedStudentId) return;
    if (!formData.admissionType || !formData.admissionCategory || !formData.admissionStatus) {
      toast.error('Admission Type, Admission Category, and Admission Status are required');
      return;
    }
    setSaving(true);
    try {
      const result = await studentService.updateAdmission(
        departmentId,
        selectedStudentId,
        formData
      );
      setAdmission(result);
      toast.success(`Admission record ${isEditing ? 'updated' : 'created'} successfully`);
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save admission record';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Download Template ──

  const handleDownloadTemplate = () => {
    const headers = [
      'Student Registration Number',
      'Admission Year',
      'Admission Type',
      'Admission Category',
      'Admission Rank',
      'Admission Quota',
      'State of Origin',
      'Country',
      'Admission Status',
    ];

    const sampleRow = [
      'REG2025001',
      '2025-26',
      'Convener',
      'General',
      '1500',
      'State',
      'Telangana',
      'India',
      'Admitted',
    ];

    const csvContent = `\ufeff${headers.join(',')}\n${sampleRow.join(',')}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_admission_info_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            <UserPlus className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-muted-foreground">No student selected</p>
            <p className="text-xs text-muted-foreground mt-1">
              Choose a student from the dropdown above to view or manage their admission details.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── Actions Card ── */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Admission Information</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {admission ? 'Record exists' : 'No record'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => selectedStudentId && fetchAdmission(selectedStudentId)}
                    disabled={loading}
                  >
                    <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {admission ? (
                  <Button size="sm" className="text-xs h-8" onClick={openEditDialog}>
                    <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit Admission
                  </Button>
                ) : (
                  <Button size="sm" className="text-xs h-8" onClick={openAddDialog}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Admission
                  </Button>
                )}
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
                  <CardTitle className="text-sm font-semibold">Admission Records</CardTitle>
                  <CardDescription className="text-xs">
                    {loading
                      ? 'Loading admission data...'
                      : admission
                        ? `Showing admission record for student ID ${selectedStudentId}`
                        : 'No admission record found'}
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
                      <TableHead className="text-[10px] font-semibold">Admission Type</TableHead>
                      <TableHead className="text-[10px] font-semibold">
                        Admission Category
                      </TableHead>
                      <TableHead className="text-[10px] font-semibold">Admission Rank</TableHead>
                      <TableHead className="text-[10px] font-semibold">Admission Quota</TableHead>
                      <TableHead className="text-[10px] font-semibold">State of Origin</TableHead>
                      <TableHead className="text-[10px] font-semibold">Country</TableHead>
                      <TableHead className="text-[10px] font-semibold">Admission Status</TableHead>
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
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-14" />
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
                        <TableCell colSpan={10} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2 text-destructive">
                            <AlertCircle className="h-8 w-8" />
                            <p className="text-xs font-medium">{error}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => selectedStudentId && fetchAdmission(selectedStudentId)}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" /> Retry
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Empty state */}
                    {!loading && !error && !filteredAdmission && (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <UserPlus className="h-8 w-8 opacity-40" />
                            <p className="text-xs">
                              {searchQuery
                                ? 'No admission records match your search.'
                                : 'No admission record found for this student. Click "Add Admission" to create one.'}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Data row */}
                    {!loading && !error && filteredAdmission && (
                      <TableRow className="hover:bg-muted/20">
                        <TableCell className="text-[10px] text-center text-muted-foreground font-mono p-1.5">
                          1
                        </TableCell>
                        <TableCell className="text-[10px] p-1.5">
                          {filteredAdmission.academicYearId
                            ? getAcademicYearLabel(filteredAdmission.academicYearId)
                            : '-'}
                        </TableCell>
                        <TableCell className="text-[10px] p-1.5">
                          <Badge variant="outline" className="text-[9px] font-normal">
                            {filteredAdmission.admissionType || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] p-1.5">
                          {filteredAdmission.admissionCategory || '-'}
                        </TableCell>
                        <TableCell className="text-[10px] p-1.5 font-mono">
                          {filteredAdmission.admissionRank ?? '-'}
                        </TableCell>
                        <TableCell className="text-[10px] p-1.5">
                          {filteredAdmission.admissionQuota || '-'}
                        </TableCell>
                        <TableCell className="text-[10px] p-1.5">
                          {filteredAdmission.stateOfOrigin || '-'}
                        </TableCell>
                        <TableCell className="text-[10px] p-1.5">
                          {filteredAdmission.country || '-'}
                        </TableCell>
                        <TableCell className="text-[10px] p-1.5">
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-[9px]',
                              filteredAdmission.admissionStatus === 'Admitted'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'bg-red-500/10 text-red-600'
                            )}
                          >
                            {filteredAdmission.admissionStatus || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center p-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={openEditDialog}
                            title="Edit"
                          >
                            <Pencil className="h-3 w-3 text-blue-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* ADD/EDIT DIALOG */}
      {/* ════════════════════════════════════════════════ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {isEditing ? 'Edit Admission Record' : 'Add Admission Record'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isEditing
                ? 'Update the admission details for this student.'
                : 'Fill in the details to create an admission record. Required fields are marked with *.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Admission Year</Label>
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
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Admission Type *</Label>
                <Select
                  value={formData.admissionType || ''}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, admissionType: v || undefined }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMISSION_TYPE_OPTIONS.map(opt => (
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
                <Label className="text-xs font-medium">Admission Category *</Label>
                <Select
                  value={formData.admissionCategory || ''}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, admissionCategory: v || undefined }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMISSION_CATEGORY_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="text-xs">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Admission Rank</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  placeholder="e.g. 1500"
                  value={formData.admissionRank ?? ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      admissionRank: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Admission Quota</Label>
                <Select
                  value={formData.admissionQuota || ''}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, admissionQuota: v || undefined }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select quota" />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMISSION_QUOTA_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="text-xs">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">State of Origin</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="e.g. Telangana"
                  value={formData.stateOfOrigin || ''}
                  onChange={e => setFormData(prev => ({ ...prev, stateOfOrigin: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Country</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="e.g. India"
                  value={formData.country || ''}
                  onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Admission Status *</Label>
                <Select
                  value={formData.admissionStatus || ''}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, admissionStatus: v || undefined }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMISSION_STATUS_OPTIONS.map(opt => (
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
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs"
              onClick={handleSave}
              disabled={
                saving ||
                !formData.admissionType ||
                !formData.admissionCategory ||
                !formData.admissionStatus
              }
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Admission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { studentService } from '@/services/student.service';
import {
  StudentProfileResponse,
  ProgressionResponse,
  UpdateProgressionRequest,
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
  TrendingUp,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ── Select options ──

const ACADEMIC_YEAR_OPTIONS = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22'];
const PLACEMENT_STATUS_OPTIONS = ['Placed', 'Not Placed', 'Not Eligible'];
const YES_NO_OPTIONS = ['Yes', 'No'];
const HIGHER_EDUCATION_OPTIONS = ['Pursuing', 'Not Pursuing'];
const COMPETITIVE_EXAM_OPTIONS = ['GATE', 'CAT', 'GRE', 'GMAT', 'UPSC', 'NET', 'None', 'Other'];

// ── Empty form ──

const emptyProgressionForm = (): UpdateProgressionRequest => ({
  academicYearId: undefined,
  placementStatus: undefined,
  higherEducationStatus: undefined,
  competitiveExamQualified: undefined,
  entrepreneurshipStatus: undefined,
  internshipCompleted: undefined,
});

type ProgressionForm = UpdateProgressionRequest;

export const StudentProgressionTab = () => {
  const { user } = useAuth();
  const departmentId = user?.departmentId ?? 0;

  // Student selector
  const [students, setStudents] = useState<StudentProfileResponse[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Progression data
  const [progression, setProgression] = useState<ProgressionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form
  const [formData, setFormData] = useState<ProgressionForm>(emptyProgressionForm());
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

  // ── Fetch progression for selected student ──

  const fetchProgression = useCallback(
    async (studentId: number) => {
      if (!departmentId) return;
      setLoading(true);
      setError(null);
      setProgression(null);
      try {
        const result = await studentService.getProgression(departmentId, studentId);
        setProgression(result);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '';
        if (msg.includes('404') || msg.includes('not found') || msg.includes('Not Found')) {
          setProgression(null);
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
      fetchProgression(selectedStudentId);
    }
  }, [selectedStudentId, fetchProgression]);

  // ── Search filtering ──

  const progressionMatchesSearch = (p: ProgressionResponse, query: string): boolean => {
    const q = query.toLowerCase();
    return (
      (p.placementStatus?.toLowerCase().includes(q) ?? false) ||
      (p.higherEducationStatus?.toLowerCase().includes(q) ?? false) ||
      (p.competitiveExamQualified?.toLowerCase().includes(q) ?? false) ||
      (p.entrepreneurshipStatus?.toLowerCase().includes(q) ?? false) ||
      (p.internshipCompleted?.toLowerCase().includes(q) ?? false)
    );
  };

  const filteredProgression =
    progression && searchQuery
      ? progressionMatchesSearch(progression, searchQuery)
        ? progression
        : null
      : progression;

  // ── Dialog ──

  const openAddDialog = () => {
    setFormData(emptyProgressionForm());
    setIsEditing(false);
    setDialogOpen(true);
  };

  const openEditDialog = () => {
    if (!progression) return;
    setFormData({
      academicYearId: progression.academicYearId ?? undefined,
      placementStatus: progression.placementStatus ?? undefined,
      higherEducationStatus: progression.higherEducationStatus ?? undefined,
      competitiveExamQualified: progression.competitiveExamQualified ?? undefined,
      entrepreneurshipStatus: progression.entrepreneurshipStatus ?? undefined,
      internshipCompleted: progression.internshipCompleted ?? undefined,
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  // ── Save (PUT) ──

  const handleSave = async () => {
    if (!departmentId || !selectedStudentId) return;
    setSaving(true);
    try {
      const result = await studentService.updateProgression(
        departmentId,
        selectedStudentId,
        formData
      );
      setProgression(result);
      toast.success(`Progression record ${isEditing ? 'updated' : 'created'} successfully`);
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save progression record';
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
      'Placement Status',
      'Higher Education Status',
      'Competitive Exam Qualified',
      'Entrepreneurship Status',
      'Internship Completed',
    ];

    const sampleRow = ['REG2025001', '2025-26', 'Placed', 'Not Pursuing', 'GATE', 'No', 'Yes'];

    const csvContent = `\ufeff${headers.join(',')}\n${sampleRow.join(',')}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_progression_template.csv';
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

  const getPlacementBadge = (status: string | null) => {
    if (status === 'Placed') return 'bg-emerald-500/10 text-emerald-600';
    if (status === 'Not Placed') return 'bg-red-500/10 text-red-600';
    if (status === 'Not Eligible') return 'bg-amber-500/10 text-amber-600';
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
            <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-muted-foreground">No student selected</p>
            <p className="text-xs text-muted-foreground mt-1">
              Choose a student from the dropdown above to view or manage their career progression.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── Actions Card ── */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Career Progression</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {progression ? 'Record exists' : 'No record'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => selectedStudentId && fetchProgression(selectedStudentId)}
                    disabled={loading}
                  >
                    <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {progression ? (
                  <Button size="sm" className="text-xs h-8" onClick={openEditDialog}>
                    <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit Progression
                  </Button>
                ) : (
                  <Button size="sm" className="text-xs h-8" onClick={openAddDialog}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Progression
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
                  <CardTitle className="text-sm font-semibold">Progression Records</CardTitle>
                  <CardDescription className="text-xs">
                    {loading
                      ? 'Loading progression data...'
                      : progression
                        ? `Showing career progression for student ID ${selectedStudentId}`
                        : 'No progression record found'}
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
                      <TableHead className="text-[10px] font-semibold">Placement Status</TableHead>
                      <TableHead className="text-[10px] font-semibold">Higher Education</TableHead>
                      <TableHead className="text-[10px] font-semibold">Competitive Exam</TableHead>
                      <TableHead className="text-[10px] font-semibold">Entrepreneurship</TableHead>
                      <TableHead className="text-[10px] font-semibold">
                        Internship Completed
                      </TableHead>
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
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12 mx-auto" />
                          </TableCell>
                        </TableRow>
                      ))}

                    {/* Error state */}
                    {!loading && error && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2 text-destructive">
                            <AlertCircle className="h-8 w-8" />
                            <p className="text-xs font-medium">{error}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() =>
                                selectedStudentId && fetchProgression(selectedStudentId)
                              }
                            >
                              <RefreshCw className="h-3 w-3 mr-1" /> Retry
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Empty state */}
                    {!loading && !error && !filteredProgression && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <TrendingUp className="h-8 w-8 opacity-40" />
                            <p className="text-xs">
                              {searchQuery
                                ? 'No progression records match your search.'
                                : 'No progression record found for this student. Click "Add Progression" to create one.'}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Data row */}
                    {!loading && !error && filteredProgression && (
                      <TableRow className="hover:bg-muted/20">
                        <TableCell className="text-[10px] text-center text-muted-foreground font-mono p-1.5">
                          1
                        </TableCell>
                        <TableCell className="text-[10px] p-1.5">
                          {getAcademicYearLabel(filteredProgression.academicYearId)}
                        </TableCell>
                        <TableCell className="text-[10px] p-1.5">
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-[9px]',
                              getPlacementBadge(filteredProgression.placementStatus)
                            )}
                          >
                            {filteredProgression.placementStatus || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] p-1.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[9px]',
                              filteredProgression.higherEducationStatus === 'Pursuing'
                                ? 'bg-blue-500/10 text-blue-600'
                                : 'text-muted-foreground'
                            )}
                          >
                            {filteredProgression.higherEducationStatus || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] p-1.5">
                          <Badge variant="outline" className="text-[9px]">
                            {filteredProgression.competitiveExamQualified || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] p-1.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[9px]',
                              filteredProgression.entrepreneurshipStatus === 'Yes'
                                ? 'bg-violet-500/10 text-violet-600'
                                : 'text-muted-foreground'
                            )}
                          >
                            {filteredProgression.entrepreneurshipStatus || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] p-1.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[9px]',
                              filteredProgression.internshipCompleted === 'Yes'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : filteredProgression.internshipCompleted === 'No'
                                  ? 'bg-red-500/10 text-red-600'
                                  : 'text-muted-foreground'
                            )}
                          >
                            {filteredProgression.internshipCompleted || '-'}
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
              {isEditing ? 'Edit Progression Record' : 'Add Progression Record'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isEditing
                ? 'Update the career progression details for this student.'
                : 'Fill in the details to create a progression record.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
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
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Placement Status</Label>
                <Select
                  value={formData.placementStatus || ''}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, placementStatus: v || undefined }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLACEMENT_STATUS_OPTIONS.map(opt => (
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
                <Label className="text-xs font-medium">Higher Education Status</Label>
                <Select
                  value={formData.higherEducationStatus || ''}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, higherEducationStatus: v || undefined }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {HIGHER_EDUCATION_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="text-xs">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Competitive Exam Qualified</Label>
                <Select
                  value={formData.competitiveExamQualified || ''}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, competitiveExamQualified: v || undefined }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPETITIVE_EXAM_OPTIONS.map(opt => (
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
                <Label className="text-xs font-medium">Entrepreneurship Status</Label>
                <Select
                  value={formData.entrepreneurshipStatus || ''}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, entrepreneurshipStatus: v || undefined }))
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
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Internship Completed</Label>
                <Select
                  value={formData.internshipCompleted || ''}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, internshipCompleted: v || undefined }))
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
            <Button size="sm" className="text-xs" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Progression'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

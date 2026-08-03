import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { studentService } from '@/services/student.service';
import {
  StudentProfileResponse,
  DiversityResponse,
  UpdateDiversityRequest,
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
  Users,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ── Select options ──

const SOCIAL_CATEGORY_OPTIONS = ['General', 'OBC', 'SC', 'ST', 'EWS'];
const YES_NO_OPTIONS = ['Yes', 'No'];

// ── Empty form ──

const emptyDiversityForm = (): UpdateDiversityRequest => ({
  socialCategory: undefined,
  economicallyWeakerSection: false,
  minorityStatus: false,
  differentlyAbled: false,
  nationality: 'Indian',
  firstGenerationLearner: false,
});

type DiversityForm = UpdateDiversityRequest;

// ── Helpers ──

const boolToYesNo = (val: boolean | null | undefined): string => {
  if (val === true) return 'Yes';
  if (val === false) return 'No';
  return '-';
};

const getCategoryBadgeStyle = (category: string | null) => {
  switch (category) {
    case 'General':
      return 'bg-blue-500/10 text-blue-600';
    case 'OBC':
      return 'bg-amber-500/10 text-amber-600';
    case 'SC':
      return 'bg-violet-500/10 text-violet-600';
    case 'ST':
      return 'bg-red-500/10 text-red-600';
    case 'EWS':
      return 'bg-emerald-500/10 text-emerald-600';
    default:
      return 'bg-gray-500/10 text-gray-600';
  }
};

export const StudentDiversityTab = () => {
  const { user } = useAuth();
  const departmentId = user?.departmentId ?? 0;

  // Student selector
  const [students, setStudents] = useState<StudentProfileResponse[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Diversity data
  const [diversity, setDiversity] = useState<DiversityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form
  const [formData, setFormData] = useState<DiversityForm>(emptyDiversityForm());
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

  // ── Fetch diversity for selected student ──

  const fetchDiversity = useCallback(
    async (studentId: number) => {
      if (!departmentId) return;
      setLoading(true);
      setError(null);
      setDiversity(null);
      try {
        const result = await studentService.getDiversity(departmentId, studentId);
        setDiversity(result);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '';
        if (msg.includes('404') || msg.includes('not found') || msg.includes('Not Found')) {
          setDiversity(null);
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
      fetchDiversity(selectedStudentId);
    }
  }, [selectedStudentId, fetchDiversity]);

  // ── Search filtering ──

  const diversityMatchesSearch = (d: DiversityResponse, query: string): boolean => {
    const q = query.toLowerCase();
    return (
      (d.socialCategory?.toLowerCase().includes(q) ?? false) ||
      (d.nationality?.toLowerCase().includes(q) ?? false) ||
      boolToYesNo(d.economicallyWeakerSection).toLowerCase().includes(q) ||
      boolToYesNo(d.minorityStatus).toLowerCase().includes(q) ||
      boolToYesNo(d.differentlyAbled).toLowerCase().includes(q) ||
      boolToYesNo(d.firstGenerationLearner).toLowerCase().includes(q)
    );
  };

  const filteredDiversity =
    diversity && searchQuery
      ? diversityMatchesSearch(diversity, searchQuery)
        ? diversity
        : null
      : diversity;

  // ── Dialog open for Add/Edit ──

  const openAddDialog = () => {
    setFormData(emptyDiversityForm());
    setIsEditing(false);
    setDialogOpen(true);
  };

  const openEditDialog = () => {
    if (!diversity) return;
    setFormData({
      socialCategory: diversity.socialCategory ?? undefined,
      economicallyWeakerSection: diversity.economicallyWeakerSection,
      minorityStatus: diversity.minorityStatus,
      differentlyAbled: diversity.differentlyAbled,
      nationality: diversity.nationality ?? 'Indian',
      firstGenerationLearner: diversity.firstGenerationLearner,
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  // ── Save (PUT) ──

  const handleSave = async () => {
    if (!departmentId || !selectedStudentId) return;
    if (!formData.socialCategory) {
      toast.error('Social Category is required');
      return;
    }
    setSaving(true);
    try {
      const result = await studentService.updateDiversity(
        departmentId,
        selectedStudentId,
        formData
      );
      setDiversity(result);
      toast.success(`Diversity record ${isEditing ? 'updated' : 'created'} successfully`);
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save diversity record';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Download Template ──

  const handleDownloadTemplate = () => {
    const headers = [
      'Student Registration Number',
      'Social Category',
      'Economically Weaker Section',
      'Minority Status',
      'Differently Abled',
      'Nationality',
      'First Generation Learner',
    ];

    const sampleRow = ['REG2025001', 'General', 'No', 'No', 'No', 'India', 'No'];

    const csvContent = `\ufeff${headers.join(',')}\n${sampleRow.join(',')}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_diversity_template.csv';
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
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-muted-foreground">No student selected</p>
            <p className="text-xs text-muted-foreground mt-1">
              Choose a student from the dropdown above to view or manage their diversity details.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── Actions Card ── */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Diversity Information</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {diversity ? 'Record exists' : 'No record'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => selectedStudentId && fetchDiversity(selectedStudentId)}
                    disabled={loading}
                  >
                    <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {diversity ? (
                  <Button size="sm" className="text-xs h-8" onClick={openEditDialog}>
                    <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit Diversity
                  </Button>
                ) : (
                  <Button size="sm" className="text-xs h-8" onClick={openAddDialog}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Diversity
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
                  <CardTitle className="text-sm font-semibold">Diversity Records</CardTitle>
                  <CardDescription className="text-xs">
                    {loading
                      ? 'Loading diversity data...'
                      : diversity
                        ? `Showing diversity record for student ID ${selectedStudentId}`
                        : 'No diversity record found'}
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
                      <TableHead className="text-[10px] font-semibold">Social Category</TableHead>
                      <TableHead className="text-[10px] font-semibold">
                        Economically Weaker Section
                      </TableHead>
                      <TableHead className="text-[10px] font-semibold">Minority Status</TableHead>
                      <TableHead className="text-[10px] font-semibold">Differently Abled</TableHead>
                      <TableHead className="text-[10px] font-semibold">Nationality</TableHead>
                      <TableHead className="text-[10px] font-semibold">
                        First Generation Learner
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
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-14" />
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
                              onClick={() => selectedStudentId && fetchDiversity(selectedStudentId)}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" /> Retry
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Empty state */}
                    {!loading && !error && !filteredDiversity && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Users className="h-8 w-8 opacity-40" />
                            <p className="text-xs">
                              {searchQuery
                                ? 'No diversity records match your search.'
                                : 'No diversity record found for this student. Click "Add Diversity" to create one.'}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Data row */}
                    {!loading && !error && filteredDiversity && (
                      <TableRow className="hover:bg-muted/20">
                        <TableCell className="text-[10px] text-center text-muted-foreground font-mono p-1.5">
                          1
                        </TableCell>
                        <TableCell className="text-[10px] p-1.5">
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-[9px]',
                              getCategoryBadgeStyle(filteredDiversity.socialCategory)
                            )}
                          >
                            {filteredDiversity.socialCategory || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] p-1.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[9px]',
                              filteredDiversity.economicallyWeakerSection
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'text-muted-foreground'
                            )}
                          >
                            {boolToYesNo(filteredDiversity.economicallyWeakerSection)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] p-1.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[9px]',
                              filteredDiversity.minorityStatus
                                ? 'bg-blue-500/10 text-blue-600'
                                : 'text-muted-foreground'
                            )}
                          >
                            {boolToYesNo(filteredDiversity.minorityStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] p-1.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[9px]',
                              filteredDiversity.differentlyAbled
                                ? 'bg-orange-500/10 text-orange-600'
                                : 'text-muted-foreground'
                            )}
                          >
                            {boolToYesNo(filteredDiversity.differentlyAbled)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] p-1.5">
                          {filteredDiversity.nationality || '-'}
                        </TableCell>
                        <TableCell className="text-[10px] p-1.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[9px]',
                              filteredDiversity.firstGenerationLearner
                                ? 'bg-violet-500/10 text-violet-600'
                                : 'text-muted-foreground'
                            )}
                          >
                            {boolToYesNo(filteredDiversity.firstGenerationLearner)}
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
              {isEditing ? 'Edit Diversity Record' : 'Add Diversity Record'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isEditing
                ? 'Update the diversity details for this student.'
                : 'Fill in the details to create a diversity record. Required fields are marked with *.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Social Category *</Label>
                <Select
                  value={formData.socialCategory || ''}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, socialCategory: v || undefined }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOCIAL_CATEGORY_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="text-xs">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Nationality</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="e.g. Indian"
                  value={formData.nationality || ''}
                  onChange={e => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Economically Weaker Section</Label>
                <Select
                  value={boolToYesNo(formData.economicallyWeakerSection ?? false)}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, economicallyWeakerSection: v === 'Yes' }))
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
                <Label className="text-xs font-medium">Minority Status</Label>
                <Select
                  value={boolToYesNo(formData.minorityStatus)}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, minorityStatus: v === 'Yes' }))
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
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Differently Abled</Label>
                <Select
                  value={boolToYesNo(formData.differentlyAbled)}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, differentlyAbled: v === 'Yes' }))
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
                <Label className="text-xs font-medium">First Generation Learner</Label>
                <Select
                  value={boolToYesNo(formData.firstGenerationLearner)}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, firstGenerationLearner: v === 'Yes' }))
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
            <Button
              size="sm"
              className="text-xs"
              onClick={handleSave}
              disabled={saving || !formData.socialCategory}
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Diversity'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

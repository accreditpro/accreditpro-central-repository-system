import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { studentService } from '@/services/student.service';
import { StudentProfileResponse, StudentAchievementResponse, CreateAchievementRequest } from '@/types/student.types';
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
  Trophy,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ── Select options ──

const ACADEMIC_YEAR_OPTIONS = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22'];
const ACHIEVEMENT_TYPE_OPTIONS = ['Hackathon', 'Sports', 'Cultural', 'Paper Presentation', 'Project Competition', 'Olympiad', 'Other'];
const LEVEL_OPTIONS = ['International', 'National', 'State', 'University', 'College'];

// ── Empty form ──

const emptyAchievementForm = (): CreateAchievementRequest => ({
  achievementName: '',
  achievementType: undefined,
  level: undefined,
  awardPosition: undefined,
  achievementDate: '',
  academicYearId: undefined,
  organizingBody: undefined,
});

type AchievementForm = CreateAchievementRequest;

export const StudentAchievementTab = () => {
  const { user } = useAuth();
  const departmentId = user?.departmentId ?? 0;

  // Student selector
  const [students, setStudents] = useState<StudentProfileResponse[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Achievement data
  const [achievements, setAchievements] = useState<StudentAchievementResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Form
  const [formData, setFormData] = useState<AchievementForm>(emptyAchievementForm());
  const [saving, setSaving] = useState(false);

  // ── Fetch student list ──

  useEffect(() => {
    if (!departmentId) return;
    setStudentsLoading(true);
    studentService.listProfiles(departmentId, { size: 500 })
      .then((result) => {
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

  // ── Fetch achievements for selected student ──

  const fetchAchievements = useCallback(async (studentId: number) => {
    if (!departmentId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await studentService.listAchievements(departmentId, studentId);
      setAchievements(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load achievements';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    if (selectedStudentId) {
      fetchAchievements(selectedStudentId);
    }
  }, [selectedStudentId, fetchAchievements]);

  // ── Search filtering ──

  const achievementMatchesSearch = (a: StudentAchievementResponse, query: string): boolean => {
    const q = query.toLowerCase();
    return (
      a.achievementName.toLowerCase().includes(q) ||
      (a.achievementType?.toLowerCase().includes(q) ?? false) ||
      (a.level?.toLowerCase().includes(q) ?? false) ||
      (a.awardPosition?.toLowerCase().includes(q) ?? false) ||
      a.achievementDate.toLowerCase().includes(q) ||
      (a.organizingBody?.toLowerCase().includes(q) ?? false)
    );
  };

  const filteredAchievements = searchQuery
    ? achievements.filter((a) => achievementMatchesSearch(a, searchQuery))
    : achievements;

  // ── Create ──

  const openCreateDialog = () => {
    setFormData(emptyAchievementForm());
    setCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!departmentId || !selectedStudentId) return;
    if (!formData.achievementName || !formData.achievementDate) {
      toast.error('Achievement Name and Date are required');
      return;
    }
    setSaving(true);
    try {
      await studentService.addAchievement(departmentId, selectedStudentId, formData);
      toast.success('Achievement record added successfully');
      setCreateDialogOpen(false);
      fetchAchievements(selectedStudentId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add achievement record';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Download Template ──

  const handleDownloadTemplate = () => {
    const headers = [
      'Student Registration Number',
      'Achievement Type',
      'Achievement Name',
      'Level',
      'Award/Position',
      'Date',
      'Academic Year',
      'Organizing Body',
    ];

    const sampleRow = [
      'REG2025001',
      'Hackathon',
      'Smart India Hackathon Winner',
      'National',
      '1st Prize',
      '2024-03-15',
      '2024-25',
      'Government of India',
    ];

    const csvContent = `\ufeff${headers.join(',')}\n${sampleRow.join(',')}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_achievements_template.csv';
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

  const getLevelBadgeStyle = (level: string | null) => {
    switch (level) {
      case 'International': return 'bg-violet-500/10 text-violet-600';
      case 'National': return 'bg-blue-500/10 text-blue-600';
      case 'State': return 'bg-emerald-500/10 text-emerald-600';
      case 'University': return 'bg-amber-500/10 text-amber-600';
      case 'College': return 'bg-gray-500/10 text-gray-600';
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
              onValueChange={(v) => {
                setSelectedStudentId(Number(v));
                setSearchQuery('');
              }}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Choose a student..." />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
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
            <Trophy className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-muted-foreground">No student selected</p>
            <p className="text-xs text-muted-foreground mt-1">
              Choose a student from the dropdown above to view or manage their achievements.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── Actions Card ── */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Student Achievements</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {achievements.length} record{achievements.length !== 1 ? 's' : ''}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => selectedStudentId && fetchAchievements(selectedStudentId)}
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
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Achievement
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
                  <CardTitle className="text-sm font-semibold">Achievement Records</CardTitle>
                  <CardDescription className="text-xs">
                    {loading
                      ? 'Loading achievement data...'
                      : `Showing ${filteredAchievements.length} of ${achievements.length} record${achievements.length !== 1 ? 's' : ''}`}
                  </CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    className="h-8 text-xs pl-8 pr-8"
                    placeholder="Search records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                      <TableHead className="text-[10px] font-semibold">Achievement Type</TableHead>
                      <TableHead className="text-[10px] font-semibold">Achievement Name</TableHead>
                      <TableHead className="text-[10px] font-semibold">Level</TableHead>
                      <TableHead className="text-[10px] font-semibold">Award/Position</TableHead>
                      <TableHead className="text-[10px] font-semibold">Date</TableHead>
                      <TableHead className="text-[10px] font-semibold">Academic Year</TableHead>
                      <TableHead className="text-[10px] font-semibold">Organizing Body</TableHead>
                      <TableHead className="text-[10px] font-semibold text-center w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Loading skeleton */}
                    {loading && (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={`skel-${i}`}>
                          <TableCell className="text-center"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
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
                            <Button variant="outline" size="sm" className="text-xs" onClick={() => selectedStudentId && fetchAchievements(selectedStudentId)}>
                              <RefreshCw className="h-3 w-3 mr-1" /> Retry
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Empty state */}
                    {!loading && !error && filteredAchievements.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Trophy className="h-8 w-8 opacity-40" />
                            <p className="text-xs">
                              {searchQuery
                                ? 'No achievements match your search.'
                                : 'No achievement records found for this student. Click "Add Achievement" to create one.'}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Data rows */}
                    {!loading && !error && filteredAchievements.map((a, index) => (
                      <TableRow key={a.id} className="hover:bg-muted/20">
                        <TableCell className="text-[10px] text-center text-muted-foreground font-mono p-1.5">{index + 1}</TableCell>
                        <TableCell className="text-[10px] p-1.5">
                          <Badge variant="outline" className="text-[9px]">{a.achievementType || '-'}</Badge>
                        </TableCell>
                        <TableCell className="text-xs p-1.5 font-medium">{a.achievementName}</TableCell>
                        <TableCell className="text-[10px] p-1.5">
                          <Badge variant="secondary" className={cn('text-[9px]', getLevelBadgeStyle(a.level))}>
                            {a.level || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] p-1.5">{a.awardPosition || '-'}</TableCell>
                        <TableCell className="text-[10px] p-1.5">{a.achievementDate || '-'}</TableCell>
                        <TableCell className="text-[10px] p-1.5">{getAcademicYearLabel(a.academicYearId)}</TableCell>
                        <TableCell className="text-[10px] p-1.5 truncate max-w-[120px]">{a.organizingBody || '-'}</TableCell>
                        <TableCell className="text-center p-1.5">
                          <Button variant="ghost" size="icon" className="h-5 w-5 opacity-40 cursor-not-allowed" disabled title="Update API not available yet">
                            <Pencil className="h-3 w-3" />
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
            <DialogTitle className="text-sm">Add Achievement Record</DialogTitle>
            <DialogDescription className="text-xs">
              Fill in the details to add a new achievement record. Required fields are marked with *.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Achievement Type</Label>
                <Select
                  value={formData.achievementType || ''}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, achievementType: v || undefined }))}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {ACHIEVEMENT_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Achievement Name *</Label>
                <Input className="h-9 text-xs" placeholder="e.g. Smart India Hackathon Winner"
                  value={formData.achievementName}
                  onChange={(e) => setFormData(prev => ({ ...prev, achievementName: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Level</Label>
                <Select
                  value={formData.level || ''}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, level: v || undefined }))}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    {LEVEL_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Award / Position</Label>
                <Input className="h-9 text-xs" placeholder="e.g. 1st Prize"
                  value={formData.awardPosition || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, awardPosition: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Date *</Label>
                <Input className="h-9 text-xs" type="date"
                  value={formData.achievementDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, achievementDate: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Academic Year</Label>
                <Select
                  value={formData.academicYearId ? String(formData.academicYearId) : ''}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, academicYearId: v ? Number(v) : undefined }))}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select year" /></SelectTrigger>
                  <SelectContent>
                    {ACADEMIC_YEAR_OPTIONS.map((year, idx) => (
                      <SelectItem key={idx + 1} value={String(idx + 1)} className="text-xs">{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Organizing Body</Label>
                <Input className="h-9 text-xs" placeholder="e.g. Government of India"
                  value={formData.organizingBody || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, organizingBody: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button size="sm" className="text-xs" onClick={handleCreate}
              disabled={saving || !formData.achievementName || !formData.achievementDate}>
              {saving ? 'Adding...' : 'Add Achievement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

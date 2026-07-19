import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { academicService } from '@/services/academic.service';
import {
  ValueAddedCourseResponse,
  CreateValueAddedCourseRequest,
} from '@/types/academic.types';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import {
  Search,
  Plus,
  Pencil,
  Download,
  RefreshCw,
  AlertCircle,
  Award,
  Trash2,
  Upload,
} from 'lucide-react';

// ── Workflow status badge colors ──
const workflowStatusColors: Record<string, string> = {
  DRAFT: 'bg-gray-500/10 text-gray-600',
  SUBMITTED: 'bg-blue-500/10 text-blue-600',
  VALIDATED: 'bg-indigo-500/10 text-indigo-600',
  EVIDENCE_PENDING: 'bg-amber-500/10 text-amber-600',
  HOD_REVIEW: 'bg-orange-500/10 text-orange-600',
  IQAC_VERIFICATION: 'bg-purple-500/10 text-purple-600',
  APPROVED: 'bg-emerald-500/10 text-emerald-600',
  REJECTED: 'bg-red-500/10 text-red-600',
};

// ── Helper: format boolean as Yes/No ──
const formatBool = (val: boolean | null | undefined): string => {
  if (val === null || val === undefined) return '—';
  return val ? 'Yes' : 'No';
};

// ── Template CSV headers ──
const TEMPLATE_HEADERS = [
  'Course Name',
  'Conducting Unit',
  'Academic Year ID',
  'Duration Hours',
  'Students Enrolled',
  'Certification Provided',
];

const downloadTemplate = () => {
  const headerLine = TEMPLATE_HEADERS.join(',');
  const sampleRow = 'Python Programming,CSE Department,1,30,50,Yes';
  const csvContent = `${headerLine}\n${sampleRow}\n`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'value_added_courses_template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const ValueAddedCoursesTab = () => {
  const { user } = useAuth();
  const departmentId = user?.departmentId;

  // ── State ──
  const [records, setRecords] = useState<ValueAddedCourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Create form state ──
  const emptyForm: CreateValueAddedCourseRequest = {
    courseName: '',
    conductingUnit: '',
    academicYearId: 0,
    durationHours: 0,
    studentsEnrolled: 0,
    certificationProvided: false,
  };
  const [formData, setFormData] = useState<CreateValueAddedCourseRequest>({ ...emptyForm });

  const resetForm = () => setFormData({ ...emptyForm });

  if (!departmentId) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mb-3" />
          <p className="text-sm font-medium text-destructive">Department ID not available</p>
          <p className="text-xs text-muted-foreground mt-1">Please log in again.</p>
        </CardContent>
      </Card>
    );
  }

  // ── Fetch VACs ──
  const fetchRecords = useCallback(async () => {
    if (!departmentId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await academicService.listValueAddedCourses(departmentId);
      setRecords(result.content || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load value added course records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // ── Create VAC ──
  const handleCreate = async () => {
    if (!departmentId) return;
    if (!formData.courseName || !formData.academicYearId) {
      toast({ title: 'Validation Error', description: 'Course Name and Academic Year are required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await academicService.createValueAddedCourse(departmentId, formData);
      toast({ title: 'Success', description: 'Value added course created successfully.' });
      setShowCreate(false);
      resetForm();
      fetchRecords();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to create value added course.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // ── Delete VAC ──
  const handleDelete = async (id: number) => {
    if (!departmentId) return;
    if (!confirm('Are you sure you want to delete this value added course record?')) return;
    try {
      await academicService.deleteValueAddedCourse(departmentId, id);
      toast({ title: 'Success', description: 'Value added course deleted successfully.' });
      fetchRecords();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to delete value added course.', variant: 'destructive' });
    }
  };

  // ── Client-side search ──
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const q = searchQuery.toLowerCase();
    return records.filter((r) => {
      const searchable = [
        r.courseName,
        r.conductingUnit ?? '',
        String(r.studentsEnrolled),
        String(r.durationHours ?? ''),
      ].join(' ').toLowerCase();
      return searchable.includes(q);
    });
  }, [records, searchQuery]);

  const columns = ['#', 'Course Name', 'Conducting Unit', 'Academic Year', 'Duration (Hrs)', 'Students Enrolled', 'Certification', 'Status', 'Actions'];
  const colSpan = columns.length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <Card className="border-border/50">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Value Added Courses</CardTitle>
            <CardDescription className="text-xs">Manage value added courses and certifications</CardDescription>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={fetchRecords} disabled={loading}>
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* ── Toolbar: Search + Actions ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            {/* Search - top right of data table */}
            <div className="relative w-full sm:w-64 order-2 sm:order-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by course name, unit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 order-1 sm:order-2">
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={downloadTemplate}>
                <Download className="h-3.5 w-3.5 mr-1" /> Download Template
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-8" disabled>
                <Upload className="h-3.5 w-3.5 mr-1" /> Upload CSV
              </Button>
              <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="text-xs h-8">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Record
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-base">Add Value Added Course</DialogTitle>
                    <DialogDescription className="text-xs">
                      Enter the value added course details below.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-2 gap-3 py-2">
                    {/* Course Name */}
                    <div className="space-y-1 col-span-2">
                      <Label className="text-xs font-medium">Course Name *</Label>
                      <Input
                        placeholder="e.g. Python Programming"
                        value={formData.courseName}
                        onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>

                    {/* Conducting Unit */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Conducting Unit</Label>
                      <Input
                        placeholder="e.g. CSE Department"
                        value={formData.conductingUnit || ''}
                        onChange={(e) => setFormData({ ...formData, conductingUnit: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>

                    {/* Academic Year ID */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Academic Year ID *</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 1"
                        value={formData.academicYearId || ''}
                        onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value ? Number(e.target.value) : 0 })}
                        className="h-8 text-xs"
                      />
                    </div>

                    {/* Duration Hours */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Duration (Hours)</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="e.g. 30"
                        value={formData.durationHours ?? ''}
                        onChange={(e) => setFormData({ ...formData, durationHours: e.target.value ? Number(e.target.value) : 0 })}
                        className="h-8 text-xs"
                      />
                    </div>

                    {/* Students Enrolled */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Students Enrolled</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="e.g. 50"
                        value={formData.studentsEnrolled ?? ''}
                        onChange={(e) => setFormData({ ...formData, studentsEnrolled: e.target.value ? Number(e.target.value) : 0 })}
                        className="h-8 text-xs"
                      />
                    </div>

                    {/* Certification Provided */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Certification Provided</Label>
                      <select
                        className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={formData.certificationProvided ? 'true' : 'false'}
                        onChange={(e) => setFormData({ ...formData, certificationProvided: e.target.value === 'true' })}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                  </div>

                  <DialogFooter className="gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => { setShowCreate(false); resetForm(); }} className="text-xs h-8">
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleCreate} disabled={saving || !formData.courseName || !formData.academicYearId} className="text-xs h-8">
                      {saving ? 'Saving...' : 'Create'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* ── Data Table ── */}
          {loading ? (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    {columns.map((col) => (
                      <TableHead key={col} className="text-[10px] whitespace-nowrap">{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: colSpan }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
              <AlertCircle className="h-10 w-10 text-destructive mb-2" />
              <p className="text-sm font-medium text-destructive">Failed to load</p>
              <p className="text-xs text-muted-foreground mt-1 mb-3">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchRecords} className="text-xs h-8">
                <RefreshCw className="h-3 w-3 mr-1" /> Retry
              </Button>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
              <Award className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-muted-foreground">
                {searchQuery ? 'No matching courses found' : 'No value added courses yet'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery ? 'Try a different search term.' : 'Click Add Record to create one.'}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    {columns.map((col) => (
                      <TableHead key={col} className="text-[10px] whitespace-nowrap">{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record, index) => (
                    <TableRow key={record.id} className="hover:bg-muted/20">
                      <TableCell className="text-xs text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="text-xs font-medium">{record.courseName}</TableCell>
                      <TableCell className="text-xs">{record.conductingUnit || '—'}</TableCell>
                      <TableCell className="text-xs">{record.academicYearId ?? '—'}</TableCell>
                      <TableCell className="text-xs">{record.durationHours ?? '—'}</TableCell>
                      <TableCell className="text-xs font-medium">{record.studentsEnrolled}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="secondary" className={cn('text-[9px]', record.certificationProvided ? 'bg-emerald-500/10 text-emerald-600' : 'bg-gray-500/10 text-gray-600')}>
                          {formatBool(record.certificationProvided)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn('text-[9px]', workflowStatusColors[record.workflowStatus || ''] || '')}>
                          {record.workflowStatus || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-0.5">
                          <Button variant="ghost" size="icon" className="h-6 w-6" title="Edit (coming soon)" disabled>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDelete(record.id)} title="Delete">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

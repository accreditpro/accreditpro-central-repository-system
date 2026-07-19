import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { academicService } from '@/services/academic.service';
import {
  CourseResponse,
  CreateCourseRequest,
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
  FileText,
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

// ── Course type options for create form ──
const COURSE_TYPE_OPTIONS = ['Theory', 'Lab', 'Theory + Lab', 'Project', 'Seminar', 'Internship'];

// ── Status options for create form ──
const STATUS_OPTIONS = ['Active', 'Inactive', 'Proposed'];

// ── Template CSV headers ──
const TEMPLATE_HEADERS = [
  'Program Offering ID',
  'Course Code',
  'Course Name',
  'Semester',
  'Course Type',
  'Credits',
  'Theory Hours',
  'Lab Hours',
  'Status',
];

const downloadTemplate = () => {
  const headerLine = TEMPLATE_HEADERS.join(',');
  const sampleRow = '5,CS401,Machine Learning,7,Theory,4,3,2,Active';
  const csvContent = `${headerLine}\n${sampleRow}\n`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'courses_template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const CoursesTab = () => {
  const { user } = useAuth();
  const departmentId = user?.departmentId;

  // ── State ──
  const [records, setRecords] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Create form state ──
  const emptyForm: CreateCourseRequest = {
    programOfferingId: 0,
    courseCode: '',
    courseName: '',
    semester: 0,
    courseType: '',
    credits: 0,
    theoryHours: 0,
    labHours: 0,
    status: 'Active',
  };
  const [formData, setFormData] = useState<CreateCourseRequest>({ ...emptyForm });

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

  // ── Fetch courses ──
  const fetchRecords = useCallback(async () => {
    if (!departmentId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await academicService.listCourses(departmentId, { search: searchQuery || undefined });
      setRecords(result.content || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load course records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [departmentId, searchQuery]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // ── Create course ──
  const handleCreate = async () => {
    if (!departmentId) return;
    if (!formData.programOfferingId || !formData.courseCode || !formData.courseName || !formData.semester || !formData.courseType || !formData.credits) {
      toast({ title: 'Validation Error', description: 'Program Offering, Course Code, Course Name, Semester, Course Type, and Credits are required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await academicService.createCourse(departmentId, formData);
      toast({ title: 'Success', description: 'Course created successfully.' });
      setShowCreate(false);
      resetForm();
      fetchRecords();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to create course.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // ── Delete course ──
  const handleDelete = async (id: number) => {
    if (!departmentId) return;
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await academicService.deleteCourse(departmentId, id);
      toast({ title: 'Success', description: 'Course deleted successfully.' });
      fetchRecords();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to delete course.', variant: 'destructive' });
    }
  };

  // ── Client-side search fallback (in addition to server-side search) ──
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const q = searchQuery.toLowerCase();
    return records.filter((r) => {
      const searchable = [
        r.courseCode,
        r.courseName,
        r.courseType ?? '',
        r.status ?? '',
        String(r.semester ?? ''),
      ].join(' ').toLowerCase();
      return searchable.includes(q);
    });
  }, [records, searchQuery]);

  const columns = ['#', 'Course Code', 'Course Name', 'Semester', 'Course Type', 'Credits', 'Theory Hours', 'Lab Hours', 'Status', 'Workflow', 'Actions'];
  const colSpan = columns.length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <Card className="border-border/50">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Course Records</CardTitle>
            <CardDescription className="text-xs">Manage courses offered in the curriculum</CardDescription>
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
                placeholder="Search by code, name, type..."
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
                    <DialogTitle className="text-base">Add Course</DialogTitle>
                    <DialogDescription className="text-xs">
                      Enter the course details below.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-2 gap-3 py-2">
                    {/* Course Code */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Course Code *</Label>
                      <Input
                        placeholder="e.g. CS401"
                        value={formData.courseCode}
                        onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>

                    {/* Course Name */}
                    <div className="space-y-1 col-span-2">
                      <Label className="text-xs font-medium">Course Name *</Label>
                      <Input
                        placeholder="e.g. Machine Learning"
                        value={formData.courseName}
                        onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>

                    {/* Program Offering ID */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Program Offering ID *</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 5"
                        value={formData.programOfferingId || ''}
                        onChange={(e) => setFormData({ ...formData, programOfferingId: e.target.value ? Number(e.target.value) : 0 })}
                        className="h-8 text-xs"
                      />
                    </div>

                    {/* Semester */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Semester * (1-8)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={8}
                        placeholder="e.g. 7"
                        value={formData.semester || ''}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value ? Number(e.target.value) : 0 })}
                        className="h-8 text-xs"
                      />
                    </div>

                    {/* Course Type */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Course Type *</Label>
                      <select
                        className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={formData.courseType}
                        onChange={(e) => setFormData({ ...formData, courseType: e.target.value })}
                      >
                        <option value="">Select type...</option>
                        {COURSE_TYPE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    {/* Credits */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Credits *</Label>
                      <Input
                        type="number"
                        min={1}
                        placeholder="e.g. 4"
                        value={formData.credits || ''}
                        onChange={(e) => setFormData({ ...formData, credits: e.target.value ? Number(e.target.value) : 0 })}
                        className="h-8 text-xs"
                      />
                    </div>

                    {/* Theory Hours */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Theory Hours</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="e.g. 3"
                        value={formData.theoryHours ?? ''}
                        onChange={(e) => setFormData({ ...formData, theoryHours: e.target.value ? Number(e.target.value) : 0 })}
                        className="h-8 text-xs"
                      />
                    </div>

                    {/* Lab Hours */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Lab Hours</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="e.g. 2"
                        value={formData.labHours ?? ''}
                        onChange={(e) => setFormData({ ...formData, labHours: e.target.value ? Number(e.target.value) : 0 })}
                        className="h-8 text-xs"
                      />
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Status</Label>
                      <select
                        className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={formData.status || 'Active'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <DialogFooter className="gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => { setShowCreate(false); resetForm(); }} className="text-xs h-8">
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleCreate} disabled={saving || !formData.programOfferingId || !formData.courseCode || !formData.courseName || !formData.semester || !formData.courseType || !formData.credits} className="text-xs h-8">
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
              <FileText className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-muted-foreground">
                {searchQuery ? 'No matching courses found' : 'No course records yet'}
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
                      <TableCell className="text-xs font-mono font-medium">{record.courseCode}</TableCell>
                      <TableCell className="text-xs font-medium">{record.courseName}</TableCell>
                      <TableCell className="text-xs">{record.semester ?? '—'}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="text-[9px]">{record.courseType || '—'}</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-medium">{record.credits ?? '—'}</TableCell>
                      <TableCell className="text-xs">{record.theoryHours ?? '—'}</TableCell>
                      <TableCell className="text-xs">{record.labHours ?? '—'}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="secondary" className={cn('text-[9px]',
                          record.status === 'Active' && 'bg-emerald-500/10 text-emerald-600',
                          record.status === 'Inactive' && 'bg-gray-500/10 text-gray-600',
                          record.status === 'Proposed' && 'bg-blue-500/10 text-blue-600',
                        )}>
                          {record.status || '—'}
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

import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Upload,
  Download,
  Plus,
  Pencil,
  Trash2,
  BarChart3,
  PieChart,
  BookOpen,
  Users,
  AlertTriangle,
  FileUp,
  Loader2,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { institutionAdminService } from '@/services/institution-admin.service';
import {
  examinationRepositoryService,
  BacklogRecordApi,
  BacklogAnalyticsData,
} from '@/services/examination-repository.service';

interface BacklogRecord {
  id: string;
  academicYear: string;
  semester: string;
  program: string;
  department: string;
  subjectCode: string;
  subjectName: string;
  studentsAppeared: number;
  studentsPassed: number;
  studentsFailed: number;
}

interface TextFieldConfig {
  key: keyof BacklogRecord;
  label: string;
  type: 'text' | 'select' | 'number';
  placeholder?: string;
  readOnly?: boolean;
  /** Helper text shown under a read-only field. */
  readOnlyHint?: string;
  options?: string[];
  /**
   * Autofetches the option list from the institution's reference data so the
   * user picks a real entity. Falls back to a free-text input when the list
   * is unavailable.
   */
  autofetch?: 'programs' | 'departments';
}

/**
 * Update a form field and recompute any derived fields whose source values
 * just changed (e.g. studentsFailed = studentsAppeared - studentsPassed).
 */
function applyFieldValue(
  prev: BacklogRecord | null,
  field: TextFieldConfig,
  value: string | number
): BacklogRecord | null {
  if (!prev) return null;
  const next: BacklogRecord = { ...prev, [field.key]: value };
  // Students Failed is auto-calculated from Appeared - Passed and rendered
  // read-only in the form (clamped at 0).
  if (field.key === 'studentsAppeared' || field.key === 'studentsPassed') {
    next.studentsFailed = Math.max(0, next.studentsAppeared - next.studentsPassed);
  }
  return next;
}

const textFields: TextFieldConfig[] = [
  {
    key: 'academicYear',
    label: 'Academic Year',
    type: 'text',
    placeholder: 'e.g. 2024-25',
    // Academic year is always taken from the currently selected year —
    // it is displayed but cannot be edited (neither on create nor edit).
    readOnly: true,
  },
  { key: 'semester', label: 'Semester', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8'] },
  { key: 'program', label: 'Program', type: 'text', autofetch: 'programs', placeholder: 'Select a program' },
  { key: 'department', label: 'Department', type: 'text', autofetch: 'departments', placeholder: 'Select a department' },
  { key: 'subjectCode', label: 'Subject Code', type: 'text', placeholder: 'e.g. CS401' },
  { key: 'subjectName', label: 'Subject Name', type: 'text', placeholder: 'e.g. Machine Learning' },
  { key: 'studentsAppeared', label: 'Students Appeared', type: 'number' },
  { key: 'studentsPassed', label: 'Students Passed', type: 'number' },
  {
    key: 'studentsFailed',
    label: 'Students Failed',
    type: 'number',
    // Auto-calculated from Students Appeared - Students Passed and rendered
    // read-only in the form.
    readOnly: true,
    readOnlyHint: 'Auto-calculated: appeared - passed',
    placeholder: 'Auto-calculated',
  },
];

const PER_PAGE = 10;

function toRecord(rec: BacklogRecordApi): BacklogRecord {
  return {
    id: String(rec.id),
    academicYear: rec.academicYear,
    semester: rec.semester,
    program: rec.program,
    department: rec.department,
    subjectCode: rec.subjectCode,
    subjectName: rec.subjectName,
    studentsAppeared: rec.studentsAppeared,
    studentsPassed: rec.studentsPassed,
    studentsFailed: rec.studentsFailed,
  };
}

const passRateBadge = (rate?: number) => {
  const r = Math.round(rate ?? 0);
  return (
    <Badge
      variant="secondary"
      className={`text-[10px] ${
        r >= 75 ? 'bg-green-100 text-green-700' : r >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
      }`}
    >
      {r}%
    </Badge>
  );
};

export function BacklogRepository({ academicYear }: { academicYear: string }) {
  const [activeTab, setActiveTab] = useState('records');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [records, setRecords] = useState<BacklogRecord[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [analytics, setAnalytics] = useState<BacklogAnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BacklogRecord | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);

  // ── Institution reference data (for the program / department dropdowns) ──
  const [programOptions, setProgramOptions] = useState<string[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);

  useEffect(() => {
    institutionAdminService
      .getPrograms()
      .then((list) =>
        setProgramOptions(
          list
            .filter((p) => p.status === 'ACTIVE')
            .map((p) => p.name)
            .sort((a, b) => a.localeCompare(b))
        )
      )
      .catch(() => setProgramOptions([]));
    institutionAdminService
      .getDepartments()
      .then((list) =>
        setDepartmentOptions(
          list
            .filter((d) => d.status === 'ACTIVE')
            .map((d) => d.name)
            .sort((a, b) => a.localeCompare(b))
        )
      )
      .catch(() => setDepartmentOptions([]));
  }, []);

  const csvInputRef = useRef<HTMLInputElement>(null);

  // ── Debounce search ──
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, academicYear]);

  // ── Fetch records ──
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await examinationRepositoryService.getBacklogRecords({
        academicYear,
        search: debouncedSearch || undefined,
        page: currentPage - 1,
        size: PER_PAGE,
        sortBy: 'subjectCode',
        sortDirection: 'ASC',
      });
      setRecords(data.content.map(toRecord));
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
      if (data.totalPages > 0 && currentPage > data.totalPages) {
        setCurrentPage(data.totalPages);
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load backlog records');
      setRecords([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [academicYear, currentPage, debouncedSearch]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // ── Fetch analytics ──
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const data = await examinationRepositoryService.getBacklogAnalytics({ academicYear });
      setAnalytics(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load backlog analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  }, [academicYear]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExportCSV = async () => {
    try {
      await examinationRepositoryService.exportBacklogCsv({
        academicYear,
        search: debouncedSearch || undefined,
      });
      toast.success('CSV export started — check your downloads');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to export CSV');
    }
  };

  const handleUploadCsv = async (file: File) => {
    setUploading(true);
    try {
      const result = await examinationRepositoryService.uploadBacklogCsv(file, academicYear);
      toast.success(
        `${result.importedCount} records imported, ${result.failedCount} failed`
      );
      fetchRecords();
      fetchAnalytics();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload CSV');
    } finally {
      setUploading(false);
      if (csvInputRef.current) csvInputRef.current.value = '';
    }
  };

  const handleAddNew = () => {
    setEditingRecord({
      id: '',
      academicYear: academicYear,
      semester: '1',
      program: '',
      department: '',
      subjectCode: '',
      subjectName: '',
      studentsAppeared: 0,
      studentsPassed: 0,
      studentsFailed: 0,
    });
    setIsNewRecord(true);
    setEditDialogOpen(true);
  };

  const handleEdit = (record: BacklogRecord) => {
    setEditingRecord({ ...record });
    setIsNewRecord(false);
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingRecord) return;
    const payload: Record<string, unknown> = {
      academicYear: editingRecord.academicYear,
      semester: editingRecord.semester,
      program: editingRecord.program,
      department: editingRecord.department,
      subjectCode: editingRecord.subjectCode,
      subjectName: editingRecord.subjectName,
      studentsAppeared: editingRecord.studentsAppeared,
      studentsPassed: editingRecord.studentsPassed,
      studentsFailed: editingRecord.studentsFailed,
    };
    try {
      if (isNewRecord) {
        await examinationRepositoryService.createBacklogRecord(payload);
        toast.success('Backlog record created successfully');
        setCurrentPage(1);
      } else {
        await examinationRepositoryService.updateBacklogRecord(editingRecord.id, payload);
        toast.success('Backlog record updated successfully');
      }
      setEditDialogOpen(false);
      setEditingRecord(null);
      fetchRecords();
      fetchAnalytics();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save backlog record');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this backlog record? This cannot be undone.')) return;
    try {
      await examinationRepositoryService.deleteBacklogRecord(id);
      toast.success('Backlog record deleted successfully');
      if (records.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        fetchRecords();
      }
      fetchAnalytics();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete backlog record');
    }
  };

  const renderRecords = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Backlog Records</h3>
          <p className="text-sm text-muted-foreground">
            Institution-level backlog data for accreditation reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadCsv(file);
            }}
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={uploading}
            onClick={() => csvInputRef.current?.click()}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
            {uploading ? 'Uploading...' : 'Upload CSV'}
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV} disabled={loading}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button size="sm" className="gap-2" onClick={handleAddNew}>
            <Plus className="h-4 w-4" />
            Add Record
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search backlog records..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {loadError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-xs text-destructive flex-1">{loadError}</p>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={fetchRecords}>
            Retry
          </Button>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">All Backlog Records</CardTitle>
            <div className="flex items-center gap-2">
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
              <Badge variant="secondary">{totalElements} records</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs whitespace-nowrap">Academic Year</TableHead>
                  <TableHead className="text-xs whitespace-nowrap">Sem</TableHead>
                  <TableHead className="text-xs whitespace-nowrap">Program</TableHead>
                  <TableHead className="text-xs whitespace-nowrap">Department</TableHead>
                  <TableHead className="text-xs whitespace-nowrap">Subject Code</TableHead>
                  <TableHead className="text-xs whitespace-nowrap">Subject Name</TableHead>
                  <TableHead className="text-xs whitespace-nowrap text-right">Appeared</TableHead>
                  <TableHead className="text-xs whitespace-nowrap text-right">Passed</TableHead>
                  <TableHead className="text-xs whitespace-nowrap text-right">Failed</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Loading records...</p>
                    </TableCell>
                  </TableRow>
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      {loadError ? 'Unable to load records' : 'No records found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => (
                    <TableRow key={record.id} className="hover:bg-muted/50">
                      <TableCell className="text-sm whitespace-nowrap">{record.academicYear}</TableCell>
                      <TableCell className="text-sm">{record.semester}</TableCell>
                      <TableCell className="text-sm max-w-[150px] truncate">{record.program}</TableCell>
                      <TableCell className="text-sm">{record.department}</TableCell>
                      <TableCell className="text-sm font-mono">{record.subjectCode}</TableCell>
                      <TableCell className="text-sm max-w-[150px] truncate">{record.subjectName}</TableCell>
                      <TableCell className="text-sm text-right">{record.studentsAppeared}</TableCell>
                      <TableCell className="text-sm text-right text-emerald-600 font-medium">{record.studentsPassed}</TableCell>
                      <TableCell className="text-sm text-right text-red-600 font-medium">{record.studentsFailed}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(record)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(record.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted-foreground">
                Showing {totalElements === 0 ? 0 : (currentPage - 1) * PER_PAGE + 1} to{' '}
                {Math.min(currentPage * PER_PAGE, totalElements)} of {totalElements} records
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 w-7 text-xs p-0"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderDashboard = () => {
    const summary = analytics?.summary;
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Backlog Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Overview of backlog data by subject, department, and semester
          </p>
        </div>

        {analyticsLoading && !analytics ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !summary ? (
          <Card className="bg-muted/30">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No analytics available for {academicYear}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-l-4 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{summary.totalStudentsAppeared}</p>
                      <p className="text-xs text-muted-foreground">Total Students Appeared</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-emerald-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50">
                      <BookOpen className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{summary.totalStudentsPassed}</p>
                      <p className="text-xs text-muted-foreground">Total Students Passed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-50">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{summary.totalStudentsFailed}</p>
                      <p className="text-xs text-muted-foreground">Total Students Failed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subject-wise */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Subject-wise Backlogs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.subjectWise.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">No subject data</p>
                    )}
                    {analytics.subjectWise.map((s) => (
                      <div key={s.subjectCode} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{s.subjectName}</p>
                          <p className="text-[10px] text-muted-foreground">{s.subjectCode}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs shrink-0">
                          <span className="text-muted-foreground">A: {s.studentsAppeared}</span>
                          <span className="text-emerald-600 font-medium">P: {s.studentsPassed}</span>
                          <span className="text-red-600 font-medium">F: {s.studentsFailed}</span>
                          {passRateBadge(s.passPercentage)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Department-wise */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-primary" />
                    Department-wise Backlogs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.departmentWise.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">No department data</p>
                    )}
                    {analytics.departmentWise.map((d) => (
                      <div key={d.department} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                        <div>
                          <p className="text-sm font-medium">{d.department}</p>
                          <p className="text-[10px] text-muted-foreground">{d.studentsAppeared} total students</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-emerald-600">{d.studentsPassed} passed</span>
                          <span className="text-red-600">{d.studentsFailed} failed</span>
                          {passRateBadge(d.passPercentage)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Semester-wise */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Semester-wise Backlogs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.semesterWise.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">No semester data</p>
                    )}
                    {analytics.semesterWise.map((s) => (
                      <div key={s.semester} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                        <div>
                          <p className="text-sm font-medium">Sem {s.semester}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-muted-foreground">{s.studentsAppeared} appeared</span>
                          <span className="text-emerald-600">{s.studentsPassed} passed</span>
                          <span className="text-red-600">{s.studentsFailed} failed</span>
                          {passRateBadge(s.passPercentage)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="records" className="gap-2">
            <Table className="h-4 w-4" />
            Records
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics Dashboard
          </TabsTrigger>
        </TabsList>
        <TabsContent value="records" className="mt-6">
          {renderRecords()}
        </TabsContent>
        <TabsContent value="dashboard" className="mt-6">
          {renderDashboard()}
        </TabsContent>
      </Tabs>

      {/* Edit/Add Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNewRecord ? 'Add Backlog Record' : 'Edit Backlog Record'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {textFields.map((field) => {
              const fieldOptions =
                field.autofetch === 'programs'
                  ? programOptions
                  : field.autofetch === 'departments'
                  ? departmentOptions
                  : field.options ?? [];
              const useSelect =
                field.type === 'select' ||
                (field.autofetch && fieldOptions.length > 0);
              return (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-xs font-medium">{field.label}</Label>
                {useSelect ? (
                  <Select
                    value={String(editingRecord?.[field.key as keyof BacklogRecord] || '')}
                    onValueChange={(val) =>
                      setEditingRecord((prev) => applyFieldValue(prev, field, val))
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const currentValue = String(
                          editingRecord?.[field.key as keyof BacklogRecord] || ''
                        );
                        const items = [...fieldOptions];
                        // Keep the current value visible/selectable even if it is
                        // not in the fetched options (e.g. legacy free-text values).
                        if (currentValue && !items.includes(currentValue)) {
                          items.unshift(currentValue);
                        }
                        return items.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="relative">
                    <Input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={String(editingRecord?.[field.key] || '')}
                      disabled={field.readOnly}
                      onChange={(e) =>
                        setEditingRecord((prev) =>
                          applyFieldValue(
                            prev,
                            field,
                            field.type === 'number'
                              ? Number(e.target.value)
                              : e.target.value
                          )
                        )
                      }
                      placeholder={field.placeholder}
                      className={cn(
                        'h-9',
                        field.readOnly && 'bg-muted/50 cursor-not-allowed opacity-100 pr-8'
                      )}
                    />
                    {field.readOnly && (
                      <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    )}
                  </div>
                )}
                {field.readOnly && (
                  <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Lock className="h-2.5 w-2.5" />
                    {field.readOnlyHint ?? 'Fixed to the selected academic year'}
                  </p>
                )}
              </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isNewRecord ? 'Add Record' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

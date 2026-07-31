import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { studentService } from '@/services/student.service';
import {
  StudentProfileResponse,
  ScholarshipResponse,
  CreateScholarshipRequest,
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
  Wallet,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ── Select options ──

const ACADEMIC_YEAR_OPTIONS = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22'];
const SCHOLARSHIP_TYPE_OPTIONS = ['Government', 'Institutional', 'Private', 'NGO', 'Other'];
const FEE_WAIVER_OPTIONS = ['Full Waiver', 'Partial Waiver', 'No Waiver'];
const DISBURSEMENT_STATUS_OPTIONS = ['Disbursed', 'Pending', 'Rejected'];

// ── Empty form ──

const emptyScholarshipForm = (): CreateScholarshipRequest => ({
  scholarshipName: '',
  scholarshipType: undefined,
  provider: undefined,
  amount: undefined,
  academicYearId: undefined,
  feeWaiverStatus: undefined,
  disbursementStatus: 'Pending',
});

type ScholarshipForm = CreateScholarshipRequest;

export const StudentScholarshipTab = () => {
  const { user } = useAuth();
  const departmentId = user?.departmentId ?? 0;

  // Student selector
  const [students, setStudents] = useState<StudentProfileResponse[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Scholarship data
  const [scholarships, setScholarships] = useState<ScholarshipResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Form
  const [formData, setFormData] = useState<ScholarshipForm>(emptyScholarshipForm());
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

  // ── Fetch scholarships for selected student ──

  const fetchScholarships = useCallback(
    async (studentId: number) => {
      if (!departmentId) return;
      setLoading(true);
      setError(null);
      try {
        const result = await studentService.listScholarships(departmentId, studentId);
        setScholarships(result);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load scholarships';
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
      fetchScholarships(selectedStudentId);
    }
  }, [selectedStudentId, fetchScholarships]);

  // ── Search filtering ──

  const scholarshipMatchesSearch = (s: ScholarshipResponse, query: string): boolean => {
    const q = query.toLowerCase();
    return (
      s.scholarshipName.toLowerCase().includes(q) ||
      (s.scholarshipType?.toLowerCase().includes(q) ?? false) ||
      (s.provider?.toLowerCase().includes(q) ?? false) ||
      String(s.amount ?? '').includes(q) ||
      (s.feeWaiverStatus?.toLowerCase().includes(q) ?? false) ||
      s.disbursementStatus.toLowerCase().includes(q)
    );
  };

  const filteredScholarships = searchQuery
    ? scholarships.filter(s => scholarshipMatchesSearch(s, searchQuery))
    : scholarships;

  // ── Create ──

  const openCreateDialog = () => {
    setFormData(emptyScholarshipForm());
    setCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!departmentId || !selectedStudentId) return;
    if (!formData.scholarshipName) {
      toast.error('Scholarship Name is required');
      return;
    }
    setSaving(true);
    try {
      await studentService.addScholarship(departmentId, selectedStudentId, formData);
      toast.success('Scholarship record added successfully');
      setCreateDialogOpen(false);
      fetchScholarships(selectedStudentId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add scholarship record';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Download Template ──

  const handleDownloadTemplate = () => {
    const headers = [
      'Student Registration Number',
      'Scholarship Name',
      'Scholarship Type',
      'Provider/Agency',
      'Amount (INR)',
      'Academic Year',
      'Fee Waiver Status',
      'Disbursement Status',
    ];

    const sampleRow = [
      'REG2025001',
      'Merit Scholarship',
      'Government',
      'State Government',
      '50000',
      '2025-26',
      'Full Waiver',
      'Pending',
    ];

    const csvContent = `\ufeff${headers.join(',')}\n${sampleRow.join(',')}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_scholarship_template.csv';
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

  const getDisbursementBadge = (status: string) => {
    switch (status) {
      case 'Disbursed':
        return 'bg-emerald-500/10 text-emerald-600';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-600';
      case 'Rejected':
        return 'bg-red-500/10 text-red-600';
      default:
        return 'bg-gray-500/10 text-gray-600';
    }
  };

  const formatAmount = (amount: number | null | undefined): string => {
    if (amount == null) return '-';
    return `₹${amount.toLocaleString('en-IN')}`;
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
            <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-muted-foreground">No student selected</p>
            <p className="text-xs text-muted-foreground mt-1">
              Choose a student from the dropdown above to view or manage their scholarship details.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── Actions Card ── */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  Scholarships & Financial Support
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {scholarships.length} record{scholarships.length !== 1 ? 's' : ''}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => selectedStudentId && fetchScholarships(selectedStudentId)}
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
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Scholarship
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
                  <CardTitle className="text-sm font-semibold">Scholarship Records</CardTitle>
                  <CardDescription className="text-xs">
                    {loading
                      ? 'Loading scholarship data...'
                      : `Showing ${filteredScholarships.length} of ${scholarships.length} record${scholarships.length !== 1 ? 's' : ''}`}
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
                      <TableHead className="text-[10px] font-semibold">Scholarship Name</TableHead>
                      <TableHead className="text-[10px] font-semibold">Type</TableHead>
                      <TableHead className="text-[10px] font-semibold">Provider</TableHead>
                      <TableHead className="text-[10px] font-semibold">Amount</TableHead>
                      <TableHead className="text-[10px] font-semibold">Academic Year</TableHead>
                      <TableHead className="text-[10px] font-semibold">Fee Waiver</TableHead>
                      <TableHead className="text-[10px] font-semibold">Disbursement</TableHead>
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
                            <Skeleton className="h-4 w-28" />
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
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-14" />
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
                                selectedStudentId && fetchScholarships(selectedStudentId)
                              }
                            >
                              <RefreshCw className="h-3 w-3 mr-1" /> Retry
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Empty state */}
                    {!loading && !error && filteredScholarships.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Wallet className="h-8 w-8 opacity-40" />
                            <p className="text-xs">
                              {searchQuery
                                ? 'No scholarship records match your search.'
                                : 'No scholarship records found for this student. Click "Add Scholarship" to create one.'}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Data rows */}
                    {!loading &&
                      !error &&
                      filteredScholarships.map((s, index) => (
                        <TableRow key={s.id} className="hover:bg-muted/20">
                          <TableCell className="text-[10px] text-center text-muted-foreground font-mono p-1.5">
                            {index + 1}
                          </TableCell>
                          <TableCell className="text-xs p-1.5 font-medium">
                            {s.scholarshipName}
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5">
                            <Badge variant="outline" className="text-[9px]">
                              {s.scholarshipType || '-'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5">{s.provider || '-'}</TableCell>
                          <TableCell className="text-[10px] p-1.5 font-mono">
                            {formatAmount(s.amount)}
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5">
                            {getAcademicYearLabel(s.academicYearId)}
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5">
                            <Badge
                              variant="outline"
                              className={cn('text-[9px]', s.feeWaiverStatus && 'font-medium')}
                            >
                              {s.feeWaiverStatus || '-'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5">
                            <Badge
                              variant="secondary"
                              className={cn(
                                'text-[9px]',
                                getDisbursementBadge(s.disbursementStatus)
                              )}
                            >
                              {s.disbursementStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center p-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 opacity-40 cursor-not-allowed"
                              disabled
                              title="Update API not available yet"
                            >
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
            <DialogTitle className="text-sm">Add Scholarship Record</DialogTitle>
            <DialogDescription className="text-xs">
              Fill in the details to add a new scholarship record. Required fields are marked with
              *.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Scholarship Name *</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="e.g. Merit Scholarship"
                  value={formData.scholarshipName}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, scholarshipName: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Scholarship Type</Label>
                <Select
                  value={formData.scholarshipType || ''}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, scholarshipType: v || undefined }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHOLARSHIP_TYPE_OPTIONS.map(opt => (
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
                <Label className="text-xs font-medium">Provider / Agency</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="e.g. State Government"
                  value={formData.provider || ''}
                  onChange={e => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Amount (INR)</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 50000"
                  value={formData.amount ?? ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      amount: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
            </div>
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
                <Label className="text-xs font-medium">Fee Waiver Status</Label>
                <Select
                  value={formData.feeWaiverStatus || ''}
                  onValueChange={v =>
                    setFormData(prev => ({ ...prev, feeWaiverStatus: v || undefined }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {FEE_WAIVER_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="text-xs">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Disbursement Status</Label>
                <Select
                  value={formData.disbursementStatus || 'Pending'}
                  onValueChange={v => setFormData(prev => ({ ...prev, disbursementStatus: v }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISBURSEMENT_STATUS_OPTIONS.map(opt => (
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
              disabled={saving || !formData.scholarshipName}
            >
              {saving ? 'Adding...' : 'Add Scholarship'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

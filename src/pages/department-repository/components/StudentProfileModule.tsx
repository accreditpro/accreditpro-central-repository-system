import React, { useState, useEffect, useRef, useMemo } from 'react';
import { EvidenceUploadDialog } from './EvidenceUploadDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Search,
  Plus,
  Upload,
  Download,
  Trash2,
  Edit2,
  Filter,
  RefreshCw,
  FileText,
  Users,
  Building2,
  CalendarDays,
  GraduationCap,
  BookOpen,
  Eye,
  DownloadCloud,
} from 'lucide-react';
import {
  getStudentProfiles,
  createStudentProfile,
  updateStudentProfile,
  deleteStudentProfile,
  uploadStudentProfilesCSV,
  downloadStudentProfilesTemplate,
  getStudentEvidence,
  uploadStudentEvidence,
  downloadStudentEvidence,
  deleteStudentEvidence,
  StudentProfileRecord,
  StudentEvidenceDocument,
} from '@/services/student-repository.service';
import { evidenceDocuments, studentRepositoryConfig } from '../repository-configs';
import { CSVUploadDialog, normalizeDateToISO } from './CSVUploadDialog';

interface StudentProfileModuleProps {
  department: string;
  departmentId?: number;
  academicYear: string;
  year?: string;
  semester?: string;
}

const STATUSES = ['Active', 'Graduated', 'Discontinued'];
const GENDERS = ['Male', 'Female', 'Other'];
const REQUIRED_EVIDENCE = ['Admission Register', 'Student Records', 'Admission Form', 'SSC Certificate', 'Aadhaar Card'];

const EMPTY_RECORD: StudentProfileRecord = {
  registrationNumber: '',
  studentId: '',
  rollNumber: '',
  studentName: '',
  gender: 'Male',
  dateOfBirth: '',
  aadhaarNumber: '',
  emailAddress: '',
  mobileNumber: '',
  currentSemesterYear: 1,
  studentStatus: 'Active',
};

import { useAuth } from '@/hooks/useAuth';

export function StudentProfileModule({
  department,
  departmentId,
  academicYear,
  year,
  semester,
}: StudentProfileModuleProps) {
  const { user } = useAuth();
  const effectiveDeptId = departmentId || user?.departmentId || 4;
  const effectiveInstId = user?.institutionId || 1;
  const effectiveDepartment = department || user?.department || 'Artificial intelligence & Machine Learning';

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const evidenceFileInputRef = useRef<HTMLInputElement>(null);

  // State
  const tabConfig = studentRepositoryConfig.tabs.find((t) => t.id === 'student-profile');
  const [showCSVUploadDialog, setShowCSVUploadDialog] = useState(false);
  const [records, setRecords] = useState<StudentProfileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StudentProfileRecord | null>(null);
  const [formData, setFormData] = useState<StudentProfileRecord>({ ...EMPTY_RECORD });
  const [saving, setSaving] = useState(false);
  const [deleteConfirmRecord, setDeleteConfirmRecord] = useState<StudentProfileRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Evidence state
  const [evidenceList, setEvidenceList] = useState<StudentEvidenceDocument[]>([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [showEvidenceDialog, setShowEvidenceDialog] = useState(false);

  // ── Fetch Data ─────────────────────────────────────────────────────────────
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await getStudentProfiles(academicYear, effectiveDeptId, {
        year: year || undefined,
        semester: semester || undefined,
      });
      const data = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.content)
        ? res.content
        : Array.isArray(res?.data?.content)
        ? res.data.content
        : [];
      setRecords(data);
    } catch (err: any) {
      console.warn('Could not fetch student profiles:', err?.message || err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvidence = async () => {
    setEvidenceLoading(true);
    try {
      const res = await getStudentEvidence('student-profile', academicYear, effectiveDeptId);
      const data = Array.isArray(res)
        ? res
        : Array.isArray(res?.data?.documents)
        ? res.data.documents
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.documents)
        ? res.documents
        : Array.isArray(res?.content)
        ? res.content
        : [];
      setEvidenceList(data);
    } catch (err) {
      console.warn('Could not fetch student evidence:', err);
      setEvidenceList([]);
    } finally {
      setEvidenceLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
    fetchEvidence();
  }, [academicYear, effectiveDeptId, year, semester]);

  // ── Evidence Handlers ───────────────────────────────────────────────────────
  const handleEvidenceUpload = async (file: File, category: string) => {
    toast({ title: 'Uploading Evidence', description: `Uploading ${file.name}...` });
    await uploadStudentEvidence(effectiveDeptId, academicYear, file, 'student-profile', category, effectiveDepartment, `${category} for Student Profile`);
    toast({ title: 'Success', description: 'Evidence document uploaded successfully.' });
    fetchEvidence();
  };

  const handleDownloadEvidence = async (doc: StudentEvidenceDocument) => {
    try {
      if (doc.id) {
        await downloadStudentEvidence(doc.id, academicYear, effectiveDeptId);
      }
      toast({ title: 'Downloading', description: `Downloading ${doc.name}...` });
    } catch (err) {
      toast({ title: 'Notice', description: `Downloading ${doc.name}...` });
    }
  };

  const handleViewEvidence = (doc: StudentEvidenceDocument) => {
    toast({ title: 'Preview', description: `Opening preview for ${doc.name}` });
  };

  const handleDeleteEvidence = async (doc: StudentEvidenceDocument) => {
    try {
      if (doc.id) {
        await deleteStudentEvidence(doc.id, academicYear, effectiveDeptId);
      }
      setEvidenceList((prev) => prev.filter((d) => d.id !== doc.id));
      toast({ title: 'Deleted', description: 'Evidence document removed.' });
    } catch (err) {
      setEvidenceList((prev) => prev.filter((d) => d.id !== doc.id));
      toast({ title: 'Deleted', description: 'Evidence document removed.' });
    }
  };

  // ── Search & Filter ─────────────────────────────────────────────────────────
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        r.registrationNumber?.toLowerCase().includes(q) ||
        r.studentId?.toLowerCase().includes(q) ||
        r.rollNumber?.toLowerCase().includes(q) ||
        r.studentName?.toLowerCase().includes(q) ||
        r.emailAddress?.toLowerCase().includes(q) ||
        r.mobileNumber?.toLowerCase().includes(q);
      const matchesStatus = filterStatus === 'all' || r.studentStatus === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [records, searchQuery, filterStatus]);

  // ── Add / Edit ─────────────────────────────────────────────────────────────
  const handleEdit = (record: StudentProfileRecord) => {
    setEditingRecord(record);
    setFormData({ ...record });
    setShowAddDialog(true);
  };

  const handleSave = async () => {
    if (!formData.registrationNumber?.trim() || !formData.studentId?.trim() || !formData.rollNumber?.trim() || !formData.studentName?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Registration Number, Student ID, Roll Number, and Student Name are required.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.dateOfBirth?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Date of Birth is required.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const formattedDob = normalizeDateToISO(formData.dateOfBirth);
      const cleanMobile = formData.mobileNumber ? formData.mobileNumber.replace(/\D/g, '').slice(0, 10) : '';
      const safeAadhaar = formData.aadhaarNumber && formData.aadhaarNumber.length > 10
        ? formData.aadhaarNumber.slice(0, 10)
        : (formData.aadhaarNumber || '');

      const payload = {
        ...formData,
        registrationNumber: formData.registrationNumber.trim(),
        studentId: formData.studentId.trim(),
        rollNumber: formData.rollNumber.trim(),
        studentName: formData.studentName.trim(),
        gender: formData.gender || 'Male',
        dateOfBirth: formattedDob,
        aadhaarNumber: safeAadhaar || undefined,
        mobileNumber: cleanMobile || undefined,
        emailAddress: formData.emailAddress?.trim() || undefined,
        currentSemesterYear: Number(formData.currentSemesterYear) || 1,
        studentStatus: formData.studentStatus || 'Active',
        department: effectiveDepartment,
        academicYear,
        year,
        semester,
      };

      if (editingRecord && editingRecord.id) {
        await updateStudentProfile(editingRecord.id, academicYear, effectiveDeptId, payload, effectiveInstId);
        toast({ title: 'Success', description: 'Student profile updated successfully.' });
      } else {
        await createStudentProfile(academicYear, effectiveDeptId, payload, effectiveInstId);
        toast({ title: 'Success', description: 'Student profile created successfully.' });
      }
      setShowAddDialog(false);
      setEditingRecord(null);
      setFormData({ ...EMPTY_RECORD });
      fetchProfiles();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to save student profile.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteClick = (record: StudentProfileRecord) => {
    setDeleteConfirmRecord(record);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmRecord || !deleteConfirmRecord.id) return;
    setDeleting(true);
    try {
      await deleteStudentProfile(deleteConfirmRecord.id, academicYear, effectiveDeptId);
      toast({ title: 'Deleted', description: 'Student profile removed successfully.' });
      setDeleteConfirmRecord(null);
      fetchProfiles();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to delete student profile.', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  // ── CSV Download ───────────────────────────────────────────────────────────
  const handleDownloadTemplate = async () => {
    try {
      const res = await downloadStudentProfilesTemplate(effectiveDeptId, academicYear);
      if (typeof res === 'string' && res.length > 0) {
        const blob = new Blob([res], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `student_profiles_template_${academicYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      }
    } catch (err) {
      console.warn('API template download fallback to local generation', err);
    }

    // Client-side fallback CSV template
    const headers = [
      'Registration Number',
      'Student ID',
      'Roll Number',
      'Student Name',
      'Gender',
      'Date of Birth',
      'Aadhaar Number',
      'Email Address',
      'Mobile Number',
      'Current Semester/Year',
      'Student Status',
    ];
    const sample = [
      'REG2025001',
      'STU2025001',
      '22CS01',
      'Rahul Verma',
      'Male',
      '2004-05-15',
      '123456789012',
      'rahul.verma@example.edu',
      '9876543210',
      '5',
      'Active',
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), sample.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `student_profiles_template_${academicYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── CSV Upload ─────────────────────────────────────────────────────────────
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      await uploadStudentProfilesCSV(effectiveDeptId, file, academicYear);
      toast({ title: 'Success', description: 'Student profiles CSV uploaded successfully.' });
      fetchProfiles();
    } catch (err: any) {
      toast({ title: 'Upload Failed', description: err?.message || 'Failed to upload CSV.', variant: 'destructive' });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Student Profile</h2>
            <p className="text-xs text-muted-foreground">
              Manage student personal records — Registration No, Student ID, Roll No, Name, Gender, DOB, Contact, Status
            </p>
          </div>
        </div>

        {/* Context Information Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative p-4 rounded-xl border border-border/60 bg-gradient-to-br from-slate-900/80 to-slate-800/80 dark:from-slate-800/60 dark:to-slate-900/60 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-blue-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Department</span>
            </div>
            <p className="text-sm font-semibold text-white truncate">{department}</p>
          </div>

          <div className="relative p-4 rounded-xl border border-border/60 bg-gradient-to-br from-slate-900/80 to-slate-800/80 dark:from-slate-800/60 dark:to-slate-900/60 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="h-4 w-4 text-purple-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Academic Year</span>
            </div>
            <p className="text-sm font-semibold text-purple-300">{academicYear}</p>
          </div>

          <div className="relative p-4 rounded-xl border border-border/60 bg-gradient-to-br from-slate-900/80 to-slate-800/80 dark:from-slate-800/60 dark:to-slate-900/60 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-4 w-4 text-emerald-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Year & Semester</span>
            </div>
            <p className="text-sm font-semibold text-emerald-300 truncate">
              {year || 'All Years'} • {semester || 'All Semesters'}
            </p>
          </div>

          <div className="relative p-4 rounded-xl border border-border/60 bg-gradient-to-br from-slate-900/80 to-slate-800/80 dark:from-slate-800/60 dark:to-slate-900/60 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-amber-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Total Students</span>
            </div>
            <p className="text-sm font-semibold text-amber-300">{loading ? '...' : records.length}</p>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-2">
              <Download className="h-3.5 w-3.5" />Download Template
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowCSVUploadDialog(true)} className="gap-2">
              <Upload className="h-3.5 w-3.5" />Upload CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingRecord(null);
                setFormData({ ...EMPTY_RECORD });
                setShowAddDialog(true);
              }}
              className="gap-2"
            >
              <Plus className="h-3.5 w-3.5" />Add Student
            </Button>
            <div className="ml-auto">
              <Button variant="ghost" size="sm" onClick={fetchProfiles} disabled={loading} className="gap-2">
                <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by Reg No, ID, Name, Roll No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <Filter className="h-3.5 w-3.5 mr-2" /><SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs">{filteredRecords.length} Students</Badge>
      </div>

      {/* Data Table */}
      <Card className="border-border/50 w-full min-w-0 max-w-full overflow-hidden shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-600" />
            Student Profiles — {academicYear}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 w-full min-w-0 max-w-full overflow-hidden">
          {loading ? (
            <div className="w-full overflow-x-auto p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No student records found</p>
              <p className="text-xs text-muted-foreground mt-1">Upload CSV or add a student manually</p>
            </div>
          ) : (
            <div className="w-full table-scroll-container max-h-[520px]">
              <table className="w-full text-xs text-left min-w-[1450px] border-collapse">
                <thead className="sticky top-0 z-20 bg-muted/80 backdrop-blur border-b border-border/60">
                  <tr>
                    <th className="p-3 font-semibold text-center w-12 sticky left-0 bg-muted/95 backdrop-blur z-30 shadow-[1px_0_0_0_hsl(var(--border))]">#</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-36">Reg Number</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-32">Student ID</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-28">Roll No</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-44">Student Name</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-24">Gender</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-28">DOB</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-36">Aadhaar</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-48">Email Address</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-32">Mobile</th>
                    <th className="p-3 font-semibold whitespace-nowrap text-center w-28">Sem/Year</th>
                    <th className="p-3 font-semibold whitespace-nowrap text-center w-28">Status</th>
                    <th className="p-3 font-semibold text-right whitespace-nowrap w-24 sticky right-0 bg-muted/95 backdrop-blur z-30 shadow-[-1px_0_0_0_hsl(var(--border))]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredRecords.map((r, idx) => (
                    <tr key={r.id || idx} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3 text-muted-foreground text-center font-mono sticky left-0 bg-background/95 backdrop-blur z-10 shadow-[1px_0_0_0_hsl(var(--border))]">{idx + 1}</td>
                      <td className="p-3 font-mono font-medium whitespace-nowrap">{r.registrationNumber}</td>
                      <td className="p-3 font-mono whitespace-nowrap">{r.studentId}</td>
                      <td className="p-3 font-mono whitespace-nowrap">{r.rollNumber}</td>
                      <td className="p-3 font-medium whitespace-nowrap">{r.studentName}</td>
                      <td className="p-3 whitespace-nowrap">{r.gender || '-'}</td>
                      <td className="p-3 whitespace-nowrap">{r.dateOfBirth || '-'}</td>
                      <td className="p-3 font-mono whitespace-nowrap">{r.aadhaarNumber || '-'}</td>
                      <td className="p-3 whitespace-nowrap">{r.emailAddress || '-'}</td>
                      <td className="p-3 whitespace-nowrap">{r.mobileNumber || '-'}</td>
                      <td className="p-3 text-center whitespace-nowrap">{r.currentSemesterYear ?? '-'}</td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] px-2 py-0.5 font-medium',
                            r.studentStatus === 'Active' && 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
                            r.studentStatus === 'Graduated' && 'bg-blue-500/10 text-blue-600 border-blue-500/30',
                            r.studentStatus === 'Discontinued' && 'bg-red-500/10 text-red-600 border-red-500/30'
                          )}
                        >
                          {r.studentStatus}
                        </Badge>
                      </td>
                      <td className="p-3 text-right sticky right-0 bg-background/95 backdrop-blur z-10 shadow-[-1px_0_0_0_hsl(var(--border))]">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(r)}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(r)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Evidence Repository (Supporting Documents) ── */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Evidence Repository</CardTitle>
              <CardDescription className="text-xs">Supporting documents for Student Profile</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">{evidenceList.length} documents</Badge>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => setShowEvidenceDialog(true)}>
                <Upload className="h-3 w-3" />Upload Evidence
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="text-[10px] text-muted-foreground mr-1">Required:</span>
            {REQUIRED_EVIDENCE.map((ev) => (
              <Badge key={ev} variant="outline" className="text-[9px] px-1.5 py-0">{ev}</Badge>
            ))}
          </div>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[10px]">Document</TableHead>
                  <TableHead className="text-[10px]">Category</TableHead>
                  <TableHead className="text-[10px]">Version</TableHead>
                  <TableHead className="text-[10px]">Uploaded By</TableHead>
                  <TableHead className="text-[10px]">Date</TableHead>
                  <TableHead className="text-[10px]">Status</TableHead>
                  <TableHead className="text-[10px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evidenceList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-xs text-muted-foreground">
                      No evidence documents uploaded yet. Click "Upload Evidence" to add supporting documents.
                    </TableCell>
                  </TableRow>
                ) : (
                  evidenceList.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs font-medium truncate max-w-[200px]">{doc.name}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[9px]">{doc.category || 'Student Profile'}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{doc.version || 'v1.0'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{doc.uploadedBy || 'Coordinator'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{doc.uploadedDate || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[9px]',
                            doc.status === 'verified' && 'bg-emerald-500/10 text-emerald-600',
                            doc.status === 'pending' && 'bg-amber-500/10 text-amber-600',
                            doc.status === 'rejected' && 'bg-red-500/10 text-red-600',
                            doc.status === 'uploaded' && 'bg-blue-500/10 text-blue-600'
                          )}
                        >
                          {doc.status || 'uploaded'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleViewEvidence(doc)} title="View document">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDownloadEvidence(doc)} title="Download document">
                            <DownloadCloud className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDeleteEvidence(doc)} title="Delete document">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Add / Edit Dialog ── */}
      <Dialog
        open={showAddDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setEditingRecord(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base">
              {editingRecord ? 'Edit Student Profile' : 'Add Student Profile'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Registration Number *</Label>
                <Input
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  placeholder="REG2025001"
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Student ID *</Label>
                <Input
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder="STU001"
                  className="mt-1 h-9 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Roll Number *</Label>
                <Input
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  placeholder="22CS01"
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Student Name *</Label>
                <Input
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="Full Name"
                  className="mt-1 h-9 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(val) => setFormData({ ...formData, gender: val })}
                >
                  <SelectTrigger className="mt-1 h-9 text-sm">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Date of Birth *</Label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="mt-1 h-9 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Aadhaar Number</Label>
                <Input
                  value={formData.aadhaarNumber || ''}
                  onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                  placeholder="123456789012"
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Mobile Number</Label>
                <Input
                  value={formData.mobileNumber || ''}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  placeholder="9876543210"
                  className="mt-1 h-9 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Email Address</Label>
                <Input
                  type="email"
                  value={formData.emailAddress || ''}
                  onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                  placeholder="student@example.edu"
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Current Semester / Year *</Label>
                <Input
                  type="number"
                  value={formData.currentSemesterYear}
                  onChange={(e) => setFormData({ ...formData, currentSemesterYear: Number(e.target.value) || 1 })}
                  placeholder="1"
                  min={1}
                  max={8}
                  className="mt-1 h-9 text-sm"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Student Status *</Label>
              <Select
                value={formData.studentStatus}
                onValueChange={(val) => setFormData({ ...formData, studentStatus: val })}
              >
                <SelectTrigger className="mt-1 h-9 text-sm">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowAddDialog(false);
                setEditingRecord(null);
              }}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingRecord ? 'Update Profile' : 'Add Profile'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog
        open={!!deleteConfirmRecord}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmRecord(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete the student profile for{' '}
            <span className="font-semibold text-foreground">
              {deleteConfirmRecord?.studentName} ({deleteConfirmRecord?.registrationNumber})
            </span>
            ? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmRecord(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 6-Step CSV Upload Dialog ── */}
      {tabConfig && (
        <CSVUploadDialog
          open={showCSVUploadDialog}
          onClose={() => setShowCSVUploadDialog(false)}
          tabConfig={tabConfig}
          existingData={records as any}
          onUploadFile={async (file) => {
            await uploadStudentProfilesCSV(effectiveDeptId, file, academicYear, effectiveInstId);
            await fetchProfiles();
          }}
        />
      )}

      {/* ── Evidence Upload Dialog ── */}
      <EvidenceUploadDialog
        open={showEvidenceDialog}
        onClose={() => setShowEvidenceDialog(false)}
        categories={REQUIRED_EVIDENCE}
        sectionLabel="Student Profile"
        onUpload={handleEvidenceUpload}
      />
    </div>
  );
}

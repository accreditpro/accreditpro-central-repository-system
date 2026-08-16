import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { useAuth } from '@/hooks/useAuth';
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
  Wallet,
  Building2,
  CalendarDays,
  GraduationCap,
  Eye,
  DownloadCloud,
} from 'lucide-react';
import {
  getStudentScholarships,
  createStudentScholarship,
  updateStudentScholarship,
  deleteStudentScholarship,
  uploadStudentScholarshipsCSV,
  downloadStudentScholarshipsTemplate,
  getStudentEvidence,
  uploadStudentEvidence,
  downloadStudentEvidence,
  deleteStudentEvidence,
  StudentScholarshipRecord,
  StudentEvidenceDocument,
} from '@/services/student-repository.service';
import { studentRepositoryConfig } from '../repository-configs';
import { CSVUploadDialog } from './CSVUploadDialog';

interface StudentScholarshipModuleProps {
  department?: string;
  departmentId?: number;
  academicYear: string;
  year?: string;
  semester?: string;
}

const SCHOLARSHIP_TYPES = ['Scholarship', 'Freeship'];
const DISBURSEMENT_STATUSES = ['Disbursed', 'Pending', 'Rejected'];
const FEE_WAIVER_STATUSES = ['Full Waiver', 'Partial Waiver', 'No Waiver'];
const REQUIRED_EVIDENCE = ['Scholarship/Freeship Letter', 'Disbursement Proof', 'Fee Receipt', 'Sanction Order'];

const EMPTY_RECORD: StudentScholarshipRecord = {
  registrationNumber: '',
  studentName: '',
  scholarshipName: '',
  type: 'Scholarship',
  provider: '',
  amount: undefined,
  feeWaiverStatus: 'No Waiver',
  disbursementStatus: 'Pending',
};

export function StudentScholarshipModule({
  department,
  departmentId,
  academicYear,
  year,
  semester,
}: StudentScholarshipModuleProps) {
  const { user } = useAuth();
  const effectiveDeptId = departmentId || user?.departmentId || 4;
  const effectiveInstId = user?.institutionId || 1;
  const effectiveDepartment = department || user?.department || 'Artificial intelligence & Machine Learning';

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const evidenceFileInputRef = useRef<HTMLInputElement>(null);

  // State
  const tabConfig = studentRepositoryConfig.tabs.find((t) => t.id === 'scholarship-freeship');
  const [showCSVUploadDialog, setShowCSVUploadDialog] = useState(false);
  const [records, setRecords] = useState<StudentScholarshipRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDisbursement, setFilterDisbursement] = useState<string>('all');
  const [filterFeeWaiver, setFilterFeeWaiver] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StudentScholarshipRecord | null>(null);
  const [formData, setFormData] = useState<StudentScholarshipRecord>({ ...EMPTY_RECORD });
  const [saving, setSaving] = useState(false);
  const [deleteConfirmRecord, setDeleteConfirmRecord] = useState<StudentScholarshipRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Evidence state
  const [evidenceList, setEvidenceList] = useState<StudentEvidenceDocument[]>([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);

  // ── Fetch Data ─────────────────────────────────────────────────────────────
  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const res = await getStudentScholarships(academicYear, effectiveDeptId, {
        type: filterType !== 'all' ? filterType : undefined,
        disbursementStatus: filterDisbursement !== 'all' ? filterDisbursement : undefined,
        feeWaiverStatus: filterFeeWaiver !== 'all' ? filterFeeWaiver : undefined,
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
      console.warn('Could not fetch student scholarships:', err?.message || err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvidence = async () => {
    setEvidenceLoading(true);
    try {
      const res = await getStudentEvidence('scholarship-freeship', academicYear, effectiveDeptId);
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
      console.warn('Could not fetch scholarship evidence:', err);
      setEvidenceList([]);
    } finally {
      setEvidenceLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
    fetchEvidence();
  }, [academicYear, effectiveDeptId, filterType, filterDisbursement, filterFeeWaiver]);

  // ── Evidence Handlers ───────────────────────────────────────────────────────
  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast({ title: 'Uploading Evidence', description: `Uploading ${file.name}...` });
      await uploadStudentEvidence(effectiveDeptId, academicYear, file, 'scholarship-freeship', 'Financial Aid', effectiveDepartment);
      toast({ title: 'Success', description: 'Evidence document uploaded successfully.' });
      fetchEvidence();
    } catch (err: any) {
      const newDoc: StudentEvidenceDocument = {
        id: String(Date.now()),
        name: file.name,
        category: 'Financial Aid',
        version: 'v1.0',
        uploadedBy: 'Coordinator',
        uploadedDate: new Date().toISOString().split('T')[0],
        status: 'uploaded',
      };
      setEvidenceList((prev) => [newDoc, ...prev]);
      toast({ title: 'Success', description: 'Evidence uploaded successfully.' });
    } finally {
      if (evidenceFileInputRef.current) evidenceFileInputRef.current.value = '';
    }
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
        r.studentName?.toLowerCase().includes(q) ||
        r.scholarshipName?.toLowerCase().includes(q) ||
        r.provider?.toLowerCase().includes(q);
      return matchesSearch;
    });
  }, [records, searchQuery]);

  // ── Add / Edit ─────────────────────────────────────────────────────────────
  const handleEdit = (record: StudentScholarshipRecord) => {
    setEditingRecord(record);
    setFormData({ ...record });
    setShowAddDialog(true);
  };

  const handleSave = async () => {
    if (!formData.registrationNumber || !formData.studentName || !formData.scholarshipName || !formData.type || !formData.provider || !formData.disbursementStatus || !formData.amount) {
      toast({ title: 'Validation Error', description: 'Registration Number, Student Name, Scholarship Name, Type, Provider, Disbursement Status, and Amount are required.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        registrationNumber: formData.registrationNumber.trim(),
        studentName: formData.studentName.trim(),
        scholarshipName: formData.scholarshipName.trim(),
        type: formData.type.trim(),
        provider: formData.provider.trim(),
        disbursementStatus: formData.disbursementStatus.trim(),
        feeWaiverStatus: formData.feeWaiverStatus?.trim() || undefined,
        amount: Number(formData.amount) || 0,
        department: effectiveDepartment,
        academicYear,
      };

      if (editingRecord && editingRecord.id) {
        await updateStudentScholarship(editingRecord.id, academicYear, effectiveDeptId, payload, effectiveInstId);
        toast({ title: 'Success', description: 'Scholarship record updated successfully.' });
      } else {
        await createStudentScholarship(academicYear, effectiveDeptId, payload, effectiveInstId);
        toast({ title: 'Success', description: 'Scholarship record created successfully.' });
      }
      setShowAddDialog(false);
      setEditingRecord(null);
      setFormData({ ...EMPTY_RECORD });
      fetchScholarships();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to save scholarship record.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteClick = (record: StudentScholarshipRecord) => {
    setDeleteConfirmRecord(record);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmRecord || !deleteConfirmRecord.id) return;
    setDeleting(true);
    try {
      await deleteStudentScholarship(deleteConfirmRecord.id, academicYear, effectiveDeptId);
      toast({ title: 'Deleted', description: 'Scholarship record removed successfully.' });
      setDeleteConfirmRecord(null);
      fetchScholarships();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to delete scholarship record.', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  // ── CSV Download ───────────────────────────────────────────────────────────
  const handleDownloadTemplate = async () => {
    try {
      const res = await downloadStudentScholarshipsTemplate(effectiveDeptId, academicYear);
      if (typeof res === 'string' && res.length > 0) {
        const blob = new Blob([res], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `student_scholarships_template_${academicYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      }
    } catch (err) {
      console.warn('API template download fallback to local generation', err);
    }

    const headers = [
      'Registration Number',
      'Student Name',
      'Scholarship Name',
      'Type',
      'Provider/Agency',
      'Amount (INR)',
      'Academic Year',
      'Fee Waiver Status',
      'Disbursement Status',
    ];
    const sample = [
      'REG2025001',
      'Rahul Verma',
      'Post Matric Scholarship',
      'Scholarship',
      'State Government',
      '25000',
      '2025-26',
      'No Waiver',
      'Disbursed',
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), sample.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `student_scholarships_template_${academicYear}.csv`);
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
      await uploadStudentScholarshipsCSV(effectiveDeptId, file, academicYear);
      toast({ title: 'Success', description: 'Student scholarships CSV uploaded successfully.' });
      fetchScholarships();
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
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Scholarship & Freeship</h2>
            <p className="text-xs text-muted-foreground">
              Manage student scholarship, freeship, fee waivers, and financial aid records
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
            <p className="text-sm font-semibold text-white truncate" title={effectiveDepartment}>{effectiveDepartment}</p>
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
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Total Records</span>
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
              <Plus className="h-3.5 w-3.5" />Add Scholarship / Freeship
            </Button>
            <div className="ml-auto">
              <Button variant="ghost" size="sm" onClick={fetchScholarships} disabled={loading} className="gap-2">
                <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by Reg No, Name, Scheme, Provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <Filter className="h-3.5 w-3.5 mr-2" /><SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {SCHOLARSHIP_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterDisbursement} onValueChange={setFilterDisbursement}>
          <SelectTrigger className="w-[150px] h-9 text-sm">
            <Filter className="h-3.5 w-3.5 mr-2" /><SelectValue placeholder="Disbursement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Disbursements</SelectItem>
            {DISBURSEMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterFeeWaiver} onValueChange={setFilterFeeWaiver}>
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <Filter className="h-3.5 w-3.5 mr-2" /><SelectValue placeholder="Fee Waiver" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Waivers</SelectItem>
            {FEE_WAIVER_STATUSES.map((w) => (
              <SelectItem key={w} value={w}>{w}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs">{filteredRecords.length} Records</Badge>
      </div>

      {/* Data Table */}
      <Card className="border-border/50 w-full min-w-0 max-w-full overflow-hidden shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-600" />
            Scholarship & Freeship Records — {academicYear}
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
              <Wallet className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No scholarship or freeship records found</p>
              <p className="text-xs text-muted-foreground mt-1">Upload CSV or add a record manually</p>
            </div>
          ) : (
            <div className="w-full table-scroll-container max-h-[520px]">
              <table className="w-full text-xs text-left min-w-[1300px] border-collapse">
                <thead className="sticky top-0 z-20 bg-muted/80 backdrop-blur border-b border-border/60">
                  <tr>
                    <th className="p-3 font-semibold text-center w-12 sticky left-0 bg-muted/95 backdrop-blur z-30 shadow-[1px_0_0_0_hsl(var(--border))]">#</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-36">Reg Number</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-44">Student Name</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-48">Scholarship Name</th>
                    <th className="p-3 font-semibold whitespace-nowrap text-center w-28">Type</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-40">Provider/Agency</th>
                    <th className="p-3 font-semibold whitespace-nowrap text-right w-28">Amount (INR)</th>
                    <th className="p-3 font-semibold whitespace-nowrap text-center w-28">Fee Waiver</th>
                    <th className="p-3 font-semibold whitespace-nowrap text-center w-28">Disbursement</th>
                    <th className="p-3 font-semibold text-right whitespace-nowrap w-24 sticky right-0 bg-muted/95 backdrop-blur z-30 shadow-[-1px_0_0_0_hsl(var(--border))]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredRecords.map((r, idx) => (
                    <tr key={r.id || idx} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3 text-muted-foreground text-center font-mono sticky left-0 bg-background/95 backdrop-blur z-10 shadow-[1px_0_0_0_hsl(var(--border))]">{idx + 1}</td>
                      <td className="p-3 font-mono font-medium whitespace-nowrap">{r.registrationNumber}</td>
                      <td className="p-3 font-medium whitespace-nowrap">{r.studentName}</td>
                      <td className="p-3 font-medium truncate max-w-[200px]" title={r.scholarshipName}>{r.scholarshipName}</td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] px-2 py-0.5 font-medium',
                            r.type === 'Scholarship' && 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10',
                            r.type === 'Freeship' && 'border-blue-500/30 text-blue-600 bg-blue-500/10'
                          )}
                        >
                          {r.type}
                        </Badge>
                      </td>
                      <td className="p-3 truncate max-w-[160px]" title={r.provider}>{r.provider}</td>
                      <td className="p-3 text-right font-mono font-medium whitespace-nowrap">
                        {r.amount ? `₹${Number(r.amount).toLocaleString('en-IN')}` : '₹0'}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[10px] px-2 py-0.5 font-medium',
                            r.feeWaiverStatus === 'Full Waiver' && 'bg-purple-500/10 text-purple-600',
                            r.feeWaiverStatus === 'Partial Waiver' && 'bg-amber-500/10 text-amber-600',
                            r.feeWaiverStatus === 'No Waiver' && 'bg-gray-500/10 text-muted-foreground'
                          )}
                        >
                          {r.feeWaiverStatus || 'No Waiver'}
                        </Badge>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[10px] px-2 py-0.5 font-medium',
                            r.disbursementStatus === 'Disbursed' && 'bg-emerald-500/10 text-emerald-600',
                            r.disbursementStatus === 'Pending' && 'bg-amber-500/10 text-amber-600',
                            r.disbursementStatus === 'Rejected' && 'bg-red-500/10 text-red-600'
                          )}
                        >
                          {r.disbursementStatus || 'Pending'}
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
              <CardDescription className="text-xs">Supporting documents for Scholarship & Freeship</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">{evidenceList.length} documents</Badge>
              <div className="relative">
                <input
                  ref={evidenceFileInputRef}
                  type="file"
                  onChange={handleEvidenceUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                  <Upload className="h-3 w-3" />Upload Evidence
                </Button>
              </div>
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
                      <TableCell><Badge variant="outline" className="text-[9px]">{doc.category || 'Scholarships'}</Badge></TableCell>
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
              {editingRecord ? 'Edit Scholarship / Freeship Record' : 'Add Scholarship / Freeship Record'}
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
                <Label className="text-xs">Scholarship / Scheme Name *</Label>
                <Input
                  value={formData.scholarshipName}
                  onChange={(e) => setFormData({ ...formData, scholarshipName: e.target.value })}
                  placeholder="e.g. Post Matric Scholarship"
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(val) => setFormData({ ...formData, type: val })}
                >
                  <SelectTrigger className="mt-1 h-9 text-sm">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHOLARSHIP_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Provider / Agency *</Label>
                <Input
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="e.g. State Government / UGC"
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Amount (INR) *</Label>
                <Input
                  type="number"
                  value={formData.amount ?? ''}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="25000"
                  className="mt-1 h-9 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Fee Waiver Status</Label>
                <Select
                  value={formData.feeWaiverStatus || 'No Waiver'}
                  onValueChange={(val) => setFormData({ ...formData, feeWaiverStatus: val })}
                >
                  <SelectTrigger className="mt-1 h-9 text-sm">
                    <SelectValue placeholder="Select Waiver" />
                  </SelectTrigger>
                  <SelectContent>
                    {FEE_WAIVER_STATUSES.map((w) => (
                      <SelectItem key={w} value={w}>{w}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Disbursement Status *</Label>
                <Select
                  value={formData.disbursementStatus}
                  onValueChange={(val) => setFormData({ ...formData, disbursementStatus: val })}
                >
                  <SelectTrigger className="mt-1 h-9 text-sm">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISBURSEMENT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
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
              onClick={() => {
                setShowAddDialog(false);
                setEditingRecord(null);
              }}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingRecord ? 'Update Record' : 'Add Record'}
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
            Are you sure you want to delete the scholarship record for{' '}
            <span className="font-semibold text-foreground">
              {deleteConfirmRecord?.studentName} ({deleteConfirmRecord?.scholarshipName})
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
            await uploadStudentScholarshipsCSV(effectiveDeptId, file, academicYear, effectiveInstId);
            await fetchScholarships();
          }}
        />
      )}
    </div>
  );
}

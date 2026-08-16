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
  Users,
  Building2,
  CalendarDays,
  GraduationCap,
  BookOpen,
  Eye,
  DownloadCloud,
} from 'lucide-react';
import {
  getStudentDiversity,
  createStudentDiversity,
  updateStudentDiversity,
  deleteStudentDiversity,
  uploadStudentDiversityCSV,
  downloadStudentDiversityTemplate,
  getStudentEvidence,
  uploadStudentEvidence,
  downloadStudentEvidence,
  deleteStudentEvidence,
  StudentDiversityRecord,
  StudentEvidenceDocument,
} from '@/services/student-repository.service';
import { studentRepositoryConfig } from '../repository-configs';
import { CSVUploadDialog } from './CSVUploadDialog';

interface StudentDiversityModuleProps {
  department?: string;
  departmentId?: number;
  academicYear: string;
  year?: string;
  semester?: string;
}

const SOCIAL_CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];
const YES_NO_OPTIONS = ['Yes', 'No'];
const REQUIRED_EVIDENCE = ['Admission Records', 'Student Records', 'Medical Certificate', 'Passport', 'Self Declaration'];

const EMPTY_RECORD: StudentDiversityRecord = {
  registrationNumber: '',
  studentName: '',
  socialCategory: 'General',
  economicallyWeakerSection: 'No',
  minorityStatus: 'No',
  differentlyAbled: 'No',
  nationality: 'Indian',
  firstGenerationLearner: 'No',
};

export function StudentDiversityModule({
  department,
  departmentId,
  academicYear,
  year,
  semester,
}: StudentDiversityModuleProps) {
  const { user } = useAuth();
  const effectiveDeptId = departmentId || user?.departmentId || 4;
  const effectiveInstId = user?.institutionId || 1;
  const effectiveDepartment = department || user?.department || 'Artificial intelligence & Machine Learning';

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const evidenceFileInputRef = useRef<HTMLInputElement>(null);

  // State
  const tabConfig = studentRepositoryConfig.tabs.find((t) => t.id === 'student-diversity');
  const [showCSVUploadDialog, setShowCSVUploadDialog] = useState(false);
  const [records, setRecords] = useState<StudentDiversityRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterEWS, setFilterEWS] = useState<string>('all');
  const [filterDifferentlyAbled, setFilterDifferentlyAbled] = useState<string>('all');
  const [filterMinority, setFilterMinority] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StudentDiversityRecord | null>(null);
  const [formData, setFormData] = useState<StudentDiversityRecord>({ ...EMPTY_RECORD });
  const [saving, setSaving] = useState(false);
  const [deleteConfirmRecord, setDeleteConfirmRecord] = useState<StudentDiversityRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Evidence state
  const [evidenceList, setEvidenceList] = useState<StudentEvidenceDocument[]>([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [showEvidenceDialog, setShowEvidenceDialog] = useState(false);

  // ── Fetch Data ─────────────────────────────────────────────────────────────
  const fetchDiversity = async () => {
    setLoading(true);
    try {
      const res = await getStudentDiversity(academicYear, effectiveDeptId, {
        socialCategory: filterCategory !== 'all' ? filterCategory : undefined,
        differentlyAbled: filterDifferentlyAbled !== 'all' ? filterDifferentlyAbled : undefined,
        minorityStatus: filterMinority !== 'all' ? filterMinority : undefined,
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
      console.warn('Could not fetch student diversity:', err?.message || err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvidence = async () => {
    setEvidenceLoading(true);
    try {
      const res = await getStudentEvidence('student-diversity', academicYear, effectiveDeptId);
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
      console.warn('Could not fetch student diversity evidence:', err);
      setEvidenceList([]);
    } finally {
      setEvidenceLoading(false);
    }
  };

  useEffect(() => {
    fetchDiversity();
    fetchEvidence();
  }, [academicYear, effectiveDeptId, filterCategory, filterEWS, filterDifferentlyAbled, filterMinority]);

  // ── Evidence Handlers ───────────────────────────────────────────────────────
  const handleEvidenceUpload = async (file: File, category: string) => {
    toast({ title: 'Uploading Evidence', description: `Uploading ${file.name}...` });
    await uploadStudentEvidence(effectiveDeptId, academicYear, file, 'student-diversity', category, effectiveDepartment, `${category} for Student Diversity`);
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
        r.studentName?.toLowerCase().includes(q) ||
        r.nationality?.toLowerCase().includes(q);
      const matchesEWS = filterEWS === 'all' || r.economicallyWeakerSection === filterEWS;
      return matchesSearch && matchesEWS;
    });
  }, [records, searchQuery, filterEWS]);

  // ── Add / Edit ─────────────────────────────────────────────────────────────
  const handleEdit = (record: StudentDiversityRecord) => {
    setEditingRecord(record);
    setFormData({ ...record });
    setShowAddDialog(true);
  };

  const handleSave = async () => {
    if (!formData.registrationNumber || !formData.studentName || !formData.socialCategory) {
      toast({ title: 'Validation Error', description: 'Registration Number, Student Name, and Social Category are required.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        registrationNumber: formData.registrationNumber.trim(),
        studentName: formData.studentName.trim(),
        socialCategory: formData.socialCategory.trim(),
        economicallyWeakerSection: formData.economicallyWeakerSection?.trim() || undefined,
        minorityStatus: formData.minorityStatus?.trim() || undefined,
        differentlyAbled: formData.differentlyAbled?.trim() || undefined,
        nationality: formData.nationality?.trim() || undefined,
        firstGenerationLearner: formData.firstGenerationLearner?.trim() || undefined,
        department: effectiveDepartment,
        academicYear,
      };

      if (editingRecord && editingRecord.id) {
        await updateStudentDiversity(editingRecord.id, academicYear, effectiveDeptId, payload, effectiveInstId);
        toast({ title: 'Success', description: 'Diversity record updated successfully.' });
      } else {
        await createStudentDiversity(academicYear, effectiveDeptId, payload, effectiveInstId);
        toast({ title: 'Success', description: 'Diversity record created successfully.' });
      }
      setShowAddDialog(false);
      setEditingRecord(null);
      setFormData({ ...EMPTY_RECORD });
      fetchDiversity();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to save diversity record.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteClick = (record: StudentDiversityRecord) => {
    setDeleteConfirmRecord(record);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmRecord || !deleteConfirmRecord.id) return;
    setDeleting(true);
    try {
      await deleteStudentDiversity(deleteConfirmRecord.id, academicYear, effectiveDeptId);
      toast({ title: 'Deleted', description: 'Diversity record removed successfully.' });
      setDeleteConfirmRecord(null);
      fetchDiversity();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to delete diversity record.', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  // ── CSV Download ───────────────────────────────────────────────────────────
  const handleDownloadTemplate = async () => {
    try {
      const res = await downloadStudentDiversityTemplate(effectiveDeptId, academicYear);
      if (typeof res === 'string' && res.length > 0) {
        const blob = new Blob([res], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `student_diversity_template_${academicYear}.csv`);
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
      'Social Category',
      'Economically Weaker Section',
      'Minority Status',
      'Differently Abled',
      'Nationality',
      'First Generation Learner',
    ];
    const sample = [
      'REG2025001',
      'Rahul Verma',
      'General',
      'No',
      'No',
      'No',
      'Indian',
      'No',
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), sample.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `student_diversity_template_${academicYear}.csv`);
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
      await uploadStudentDiversityCSV(effectiveDeptId, file, academicYear);
      toast({ title: 'Success', description: 'Student diversity CSV uploaded successfully.' });
      fetchDiversity();
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
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Student Diversity</h2>
            <p className="text-xs text-muted-foreground">
              Manage student demographic & diversity records — Social Category, EWS, Minority, PwD, Nationality, and 1st Gen Learner
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
              <Plus className="h-3.5 w-3.5" />Add Diversity Record
            </Button>
            <div className="ml-auto">
              <Button variant="ghost" size="sm" onClick={fetchDiversity} disabled={loading} className="gap-2">
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
            placeholder="Search by Reg No, Name, Nationality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <Filter className="h-3.5 w-3.5 mr-2" /><SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {SOCIAL_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterEWS} onValueChange={setFilterEWS}>
          <SelectTrigger className="w-[120px] h-9 text-sm">
            <Filter className="h-3.5 w-3.5 mr-2" /><SelectValue placeholder="EWS" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">EWS: All</SelectItem>
            <SelectItem value="Yes">EWS: Yes</SelectItem>
            <SelectItem value="No">EWS: No</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterDifferentlyAbled} onValueChange={setFilterDifferentlyAbled}>
          <SelectTrigger className="w-[120px] h-9 text-sm">
            <Filter className="h-3.5 w-3.5 mr-2" /><SelectValue placeholder="PwD" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">PwD: All</SelectItem>
            <SelectItem value="Yes">PwD: Yes</SelectItem>
            <SelectItem value="No">PwD: No</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterMinority} onValueChange={setFilterMinority}>
          <SelectTrigger className="w-[130px] h-9 text-sm">
            <Filter className="h-3.5 w-3.5 mr-2" /><SelectValue placeholder="Minority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Minority: All</SelectItem>
            <SelectItem value="Yes">Minority: Yes</SelectItem>
            <SelectItem value="No">Minority: No</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs">{filteredRecords.length} Records</Badge>
      </div>

      {/* Data Table */}
      <Card className="border-border/50 w-full min-w-0 max-w-full overflow-hidden shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600" />
            Student Diversity Records — {academicYear}
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
              <p className="text-sm text-muted-foreground font-medium">No diversity records found</p>
              <p className="text-xs text-muted-foreground mt-1">Upload CSV or add a diversity record manually</p>
            </div>
          ) : (
            <div className="w-full table-scroll-container max-h-[520px]">
              <table className="w-full text-xs text-left min-w-[1250px] border-collapse">
                <thead className="sticky top-0 z-20 bg-muted/80 backdrop-blur border-b border-border/60">
                  <tr>
                    <th className="p-3 font-semibold text-center w-12 sticky left-0 bg-muted/95 backdrop-blur z-30 shadow-[1px_0_0_0_hsl(var(--border))]">#</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-36">Reg Number</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-44">Student Name</th>
                    <th className="p-3 font-semibold whitespace-nowrap text-center w-28">Social Category</th>
                    <th className="p-3 font-semibold whitespace-nowrap text-center w-24">EWS</th>
                    <th className="p-3 font-semibold whitespace-nowrap text-center w-24">Minority</th>
                    <th className="p-3 font-semibold whitespace-nowrap text-center w-28">Differently Abled</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-32">Nationality</th>
                    <th className="p-3 font-semibold whitespace-nowrap text-center w-28">1st Gen Learner</th>
                    <th className="p-3 font-semibold text-right whitespace-nowrap w-24 sticky right-0 bg-muted/95 backdrop-blur z-30 shadow-[-1px_0_0_0_hsl(var(--border))]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredRecords.map((r, idx) => (
                    <tr key={r.id || idx} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3 text-muted-foreground text-center font-mono sticky left-0 bg-background/95 backdrop-blur z-10 shadow-[1px_0_0_0_hsl(var(--border))]">{idx + 1}</td>
                      <td className="p-3 font-mono font-medium whitespace-nowrap">{r.registrationNumber}</td>
                      <td className="p-3 font-medium whitespace-nowrap">{r.studentName}</td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-medium">
                          {r.socialCategory}
                        </Badge>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[10px] px-2 py-0.5 font-medium',
                            r.economicallyWeakerSection === 'Yes' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-gray-500/10 text-muted-foreground'
                          )}
                        >
                          {r.economicallyWeakerSection || 'No'}
                        </Badge>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[10px] px-2 py-0.5 font-medium',
                            r.minorityStatus === 'Yes' ? 'bg-purple-500/10 text-purple-600' : 'bg-gray-500/10 text-muted-foreground'
                          )}
                        >
                          {r.minorityStatus || 'No'}
                        </Badge>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[10px] px-2 py-0.5 font-medium',
                            r.differentlyAbled === 'Yes' ? 'bg-amber-500/10 text-amber-600' : 'bg-gray-500/10 text-muted-foreground'
                          )}
                        >
                          {r.differentlyAbled || 'No'}
                        </Badge>
                      </td>
                      <td className="p-3 whitespace-nowrap">{r.nationality || 'Indian'}</td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[10px] px-2 py-0.5 font-medium',
                            r.firstGenerationLearner === 'Yes' ? 'bg-blue-500/10 text-blue-600' : 'bg-gray-500/10 text-muted-foreground'
                          )}
                        >
                          {r.firstGenerationLearner || 'No'}
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
              <CardDescription className="text-xs">Supporting documents for Student Diversity</CardDescription>
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
                      <TableCell><Badge variant="outline" className="text-[9px]">{doc.category || 'Student Diversity'}</Badge></TableCell>
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
              {editingRecord ? 'Edit Diversity Record' : 'Add Diversity Record'}
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
                <Label className="text-xs">Social Category *</Label>
                <Select
                  value={formData.socialCategory}
                  onValueChange={(val) => setFormData({ ...formData, socialCategory: val })}
                >
                  <SelectTrigger className="mt-1 h-9 text-sm">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOCIAL_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Economically Weaker Section (EWS)</Label>
                <Select
                  value={formData.economicallyWeakerSection || 'No'}
                  onValueChange={(val) => setFormData({ ...formData, economicallyWeakerSection: val })}
                >
                  <SelectTrigger className="mt-1 h-9 text-sm">
                    <SelectValue placeholder="Select EWS" />
                  </SelectTrigger>
                  <SelectContent>
                    {YES_NO_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Minority Status</Label>
                <Select
                  value={formData.minorityStatus || 'No'}
                  onValueChange={(val) => setFormData({ ...formData, minorityStatus: val })}
                >
                  <SelectTrigger className="mt-1 h-9 text-sm">
                    <SelectValue placeholder="Select Minority Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {YES_NO_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Differently Abled (PwD)</Label>
                <Select
                  value={formData.differentlyAbled || 'No'}
                  onValueChange={(val) => setFormData({ ...formData, differentlyAbled: val })}
                >
                  <SelectTrigger className="mt-1 h-9 text-sm">
                    <SelectValue placeholder="Select PwD Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {YES_NO_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Nationality</Label>
                <Input
                  value={formData.nationality || 'Indian'}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  placeholder="Indian"
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">First Generation Learner</Label>
                <Select
                  value={formData.firstGenerationLearner || 'No'}
                  onValueChange={(val) => setFormData({ ...formData, firstGenerationLearner: val })}
                >
                  <SelectTrigger className="mt-1 h-9 text-sm">
                    <SelectValue placeholder="Select First Gen Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {YES_NO_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
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
              {saving ? 'Saving...' : editingRecord ? 'Update Diversity Record' : 'Add Diversity Record'}
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
            Are you sure you want to delete the diversity record for{' '}
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
            await uploadStudentDiversityCSV(effectiveDeptId, file, academicYear, effectiveInstId);
            await fetchDiversity();
          }}
        />
      )}

      {/* ── Evidence Upload Dialog ── */}
      <EvidenceUploadDialog
        open={showEvidenceDialog}
        onClose={() => setShowEvidenceDialog(false)}
        categories={REQUIRED_EVIDENCE}
        sectionLabel="Student Diversity"
        onUpload={handleEvidenceUpload}
      />
    </div>
  );
}

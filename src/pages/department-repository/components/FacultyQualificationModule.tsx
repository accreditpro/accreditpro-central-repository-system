import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Award,
  Download,
  Upload,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  Building2,
  CalendarDays,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  getFacultyQualifications,
  createFacultyQualification,
  updateFacultyQualification,
  deleteFacultyQualification,
  uploadFacultyQualificationsCSV,
} from '@/services/faculty-repository.service';
import { toast } from 'sonner';

// ── CSV line parser (handles quoted commas) ──────────────────────────────────
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') { inQuotes = !inQuotes; }
    else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else { current += char; }
  }
  result.push(current.trim());
  return result;
}

// ── Types ────────────────────────────────────────────────────────────────────
interface QualificationRecord {
  id: string | number;
  academicYear: string;
  empCode: string;
  facultyName: string;
  qualificationLevel: string;
  degree: string;
  specialization: string;
  university: string;
  yearOfPassing: string;
  phdStatus: string;
  phdAwardedDate: string;
  validationStatus?: 'valid' | 'invalid';
  errors?: string[];
}

interface FacultyQualificationModuleProps {
  department: string;
  academicYear: string;
  departmentId?: number;
}

// ── Constants ────────────────────────────────────────────────────────────────
const ACADEMIC_YEARS = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22'];
const QUALIFICATION_LEVELS = ['UG', 'PG', 'PhD', 'Post Doctoral', 'M.Phil'];
const PHD_STATUSES = ['Completed', 'Pursuing', 'Not Applicable'];
const CSV_HEADERS = [
  'EMP Code', 'Faculty Name', 'Qualification Level', 'Degree', 'Specialization',
  'University', 'Year of Passing', 'PhD Status', 'PhD Awarded Date',
];

const EMPTY_RECORD: Omit<QualificationRecord, 'id' | 'academicYear' | 'validationStatus' | 'errors'> = {
  empCode: '', facultyName: '', qualificationLevel: '', degree: '',
  specialization: '', university: '', yearOfPassing: '', phdStatus: '', phdAwardedDate: '',
};

// ── Normalise API row ────────────────────────────────────────────────────────
function normalise(r: any, year: string): QualificationRecord {
  return {
    id: r.id,
    academicYear: r.academicYear ?? year,
    empCode: r.empCode ?? '',
    facultyName: r.facultyName ?? r.name ?? '',
    qualificationLevel: r.qualificationLevel ?? '',
    degree: r.degree ?? '',
    specialization: r.specialization ?? '',
    university: r.university ?? '',
    yearOfPassing: r.yearOfPassing ? String(r.yearOfPassing) : '',
    phdStatus: r.phdStatus ?? '',
    phdAwardedDate: r.phdAwardedDate ?? '',
  };
}

// ── Component ────────────────────────────────────────────────────────────────
export const FacultyQualificationModule = ({ department, academicYear, departmentId: propDeptId }: FacultyQualificationModuleProps) => {
  const { user } = useAuth();
  const departmentId = propDeptId ?? user?.departmentId ?? 0;

  const [selectedYear, setSelectedYear] = useState(academicYear);
  const [records, setRecords] = useState<QualificationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<QualificationRecord | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_RECORD });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<QualificationRecord | null>(null);

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<QualificationRecord[]>([]);
  const [uploadStats, setUploadStats] = useState<{ total: number; valid: number; invalid: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── API: Fetch ────────────────────────────────────────────────────────────
  const fetchQualifications = useCallback(async (year: string) => {
    if (!departmentId) return;
    setLoading(true);
    try {
      const res = await getFacultyQualifications(year, departmentId);
      const items: any[] = res?.data?.content ?? res?.content ?? res?.data ?? res ?? [];
      setRecords(Array.isArray(items) ? items.map((r) => normalise(r, year)) : []);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to load qualifications');
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchQualifications(selectedYear);
  }, [selectedYear, fetchQualifications]);

  // ── Filtered records ──────────────────────────────────────────────────────
  const filteredRecords = useMemo(() => {
    let result = records;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.empCode.toLowerCase().includes(q) ||
          r.facultyName.toLowerCase().includes(q) ||
          r.degree.toLowerCase().includes(q)
      );
    }
    if (filterLevel && filterLevel !== 'all') {
      result = result.filter((r) => r.qualificationLevel === filterLevel);
    }
    return result;
  }, [records, searchQuery, filterLevel]);

  // ── Download template ─────────────────────────────────────────────────────
  const handleDownloadTemplate = useCallback(() => {
    const sampleRows = [
      'EMP001,Dr. Anita Sharma,PhD,PhD in Computer Science,Artificial Intelligence,IIT Delhi,2010,Completed,2010-06-15',
      'EMP002,Mr. Rajesh Kumar,PG,M.Tech,Data Science,NIT Warangal,2012,Pursuing,',
    ];
    const csv = [CSV_HEADERS.join(','), ...sampleRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faculty_qualification_template_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedYear]);

  // ── File parse → preview ──────────────────────────────────────────────────
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim());
      const parsed: QualificationRecord[] = [];
      let validCount = 0, invalidCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const v = parseCSVLine(lines[i]);
        const errors: string[] = [];
        if (!v[0]) errors.push('EMP Code is mandatory');
        if (!v[1]) errors.push('Faculty Name is mandatory');
        const record: QualificationRecord = {
          id: `upload-${i}`, academicYear: selectedYear,
          empCode: v[0] || '', facultyName: v[1] || '', qualificationLevel: v[2] || '',
          degree: v[3] || '', specialization: v[4] || '', university: v[5] || '',
          yearOfPassing: v[6] || '', phdStatus: v[7] || '', phdAwardedDate: v[8] || '',
          validationStatus: errors.length > 0 ? 'invalid' : 'valid',
          errors: errors.length > 0 ? errors : undefined,
        };
        if (errors.length > 0) invalidCount++; else validCount++;
        parsed.push(record);
      }
      setUploadPreview(parsed);
      setUploadStats({ total: parsed.length, valid: validCount, invalid: invalidCount });
      setShowUploadDialog(true);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [selectedYear]);

  // ── API: CSV bulk upload ──────────────────────────────────────────────────
  const handleImportUploaded = useCallback(async () => {
    if (!departmentId) return;
    const validRows = uploadPreview.filter((r) => r.validationStatus === 'valid');
    if (validRows.length === 0) return;
    setUploading(true);
    try {
      const csvRows = validRows.map((r) =>
        [r.empCode, r.facultyName, r.qualificationLevel, r.degree, r.specialization, r.university, r.yearOfPassing, r.phdStatus, r.phdAwardedDate].join(',')
      );
      const csvContent = [CSV_HEADERS.join(','), ...csvRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const file = new File([blob], 'faculty_qualifications.csv', { type: 'text/csv' });

      await uploadFacultyQualificationsCSV(departmentId, file, selectedYear);
      toast.success(`${validRows.length} qualifications uploaded successfully`);
      setShowUploadDialog(false);
      setUploadPreview([]);
      setUploadStats(null);
      fetchQualifications(selectedYear);
    } catch (err: any) {
      toast.error(err?.message ?? 'CSV upload failed');
    } finally {
      setUploading(false);
    }
  }, [uploadPreview, departmentId, selectedYear, fetchQualifications]);

  // ── API: Add / Update ────────────────────────────────────────────────────
  const handleSaveRecord = useCallback(async () => {
    if (!formData.empCode || !formData.facultyName || !departmentId) return;
    setSaving(true);
    try {
      const payload = { ...formData, academicYear: selectedYear };
      if (editingRecord?.id) {
        await updateFacultyQualification(editingRecord.id, selectedYear, departmentId, payload);
        toast.success('Qualification updated successfully');
      } else {
        await createFacultyQualification(selectedYear, departmentId, payload);
        toast.success('Qualification created successfully');
      }
      setFormData({ ...EMPTY_RECORD });
      setShowAddDialog(false);
      setEditingRecord(null);
      fetchQualifications(selectedYear);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save qualification');
    } finally {
      setSaving(false);
    }
  }, [formData, selectedYear, editingRecord, departmentId, fetchQualifications]);

  const handleEdit = useCallback((record: QualificationRecord) => {
    setEditingRecord(record);
    const { id: _i, academicYear: _a, validationStatus: _v, errors: _e, ...rest } = record;
    setFormData(rest);
    setShowAddDialog(true);
  }, []);

  // ── API: Delete ──────────────────────────────────────────────────────────
  const handleDeleteClick = useCallback((record: QualificationRecord) => {
    setDeleteTarget(record);
    setShowDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget?.id || !departmentId) return;
    setDeleting(true);
    try {
      await deleteFacultyQualification(deleteTarget.id, selectedYear, departmentId);
      toast.success('Qualification deleted');
      setShowDeleteDialog(false);
      setDeleteTarget(null);
      fetchQualifications(selectedYear);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete qualification');
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, departmentId, selectedYear, fetchQualifications]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 w-full min-w-0 max-w-full">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Award className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Qualification</h2>
            <p className="text-xs text-muted-foreground">Manage faculty qualifications — Degree, Specialization, University, PhD Status</p>
          </div>
        </div>

        {/* Context Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="h-7 border-0 bg-transparent p-0 text-sm font-semibold text-purple-300 shadow-none focus:ring-0 [&>svg]:text-slate-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACADEMIC_YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="relative p-4 rounded-xl border border-border/60 bg-gradient-to-br from-slate-900/80 to-slate-800/80 dark:from-slate-800/60 dark:to-slate-900/60 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Total Records</span>
            </div>
            <p className="text-sm font-semibold text-emerald-300">{loading ? '...' : records.length}</p>
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
            <div className="relative">
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <Button variant="outline" size="sm" className="gap-2"><Upload className="h-3.5 w-3.5" />Upload CSV</Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setEditingRecord(null); setFormData({ ...EMPTY_RECORD }); setShowAddDialog(true); }} className="gap-2">
              <Plus className="h-3.5 w-3.5" />Add Record
            </Button>
            <div className="ml-auto">
              <Button variant="ghost" size="sm" onClick={() => fetchQualifications(selectedYear)} disabled={loading} className="gap-2">
                <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search by EMP code, name, degree..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <Select value={filterLevel} onValueChange={setFilterLevel}>
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <Filter className="h-3.5 w-3.5 mr-2" /><SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {QUALIFICATION_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs">{filteredRecords.length} Records</Badge>
      </div>

      {/* Data Table */}
      <Card className="border-border/50 w-full min-w-0 max-w-full overflow-hidden shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-violet-600" />Qualification Data — {selectedYear}
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
              <Award className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No records yet</p>
              <p className="text-xs text-muted-foreground mt-1">Upload CSV or add manually</p>
            </div>
          ) : (
            <div className="w-full table-scroll-container max-h-[520px]">
              <table className="w-full text-xs text-left min-w-[1300px] border-collapse">
                <thead className="sticky top-0 z-20 bg-muted/80 backdrop-blur border-b border-border/60">
                  <tr>
                    <th className="p-3 font-semibold text-center w-12 sticky left-0 bg-muted/95 backdrop-blur z-30 shadow-[1px_0_0_0_hsl(var(--border))]">#</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-28">EMP Code</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-44">Faculty Name</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-28">Level</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-36">Degree</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-44">Specialization</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-48">University</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-28">Year of Passing</th>
                    <th className="p-3 font-semibold whitespace-nowrap text-center w-28">PhD Status</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-36">PhD Awarded Date</th>
                    <th className="p-3 font-semibold text-right whitespace-nowrap w-24 sticky right-0 bg-muted/95 backdrop-blur z-30 shadow-[-1px_0_0_0_hsl(var(--border))]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredRecords.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3 text-muted-foreground text-center font-mono sticky left-0 bg-background/95 backdrop-blur z-10 shadow-[1px_0_0_0_hsl(var(--border))]">{idx + 1}</td>
                      <td className="p-3 font-mono font-medium whitespace-nowrap">{r.empCode}</td>
                      <td className="p-3 font-medium whitespace-nowrap">{r.facultyName}</td>
                      <td className="p-3 whitespace-nowrap">
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-600 border-blue-500/20">{r.qualificationLevel || '-'}</Badge>
                      </td>
                      <td className="p-3 whitespace-nowrap font-medium">{r.degree || '-'}</td>
                      <td className="p-3 whitespace-nowrap">{r.specialization || '-' || r.degree}</td>
                      <td className="p-3 whitespace-nowrap">{r.university || '-'}</td>
                      <td className="p-3 whitespace-nowrap">{r.yearOfPassing || '-'}</td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <Badge variant="outline" className={cn('text-[10px] px-2 py-0.5',
                          (r.phdStatus === 'Completed' || r.phdStatus === 'Awarded') && 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                          r.phdStatus === 'Pursuing' && 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                          (!r.phdStatus || r.phdStatus === 'Not Applicable') && 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                        )}>
                          {r.phdStatus || 'N/A'}
                        </Badge>
                      </td>
                      <td className="p-3 whitespace-nowrap">{r.phdAwardedDate || '-'}</td>
                      <td className="p-3 text-right sticky right-0 bg-background/95 backdrop-blur z-10 shadow-[-1px_0_0_0_hsl(var(--border))]">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(r)}><Edit2 className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteClick(r)}><Trash2 className="h-3.5 w-3.5" /></Button>
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

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); setEditingRecord(null); } }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle className="text-base">{editingRecord ? 'Edit Qualification' : 'Add Qualification'}</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">EMP Code *</Label><Input value={formData.empCode} onChange={(e) => setFormData({ ...formData, empCode: e.target.value })} placeholder="EMP001" className="mt-1 h-9 text-sm" /></div>
              <div><Label className="text-xs">Faculty Name *</Label><Input value={formData.facultyName} onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })} placeholder="Full Name" className="mt-1 h-9 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Qualification Level</Label>
                <Select value={formData.qualificationLevel} onValueChange={(v) => setFormData({ ...formData, qualificationLevel: v })}>
                  <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{QUALIFICATION_LEVELS.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Degree</Label><Input value={formData.degree} onChange={(e) => setFormData({ ...formData, degree: e.target.value })} placeholder="e.g., PhD in CS" className="mt-1 h-9 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Specialization</Label><Input value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} placeholder="e.g., AI & ML" className="mt-1 h-9 text-sm" /></div>
              <div><Label className="text-xs">University</Label><Input value={formData.university} onChange={(e) => setFormData({ ...formData, university: e.target.value })} placeholder="e.g., IIT Delhi" className="mt-1 h-9 text-sm" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs">Year of Passing</Label><Input value={formData.yearOfPassing} onChange={(e) => setFormData({ ...formData, yearOfPassing: e.target.value })} placeholder="2010" className="mt-1 h-9 text-sm" /></div>
              <div>
                <Label className="text-xs">PhD Status</Label>
                <Select value={formData.phdStatus} onValueChange={(v) => setFormData({ ...formData, phdStatus: v })}>
                  <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{PHD_STATUSES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">PhD Awarded Date</Label><Input type="date" value={formData.phdAwardedDate} onChange={(e) => setFormData({ ...formData, phdAwardedDate: e.target.value })} className="mt-1 h-9 text-sm" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setShowAddDialog(false); setEditingRecord(null); }}>Cancel</Button>
            <Button size="sm" onClick={handleSaveRecord} disabled={saving || !formData.empCode || !formData.facultyName}>
              {saving ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />{editingRecord ? 'Updating...' : 'Creating...'}</> : editingRecord ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={showDeleteDialog} onOpenChange={(open) => { if (!open) { setShowDeleteDialog(false); setDeleteTarget(null); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />Delete Qualification
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete the qualification record for <strong>{deleteTarget?.facultyName}</strong> ({deleteTarget?.empCode})? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setShowDeleteDialog(false); setDeleteTarget(null); }}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={handleConfirmDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />Deleting...</> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── CSV Upload Preview Dialog ── */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh]">
          <DialogHeader><DialogTitle className="text-base flex items-center gap-2"><Upload className="h-4 w-4" />CSV Upload Preview</DialogTitle></DialogHeader>
          {uploadStats && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Card className="flex-1 border-border/50"><CardContent className="p-3 text-center"><p className="text-lg font-bold">{uploadStats.total}</p><p className="text-[10px] text-muted-foreground">Total</p></CardContent></Card>
                <Card className="flex-1 border-green-500/30 bg-green-500/5"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-green-600">{uploadStats.valid}</p><p className="text-[10px] text-green-600">Valid</p></CardContent></Card>
                <Card className="flex-1 border-red-500/30 bg-red-500/5"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-red-600">{uploadStats.invalid}</p><p className="text-[10px] text-red-600">Invalid</p></CardContent></Card>
              </div>
              <ScrollArea className="max-h-[300px] border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs w-8">#</TableHead>
                      <TableHead className="text-xs">EMP Code</TableHead>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Degree</TableHead>
                      <TableHead className="text-xs text-center">Valid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadPreview.map((r, idx) => (
                      <TableRow key={r.id} className={cn(r.validationStatus === 'invalid' && 'bg-red-500/5')}>
                        <TableCell className="text-xs">{idx + 1}</TableCell>
                        <TableCell className="text-xs font-mono">{r.empCode}</TableCell>
                        <TableCell className="text-xs">{r.facultyName}</TableCell>
                        <TableCell className="text-xs">{r.degree}</TableCell>
                        <TableCell className="text-center">
                          {r.validationStatus === 'valid'
                            ? <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                            : <AlertCircle className="h-4 w-4 text-red-500 mx-auto" />}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              {uploadStats.invalid > 0 && (
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                  {uploadPreview.filter(r => r.validationStatus === 'invalid').map((r, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <X className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-red-600">Row {uploadPreview.indexOf(r) + 1}: {r.errors?.join('; ')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={handleImportUploaded} disabled={!uploadStats || uploadStats.valid === 0 || uploading}>
              {uploading ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />Uploading...</> : `Import ${uploadStats?.valid || 0} Valid Records`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
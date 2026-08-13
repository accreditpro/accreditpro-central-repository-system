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
  UserCircle,
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
  getFacultyProfiles,
  createFacultyProfile,
  updateFacultyProfile,
  deleteFacultyProfile,
  uploadFacultyProfilesCSV,
} from '@/services/faculty-repository.service';
import { toast } from 'sonner';

// ── CSV line parser (handles quoted commas) ──────────────────────────────────
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// ── Types ────────────────────────────────────────────────────────────────────
interface FacultyProfileRecord {
  id: string | number;
  academicYear: string;
  empCode: string;
  name: string;
  pan: string;
  aadhar: string;
  gender: string;
  dob: string;
  officialEmail: string;
  personalEmail: string;
  mobileNumber: string;
  currentDesignation: string;
  status: string;
  dateOfLeaving: string;
  validationStatus?: 'valid' | 'invalid';
  errors?: string[];
}

interface FacultyProfileModuleProps {
  department: string;
  academicYear: string;
  departmentId?: number;
}

// ── Constants ────────────────────────────────────────────────────────────────
const ACADEMIC_YEARS = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22'];
const GENDERS = ['Male', 'Female', 'Other'];
const DESIGNATIONS = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'HOD', 'Dean'];
const STATUSES = ['Active', 'Relieved', 'On Leave', 'Deputation'];
const CSV_HEADERS = [
  'EMP Code', 'Name', 'PAN', 'AADHAR', 'Gender', 'DOB',
  'Official Email', 'Personal Email', 'Mobile Number', 'Current Designation', 'Status', 'Date of Leaving',
];

const EMPTY_RECORD: Omit<FacultyProfileRecord, 'id' | 'academicYear' | 'validationStatus' | 'errors'> = {
  empCode: '', name: '', pan: '', aadhar: '', gender: '', dob: '',
  officialEmail: '', personalEmail: '', mobileNumber: '', currentDesignation: '', status: 'Active', dateOfLeaving: '',
};

// ── Normalise API response row → local shape ─────────────────────────────────
function normaliseProfile(r: any, year: string): FacultyProfileRecord {
  return {
    id: r.id,
    academicYear: r.academicYear ?? year,
    empCode: r.empCode ?? '',
    name: r.name ?? r.facultyName ?? '',
    pan: r.pan ?? r.panNumber ?? '',
    aadhar: r.aadhar ?? '',
    gender: r.gender ?? '',
    dob: r.dob ?? r.dateOfBirth ?? '',
    officialEmail: r.officialEmail ?? '',
    personalEmail: r.personalEmail ?? '',
    mobileNumber: r.mobileNumber ?? '',
    currentDesignation: r.currentDesignation ?? r.designation ?? '',
    status: r.status ?? 'Active',
    dateOfLeaving: r.dateOfLeaving ?? '',
  };
}

// ── Component ────────────────────────────────────────────────────────────────
export const FacultyProfileModule = ({ department, academicYear, departmentId: propDeptId }: FacultyProfileModuleProps) => {
  const { user } = useAuth();
  const departmentId = propDeptId ?? user?.departmentId ?? 0;

  // ── State ────────────────────────────────────────────────────────────────
  const [selectedYear, setSelectedYear] = useState(academicYear);
  const [records, setRecords] = useState<FacultyProfileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FacultyProfileRecord | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_RECORD });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FacultyProfileRecord | null>(null);

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<FacultyProfileRecord[]>([]);
  const [uploadStats, setUploadStats] = useState<{ total: number; valid: number; invalid: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── API: Fetch ────────────────────────────────────────────────────────────
  const fetchProfiles = useCallback(async (year: string) => {
    if (!departmentId) return;
    setLoading(true);
    try {
      const res = await getFacultyProfiles(year, departmentId);
      // Handle various paginated/plain response shapes
      const items: any[] = res?.data?.content ?? res?.content ?? res?.data ?? res ?? [];
      setRecords(Array.isArray(items) ? items.map((r) => normaliseProfile(r, year)) : []);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to load faculty profiles');
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchProfiles(selectedYear);
  }, [selectedYear, fetchProfiles]);

  // ── Filtered records (client-side search/filter) ──────────────────────────
  const filteredRecords = useMemo(() => {
    let result = records;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.empCode.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.officialEmail.toLowerCase().includes(q)
      );
    }
    if (filterStatus && filterStatus !== 'all') {
      result = result.filter((r) => r.status === filterStatus);
    }
    return result;
  }, [records, searchQuery, filterStatus]);

  // ── Download template (local CSV — no API call needed) ───────────────────
  const handleDownloadTemplate = useCallback(() => {
    const sampleRows = [
      'EMP001,Dr. Anita Sharma,ABCDE1234F,1234-5678-9012,Female,1980-05-15,anita@inst.edu,anita@gmail.com,9876543210,Professor,Active,',
      'EMP002,Mr. Rajesh Kumar,FGHIJ5678K,2345-6789-0123,Male,1985-08-20,rajesh@inst.edu,rajesh@gmail.com,9876543211,Assistant Professor,Active,',
    ];
    const csv = [CSV_HEADERS.join(','), ...sampleRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faculty_profile_template_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedYear]);

  // ── File select → parse → show preview dialog ────────────────────────────
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim());
      const parsed: FacultyProfileRecord[] = [];
      let validCount = 0, invalidCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const errors: string[] = [];
        if (!values[0]) errors.push('EMP Code is mandatory');
        if (!values[1]) errors.push('Name is mandatory');
        const record: FacultyProfileRecord = {
          id: `upload-${i}`,
          academicYear: selectedYear,
          empCode: values[0] || '',
          name: values[1] || '',
          pan: values[2] || '',
          aadhar: values[3] || '',
          gender: values[4] || '',
          dob: values[5] || '',
          officialEmail: values[6] || '',
          personalEmail: values[7] || '',
          mobileNumber: values[8] || '',
          currentDesignation: values[9] || '',
          status: values[10] || 'Active',
          dateOfLeaving: values[11] || '',
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
      // Reconstruct CSV from valid rows and POST as multipart file
      const csvRows = validRows.map((r) =>
        [r.empCode, r.name, r.pan, r.aadhar, r.gender, r.dob, r.officialEmail, r.personalEmail, r.mobileNumber, r.currentDesignation, r.status, r.dateOfLeaving].join(',')
      );
      const csvContent = [CSV_HEADERS.join(','), ...csvRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const file = new File([blob], 'faculty_profiles.csv', { type: 'text/csv' });

      await uploadFacultyProfilesCSV(departmentId, file, selectedYear);
      toast.success(`${validRows.length} faculty profiles uploaded successfully`);
      setShowUploadDialog(false);
      setUploadPreview([]);
      setUploadStats(null);
      fetchProfiles(selectedYear);
    } catch (err: any) {
      toast.error(err?.message ?? 'CSV upload failed');
    } finally {
      setUploading(false);
    }
  }, [uploadPreview, departmentId, selectedYear, fetchProfiles]);

  // ── API: Add / Update ────────────────────────────────────────────────────
  const handleSaveRecord = useCallback(async () => {
    if (!formData.empCode || !formData.name || !departmentId) return;
    setSaving(true);
    try {
      const payload = { ...formData, academicYear: selectedYear };
      if (editingRecord?.id) {
        await updateFacultyProfile(editingRecord.id, selectedYear, departmentId, payload);
        toast.success('Faculty profile updated successfully');
      } else {
        await createFacultyProfile(selectedYear, departmentId, payload);
        toast.success('Faculty profile created successfully');
      }
      setFormData({ ...EMPTY_RECORD });
      setShowAddDialog(false);
      setEditingRecord(null);
      fetchProfiles(selectedYear);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save faculty profile');
    } finally {
      setSaving(false);
    }
  }, [formData, selectedYear, editingRecord, departmentId, fetchProfiles]);

  const handleEdit = useCallback((record: FacultyProfileRecord) => {
    setEditingRecord(record);
    const { id: _i, academicYear: _a, validationStatus: _v, errors: _e, ...rest } = record;
    setFormData(rest);
    setShowAddDialog(true);
  }, []);

  // ── API: Delete ──────────────────────────────────────────────────────────
  const handleDeleteClick = useCallback((record: FacultyProfileRecord) => {
    setDeleteTarget(record);
    setShowDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget?.id || !departmentId) return;
    setDeleting(true);
    try {
      await deleteFacultyProfile(deleteTarget.id, selectedYear, departmentId);
      toast.success('Faculty profile deleted');
      setShowDeleteDialog(false);
      setDeleteTarget(null);
      fetchProfiles(selectedYear);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete faculty profile');
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, departmentId, selectedYear, fetchProfiles]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 w-full min-w-0 max-w-full">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <UserCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Faculty Profile</h2>
            <p className="text-xs text-muted-foreground">Manage faculty personal details — EMP Code, Name, PAN, AADHAR, Contact, Designation, Status</p>
          </div>
        </div>

        {/* Context Selector Cards */}
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
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="h-3.5 w-3.5" />Upload CSV
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setEditingRecord(null); setFormData({ ...EMPTY_RECORD }); setShowAddDialog(true); }} className="gap-2">
              <Plus className="h-3.5 w-3.5" />Add Record
            </Button>
            <div className="ml-auto">
              <Button variant="ghost" size="sm" onClick={() => fetchProfiles(selectedYear)} disabled={loading} className="gap-2">
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
          <Input placeholder="Search by EMP code, name, email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[130px] h-9 text-sm">
            <Filter className="h-3.5 w-3.5 mr-2" /><SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs">{filteredRecords.length} Records</Badge>
      </div>

      {/* Data Table */}
      <Card className="border-border/50 w-full min-w-0 max-w-full overflow-hidden shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600" />Faculty Profile — {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 w-full min-w-0 max-w-full overflow-hidden">
          {loading ? (
            /* Loading skeleton */
            <div className="w-full overflow-x-auto p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserCircle className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No records yet</p>
              <p className="text-xs text-muted-foreground mt-1">Upload CSV or add manually</p>
            </div>
          ) : (
            <div className="w-full table-scroll-container max-h-[520px]">
              <table className="w-full text-xs text-left min-w-[1500px] border-collapse">
                <thead className="sticky top-0 z-20 bg-muted/80 backdrop-blur border-b border-border/60">
                  <tr>
                    <th className="p-3 font-semibold text-center w-12 sticky left-0 bg-muted/95 backdrop-blur z-30 shadow-[1px_0_0_0_hsl(var(--border))]">#</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-28">EMP Code</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-44">Name</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-32">PAN</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-36">AADHAR</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-24">Gender</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-28">DOB</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-48">Official Email</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-48">Personal Email</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-32">Mobile</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-40">Designation</th>
                    <th className="p-3 font-semibold whitespace-nowrap text-center w-28">Status</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-32">Date of Leaving</th>
                    <th className="p-3 font-semibold text-right whitespace-nowrap w-24 sticky right-0 bg-muted/95 backdrop-blur z-30 shadow-[-1px_0_0_0_hsl(var(--border))]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredRecords.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3 text-muted-foreground text-center font-mono sticky left-0 bg-background/95 backdrop-blur z-10 shadow-[1px_0_0_0_hsl(var(--border))]">{idx + 1}</td>
                      <td className="p-3 font-mono font-medium whitespace-nowrap">{r.empCode}</td>
                      <td className="p-3 font-medium whitespace-nowrap">{r.name}</td>
                      <td className="p-3 font-mono whitespace-nowrap">{r.pan || '-'}</td>
                      <td className="p-3 font-mono whitespace-nowrap">{r.aadhar || '-'}</td>
                      <td className="p-3 whitespace-nowrap">{r.gender || '-'}</td>
                      <td className="p-3 whitespace-nowrap">{r.dob || '-'}</td>
                      <td className="p-3 whitespace-nowrap">{r.officialEmail || '-'}</td>
                      <td className="p-3 whitespace-nowrap">{r.personalEmail || '-'}</td>
                      <td className="p-3 whitespace-nowrap">{r.mobileNumber || '-'}</td>
                      <td className="p-3 whitespace-nowrap font-medium">{r.currentDesignation || '-'}</td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <Badge variant="outline" className={cn('text-[10px] px-2 py-0.5 font-medium',
                          r.status === 'Active' && 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
                          r.status === 'Relieved' && 'bg-red-500/10 text-red-600 border-red-500/30'
                        )}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="p-3 whitespace-nowrap">{r.dateOfLeaving || '-'}</td>
                      <td className="p-3 text-right sticky right-0 bg-background/95 backdrop-blur z-10 shadow-[-1px_0_0_0_hsl(var(--border))]">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(r)}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteClick(r)}>
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

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); setEditingRecord(null); } }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base">{editingRecord ? 'Edit Faculty Profile' : 'Add Faculty Profile'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">EMP Code *</Label>
                <Input value={formData.empCode} onChange={(e) => setFormData({ ...formData, empCode: e.target.value })} placeholder="EMP001" className="mt-1 h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Full Name" className="mt-1 h-9 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">PAN</Label>
                <Input value={formData.pan} onChange={(e) => setFormData({ ...formData, pan: e.target.value })} placeholder="ABCDE1234F" className="mt-1 h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs">AADHAR</Label>
                <Input value={formData.aadhar} onChange={(e) => setFormData({ ...formData, aadhar: e.target.value })} placeholder="1234-5678-9012" className="mt-1 h-9 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Gender</Label>
                <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Date of Birth</Label>
                <Input type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} className="mt-1 h-9 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Official Email</Label>
                <Input value={formData.officialEmail} onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })} placeholder="email@inst.edu" className="mt-1 h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Personal Email</Label>
                <Input value={formData.personalEmail} onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })} placeholder="email@gmail.com" className="mt-1 h-9 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Mobile Number</Label>
                <Input value={formData.mobileNumber} onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })} placeholder="9876543210" className="mt-1 h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Current Designation</Label>
                <Select value={formData.currentDesignation} onValueChange={(v) => setFormData({ ...formData, currentDesignation: v })}>
                  <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{DESIGNATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Date of Leaving</Label>
                <Input type="date" value={formData.dateOfLeaving} onChange={(e) => setFormData({ ...formData, dateOfLeaving: e.target.value })} className="mt-1 h-9 text-sm" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setShowAddDialog(false); setEditingRecord(null); }}>Cancel</Button>
            <Button size="sm" onClick={handleSaveRecord} disabled={saving || !formData.empCode || !formData.name}>
              {saving
                ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />{editingRecord ? 'Updating...' : 'Creating...'}</>
                : editingRecord ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={showDeleteDialog} onOpenChange={(open) => { if (!open) { setShowDeleteDialog(false); setDeleteTarget(null); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />Delete Faculty Profile
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong> ({deleteTarget?.empCode})?
            This action cannot be undone.
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
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2"><Upload className="h-4 w-4" />CSV Upload Preview</DialogTitle>
          </DialogHeader>
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
                      <TableHead className="text-xs">Designation</TableHead>
                      <TableHead className="text-xs text-center">Valid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadPreview.map((r, idx) => (
                      <TableRow key={r.id} className={cn(r.validationStatus === 'invalid' && 'bg-red-500/5')}>
                        <TableCell className="text-xs">{idx + 1}</TableCell>
                        <TableCell className="text-xs font-mono">{r.empCode}</TableCell>
                        <TableCell className="text-xs">{r.name}</TableCell>
                        <TableCell className="text-xs">{r.currentDesignation}</TableCell>
                        <TableCell className="text-center">
                          {r.validationStatus === 'valid'
                            ? <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                            : <div className="flex items-center gap-1 justify-center"><AlertCircle className="h-4 w-4 text-red-500" /><span className="text-[9px] text-red-600">{r.errors?.[0]}</span></div>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              {uploadStats.invalid > 0 && (
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                  <p className="text-xs font-semibold text-red-700 mb-1">Errors:</p>
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
              {uploading
                ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />Uploading...</>
                : `Import ${uploadStats?.valid || 0} Valid Records`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
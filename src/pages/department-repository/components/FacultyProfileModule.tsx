import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  UserCircle,
  Download,
  Upload,
  Plus,
  Save,
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
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import * as facultyRepositoryService from '@/services/faculty-repository.service';

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

interface FacultyProfileRecord {
  id: string;
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
}

const ACADEMIC_YEARS = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22'];
const GENDERS = ['Male', 'Female', 'Other'];
const DESIGNATIONS = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'HOD', 'Dean'];
const STATUSES = ['Active', 'Relieved', 'On Leave', 'Deputation'];

const CSV_HEADERS = ['EMP Code', 'Name', 'PAN', 'AADHAR', 'Gender', 'DOB', 'Official Email', 'Personal Email', 'Mobile Number', 'Current Designation', 'Status', 'Date of Leaving'];

const EMPTY_RECORD: Omit<FacultyProfileRecord, 'id' | 'academicYear' | 'validationStatus' | 'errors'> = {
  empCode: '', name: '', pan: '', aadhar: '', gender: '', dob: '',
  officialEmail: '', personalEmail: '', mobileNumber: '', currentDesignation: '', status: 'Active', dateOfLeaving: '',
};

export const FacultyProfileModule = ({ department, academicYear }: FacultyProfileModuleProps) => {
  const [selectedYear, setSelectedYear] = useState(academicYear);
  const [records, setRecords] = useState<FacultyProfileRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FacultyProfileRecord | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<FacultyProfileRecord[]>([]);
  const [uploadStats, setUploadStats] = useState<{ total: number; valid: number; invalid: number } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState(EMPTY_RECORD);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const departmentId = user?.departmentId || 101;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await facultyRepositoryService.getFacultyProfiles(selectedYear, departmentId);
      if (res) {
        setRecords(res.content || []);
      }
    } catch (error) {
      console.error('Failed to fetch profiles', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, departmentId]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const filteredRecords = useMemo(() => {
    let filtered = records.filter((r) => r.academicYear === selectedYear);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((r) => r.empCode.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.officialEmail.toLowerCase().includes(q));
    }
    if (filterStatus && filterStatus !== 'all') {
      filtered = filtered.filter((r) => r.status?.toLowerCase() === filterStatus.toLowerCase());
    }
    return filtered;
  }, [records, selectedYear, searchQuery, filterStatus]);

  const totalForYear = records.filter((r) => r.academicYear === selectedYear).length;

  const handleDownloadTemplate = useCallback(async () => {
    try {
      await facultyRepositoryService.downloadFacultyProfilesTemplate(selectedYear, departmentId);
    } catch (error) {
      console.error('Failed to download template', error);
    }
  }, [selectedYear, departmentId]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
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
          id: `upload-${i}`, academicYear: selectedYear,
          empCode: values[0] || '', name: values[1] || '', pan: values[2] || '', aadhar: values[3] || '',
          gender: values[4] || '', dob: values[5] || '', officialEmail: values[6] || '', personalEmail: values[7] || '',
          mobileNumber: values[8] || '', currentDesignation: values[9] || '', status: values[10] || 'Active', dateOfLeaving: values[11] || '',
          validationStatus: errors.length > 0 ? 'invalid' : 'valid', errors: errors.length > 0 ? errors : undefined,
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

  const handleImportUploaded = useCallback(async () => {
    const validRecords = uploadPreview.filter((r) => r.validationStatus === 'valid');
    if (validRecords.length === 0) return;
    
    const headers = ['EMP Code', 'Name', 'PAN', 'AADHAR', 'Gender', 'DOB', 'Official Email', 'Personal Email', 'Mobile Number', 'Current Designation', 'Status', 'Date of Leaving', 'Academic Year'];
    const rows = validRecords.map(r => [
      r.empCode, r.name, r.pan, r.aadhar, (r.gender || '').toUpperCase(), r.dob, 
      r.officialEmail, r.personalEmail, r.mobileNumber, r.currentDesignation, 
      (r.status || 'Active').toUpperCase().replace(/\s+/g, '_'), r.dateOfLeaving, selectedYear
    ].map(val => (val !== null && val !== undefined && val !== '') ? `"${val}"` : '').join(','));
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const fileToUpload = new File([blob], 'upload.csv', { type: 'text/csv' });

    try {
      setIsLoading(true);
      await facultyRepositoryService.uploadFacultyProfilesCSV(departmentId, fileToUpload, selectedYear);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await fetchProfiles();
    } catch (error) {
      console.error('Failed to upload CSV', error);
    } finally {
      setIsLoading(false);
      setShowUploadDialog(false);
      setUploadPreview([]);
      setUploadStats(null);
      setSelectedFile(null);
    }
  }, [selectedFile, departmentId, selectedYear, fetchProfiles]);

  const handleSaveRecord = useCallback(async () => {
    if (!formData.empCode || !formData.name) return;
    setIsLoading(true);
    try {
      const payload = { 
        ...formData, 
        academicYear: selectedYear,
        gender: formData.gender ? formData.gender.toUpperCase() : '',
        status: formData.status ? formData.status.toUpperCase().replace(/\s+/g, '_') : 'ACTIVE'
      };
      if (editingRecord) {
        await facultyRepositoryService.updateFacultyProfile(editingRecord.id, selectedYear, departmentId, payload);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchProfiles();
      } else {
        await facultyRepositoryService.createFacultyProfile(selectedYear, departmentId, payload);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchProfiles();
      }
    } catch (error) {
      console.error('Failed to save record', error);
    } finally {
      setIsLoading(false);
      setFormData(EMPTY_RECORD);
      setShowAddDialog(false);
      setEditingRecord(null);
    }
  }, [formData, selectedYear, departmentId, editingRecord, fetchProfiles]);

  const handleEdit = useCallback((record: FacultyProfileRecord) => {
    setEditingRecord(record);
    const { id: _i, academicYear: _a, validationStatus: _v, errors: _e, ...rest } = record;
    setFormData(rest);
    setShowAddDialog(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await facultyRepositoryService.deleteFacultyProfile(id, selectedYear, departmentId);
      fetchProfiles();
    } catch (error) {
      console.error('Failed to delete', error);
    }
  }, [selectedYear, departmentId, fetchProfiles]);

  const handleSaveAll = useCallback(() => { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 4000); }, []);

  return (
    <div className="space-y-6">
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
        {/* Context Selector Cards - Student Repository Style */}
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
                {ACADEMIC_YEARS.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative p-4 rounded-xl border border-border/60 bg-gradient-to-br from-slate-900/80 to-slate-800/80 dark:from-slate-800/60 dark:to-slate-900/60 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Total Records</span>
            </div>
            <p className="text-sm font-semibold text-emerald-300">{totalForYear}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <Card className="border-border/50"><CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-2"><Download className="h-3.5 w-3.5" />Download Template</Button>
          <div className="relative"><input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" /><Button variant="outline" size="sm" className="gap-2"><Upload className="h-3.5 w-3.5" />Upload CSV</Button></div>
          <Button variant="outline" size="sm" onClick={() => { setEditingRecord(null); setFormData(EMPTY_RECORD); setShowAddDialog(true); }} className="gap-2"><Plus className="h-3.5 w-3.5" />Add Record</Button>
          <div className="ml-auto"><Button size="sm" onClick={handleSaveAll} disabled={totalForYear === 0} className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"><Save className="h-3.5 w-3.5" />Save All</Button></div>
        </div>
      </CardContent></Card>

      {/* Save Success */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="border-green-500/30 bg-green-500/5"><CardContent className="p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-600" /><div><p className="text-sm font-semibold text-green-700">Data Saved Successfully</p><p className="text-xs text-green-600 mt-0.5">Records: {totalForYear} • Year: {selectedYear}</p></div></CardContent></Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Search by EMP code, name, email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm" /></div>
        <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="w-[130px] h-9 text-sm"><Filter className="h-3.5 w-3.5 mr-2" /><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem>{STATUSES.map((s) => <SelectItem key={s} value={s.toUpperCase().replace(/[-\s]+/g, '_')}>{s}</SelectItem>)}</SelectContent></Select>
        <Badge variant="outline" className="text-xs">{filteredRecords.length} Records</Badge>
      </div>

      {/* Data Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><FileText className="h-4 w-4 text-indigo-600" />Faculty Profile — {selectedYear}</CardTitle></CardHeader>
        <CardContent className="p-0">
          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center"><UserCircle className="h-12 w-12 text-muted-foreground/30 mb-3" /><p className="text-sm text-muted-foreground font-medium">No records yet</p><p className="text-xs text-muted-foreground mt-1">Upload CSV or add manually</p></div>
          ) : (
            <div className="overflow-x-auto w-full max-h-[500px] overflow-y-auto">
              <Table className="min-w-[1200px]">
                <TableHeader><TableRow className="bg-muted/30">
                  <TableHead className="text-xs font-semibold w-8 sticky left-0 bg-background shadow-[1px_0_0_0_rgba(0,0,0,0.1)] z-10">#</TableHead>
                  <TableHead className="text-xs font-semibold whitespace-nowrap">EMP Code</TableHead>
                  <TableHead className="text-xs font-semibold whitespace-nowrap">Name</TableHead>
                  <TableHead className="text-xs font-semibold whitespace-nowrap">PAN</TableHead>
                  <TableHead className="text-xs font-semibold whitespace-nowrap">AADHAR</TableHead>
                  <TableHead className="text-xs font-semibold whitespace-nowrap">Gender</TableHead>
                  <TableHead className="text-xs font-semibold whitespace-nowrap">DOB</TableHead>
                  <TableHead className="text-xs font-semibold whitespace-nowrap">Official Email</TableHead>
                  <TableHead className="text-xs font-semibold whitespace-nowrap">Personal Email</TableHead>
                  <TableHead className="text-xs font-semibold whitespace-nowrap">Mobile</TableHead>
                  <TableHead className="text-xs font-semibold whitespace-nowrap">Designation</TableHead>
                  <TableHead className="text-xs font-semibold whitespace-nowrap text-center">Status</TableHead>
                  <TableHead className="text-xs font-semibold whitespace-nowrap">Date of Leaving</TableHead>
                  <TableHead className="text-xs font-semibold text-right whitespace-nowrap sticky right-0 bg-background shadow-[-1px_0_0_0_rgba(0,0,0,0.1)] z-10">Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filteredRecords.map((r, idx) => (
                    <TableRow key={r.id} className="hover:bg-muted/20">
                      <TableCell className="text-xs text-muted-foreground sticky left-0 bg-background shadow-[1px_0_0_0_rgba(0,0,0,0.1)] z-10">{idx + 1}</TableCell>
                      <TableCell className="text-xs font-medium font-mono whitespace-nowrap">{r.empCode}</TableCell>
                      <TableCell className="text-sm font-medium whitespace-nowrap">{r.name}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{r.pan}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{r.aadhar}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{r.gender}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{r.dob}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{r.officialEmail}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{r.personalEmail}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{r.mobileNumber}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{r.currentDesignation}</TableCell>
                      <TableCell className="text-center whitespace-nowrap"><Badge variant="outline" className={cn('text-[10px]', r.status === 'Active' && 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', r.status === 'Relieved' && 'bg-red-500/10 text-red-600 border-red-500/20')}>{r.status}</Badge></TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{r.dateOfLeaving || '-'}</TableCell>
                      <TableCell className="text-right sticky right-0 bg-background shadow-[-1px_0_0_0_rgba(0,0,0,0.1)] z-10">
                        <div className="flex items-center justify-end gap-2"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(r)}><Edit2 className="h-3 w-3" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(r.id)}><Trash2 className="h-3 w-3" /></Button></div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); setEditingRecord(null); } }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle className="text-base">{editingRecord ? 'Edit Faculty Profile' : 'Add Faculty Profile'}</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">EMP Code *</Label><Input value={formData.empCode} onChange={(e) => setFormData({ ...formData, empCode: e.target.value })} placeholder="EMP001" className="mt-1 h-9 text-sm" /></div>
              <div><Label className="text-xs">Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Full Name" className="mt-1 h-9 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">PAN</Label><Input value={formData.pan} onChange={(e) => setFormData({ ...formData, pan: e.target.value })} placeholder="ABCDE1234F" className="mt-1 h-9 text-sm" /></div>
              <div><Label className="text-xs">AADHAR</Label><Input value={formData.aadhar} onChange={(e) => setFormData({ ...formData, aadhar: e.target.value })} placeholder="1234-5678-9012" className="mt-1 h-9 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Gender</Label><Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}><SelectTrigger className="mt-1 h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{GENDERS.map(g => <SelectItem key={g} value={g.toUpperCase().replace(/[-\s]+/g, '_')}>{g}</SelectItem>)}</SelectContent></Select></div>
              <div><Label className="text-xs">Date of Birth</Label><Input type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} className="mt-1 h-9 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Official Email</Label><Input value={formData.officialEmail} onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })} placeholder="email@inst.edu" className="mt-1 h-9 text-sm" /></div>
              <div><Label className="text-xs">Personal Email</Label><Input value={formData.personalEmail} onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })} placeholder="email@gmail.com" className="mt-1 h-9 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Mobile Number</Label><Input value={formData.mobileNumber} onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })} placeholder="9876543210" className="mt-1 h-9 text-sm" /></div>
              <div><Label className="text-xs">Current Designation</Label><Select value={formData.currentDesignation} onValueChange={(v) => setFormData({ ...formData, currentDesignation: v })}><SelectTrigger className="mt-1 h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{DESIGNATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Status</Label><Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}><SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s.toUpperCase().replace(/[-\s]+/g, '_')}>{s}</SelectItem>)}</SelectContent></Select></div>
              <div><Label className="text-xs">Date of Leaving</Label><Input type="date" value={formData.dateOfLeaving} onChange={(e) => setFormData({ ...formData, dateOfLeaving: e.target.value })} className="mt-1 h-9 text-sm" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setShowAddDialog(false); setEditingRecord(null); }}>Cancel</Button>
            <Button size="sm" onClick={handleSaveRecord} disabled={!formData.empCode || !formData.name || isLoading}>{editingRecord ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Preview Dialog */}
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
                <Table><TableHeader><TableRow className="bg-muted/30"><TableHead className="text-xs w-8">#</TableHead><TableHead className="text-xs">EMP Code</TableHead><TableHead className="text-xs">Name</TableHead><TableHead className="text-xs">Designation</TableHead><TableHead className="text-xs text-center">Valid</TableHead></TableRow></TableHeader>
                  <TableBody>{uploadPreview.map((r, idx) => (
                    <TableRow key={r.id} className={cn(r.validationStatus === 'invalid' && 'bg-red-500/5')}>
                      <TableCell className="text-xs">{idx + 1}</TableCell><TableCell className="text-xs font-mono">{r.empCode}</TableCell><TableCell className="text-xs">{r.name}</TableCell><TableCell className="text-xs">{r.currentDesignation}</TableCell>
                      <TableCell className="text-center">{r.validationStatus === 'valid' ? <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" /> : <div className="flex items-center gap-1 justify-center"><AlertCircle className="h-4 w-4 text-red-500" /><span className="text-[9px] text-red-600">{r.errors?.[0]}</span></div>}</TableCell>
                    </TableRow>
                  ))}</TableBody></Table>
              </ScrollArea>
              {uploadStats.invalid > 0 && (<div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20"><p className="text-xs font-semibold text-red-700 mb-1">Errors:</p>{uploadPreview.filter(r => r.validationStatus === 'invalid').map((r, i) => <div key={i} className="flex items-start gap-2"><X className="h-3 w-3 text-red-500 mt-0.5 shrink-0" /><p className="text-[11px] text-red-600">Row {uploadPreview.indexOf(r) + 1}: {r.errors?.join('; ')}</p></div>)}</div>)}
            </div>
          )}
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setShowUploadDialog(false)} disabled={isLoading}>Cancel</Button><Button size="sm" onClick={handleImportUploaded} disabled={!uploadStats || uploadStats.valid === 0 || isLoading}>{isLoading ? 'Importing...' : `Import ${uploadStats?.valid || 0} Valid Records`}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
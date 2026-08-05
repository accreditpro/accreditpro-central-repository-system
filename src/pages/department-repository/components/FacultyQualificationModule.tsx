import { useState, useMemo, useCallback, useRef } from 'react';
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
  Award,
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

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') { inQuotes = !inQuotes; } else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; } else { current += char; }
  }
  result.push(current.trim());
  return result;
}

interface QualificationRecord {
  id: string;
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
}

const ACADEMIC_YEARS = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22'];
const QUALIFICATION_LEVELS = ['UG', 'PG', 'PhD', 'Post Doctoral', 'M.Phil'];
const PHD_STATUSES = ['Completed', 'Pursuing', 'Not Applicable'];
const CSV_HEADERS = ['EMP Code', 'Faculty Name', 'Qualification Level', 'Degree', 'Specialization', 'University', 'Year of Passing', 'PhD Status', 'PhD Awarded Date'];

const EMPTY_RECORD: Omit<QualificationRecord, 'id' | 'academicYear' | 'validationStatus' | 'errors'> = {
  empCode: '', facultyName: '', qualificationLevel: '', degree: '', specialization: '', university: '', yearOfPassing: '', phdStatus: '', phdAwardedDate: '',
};

export const FacultyQualificationModule = ({ department, academicYear }: FacultyQualificationModuleProps) => {
  const [selectedYear, setSelectedYear] = useState(academicYear);
  const [records, setRecords] = useState<QualificationRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<QualificationRecord | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<QualificationRecord[]>([]);
  const [uploadStats, setUploadStats] = useState<{ total: number; valid: number; invalid: number } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState(EMPTY_RECORD);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredRecords = useMemo(() => {
    let filtered = records.filter((r) => r.academicYear === selectedYear);
    if (searchQuery) { const q = searchQuery.toLowerCase(); filtered = filtered.filter((r) => r.empCode.toLowerCase().includes(q) || r.facultyName.toLowerCase().includes(q) || r.degree.toLowerCase().includes(q)); }
    if (filterLevel && filterLevel !== 'all') { filtered = filtered.filter((r) => r.qualificationLevel === filterLevel); }
    return filtered;
  }, [records, selectedYear, searchQuery, filterLevel]);

  const totalForYear = records.filter((r) => r.academicYear === selectedYear).length;

  const handleDownloadTemplate = useCallback(() => {
    const sampleRows = ['EMP001,Dr. Anita Sharma,PhD,PhD in Computer Science,Artificial Intelligence,IIT Delhi,2010,Completed,2010-06-15', 'EMP002,Mr. Rajesh Kumar,PG,M.Tech,Data Science,NIT Warangal,2012,Pursuing,'];
    const csv = [CSV_HEADERS.join(','), ...sampleRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `faculty_qualification_template_${selectedYear}.csv`; a.click(); URL.revokeObjectURL(url);
  }, [selectedYear]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
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
        const record: QualificationRecord = { id: `upload-${i}`, academicYear: selectedYear, empCode: v[0] || '', facultyName: v[1] || '', qualificationLevel: v[2] || '', degree: v[3] || '', specialization: v[4] || '', university: v[5] || '', yearOfPassing: v[6] || '', phdStatus: v[7] || '', phdAwardedDate: v[8] || '', validationStatus: errors.length > 0 ? 'invalid' : 'valid', errors: errors.length > 0 ? errors : undefined };
        if (errors.length > 0) invalidCount++; else validCount++;
        parsed.push(record);
      }
      setUploadPreview(parsed); setUploadStats({ total: parsed.length, valid: validCount, invalid: invalidCount }); setShowUploadDialog(true);
    };
    reader.readAsText(file); if (fileInputRef.current) fileInputRef.current.value = '';
  }, [selectedYear]);

  const handleImportUploaded = useCallback(() => {
    const valid = uploadPreview.filter((r) => r.validationStatus === 'valid').map((r, idx) => ({ ...r, id: `qual-${Date.now()}-${idx}`, validationStatus: undefined as QualificationRecord['validationStatus'], errors: undefined }));
    setRecords((prev) => [...prev, ...valid]); setShowUploadDialog(false); setUploadPreview([]); setUploadStats(null);
  }, [uploadPreview]);

  const handleSaveRecord = useCallback(() => {
    if (!formData.empCode || !formData.facultyName) return;
    const record: QualificationRecord = { id: editingRecord ? editingRecord.id : `qual-${Date.now()}`, academicYear: selectedYear, ...formData };
    if (editingRecord) { setRecords((prev) => prev.map((r) => (r.id === editingRecord.id ? record : r))); } else { setRecords((prev) => [...prev, record]); }
    setFormData(EMPTY_RECORD); setShowAddDialog(false); setEditingRecord(null);
  }, [formData, selectedYear, editingRecord]);

  const handleEdit = useCallback((record: QualificationRecord) => { setEditingRecord(record); const { id: _i, academicYear: _a, validationStatus: _v, errors: _e, ...rest } = record; setFormData(rest); setShowAddDialog(true); }, []);
  const handleDelete = useCallback((id: string) => { setRecords((prev) => prev.filter((r) => r.id !== id)); }, []);
  const handleSaveAll = useCallback(() => { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 4000); }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20"><Award className="h-5 w-5 text-white" /></div>
          <div><h2 className="text-xl font-bold tracking-tight">Qualification</h2><p className="text-xs text-muted-foreground">Manage faculty qualifications — Degree, Specialization, University, PhD Status</p></div>
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

      <Card className="border-border/50"><CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-2"><Download className="h-3.5 w-3.5" />Download Template</Button>
          <div className="relative"><input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" /><Button variant="outline" size="sm" className="gap-2"><Upload className="h-3.5 w-3.5" />Upload CSV</Button></div>
          <Button variant="outline" size="sm" onClick={() => { setEditingRecord(null); setFormData(EMPTY_RECORD); setShowAddDialog(true); }} className="gap-2"><Plus className="h-3.5 w-3.5" />Add Record</Button>
          <div className="ml-auto"><Button size="sm" onClick={handleSaveAll} disabled={totalForYear === 0} className="gap-2 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800"><Save className="h-3.5 w-3.5" />Save All</Button></div>
        </div>
      </CardContent></Card>

      <AnimatePresence>{saveSuccess && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}><Card className="border-green-500/30 bg-green-500/5"><CardContent className="p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-600" /><div><p className="text-sm font-semibold text-green-700">Data Saved Successfully</p><p className="text-xs text-green-600 mt-0.5">Records: {totalForYear} • Year: {selectedYear}</p></div></CardContent></Card></motion.div>)}</AnimatePresence>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Search by EMP code, name, degree..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm" /></div>
        <Select value={filterLevel} onValueChange={setFilterLevel}><SelectTrigger className="w-[140px] h-9 text-sm"><Filter className="h-3.5 w-3.5 mr-2" /><SelectValue placeholder="Level" /></SelectTrigger><SelectContent><SelectItem value="all">All Levels</SelectItem>{QUALIFICATION_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select>
        <Badge variant="outline" className="text-xs">{filteredRecords.length} Records</Badge>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><FileText className="h-4 w-4 text-violet-600" />Qualification Data — {selectedYear}</CardTitle></CardHeader>
        <CardContent className="p-0">
          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center"><Award className="h-12 w-12 text-muted-foreground/30 mb-3" /><p className="text-sm text-muted-foreground font-medium">No records yet</p><p className="text-xs text-muted-foreground mt-1">Upload CSV or add manually</p></div>
          ) : (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table className="min-w-[1100px]"><TableHeader><TableRow className="bg-muted/30">
                <TableHead className="text-xs font-semibold w-8 sticky left-0 bg-muted/30 z-10">#</TableHead>
                <TableHead className="text-xs font-semibold whitespace-nowrap">EMP Code</TableHead>
                <TableHead className="text-xs font-semibold whitespace-nowrap">Faculty Name</TableHead>
                <TableHead className="text-xs font-semibold whitespace-nowrap">Level</TableHead>
                <TableHead className="text-xs font-semibold whitespace-nowrap">Degree</TableHead>
                <TableHead className="text-xs font-semibold whitespace-nowrap">Specialization</TableHead>
                <TableHead className="text-xs font-semibold whitespace-nowrap">University</TableHead>
                <TableHead className="text-xs font-semibold whitespace-nowrap">Year of Passing</TableHead>
                <TableHead className="text-xs font-semibold whitespace-nowrap text-center">PhD Status</TableHead>
                <TableHead className="text-xs font-semibold whitespace-nowrap">PhD Awarded Date</TableHead>
                <TableHead className="text-xs font-semibold text-right whitespace-nowrap sticky right-0 bg-muted/30 z-10">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>{filteredRecords.map((r, idx) => (
                <TableRow key={r.id} className="hover:bg-muted/50">
                  <TableCell className="text-xs text-muted-foreground sticky left-0 bg-background z-10">{idx + 1}</TableCell>
                  <TableCell className="text-xs font-mono whitespace-nowrap">{r.empCode}</TableCell>
                  <TableCell className="text-sm font-medium whitespace-nowrap">{r.facultyName}</TableCell>
                  <TableCell className="whitespace-nowrap"><Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/20">{r.qualificationLevel}</Badge></TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{r.degree}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{r.specialization}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{r.university}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{r.yearOfPassing || '-'}</TableCell>
                  <TableCell className="text-center whitespace-nowrap"><Badge variant="outline" className={cn('text-[10px]', r.phdStatus === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : r.phdStatus === 'Pursuing' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-gray-500/10 text-gray-600 border-gray-500/20')}>{r.phdStatus || '-'}</Badge></TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{r.phdAwardedDate || '-'}</TableCell>
                  <TableCell className="text-right sticky right-0 bg-background z-10"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(r)}><Edit2 className="h-3 w-3" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(r.id)}><Trash2 className="h-3 w-3" /></Button></div></TableCell>
                </TableRow>
              ))}</TableBody></Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); setEditingRecord(null); } }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle className="text-base">{editingRecord ? 'Edit Qualification' : 'Add Qualification'}</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">EMP Code *</Label><Input value={formData.empCode} onChange={(e) => setFormData({ ...formData, empCode: e.target.value })} placeholder="EMP001" className="mt-1 h-9 text-sm" /></div>
              <div><Label className="text-xs">Faculty Name *</Label><Input value={formData.facultyName} onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })} placeholder="Full Name" className="mt-1 h-9 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Qualification Level</Label><Select value={formData.qualificationLevel} onValueChange={(v) => setFormData({ ...formData, qualificationLevel: v })}><SelectTrigger className="mt-1 h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{QUALIFICATION_LEVELS.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent></Select></div>
              <div><Label className="text-xs">Degree</Label><Input value={formData.degree} onChange={(e) => setFormData({ ...formData, degree: e.target.value })} placeholder="e.g., PhD in CS" className="mt-1 h-9 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Specialization</Label><Input value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} placeholder="e.g., AI & ML" className="mt-1 h-9 text-sm" /></div>
              <div><Label className="text-xs">University</Label><Input value={formData.university} onChange={(e) => setFormData({ ...formData, university: e.target.value })} placeholder="e.g., IIT Delhi" className="mt-1 h-9 text-sm" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs">Year of Passing</Label><Input value={formData.yearOfPassing} onChange={(e) => setFormData({ ...formData, yearOfPassing: e.target.value })} placeholder="2010" className="mt-1 h-9 text-sm" /></div>
              <div><Label className="text-xs">PhD Status</Label><Select value={formData.phdStatus} onValueChange={(v) => setFormData({ ...formData, phdStatus: v })}><SelectTrigger className="mt-1 h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{PHD_STATUSES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
              <div><Label className="text-xs">PhD Awarded Date</Label><Input type="date" value={formData.phdAwardedDate} onChange={(e) => setFormData({ ...formData, phdAwardedDate: e.target.value })} className="mt-1 h-9 text-sm" /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" size="sm" onClick={() => { setShowAddDialog(false); setEditingRecord(null); }}>Cancel</Button><Button size="sm" onClick={handleSaveRecord} disabled={!formData.empCode || !formData.facultyName}>{editingRecord ? 'Update' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh]">
          <DialogHeader><DialogTitle className="text-base flex items-center gap-2"><Upload className="h-4 w-4" />CSV Upload Preview</DialogTitle></DialogHeader>
          {uploadStats && (<div className="space-y-4">
            <div className="flex items-center gap-4">
              <Card className="flex-1 border-border/50"><CardContent className="p-3 text-center"><p className="text-lg font-bold">{uploadStats.total}</p><p className="text-[10px] text-muted-foreground">Total</p></CardContent></Card>
              <Card className="flex-1 border-green-500/30 bg-green-500/5"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-green-600">{uploadStats.valid}</p><p className="text-[10px] text-green-600">Valid</p></CardContent></Card>
              <Card className="flex-1 border-red-500/30 bg-red-500/5"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-red-600">{uploadStats.invalid}</p><p className="text-[10px] text-red-600">Invalid</p></CardContent></Card>
            </div>
            <ScrollArea className="max-h-[300px] border rounded-lg"><Table><TableHeader><TableRow className="bg-muted/30"><TableHead className="text-xs w-8">#</TableHead><TableHead className="text-xs">EMP Code</TableHead><TableHead className="text-xs">Name</TableHead><TableHead className="text-xs">Degree</TableHead><TableHead className="text-xs text-center">Valid</TableHead></TableRow></TableHeader><TableBody>{uploadPreview.map((r, idx) => (<TableRow key={r.id} className={cn(r.validationStatus === 'invalid' && 'bg-red-500/5')}><TableCell className="text-xs">{idx + 1}</TableCell><TableCell className="text-xs font-mono">{r.empCode}</TableCell><TableCell className="text-xs">{r.facultyName}</TableCell><TableCell className="text-xs">{r.degree}</TableCell><TableCell className="text-center">{r.validationStatus === 'valid' ? <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" /> : <AlertCircle className="h-4 w-4 text-red-500 mx-auto" />}</TableCell></TableRow>))}</TableBody></Table></ScrollArea>
            {uploadStats.invalid > 0 && (<div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">{uploadPreview.filter(r => r.validationStatus === 'invalid').map((r, i) => <div key={i} className="flex items-start gap-2"><X className="h-3 w-3 text-red-500 mt-0.5 shrink-0" /><p className="text-[11px] text-red-600">Row {uploadPreview.indexOf(r) + 1}: {r.errors?.join('; ')}</p></div>)}</div>)}
          </div>)}
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setShowUploadDialog(false)}>Cancel</Button><Button size="sm" onClick={handleImportUploaded} disabled={!uploadStats || uploadStats.valid === 0}>Import {uploadStats?.valid || 0} Valid Records</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
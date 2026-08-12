import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DatePicker } from '@/components/ui/date-picker';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useReadOnly } from '@/hooks/useReadOnly';
import { academicRepositoryService } from '@/services/academic-repository.service';
import {
  Calendar,
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
  AlertTriangle,
  FileText,
  X,
  Building2,
  CalendarDays,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  department: string;
  year: string;
  semester: string;
  description: string;
  startDate: string;
  endDate: string;
  duration: number;
  status?: 'valid' | 'invalid';
  errors?: string[];
}

interface AcademicCalendarModuleProps {
  department: string;
  academicYear: string;
  departmentId?: number;
}

const YEARS_OF_STUDY = ['I Year', 'II Year', 'III Year', 'IV Year'];
const SEMESTERS = ['Semester I', 'Semester II'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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

function calculateDuration(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 0;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getEventStatus(startDate: string, endDate: string): 'upcoming' | 'completed' | 'ongoing' {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  return 'ongoing';
}

function cleanYear(y: string): string {
  let str = (y || '').toLowerCase().trim();
  str = str.replace(/\b1st\b|\bfirst\b|\bi\b/g, 'i');
  str = str.replace(/\b2nd\b|\bsecond\b|\bii\b/g, 'ii');
  str = str.replace(/\b3rd\b|\bthird\b|\biii\b/g, 'iii');
  str = str.replace(/\b4th\b|\bfourth\b|\biv\b/g, 'iv');
  str = str.replace(/\s+year/g, '').trim();
  return str;
}

function cleanSem(s: string): string {
  let str = (s || '').toLowerCase().trim();
  str = str.replace(/\b(viii|8th|8)\b/g, '8');
  str = str.replace(/\b(vii|7th|7)\b/g, '7');
  str = str.replace(/\b(vi|6th|6)\b/g, '6');
  str = str.replace(/\b(v|5th|5)\b/g, '5');
  str = str.replace(/\b(iv|4th|4)\b/g, '4');
  str = str.replace(/\b(iii|3rd|3)\b/g, '3');
  str = str.replace(/\b(ii|2nd|2)\b/g, '2');
  str = str.replace(/\b(i|1st|1)\b/g, '1');
  str = str.replace(/^(semester|sem)\s*/i, '').trim();
  return str;
}

export const AcademicCalendarModule = ({
  department,
  academicYear,
  departmentId = 1,
}: AcademicCalendarModuleProps) => {
  const isReadOnly = useReadOnly();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedYear, setSelectedYear] = useState('III Year');
  const [selectedSemester, setSelectedSemester] = useState('Semester I');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [uploadPreview, setUploadPreview] = useState<CalendarEvent[]>([]);
  const [uploadStats, setUploadStats] = useState<{ total: number; valid: number; invalid: number } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch all calendar events from live API
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await academicRepositoryService.getCalendarEvents(academicYear, departmentId);
      let items: any[] = [];
      if (Array.isArray(res)) {
        items = res;
      } else if (res && Array.isArray(res.content)) {
        items = res.content;
      } else if (res && res.data && Array.isArray(res.data.content)) {
        items = res.data.content;
      } else if (res && res.data && Array.isArray(res.data)) {
        items = res.data;
      }

      const mapped: CalendarEvent[] = items.map((item: any) => ({
        id: String(item.id),
        department: item.department || department,
        year: item.yearOfStudy || item.year || 'III Year',
        semester: item.semester || 'Semester I',
        description: item.description || '',
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        duration: item.duration ?? calculateDuration(item.startDate, item.endDate),
      }));

      setEvents(mapped);
    } catch (err) {
      console.warn('Failed to load academic calendar events:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [academicYear, departmentId, department]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // New event form state
  const [newEvent, setNewEvent] = useState({
    description: '',
    startDate: '',
    endDate: '',
  });

  // Filtered events
  const filteredEvents = useMemo(() => {
    let filtered = events.filter(
      (e) => cleanYear(e.year) === cleanYear(selectedYear) && cleanSem(e.semester) === cleanSem(selectedSemester)
    );

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.semester.toLowerCase().includes(q)
      );
    }

    if (filterMonth && filterMonth !== 'all') {
      filtered = filtered.filter((e) => {
        const month = new Date(e.startDate).toLocaleString('en-US', { month: 'long' });
        return month === filterMonth;
      });
    }

    if (filterStatus && filterStatus !== 'all') {
      filtered = filtered.filter((e) => {
        const status = getEventStatus(e.startDate, e.endDate);
        return status === filterStatus;
      });
    }

    return filtered;
  }, [events, selectedYear, selectedSemester, searchQuery, filterMonth, filterStatus]);

  // Download CSV with real data from get all API
  const handleDownloadTemplate = useCallback(() => {
    const header = 'Department,Year,Semester,Description,Start Date,End Date,Duration';
    
    // Get real events for the selected Year & Semester from API state
    const currentEvents = events.filter(
      (e) => cleanYear(e.year) === cleanYear(selectedYear) && cleanSem(e.semester) === cleanSem(selectedSemester)
    );

    const rows = currentEvents.length > 0
      ? currentEvents.map((e) => {
          const desc = e.description.includes(',') ? `"${e.description.replace(/"/g, '""')}"` : e.description;
          const dept = (e.department && e.department.includes(',')) ? `"${e.department.replace(/"/g, '""')}"` : (e.department || department);
          return `${dept},${e.year},${e.semester},${desc},${e.startDate},${e.endDate},${e.duration}`;
        })
      : [
          `${department},${selectedYear},${selectedSemester},,${new Date().toISOString().split('T')[0]},${new Date().toISOString().split('T')[0]},1`,
        ];

    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic_calendar_${academicYear}_${selectedYear.replace(/\s+/g, '_')}_${selectedSemester.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [events, department, selectedYear, selectedSemester, academicYear]);

  const [selectedCsvFile, setSelectedCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Upload CSV
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setSelectedCsvFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((line) => line.trim());
        const headers = parseCSVLine(lines[0]);

        const parsed: CalendarEvent[] = [];
        let validCount = 0;
        let invalidCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => {
            row[h] = values[idx] || '';
          });

          const errors: string[] = [];

          // Validation
          if (row['Department'] && row['Department'] !== department) {
            errors.push(`Department "${row['Department']}" does not match logged-in department "${department}"`);
          }
          if (!row['Description']) {
            errors.push('Description is mandatory');
          }
          if (!row['Start Date']) {
            errors.push('Start Date is mandatory');
          }
          if (!row['End Date']) {
            errors.push('End Date is mandatory');
          }
          if (row['Start Date'] && row['End Date']) {
            const start = new Date(row['Start Date']);
            const end = new Date(row['End Date']);
            if (end < start) {
              errors.push('End Date must be greater than Start Date');
            }
          }

          const yearVal = row['Year'] || selectedYear;
          const semVal = row['Semester'] || selectedSemester;
          if (!YEARS_OF_STUDY.includes(yearVal)) {
            errors.push(`Year "${yearVal}" is not valid`);
          }
          if (!SEMESTERS.includes(semVal)) {
            errors.push(`Semester "${semVal}" is not valid`);
          }

          const duration =
            row['Duration'] && parseInt(row['Duration']) > 0
              ? parseInt(row['Duration'])
              : calculateDuration(row['Start Date'], row['End Date']);

          const calEvent: CalendarEvent = {
            id: `upload-${i}`,
            department: row['Department'] || department,
            year: yearVal,
            semester: semVal,
            description: row['Description'] || '',
            startDate: row['Start Date'] || '',
            endDate: row['End Date'] || '',
            duration,
            status: errors.length > 0 ? 'invalid' : 'valid',
            errors: errors.length > 0 ? errors : undefined,
          };

          if (errors.length > 0) {
            invalidCount++;
          } else {
            validCount++;
          }

          parsed.push(calEvent);
        }

        setUploadPreview(parsed);
        setUploadStats({ total: parsed.length, valid: validCount, invalid: invalidCount });
        setShowUploadDialog(true);
      };
      reader.readAsText(file);
      // Reset input so same file can be re-uploaded
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [department, selectedYear, selectedSemester]
  );

  // Import uploaded events via live API
  const handleImportUploaded = useCallback(async () => {
    const validEvents = uploadPreview.filter((e) => e.status === 'valid');
    if (validEvents.length === 0) return;

    setUploading(true);
    try {
      // Format payload according to backend BulkCreateAcademicCalendarEventRequest schema
      const targetYear = validEvents[0]?.year || selectedYear;
      const targetSem = validEvents[0]?.semester || selectedSemester;

      // Persist to backend via bulk save endpoint
      await academicRepositoryService.bulkSaveCalendarEvents(departmentId, {
        academicYear,
        yearOfStudy: targetYear,
        semester: targetSem,
        events: validEvents.map((e) => ({
          academicYear,
          yearOfStudy: e.year || targetYear,
          semester: e.semester || targetSem,
          description: e.description,
          startDate: e.startDate,
          endDate: e.endDate,
        })),
      });

      // Auto-switch to the year/semester of the imported records so user sees them immediately
      if (targetYear && YEARS_OF_STUDY.includes(targetYear)) {
        setSelectedYear(targetYear);
      }
      if (targetSem && SEMESTERS.includes(targetSem)) {
        setSelectedSemester(targetSem);
      }

      await fetchEvents();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      setShowUploadDialog(false);
      setUploadPreview([]);
      setUploadStats(null);
      setSelectedCsvFile(null);
    } catch (err: any) {
      console.error('CSV import failed:', err);
      alert(err?.response?.data?.message || err?.message || 'CSV import failed');
    } finally {
      setUploading(false);
    }
  }, [uploadPreview, departmentId, academicYear, selectedYear, selectedSemester, fetchEvents]);

  const [submitting, setSubmitting] = useState(false);
  const [deleteTargetEvent, setDeleteTargetEvent] = useState<CalendarEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [savingBulk, setSavingBulk] = useState(false);

  // Add or Update event via live API
  const handleAddEvent = useCallback(async () => {
    if (!newEvent.description || !newEvent.startDate || !newEvent.endDate) return;

    setSubmitting(true);
    try {
      const payload = {
        academicYear,
        yearOfStudy: selectedYear,
        semester: selectedSemester,
        description: newEvent.description,
        startDate: newEvent.startDate,
        endDate: newEvent.endDate,
      };

      if (editingEvent && editingEvent.id) {
        await academicRepositoryService.updateCalendarEvent(editingEvent.id, departmentId, payload);
      } else {
        await academicRepositoryService.createCalendarEvent(departmentId, payload);
      }

      await fetchEvents();
      setNewEvent({ description: '', startDate: '', endDate: '' });
      setShowAddDialog(false);
      setEditingEvent(null);
    } catch (err: any) {
      console.error('Failed to save calendar event:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to save calendar event');
    } finally {
      setSubmitting(false);
    }
  }, [newEvent, academicYear, selectedYear, selectedSemester, editingEvent, departmentId, fetchEvents]);

  // Edit event trigger
  const handleEditEvent = useCallback((event: CalendarEvent) => {
    setEditingEvent(event);
    setNewEvent({
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
    });
    setShowAddDialog(true);
  }, []);

  // Confirm delete event via live API
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTargetEvent) return;
    setIsDeleting(true);
    try {
      await academicRepositoryService.deleteCalendarEvent(deleteTargetEvent.id, departmentId);
      await fetchEvents();
      setDeleteTargetEvent(null);
    } catch (err: any) {
      console.error('Failed to delete calendar event:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to delete calendar event');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTargetEvent, departmentId, fetchEvents]);

  // Save Calendar (Bulk save for current year & semester)
  const handleSaveCalendar = useCallback(async () => {
    const yearSemEvents = events.filter(
      (e) => cleanYear(e.year) === cleanYear(selectedYear) && cleanSem(e.semester) === cleanSem(selectedSemester)
    );
    if (yearSemEvents.length === 0) return;

    setSavingBulk(true);
    try {
      await academicRepositoryService.bulkSaveCalendarEvents(departmentId, {
        academicYear,
        yearOfStudy: selectedYear,
        semester: selectedSemester,
        events: yearSemEvents.map((e) => ({
          academicYear,
          yearOfStudy: e.year,
          semester: e.semester,
          description: e.description,
          startDate: e.startDate,
          endDate: e.endDate,
        })),
      });

      await fetchEvents();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Failed to bulk save calendar events:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to save calendar events');
    } finally {
      setSavingBulk(false);
    }
  }, [events, selectedYear, selectedSemester, departmentId, academicYear, fetchEvents]);

  const totalEventsForYearSem = events.filter(
    (e) => cleanYear(e.year) === cleanYear(selectedYear) && cleanSem(e.semester) === cleanSem(selectedSemester)
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Department Academic Calendar</h2>
              <p className="text-xs text-muted-foreground">
                Manage academic calendar events for report generation and accreditation evidence
              </p>
            </div>
          </div>
        </div>

        {/* Context Selector Cards - Student Repository Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Department Card */}
          <div className="relative p-4 rounded-xl border border-border/60 bg-gradient-to-br from-slate-900/80 to-slate-800/80 dark:from-slate-800/60 dark:to-slate-900/60 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-blue-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Department</span>
            </div>
            <p className="text-sm font-semibold text-white truncate">{department}</p>
          </div>
          {/* Academic Year Card */}
          <div className="relative p-4 rounded-xl border border-border/60 bg-gradient-to-br from-slate-900/80 to-slate-800/80 dark:from-slate-800/60 dark:to-slate-900/60 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="h-4 w-4 text-purple-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Academic Year</span>
            </div>
            <p className="text-sm font-semibold text-purple-300 truncate">{academicYear}</p>
          </div>
          {/* Year Card */}
          <div className="relative p-4 rounded-xl border border-border/60 bg-gradient-to-br from-slate-900/80 to-slate-800/80 dark:from-slate-800/60 dark:to-slate-900/60 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-4 w-4 text-emerald-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Year</span>
            </div>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="h-7 border-0 bg-transparent p-0 text-sm font-semibold text-emerald-300 shadow-none focus:ring-0 [&>svg]:text-slate-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS_OF_STUDY.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Semester Card */}
          <div className="relative p-4 rounded-xl border border-border/60 bg-gradient-to-br from-slate-900/80 to-slate-800/80 dark:from-slate-800/60 dark:to-slate-900/60 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Semester</span>
            </div>
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="h-7 border-0 bg-transparent p-0 text-sm font-semibold text-amber-300 shadow-none focus:ring-0 [&>svg]:text-slate-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEMESTERS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-2">
              <Download className="h-3.5 w-3.5" />
              Download CSV Template
            </Button>
            {!isReadOnly && (
              <>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-3.5 w-3.5" />
                    Upload CSV
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setEditingEvent(null); setNewEvent({ description: '', startDate: '', endDate: '' }); setShowAddDialog(true); }} className="gap-2">
                  <Plus className="h-3.5 w-3.5" />
                  Add Event
                </Button>
              </>
            )}
            {!isReadOnly && (
              <div className="ml-auto">
                <Button
                  size="sm"
                  onClick={handleSaveCalendar}
                  disabled={savingBulk || totalEventsForYearSem === 0}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Save className="h-3.5 w-3.5" />
                  {savingBulk ? 'Saving...' : 'Save Calendar'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Success Message */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-700">Department Academic Calendar Saved Successfully</p>
                  <p className="text-xs text-green-600 mt-0.5">
                    Total Records Imported: {totalEventsForYearSem} • Imported Successfully: {totalEventsForYearSem}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <Filter className="h-3.5 w-3.5 mr-2" />
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {MONTHS.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs">
          {filteredEvents.length} Events
        </Badge>
      </div>

      {/* Events Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            Calendar Events — {selectedYear} / {selectedSemester}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="overflow-x-auto overflow-y-auto max-h-[600px] border-t border-border/40">
              <Table>
                <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border/60">
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs font-semibold w-10 whitespace-nowrap">#</TableHead>
                    <TableHead className="text-xs font-semibold min-w-[220px]">Description</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap min-w-[110px]">Start Date</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap min-w-[110px]">End Date</TableHead>
                    <TableHead className="text-xs font-semibold text-center whitespace-nowrap min-w-[90px]">Duration</TableHead>
                    <TableHead className="text-xs font-semibold text-center whitespace-nowrap min-w-[90px]">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-right whitespace-nowrap min-w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i} className="border-b border-border/40">
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No calendar events yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a CSV or add events manually to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[600px] border-t border-border/40">
              <Table className="relative">
                <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 shadow-sm border-b border-border/60">
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="text-xs font-semibold w-10 whitespace-nowrap">#</TableHead>
                    <TableHead className="text-xs font-semibold min-w-[220px]">Description</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap min-w-[110px]">Start Date</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap min-w-[110px]">End Date</TableHead>
                    <TableHead className="text-xs font-semibold text-center whitespace-nowrap min-w-[90px]">Duration</TableHead>
                    <TableHead className="text-xs font-semibold text-center whitespace-nowrap min-w-[90px]">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-right whitespace-nowrap min-w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event, idx) => {
                    const status = getEventStatus(event.startDate, event.endDate);
                    return (
                      <TableRow key={event.id} className="hover:bg-muted/50 border-b border-border/40 transition-colors">
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{idx + 1}</TableCell>
                        <TableCell className="text-sm font-medium">{event.description}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{formatDate(event.startDate)}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{formatDate(event.endDate)}</TableCell>
                        <TableCell className="text-xs text-center whitespace-nowrap">
                          <Badge variant="outline" className="text-[10px]">
                            {event.duration} {event.duration === 1 ? 'day' : 'days'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px]',
                              status === 'upcoming' && 'bg-blue-500/10 text-blue-600 border-blue-500/20',
                              status === 'ongoing' && 'bg-green-500/10 text-green-600 border-green-500/20',
                              status === 'completed' && 'bg-gray-500/10 text-gray-600 border-gray-500/20'
                            )}
                          >
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {isReadOnly ? (
                              <span className="text-[10px] text-muted-foreground italic">Read-only</span>
                            ) : (
                              <>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditEvent(event)}>
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => setDeleteTargetEvent(event)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Future Integration Info */}
      <Card className="border-border/50 bg-muted/20">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Future Integration</p>
          <div className="flex flex-wrap gap-2">
            {[
              'Department Academic Calendar PDF',
              'Printable Calendar',
              'Excel Export',
              'NAAC Academic Calendar Evidence',
              'NBA Academic Calendar Evidence',
            ].map((item) => (
              <Badge key={item} variant="outline" className="text-[10px] bg-background">
                {item}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Event Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); setEditingEvent(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">{editingEvent ? 'Edit Event' : 'Add Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Department</Label>
                <p className="text-sm font-medium mt-1">{department}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Academic Year</Label>
                <p className="text-sm font-medium mt-1">{academicYear}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Year</Label>
                <p className="text-sm font-medium mt-1">{selectedYear}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Semester</Label>
                <p className="text-sm font-medium mt-1">{selectedSemester}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Description *</Label>
                <Input
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="e.g., Commencement of Class Work"
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Start Date *</Label>
                  <div className="mt-1">
                    <DatePicker
                      value={newEvent.startDate}
                      onChange={(v) => setNewEvent({ ...newEvent, startDate: v })}
                      placeholder="Select start date"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">End Date *</Label>
                  <div className="mt-1">
                    <DatePicker
                      value={newEvent.endDate}
                      onChange={(v) => setNewEvent({ ...newEvent, endDate: v })}
                      placeholder="Select end date"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
              {newEvent.startDate && newEvent.endDate && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Duration: {calculateDuration(newEvent.startDate, newEvent.endDate)} days (auto-calculated)
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setShowAddDialog(false); setEditingEvent(null); }}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddEvent}
              disabled={submitting || !newEvent.description || !newEvent.startDate || !newEvent.endDate}
            >
              {submitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Add Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Preview Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-5xl lg:max-w-6xl h-[85vh] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-5 pb-4 border-b border-border/50 shrink-0">
            <DialogTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4 text-blue-500" />
              CSV Upload Preview
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
            {uploadStats && (
              <>
                {/* Upload Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
                  <Card className="border-border/50">
                    <CardContent className="p-3 text-center">
                      <p className="text-lg font-bold">{uploadStats.total}</p>
                      <p className="text-[10px] text-muted-foreground">Records Found</p>
                    </CardContent>
                  </Card>
                  <Card className="border-green-500/30 bg-green-500/5">
                    <CardContent className="p-3 text-center">
                      <p className="text-lg font-bold text-green-600">{uploadStats.valid}</p>
                      <p className="text-[10px] text-green-600">Valid</p>
                    </CardContent>
                  </Card>
                  <Card className="border-red-500/30 bg-red-500/5">
                    <CardContent className="p-3 text-center">
                      <p className="text-lg font-bold text-red-600">{uploadStats.invalid}</p>
                      <p className="text-[10px] text-red-600">Invalid</p>
                    </CardContent>
                  </Card>
                </div>

                {uploadStats.valid > 0 && uploadStats.invalid === 0 && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-700 font-medium">CSV Uploaded Successfully — All records are valid</p>
                  </div>
                )}

                {/* Preview Table */}
                <div className="border border-border/60 rounded-xl overflow-hidden bg-card/50">
                  <div className="max-h-[360px] overflow-auto">
                    <Table className="relative">
                      <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-sm">
                        <TableRow className="border-b border-border/60">
                          <TableHead className="text-xs font-semibold w-10 whitespace-nowrap bg-muted/95">#</TableHead>
                          <TableHead className="text-xs font-semibold min-w-[180px] whitespace-nowrap bg-muted/95">Department</TableHead>
                          <TableHead className="text-xs font-semibold min-w-[80px] whitespace-nowrap bg-muted/95">Year</TableHead>
                          <TableHead className="text-xs font-semibold min-w-[100px] whitespace-nowrap bg-muted/95">Semester</TableHead>
                          <TableHead className="text-xs font-semibold min-w-[220px] whitespace-nowrap bg-muted/95">Description</TableHead>
                          <TableHead className="text-xs font-semibold min-w-[100px] whitespace-nowrap bg-muted/95">Start Date</TableHead>
                          <TableHead className="text-xs font-semibold min-w-[100px] whitespace-nowrap bg-muted/95">End Date</TableHead>
                          <TableHead className="text-xs font-semibold text-center min-w-[80px] whitespace-nowrap bg-muted/95">Duration</TableHead>
                          <TableHead className="text-xs font-semibold text-center min-w-[70px] whitespace-nowrap bg-muted/95">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uploadPreview.map((event, idx) => (
                          <TableRow
                            key={event.id}
                            className={cn(
                              'hover:bg-muted/40 transition-colors',
                              event.status === 'invalid' && 'bg-red-500/5 border-l-2 border-l-red-500'
                            )}
                          >
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{idx + 1}</TableCell>
                            <TableCell className="text-xs whitespace-nowrap">{event.department}</TableCell>
                            <TableCell className="text-xs whitespace-nowrap font-medium">{event.year}</TableCell>
                            <TableCell className="text-xs whitespace-nowrap">{event.semester}</TableCell>
                            <TableCell className="text-xs font-medium">{event.description}</TableCell>
                            <TableCell className="text-xs whitespace-nowrap">{event.startDate}</TableCell>
                            <TableCell className="text-xs whitespace-nowrap">{event.endDate}</TableCell>
                            <TableCell className="text-xs text-center whitespace-nowrap font-semibold">{event.duration}</TableCell>
                            <TableCell className="text-center whitespace-nowrap">
                              {event.status === 'valid' ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                              ) : (
                                <div className="flex items-center gap-1 justify-center">
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                  <span className="text-[9px] text-red-600 max-w-[120px] truncate" title={event.errors?.join(', ')}>
                                    {event.errors?.[0]}
                                  </span>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Validation Errors Summary */}
                {uploadStats.invalid > 0 && (
                  <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 shrink-0">
                    <p className="text-xs font-semibold text-red-700 mb-2">Validation Errors</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {uploadPreview
                        .filter((e) => e.status === 'invalid')
                        .map((e, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <X className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-red-600">
                              Row {uploadPreview.indexOf(e) + 1}: {e.errors?.join('; ')}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="p-4 px-5 border-t border-border/50 bg-muted/20 shrink-0 flex items-center justify-between sm:justify-between">
            <Button variant="outline" size="sm" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleImportUploaded}
              disabled={uploading || !uploadStats || uploadStats.valid === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {uploading ? 'Importing...' : `Import ${uploadStats?.valid || 0} Valid Records`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteTargetEvent} onOpenChange={(open) => !open && setDeleteTargetEvent(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20 mt-0.5">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="space-y-1">
                <AlertDialogTitle className="text-base font-semibold">
                  Delete Calendar Event
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-muted-foreground">
                  Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteTargetEvent?.description}"</span>? This event will be permanently removed.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel disabled={isDeleting} onClick={() => setDeleteTargetEvent(null)}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-medium gap-2"
            >
              {isDeleting ? (
                <>
                  <Trash2 className="h-3.5 w-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Event'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
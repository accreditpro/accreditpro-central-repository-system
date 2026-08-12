import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
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
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { cn } from '@/lib/utils';
import { academicRepositoryService } from '@/services/academic-repository.service';
import {
  Clock,
  Download,
  Upload,
  Plus,
  Save,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileText,
  X,
  LayoutGrid,
  List,
  Building2,
  CalendarDays,
  GraduationCap,
  BookOpen,
  Users,
  RefreshCw,
} from 'lucide-react';

function formatTimeTo24h(timeStr: string): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    const parts = trimmed.split(':');
    const h = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    const s = (parts[2] || '00').padStart(2, '0');
    return `${h}:${m}:${s}`;
  }
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = match[2];
    const s = match[3] || '00';
    const modifier = match[4].toUpperCase();
    if (modifier === 'PM' && h < 12) h += 12;
    if (modifier === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${m}:${s}`;
  }
  return trimmed;
}

function formatDateToISO(dateStr: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }
  return trimmed;
}

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

interface TimetableEntry {
  id: string;
  department: string;
  year: string;
  semester: string;
  section: string;
  period: number;
  day: string;
  timeFrom: string;
  timeTo: string;
  courseCode: string;
  classInCharge: string;
  wef: string;
  validationStatus?: 'valid' | 'invalid';
  errors?: string[];
}

interface AcademicTimetableModuleProps {
  department: string;
  academicYear: string;
  departmentId?: number;
}

const YEARS_OF_STUDY = ['I Year', 'II Year', 'III Year', 'IV Year'];
const SEMESTERS_MAP: Record<string, string[]> = {
  'I Year': ['Semester 1', 'Semester 2'],
  'II Year': ['Semester 3', 'Semester 4'],
  'III Year': ['Semester 5', 'Semester 6'],
  'IV Year': ['Semester 7', 'Semester 8'],
};
const SECTIONS = ['A', 'B', 'C', 'D'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const AcademicTimetableModule = ({ department, academicYear, departmentId }: AcademicTimetableModuleProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedYear, setSelectedYear] = useState('III Year');
  const [selectedSemester, setSelectedSemester] = useState('Semester 5');
  const [selectedSection, setSelectedSection] = useState('A');
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<TimetableEntry[]>([]);
  const [uploadStats, setUploadStats] = useState<{ total: number; valid: number; invalid: number } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch timetable entries from live API
  const fetchTimetable = useCallback(async () => {
    setLoading(true);
    try {
      const res = await academicRepositoryService.getTimetableEntries(
        academicYear,
        departmentId || 1
      );
      let rawList: any[] = [];
      if (Array.isArray(res)) {
        rawList = res;
      } else if (res && Array.isArray(res.content)) {
        rawList = res.content;
      } else if (res && res.data && Array.isArray(res.data.content)) {
        rawList = res.data.content;
      } else if (res && res.data && Array.isArray(res.data)) {
        rawList = res.data;
      }

      const mapped: TimetableEntry[] = rawList.map((item: any) => ({
        id: item.id ? String(item.id) : `timetable-${Date.now()}-${Math.random()}`,
        department: item.department || department,
        year: item.yearOfStudy || item.year || 'III Year',
        semester: item.semester || 'Semester 5',
        section: item.section || 'A',
        period: typeof item.period === 'number' ? item.period : parseInt(item.period) || 1,
        day: item.day || 'Monday',
        timeFrom: item.timeFrom ? String(item.timeFrom).slice(0, 5) : '',
        timeTo: item.timeTo ? String(item.timeTo).slice(0, 5) : '',
        courseCode: item.courseCode || '',
        classInCharge: item.classInCharge || '',
        wef: item.wef || '',
      }));
      setEntries(mapped);
    } catch (err) {
      console.error('Failed to fetch timetable entries:', err);
    } finally {
      setLoading(false);
    }
  }, [academicYear, departmentId, department]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  // New entry form state
  const [newEntry, setNewEntry] = useState({
    period: '1',
    day: 'Monday',
    timeFrom: '',
    timeTo: '',
    courseCode: '',
    classInCharge: '',
    wef: '',
  });

  // Update semester when year changes
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    const semesters = SEMESTERS_MAP[year];
    if (semesters && semesters.length > 0) {
      setSelectedSemester(semesters[0]);
    }
  };

  // Filtered entries for selected year/semester/section
  const filteredEntries = useMemo(() => {
    const cleanSection = (s: string) =>
      (s || '').replace(/^(section|sec)\s*/i, '').trim().toUpperCase();

    const cleanYear = (y: string) => {
      let str = (y || '').toLowerCase().trim();
      str = str.replace(/\b1st\b|\bfirst\b|\bi\b/g, 'i');
      str = str.replace(/\b2nd\b|\bsecond\b|\bii\b/g, 'ii');
      str = str.replace(/\b3rd\b|\bthird\b|\biii\b/g, 'iii');
      str = str.replace(/\b4th\b|\bfourth\b|\biv\b/g, 'iv');
      str = str.replace(/\s+year/g, '').trim();
      return str;
    };

    const cleanSem = (s: string) => {
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
    };

    return entries.filter((e) => {
      const matchYear = cleanYear(e.year) === cleanYear(selectedYear);
      const matchSem = cleanSem(e.semester) === cleanSem(selectedSemester);
      const matchSec = cleanSection(e.section) === cleanSection(selectedSection);
      return matchYear && matchSem && matchSec;
    });
  }, [entries, selectedYear, selectedSemester, selectedSection]);

  // Build timetable grid data
  const timetableGrid = useMemo(() => {
    const grid: Record<string, Record<string, TimetableEntry | null>> = {};
    DAYS.forEach((day) => {
      grid[day] = {};
      PERIODS.forEach((period) => {
        grid[day][period.toString()] = null;
      });
    });
    filteredEntries.forEach((entry) => {
      if (grid[entry.day]) {
        grid[entry.day][entry.period.toString()] = entry;
      }
    });
    return grid;
  }, [filteredEntries]);

  // Get unique time slots from entries
  const periodTimes = useMemo(() => {
    const times: Record<number, { from: string; to: string }> = {};
    filteredEntries.forEach((entry) => {
      if (!times[entry.period] && entry.timeFrom && entry.timeTo) {
        times[entry.period] = { from: entry.timeFrom, to: entry.timeTo };
      }
    });
    return times;
  }, [filteredEntries]);

  const availableSemesters = SEMESTERS_MAP[selectedYear] || [];

  const [selectedCsvFile, setSelectedCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  // Download CSV Template
  const handleDownloadTemplate = useCallback(() => {
    const currentEntries = entries.filter(
      (e) => e.year === selectedYear && e.semester === selectedSemester && e.section === selectedSection
    );
    const headers = 'Department,Year,Semester,Section,Period,Day,Time From,Time To,Course Code,Class In-Charge,W.E.F';

    let csvRows: string[] = [];
    if (currentEntries.length > 0) {
      csvRows = currentEntries.map((e) => {
        const escape = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
        return [
          escape(department),
          escape(e.year),
          escape(e.semester),
          escape(e.section),
          e.period,
          escape(e.day),
          escape(e.timeFrom),
          escape(e.timeTo),
          escape(e.courseCode),
          escape(e.classInCharge),
          escape(e.wef),
        ].join(',');
      });
    } else {
      csvRows.push(`"${department}","${selectedYear}","${selectedSemester}","${selectedSection}",1,"Monday","09:00","09:50","CS501","Dr. Anita Sharma","2026-07-01"`);
      csvRows.push(`"${department}","${selectedYear}","${selectedSemester}","${selectedSection}",2,"Monday","09:50","10:40","CS502","Mr. Anil Reddy","2026-07-01"`);
    }

    const csvContent = [headers, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic_timetable_${academicYear}_${selectedYear.replace(/\s+/g, '_')}_${selectedSemester.replace(/\s+/g, '_')}_Sec${selectedSection}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [entries, department, selectedYear, selectedSemester, selectedSection, academicYear]);

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
        if (lines.length < 2) return;

        const headers = parseCSVLine(lines[0]);

        const parsed: TimetableEntry[] = [];
        let validCount = 0;
        let invalidCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => {
            row[h.trim()] = values[idx]?.trim() || '';
          });

          const getField = (...keys: string[]) => {
            for (const key of keys) {
              for (const [k, v] of Object.entries(row)) {
                if (k.toLowerCase().replace(/[^a-z0-9]/g, '') === key.toLowerCase().replace(/[^a-z0-9]/g, '')) {
                  return v;
                }
              }
            }
            return '';
          };

          const periodRaw = getField('Period', 'PeriodNumber', 'Slot');
          const period = parseInt(periodRaw) || 1;
          const day = getField('Day', 'DayOfWeek', 'Weekday') || 'Monday';
          const timeFrom = getField('Time From', 'TimeFrom', 'StartTime');
          const timeTo = getField('Time To', 'TimeTo', 'EndTime');
          const courseCode = getField('Course Code', 'CourseCode', 'SubjectCode', 'Course');
          const classInCharge = getField('Class In-Charge', 'ClassInCharge', 'Faculty', 'Teacher', 'Instructor');
          const wef = getField('W.E.F', 'WEF', 'EffectiveDate', 'WithEffectFrom');
          const yearVal = getField('Year', 'YearOfStudy', 'Year of Study') || selectedYear;
          const semVal = getField('Semester', 'Sem') || selectedSemester;
          const sectionVal = getField('Section', 'Sec') || selectedSection;

          const errors: string[] = [];

          if (period < 1 || period > 8) errors.push('Period must be between 1 and 8');
          if (!DAYS.includes(day)) errors.push(`Day must be one of: ${DAYS.join(', ')}`);
          if (!courseCode) errors.push('Course Code is mandatory');
          if (!classInCharge) errors.push('Class In-Charge is mandatory');

          const entry: TimetableEntry = {
            id: `upload-${Date.now()}-${i}`,
            department,
            year: yearVal,
            semester: semVal,
            section: sectionVal,
            period,
            day,
            timeFrom,
            timeTo,
            courseCode,
            classInCharge,
            wef,
            validationStatus: errors.length > 0 ? 'invalid' : 'valid',
            errors: errors.length > 0 ? errors : undefined,
          };

          if (errors.length > 0) {
            invalidCount++;
          } else {
            validCount++;
          }

          parsed.push(entry);
        }

        setUploadPreview(parsed);
        setUploadStats({ total: parsed.length, valid: validCount, invalid: invalidCount });
        setShowUploadDialog(true);
      };
      reader.readAsText(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [department, selectedYear, selectedSemester, selectedSection]
  );

  // Import uploaded entries via live API
  const handleImportUploaded = useCallback(async () => {
    const validEntries = uploadPreview.filter((e) => e.validationStatus === 'valid');
    if (validEntries.length === 0) return;

    setIsImporting(true);
    try {
      const targetYear = validEntries[0]?.year || selectedYear;
      const targetSem = validEntries[0]?.semester || selectedSemester;
      const targetSec = validEntries[0]?.section || selectedSection;

      const entriesPayload = validEntries.map((e) => ({
        academicYear,
        yearOfStudy: e.year || targetYear,
        semester: e.semester || targetSem,
        section: e.section || targetSec,
        period: typeof e.period === 'number' ? e.period : parseInt(e.period) || 1,
        day: e.day,
        timeFrom: formatTimeTo24h(e.timeFrom) || undefined,
        timeTo: formatTimeTo24h(e.timeTo) || undefined,
        courseCode: e.courseCode,
        classInCharge: e.classInCharge,
        wef: formatDateToISO(e.wef) || undefined,
      }));

      await academicRepositoryService.bulkSaveTimetable(departmentId || 1, {
        academicYear,
        yearOfStudy: targetYear,
        semester: targetSem,
        section: targetSec,
        entries: entriesPayload,
      });

      if (targetYear && YEARS_OF_STUDY.includes(targetYear)) {
        setSelectedYear(targetYear);
      }
      if (targetSem) {
        setSelectedSemester(targetSem);
      }
      if (targetSec && SECTIONS.includes(targetSec)) {
        setSelectedSection(targetSec);
      }

      await fetchTimetable();
      setShowUploadDialog(false);
      setUploadPreview([]);
      setUploadStats(null);
      setSelectedCsvFile(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to import timetable entries:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to import timetable entries');
    } finally {
      setIsImporting(false);
    }
  }, [uploadPreview, academicYear, departmentId, selectedYear, selectedSemester, selectedSection, fetchTimetable]);

  const [submitting, setSubmitting] = useState(false);
  const [deleteTargetEntry, setDeleteTargetEntry] = useState<TimetableEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add/Edit entry via live API
  const handleAddEntry = useCallback(async () => {
    if (!newEntry.courseCode || !newEntry.classInCharge) return;

    setSubmitting(true);
    try {
      const payload = {
        academicYear,
        yearOfStudy: selectedYear,
        semester: selectedSemester,
        section: selectedSection,
        period: parseInt(newEntry.period) || 1,
        day: newEntry.day,
        timeFrom: formatTimeTo24h(newEntry.timeFrom) || undefined,
        timeTo: formatTimeTo24h(newEntry.timeTo) || undefined,
        courseCode: newEntry.courseCode,
        classInCharge: newEntry.classInCharge,
        wef: formatDateToISO(newEntry.wef) || undefined,
      };

      if (editingEntry && editingEntry.id) {
        await academicRepositoryService.updateTimetableEntry(editingEntry.id, departmentId || 1, payload);
      } else {
        await academicRepositoryService.createTimetableEntry(departmentId || 1, payload);
      }

      await fetchTimetable();
      setNewEntry({ period: '1', day: 'Monday', timeFrom: '', timeTo: '', courseCode: '', classInCharge: '', wef: '' });
      setShowAddDialog(false);
      setEditingEntry(null);
    } catch (err: any) {
      console.error('Failed to save timetable entry:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to save timetable entry');
    } finally {
      setSubmitting(false);
    }
  }, [newEntry, editingEntry, departmentId, academicYear, selectedYear, selectedSemester, selectedSection, fetchTimetable]);

  // Edit entry
  const handleEditEntry = useCallback((entry: TimetableEntry) => {
    setEditingEntry(entry);
    setNewEntry({
      period: entry.period.toString(),
      day: entry.day,
      timeFrom: entry.timeFrom,
      timeTo: entry.timeTo,
      courseCode: entry.courseCode,
      classInCharge: entry.classInCharge,
      wef: entry.wef,
    });
    setShowAddDialog(true);
  }, []);

  // Delete entry
  const handleDeleteEntry = useCallback((entry: TimetableEntry) => {
    setDeleteTargetEntry(entry);
  }, []);

  // Confirm delete handler via live API
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTargetEntry) return;
    setIsDeleting(true);
    try {
      await academicRepositoryService.deleteTimetableEntry(deleteTargetEntry.id, departmentId || 1);
      await fetchTimetable();
      setDeleteTargetEntry(null);
    } catch (err: any) {
      console.error('Failed to delete timetable entry:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to delete timetable entry');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTargetEntry, departmentId, fetchTimetable]);

  // Save Timetable
  const handleSaveTimetable = useCallback(async () => {
    setIsBulkSaving(true);
    try {
      const payload = filteredEntries.map((e) => ({
        academicYear,
        yearOfStudy: selectedYear,
        semester: selectedSemester,
        section: selectedSection,
        period: typeof e.period === 'number' ? e.period : parseInt(e.period) || 1,
        day: e.day,
        timeFrom: formatTimeTo24h(e.timeFrom) || undefined,
        timeTo: formatTimeTo24h(e.timeTo) || undefined,
        courseCode: e.courseCode,
        classInCharge: e.classInCharge,
        wef: formatDateToISO(e.wef) || undefined,
      }));

      await academicRepositoryService.bulkSaveTimetable(departmentId || 1, {
        academicYear,
        yearOfStudy: selectedYear,
        semester: selectedSemester,
        section: selectedSection,
        entries: payload,
      });

      await fetchTimetable();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to bulk save timetable:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to save timetable');
    } finally {
      setIsBulkSaving(false);
    }
  }, [entries, selectedYear, selectedSemester, selectedSection, academicYear, departmentId, fetchTimetable]);

  const totalEntriesForContext = filteredEntries.length;

  // Color palette for course codes
  const courseColors = useMemo(() => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-emerald-100 text-emerald-800 border-emerald-200',
      'bg-violet-100 text-violet-800 border-violet-200',
      'bg-amber-100 text-amber-800 border-amber-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-cyan-100 text-cyan-800 border-cyan-200',
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-rose-100 text-rose-800 border-rose-200',
      'bg-teal-100 text-teal-800 border-teal-200',
    ];
    const uniqueCourses = [...new Set(filteredEntries.map((e) => e.courseCode))];
    const map: Record<string, string> = {};
    uniqueCourses.forEach((course, idx) => {
      map[course] = colors[idx % colors.length];
    });
    return map;
  }, [filteredEntries]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Academic Timetable</h2>
              <p className="text-xs text-muted-foreground">
                Manage class timetables — upload via CSV and view in grid or list format
              </p>
            </div>
          </div>
          {/* View Toggle */}
          <div className="flex items-center gap-1 border rounded-lg p-0.5">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2 gap-1"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="text-xs hidden sm:inline">Grid</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2 gap-1"
              onClick={() => setViewMode('list')}
            >
              <List className="h-3.5 w-3.5" />
              <span className="text-xs hidden sm:inline">List</span>
            </Button>
          </div>
        </div>

        {/* Context Selector Cards - Student Repository Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
            <p className="text-sm font-semibold text-purple-300 truncate">{academicYear}</p>
          </div>
          <div className="relative p-4 rounded-xl border border-border/60 bg-gradient-to-br from-slate-900/80 to-slate-800/80 dark:from-slate-800/60 dark:to-slate-900/60 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-4 w-4 text-emerald-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Year</span>
            </div>
            <Select value={selectedYear} onValueChange={handleYearChange}>
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
                {availableSemesters.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative p-4 rounded-xl border border-border/60 bg-gradient-to-br from-slate-900/80 to-slate-800/80 dark:from-slate-800/60 dark:to-slate-900/60 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-rose-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Section</span>
            </div>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="h-7 border-0 bg-transparent p-0 text-sm font-semibold text-rose-300 shadow-none focus:ring-0 [&>svg]:text-slate-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SECTIONS.map((s) => (
                  <SelectItem key={s} value={s}>Section {s}</SelectItem>
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
            <Button variant="outline" size="sm" onClick={() => { setEditingEntry(null); setNewEntry({ period: '1', day: 'Monday', timeFrom: '', timeTo: '', courseCode: '', classInCharge: '', wef: '' }); setShowAddDialog(true); }} className="gap-2">
              <Plus className="h-3.5 w-3.5" />
              Add Entry
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {totalEntriesForContext} entries
              </Badge>
              <Button
                size="sm"
                onClick={handleSaveTimetable}
                disabled={totalEntriesForContext === 0 || isBulkSaving}
                className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
              >
                {isBulkSaving ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Save Timetable
                  </>
                )}
              </Button>
            </div>
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
                  <p className="text-sm font-semibold text-green-700">Timetable Saved Successfully</p>
                  <p className="text-xs text-green-600 mt-0.5">
                    {selectedYear} / {selectedSemester} / Section {selectedSection} — {totalEntriesForContext} entries
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timetable Display */}
      {loading ? (
        <Card className="border-border/50">
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Loading timetable entries...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredEntries.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Clock className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No timetable entries yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a CSV or add entries manually for {selectedYear} / {selectedSemester} / Section {selectedSection}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid View - Timetable Format */
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-indigo-600" />
              Timetable — {selectedYear} / {selectedSemester} / Section {selectedSection}
              {filteredEntries.length > 0 && filteredEntries[0].wef && (
                <Badge variant="outline" className="text-[10px] ml-2">
                  W.E.F: {formatDate(filteredEntries[0].wef)}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="w-full">
              <div className="min-w-[800px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-indigo-50/50 dark:bg-indigo-950/20">
                      <TableHead className="text-xs font-bold text-center w-[100px] border-r">Period / Day</TableHead>
                      {DAYS.map((day) => (
                        <TableHead key={day} className="text-xs font-bold text-center border-r last:border-r-0">
                          {day.slice(0, 3)}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PERIODS.filter((period) => {
                      // Only show periods that have at least one entry
                      return DAYS.some((day) => timetableGrid[day]?.[period.toString()]);
                    }).map((period) => (
                      <TableRow key={period} className="hover:bg-muted/50">
                        <TableCell className="text-center border-r p-2">
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-bold text-indigo-700">P{period}</span>
                            {periodTimes[period] && (
                              <span className="text-[9px] text-muted-foreground mt-0.5">
                                {periodTimes[period].from}-{periodTimes[period].to}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        {DAYS.map((day) => {
                          const entry = timetableGrid[day]?.[period.toString()];
                          return (
                            <TableCell key={day} className="border-r last:border-r-0 p-1.5">
                              {entry ? (
                                <div
                                  className={cn(
                                    'rounded-md border p-1.5 text-center cursor-pointer hover:shadow-sm transition-shadow group relative',
                                    courseColors[entry.courseCode] || 'bg-gray-100 text-gray-800 border-gray-200'
                                  )}
                                  onClick={() => handleEditEntry(entry)}
                                >
                                  <p className="text-[11px] font-bold leading-tight">{entry.courseCode}</p>
                                  <p className="text-[9px] mt-0.5 opacity-80 truncate">{entry.classInCharge}</p>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute -top-1 -right-1 h-4 w-4 opacity-0 group-hover:opacity-100 bg-white shadow-sm rounded-full"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry); }}
                                  >
                                    <X className="h-2.5 w-2.5 text-red-500" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="h-10 rounded-md border border-dashed border-muted-foreground/20 flex items-center justify-center">
                                  <span className="text-[9px] text-muted-foreground/40">—</span>
                                </div>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        /* List View */
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <List className="h-4 w-4 text-indigo-600" />
              Timetable Entries — {selectedYear} / {selectedSemester} / Section {selectedSection}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs font-semibold w-8">#</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Period</TableHead>
                    <TableHead className="text-xs font-semibold">Day</TableHead>
                    <TableHead className="text-xs font-semibold">Time</TableHead>
                    <TableHead className="text-xs font-semibold">Course Code</TableHead>
                    <TableHead className="text-xs font-semibold">Class In-Charge</TableHead>
                    <TableHead className="text-xs font-semibold">W.E.F</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries
                    .sort((a, b) => {
                      const dayOrder = DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
                      if (dayOrder !== 0) return dayOrder;
                      return a.period - b.period;
                    })
                    .map((entry, idx) => (
                      <TableRow key={entry.id} className="hover:bg-muted/50">
                        <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="text-xs text-center">
                          <Badge variant="outline" className="text-[10px]">P{entry.period}</Badge>
                        </TableCell>
                        <TableCell className="text-xs font-medium">{entry.day}</TableCell>
                        <TableCell className="text-xs">{entry.timeFrom} - {entry.timeTo}</TableCell>
                        <TableCell>
                          <Badge className={cn('text-[10px]', courseColors[entry.courseCode] || 'bg-gray-100 text-gray-800')}>
                            {entry.courseCode}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{entry.classInCharge}</TableCell>
                        <TableCell className="text-xs">{entry.wef ? formatDate(entry.wef) : '—'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditEntry(entry)}>
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteEntry(entry)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Course Legend */}
      {filteredEntries.length > 0 && (
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Course Legend</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(courseColors).map(([course, color]) => {
                const entry = filteredEntries.find((e) => e.courseCode === course);
                return (
                  <div key={course} className={cn('px-2 py-1 rounded-md border text-[10px] font-medium', color)}>
                    {course} — {entry?.classInCharge || ''}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Future Integration Info */}
      <Card className="border-border/50 bg-muted/20">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Future Integration</p>
          <div className="flex flex-wrap gap-2">
            {[
              'Timetable PDF Export',
              'Printable Timetable',
              'Faculty Workload Analysis',
              'Room Allocation',
              'NAAC Evidence',
              'NBA Evidence',
            ].map((item) => (
              <Badge key={item} variant="outline" className="text-[10px] bg-background">
                {item}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Entry Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); setEditingEntry(null); } }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-6 overflow-hidden">
          <DialogHeader className="shrink-0 pb-2">
            <DialogTitle className="text-base">{editingEntry ? 'Edit Timetable Entry' : 'Add Timetable Entry'}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 py-2 min-h-0">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Year</Label>
                <p className="text-sm font-medium mt-1">{selectedYear}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Semester</Label>
                <p className="text-sm font-medium mt-1">{selectedSemester}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Section</Label>
                <p className="text-sm font-medium mt-1">Section {selectedSection}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Period *</Label>
                  <Select value={newEntry.period} onValueChange={(v) => setNewEntry({ ...newEntry, period: v })}>
                    <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PERIODS.map((p) => (
                        <SelectItem key={p} value={p.toString()}>Period {p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Day *</Label>
                  <Select value={newEntry.day} onValueChange={(v) => setNewEntry({ ...newEntry, day: v })}>
                    <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DAYS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Time From</Label>
                  <div className="mt-1">
                    <TimePicker
                      value={newEntry.timeFrom}
                      onChange={(v) => setNewEntry({ ...newEntry, timeFrom: v })}
                      placeholder="Start time"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Time To</Label>
                  <div className="mt-1">
                    <TimePicker
                      value={newEntry.timeTo}
                      onChange={(v) => setNewEntry({ ...newEntry, timeTo: v })}
                      placeholder="End time"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs">Course Code *</Label>
                <Input
                  value={newEntry.courseCode}
                  onChange={(e) => setNewEntry({ ...newEntry, courseCode: e.target.value })}
                  placeholder="e.g., CS501 or CS505-LAB"
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Class In-Charge *</Label>
                <Input
                  value={newEntry.classInCharge}
                  onChange={(e) => setNewEntry({ ...newEntry, classInCharge: e.target.value })}
                  placeholder="e.g., Dr. Anita Sharma"
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">W.E.F (With Effect From)</Label>
                <div className="mt-1">
                  <DatePicker
                    value={newEntry.wef}
                    onChange={(v) => setNewEntry({ ...newEntry, wef: v })}
                    placeholder="Select effective date"
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="shrink-0 pt-3 border-t mt-2">
            <Button variant="outline" size="sm" onClick={() => { setShowAddDialog(false); setEditingEntry(null); }} disabled={submitting}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddEntry}
              disabled={submitting || !newEntry.courseCode || !newEntry.classInCharge}
            >
              {submitting ? 'Saving...' : editingEntry ? 'Update Entry' : 'Add Entry'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Preview Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-5xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
          <DialogHeader className="shrink-0 pb-2">
            <DialogTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4" />
              CSV Upload Preview — Academic Timetable
            </DialogTitle>
          </DialogHeader>
          {uploadStats && (
            <div className="space-y-3 flex-1 flex flex-col min-h-0">
              {/* Upload Stats */}
              <div className="flex items-center gap-4 shrink-0">
                <Card className="flex-1 border-border/50">
                  <CardContent className="p-3 text-center">
                    <p className="text-lg font-bold">{uploadStats.total}</p>
                    <p className="text-[10px] text-muted-foreground">Records Found</p>
                  </CardContent>
                </Card>
                <Card className="flex-1 border-green-500/30 bg-green-500/5">
                  <CardContent className="p-3 text-center">
                    <p className="text-lg font-bold text-green-600">{uploadStats.valid}</p>
                    <p className="text-[10px] text-green-600">Valid</p>
                  </CardContent>
                </Card>
                <Card className="flex-1 border-red-500/30 bg-red-500/5">
                  <CardContent className="p-3 text-center">
                    <p className="text-lg font-bold text-red-600">{uploadStats.invalid}</p>
                    <p className="text-[10px] text-red-600">Invalid</p>
                  </CardContent>
                </Card>
              </div>

              {uploadStats.valid > 0 && uploadStats.invalid === 0 && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <p className="text-xs text-green-700 font-medium">CSV Uploaded Successfully — All records are valid</p>
                </div>
              )}

              {/* Preview Table */}
              <div className="flex-1 overflow-x-auto overflow-y-auto border rounded-lg min-h-0 max-h-[45vh]">
                <Table className="min-w-[850px]">
                  <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 shadow-sm">
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs font-semibold w-8">#</TableHead>
                      <TableHead className="text-xs font-semibold text-center whitespace-nowrap">Period</TableHead>
                      <TableHead className="text-xs font-semibold whitespace-nowrap">Day</TableHead>
                      <TableHead className="text-xs font-semibold whitespace-nowrap">Time</TableHead>
                      <TableHead className="text-xs font-semibold whitespace-nowrap">Course Code</TableHead>
                      <TableHead className="text-xs font-semibold whitespace-nowrap">Class In-Charge</TableHead>
                      <TableHead className="text-xs font-semibold whitespace-nowrap">W.E.F</TableHead>
                      <TableHead className="text-xs font-semibold text-center whitespace-nowrap">Valid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadPreview.map((entry, idx) => (
                      <TableRow
                        key={entry.id}
                        className={cn(
                          entry.validationStatus === 'invalid' && 'bg-red-500/5 border-l-2 border-l-red-500'
                        )}
                      >
                        <TableCell className="text-xs">{idx + 1}</TableCell>
                        <TableCell className="text-xs text-center font-medium">P{entry.period}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{entry.day}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{entry.timeFrom} - {entry.timeTo}</TableCell>
                        <TableCell className="text-xs font-medium whitespace-nowrap">{entry.courseCode}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{entry.classInCharge}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{entry.wef}</TableCell>
                        <TableCell className="text-center">
                          {entry.validationStatus === 'valid' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <div className="flex items-center gap-1 justify-center">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-[9px] text-red-600 max-w-[120px] truncate" title={entry.errors?.join(', ')}>
                                {entry.errors?.[0]}
                              </span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Validation Errors Summary */}
              {uploadStats.invalid > 0 && (
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 shrink-0">
                  <p className="text-xs font-semibold text-red-700 mb-2">Validation Errors</p>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {uploadPreview
                      .filter((e) => e.validationStatus === 'invalid')
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
            </div>
          )}
          <DialogFooter className="mt-4 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setShowUploadDialog(false)} disabled={isImporting}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleImportUploaded}
              disabled={!uploadStats || uploadStats.valid === 0 || isImporting}
              className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Importing...
                </>
              ) : (
                `Import ${uploadStats?.valid || 0} Valid Records`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteTargetEntry} onOpenChange={(open) => !open && setDeleteTargetEntry(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20 mt-0.5">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="space-y-1">
                <AlertDialogTitle className="text-base font-semibold">
                  Delete Timetable Entry
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-muted-foreground">
                  Are you sure you want to delete period <span className="font-semibold text-foreground">{deleteTargetEntry?.period} ({deleteTargetEntry?.courseCode})</span> for <span className="font-semibold text-foreground">{deleteTargetEntry?.day}</span>? This entry will be permanently removed.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel disabled={isDeleting} onClick={() => setDeleteTargetEntry(null)}>
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
                'Delete Entry'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
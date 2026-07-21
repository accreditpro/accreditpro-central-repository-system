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
import { Separator } from '@/components/ui/separator';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { cn } from '@/lib/utils';
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
  FileText,
  X,
  LayoutGrid,
  List,
  Building2,
  CalendarDays,
  GraduationCap,
  BookOpen,
  Users,
} from 'lucide-react';

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

export const AcademicTimetableModule = ({ department, academicYear }: AcademicTimetableModuleProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedYear, setSelectedYear] = useState('III Year');
  const [selectedSemester, setSelectedSemester] = useState('Semester 5');
  const [selectedSection, setSelectedSection] = useState('A');
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<TimetableEntry[]>([]);
  const [uploadStats, setUploadStats] = useState<{ total: number; valid: number; invalid: number } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
    return entries.filter(
      (e) => e.year === selectedYear && e.semester === selectedSemester && e.section === selectedSection
    );
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

  // Download CSV Template
  const handleDownloadTemplate = useCallback(() => {
    const header = 'Department,Year,Semester,Section,Period,Day,Time From,Time To,Course Code,Class In-Charge,W.E.F';
    const sampleRows = [
      `${department},${selectedYear},${selectedSemester},${selectedSection},1,Monday,09:00,09:50,CS501,Dr. Anita Sharma,2025-07-01`,
      `${department},${selectedYear},${selectedSemester},${selectedSection},2,Monday,09:50,10:40,CS502,Mr. Anil Reddy,2025-07-01`,
      `${department},${selectedYear},${selectedSemester},${selectedSection},3,Monday,10:50,11:40,CS503,Dr. Priya Sharma,2025-07-01`,
      `${department},${selectedYear},${selectedSemester},${selectedSection},4,Monday,11:40,12:30,CS504,Dr. Rajesh Kumar,2025-07-01`,
      `${department},${selectedYear},${selectedSemester},${selectedSection},5,Monday,13:30,14:20,CS505-LAB,Dr. Anita Sharma,2025-07-01`,
      `${department},${selectedYear},${selectedSemester},${selectedSection},6,Monday,14:20,15:10,CS505-LAB,Dr. Anita Sharma,2025-07-01`,
      `${department},${selectedYear},${selectedSemester},${selectedSection},1,Tuesday,09:00,09:50,CS502,Mr. Anil Reddy,2025-07-01`,
      `${department},${selectedYear},${selectedSemester},${selectedSection},2,Tuesday,09:50,10:40,CS503,Dr. Priya Sharma,2025-07-01`,
      `${department},${selectedYear},${selectedSemester},${selectedSection},3,Tuesday,10:50,11:40,CS501,Dr. Anita Sharma,2025-07-01`,
      `${department},${selectedYear},${selectedSemester},${selectedSection},4,Tuesday,11:40,12:30,CS506,Dr. Sunita Patel,2025-07-01`,
      `${department},${selectedYear},${selectedSemester},${selectedSection},5,Tuesday,13:30,14:20,CS504,Dr. Rajesh Kumar,2025-07-01`,
      `${department},${selectedYear},${selectedSemester},${selectedSection},6,Tuesday,14:20,15:10,CS507,Mr. Anil Reddy,2025-07-01`,
    ];
    const csv = [header, ...sampleRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic_timetable_${selectedYear.replace(' ', '_')}_${selectedSemester.replace(' ', '_')}_Sec${selectedSection}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [department, selectedYear, selectedSemester, selectedSection]);

  // Upload CSV
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((line) => line.trim());
        const headers = parseCSVLine(lines[0]);

        const parsed: TimetableEntry[] = [];
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
            errors.push(`Department "${row['Department']}" does not match "${department}"`);
          }
          if (!row['Period'] || isNaN(parseInt(row['Period']))) {
            errors.push('Period is mandatory and must be a number');
          } else if (parseInt(row['Period']) < 1 || parseInt(row['Period']) > 8) {
            errors.push('Period must be between 1 and 8');
          }
          if (!row['Day'] || !DAYS.includes(row['Day'])) {
            errors.push(`Day "${row['Day']}" is not valid. Must be one of: ${DAYS.join(', ')}`);
          }
          if (!row['Course Code']) {
            errors.push('Course Code is mandatory');
          }
          if (!row['Class In-Charge']) {
            errors.push('Class In-Charge is mandatory');
          }

          const yearVal = row['Year'] || selectedYear;
          const semVal = row['Semester'] || selectedSemester;
          const sectionVal = row['Section'] || selectedSection;

          if (!YEARS_OF_STUDY.includes(yearVal)) {
            errors.push(`Year "${yearVal}" is not valid`);
          }

          const entry: TimetableEntry = {
            id: `upload-${i}`,
            department: row['Department'] || department,
            year: yearVal,
            semester: semVal,
            section: sectionVal,
            period: parseInt(row['Period']) || 1,
            day: row['Day'] || 'Monday',
            timeFrom: row['Time From'] || '',
            timeTo: row['Time To'] || '',
            courseCode: row['Course Code'] || '',
            classInCharge: row['Class In-Charge'] || '',
            wef: row['W.E.F'] || '',
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

  // Import uploaded entries (only valid ones)
  const handleImportUploaded = useCallback(() => {
    const validEntries = uploadPreview.filter((e) => e.validationStatus === 'valid');
    const newEntries = validEntries.map((e, idx) => ({
      ...e,
      id: `entry-${Date.now()}-${idx}`,
      validationStatus: undefined as TimetableEntry['validationStatus'],
      errors: undefined,
    }));
    setEntries((prev) => [...prev, ...newEntries]);
    // Auto-switch to the year/semester/section of the first imported record
    if (newEntries.length > 0) {
      const first = newEntries[0];
      if (first.year && YEARS_OF_STUDY.includes(first.year)) {
        setSelectedYear(first.year);
      }
      if (first.semester) {
        setSelectedSemester(first.semester);
      }
      if (first.section && SECTIONS.includes(first.section)) {
        setSelectedSection(first.section);
      }
    }
    setShowUploadDialog(false);
    setUploadPreview([]);
    setUploadStats(null);
  }, [uploadPreview]);

  // Add entry manually
  const handleAddEntry = useCallback(() => {
    if (!newEntry.courseCode || !newEntry.classInCharge) return;

    const entry: TimetableEntry = {
      id: editingEntry ? editingEntry.id : `entry-${Date.now()}`,
      department,
      year: selectedYear,
      semester: selectedSemester,
      section: selectedSection,
      period: parseInt(newEntry.period),
      day: newEntry.day,
      timeFrom: newEntry.timeFrom,
      timeTo: newEntry.timeTo,
      courseCode: newEntry.courseCode,
      classInCharge: newEntry.classInCharge,
      wef: newEntry.wef,
    };

    if (editingEntry) {
      setEntries((prev) => prev.map((e) => (e.id === editingEntry.id ? entry : e)));
    } else {
      setEntries((prev) => [...prev, entry]);
    }

    setNewEntry({ period: '1', day: 'Monday', timeFrom: '', timeTo: '', courseCode: '', classInCharge: '', wef: '' });
    setShowAddDialog(false);
    setEditingEntry(null);
  }, [newEntry, department, selectedYear, selectedSemester, selectedSection, editingEntry]);

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
  const handleDeleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Save Timetable
  const handleSaveTimetable = useCallback(() => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  }, []);

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
                disabled={totalEntriesForContext === 0}
                className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
              >
                <Save className="h-3.5 w-3.5" />
                Save Timetable
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
      {filteredEntries.length === 0 ? (
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
                      <TableRow key={period} className="hover:bg-muted/10">
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
                                    onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry.id); }}
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
                      <TableRow key={entry.id} className="hover:bg-muted/20">
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
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteEntry(entry.id)}>
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">{editingEntry ? 'Edit Timetable Entry' : 'Add Timetable Entry'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
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
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setShowAddDialog(false); setEditingEntry(null); }}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddEntry}
              disabled={!newEntry.courseCode || !newEntry.classInCharge}
            >
              {editingEntry ? 'Update Entry' : 'Add Entry'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Preview Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-5xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4" />
              CSV Upload Preview — Academic Timetable
            </DialogTitle>
          </DialogHeader>
          {uploadStats && (
            <div className="space-y-4">
              {/* Upload Stats */}
              <div className="flex items-center gap-4">
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
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-700 font-medium">CSV Uploaded Successfully — All records are valid</p>
                </div>
              )}

              {/* Preview Table */}
              <ScrollArea className="max-h-[400px] border rounded-lg">
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
                      <TableHead className="text-xs font-semibold text-center">Valid</TableHead>
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
                        <TableCell className="text-xs text-center">P{entry.period}</TableCell>
                        <TableCell className="text-xs">{entry.day}</TableCell>
                        <TableCell className="text-xs">{entry.timeFrom} - {entry.timeTo}</TableCell>
                        <TableCell className="text-xs font-medium">{entry.courseCode}</TableCell>
                        <TableCell className="text-xs">{entry.classInCharge}</TableCell>
                        <TableCell className="text-xs">{entry.wef}</TableCell>
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
              </ScrollArea>

              {/* Validation Errors Summary */}
              {uploadStats.invalid > 0 && (
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                  <p className="text-xs font-semibold text-red-700 mb-2">Validation Errors</p>
                  <div className="space-y-1">
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
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleImportUploaded}
              disabled={!uploadStats || uploadStats.valid === 0}
            >
              Import {uploadStats?.valid || 0} Valid Records
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
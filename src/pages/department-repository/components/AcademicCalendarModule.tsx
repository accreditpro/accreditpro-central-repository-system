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
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';
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

export const AcademicCalendarModule = ({ department, academicYear }: AcademicCalendarModuleProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedYear, setSelectedYear] = useState('III Year');
  const [selectedSemester, setSelectedSemester] = useState('Semester I');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [uploadPreview, setUploadPreview] = useState<CalendarEvent[]>([]);
  const [uploadStats, setUploadStats] = useState<{ total: number; valid: number; invalid: number } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New event form state
  const [newEvent, setNewEvent] = useState({
    description: '',
    startDate: '',
    endDate: '',
  });

  // Filtered events
  const filteredEvents = useMemo(() => {
    let filtered = events.filter(
      (e) => e.year === selectedYear && e.semester === selectedSemester
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

  // Download CSV Template
  const handleDownloadTemplate = useCallback(() => {
    const header = 'Department,Year,Semester,Description,Start Date,End Date,Duration';
    const sampleRows = [
      `${department},${selectedYear},${selectedSemester},Commencement of Class Work,2025-07-01,2025-07-01,1`,
      `${department},${selectedYear},${selectedSemester},Orientation Program,2025-07-02,2025-07-03,2`,
      `${department},${selectedYear},${selectedSemester},First Internal Examination,2025-09-05,2025-09-07,3`,
      `${department},${selectedYear},${selectedSemester},Industrial Visit,2025-09-20,2025-09-20,1`,
      `${department},${selectedYear},${selectedSemester},Second Internal Examination,2025-11-10,2025-11-12,3`,
      `${department},${selectedYear},${selectedSemester},Practical Examinations,2025-12-05,2025-12-10,6`,
      `${department},${selectedYear},${selectedSemester},Theory Examinations,2025-12-15,2025-12-24,10`,
    ];
    const csv = [header, ...sampleRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic_calendar_${selectedYear.replace(' ', '_')}_${selectedSemester.replace(' ', '_')}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [department, selectedYear, selectedSemester]);

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

  // Import uploaded events (only valid ones)
  const handleImportUploaded = useCallback(() => {
    const validEvents = uploadPreview.filter((e) => e.status === 'valid');
    const newEvents = validEvents.map((e, idx) => ({
      ...e,
      id: `event-${Date.now()}-${idx}`,
      status: undefined as CalendarEvent['status'],
      errors: undefined,
    }));
    setEvents((prev) => [...prev, ...newEvents]);
    // Auto-switch to the year/semester of the first imported record so user can see results
    if (newEvents.length > 0) {
      const firstEvent = newEvents[0];
      if (firstEvent.year && YEARS_OF_STUDY.includes(firstEvent.year)) {
        setSelectedYear(firstEvent.year);
      }
      if (firstEvent.semester && SEMESTERS.includes(firstEvent.semester)) {
        setSelectedSemester(firstEvent.semester);
      }
    }
    setShowUploadDialog(false);
    setUploadPreview([]);
    setUploadStats(null);
  }, [uploadPreview]);

  // Add event manually
  const handleAddEvent = useCallback(() => {
    if (!newEvent.description || !newEvent.startDate || !newEvent.endDate) return;

    const duration = calculateDuration(newEvent.startDate, newEvent.endDate);
    const event: CalendarEvent = {
      id: `event-${Date.now()}`,
      department,
      year: selectedYear,
      semester: selectedSemester,
      description: newEvent.description,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate,
      duration,
    };

    if (editingEvent) {
      setEvents((prev) => prev.map((e) => (e.id === editingEvent.id ? { ...event, id: editingEvent.id } : e)));
    } else {
      setEvents((prev) => [...prev, event]);
    }

    setNewEvent({ description: '', startDate: '', endDate: '' });
    setShowAddDialog(false);
    setEditingEvent(null);
  }, [newEvent, department, selectedYear, selectedSemester, editingEvent]);

  // Edit event
  const handleEditEvent = useCallback((event: CalendarEvent) => {
    setEditingEvent(event);
    setNewEvent({
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
    });
    setShowAddDialog(true);
  }, []);

  // Delete event
  const handleDeleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Save Calendar
  const handleSaveCalendar = useCallback(() => {
    const yearSemEvents = events.filter(
      (e) => e.year === selectedYear && e.semester === selectedSemester
    );
    // Simulate save
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
    console.log('Saving calendar events:', yearSemEvents);
  }, [events, selectedYear, selectedSemester]);

  const totalEventsForYearSem = events.filter(
    (e) => e.year === selectedYear && e.semester === selectedSemester
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
            <div className="ml-auto">
              <Button
                size="sm"
                onClick={handleSaveCalendar}
                disabled={totalEventsForYearSem === 0}
                className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Save className="h-3.5 w-3.5" />
                Save Calendar
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
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No calendar events yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a CSV or add events manually to get started
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs font-semibold w-8">#</TableHead>
                    <TableHead className="text-xs font-semibold">Description</TableHead>
                    <TableHead className="text-xs font-semibold">Start Date</TableHead>
                    <TableHead className="text-xs font-semibold">End Date</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Duration</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event, idx) => {
                    const status = getEventStatus(event.startDate, event.endDate);
                    return (
                      <TableRow key={event.id} className="hover:bg-muted/20">
                        <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="text-sm font-medium">{event.description}</TableCell>
                        <TableCell className="text-xs">{formatDate(event.startDate)}</TableCell>
                        <TableCell className="text-xs">{formatDate(event.endDate)}</TableCell>
                        <TableCell className="text-xs text-center">
                          <Badge variant="outline" className="text-[10px]">
                            {event.duration} {event.duration === 1 ? 'day' : 'days'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
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
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditEvent(event)}>
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteEvent(event.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
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
              disabled={!newEvent.description || !newEvent.startDate || !newEvent.endDate}
            >
              {editingEvent ? 'Update Event' : 'Add Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Preview Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4" />
              CSV Upload Preview
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
                      <TableHead className="text-xs font-semibold">Department</TableHead>
                      <TableHead className="text-xs font-semibold">Year</TableHead>
                      <TableHead className="text-xs font-semibold">Semester</TableHead>
                      <TableHead className="text-xs font-semibold">Description</TableHead>
                      <TableHead className="text-xs font-semibold">Start Date</TableHead>
                      <TableHead className="text-xs font-semibold">End Date</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Duration</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadPreview.map((event, idx) => (
                      <TableRow
                        key={event.id}
                        className={cn(
                          event.status === 'invalid' && 'bg-red-500/5 border-l-2 border-l-red-500'
                        )}
                      >
                        <TableCell className="text-xs">{idx + 1}</TableCell>
                        <TableCell className="text-xs">{event.department}</TableCell>
                        <TableCell className="text-xs">{event.year}</TableCell>
                        <TableCell className="text-xs">{event.semester}</TableCell>
                        <TableCell className="text-xs font-medium">{event.description}</TableCell>
                        <TableCell className="text-xs">{event.startDate}</TableCell>
                        <TableCell className="text-xs">{event.endDate}</TableCell>
                        <TableCell className="text-xs text-center">{event.duration}</TableCell>
                        <TableCell className="text-center">
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
              </ScrollArea>

              {/* Validation Errors Summary */}
              {uploadStats.invalid > 0 && (
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                  <p className="text-xs font-semibold text-red-700 mb-2">Validation Errors</p>
                  <div className="space-y-1">
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
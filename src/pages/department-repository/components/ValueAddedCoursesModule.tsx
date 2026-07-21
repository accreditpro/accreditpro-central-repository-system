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
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { cn } from '@/lib/utils';
import {
  BookOpen,
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
  Eye,
  DownloadCloud,
  Building2,
  CalendarDays,
  GraduationCap,
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

interface ValueAddedCourseRecord {
  id: string;
  department: string;
  year: string;
  semester: string;
  courseName: string;
  fromDate: string;
  toDate: string;
  timeFrom: string;
  timeTo: string;
  courseInstructor: string;
  duration: string;
  studentsEnrolled: string;
  studentsParticipated: string;
  certificationProvided: 'Yes' | 'No';
  certificatesIssued: string;
  validationStatus?: 'valid' | 'invalid';
  errors?: string[];
}

interface CourseEvidenceItem {
  status: 'not-uploaded' | 'uploaded';
  fileName?: string;
  uploadedAt?: string;
}

interface CourseEvidenceMap {
  geoTaggedPhotos: CourseEvidenceItem;
  registeredStudentsList: CourseEvidenceItem;
  attendedStudentsList: CourseEvidenceItem;
}

interface ValueAddedCoursesModuleProps {
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

// Evidence types for per-course documents
type EvidenceDocType = 'geoTaggedPhotos' | 'registeredStudentsList' | 'attendedStudentsList';

export const ValueAddedCoursesModule = ({ department, academicYear }: ValueAddedCoursesModuleProps) => {
  const [selectedYear, setSelectedYear] = useState('III Year');
  const [selectedSemester, setSelectedSemester] = useState('Semester 5');
  const [courses, setCourses] = useState<ValueAddedCourseRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCertification, setFilterCertification] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<ValueAddedCourseRecord | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<ValueAddedCourseRecord[]>([]);
  const [uploadStats, setUploadStats] = useState<{ total: number; valid: number; invalid: number } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Per-course evidence state
  const [courseEvidenceMap, setCourseEvidenceMap] = useState<Record<string, CourseEvidenceMap>>({});
  const [previewDialog, setPreviewDialog] = useState<{ open: boolean; courseId: string; docType: EvidenceDocType; fileName: string } | null>(null);
  const [uploadEvidenceDialog, setUploadEvidenceDialog] = useState<{ open: boolean; courseId: string; docType: EvidenceDocType } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const dropZoneInputRef = useRef<HTMLInputElement>(null);

  // New course form state
  const [newCourse, setNewCourse] = useState({
    courseName: '',
    fromDate: '',
    toDate: '',
    timeFrom: '',
    timeTo: '',
    courseInstructor: '',
    duration: '',
    studentsEnrolled: '',
    studentsParticipated: '',
    certificationProvided: 'Yes' as 'Yes' | 'No',
    certificatesIssued: '',
  });

  // Update semester when year changes
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    const semesters = SEMESTERS_MAP[year];
    if (semesters && semesters.length > 0) {
      setSelectedSemester(semesters[0]);
    }
  };

  // Filtered courses for selected year/semester
  const filteredCourses = useMemo(() => {
    let filtered = courses.filter(
      (c) => c.year === selectedYear && c.semester === selectedSemester
    );

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.courseName.toLowerCase().includes(q) ||
          c.courseInstructor.toLowerCase().includes(q)
      );
    }

    if (filterCertification && filterCertification !== 'all') {
      filtered = filtered.filter((c) => c.certificationProvided === filterCertification);
    }

    return filtered;
  }, [courses, selectedYear, selectedSemester, searchQuery, filterCertification]);

  // Allowed file types per evidence document type
  const getAllowedTypes = useCallback((docType: EvidenceDocType) => {
    if (docType === 'geoTaggedPhotos') {
      return {
        extensions: ['.pdf', '.png', '.jpg', '.jpeg', '.heic', '.webp'],
        mimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/heic', 'image/webp'],
        label: 'PDF, PNG, JPG, JPEG, HEIC, WebP',
      };
    }
    return {
      extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv'],
      mimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
      ],
      label: 'PDF, Word (.doc, .docx), Excel (.xls, .xlsx), CSV',
    };
  }, []);

  const validateFile = useCallback((file: File, docType: EvidenceDocType): string | null => {
    const allowed = getAllowedTypes(docType);
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowed.extensions.includes(ext)) {
      return `Invalid file type "${ext}". Allowed: ${allowed.label}`;
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'File size exceeds 10 MB limit.';
    }
    return null;
  }, [getAllowedTypes]);

  // Evidence handlers for per-course documents
  const handleUploadEvidence = useCallback((courseId: string, docType: EvidenceDocType) => {
    setUploadEvidenceDialog({ open: true, courseId, docType });
    setUploadError(null);
    setSelectedFile(null);
    setDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    setUploadError(null);

    const file = e.dataTransfer.files?.[0];
    if (!file || !uploadEvidenceDialog) return;

    const error = validateFile(file, uploadEvidenceDialog.docType);
    if (error) {
      setUploadError(error);
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  }, [uploadEvidenceDialog, validateFile]);

  const handleDropZoneFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadEvidenceDialog) return;
    setUploadError(null);

    const error = validateFile(file, uploadEvidenceDialog.docType);
    if (error) {
      setUploadError(error);
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  }, [uploadEvidenceDialog, validateFile]);

  const handleConfirmUpload = useCallback(() => {
    if (!selectedFile || !uploadEvidenceDialog) return;

    const { courseId, docType } = uploadEvidenceDialog;
    const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    setCourseEvidenceMap((prev) => ({
      ...prev,
      [courseId]: {
        ...(prev[courseId] || {
          geoTaggedPhotos: { status: 'not-uploaded' },
          registeredStudentsList: { status: 'not-uploaded' },
          attendedStudentsList: { status: 'not-uploaded' },
        }),
        [docType]: {
          status: 'uploaded' as const,
          fileName: selectedFile.name,
          uploadedAt: now,
        },
      },
    }));

    setUploadEvidenceDialog(null);
    setSelectedFile(null);
    setUploadError(null);
  }, [selectedFile, uploadEvidenceDialog]);

  const handlePreviewEvidence = useCallback((courseId: string, docType: EvidenceDocType) => {
    const ev = courseEvidenceMap[courseId]?.[docType];
    if (ev?.status === 'uploaded' && ev.fileName) {
      setPreviewDialog({ open: true, courseId, docType, fileName: ev.fileName });
    }
  }, [courseEvidenceMap]);

  const handleDownloadEvidence = useCallback((courseId: string, docType: EvidenceDocType) => {
    const ev = courseEvidenceMap[courseId]?.[docType];
    if (ev?.status === 'uploaded' && ev.fileName) {
      const link = document.createElement('a');
      link.href = '#';
      link.download = ev.fileName;
      link.click();
    }
  }, [courseEvidenceMap]);

  // CSV Upload handler
  const handleCSVUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim());
      if (lines.length < 2) return;

      const records: ValueAddedCourseRecord[] = [];
      let valid = 0;
      let invalid = 0;

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        const errors: string[] = [];

        if (!cols[0]?.trim()) errors.push('Course Name is required');
        if (!cols[1]?.trim()) errors.push('From Date is required');
        if (!cols[5]?.trim()) errors.push('Course Instructor is required');

        const record: ValueAddedCourseRecord = {
          id: `csv-${Date.now()}-${i}`,
          department,
          year: selectedYear,
          semester: selectedSemester,
          courseName: cols[0]?.trim() || '',
          fromDate: cols[1]?.trim() || '',
          toDate: cols[2]?.trim() || '',
          timeFrom: cols[3]?.trim() || '',
          timeTo: cols[4]?.trim() || '',
          courseInstructor: cols[5]?.trim() || '',
          duration: cols[6]?.trim() || '',
          studentsEnrolled: cols[7]?.trim() || '0',
          studentsParticipated: cols[8]?.trim() || '0',
          certificationProvided: (cols[9]?.trim()?.toLowerCase() === 'yes' ? 'Yes' : 'No') as 'Yes' | 'No',
          certificatesIssued: cols[10]?.trim() || '0',
          validationStatus: errors.length > 0 ? 'invalid' : 'valid',
          errors: errors.length > 0 ? errors : undefined,
        };

        if (errors.length > 0) invalid++;
        else valid++;
        records.push(record);
      }

      setUploadPreview(records);
      setUploadStats({ total: records.length, valid, invalid });
      setShowUploadDialog(true);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [department, selectedYear, selectedSemester]);

  const handleImportUploaded = useCallback(() => {
    const validRecords = uploadPreview.filter((r) => r.validationStatus === 'valid');
    setCourses((prev) => [...prev, ...validRecords]);
    setShowUploadDialog(false);
    setUploadPreview([]);
    setUploadStats(null);
  }, [uploadPreview]);

  // Add/Edit course handlers
  const handleAddCourse = useCallback(() => {
    if (!newCourse.courseName || !newCourse.courseInstructor) return;

    const record: ValueAddedCourseRecord = {
      id: editingCourse?.id || `vac-${Date.now()}`,
      department,
      year: selectedYear,
      semester: selectedSemester,
      ...newCourse,
    };

    if (editingCourse) {
      setCourses((prev) => prev.map((c) => (c.id === editingCourse.id ? record : c)));
      setEditingCourse(null);
    } else {
      setCourses((prev) => [...prev, record]);
    }

    setNewCourse({
      courseName: '',
      fromDate: '',
      toDate: '',
      timeFrom: '',
      timeTo: '',
      courseInstructor: '',
      duration: '',
      studentsEnrolled: '',
      studentsParticipated: '',
      certificationProvided: 'Yes',
      certificatesIssued: '',
    });
    setShowAddDialog(false);
  }, [newCourse, editingCourse, department, selectedYear, selectedSemester]);

  const handleEditCourse = useCallback((course: ValueAddedCourseRecord) => {
    setEditingCourse(course);
    setNewCourse({
      courseName: course.courseName,
      fromDate: course.fromDate,
      toDate: course.toDate,
      timeFrom: course.timeFrom,
      timeTo: course.timeTo,
      courseInstructor: course.courseInstructor,
      duration: course.duration,
      studentsEnrolled: course.studentsEnrolled,
      studentsParticipated: course.studentsParticipated,
      certificationProvided: course.certificationProvided,
      certificatesIssued: course.certificatesIssued,
    });
    setShowAddDialog(true);
  }, []);

  const handleDeleteCourse = useCallback((id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleSave = useCallback(() => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  }, []);

  const handleDownloadTemplate = useCallback(() => {
    const headers = 'Course Name,From Date,To Date,Time From,Time To,Course Instructor,Duration,Students Enrolled,Students Participated,Certification Provided,Certificates Issued';
    const sample = 'Python for Data Science,01-Jan-2025,15-Jan-2025,10:00,12:00,Dr. Smith,30 hrs,45,42,Yes,42';
    const csv = `${headers}\n${sample}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'value_added_courses_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  // Evidence rendering helper
  const renderEvidenceSection = useCallback((courseId: string) => {
    const evidence = courseEvidenceMap[courseId] || {
      geoTaggedPhotos: { status: 'not-uploaded' },
      registeredStudentsList: { status: 'not-uploaded' },
      attendedStudentsList: { status: 'not-uploaded' },
    };

    const docTypes: { key: EvidenceDocType; label: string }[] = [
      { key: 'geoTaggedPhotos', label: 'Geo-tagged Photos' },
      { key: 'registeredStudentsList', label: 'Registered Students List' },
      { key: 'attendedStudentsList', label: 'Attended Students List' },
    ];

    return (
      <div className="mt-3 pt-3 border-t border-border/40">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Evidence Documents</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {docTypes.map(({ key, label }) => {
            const doc = evidence[key];
            const isUploaded = doc.status === 'uploaded';
            return (
              <div key={key} className={cn(
                'rounded-lg border p-2.5 transition-all',
                isUploaded ? 'bg-emerald-50/50 border-emerald-200/60' : 'bg-muted/20 border-border/40'
              )}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-medium truncate">{label}</span>
                  {isUploaded ? (
                    <Badge variant="outline" className="text-[8px] h-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      Uploaded
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[8px] h-4 bg-amber-500/10 text-amber-600 border-amber-500/20">
                      Pending
                    </Badge>
                  )}
                </div>
                {isUploaded && doc.fileName && (
                  <p className="text-[9px] text-muted-foreground truncate mb-1.5">{doc.fileName}</p>
                )}
                <div className="flex gap-1">
                  {!isUploaded ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-[9px] gap-1 flex-1"
                      onClick={() => handleUploadEvidence(courseId, key)}
                    >
                      <Upload className="h-2.5 w-2.5" /> Upload
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[9px] gap-1 flex-1"
                        onClick={() => handlePreviewEvidence(courseId, key)}
                      >
                        <Eye className="h-2.5 w-2.5" /> Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[9px] gap-1 flex-1"
                        onClick={() => handleDownloadEvidence(courseId, key)}
                      >
                        <DownloadCloud className="h-2.5 w-2.5" /> Download
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [courseEvidenceMap, handleUploadEvidence, handlePreviewEvidence, handleDownloadEvidence]);

  const totalCoursesForYearSem = courses.filter(
    (c) => c.year === selectedYear && c.semester === selectedSemester
  ).length;

  const availableSemesters = SEMESTERS_MAP[selectedYear] || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Value Added Courses</h2>
              <p className="text-xs text-muted-foreground">
                Manage value added courses for each year and semester — upload via CSV or add manually
              </p>
            </div>
          </div>
        </div>

        {/* Context Selector Cards - Student Repository Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="h-3.5 w-3.5" />
                Upload CSV
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setEditingCourse(null); setNewCourse({ courseName: '', fromDate: '', toDate: '', timeFrom: '', timeTo: '', courseInstructor: '', duration: '', studentsEnrolled: '', studentsParticipated: '', certificationProvided: 'Yes', certificatesIssued: '' }); setShowAddDialog(true); }} className="gap-2">
              <Plus className="h-3.5 w-3.5" />
              Add Course
            </Button>
            <div className="ml-auto">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={totalCoursesForYearSem === 0}
                className="gap-2 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800"
              >
                <Save className="h-3.5 w-3.5" />
                Save Courses
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
                  <p className="text-sm font-semibold text-green-700">Courses Saved Successfully</p>
                  <p className="text-xs text-green-600 mt-0.5">
                    Total Courses: {totalCoursesForYearSem} &bull; {selectedYear} / {selectedSemester}
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
            placeholder="Search by course name or instructor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={filterCertification} onValueChange={setFilterCertification}>
          <SelectTrigger className="w-[160px] h-9 text-sm">
            <Filter className="h-3.5 w-3.5 mr-2" />
            <SelectValue placeholder="Certification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="Yes">Certified</SelectItem>
            <SelectItem value="No">Non-Certified</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs">
          {filteredCourses.length} Courses
        </Badge>
      </div>

      {/* Courses Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-violet-600" />
            Value Added Courses — {selectedYear} / {selectedSemester}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No courses added yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a CSV or add courses manually for {selectedYear} / {selectedSemester}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table className="min-w-[1100px]">
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs font-semibold w-8 sticky left-0 bg-muted/30 z-10">#</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap">Course Name</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap">Instructor</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap">From Date</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap">To Date</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap">Duration</TableHead>
                    <TableHead className="text-xs font-semibold text-center whitespace-nowrap">Enrolled</TableHead>
                    <TableHead className="text-xs font-semibold text-center whitespace-nowrap">Participated</TableHead>
                    <TableHead className="text-xs font-semibold text-center whitespace-nowrap">Cert.</TableHead>
                    <TableHead className="text-xs font-semibold text-center whitespace-nowrap">Issued</TableHead>
                    <TableHead className="text-xs font-semibold text-right whitespace-nowrap sticky right-0 bg-muted/30 z-10">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course, idx) => (
                    <TableRow key={course.id} className="hover:bg-muted/20">
                      <TableCell className="text-xs text-muted-foreground sticky left-0 bg-background z-10">{idx + 1}</TableCell>
                      <TableCell className="text-xs font-medium whitespace-nowrap">{course.courseName}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{course.courseInstructor}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{course.fromDate}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{course.toDate}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{course.duration || '-'}</TableCell>
                      <TableCell className="text-xs text-center whitespace-nowrap">{course.studentsEnrolled}</TableCell>
                      <TableCell className="text-xs text-center whitespace-nowrap">{course.studentsParticipated}</TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        <Badge variant={course.certificationProvided === 'Yes' ? 'default' : 'secondary'} className="text-[9px] h-4">
                          {course.certificationProvided}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-center whitespace-nowrap font-semibold">{course.certificatesIssued || '-'}</TableCell>
                      <TableCell className="text-right sticky right-0 bg-background z-10">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditCourse(course)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteCourse(course.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-Course Evidence Section */}
      {filteredCourses.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-violet-600" />
              Evidence Documents — Per Course
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredCourses.map((course) => (
              <div key={course.id} className="rounded-lg border border-border/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-3.5 w-3.5 text-violet-600" />
                  <span className="text-xs font-semibold">{course.courseName}</span>
                  <span className="text-[10px] text-muted-foreground">— {course.courseInstructor}</span>
                </div>
                {renderEvidenceSection(course.id)}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Course Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); setEditingCourse(null); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              {editingCourse ? 'Edit Value Added Course' : 'Add New Value Added Course'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-3">
            <div className="col-span-2">
              <Label className="text-xs">Course Name *</Label>
              <Input
                value={newCourse.courseName}
                onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
                placeholder="e.g., Python for Data Science"
                className="mt-1 h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">From Date</Label>
              <div className="mt-1">
                <DatePicker
                  value={newCourse.fromDate}
                  onChange={(val) => setNewCourse({ ...newCourse, fromDate: val })}
                  placeholder="Select start date"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">To Date</Label>
              <div className="mt-1">
                <DatePicker
                  value={newCourse.toDate}
                  onChange={(val) => setNewCourse({ ...newCourse, toDate: val })}
                  placeholder="Select end date"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Time From</Label>
              <div className="mt-1">
                <TimePicker
                  value={newCourse.timeFrom}
                  onChange={(val) => setNewCourse({ ...newCourse, timeFrom: val })}
                  placeholder="Start time"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Time To</Label>
              <div className="mt-1">
                <TimePicker
                  value={newCourse.timeTo}
                  onChange={(val) => setNewCourse({ ...newCourse, timeTo: val })}
                  placeholder="End time"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Course Instructor *</Label>
              <Input
                value={newCourse.courseInstructor}
                onChange={(e) => setNewCourse({ ...newCourse, courseInstructor: e.target.value })}
                placeholder="e.g., Dr. Smith"
                className="mt-1 h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Duration</Label>
              <Input
                value={newCourse.duration}
                onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                placeholder="e.g., 30 hrs"
                className="mt-1 h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Students Enrolled</Label>
              <Input
                type="number"
                value={newCourse.studentsEnrolled}
                onChange={(e) => setNewCourse({ ...newCourse, studentsEnrolled: e.target.value })}
                placeholder="0"
                className="mt-1 h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Students Participated</Label>
              <Input
                type="number"
                value={newCourse.studentsParticipated}
                onChange={(e) => setNewCourse({ ...newCourse, studentsParticipated: e.target.value })}
                placeholder="0"
                className="mt-1 h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Certification Provided</Label>
              <Select
                value={newCourse.certificationProvided}
                onValueChange={(val) => setNewCourse({ ...newCourse, certificationProvided: val as 'Yes' | 'No' })}
              >
                <SelectTrigger className="mt-1 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes" className="text-xs">Yes</SelectItem>
                  <SelectItem value="No" className="text-xs">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Certificates Issued</Label>
              <Input
                type="number"
                value={newCourse.certificatesIssued}
                onChange={(e) => setNewCourse({ ...newCourse, certificatesIssued: e.target.value })}
                placeholder="0"
                className="mt-1 h-8 text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setShowAddDialog(false); setEditingCourse(null); }}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddCourse} disabled={!newCourse.courseName || !newCourse.courseInstructor}>
              {editingCourse ? 'Update Course' : 'Add Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Upload Preview Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">CSV Upload Preview</DialogTitle>
          </DialogHeader>
          {uploadStats && (
            <div className="flex items-center gap-4 mb-3">
              <Badge variant="outline" className="text-xs">Total: {uploadStats.total}</Badge>
              <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Valid: {uploadStats.valid}
              </Badge>
              {uploadStats.invalid > 0 && (
                <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/20">
                  Invalid: {uploadStats.invalid}
                </Badge>
              )}
            </div>
          )}
          <ScrollArea className="max-h-[50vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">Status</TableHead>
                  <TableHead className="text-[10px]">Course Name</TableHead>
                  <TableHead className="text-[10px]">Instructor</TableHead>
                  <TableHead className="text-[10px]">From</TableHead>
                  <TableHead className="text-[10px]">To</TableHead>
                  <TableHead className="text-[10px]">Enrolled</TableHead>
                  <TableHead className="text-[10px]">Cert.</TableHead>
                  <TableHead className="text-[10px]">Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadPreview.map((row) => (
                  <TableRow key={row.id} className={row.validationStatus === 'invalid' ? 'bg-red-50/50' : ''}>
                    <TableCell>
                      {row.validationStatus === 'valid' ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell className="text-[11px]">{row.courseName}</TableCell>
                    <TableCell className="text-[11px]">{row.courseInstructor}</TableCell>
                    <TableCell className="text-[11px]">{row.fromDate}</TableCell>
                    <TableCell className="text-[11px]">{row.toDate}</TableCell>
                    <TableCell className="text-[11px]">{row.studentsEnrolled}</TableCell>
                    <TableCell className="text-[11px]">{row.certificationProvided}</TableCell>
                    <TableCell className="text-[11px] text-red-600">{row.errors?.join(', ')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
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

      {/* Evidence Upload Dialog with Drag & Drop */}
      {uploadEvidenceDialog && (
        <Dialog open={uploadEvidenceDialog.open} onOpenChange={(open) => { if (!open) { setUploadEvidenceDialog(null); setSelectedFile(null); setUploadError(null); } }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">
                Upload Evidence Document
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {uploadEvidenceDialog.docType === 'geoTaggedPhotos' && 'Geo-tagged Photos of Session'}
                {uploadEvidenceDialog.docType === 'registeredStudentsList' && 'Registered Students List'}
                {uploadEvidenceDialog.docType === 'attendedStudentsList' && 'Attended Students List'}
              </p>
            </DialogHeader>
            <div className="space-y-4">
              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => dropZoneInputRef.current?.click()}
                className={cn(
                  'relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200',
                  dragOver
                    ? 'border-violet-500 bg-violet-50/50 scale-[1.01]'
                    : 'border-border/60 hover:border-violet-400 hover:bg-muted/30',
                  selectedFile && !uploadError && 'border-violet-500/50 bg-violet-50/30'
                )}
              >
                {selectedFile && !uploadError ? (
                  <>
                    <div className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-violet-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-violet-700">{selectedFile.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Ready to upload
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[10px] text-muted-foreground h-6"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    >
                      Change file
                    </Button>
                  </>
                ) : (
                  <>
                    <div className={cn(
                      'h-12 w-12 rounded-full flex items-center justify-center transition-colors',
                      dragOver ? 'bg-violet-100' : 'bg-muted/50'
                    )}>
                      <Upload className={cn('h-6 w-6', dragOver ? 'text-violet-600' : 'text-muted-foreground')} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        {dragOver ? 'Drop file here' : 'Drag & drop your file here'}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        or click to browse files
                      </p>
                    </div>
                  </>
                )}
                <input
                  ref={dropZoneInputRef}
                  type="file"
                  accept={getAllowedTypes(uploadEvidenceDialog.docType).extensions.join(',')}
                  onChange={handleDropZoneFileChange}
                  className="hidden"
                />
              </div>

              {/* Allowed File Types Info */}
              <div className="rounded-lg bg-muted/30 border border-border/40 p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Accepted File Types
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {getAllowedTypes(uploadEvidenceDialog.docType).extensions.map((ext) => (
                    <Badge key={ext} variant="outline" className="text-[9px] font-mono bg-background">
                      {ext}
                    </Badge>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Maximum file size: 10 MB</p>
              </div>

              {/* Error Message */}
              {uploadError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-red-700">Invalid File</p>
                    <p className="text-[10px] text-red-600 mt-0.5">{uploadError}</p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={() => { setUploadEvidenceDialog(null); setSelectedFile(null); setUploadError(null); }}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!selectedFile || !!uploadError}
                onClick={handleConfirmUpload}
                className="gap-1.5 bg-violet-600 hover:bg-violet-700"
              >
                <Upload className="h-3.5 w-3.5" /> Upload File
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Evidence Preview Dialog */}
      {previewDialog && (
        <Dialog open={previewDialog.open} onOpenChange={(open) => { if (!open) setPreviewDialog(null); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">Document Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg border p-6 bg-muted/20 flex flex-col items-center justify-center gap-3">
                <FileText className="h-12 w-12 text-violet-600/60" />
                <p className="text-sm font-medium">{previewDialog.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {previewDialog.docType === 'geoTaggedPhotos' && 'Geo-tagged Photos of Session'}
                  {previewDialog.docType === 'registeredStudentsList' && 'Registered Students List'}
                  {previewDialog.docType === 'attendedStudentsList' && 'Attended Students List'}
                </p>
                <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-600 border-violet-500/20">
                  Uploaded Successfully
                </Badge>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewDialog(null)}>
                  Close
                </Button>
                <Button size="sm" className="gap-1.5 bg-violet-600 hover:bg-violet-700" onClick={() => {
                  handleDownloadEvidence(previewDialog.courseId, previewDialog.docType);
                  setPreviewDialog(null);
                }}>
                  <DownloadCloud className="h-3.5 w-3.5" /> Download
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
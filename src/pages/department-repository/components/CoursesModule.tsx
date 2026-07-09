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
  RefreshCw,
} from 'lucide-react';

interface CourseRecord {
  id: string;
  department: string;
  year: string;
  semester: string;
  courseCode: string;
  courseName: string;
  courseType: string;
  lectureHours: string;
  theoryHours: string;
  labHours: string;
  credits: string;
  status: string;
  validationStatus?: 'valid' | 'invalid';
  errors?: string[];
}

interface EvidenceRecord {
  id: string;
  documentName: string;
  year: string;
  semester: string;
  uploadedBy: string;
  date: string;
  status: 'pending' | 'verified' | 'approved';
}

interface CoursesModuleProps {
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
const COURSE_TYPES = ['Theory', 'Lab'];
const COURSE_STATUSES = ['Active', 'Inactive', 'Proposed'];

// Mock evidence data
const generateMockEvidence = (): EvidenceRecord[] => [
  { id: '1', documentName: 'Machine Learning', year: 'III Year', semester: 'Semester 5', uploadedBy: 'Dr. Anita Sharma', date: '2025-01-10', status: 'approved' },
  { id: '2', documentName: 'Machine Learning Lab', year: 'III Year', semester: 'Semester 5', uploadedBy: 'Dr. Anita Sharma', date: '2025-01-10', status: 'approved' },
  { id: '3', documentName: 'Deep Learning', year: 'III Year', semester: 'Semester 5', uploadedBy: 'Dr. Rajesh Kumar', date: '2025-01-11', status: 'verified' },
  { id: '4', documentName: 'Computer Vision', year: 'III Year', semester: 'Semester 6', uploadedBy: 'Dr. Priya Sharma', date: '2025-01-12', status: 'pending' },
  { id: '5', documentName: 'Natural Language Processing', year: 'IV Year', semester: 'Semester 7', uploadedBy: 'Dr. Anita Sharma', date: '2025-01-08', status: 'approved' },
  { id: '6', documentName: 'Cloud Computing', year: 'IV Year', semester: 'Semester 7', uploadedBy: 'Mr. Anil Reddy', date: '2025-01-09', status: 'verified' },
  { id: '7', documentName: 'Data Structures', year: 'II Year', semester: 'Semester 3', uploadedBy: 'Dr. Sunita Patel', date: '2025-01-05', status: 'approved' },
  { id: '8', documentName: 'Data Structures Lab', year: 'II Year', semester: 'Semester 3', uploadedBy: 'Dr. Sunita Patel', date: '2025-01-05', status: 'pending' },
];

export const CoursesModule = ({ department, academicYear }: CoursesModuleProps) => {
  const [selectedYear, setSelectedYear] = useState('III Year');
  const [selectedSemester, setSelectedSemester] = useState('Semester 5');
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [evidence] = useState<EvidenceRecord[]>(() => generateMockEvidence());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseRecord | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<CourseRecord[]>([]);
  const [uploadStats, setUploadStats] = useState<{ total: number; valid: number; invalid: number } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Evidence filter state
  const [evidenceSearch, setEvidenceSearch] = useState('');
  const [evidenceFilterStatus, setEvidenceFilterStatus] = useState<string>('all');

  // New course form state
  const [newCourse, setNewCourse] = useState({
    courseCode: '',
    courseName: '',
    courseType: '',
    lectureHours: '',
    theoryHours: '',
    labHours: '',
    credits: '',
    status: 'Active',
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
          c.courseCode.toLowerCase().includes(q) ||
          c.courseName.toLowerCase().includes(q)
      );
    }

    if (filterType && filterType !== 'all') {
      filtered = filtered.filter((c) => c.courseType === filterType);
    }

    if (filterStatus && filterStatus !== 'all') {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    return filtered;
  }, [courses, selectedYear, selectedSemester, searchQuery, filterType, filterStatus]);

  // Filtered evidence for selected year/semester
  const filteredEvidence = useMemo(() => {
    let filtered = evidence.filter(
      (e) => e.year === selectedYear && e.semester === selectedSemester
    );

    if (evidenceSearch) {
      filtered = filtered.filter((e) =>
        e.documentName.toLowerCase().includes(evidenceSearch.toLowerCase())
      );
    }

    if (evidenceFilterStatus && evidenceFilterStatus !== 'all') {
      filtered = filtered.filter((e) => e.status === evidenceFilterStatus);
    }

    return filtered;
  }, [evidence, selectedYear, selectedSemester, evidenceSearch, evidenceFilterStatus]);

  // Download CSV Template
  const handleDownloadTemplate = useCallback(() => {
    const header = 'Department,Year,Semester,Course Code,Course Name,Course Type,Lecture Hours,Theory Hours,Lab Hours,Credits,Status';
    const sampleRows = [
      `${department},${selectedYear},${selectedSemester},CS501,Machine Learning,Theory,3,3,0,3,Active`,
      `${department},${selectedYear},${selectedSemester},CS501L,Machine Learning Lab,Lab,0,0,3,1.5,Active`,
      `${department},${selectedYear},${selectedSemester},CS502,Deep Learning,Theory,3,3,0,3,Active`,
      `${department},${selectedYear},${selectedSemester},CS503,Computer Vision,Theory,3,3,0,3,Active`,
      `${department},${selectedYear},${selectedSemester},CS503L,Computer Vision Lab,Lab,0,0,3,1.5,Active`,
    ];
    const csv = [header, ...sampleRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `courses_template_${selectedYear.replace(' ', '_')}_${selectedSemester.replace(' ', '_')}.csv`;
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
        const lines = text.split('\n').filter((line) => line.trim());
        const headers = lines[0].split(',').map((h) => h.trim());

        const parsed: CourseRecord[] = [];
        let validCount = 0;
        let invalidCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v) => v.trim());
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => {
            row[h] = values[idx] || '';
          });

          const errors: string[] = [];

          // Validation
          if (row['Department'] && row['Department'] !== department) {
            errors.push(`Department "${row['Department']}" does not match "${department}"`);
          }
          if (!row['Course Code']) {
            errors.push('Course Code is mandatory');
          }
          if (!row['Course Name']) {
            errors.push('Course Name is mandatory');
          }
          if (row['Course Type'] && !COURSE_TYPES.includes(row['Course Type'])) {
            errors.push(`Course Type "${row['Course Type']}" must be Theory or Lab`);
          }

          const yearVal = row['Year'] || selectedYear;
          const semVal = row['Semester'] || selectedSemester;
          if (!YEARS_OF_STUDY.includes(yearVal)) {
            errors.push(`Year "${yearVal}" is not valid`);
          }

          const courseRecord: CourseRecord = {
            id: `upload-${i}`,
            department: row['Department'] || department,
            year: yearVal,
            semester: semVal,
            courseCode: row['Course Code'] || '',
            courseName: row['Course Name'] || '',
            courseType: row['Course Type'] || 'Theory',
            lectureHours: row['Lecture Hours'] || '0',
            theoryHours: row['Theory Hours'] || '0',
            labHours: row['Lab Hours'] || '0',
            credits: row['Credits'] || '0',
            status: row['Status'] || 'Active',
            validationStatus: errors.length > 0 ? 'invalid' : 'valid',
            errors: errors.length > 0 ? errors : undefined,
          };

          if (errors.length > 0) {
            invalidCount++;
          } else {
            validCount++;
          }

          parsed.push(courseRecord);
        }

        setUploadPreview(parsed);
        setUploadStats({ total: parsed.length, valid: validCount, invalid: invalidCount });
        setShowUploadDialog(true);
      };
      reader.readAsText(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [department, selectedYear, selectedSemester]
  );

  // Import uploaded courses (only valid ones)
  const handleImportUploaded = useCallback(() => {
    const validCourses = uploadPreview.filter((c) => c.validationStatus === 'valid');
    const newCourses = validCourses.map((c, idx) => ({
      ...c,
      id: `course-${Date.now()}-${idx}`,
      validationStatus: undefined as CourseRecord['validationStatus'],
      errors: undefined,
    }));
    setCourses((prev) => [...prev, ...newCourses]);
    setShowUploadDialog(false);
    setUploadPreview([]);
    setUploadStats(null);
  }, [uploadPreview]);

  // Add course manually
  const handleAddCourse = useCallback(() => {
    if (!newCourse.courseCode || !newCourse.courseName || !newCourse.courseType) return;

    const course: CourseRecord = {
      id: editingCourse ? editingCourse.id : `course-${Date.now()}`,
      department,
      year: selectedYear,
      semester: selectedSemester,
      courseCode: newCourse.courseCode,
      courseName: newCourse.courseName,
      courseType: newCourse.courseType,
      lectureHours: newCourse.lectureHours || '0',
      theoryHours: newCourse.theoryHours || '0',
      labHours: newCourse.labHours || '0',
      credits: newCourse.credits || '0',
      status: newCourse.status,
    };

    if (editingCourse) {
      setCourses((prev) => prev.map((c) => (c.id === editingCourse.id ? course : c)));
    } else {
      setCourses((prev) => [...prev, course]);
    }

    setNewCourse({ courseCode: '', courseName: '', courseType: '', lectureHours: '', theoryHours: '', labHours: '', credits: '', status: 'Active' });
    setShowAddDialog(false);
    setEditingCourse(null);
  }, [newCourse, department, selectedYear, selectedSemester, editingCourse]);

  // Edit course
  const handleEditCourse = useCallback((course: CourseRecord) => {
    setEditingCourse(course);
    setNewCourse({
      courseCode: course.courseCode,
      courseName: course.courseName,
      courseType: course.courseType,
      lectureHours: course.lectureHours,
      theoryHours: course.theoryHours,
      labHours: course.labHours,
      credits: course.credits,
      status: course.status,
    });
    setShowAddDialog(true);
  }, []);

  // Delete course
  const handleDeleteCourse = useCallback((id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Save Courses
  const handleSaveCourses = useCallback(() => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  }, []);

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
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Department Courses</h2>
              <p className="text-xs text-muted-foreground">
                Manage course data for each year and semester — upload via CSV or add manually
              </p>
            </div>
          </div>
        </div>

        {/* Context Info Cards - Same as Academic Calendar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-border/50">
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Department</p>
              <p className="text-sm font-semibold mt-0.5">{department}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Academic Year</p>
              <p className="text-sm font-semibold mt-0.5 text-indigo-600">{academicYear}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Year</p>
              <Select value={selectedYear} onValueChange={handleYearChange}>
                <SelectTrigger className="h-7 text-sm font-semibold border-0 p-0 shadow-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS_OF_STUDY.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Semester</p>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="h-7 text-sm font-semibold border-0 p-0 shadow-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableSemesters.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
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
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="h-3.5 w-3.5" />
                Upload CSV
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setEditingCourse(null); setNewCourse({ courseCode: '', courseName: '', courseType: '', lectureHours: '', theoryHours: '', labHours: '', credits: '', status: 'Active' }); setShowAddDialog(true); }} className="gap-2">
              <Plus className="h-3.5 w-3.5" />
              Add Course
            </Button>
            <div className="ml-auto">
              <Button
                size="sm"
                onClick={handleSaveCourses}
                disabled={totalCoursesForYearSem === 0}
                className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
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
                    Total Courses: {totalCoursesForYearSem} • {selectedYear} / {selectedSemester}
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
            placeholder="Search by course code or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[130px] h-9 text-sm">
            <Filter className="h-3.5 w-3.5 mr-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {COURSE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[130px] h-9 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {COURSE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
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
            <FileText className="h-4 w-4 text-indigo-600" />
            Courses — {selectedYear} / {selectedSemester}
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
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs font-semibold w-8">#</TableHead>
                    <TableHead className="text-xs font-semibold">Course Code</TableHead>
                    <TableHead className="text-xs font-semibold">Course Name</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Type</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Lec Hrs</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Theory Hrs</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Lab Hrs</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Credits</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course, idx) => (
                    <TableRow key={course.id} className="hover:bg-muted/20">
                      <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="text-xs font-medium font-mono">{course.courseCode}</TableCell>
                      <TableCell className="text-sm font-medium">{course.courseName}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={cn('text-[10px]',
                          course.courseType === 'Theory' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                        )}>
                          {course.courseType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-center">{course.lectureHours}</TableCell>
                      <TableCell className="text-xs text-center">{course.theoryHours}</TableCell>
                      <TableCell className="text-xs text-center">{course.labHours}</TableCell>
                      <TableCell className="text-xs text-center font-semibold">{course.credits}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={cn('text-[10px]',
                          course.status === 'Active' && 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                          course.status === 'Inactive' && 'bg-gray-500/10 text-gray-600 border-gray-500/20',
                          course.status === 'Proposed' && 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                        )}>
                          {course.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
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
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Evidence Repository */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-600" />
              Evidence Repository — {selectedYear} / {selectedSemester}
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">{filteredEvidence.length} documents</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Evidence Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="h-8 text-xs pl-8"
                placeholder="Search by course name..."
                value={evidenceSearch}
                onChange={(e) => setEvidenceSearch(e.target.value)}
              />
            </div>
            <Select value={evidenceFilterStatus} onValueChange={setEvidenceFilterStatus}>
              <SelectTrigger className="h-8 w-[120px] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Status</SelectItem>
                <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                <SelectItem value="verified" className="text-xs">Verified</SelectItem>
                <SelectItem value="approved" className="text-xs">Approved</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5">
              <Upload className="h-3.5 w-3.5" /> Upload Evidence
            </Button>
          </div>

          {/* Evidence Table */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[10px] font-semibold">Document Name (Course)</TableHead>
                  <TableHead className="text-[10px] font-semibold w-[70px]">Year</TableHead>
                  <TableHead className="text-[10px] font-semibold w-[80px]">Semester</TableHead>
                  <TableHead className="text-[10px] font-semibold">Uploaded By</TableHead>
                  <TableHead className="text-[10px] font-semibold w-[90px]">Date</TableHead>
                  <TableHead className="text-[10px] font-semibold w-[80px]">Status</TableHead>
                  <TableHead className="text-[10px] font-semibold text-right w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvidence.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-xs text-muted-foreground">
                      No evidence documents for {selectedYear} / {selectedSemester}.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvidence.map((ev) => (
                    <TableRow key={ev.id} className="hover:bg-muted/20">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs font-medium">{ev.documentName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{ev.year.replace(' Year', '')}</TableCell>
                      <TableCell className="text-xs">{ev.semester}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{ev.uploadedBy}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{ev.date}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn('text-[9px]',
                          ev.status === 'approved' && 'bg-emerald-500/10 text-emerald-600',
                          ev.status === 'verified' && 'bg-blue-500/10 text-blue-600',
                          ev.status === 'pending' && 'bg-amber-500/10 text-amber-600',
                        )}>
                          {ev.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <Button variant="ghost" size="icon" className="h-6 w-6" title="Upload">
                            <Upload className="h-3 w-3 text-indigo-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" title="Preview">
                            <Eye className="h-3 w-3 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" title="Download">
                            <DownloadCloud className="h-3 w-3 text-emerald-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" title="Reupload">
                            <RefreshCw className="h-3 w-3 text-amber-600" />
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

      {/* Future Integration Info */}
      <Card className="border-border/50 bg-muted/20">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Future Integration</p>
          <div className="flex flex-wrap gap-2">
            {[
              'Course Syllabus PDF',
              'Excel Export',
              'NAAC Course Evidence',
              'NBA Course Evidence',
              'CO-PO Mapping',
            ].map((item) => (
              <Badge key={item} variant="outline" className="text-[10px] bg-background">
                {item}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Course Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); setEditingCourse(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">{editingCourse ? 'Edit Course' : 'Add Course'}</DialogTitle>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Course Code *</Label>
                  <Input
                    value={newCourse.courseCode}
                    onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value })}
                    placeholder="e.g., CS501"
                    className="mt-1 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Course Type *</Label>
                  <Select value={newCourse.courseType} onValueChange={(v) => setNewCourse({ ...newCourse, courseType: v })}>
                    <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {COURSE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Course Name *</Label>
                <Input
                  value={newCourse.courseName}
                  onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
                  placeholder="e.g., Machine Learning"
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">Lecture Hrs</Label>
                  <Input type="number" min="0" value={newCourse.lectureHours}
                    onChange={(e) => setNewCourse({ ...newCourse, lectureHours: e.target.value })}
                    className="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Theory Hrs</Label>
                  <Input type="number" min="0" value={newCourse.theoryHours}
                    onChange={(e) => setNewCourse({ ...newCourse, theoryHours: e.target.value })}
                    className="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Lab Hrs</Label>
                  <Input type="number" min="0" value={newCourse.labHours}
                    onChange={(e) => setNewCourse({ ...newCourse, labHours: e.target.value })}
                    className="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Credits</Label>
                  <Input type="number" min="0" step="0.5" value={newCourse.credits}
                    onChange={(e) => setNewCourse({ ...newCourse, credits: e.target.value })}
                    className="mt-1 h-9 text-sm" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={newCourse.status} onValueChange={(v) => setNewCourse({ ...newCourse, status: v })}>
                  <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COURSE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setShowAddDialog(false); setEditingCourse(null); }}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddCourse}
              disabled={!newCourse.courseCode || !newCourse.courseName || !newCourse.courseType}
            >
              {editingCourse ? 'Update Course' : 'Add Course'}
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
                      <TableHead className="text-xs font-semibold">Code</TableHead>
                      <TableHead className="text-xs font-semibold">Course Name</TableHead>
                      <TableHead className="text-xs font-semibold">Type</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Lec</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Theory</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Lab</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Credits</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Valid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadPreview.map((course, idx) => (
                      <TableRow
                        key={course.id}
                        className={cn(
                          course.validationStatus === 'invalid' && 'bg-red-500/5 border-l-2 border-l-red-500'
                        )}
                      >
                        <TableCell className="text-xs">{idx + 1}</TableCell>
                        <TableCell className="text-xs font-mono">{course.courseCode}</TableCell>
                        <TableCell className="text-xs font-medium">{course.courseName}</TableCell>
                        <TableCell className="text-xs">{course.courseType}</TableCell>
                        <TableCell className="text-xs text-center">{course.lectureHours}</TableCell>
                        <TableCell className="text-xs text-center">{course.theoryHours}</TableCell>
                        <TableCell className="text-xs text-center">{course.labHours}</TableCell>
                        <TableCell className="text-xs text-center">{course.credits}</TableCell>
                        <TableCell className="text-center">
                          {course.validationStatus === 'valid' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <div className="flex items-center gap-1 justify-center">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-[9px] text-red-600 max-w-[120px] truncate" title={course.errors?.join(', ')}>
                                {course.errors?.[0]}
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
                      .filter((c) => c.validationStatus === 'invalid')
                      .map((c, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <X className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                          <p className="text-[11px] text-red-600">
                            Row {uploadPreview.indexOf(c) + 1}: {c.errors?.join('; ')}
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
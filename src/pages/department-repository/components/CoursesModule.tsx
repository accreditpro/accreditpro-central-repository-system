import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Download,
  Upload,
  Plus,
  Search,
  FileText,
  Pencil,
  Trash2,
  Eye,
  DownloadCloud,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Save,
} from 'lucide-react';

interface CourseRecord {
  id: string;
  courseCode: string;
  courseName: string;
  year: string;
  semester: string;
  courseType: string;
  lectureHours: string;
  theoryHours: string;
  labHours: string;
  credits: string;
  status: string;
}

interface EvidenceRecord {
  id: string;
  documentName: string;
  year: string;
  semester: string;
  uploadedBy: string;
  date: string;
  status: 'pending' | 'verified' | 'approved';
  fileUrl?: string;
}

interface CoursesModuleProps {
  department: string;
  academicYear: string;
}

const CSV_COLUMNS = [
  'Course Code',
  'Course Name',
  'Year',
  'Semester',
  'Course Type',
  'Lecture Hours',
  'Theory Hours',
  'Lab Hours',
  'Credits',
  'Status',
];

const YEARS = ['I', 'II', 'III', 'IV'];
const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const COURSE_TYPES = ['Theory', 'Lab'];
const STATUSES = ['Active', 'Inactive', 'Proposed'];

// Mock course data
const generateMockCourses = (academicYear: string): CourseRecord[] => [
  { id: '1', courseCode: 'CS501', courseName: 'Machine Learning', year: 'III', semester: '5', courseType: 'Theory', lectureHours: '3', theoryHours: '3', labHours: '0', credits: '3', status: 'Active' },
  { id: '2', courseCode: 'CS502', courseName: 'Machine Learning Lab', year: 'III', semester: '5', courseType: 'Lab', lectureHours: '0', theoryHours: '0', labHours: '3', credits: '1.5', status: 'Active' },
  { id: '3', courseCode: 'CS503', courseName: 'Deep Learning', year: 'III', semester: '5', courseType: 'Theory', lectureHours: '3', theoryHours: '3', labHours: '0', credits: '3', status: 'Active' },
  { id: '4', courseCode: 'CS504', courseName: 'Computer Vision', year: 'III', semester: '6', courseType: 'Theory', lectureHours: '3', theoryHours: '3', labHours: '0', credits: '3', status: 'Active' },
  { id: '5', courseCode: 'CS505', courseName: 'Computer Vision Lab', year: 'III', semester: '6', courseType: 'Lab', lectureHours: '0', theoryHours: '0', labHours: '3', credits: '1.5', status: 'Active' },
  { id: '6', courseCode: 'CS601', courseName: 'Natural Language Processing', year: 'IV', semester: '7', courseType: 'Theory', lectureHours: '3', theoryHours: '3', labHours: '0', credits: '3', status: 'Active' },
  { id: '7', courseCode: 'CS602', courseName: 'Cloud Computing', year: 'IV', semester: '7', courseType: 'Theory', lectureHours: '3', theoryHours: '3', labHours: '0', credits: '3', status: 'Active' },
  { id: '8', courseCode: 'CS603', courseName: 'Cloud Computing Lab', year: 'IV', semester: '7', courseType: 'Lab', lectureHours: '0', theoryHours: '0', labHours: '3', credits: '1.5', status: 'Active' },
  { id: '9', courseCode: 'CS301', courseName: 'Data Structures', year: 'II', semester: '3', courseType: 'Theory', lectureHours: '3', theoryHours: '3', labHours: '0', credits: '3', status: 'Active' },
  { id: '10', courseCode: 'CS302', courseName: 'Data Structures Lab', year: 'II', semester: '3', courseType: 'Lab', lectureHours: '0', theoryHours: '0', labHours: '3', credits: '1.5', status: 'Active' },
];

// Mock evidence data
const generateMockEvidence = (): EvidenceRecord[] => [
  { id: '1', documentName: 'Machine Learning', year: 'III', semester: '5', uploadedBy: 'Dr. Anita Sharma', date: '2025-01-10', status: 'approved' },
  { id: '2', documentName: 'Machine Learning Lab', year: 'III', semester: '5', uploadedBy: 'Dr. Anita Sharma', date: '2025-01-10', status: 'approved' },
  { id: '3', documentName: 'Deep Learning', year: 'III', semester: '5', uploadedBy: 'Dr. Rajesh Kumar', date: '2025-01-11', status: 'verified' },
  { id: '4', documentName: 'Computer Vision', year: 'III', semester: '6', uploadedBy: 'Dr. Priya Sharma', date: '2025-01-12', status: 'pending' },
  { id: '5', documentName: 'Natural Language Processing', year: 'IV', semester: '7', uploadedBy: 'Dr. Anita Sharma', date: '2025-01-08', status: 'approved' },
  { id: '6', documentName: 'Cloud Computing', year: 'IV', semester: '7', uploadedBy: 'Mr. Anil Reddy', date: '2025-01-09', status: 'verified' },
  { id: '7', documentName: 'Data Structures', year: 'II', semester: '3', uploadedBy: 'Dr. Sunita Patel', date: '2025-01-05', status: 'approved' },
  { id: '8', documentName: 'Data Structures Lab', year: 'II', semester: '3', uploadedBy: 'Dr. Sunita Patel', date: '2025-01-05', status: 'pending' },
];

export const CoursesModule = ({ department, academicYear }: CoursesModuleProps) => {
  const [courses, setCourses] = useState<CourseRecord[]>(() => generateMockCourses(academicYear));
  const [evidence, setEvidence] = useState<EvidenceRecord[]>(() => generateMockEvidence());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterSemester, setFilterSemester] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseRecord | null>(null);
  const [showUploadPreview, setShowUploadPreview] = useState(false);
  const [uploadPreviewData, setUploadPreviewData] = useState<{ valid: CourseRecord[]; invalid: { row: number; data: Record<string, string>; error: string }[] }>({ valid: [], invalid: [] });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New course form state
  const [newCourse, setNewCourse] = useState<Omit<CourseRecord, 'id'>>({
    courseCode: '',
    courseName: '',
    year: '',
    semester: '',
    courseType: '',
    lectureHours: '',
    theoryHours: '',
    labHours: '',
    credits: '',
    status: 'Active',
  });

  // Evidence filter state
  const [evidenceSearch, setEvidenceSearch] = useState('');
  const [evidenceFilterStatus, setEvidenceFilterStatus] = useState<string>('all');

  // Download CSV Template
  const handleDownloadTemplate = () => {
    const headers = CSV_COLUMNS.join(',');
    const sampleRows = [
      'CS501,Machine Learning,III,5,Theory,3,3,0,3,Active',
      'CS502,Machine Learning Lab,III,5,Lab,0,0,3,1.5,Active',
    ];
    const csvContent = `${headers}\n${sampleRows.join('\n')}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `courses_template_${department.toLowerCase().replace(/\s+/g, '_')}_${academicYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle CSV Upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map(h => h.trim());
      const valid: CourseRecord[] = [];
      const invalid: { row: number; data: Record<string, string>; error: string }[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const rowData: Record<string, string> = {};
        headers.forEach((h, idx) => { rowData[h] = values[idx] || ''; });

        const errors: string[] = [];
        if (!rowData['Course Code']) errors.push('Course Code is required');
        if (!rowData['Course Name']) errors.push('Course Name is required');
        if (!rowData['Year'] || !YEARS.includes(rowData['Year'])) errors.push('Invalid Year (must be I, II, III, or IV)');
        if (!rowData['Semester'] || !SEMESTERS.includes(rowData['Semester'])) errors.push('Invalid Semester (must be 1-8)');
        if (!rowData['Course Type'] || !COURSE_TYPES.includes(rowData['Course Type'])) errors.push('Invalid Course Type (must be Theory or Lab)');

        if (errors.length > 0) {
          invalid.push({ row: i + 1, data: rowData, error: errors.join('; ') });
        } else {
          valid.push({
            id: `upload-${Date.now()}-${i}`,
            courseCode: rowData['Course Code'],
            courseName: rowData['Course Name'],
            year: rowData['Year'],
            semester: rowData['Semester'],
            courseType: rowData['Course Type'],
            lectureHours: rowData['Lecture Hours'] || '0',
            theoryHours: rowData['Theory Hours'] || '0',
            labHours: rowData['Lab Hours'] || '0',
            credits: rowData['Credits'] || '0',
            status: rowData['Status'] || 'Active',
          });
        }
      }

      setUploadPreviewData({ valid, invalid });
      setShowUploadPreview(true);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // Confirm upload
  const handleConfirmUpload = () => {
    setCourses(prev => [...prev, ...uploadPreviewData.valid]);
    setShowUploadPreview(false);
    setUploadPreviewData({ valid: [], invalid: [] });
  };

  // Add new course
  const handleAddCourse = () => {
    const course: CourseRecord = {
      id: `manual-${Date.now()}`,
      ...newCourse,
    };
    setCourses(prev => [...prev, course]);
    setShowAddDialog(false);
    setNewCourse({
      courseCode: '', courseName: '', year: '', semester: '',
      courseType: '', lectureHours: '', theoryHours: '', labHours: '',
      credits: '', status: 'Active',
    });
  };

  // Edit course
  const handleEditCourse = (course: CourseRecord) => {
    setEditingCourse({ ...course });
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!editingCourse) return;
    setCourses(prev => prev.map(c => c.id === editingCourse.id ? editingCourse : c));
    setShowEditDialog(false);
    setEditingCourse(null);
  };

  // Delete course
  const handleDeleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  // Save all courses
  const handleSaveCourses = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Evidence upload handler
  const handleEvidenceUpload = (courseName: string, year: string, semester: string) => {
    const newEvidence: EvidenceRecord = {
      id: `ev-${Date.now()}`,
      documentName: courseName,
      year,
      semester,
      uploadedBy: 'Dr. Anita Sharma',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
    };
    setEvidence(prev => [...prev, newEvidence]);
  };

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = !searchQuery ||
      course.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = filterYear === 'all' || course.year === filterYear;
    const matchesSemester = filterSemester === 'all' || course.semester === filterSemester;
    const matchesType = filterType === 'all' || course.courseType === filterType;
    return matchesSearch && matchesYear && matchesSemester && matchesType;
  });

  // Filter evidence
  const filteredEvidence = evidence.filter(ev => {
    const matchesSearch = !evidenceSearch ||
      ev.documentName.toLowerCase().includes(evidenceSearch.toLowerCase());
    const matchesStatus = evidenceFilterStatus === 'all' || ev.status === evidenceFilterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Header with context */}
      <Card className="border-border/50 bg-gradient-to-r from-blue-500/5 to-indigo-500/5">
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold">Courses Repository</span>
            </div>
            <Badge variant="secondary" className="text-[10px]">{department}</Badge>
            <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-700 border-blue-200">
              AY {academicYear}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {courses.length} courses
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Actions</CardTitle>
            {saveSuccess && (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-[10px]">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Saved Successfully
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleDownloadTemplate}>
              <Download className="h-3.5 w-3.5 mr-1.5" /> Download Template
            </Button>
            <Button size="sm" className="text-xs h-8" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload CSV
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Course
            </Button>
            <Button variant="default" size="sm" className="text-xs h-8 ml-auto" onClick={handleSaveCourses}>
              <Save className="h-3.5 w-3.5 mr-1.5" /> Save Courses
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
        </CardContent>
      </Card>

      {/* Filters & Search */}
      <Card className="border-border/50">
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="h-8 text-xs pl-8"
                placeholder="Search by course code or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="h-8 w-[100px] text-xs">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Years</SelectItem>
                {YEARS.map(y => (
                  <SelectItem key={y} value={y} className="text-xs">{y} Year</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSemester} onValueChange={setFilterSemester}>
              <SelectTrigger className="h-8 w-[120px] text-xs">
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Semesters</SelectItem>
                {SEMESTERS.map(s => (
                  <SelectItem key={s} value={s} className="text-xs">Sem {s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-8 w-[110px] text-xs">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Types</SelectItem>
                {COURSE_TYPES.map(t => (
                  <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Course Data</CardTitle>
              <CardDescription className="text-xs">
                Showing {filteredCourses.length} of {courses.length} courses
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-[10px] font-semibold w-8 text-center">#</TableHead>
                  <TableHead className="text-[10px] font-semibold w-[80px]">Course Code</TableHead>
                  <TableHead className="text-[10px] font-semibold min-w-[140px]">Course Name</TableHead>
                  <TableHead className="text-[10px] font-semibold w-[50px]">Year</TableHead>
                  <TableHead className="text-[10px] font-semibold w-[50px]">Sem</TableHead>
                  <TableHead className="text-[10px] font-semibold w-[60px]">Type</TableHead>
                  <TableHead className="text-[10px] font-semibold w-[50px]">Lec Hrs</TableHead>
                  <TableHead className="text-[10px] font-semibold w-[55px]">Theory Hrs</TableHead>
                  <TableHead className="text-[10px] font-semibold w-[50px]">Lab Hrs</TableHead>
                  <TableHead className="text-[10px] font-semibold w-[50px]">Credits</TableHead>
                  <TableHead className="text-[10px] font-semibold w-[60px]">Status</TableHead>
                  <TableHead className="text-[10px] font-semibold text-center w-[60px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <FileText className="h-8 w-8 opacity-40" />
                        <p className="text-xs">No courses found. Upload a CSV or add courses manually.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course, index) => (
                    <TableRow key={course.id} className="hover:bg-muted/20">
                      <TableCell className="text-[10px] text-center text-muted-foreground font-mono p-1.5">{index + 1}</TableCell>
                      <TableCell className="text-[10px] p-1.5 font-medium">{course.courseCode}</TableCell>
                      <TableCell className="text-[10px] p-1.5">{course.courseName}</TableCell>
                      <TableCell className="text-[10px] p-1.5">{course.year}</TableCell>
                      <TableCell className="text-[10px] p-1.5">{course.semester}</TableCell>
                      <TableCell className="text-[10px] p-1.5">
                        <Badge variant="secondary" className={cn('text-[9px]',
                          course.courseType === 'Theory' ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'
                        )}>
                          {course.courseType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[10px] p-1.5 text-center">{course.lectureHours}</TableCell>
                      <TableCell className="text-[10px] p-1.5 text-center">{course.theoryHours}</TableCell>
                      <TableCell className="text-[10px] p-1.5 text-center">{course.labHours}</TableCell>
                      <TableCell className="text-[10px] p-1.5 text-center font-medium">{course.credits}</TableCell>
                      <TableCell className="text-[10px] p-1.5">
                        <Badge variant="secondary" className={cn('text-[9px]',
                          course.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' :
                          course.status === 'Inactive' ? 'bg-gray-500/10 text-gray-600' :
                          'bg-amber-500/10 text-amber-600'
                        )}>
                          {course.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center p-1.5">
                        <div className="flex items-center justify-center gap-0">
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleEditCourse(course)}>
                            <Pencil className="h-3 w-3 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleDeleteCourse(course.id)}>
                            <Trash2 className="h-3 w-3 text-red-600" />
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

      {/* Evidence Repository */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Evidence Repository</CardTitle>
              <CardDescription className="text-xs">Course syllabus documents and supporting evidence</CardDescription>
            </div>
            <Badge variant="secondary" className="text-[10px]">{evidence.length} documents</Badge>
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
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => {
              // Upload evidence for a course that doesn't have one yet
              const coursesWithoutEvidence = courses.filter(c =>
                !evidence.some(e => e.documentName === c.courseName)
              );
              if (coursesWithoutEvidence.length > 0) {
                const c = coursesWithoutEvidence[0];
                handleEvidenceUpload(c.courseName, c.year, c.semester);
              }
            }}>
              <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Evidence
            </Button>
          </div>

          {/* Evidence Table */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[10px] font-semibold">Document Name (Course)</TableHead>
                  <TableHead className="text-[10px] font-semibold w-[60px]">Year</TableHead>
                  <TableHead className="text-[10px] font-semibold w-[70px]">Semester</TableHead>
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
                      No evidence documents found.
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
                      <TableCell className="text-xs">{ev.year}</TableCell>
                      <TableCell className="text-xs">Sem {ev.semester}</TableCell>
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

      {/* Upload Preview Dialog */}
      <Dialog open={showUploadPreview} onOpenChange={setShowUploadPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">CSV Upload Preview</DialogTitle>
            <DialogDescription className="text-xs">
              Review the parsed data before confirming the upload.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                <CheckCircle2 className="h-3 w-3 mr-1" /> {uploadPreviewData.valid.length} Valid
              </Badge>
              <Badge className="bg-red-500/10 text-red-600 border-red-200">
                <AlertCircle className="h-3 w-3 mr-1" /> {uploadPreviewData.invalid.length} Invalid
              </Badge>
            </div>

            {uploadPreviewData.valid.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2 text-emerald-700">Valid Records:</p>
                <div className="rounded-lg border overflow-hidden max-h-[200px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-emerald-50">
                        <TableHead className="text-[10px]">Code</TableHead>
                        <TableHead className="text-[10px]">Name</TableHead>
                        <TableHead className="text-[10px]">Year</TableHead>
                        <TableHead className="text-[10px]">Sem</TableHead>
                        <TableHead className="text-[10px]">Type</TableHead>
                        <TableHead className="text-[10px]">Credits</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadPreviewData.valid.map((row, i) => (
                        <TableRow key={i} className="bg-emerald-50/30">
                          <TableCell className="text-[10px]">{row.courseCode}</TableCell>
                          <TableCell className="text-[10px]">{row.courseName}</TableCell>
                          <TableCell className="text-[10px]">{row.year}</TableCell>
                          <TableCell className="text-[10px]">{row.semester}</TableCell>
                          <TableCell className="text-[10px]">{row.courseType}</TableCell>
                          <TableCell className="text-[10px]">{row.credits}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {uploadPreviewData.invalid.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2 text-red-700">Invalid Records:</p>
                <div className="rounded-lg border border-red-200 overflow-hidden max-h-[200px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-red-50">
                        <TableHead className="text-[10px]">Row</TableHead>
                        <TableHead className="text-[10px]">Data</TableHead>
                        <TableHead className="text-[10px]">Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadPreviewData.invalid.map((row, i) => (
                        <TableRow key={i} className="bg-red-50/30">
                          <TableCell className="text-[10px] font-mono">{row.row}</TableCell>
                          <TableCell className="text-[10px]">{Object.values(row.data).filter(Boolean).join(', ').slice(0, 60)}...</TableCell>
                          <TableCell className="text-[10px] text-red-600">{row.error}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowUploadPreview(false)}>
              Cancel
            </Button>
            <Button size="sm" className="text-xs" onClick={handleConfirmUpload} disabled={uploadPreviewData.valid.length === 0}>
              Confirm Upload ({uploadPreviewData.valid.length} records)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Course Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Add New Course</DialogTitle>
            <DialogDescription className="text-xs">
              Enter course details. Department and Academic Year are auto-populated.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Course Code <span className="text-red-500">*</span></Label>
                <Input className="h-9 text-xs" placeholder="e.g., CS501" value={newCourse.courseCode}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, courseCode: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Course Name <span className="text-red-500">*</span></Label>
                <Input className="h-9 text-xs" placeholder="e.g., Machine Learning" value={newCourse.courseName}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, courseName: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Year <span className="text-red-500">*</span></Label>
                <Select value={newCourse.year} onValueChange={(v) => setNewCourse(prev => ({ ...prev, year: v }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {YEARS.map(y => <SelectItem key={y} value={y} className="text-xs">{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Semester <span className="text-red-500">*</span></Label>
                <Select value={newCourse.semester} onValueChange={(v) => setNewCourse(prev => ({ ...prev, semester: v }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {SEMESTERS.map(s => <SelectItem key={s} value={s} className="text-xs">Sem {s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Course Type <span className="text-red-500">*</span></Label>
                <Select value={newCourse.courseType} onValueChange={(v) => setNewCourse(prev => ({ ...prev, courseType: v }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {COURSE_TYPES.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Lecture Hours</Label>
                <Input className="h-9 text-xs" type="number" min="0" value={newCourse.lectureHours}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, lectureHours: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Theory Hours</Label>
                <Input className="h-9 text-xs" type="number" min="0" value={newCourse.theoryHours}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, theoryHours: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Lab Hours</Label>
                <Input className="h-9 text-xs" type="number" min="0" value={newCourse.labHours}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, labHours: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Credits</Label>
                <Input className="h-9 text-xs" type="number" min="0" step="0.5" value={newCourse.credits}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, credits: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Status</Label>
              <Select value={newCourse.status} onValueChange={(v) => setNewCourse(prev => ({ ...prev, status: v }))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground">Department</p>
                <p className="text-xs font-medium">{department}</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground">Academic Year</p>
                <p className="text-xs font-medium">{academicYear}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button size="sm" className="text-xs" onClick={handleAddCourse}
              disabled={!newCourse.courseCode || !newCourse.courseName || !newCourse.year || !newCourse.semester || !newCourse.courseType}>
              Add Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Edit Course</DialogTitle>
            <DialogDescription className="text-xs">
              Modify course details below.
            </DialogDescription>
          </DialogHeader>
          {editingCourse && (
            <div className="grid gap-3 py-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-medium">Course Code</Label>
                  <Input className="h-9 text-xs" value={editingCourse.courseCode}
                    onChange={(e) => setEditingCourse(prev => prev ? { ...prev, courseCode: e.target.value } : null)} />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-medium">Course Name</Label>
                  <Input className="h-9 text-xs" value={editingCourse.courseName}
                    onChange={(e) => setEditingCourse(prev => prev ? { ...prev, courseName: e.target.value } : null)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-medium">Year</Label>
                  <Select value={editingCourse.year} onValueChange={(v) => setEditingCourse(prev => prev ? { ...prev, year: v } : null)}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {YEARS.map(y => <SelectItem key={y} value={y} className="text-xs">{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-medium">Semester</Label>
                  <Select value={editingCourse.semester} onValueChange={(v) => setEditingCourse(prev => prev ? { ...prev, semester: v } : null)}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SEMESTERS.map(s => <SelectItem key={s} value={s} className="text-xs">Sem {s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-medium">Course Type</Label>
                  <Select value={editingCourse.courseType} onValueChange={(v) => setEditingCourse(prev => prev ? { ...prev, courseType: v } : null)}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COURSE_TYPES.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-medium">Lecture Hours</Label>
                  <Input className="h-9 text-xs" type="number" min="0" value={editingCourse.lectureHours}
                    onChange={(e) => setEditingCourse(prev => prev ? { ...prev, lectureHours: e.target.value } : null)} />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-medium">Theory Hours</Label>
                  <Input className="h-9 text-xs" type="number" min="0" value={editingCourse.theoryHours}
                    onChange={(e) => setEditingCourse(prev => prev ? { ...prev, theoryHours: e.target.value } : null)} />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-medium">Lab Hours</Label>
                  <Input className="h-9 text-xs" type="number" min="0" value={editingCourse.labHours}
                    onChange={(e) => setEditingCourse(prev => prev ? { ...prev, labHours: e.target.value } : null)} />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-medium">Credits</Label>
                  <Input className="h-9 text-xs" type="number" min="0" step="0.5" value={editingCourse.credits}
                    onChange={(e) => setEditingCourse(prev => prev ? { ...prev, credits: e.target.value } : null)} />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Status</Label>
                <Select value={editingCourse.status} onValueChange={(v) => setEditingCourse(prev => prev ? { ...prev, status: v } : null)}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button size="sm" className="text-xs" onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
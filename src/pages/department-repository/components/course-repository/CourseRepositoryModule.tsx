import { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CourseState,
  CourseDetails,
  CourseFileData,
  AICourseAnalysis,
  CourseOutcome,
  COPOMapping,
  POCoverage,
  // GapAnalysis as GapAnalysisType,  // Reserved — used in separate section
  // RevisedMapping,                  // Reserved — used in separate section
  COPSOMapping,
  AssessmentBlueprint,
  MarksUpload,
  AttainmentResult,
  DashboardMetrics,
  CourseSummary,
  WorkflowStepId,
  NBA_POS,
  NBA_PSOS,
  WORKFLOW_STEPS,
  WorkflowStepInfo,
} from './types';
import { ProgressStepper } from './components/ProgressStepper';
import Step1_CourseDetails from './steps/Step1_CourseDetails';
import Step2_UploadCourseFile from './steps/Step2_UploadCourseFile';
import Step3_AICourseAnalysis from './steps/Step3_AICourseAnalysis';
import Step4_CourseOutcomes from './steps/Step4_CourseOutcomes';
import Step5_COPOMapping from './steps/Step5_COPOMapping';
// Step6 and Step7 are reserved — will be used in a separate section with different calculation approaches
// import Step6_GapAnalysis from './steps/Step6_GapAnalysis';
// import Step7_RevisedCOPOMapping from './steps/Step7_RevisedCOPOMapping';
import Step8_COPSOMapping from './steps/Step8_COPSOMapping';
import Step9_AssessmentBlueprint from './steps/Step9_AssessmentBlueprint';
import Step10_MarksUpload from './steps/Step10_MarksUpload';
import Step11_AttainmentDashboard from './steps/Step11_AttainmentDashboard';
import Step12_Reports from './steps/Step12_Reports';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Target,
  GitBranch,
  BarChart3,
  Award,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Search,
  Plus,
  FileText,
  GraduationCap,
  Building2,
  CalendarDays,
  ArrowLeft,
  Download,
  Upload,
  Save,
  Edit2,
  Trash2,
  Calculator,
} from 'lucide-react';

// ============ Types for local course records ============
interface CourseRecord {
  id: string;
  department: string;
  year: string;
  semester: string;
  academicYear: string;
  courseCode: string;
  courseName: string;
  facultyName: string;
  courseType: string;
  lectureHours: number;
  theoryHours: number;
  practicalHours: number;
  teamWorkHours: number;
  selfLearningHours: number;
  ciHours: number;
  piHours: number;
  totalHours: number;
  credits: number;
  status: string;
  progress: number;
  courseFileUploaded: boolean;
  cosGenerated: boolean;
  coPoMapped: boolean;
  coPsoMapped: boolean;
  marksUploaded: boolean;
  coAttainmentCalculated: boolean;
  poAttainmentCalculated: boolean;
  nbaReady: boolean;
  validationStatus?: 'valid' | 'invalid';
  errors?: string[];
}

// ============ Constants ============
const ACADEMIC_YEARS = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22'];
const YEARS_OF_STUDY = ['I Year', 'II Year', 'III Year', 'IV Year'];
const SEMESTERS_MAP: Record<string, string[]> = {
  'I Year': ['Semester 1', 'Semester 2'],
  'II Year': ['Semester 3', 'Semester 4'],
  'III Year': ['Semester 5', 'Semester 6'],
  'IV Year': ['Semester 7', 'Semester 8'],
};
const COURSE_TYPES = ['Theory', 'Lab', 'Theory + Lab', 'Project', 'Seminar', 'Internship'];
const COURSE_STATUSES = ['Active', 'Inactive', 'Proposed'];
const DEPARTMENTS = ['Computer Science & Engineering (CSE)'];

function calculateCourseMetrics(
  lectureHours: number,
  theoryHours: number,
  practicalHours: number,
  teamWorkHours: number,
  selfLearningHours: number
) {
  const ciHours = lectureHours + theoryHours;
  const piHours = practicalHours;
  const totalHours = ciHours + piHours + teamWorkHours + selfLearningHours;
  const credits = Math.round(totalHours / 30);
  return { ciHours, piHours, totalHours, credits };
}

export const CourseRepositoryModule = () => {
  // ============ Navigation & Selection State ============
  const [view, setView] = useState<'dashboard' | 'workspace'>('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2025-26');
  const [selectedYear, setSelectedYear] = useState('III Year');
  const [selectedSemester, setSelectedSemester] = useState('Semester 5');

  // ============ Course Data State ============
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isExistingCourse, setIsExistingCourse] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============ Course Workspace State ============
  const [courseState, setCourseState] = useState<CourseState>(() => createInitialState());

  function createInitialState(): CourseState {
    return {
      id: `course-${Date.now()}`,
      details: {
        courseCode: '',
        courseName: '',
        facultyName: '',
        department: DEPARTMENTS[0],
        program: 'B.Tech',
        regulation: 'R22',
        semester: selectedSemester,
        year: selectedYear,
        credits: 0,
        lectureHours: 0,
        tutorialHours: 0,
        practicalHours: 0,
        ciHours: 0,
        piHours: 0,
        teamWorkHours: 0,
        selfLearningHours: 0,
        totalHours: 0,
      },
      courseFile: null,
      aiAnalysis: null,
      courseOutcomes: [],
      coPoMapping: [],
      poCoverage: NBA_POS.map((po) => ({
        poId: po.id,
        poCode: po.code,
        coveragePercentage: 0,
        mappedCOs: [],
        avgLevel: 0,
      })),
      gapAnalysis: null,
      revisedMapping: null,
      coPsoMapping: [],
      psoCoverage: NBA_PSOS.map((pso) => ({
        poId: pso.id,
        poCode: pso.code,
        coveragePercentage: 0,
        mappedCOs: [],
        avgLevel: 0,
      })),
      assessmentBlueprint: null,
      marksUploads: [],
      attainmentResult: null,
      currentStep: 'course-details',
      completionPercentages: {
        'course-details': 0,
        'upload-course-file': 0,
        'ai-course-analysis': 0,
        'course-outcomes': 0,
        'co-po-mapping': 0,
        // 'gap-analysis': 0,          // Reserved — used in separate section
        // 'revised-co-po-mapping': 0,   // Reserved — used in separate section
        'co-pso-mapping': 0,
        'assessment-blueprint': 0,
        'marks-upload': 0,
        'attainment': 0,
        'reports': 0,
      },
    };
  }

  // ============ Update semester when year changes ============
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    const semesters = SEMESTERS_MAP[year];
    if (semesters && semesters.length > 0) {
      setSelectedSemester(semesters[0]);
    }
  };

  // ============ Filtered courses for selected academic year / year / semester ============
  const filteredCourses = useMemo(() => {
    let filtered = courses.filter(
      (c) => c.academicYear === selectedAcademicYear && c.year === selectedYear && c.semester === selectedSemester
    );

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.courseCode.toLowerCase().includes(q) ||
          c.courseName.toLowerCase().includes(q) ||
          c.facultyName.toLowerCase().includes(q)
      );
    }

    if (filterType && filterType !== 'all') {
      filtered = filtered.filter((c) => c.courseType === filterType);
    }

    if (filterStatus && filterStatus !== 'all') {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    return filtered;
  }, [courses, selectedAcademicYear, selectedYear, selectedSemester, searchQuery, filterType, filterStatus]);

  // ============ Semester Summary Stats ============
  const semesterStats = useMemo(() => {
    const semCourses = courses.filter(
      (c) => c.academicYear === selectedAcademicYear && c.year === selectedYear && c.semester === selectedSemester
    );
    const totalCredits = semCourses.reduce((sum, c) => sum + c.credits, 0);
    const totalContactHours = semCourses.reduce((sum, c) => sum + c.totalHours, 0);
    const theoryCourses = semCourses.filter((c) => c.courseType === 'Theory').length;
    const labCourses = semCourses.filter((c) => c.courseType === 'Lab' || c.courseType === 'Theory + Lab').length;
    return { total: semCourses.length, totalCredits, totalContactHours, theoryCourses, labCourses };
  }, [courses, selectedAcademicYear, selectedYear, selectedSemester]);

  // ============ Dashboard Metrics ============
  const metrics: DashboardMetrics = useMemo(() => ({
    totalCourses: courses.length,
    coursesWithFile: courses.filter((c) => c.courseFileUploaded).length,
    coursesWithCOs: courses.filter((c) => c.cosGenerated).length,
    coursesWithCOPOMapping: courses.filter((c) => c.coPoMapped).length,
    coursesWithCOPSOMapping: courses.filter((c) => c.coPsoMapped).length,
    coursesWithMarks: courses.filter((c) => c.marksUploaded).length,
    coursesWithCOAttainment: courses.filter((c) => c.coAttainmentCalculated).length,
    coursesWithPOAttainment: courses.filter((c) => c.poAttainmentCalculated).length,
    nbaReadyCourses: courses.filter((c) => c.nbaReady).length,
    courseCompletion: Math.round(
      courses.reduce((s, c) => s + c.progress, 0) / Math.max(courses.length, 1)
    ),
    departmentReadiness: Math.round(
      (courses.filter((c) => c.nbaReady).length / Math.max(courses.length, 1)) * 100
    ),
    evidenceCompletion: Math.round(
      (courses.filter((c) => c.courseFileUploaded).length / Math.max(courses.length, 1)) * 100
    ),
    attainmentStatus: Math.round(
      (courses.filter((c) => c.coAttainmentCalculated).length / Math.max(courses.length, 1)) * 100
    ),
  }), [courses]);

  // ============ Workflow step statuses ============
  const workflowSteps: WorkflowStepInfo[] = WORKFLOW_STEPS.map((step) => {
    const stepsOrder: WorkflowStepId[] = WORKFLOW_STEPS.map((s) => s.id);
    const currentIdx = stepsOrder.indexOf(courseState.currentStep);
    const stepIdx = stepsOrder.indexOf(step.id);
    if (stepIdx < currentIdx) return { ...step, status: 'completed' as const };
    if (stepIdx === currentIdx) return { ...step, status: 'current' as const };
    return { ...step, status: 'pending' as const };
  });

  const overallProgress = useMemo(() => {
    const values = Object.values(courseState.completionPercentages);
    return Math.round(values.reduce((s, v) => s + v, 0) / values.length);
  }, [courseState.completionPercentages]);

  // ============ Step Navigation ============
  const goToStep = (stepId: WorkflowStepId) => {
    setCourseState((prev) => ({ ...prev, currentStep: stepId }));
  };

  const goNext = () => {
    const steps = WORKFLOW_STEPS.map((s) => s.id);
    const currentIdx = steps.indexOf(courseState.currentStep);
    if (currentIdx < steps.length - 1) goToStep(steps[currentIdx + 1]);
  };

  const goPrev = () => {
    const steps = WORKFLOW_STEPS.map((s) => s.id);
    const currentIdx = steps.indexOf(courseState.currentStep);
    if (currentIdx > 0) goToStep(steps[currentIdx - 1]);
  };

  const handleSave = () => {
    localStorage.setItem(`course-${courseState.id}`, JSON.stringify(courseState));
    setCourseState((prev) => ({
      ...prev,
      completionPercentages: {
        ...prev.completionPercentages,
        [prev.currentStep]: Math.min(100, (prev.completionPercentages[prev.currentStep] || 0) + 10),
      },
    }));
  };

  // ============ CSV Download Template ============
  const handleDownloadTemplate = useCallback(() => {
    const header = 'Academic Year,Year,Semester,Course Code,Course Name,Faculty Name,Course Type,Lecture Hours (CI),Theory Hours (CI),Practical Hours (PI),Team Work Hours (TW),Self Learning Hours (SL),Status';
    const sampleRows = [
      `${selectedAcademicYear},${selectedYear},${selectedSemester},CS501,Machine Learning,Dr. Anita Sharma,Theory,3,0,0,1,2,Active`,
      `${selectedAcademicYear},${selectedYear},${selectedSemester},CS501L,Machine Learning Lab,Dr. Rajesh Kumar,Lab,0,0,3,0,1,Active`,
    ];
    const csv = [header, ...sampleRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `courses_template_${selectedAcademicYear}_${selectedYear.replace(' ', '_')}_${selectedSemester.replace(' ', '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedAcademicYear, selectedYear, selectedSemester]);

  // ============ CSV Upload ============
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter((line) => line.trim());
        const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));

        const parsed: CourseRecord[] = [];
        let validCount = 0;
        let invalidCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => {
            row[h] = values[idx] || '';
          });

          const errors: string[] = [];

          // Validation
          if (!row['Course Code']) errors.push('Course Code is mandatory');
          if (!row['Course Name']) errors.push('Course Name is mandatory');
          if (!row['Faculty Name']) errors.push('Faculty Name is mandatory');
          if (row['Course Type'] && !COURSE_TYPES.includes(row['Course Type'])) {
            errors.push(`Course Type "${row['Course Type']}" must be one of: ${COURSE_TYPES.join(', ')}`);
          }

          const yearVal = row['Year'] || selectedYear;
          const semVal = row['Semester'] || selectedSemester;
          const acYearVal = row['Academic Year'] || selectedAcademicYear;
          if (!YEARS_OF_STUDY.includes(yearVal)) errors.push(`Year "${yearVal}" is not valid`);

          const lectureHrs = parseFloat(row['Lecture Hours (CI)'] || row['Lecture Hours'] || '0');
          const theoryHrs = parseFloat(row['Theory Hours (CI)'] || row['Theory Hours'] || '0');
          const practicalHrs = parseFloat(row['Practical Hours (PI)'] || row['Practical Hours'] || '0');
          const twHrs = parseFloat(row['Team Work Hours (TW)'] || row['Team Work Hours'] || '0');
          const slHrs = parseFloat(row['Self Learning Hours (SL)'] || row['Self Learning Hours'] || '0');

          const metrics = calculateCourseMetrics(lectureHrs, theoryHrs, practicalHrs, twHrs, slHrs);

          const courseRecord: CourseRecord = {
            id: `course-${Date.now()}-${i}`,
            department: DEPARTMENTS[0],
            year: yearVal,
            semester: semVal,
            academicYear: acYearVal,
            courseCode: row['Course Code'] || '',
            courseName: row['Course Name'] || '',
            facultyName: row['Faculty Name'] || '',
            courseType: row['Course Type'] || 'Theory',
            lectureHours: lectureHrs,
            theoryHours: theoryHrs,
            practicalHours: practicalHrs,
            teamWorkHours: twHrs,
            selfLearningHours: slHrs,
            ciHours: metrics.ciHours,
            piHours: metrics.piHours,
            totalHours: metrics.totalHours,
            credits: metrics.credits,
            status: row['Status'] || 'Active',
            progress: 0,
            courseFileUploaded: false,
            cosGenerated: false,
            coPoMapped: false,
            coPsoMapped: false,
            marksUploaded: false,
            coAttainmentCalculated: false,
            poAttainmentCalculated: false,
            nbaReady: false,
            validationStatus: errors.length > 0 ? 'invalid' : 'valid',
            errors: errors.length > 0 ? errors : undefined,
          };

          if (errors.length > 0) invalidCount++;
          else validCount++;

          parsed.push(courseRecord);
        }

        // Add valid records to courses
        const validCourses = parsed.filter((c) => c.validationStatus === 'valid');
        if (validCourses.length > 0) {
          setCourses((prev) => [...prev, ...validCourses]);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 4000);
        }
      };
      reader.readAsText(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [selectedAcademicYear, selectedYear, selectedSemester]
  );

  // ============ Delete Course ============
  const handleDeleteCourse = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // ============ Open Course Workspace ============
  const openCourse = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      const saved = localStorage.getItem(`course-${courseId}`);
      if (saved) {
        setCourseState(JSON.parse(saved));
      } else {
        const newState = createInitialState();
        newState.id = courseId;
        newState.details = {
          ...newState.details,
          department: course.department,
          regulation: 'R22',
          courseCode: course.courseCode,
          courseName: course.courseName,
          facultyName: course.facultyName,
          semester: course.semester,
          year: course.year,
          credits: course.credits,
          lectureHours: course.lectureHours,
          tutorialHours: course.theoryHours,
          practicalHours: course.practicalHours,
          ciHours: course.ciHours,
          piHours: course.piHours,
          teamWorkHours: course.teamWorkHours,
          selfLearningHours: course.selfLearningHours,
          totalHours: course.totalHours,
          courseType: (['Theory', 'Lab', 'Project'].includes(course.courseType) ? course.courseType : 'Theory') as 'Theory' | 'Lab' | 'Project',
        };
        setCourseState(newState);
      }
    }
    setSelectedCourseId(courseId);
    setIsExistingCourse(true);
    setView('workspace');
  };

  const availableSemesters = SEMESTERS_MAP[selectedYear] || [];

  // ============ DASHBOARD VIEW ============
  if (view === 'dashboard') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Course Repository</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Outcome Based Education (OBE) workflow for every course</p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setCourseState(createInitialState());
              setSelectedCourseId(null);
              setIsExistingCourse(false);
              setView('workspace');
            }}
            className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700"
          >
            <Plus className="h-4 w-4" />
            New Course
          </Button>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Card className="border-border/50">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground font-medium">Total Courses</p>
              <p className="text-xl font-bold text-indigo-600">{metrics.totalCourses}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground font-medium">Course File</p>
              <p className="text-xl font-bold text-emerald-600">{metrics.coursesWithFile}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground font-medium">COs Generated</p>
              <p className="text-xl font-bold text-blue-600">{metrics.coursesWithCOs}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground font-medium">CO-PO Mapped</p>
              <p className="text-xl font-bold text-purple-600">{metrics.coursesWithCOPOMapping}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground font-medium">CO-PSO Mapped</p>
              <p className="text-xl font-bold text-violet-600">{metrics.coursesWithCOPSOMapping}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground font-medium">Marks Uploaded</p>
              <p className="text-xl font-bold text-amber-600">{metrics.coursesWithMarks}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground font-medium">CO Attainment</p>
              <p className="text-xl font-bold text-orange-600">{metrics.coursesWithCOAttainment}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground font-medium">PO Attainment</p>
              <p className="text-xl font-bold text-rose-600">{metrics.coursesWithPOAttainment}</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-green-500/10">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground font-medium">NBA Ready</p>
              <p className="text-xl font-bold text-emerald-600">{metrics.nbaReadyCourses}</p>
            </CardContent>
          </Card>
          <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 to-purple-500/10">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground font-medium">Readiness</p>
              <p className="text-xl font-bold text-indigo-600">{metrics.departmentReadiness}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="border-border/50 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">Course Completion Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Course File Uploaded', value: metrics.coursesWithFile, total: metrics.totalCourses, color: 'bg-emerald-500' },
                { label: 'COs Generated', value: metrics.coursesWithCOs, total: metrics.totalCourses, color: 'bg-blue-500' },
                { label: 'CO-PO Mapping', value: metrics.coursesWithCOPOMapping, total: metrics.totalCourses, color: 'bg-purple-500' },
                { label: 'CO Attainment', value: metrics.coursesWithCOAttainment, total: metrics.totalCourses, color: 'bg-orange-500' },
                { label: 'NBA Ready', value: metrics.nbaReadyCourses, total: metrics.totalCourses, color: 'bg-emerald-600' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-[10px] font-medium w-36">{item.label}</span>
                  <Progress value={(item.value / Math.max(item.total, 1)) * 100} className="flex-1 h-2" />
                  <span className="text-[10px] font-bold w-12 text-right">{item.value}/{item.total}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">Overall Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{metrics.courseCompletion}%</p>
                <p className="text-[9px] text-muted-foreground">Course Completion</p>
                <Progress value={metrics.courseCompletion} className="h-1.5 mt-2" />
              </div>
              <Separator />
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{metrics.evidenceCompletion}%</p>
                <p className="text-[9px] text-muted-foreground">Evidence Completion</p>
                <Progress value={metrics.evidenceCompletion} className="h-1.5 mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">Attainment Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{metrics.attainmentStatus}%</p>
                <p className="text-[9px] text-muted-foreground">Attainment Calculated</p>
                <Progress value={metrics.attainmentStatus} className="h-1.5 mt-2" />
              </div>
              <Separator />
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{metrics.departmentReadiness}%</p>
                <p className="text-[9px] text-muted-foreground">Dept Readiness</p>
                <Progress value={metrics.departmentReadiness} className="h-1.5 mt-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Context Selector Cards - Academic Year / Year / Semester */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative p-4 rounded-xl border border-border/60 bg-gradient-to-br from-slate-900/80 to-slate-800/80 dark:from-slate-800/60 dark:to-slate-900/60 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-blue-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Department</span>
            </div>
            <p className="text-sm font-semibold text-white truncate">{DEPARTMENTS[0]}</p>
          </div>
          <div className="relative p-4 rounded-xl border border-border/60 bg-gradient-to-br from-slate-900/80 to-slate-800/80 dark:from-slate-800/60 dark:to-slate-900/60 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="h-4 w-4 text-purple-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Academic Year</span>
            </div>
            <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
              <SelectTrigger className="h-7 border-0 bg-transparent p-0 text-sm font-semibold text-purple-300 shadow-none focus:ring-0">
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
              <GraduationCap className="h-4 w-4 text-emerald-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Year</span>
            </div>
            <Select value={selectedYear} onValueChange={handleYearChange}>
              <SelectTrigger className="h-7 border-0 bg-transparent p-0 text-sm font-semibold text-emerald-300 shadow-none focus:ring-0">
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
              <SelectTrigger className="h-7 border-0 bg-transparent p-0 text-sm font-semibold text-amber-300 shadow-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableSemesters.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative p-4 rounded-xl border border-border/60 bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 dark:from-indigo-800/40 dark:to-indigo-900/40 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-4 w-4 text-indigo-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Courses</span>
            </div>
            <p className="text-sm font-bold text-indigo-300">
              {semesterStats.total} Courses
            </p>
          </div>
        </div>

        {/* Semester Summary */}
        {semesterStats.total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="border-border/50">
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-indigo-600">{semesterStats.total}</p>
                <p className="text-[10px] text-muted-foreground">Courses</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-emerald-600">{semesterStats.totalCredits}</p>
                <p className="text-[10px] text-muted-foreground">Credits</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-violet-600">{semesterStats.totalContactHours}</p>
                <p className="text-[10px] text-muted-foreground">Contact Hrs</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-blue-600">{semesterStats.theoryCourses}</p>
                <p className="text-[10px] text-muted-foreground">Theory</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-purple-600">{semesterStats.labCourses}</p>
                <p className="text-[10px] text-muted-foreground">Labs</p>
              </CardContent>
            </Card>
          </div>
        )}

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
              <Badge variant="outline" className="text-xs">
                {filteredCourses.length} courses in this semester
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Save Success */}
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
                    <p className="text-sm font-semibold text-green-700">Courses Uploaded Successfully</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      Courses added for {selectedAcademicYear} / {selectedYear} / {selectedSemester}
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
            <SelectTrigger className="w-[140px] h-9 text-sm">
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
        </div>

        {/* Course Table - NBA Format */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-600" />
              Courses — {selectedAcademicYear} / {selectedYear} / {selectedSemester}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">No courses added yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a CSV or click "New Course" to get started
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-xs min-w-[1100px]">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="text-left p-3 font-semibold sticky left-0 bg-muted/30 z-10 w-8">#</th>
                      <th className="text-left p-3 font-semibold">Course Code</th>
                      <th className="text-left p-3 font-semibold">Course Name</th>
                      <th className="text-left p-3 font-semibold">Faculty</th>
                      <th className="text-center p-3 font-semibold">Type</th>
                      <th className="text-center p-3 font-semibold">CI</th>
                      <th className="text-center p-3 font-semibold">PI</th>
                      <th className="text-center p-3 font-semibold">TW</th>
                      <th className="text-center p-3 font-semibold">SL</th>
                      <th className="text-center p-3 font-semibold">Total</th>
                      <th className="text-center p-3 font-semibold">Credits</th>
                      <th className="text-center p-3 font-semibold">Status</th>
                      <th className="text-center p-3 font-semibold">Progress</th>
                      <th className="text-right p-3 font-semibold sticky right-0 bg-muted/30 z-10">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course, idx) => (
                      <tr
                        key={course.id}
                        className="border-t border-border/50 hover:bg-muted/50 cursor-pointer"
                        onClick={() => openCourse(course.id)}
                      >
                        <td className="p-3 text-muted-foreground sticky left-0 bg-background z-10">{idx + 1}</td>
                        <td className="p-3 font-mono font-medium">{course.courseCode}</td>
                        <td className="p-3 font-medium">
                          <button
                            onClick={(e) => { e.stopPropagation(); openCourse(course.id); }}
                            className="text-left hover:text-indigo-600 hover:underline transition-colors"
                          >
                            {course.courseName}
                          </button>
                        </td>
                        <td className="p-3 text-muted-foreground">{course.facultyName || '-'}</td>
                        <td className="p-3 text-center">
                          <Badge variant="outline" className={cn('text-[9px]',
                            course.courseType === 'Theory' ? 'bg-blue-500/10 text-blue-600' :
                            course.courseType === 'Lab' ? 'bg-purple-500/10 text-purple-600' :
                            'bg-teal-500/10 text-teal-600'
                          )}>
                            {course.courseType}
                          </Badge>
                        </td>
                        <td className="p-3 text-center text-blue-600 font-semibold">{course.ciHours}</td>
                        <td className="p-3 text-center text-purple-600 font-semibold">{course.piHours}</td>
                        <td className="p-3 text-center text-emerald-600 font-semibold">{course.teamWorkHours}</td>
                        <td className="p-3 text-center text-amber-600 font-semibold">{course.selfLearningHours}</td>
                        <td className="p-3 text-center font-bold text-rose-600">{course.totalHours}</td>
                        <td className="p-3 text-center">
                          <Badge className="bg-indigo-600 text-white text-[9px] font-bold">{course.credits}</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="outline" className={cn('text-[9px]',
                            course.status === 'Active' && 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                            course.status === 'Inactive' && 'bg-gray-500/10 text-gray-600',
                            course.status === 'Proposed' && 'bg-amber-500/10 text-amber-600',
                          )}>
                            {course.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 justify-center">
                            <Progress value={course.progress} className="h-1.5 w-14" />
                            <span className="text-[9px] font-semibold">{course.progress}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-right sticky right-0 bg-background z-10">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openCourse(course.id); }}>
                              <ArrowRight className="h-3 w-3 text-indigo-600" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={(e) => handleDeleteCourse(course.id, e)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {/* Totals Row */}
                    <tr className="bg-muted/50 border-t-2 font-semibold">
                      <td className="sticky left-0 bg-muted/50 z-10 p-3"></td>
                      <td colSpan={4} className="p-3 text-xs text-right font-bold">SEMESTER TOTALS →</td>
                      <td className="p-3 text-center text-xs font-bold text-blue-700">
                        {filteredCourses.reduce((s, c) => s + c.ciHours, 0)}
                      </td>
                      <td className="p-3 text-center text-xs font-bold text-purple-700">
                        {filteredCourses.reduce((s, c) => s + c.piHours, 0)}
                      </td>
                      <td className="p-3 text-center text-xs font-bold text-emerald-700">
                        {filteredCourses.reduce((s, c) => s + c.teamWorkHours, 0)}
                      </td>
                      <td className="p-3 text-center text-xs font-bold text-amber-700">
                        {filteredCourses.reduce((s, c) => s + c.selfLearningHours, 0)}
                      </td>
                      <td className="p-3 text-center text-xs font-bold text-rose-700">
                        {filteredCourses.reduce((s, c) => s + c.totalHours, 0)}
                      </td>
                      <td className="p-3 text-center">
                        <Badge className="bg-indigo-700 text-white text-[9px] font-bold">
                          {filteredCourses.reduce((s, c) => s + c.credits, 0)}
                        </Badge>
                      </td>
                      <td className="p-3"></td>
                      <td className="sticky right-0 bg-muted/50 z-10 p-3"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============ WORKSPACE VIEW - 12-Step Wizard ============
  const stepComponents: Record<WorkflowStepId, React.ReactNode> = {
    'course-details': (
      <Step1_CourseDetails
        data={courseState.details}
        onUpdate={(details) => setCourseState((prev) => ({ ...prev, details }))}
        onSave={handleSave}
        onNext={goNext}
        completionPercentage={courseState.completionPercentages['course-details']}
        isExistingCourse={isExistingCourse}
      />
    ),
    'upload-course-file': (
      <Step2_UploadCourseFile
        data={courseState.courseFile}
        onUpdate={(file) => setCourseState((prev) => ({ ...prev, courseFile: file }))}
        onSave={handleSave}
        onNext={goNext}
        onPrev={goPrev}
        completionPercentage={courseState.completionPercentages['upload-course-file']}
      />
    ),
    'ai-course-analysis': (
      <Step3_AICourseAnalysis
        courseFile={courseState.courseFile}
        data={courseState.aiAnalysis}
        courseDetails={courseState.details}
        onUpdate={(analysis) => setCourseState((prev) => ({ ...prev, aiAnalysis: analysis }))}
        onSave={handleSave}
        onNext={goNext}
        onPrev={goPrev}
        completionPercentage={courseState.completionPercentages['ai-course-analysis']}
      />
    ),
    'course-outcomes': (
      <Step4_CourseOutcomes
        outcomes={courseState.courseOutcomes}
        aiAnalysis={courseState.aiAnalysis}
        courseName={courseState.details.courseName}
        onUpdate={(outcomes) => setCourseState((prev) => ({ ...prev, courseOutcomes: outcomes }))}
        onSave={handleSave}
        onNext={goNext}
        onPrev={goPrev}
        completionPercentage={courseState.completionPercentages['course-outcomes']}
      />
    ),
    'co-po-mapping': (
      <Step5_COPOMapping
        outcomes={courseState.courseOutcomes}
        mappings={courseState.coPoMapping}
        coverage={courseState.poCoverage}
        courseName={courseState.details.courseName}
        courseContent={courseState.aiAnalysis?.rawCourseContent || ''}
        onUpdate={(mappings, coverage) => setCourseState((prev) => ({ ...prev, coPoMapping: mappings, poCoverage: coverage }))}
        onSave={handleSave}
        onNext={goNext}
        onPrev={goPrev}
        completionPercentage={courseState.completionPercentages['co-po-mapping']}
      />
    ),
    // Step6 (Gap Analysis) and Step7 (Revised CO-PO) are reserved —
    // they will be integrated in a separate section with a different calculation approach
    // 'gap-analysis': (
    //   <Step6_GapAnalysis
    //     outcomes={courseState.courseOutcomes}
    //     coverage={courseState.poCoverage}
    //     data={courseState.gapAnalysis}
    //     courseName={courseState.details.courseName}
    //     courseCode={courseState.details.courseCode}
    //     department={courseState.details.department}
    //     program={courseState.details.program}
    //     regulation={courseState.details.regulation}
    //     onUpdate={(gap) => setCourseState((prev) => ({ ...prev, gapAnalysis: gap }))}
    //     onSave={handleSave}
    //     onNext={goNext}
    //     onPrev={goPrev}
    //     completionPercentage={courseState.completionPercentages['gap-analysis']}
    //   />
    // ),
    // 'revised-co-po-mapping': (
    //   <Step7_RevisedCOPOMapping
    //     outcomes={courseState.courseOutcomes}
    //     mappings={courseState.coPoMapping}
    //     coverage={courseState.poCoverage}
    //     data={courseState.revisedMapping}
    //     gapAnalysis={courseState.gapAnalysis}
    //     courseName={courseState.details.courseName}
    //     onUpdate={(revised) => setCourseState((prev) => ({ ...prev, revisedMapping: revised }))}
    //     onSave={handleSave}
    //     onNext={goNext}
    //     onPrev={goPrev}
    //     completionPercentage={courseState.completionPercentages['revised-co-po-mapping']}
    //   />
    // ),
    'co-pso-mapping': (
      <Step8_COPSOMapping
        outcomes={courseState.courseOutcomes}
        mappings={courseState.coPsoMapping}
        coverage={courseState.psoCoverage}
        onUpdate={(mappings, coverage) => setCourseState((prev) => ({ ...prev, coPsoMapping: mappings, psoCoverage: coverage }))}
        onSave={handleSave}
        onNext={goNext}
        onPrev={goPrev}
        completionPercentage={courseState.completionPercentages['co-pso-mapping']}
      />
    ),
    'assessment-blueprint': (
      <Step9_AssessmentBlueprint
        outcomes={courseState.courseOutcomes}
        data={courseState.assessmentBlueprint}
        onUpdate={(bp) => setCourseState((prev) => ({ ...prev, assessmentBlueprint: bp }))}
        onSave={handleSave}
        onNext={goNext}
        onPrev={goPrev}
        completionPercentage={courseState.completionPercentages['assessment-blueprint']}
        courseDetails={courseState.details}
      />
    ),
    'marks-upload': (
      <Step10_MarksUpload
        blueprint={courseState.assessmentBlueprint}
        data={courseState.marksUploads}
        courseDetails={courseState.details}
        academicYear={selectedAcademicYear}
        onUpdate={(marks) => setCourseState((prev) => ({ ...prev, marksUploads: marks }))}
        onSave={handleSave}
        onNext={goNext}
        onPrev={goPrev}
        completionPercentage={courseState.completionPercentages['marks-upload']}
      />
    ),
    'attainment': (
      <Step11_AttainmentDashboard
        outcomes={courseState.courseOutcomes}
        marks={courseState.marksUploads}
        blueprint={courseState.assessmentBlueprint}
        coPoMappings={courseState.coPoMapping}
        coPsoMappings={courseState.coPsoMapping}
        data={courseState.attainmentResult}
        onUpdate={(result) => setCourseState((prev) => ({ ...prev, attainmentResult: result }))}
        onSave={handleSave}
        onNext={goNext}
        onPrev={goPrev}
        completionPercentage={courseState.completionPercentages['attainment']}
      />
    ),
    'reports': (
      <Step12_Reports
        state={courseState}
        onSave={handleSave}
        onPrev={goPrev}
        completionPercentage={courseState.completionPercentages['reports']}
      />
    ),
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => setView('dashboard')}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Course Dashboard
      </button>

      {/* Workspace Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              {courseState.details.courseName || 'New Course'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {courseState.details.courseCode || 'No Code'} • {courseState.details.semester || 'No Semester'} • {DEPARTMENTS[0]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Overall Progress</p>
            <p className="text-sm font-bold text-indigo-600">{overallProgress}%</p>
          </div>
          <div className="w-20">
            <Progress value={overallProgress} className="h-2" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Progress Stepper */}
      <div className="bg-card rounded-xl border border-border/50 p-3">
        <div className="flex items-center justify-between mb-2 px-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Workflow Steps
          </p>
          <Badge variant="outline" className="text-[9px]">
            Step {workflowSteps.find((s) => s.status === 'current')?.stepNumber || 1} of 10
          </Badge>
        </div>
        <ProgressStepper
          steps={workflowSteps}
          currentStepId={courseState.currentStep}
          onStepClick={(stepId) => {
            const step = workflowSteps.find((s) => s.id === stepId);
            if (step && step.status !== 'pending') goToStep(stepId);
          }}
        />
      </div>

      {/* Step Content */}
      <motion.div
        key={courseState.currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {stepComponents[courseState.currentStep]}
      </motion.div>
    </div>
  );
};

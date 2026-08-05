import { RepositoryTabConfig, KPICard, RepositorySummary, RepositoryMetrics, UploadHistoryRecord, EvidenceDocument, WorkflowStep, ValidationResult, ColumnMapping } from './types';

// Repository Tab Configuration - Metadata-driven architecture
export const academicRepositoryTabs: RepositoryTabConfig[] = [
  {
    id: 'programs',
    label: 'Programs',
    icon: 'GraduationCap',
    fields: [
      { key: 'programName', label: 'Program Name', type: 'text', required: true, csvColumn: 'Program Name' },
      { key: 'programLevel', label: 'Program Level', type: 'select', required: true, csvColumn: 'Program Level' },
      { key: 'specialization', label: 'Specialization', type: 'text', required: true, csvColumn: 'Specialization' },
      { key: 'academicUnit', label: 'Academic Unit', type: 'text', required: true, csvColumn: 'Academic Unit' },
      { key: 'intake', label: 'Intake', type: 'number', required: true, csvColumn: 'Intake' },
      { key: 'duration', label: 'Duration', type: 'text', required: true, csvColumn: 'Duration' },
      { key: 'regulation', label: 'Regulation', type: 'text', required: true, csvColumn: 'Regulation' },
      { key: 'yearStarted', label: 'Year Started', type: 'number', required: true, csvColumn: 'Year Started' },
      { key: 'programStatus', label: 'Program Status', type: 'select', required: true, csvColumn: 'Program Status' },
    ],
    requiredEvidence: ['Approval Letter', 'Program Records', 'AICTE Approval'],
    frameworkMapping: ['NAAC', 'NBA', 'NIRF'],
    templateFile: '/templates/programs_template.csv',
  },
  {
    id: 'curriculum',
    label: 'Curriculum',
    icon: 'BookOpen',
    fields: [
      { key: 'program', label: 'Program', type: 'text', required: true, csvColumn: 'Program' },
      { key: 'academicRegulation', label: 'Academic Regulation', type: 'text', required: true, csvColumn: 'Academic Regulation' },
      { key: 'totalCredits', label: 'Total Credits', type: 'number', required: true, csvColumn: 'Total Credits' },
      { key: 'openElectives', label: 'Open Electives Available', type: 'number', required: true, csvColumn: 'Open Electives Available' },
      { key: 'professionalElectives', label: 'Professional Electives Available', type: 'number', required: true, csvColumn: 'Professional Electives Available' },
      { key: 'vacAvailable', label: 'Value Added Courses Available', type: 'number', required: true, csvColumn: 'Value Added Courses Available' },
      { key: 'internshipIncluded', label: 'Internship Included', type: 'boolean', required: true, csvColumn: 'Internship Included' },
      { key: 'projectWorkIncluded', label: 'Project Work Included', type: 'boolean', required: true, csvColumn: 'Project Work Included' },
      { key: 'industryCoursesIncluded', label: 'Industry Courses Included', type: 'boolean', required: true, csvColumn: 'Industry Courses Included' },
      { key: 'revisionDate', label: 'Revision Date', type: 'date', required: true, csvColumn: 'Revision Date' },
    ],
    requiredEvidence: ['Curriculum Structure', 'Regulation Document', 'BoS Minutes'],
    frameworkMapping: ['NAAC', 'NBA'],
    templateFile: '/templates/curriculum_template.csv',
  },
  {
    id: 'courses',
    label: 'Courses',
    icon: 'FileText',
    fields: [
      { key: 'courseCode', label: 'Course Code', type: 'text', required: true, csvColumn: 'Course Code' },
      { key: 'courseName', label: 'Course Name', type: 'text', required: true, csvColumn: 'Course Name' },
      { key: 'program', label: 'Program', type: 'text', required: true, csvColumn: 'Program' },
      { key: 'semester', label: 'Semester', type: 'number', required: true, csvColumn: 'Semester' },
      { key: 'courseType', label: 'Course Type', type: 'select', required: true, csvColumn: 'Course Type' },
      { key: 'credits', label: 'Credits', type: 'number', required: true, csvColumn: 'Credits' },
      { key: 'theoryHours', label: 'Theory Hours', type: 'number', required: true, csvColumn: 'Theory Hours' },
      { key: 'labHours', label: 'Lab Hours', type: 'number', required: true, csvColumn: 'Lab Hours' },
      { key: 'status', label: 'Status', type: 'select', required: true, csvColumn: 'Status' },
    ],
    requiredEvidence: ['Syllabus', 'Curriculum'],
    frameworkMapping: ['NBA', 'NAAC'],
    templateFile: '/templates/courses_template.csv',
  },
  {
    id: 'academic-calendar',
    label: 'Academic Calendar',
    icon: 'Calendar',
    fields: [
      { key: 'academicYear', label: 'Academic Year', type: 'text', required: true, csvColumn: 'Academic Year' },
      { key: 'semester', label: 'Semester', type: 'text', required: true, csvColumn: 'Semester' },
      { key: 'startDate', label: 'Start Date', type: 'date', required: true, csvColumn: 'Start Date' },
      { key: 'endDate', label: 'End Date', type: 'date', required: true, csvColumn: 'End Date' },
      { key: 'instructionalDays', label: 'Instructional Days', type: 'number', required: true, csvColumn: 'Instructional Days' },
      { key: 'midExamDates', label: 'Mid Exam Start Date', type: 'date', required: true, csvColumn: 'Mid Exam Start Date' },
      { key: 'endExamDates', label: 'End Exam Start Date', type: 'date', required: true, csvColumn: 'End Exam Start Date' },
    ],
    requiredEvidence: ['Academic Calendar PDF'],
    frameworkMapping: ['NAAC', 'NBA'],
    templateFile: '/templates/academic_calendar_template.csv',
  },
  {
    id: 'value-added-courses',
    label: 'Value Added Courses',
    icon: 'Award',
    fields: [
      { key: 'courseName', label: 'Course Name', type: 'text', required: true, csvColumn: 'Course Name' },
      { key: 'conductingUnit', label: 'Conducting Unit', type: 'text', required: true, csvColumn: 'Conducting Unit' },
      { key: 'academicYear', label: 'Academic Year', type: 'text', required: true, csvColumn: 'Academic Year' },
      { key: 'duration', label: 'Duration', type: 'text', required: true, csvColumn: 'Duration' },
      { key: 'studentsEnrolled', label: 'Students Enrolled', type: 'number', required: true, csvColumn: 'Students Enrolled' },
      { key: 'certificationProvided', label: 'Certification Provided', type: 'boolean', required: true, csvColumn: 'Certification Provided' },
    ],
    requiredEvidence: ['Course Brochure', 'Attendance Records', 'Certificates'],
    frameworkMapping: ['NAAC'],
    templateFile: '/templates/value_added_courses_template.csv',
  },
  {
    id: 'add-on-programs',
    label: 'Add-on Programs',
    icon: 'Award',
    fields: [
      { key: 'topic', label: 'Topic', type: 'text', required: true, csvColumn: 'Topic' },
      { key: 'fromDate', label: 'From Date', type: 'text', required: true, csvColumn: 'From Date' },
      { key: 'toDate', label: 'To Date', type: 'text', required: true, csvColumn: 'To Date' },
      { key: 'coordinator', label: 'Coordinator', type: 'text', required: true, csvColumn: 'Coordinator' },
      { key: 'duration', label: 'Duration', type: 'text', required: false, csvColumn: 'Duration' },
      { key: 'studentsEnrolled', label: 'Students Enrolled', type: 'number', required: true, csvColumn: 'Students Enrolled' },
      { key: 'studentsParticipated', label: 'Students Participated', type: 'number', required: true, csvColumn: 'Students Participated' },
      { key: 'certificationProvided', label: 'Certification Provided', type: 'boolean', required: true, csvColumn: 'Certification Provided' },
    ],
    requiredEvidence: ['Program Brochure', 'Attendance Sheets', 'Certificates', 'Feedback Forms'],
    frameworkMapping: ['NAAC'],
    templateFile: '/templates/addon_programs_template.csv',
  },
  {
    id: 'academic-timetable',
    label: 'Academic Timetable',
    icon: 'Clock',
    fields: [
      { key: 'period', label: 'Period', type: 'number', required: true, csvColumn: 'Period' },
      { key: 'day', label: 'Day', type: 'text', required: true, csvColumn: 'Day' },
      { key: 'courseCode', label: 'Course Code', type: 'text', required: true, csvColumn: 'Course Code' },
      { key: 'courseName', label: 'Course Name', type: 'text', required: true, csvColumn: 'Course Name' },
      { key: 'facultyName', label: 'Faculty Name', type: 'text', required: true, csvColumn: 'Faculty Name' },
      { key: 'roomNumber', label: 'Room Number', type: 'text', required: false, csvColumn: 'Room Number' },
    ],
    requiredEvidence: ['Timetable PDF', 'Faculty Workload Statement', 'Room Allocation'],
    frameworkMapping: ['NBA', 'NAAC'],
    templateFile: '/templates/academic_timetable_template.csv',
  },
];

// Mock KPI Data
export const repositoryKPIs: KPICard[] = [
  { id: 'programs', label: 'Programs', totalRecords: 8, completionPercent: 100, verificationStatus: 'verified', lastUpdated: '2025-01-10', trend: 0 },
  { id: 'curriculum', label: 'Curriculum', totalRecords: 8, completionPercent: 87, verificationStatus: 'partial', lastUpdated: '2025-01-08', trend: 12 },
  { id: 'courses', label: 'Courses', totalRecords: 156, completionPercent: 92, verificationStatus: 'partial', lastUpdated: '2025-01-12', trend: 5 },
  { id: 'academic-calendar', label: 'Academic Calendar', totalRecords: 4, completionPercent: 100, verificationStatus: 'verified', lastUpdated: '2025-01-05', trend: 0 },
  { id: 'value-added-courses', label: 'Value Added Courses', totalRecords: 12, completionPercent: 75, verificationStatus: 'pending', lastUpdated: '2025-01-09', trend: 8 },
];

// Mock Repository Summaries per tab
export const repositorySummaries: Record<string, RepositorySummary> = {
  programs: { recordsUploaded: 8, pendingValidation: 0, pendingVerification: 0, verified: 8, approved: 8, rejected: 0, lastUpdated: '2025-01-10 14:30' },
  curriculum: { recordsUploaded: 8, pendingValidation: 1, pendingVerification: 2, verified: 4, approved: 4, rejected: 0, lastUpdated: '2025-01-08 10:15' },
  courses: { recordsUploaded: 156, pendingValidation: 5, pendingVerification: 12, verified: 130, approved: 125, rejected: 4, lastUpdated: '2025-01-12 16:45' },
  'academic-calendar': { recordsUploaded: 4, pendingValidation: 0, pendingVerification: 0, verified: 4, approved: 4, rejected: 0, lastUpdated: '2025-01-05 09:00' },
  'value-added-courses': { recordsUploaded: 12, pendingValidation: 2, pendingVerification: 3, verified: 5, approved: 5, rejected: 1, lastUpdated: '2025-01-09 11:20' },
  'add-on-programs': { recordsUploaded: 6, pendingValidation: 1, pendingVerification: 1, verified: 4, approved: 4, rejected: 0, lastUpdated: '2025-01-11 10:00' },
  'academic-timetable': { recordsUploaded: 24, pendingValidation: 0, pendingVerification: 2, verified: 22, approved: 22, rejected: 0, lastUpdated: '2025-01-12 09:30' },
};

// Mock Metrics
export const repositoryMetrics: RepositoryMetrics = {
  dataCompleteness: 86,
  evidenceCompleteness: 72,
  verificationPercent: 78,
  readinessScore: 79,
};

// Mock Upload History
export const uploadHistoryData: UploadHistoryRecord[] = [
  { id: '1', fileName: 'programs_cse_2025.csv', tab: 'Programs', uploadedAt: '2025-01-10 14:30', recordsCount: 8, validRecords: 8, invalidRecords: 0, status: 'approved', uploadedBy: 'Dr. Anita Sharma' },
  { id: '2', fileName: 'courses_sem1_2025.csv', tab: 'Courses', uploadedAt: '2025-01-12 16:45', recordsCount: 42, validRecords: 40, invalidRecords: 2, status: 'approved', uploadedBy: 'Prof. Meera Patel' },
  { id: '3', fileName: 'curriculum_r2022.csv', tab: 'Curriculum', uploadedAt: '2025-01-08 10:15', recordsCount: 8, validRecords: 7, invalidRecords: 1, status: 'pending', uploadedBy: 'Dr. Rajesh Kumar' },
  { id: '4', fileName: 'vac_2025_26.csv', tab: 'Value Added Courses', uploadedAt: '2025-01-09 11:20', recordsCount: 12, validRecords: 11, invalidRecords: 1, status: 'approved', uploadedBy: 'Prof. Vikram Singh' },
  { id: '6', fileName: 'academic_calendar_2025_26.csv', tab: 'Academic Calendar', uploadedAt: '2025-01-05 09:00', recordsCount: 4, validRecords: 4, invalidRecords: 0, status: 'approved', uploadedBy: 'Dr. Suresh Nair' },
  { id: '7', fileName: 'addon_programs_2025.csv', tab: 'Add-on Programs', uploadedAt: '2025-01-11 10:00', recordsCount: 6, validRecords: 5, invalidRecords: 1, status: 'pending', uploadedBy: 'Prof. Meera Patel' },
  { id: '8', fileName: 'timetable_sem2_2025.csv', tab: 'Academic Timetable', uploadedAt: '2025-01-12 09:30', recordsCount: 24, validRecords: 24, invalidRecords: 0, status: 'approved', uploadedBy: 'Dr. Suresh Nair' },
];

// Mock Evidence Documents
export const evidenceDocuments: EvidenceDocument[] = [
  { id: '1', name: 'AICTE Approval Letter 2025-26.pdf', category: 'Programs', version: 'v1.0', uploadedBy: 'Dr. Anita Sharma', uploadedDate: '2025-01-08', status: 'verified', fileType: 'pdf', size: '2.4 MB' },
  { id: '2', name: 'BoS Minutes Dec 2024.pdf', category: 'Curriculum', version: 'v1.0', uploadedBy: 'Dr. Rajesh Kumar', uploadedDate: '2025-01-06', status: 'verified', fileType: 'pdf', size: '1.8 MB' },
  { id: '3', name: 'Curriculum Structure R2022.xlsx', category: 'Curriculum', version: 'v2.1', uploadedBy: 'Prof. Meera Patel', uploadedDate: '2025-01-07', status: 'pending', fileType: 'xlsx', size: '890 KB' },
  { id: '4', name: 'Academic Calendar 2025-26.pdf', category: 'Academic Calendar', version: 'v1.0', uploadedBy: 'Dr. Suresh Nair', uploadedDate: '2025-01-05', status: 'verified', fileType: 'pdf', size: '1.2 MB' },
  { id: '5', name: 'VAC Certificates Bundle.zip', category: 'Value Added Courses', version: 'v1.0', uploadedBy: 'Prof. Vikram Singh', uploadedDate: '2025-01-09', status: 'pending', fileType: 'zip', size: '15.6 MB' },
  { id: '6', name: 'Add-on Brochure IoT Workshop.pdf', category: 'Add-on Programs', version: 'v1.0', uploadedBy: 'Prof. Meera Patel', uploadedDate: '2025-01-11', status: 'verified', fileType: 'pdf', size: '1.1 MB' },
  { id: '7', name: 'Add-on Attendance Sheets.zip', category: 'Add-on Programs', version: 'v1.0', uploadedBy: 'Prof. Meera Patel', uploadedDate: '2025-01-11', status: 'pending', fileType: 'zip', size: '4.3 MB' },
  { id: '8', name: 'Timetable Sem II 2025-26.pdf', category: 'Academic Timetable', version: 'v2.0', uploadedBy: 'Dr. Suresh Nair', uploadedDate: '2025-01-12', status: 'verified', fileType: 'pdf', size: '2.2 MB' },
  { id: '9', name: 'Faculty Workload Statement.xlsx', category: 'Academic Timetable', version: 'v1.0', uploadedBy: 'Dr. Suresh Nair', uploadedDate: '2025-01-12', status: 'pending', fileType: 'xlsx', size: '890 KB' },
];

// Mock Workflow Steps
export const workflowSteps: WorkflowStep[] = [
  { id: 'draft', label: 'Draft', status: 'completed', timestamp: '2025-01-05 09:00', actor: 'System' },
  { id: 'submitted', label: 'Submitted', status: 'completed', timestamp: '2025-01-05 14:30', actor: 'Dr. Anita Sharma' },
  { id: 'validated', label: 'Validated', status: 'completed', timestamp: '2025-01-06 10:00', actor: 'System' },
  { id: 'evidence-pending', label: 'Evidence Pending', status: 'completed', timestamp: '2025-01-07 11:00', actor: 'System' },
  { id: 'verified', label: 'Verified', status: 'current', timestamp: '2025-01-10 16:00', actor: 'IQAC Coordinator' },
  { id: 'approved', label: 'Approved', status: 'pending' },
  { id: 'rejected', label: 'Rejected', status: 'pending' },
];

// Mock Validation Results
export const mockValidationResult: ValidationResult = {
  totalRows: 42,
  validRows: 40,
  invalidRows: 2,
  warnings: 3,
  errors: [
    { row: 15, column: 'Credits', value: 'abc', message: 'Expected numeric value for Credits', severity: 'error' },
    { row: 28, column: 'Course Code', value: '', message: 'Required field "Course Code" is empty', severity: 'error' },
    { row: 8, column: 'Theory Hours', value: '0', message: 'Theory Hours is 0 - please verify', severity: 'warning' },
    { row: 22, column: 'Status', value: 'Inactive', message: 'Unusual status value detected', severity: 'warning' },
    { row: 35, column: 'Lab Hours', value: '10', message: 'Lab Hours exceeds typical range', severity: 'warning' },
  ],
};

// Mock Column Mappings for auto-detect
export const mockColumnMappings: ColumnMapping[] = [
  { csvColumn: 'Program Title', mappedField: 'Program Name', confidence: 92, status: 'auto' },
  { csvColumn: 'Level', mappedField: 'Program Level', confidence: 88, status: 'auto' },
  { csvColumn: 'Specialization', mappedField: 'Specialization', confidence: 100, status: 'auto' },
  { csvColumn: 'Department', mappedField: 'Academic Unit', confidence: 75, status: 'auto' },
  { csvColumn: 'Seats', mappedField: 'Intake', confidence: 70, status: 'manual' },
  { csvColumn: 'Duration', mappedField: 'Duration', confidence: 100, status: 'auto' },
];

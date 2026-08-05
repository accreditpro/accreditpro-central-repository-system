import { ModuleConfig, DocumentFolder } from './types';

export const examinationScheduleConfig: ModuleConfig = {
  id: 'examination-schedules',
  label: 'Examination Schedules',
  icon: 'Calendar',
  description: 'Maintain official examination schedules published by the institution as accreditation evidence.',
  fields: [
    { key: 'academicYear', label: 'Academic Year', type: 'text', required: true, placeholder: 'e.g. 2024-25' },
    { key: 'semester', label: 'Semester', type: 'select', required: true, options: ['1', '2', '3', '4', '5', '6', '7', '8'] },
    { key: 'examinationType', label: 'Examination Type', type: 'select', required: true, options: ['Internal Assessment', 'End Semester Examination', 'Supplementary Examination'] },
    { key: 'program', label: 'Program', type: 'text', required: true, placeholder: 'e.g. B.Tech CSE AI R22' },
    { key: 'department', label: 'Department (Optional)', type: 'text', placeholder: 'e.g. Computer Science' },
    { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'e.g. End Semester Examination - Even Sem 2024' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Brief description of the schedule' },
    { key: 'startDate', label: 'Start Date', type: 'date', required: true },
    { key: 'endDate', label: 'End Date', type: 'date', required: true },
    { key: 'status', label: 'Status', type: 'select', required: true, options: ['Draft', 'Published', 'Archived'] },
  ],
  sampleData: [
    { academicYear: '2024-25', semester: '4', examinationType: 'End Semester Examination', program: 'B.Tech CSE AI R22', department: 'Computer Science', title: 'End Semester Examination - Even Sem 2024', description: 'Regular end semester exams for even semester', startDate: '2024-12-02', endDate: '2024-12-20', status: 'Published' },
    { academicYear: '2024-25', semester: '3', examinationType: 'Internal Assessment', program: 'B.Tech CSE AI R22', department: 'Computer Science', title: 'Mid-Term 1 - Odd Sem 2024', description: 'First mid-term examinations', startDate: '2024-08-15', endDate: '2024-08-20', status: 'Published' },
    { academicYear: '2024-25', semester: '4', examinationType: 'Supplementary Examination', program: 'B.Tech CSE AI R22', department: 'Computer Science', title: 'Supplementary Exam - Even Sem 2024', description: 'Supplementary exams for backlog students', startDate: '2025-01-10', endDate: '2025-01-20', status: 'Draft' },
    { academicYear: '2023-24', semester: '4', examinationType: 'End Semester Examination', program: 'B.Tech CSE AI R22', department: 'Computer Science', title: 'End Semester Examination - Even Sem 2023', description: 'Regular end semester exams', startDate: '2024-05-10', endDate: '2024-05-30', status: 'Archived' },
  ],
};

export const examinationCircularsConfig: ModuleConfig = {
  id: 'examination-circulars',
  label: 'Examination Circulars',
  icon: 'FileEdit',
  description: 'Maintain all examination-related notifications and circulars.',
  fields: [
    { key: 'circularNumber', label: 'Circular Number', type: 'text', required: true, placeholder: 'e.g. EXAM/CIR/2024/001' },
    { key: 'circularDate', label: 'Circular Date', type: 'date', required: true },
    { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'e.g. Notification for End Semester Examinations' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Detailed description of the circular' },
    { key: 'category', label: 'Category', type: 'select', required: true, options: ['Examination Notification', 'Hall Ticket Notification', 'Practical Examination', 'Evaluation', 'Result Notification', 'Supplementary Notification', 'General Circular'] },
    { key: 'pdf', label: 'PDF Attachment', type: 'file' },
    { key: 'status', label: 'Status', type: 'select', required: true, options: ['Draft', 'Published', 'Archived'] },
  ],
  sampleData: [
    { circularNumber: 'EXAM/CIR/2024/001', circularDate: '2024-11-15', title: 'End Semester Examination Notification - Even Sem 2024', description: 'Official notification regarding the schedule and guidelines', category: 'Examination Notification', status: 'Published' },
    { circularNumber: 'EXAM/CIR/2024/002', circularDate: '2024-11-20', title: 'Hall Ticket Distribution - Even Sem 2024', description: 'Schedule and procedure for hall ticket distribution', category: 'Hall Ticket Notification', status: 'Published' },
    { circularNumber: 'EXAM/CIR/2024/003', circularDate: '2024-12-10', title: 'Evaluation Guidelines for Faculty', description: 'Standard operating procedure for answer script evaluation', category: 'Evaluation', status: 'Draft' },
    { circularNumber: 'EXAM/CIR/2024/004', circularDate: '2024-07-20', title: 'Supplementary Exam Registration Notification', description: 'Registration dates and procedure for supplementary exams', category: 'Supplementary Notification', status: 'Archived' },
  ],
};

export const resultPublicationsConfig: ModuleConfig = {
  id: 'result-publications',
  label: 'Result Publications',
  icon: 'BadgeCheck',
  description: 'Publish institution-level examination results. Upload official result gazettes for accreditation purposes.',
  fields: [
    { key: 'academicYear', label: 'Academic Year', type: 'text', required: true, placeholder: 'e.g. 2024-25' },
    { key: 'semester', label: 'Semester', type: 'select', required: true, options: ['1', '2', '3', '4', '5', '6', '7', '8'] },
    { key: 'examinationType', label: 'Examination Type', type: 'select', required: true, options: ['Internal Assessment', 'End Semester Examination', 'Supplementary Examination'] },
    { key: 'program', label: 'Program', type: 'text', required: true, placeholder: 'e.g. B.Tech CSE AI R22' },
    { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'e.g. End Semester Results - Even Sem 2024' },
    { key: 'publicationDate', label: 'Publication Date', type: 'date', required: true },
    { key: 'totalStudentsAppeared', label: 'Total Students Appeared', type: 'number', placeholder: 'Optional' },
    { key: 'totalStudentsPassed', label: 'Total Students Passed', type: 'number', placeholder: 'Optional' },
    { key: 'passPercentage', label: 'Pass Percentage', type: 'number', placeholder: 'Optional' },
    { key: 'resultGazette', label: 'Result Gazette', type: 'file' },
    { key: 'resultSummary', label: 'Result Summary', type: 'file' },
    { key: 'status', label: 'Status', type: 'select', required: true, options: ['Draft', 'Published', 'Archived'] },
  ],
  sampleData: [
    { academicYear: '2023-24', semester: '4', examinationType: 'End Semester Examination', program: 'B.Tech CSE AI R22', title: 'End Semester Results - Even Sem 2024', publicationDate: '2024-06-15', totalStudentsAppeared: 118, totalStudentsPassed: 100, passPercentage: 85, status: 'Published' },
    { academicYear: '2023-24', semester: '3', examinationType: 'End Semester Examination', program: 'B.Tech CSE AI R22', title: 'End Semester Results - Odd Sem 2023', publicationDate: '2024-01-10', totalStudentsAppeared: 115, totalStudentsPassed: 98, passPercentage: 85, status: 'Published' },
    { academicYear: '2023-24', semester: '4', examinationType: 'Supplementary Examination', program: 'B.Tech CSE AI R22', title: 'Supplementary Results - Even Sem 2024', publicationDate: '2024-08-20', totalStudentsAppeared: 28, totalStudentsPassed: 22, passPercentage: 79, status: 'Published' },
    { academicYear: '2024-25', semester: '3', examinationType: 'Internal Assessment', program: 'B.Tech CSE AI R22', title: 'Mid-Term 1 Results - Odd Sem 2024', publicationDate: '2024-09-01', totalStudentsAppeared: 120, totalStudentsPassed: 115, passPercentage: 96, status: 'Draft' },
  ],
};

export const supplementaryExaminationsConfig: ModuleConfig = {
  id: 'supplementary-examinations',
  label: 'Supplementary Examinations',
  icon: 'Repeat',
  description: 'Maintain supplementary examination information as repository management.',
  fields: [
    { key: 'academicYear', label: 'Academic Year', type: 'text', required: true, placeholder: 'e.g. 2024-25' },
    { key: 'semester', label: 'Semester', type: 'select', required: true, options: ['1', '2', '3', '4', '5', '6', '7', '8'] },
    { key: 'program', label: 'Program', type: 'text', required: true, placeholder: 'e.g. B.Tech CSE AI R22' },
    { key: 'examinationName', label: 'Examination Name', type: 'text', required: true, placeholder: 'e.g. Supplementary Exam - Even Sem 2024' },
    { key: 'startDate', label: 'Start Date', type: 'date', required: true },
    { key: 'endDate', label: 'End Date', type: 'date', required: true },
    { key: 'notification', label: 'Notification', type: 'file' },
    { key: 'schedule', label: 'Schedule', type: 'file' },
    { key: 'status', label: 'Status', type: 'select', required: true, options: ['Draft', 'Published', 'Archived'] },
  ],
  sampleData: [
    { academicYear: '2023-24', semester: '4', program: 'B.Tech CSE AI R22', examinationName: 'Supplementary Examination - Even Sem 2024', startDate: '2024-07-15', endDate: '2024-07-25', status: 'Published' },
    { academicYear: '2023-24', semester: '3', program: 'B.Tech CSE AI R22', examinationName: 'Supplementary Examination - Odd Sem 2023', startDate: '2024-02-10', endDate: '2024-02-20', status: 'Published' },
    { academicYear: '2024-25', semester: '4', program: 'B.Tech CSE AI R22', examinationName: 'Supplementary Examination - Even Sem 2025', startDate: '2025-01-15', endDate: '2025-01-25', status: 'Draft' },
    { academicYear: '2022-23', semester: '8', program: 'B.Tech CSE AI R18', examinationName: 'Supplementary Examination - Even Sem 2023', startDate: '2023-07-10', endDate: '2023-07-20', status: 'Archived' },
  ],
};

export const backlogRepositoryConfig: ModuleConfig = {
  id: 'backlog-repository',
  label: 'Backlog Repository',
  icon: 'AlertTriangle',
  description: 'Maintain institution-level backlog information required for accreditation reports.',
  fields: [
    { key: 'academicYear', label: 'Academic Year', type: 'text', required: true, placeholder: 'e.g. 2024-25' },
    { key: 'semester', label: 'Semester', type: 'select', required: true, options: ['1', '2', '3', '4', '5', '6', '7', '8'] },
    { key: 'program', label: 'Program', type: 'text', required: true, placeholder: 'e.g. B.Tech CSE AI R22' },
    { key: 'department', label: 'Department', type: 'text', required: true, placeholder: 'e.g. Computer Science' },
    { key: 'subjectCode', label: 'Subject Code', type: 'text', required: true, placeholder: 'e.g. CS401' },
    { key: 'subjectName', label: 'Subject Name', type: 'text', required: true, placeholder: 'e.g. Machine Learning' },
    { key: 'studentsAppeared', label: 'Students Appeared', type: 'number', required: true },
    { key: 'studentsPassed', label: 'Students Passed', type: 'number', required: true },
    { key: 'studentsFailed', label: 'Students Failed', type: 'number', required: true },
  ],
  sampleData: [
    { academicYear: '2023-24', semester: '4', program: 'B.Tech CSE AI R22', department: 'Computer Science', subjectCode: 'CS401', subjectName: 'Machine Learning', studentsAppeared: 28, studentsPassed: 22, studentsFailed: 6 },
    { academicYear: '2023-24', semester: '4', program: 'B.Tech CSE AI R22', department: 'Computer Science', subjectCode: 'CS402', subjectName: 'Database Systems', studentsAppeared: 35, studentsPassed: 28, studentsFailed: 7 },
    { academicYear: '2023-24', semester: '4', program: 'B.Tech CSE AI R22', department: 'Computer Science', subjectCode: 'CS403', subjectName: 'Computer Networks', studentsAppeared: 25, studentsPassed: 20, studentsFailed: 5 },
    { academicYear: '2023-24', semester: '3', program: 'B.Tech CSE AI R22', department: 'Computer Science', subjectCode: 'CS301', subjectName: 'Data Structures', studentsAppeared: 30, studentsPassed: 18, studentsFailed: 12 },
    { academicYear: '2024-25', semester: '4', program: 'B.Tech CSE AI R22', department: 'Computer Science', subjectCode: 'CS404', subjectName: 'Software Engineering', studentsAppeared: 15, studentsPassed: 12, studentsFailed: 3 },
    { academicYear: '2023-24', semester: '4', program: 'B.Tech ECE VLSI R22', department: 'Electronics', subjectCode: 'EC401', subjectName: 'VLSI Design', studentsAppeared: 20, studentsPassed: 16, studentsFailed: 4 },
  ],
};

export const allModuleConfigs: ModuleConfig[] = [
  examinationScheduleConfig,
  examinationCircularsConfig,
  resultPublicationsConfig,
  supplementaryExaminationsConfig,
  backlogRepositoryConfig,
];

export const documentFolders: DocumentFolder[] = [
  {
    id: 'examination-policy', category: 'examination-policy', label: 'Examination Policy', description: 'Institutional examination policies and guidelines', documentCount: 3, documents: [
      { id: 'doc-1', category: 'examination-policy', title: 'Examination Policy 2024', description: 'Comprehensive examination policy document approved by Academic Council', academicYear: '2024-25', tags: ['policy', 'examination', 'guidelines'], version: '2.1', uploadedAt: '2024-06-01' },
      { id: 'doc-2', category: 'examination-policy', title: 'Anti-Malpractice Policy', description: 'Policy document on malpractice prevention and disciplinary actions', academicYear: '2024-25', tags: ['malpractice', 'disciplinary', 'policy'], version: '1.0', uploadedAt: '2024-06-01' },
      { id: 'doc-3', category: 'examination-policy', title: 'Revaluation Policy', description: 'Answer script revaluation and challenge procedure', academicYear: '2024-25', tags: ['revaluation', 'challenge', 'policy'], version: '1.2', uploadedAt: '2024-06-01' },
    ],
  },
  {
    id: 'examination-manual', category: 'examination-manual', label: 'Examination Manual', description: 'Examination conduct manuals and SOPs', documentCount: 2, documents: [
      { id: 'doc-4', category: 'examination-manual', title: 'Examination Conduct Manual', description: 'Standard operating procedures for conducting examinations', academicYear: '2024-25', tags: ['manual', 'sop', 'conduct'], version: '3.0', uploadedAt: '2024-06-15' },
      { id: 'doc-5', category: 'examination-manual', title: 'Invigilation Duty Manual', description: 'Roles and responsibilities of invigilators', academicYear: '2024-25', tags: ['invigilation', 'manual', 'duty'], version: '1.1', uploadedAt: '2024-06-15' },
    ],
  },
  {
    id: 'circulars', category: 'circulars', label: 'Circulars', description: 'All examination circulars and notifications archive', documentCount: 12, documents: [
      { id: 'doc-6', category: 'circulars', title: 'Circular - End Semester Exam Notification 2024', description: 'Official circular announcing end semester examination schedule', academicYear: '2024-25', tags: ['circular', 'notification', 'exam'], version: '1.0', uploadedAt: '2024-11-15' },
    ],
  },
  {
    id: 'notifications', category: 'notifications', label: 'Notifications', description: 'Examination notifications and public notices', documentCount: 8, documents: [
      { id: 'doc-7', category: 'notifications', title: 'Hall Ticket Issue Notification', description: 'Notification regarding hall ticket distribution schedule', academicYear: '2024-25', tags: ['hall-ticket', 'notification'], version: '1.0', uploadedAt: '2024-11-20' },
    ],
  },
  {
    id: 'schedules', category: 'schedules', label: 'Schedules', description: 'Examination schedules and timetables archive', documentCount: 6, documents: [
      { id: 'doc-8', category: 'schedules', title: 'End Semester Exam Schedule - Even Sem 2024', description: 'Detailed timetable for end semester examinations', academicYear: '2024-25', tags: ['schedule', 'timetable', 'exam'], version: '1.0', uploadedAt: '2024-11-25' },
    ],
  },
  {
    id: 'result-gazettes', category: 'result-gazettes', label: 'Result Gazettes', description: 'Published result gazettes and summaries', documentCount: 4, documents: [
      { id: 'doc-9', category: 'result-gazettes', title: 'Result Gazette - Even Sem 2024', description: 'Official result gazette for end semester examinations', academicYear: '2023-24', tags: ['result', 'gazette', 'semester'], version: '1.0', uploadedAt: '2024-06-20' },
    ],
  },
  {
    id: 'university-communications', category: 'university-communications', label: 'University Communications', description: 'Communications from affiliated university', documentCount: 10, documents: [
      { id: 'doc-10', category: 'university-communications', title: 'University Guidelines - Examination Reforms', description: 'Guidance on examination reforms from the university', academicYear: '2024-25', tags: ['university', 'guidelines', 'reforms'], version: '1.0', uploadedAt: '2024-08-01' },
    ],
  },
  {
    id: 'committee-meeting-minutes', category: 'committee-meeting-minutes', label: 'Committee Meeting Minutes', description: 'Examination committee meeting minutes', documentCount: 5, documents: [
      { id: 'doc-11', category: 'committee-meeting-minutes', title: 'Examination Committee Meeting - Jul 2024', description: 'Minutes of the examination committee meeting held in July 2024', academicYear: '2024-25', tags: ['committee', 'meeting', 'minutes'], version: '1.0', uploadedAt: '2024-07-30' },
    ],
  },
  {
    id: 'other-supporting-documents', category: 'other-supporting-documents', label: 'Other Supporting Documents', description: 'Miscellaneous examination-related documents', documentCount: 7, documents: [
      { id: 'doc-12', category: 'other-supporting-documents', title: 'NAAC SSR - Examination Criteria', description: 'Examination-related evidence for NAAC self-study report', academicYear: '2024-25', tags: ['naac', 'ssr', 'evidence'], version: '1.0', uploadedAt: '2024-09-15' },
    ],
  },
];

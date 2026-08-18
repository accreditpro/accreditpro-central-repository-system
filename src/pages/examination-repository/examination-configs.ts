import { ModuleConfig } from './types';

export const examinationScheduleConfig: ModuleConfig = {
  id: 'examination-schedules',
  label: 'Examination Schedules',
  icon: 'Calendar',
  description: 'Maintain official examination schedules published by the institution as accreditation evidence.',
  fields: [
    {
      key: 'academicYear',
      label: 'Academic Year',
      type: 'text',
      required: true,
      // Academic year is always taken from the currently selected year —
      // it is displayed but cannot be edited (neither on create nor edit).
      readOnly: true,
      placeholder: 'e.g. 2024-25',
    },
    { key: 'semester', label: 'Semester', type: 'select', required: true, options: ['1', '2', '3', '4', '5', '6', '7', '8'] },
    { key: 'examinationType', label: 'Examination Type', type: 'select', required: true, options: ['Internal Assessment', 'End Semester Examination', 'Supplementary Examination'] },
    // Program/department are autofetched from the institution's reference data
    // so the backend can resolve program_id / department_id.
    { key: 'program', label: 'Program', type: 'text', required: true, placeholder: 'Select a program', autofetch: 'programs' },
    { key: 'department', label: 'Department (Optional)', type: 'text', placeholder: 'Select a department', autofetch: 'departments' },
    { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'e.g. End Semester Examination - Even Sem 2024' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Brief description of the schedule' },
    { key: 'startDate', label: 'Start Date', type: 'date', required: true },
    { key: 'startTime', label: 'Start Time', type: 'time', required: true },
    { key: 'endDate', label: 'End Date', type: 'date', required: true },
    { key: 'endTime', label: 'End Time', type: 'time', required: true },
    { key: 'status', label: 'Status', type: 'select', required: true, options: ['Draft', 'Published', 'Archived'] },
  ],
  // Date fields render with their sibling time below (startDate + startTime,
  // endDate + endTime) so the exam period is visible at a glance.
  tableFields: ['academicYear', 'semester', 'examinationType', 'program', 'department', 'startDate', 'endDate', 'status'],
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
  // The list stays minimal — full details (incl. document management) are
  // available in the preview and edit dialogs.
  tableFields: ['circularNumber', 'circularDate', 'category', 'status'],
};


export const resultPublicationsConfig: ModuleConfig = {
  id: 'result-publications',
  label: 'Result Publications',
  icon: 'BadgeCheck',
  description: 'Publish institution-level examination results. Upload official result gazettes for accreditation purposes.',
  fields: [
    {
      key: 'academicYear',
      label: 'Academic Year',
      type: 'text',
      required: true,
      // Academic year is always taken from the currently selected year —
      // it is displayed but cannot be edited (neither on create nor edit).
      readOnly: true,
      placeholder: 'e.g. 2024-25',
    },
    { key: 'semester', label: 'Semester', type: 'select', required: true, options: ['1', '2', '3', '4', '5', '6', '7', '8'] },
    { key: 'examinationType', label: 'Examination Type', type: 'select', required: true, options: ['Internal Assessment', 'End Semester Examination', 'Supplementary Examination'] },
    // Program is autofetched from the institution's reference data so the
    // user picks a real program (enables backend program_id resolution).
    { key: 'program', label: 'Program', type: 'text', required: true, placeholder: 'Select a program', autofetch: 'programs' },
    { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'e.g. End Semester Results - Even Sem 2024' },
    { key: 'publicationDate', label: 'Publication Date', type: 'date', required: true },
    {
      key: 'totalStudentsAppeared',
      label: 'Total Students Appeared',
      // Short header label keeps the list compact.
      tableLabel: 'Appeared',
      type: 'number',
      placeholder: 'Optional',
    },
    {
      key: 'totalStudentsPassed',
      label: 'Total Students Passed',
      tableLabel: 'Passed',
      type: 'number',
      placeholder: 'Optional',
    },
    // Auto-calculated from Total Students Passed / Total Students Appeared * 100
    // and rendered read-only in the form.
    {
      key: 'passPercentage',
      label: 'Pass Percentage',
      tableLabel: 'Pass %',
      type: 'number',
      readOnly: true,
      autoCalculateFrom: ['totalStudentsPassed', 'totalStudentsAppeared'],
      readOnlyHint: 'Auto-calculated from students passed / appeared',
      placeholder: 'Auto-calculated',
      // Color-coded progress bar in the list (green ≥ 75, amber ≥ 50, red < 50).
      progress: true,
    },
    { key: 'resultGazette', label: 'Result Gazette', type: 'file' },
    { key: 'resultSummary', label: 'Result Summary', type: 'file' },
    { key: 'status', label: 'Status', type: 'select', required: true, options: ['Draft', 'Published', 'Archived'] },
  ],
  // List shows the key result figures — full details are in the preview dialog.
  // Title is included (truncated) as the main record identifier.
  tableFields: [
    'academicYear',
    'examinationType',
    'program',
    'title',
    'publicationDate',
    'totalStudentsAppeared',
    'totalStudentsPassed',
    'passPercentage',
    'status',
  ],
};


export const supplementaryExaminationsConfig: ModuleConfig = {
  id: 'supplementary-examinations',
  label: 'Supplementary Examinations',
  icon: 'Repeat',
  description: 'Maintain supplementary examination information as repository management.',
  fields: [
    {
      key: 'academicYear',
      label: 'Academic Year',
      type: 'text',
      required: true,
      // Academic year is always taken from the currently selected year —
      // it is displayed but cannot be edited (neither on create nor edit).
      readOnly: true,
      placeholder: 'e.g. 2024-25',
    },
    { key: 'semester', label: 'Semester', type: 'select', required: true, options: ['1', '2', '3', '4', '5', '6', '7', '8'] },
    // Program is autofetched from the institution's reference data so the
    // user picks a real program (enables backend program_id resolution).
    { key: 'program', label: 'Program', type: 'text', required: true, placeholder: 'Select a program', autofetch: 'programs' },
    { key: 'examinationName', label: 'Examination Name', type: 'text', required: true, placeholder: 'e.g. Supplementary Exam - Even Sem 2024' },
    { key: 'startDate', label: 'Start Date', type: 'date', required: true },
    { key: 'endDate', label: 'End Date', type: 'date', required: true },
    {
      key: 'totalStudentsAppeared',
      label: 'Total Students Appeared',
      tableLabel: 'Appeared',
      type: 'number',
      placeholder: 'Optional',
    },
    {
      key: 'totalStudentsPassed',
      label: 'Total Students Passed',
      tableLabel: 'Passed',
      type: 'number',
      placeholder: 'Optional',
    },
    // Auto-calculated from Total Students Passed / Total Students Appeared * 100
    // and rendered read-only in the form.
    {
      key: 'passPercentage',
      label: 'Pass Percentage',
      tableLabel: 'Pass %',
      type: 'number',
      readOnly: true,
      autoCalculateFrom: ['totalStudentsPassed', 'totalStudentsAppeared'],
      readOnlyHint: 'Auto-calculated from students passed / appeared',
      placeholder: 'Auto-calculated',
      // Color-coded progress bar in the list (green ≥ 75, amber ≥ 50, red < 50).
      progress: true,
    },
    { key: 'notification', label: 'Notification', type: 'file' },
    { key: 'schedule', label: 'Schedule', type: 'file' },
    { key: 'status', label: 'Status', type: 'select', required: true, options: ['Draft', 'Published', 'Archived'] },
  ],
  // List shows the key figures — full details are in the preview dialog.
  tableFields: [
    'academicYear',
    'program',
    'examinationName',
    'startDate',
    'endDate',
    'totalStudentsAppeared',
    'totalStudentsPassed',
    'passPercentage',
    'status',
  ],
};


export const backlogRepositoryConfig: ModuleConfig = {
  id: 'backlog-repository',
  label: 'Backlog Repository',
  icon: 'AlertTriangle',
  description: 'Maintain institution-level backlog information required for accreditation reports.',
  fields: [
    {
      key: 'academicYear',
      label: 'Academic Year',
      type: 'text',
      required: true,
      // Academic year is always taken from the currently selected year —
      // it is displayed but cannot be edited (neither on create nor edit).
      readOnly: true,
      placeholder: 'e.g. 2024-25',
    },
    { key: 'semester', label: 'Semester', type: 'select', required: true, options: ['1', '2', '3', '4', '5', '6', '7', '8'] },
    { key: 'program', label: 'Program', type: 'text', required: true, placeholder: 'e.g. B.Tech CSE AI R22' },
    { key: 'department', label: 'Department', type: 'text', required: true, placeholder: 'e.g. Computer Science' },
    { key: 'subjectCode', label: 'Subject Code', type: 'text', required: true, placeholder: 'e.g. CS401' },
    { key: 'subjectName', label: 'Subject Name', type: 'text', required: true, placeholder: 'e.g. Machine Learning' },
    { key: 'studentsAppeared', label: 'Students Appeared', type: 'number', required: true },
    { key: 'studentsPassed', label: 'Students Passed', type: 'number', required: true },
    { key: 'studentsFailed', label: 'Students Failed', type: 'number', required: true },
  ],
};


export const allModuleConfigs: ModuleConfig[] = [
  examinationScheduleConfig,
  examinationCircularsConfig,
  resultPublicationsConfig,
  supplementaryExaminationsConfig,
  backlogRepositoryConfig,
];


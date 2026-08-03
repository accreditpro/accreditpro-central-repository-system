// ==============================
// Examination Module Types
// ==============================

/** Status workflow shared across all modules */
export type RecordStatus = 'draft' | 'published' | 'archived';

/** Examination types */
export type ExaminationType =
  | 'internal-assessment'
  | 'end-semester-examination'
  | 'supplementary-examination';

/** Circular categories */
export type CircularCategory =
  | 'examination-notification'
  | 'hall-ticket-notification'
  | 'practical-examination'
  | 'evaluation'
  | 'result-notification'
  | 'supplementary-notification'
  | 'general-circular';

/** Document categories for supporting documents */
export type SupportingDocCategory =
  | 'examination-policy'
  | 'examination-manual'
  | 'circulars'
  | 'notifications'
  | 'schedules'
  | 'result-gazettes'
  | 'university-communications'
  | 'committee-meeting-minutes'
  | 'other-supporting-documents';

// ==============================
// Examination Schedule
// ==============================

export interface ExaminationSchedule {
  id: string;
  academicYear: string;
  semester: string;
  examinationType: ExaminationType;
  program: string;
  department: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  schedulePdf?: string;
  supportingDocuments?: string[];
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
}

// ==============================
// Examination Circular
// ==============================

export interface ExaminationCircular {
  id: string;
  circularNumber: string;
  circularDate: string;
  title: string;
  description: string;
  category: CircularCategory;
  pdf?: string;
  supportingDocuments?: string[];
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
}

// ==============================
// Result Publication
// ==============================

export interface ResultPublication {
  id: string;
  academicYear: string;
  semester: string;
  examinationType: ExaminationType;
  program: string;
  title: string;
  publicationDate: string;
  totalStudentsAppeared?: number;
  totalStudentsPassed?: number;
  passPercentage?: number;
  resultGazette?: string;
  resultSummary?: string;
  supportingDocuments?: string[];
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
}

// ==============================
// Supplementary Examination
// ==============================

export interface SupplementaryExamination {
  id: string;
  academicYear: string;
  semester: string;
  program: string;
  examinationName: string;
  startDate: string;
  endDate: string;
  notification?: string;
  schedule?: string;
  supportingDocuments?: string[];
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
}

// ==============================
// Backlog Record
// ==============================

export interface BacklogRecord {
  id: string;
  academicYear: string;
  semester: string;
  program: string;
  department: string;
  subjectCode: string;
  subjectName: string;
  studentsAppeared: number;
  studentsPassed: number;
  studentsFailed: number;
}

// ==============================
// Supporting Document (within folders)
// ==============================

export interface SupportingDocument {
  id: string;
  category: SupportingDocCategory;
  title: string;
  description: string;
  academicYear: string;
  tags: string[];
  version: string;
  fileUrl?: string;
  uploadedAt: string;
}

// ==============================
// Supporting Document Folder
// ==============================

export interface DocumentFolder {
  id: string;
  category: SupportingDocCategory;
  label: string;
  description: string;
  documentCount: number;
  documents: SupportingDocument[];
}

// ==============================
// Dashboard Summary
// ==============================

export interface DashboardSummary {
  totalSchedules: number;
  publishedResults: number;
  supplementaryExams: number;
  backlogRecords: number;
  activeCirculars: number;
  recentSchedules: ExaminationSchedule[];
  recentResults: ResultPublication[];
  recentCirculars: ExaminationCircular[];
  upcomingSchedules: ExaminationSchedule[];
  upcomingSupplementary: SupplementaryExamination[];
}

// ==============================
// Field Configuration for Dynamic Forms
// ==============================

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'file';
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

// ==============================
// Module Configuration
// ==============================

export interface ModuleConfig {
  id: string;
  label: string;
  icon: string;
  description: string;
  fields: FieldConfig[];
  sampleData: Record<string, string | number>[];
}

export interface DepartmentStats {
  facultyRecords: number;
  studentRecords: number;
  researchRecords: number;
  documentsUploaded: number;
  pendingReviews: number;
  repositoryCompletion: number;
}

export interface FacultyRecord {
  id: string;
  name: string;
  designation: string;
  qualification: string;
  experience: number;
  specialization: string;
  publications: number;
  status: 'active' | 'on_leave' | 'retired';
}

export interface StudentRecord {
  id: string;
  name: string;
  rollNumber: string;
  program: string;
  year: number;
  cgpa: number;
  status: 'active' | 'graduated' | 'dropped';
}

export interface ResearchRecord {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  impactFactor: number;
  type: 'journal' | 'conference' | 'book_chapter' | 'patent';
  status: 'published' | 'accepted' | 'under_review';
}

export interface AcademicRecord {
  id: string;
  category: string;
  title: string;
  academicYear: string;
  status: 'completed' | 'pending' | 'in_progress';
  lastUpdated: string;
  completionPercentage: number;
}

export interface CSVUploadRecord {
  id: string;
  fileName: string;
  category: 'faculty' | 'student' | 'research' | 'academic';
  uploadedAt: string;
  recordsCount: number;
  validRecords: number;
  invalidRecords: number;
  status: 'approved' | 'rejected' | 'pending' | 'processing';
  uploadedBy: string;
}

export interface ValidationError {
  row: number;
  column: string;
  value: string;
  message: string;
}

export interface CSVPreviewData {
  headers: string[];
  rows: string[][];
  totalRows: number;
  validRows: number;
  errors: ValidationError[];
}

export interface MissingRecord {
  category: string;
  item: string;
  priority: 'high' | 'medium' | 'low';
  deadline: string;
}

export interface MissingDocument {
  name: string;
  category: string;
  required: boolean;
  deadline: string;
}

export type DataModule = 'academic' | 'faculty' | 'student' | 'research';
export type UploadStep = 'download' | 'upload' | 'validate' | 'preview' | 'submit';

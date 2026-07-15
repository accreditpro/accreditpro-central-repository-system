// Department Repository Workspace Engine Types
// Reusable metadata-driven architecture for Academic, Faculty, Student, Research repositories

export interface RepositoryFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  required: boolean;
  csvColumn: string;
  masterDataSource?: 'programs' | 'departments' | 'specializations' | 'academicYears' | 'regulations' | 'programOfferings' | 'platforms';
  autoPopulate?: boolean;
  selectOptions?: string[];
  validationRules?: string[];
}

export interface RepositoryTabConfig {
  id: string;
  label: string;
  icon: string;
  fields: RepositoryFieldConfig[];
  requiredEvidence: string[];
  validationRules: string[];
  templateFile: string;
}

export interface RepositoryModuleConfig {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  tabs: RepositoryTabConfig[];
}

export interface RepositorySummary {
  recordsUploaded: number;
  pendingValidation: number;
  pendingVerification: number;
  verified: number;
  approved: number;
  rejected: number;
  lastUpdated: string;
}

export interface RepositoryMetrics {
  dataCompleteness: number;
  evidenceCompleteness: number;
  verificationPercent: number;
  readinessScore: number;
}

export interface ValidationError {
  row: number;
  column: string;
  value: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  warnings: number;
  errors: ValidationError[];
}

export interface EvidenceDocument {
  id: string;
  name: string;
  category: string;
  version: string;
  uploadedBy: string;
  uploadedDate: string;
  status: 'uploaded' | 'pending' | 'verified' | 'rejected';
  fileType: 'pdf' | 'docx' | 'xlsx' | 'zip' | 'png' | 'jpg';
  size: string;
}

export interface WorkflowStep {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'pending' | 'rejected';
  timestamp?: string;
  actor?: string;
}

export interface UploadHistoryRecord {
  id: string;
  fileName: string;
  tab: string;
  repository: string;
  uploadedAt: string;
  recordsCount: number;
  validRecords: number;
  invalidRecords: number;
  status: 'approved' | 'rejected' | 'pending' | 'processing';
  uploadedBy: string;
  workflowStatus: WorkflowStatus;
}

export interface KPICard {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  icon: string;
  color: string;
  trend: number;
  trendLabel: string;
}

export interface MasterData {
  programs: string[];
  departments: string[];
  specializations: string[];
  academicYears: string[];
  regulations: string[];
  programOfferings: string[];
  platforms: string[];
}

export interface DepartmentInfo {
  department: string;
  programOfferings: string[];
  specializations: string[];
  coordinatorName: string;
  academicYear: string;
}

export interface ColumnMapping {
  csvColumn: string;
  mappedField: string;
  confidence: number;
  status: 'auto' | 'manual' | 'unmapped';
}

export type RepositoryModule = 'academic' | 'faculty' | 'student' | 'research' | 'alumni' | 'student-dev-outcomes';
export type WorkflowStatus = 'draft' | 'submitted' | 'validated' | 'evidence_pending' | 'hod_review' | 'iqac_verification' | 'approved' | 'rejected';

export type SidebarView =
  | 'dashboard'
  | 'mission-vision'
  | 'academic-repository'
  | 'faculty-repository'
  | 'student-repository'
  | 'research-repository'
  | 'alumni-repository'
  | 'student-dev-outcomes-repository'
  | 'documents'
  | 'upload-history'
  | 'verification-status'
  | 'profile';
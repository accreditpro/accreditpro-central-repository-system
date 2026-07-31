// Reusable Repository Workspace Engine Types
// This architecture supports: Academic, Faculty, Student, Research, Infrastructure, Compliance repositories

export interface RepositoryFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  required: boolean;
  csvColumn?: string; // For auto-mapping
}

export interface RepositoryTabConfig {
  id: string;
  label: string;
  icon: string;
  fields: RepositoryFieldConfig[];
  requiredEvidence: string[];
  frameworkMapping: string[];
  templateFile: string;
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

export interface ValidationResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  warnings: number;
  errors: ValidationError[];
}

export interface ValidationError {
  row: number;
  column: string;
  value: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface EvidenceDocument {
  id: string;
  name: string;
  category: string;
  version: string;
  uploadedBy: string;
  uploadedDate: string;
  status: 'verified' | 'pending' | 'rejected';
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
  uploadedAt: string;
  recordsCount: number;
  validRecords: number;
  invalidRecords: number;
  status: 'approved' | 'rejected' | 'pending' | 'processing';
  uploadedBy: string;
}

export interface KPICard {
  id: string;
  label: string;
  totalRecords: number;
  completionPercent: number;
  verificationStatus: 'verified' | 'partial' | 'pending';
  lastUpdated: string;
  trend: number; // positive or negative
}

export interface RepositoryMetrics {
  dataCompleteness: number;
  evidenceCompleteness: number;
  verificationPercent: number;
  readinessScore: number;
}

export interface ColumnMapping {
  csvColumn: string;
  mappedField: string;
  confidence: number;
  status: 'auto' | 'manual' | 'unmapped';
}

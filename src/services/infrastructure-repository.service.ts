import { apiService } from './api.service';
import { PaginatedData } from './examination-repository.service';

// ============================================================
// RESPONSE DTOs (mirror backend infrastructure coordinator DTOs)
// ============================================================

/** Section record — the tab's field set is flattened onto the record (JSONB), e.g. { id, workflowStatus, buildingName, ... } */
export interface SectionRecord {
  id: number;
  workflowStatus: string;
  [key: string]: unknown;
}

export interface CsvValidationError {
  row: number;
  column: string;
  value: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface CsvPreviewRow {
  row: number;
  data: Record<string, unknown>;
  validationStatus: 'valid' | 'invalid';
  errors: CsvValidationError[];
}

export interface CsvValidationResponse {
  uploadId: number;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  warnings: number;
  errors: CsvValidationError[];
  previewRows: CsvPreviewRow[];
}

export interface CsvConfirmResponse {
  uploadId: number;
  importedCount: number;
  skippedCount: number;
  message: string;
}

export interface DocumentRecord {
  id: number;
  name: string;
  title?: string;
  category?: string;
  version?: string;
  uploadedBy?: string;
  uploadedDate?: string;
  uploadedAt?: string;
  status?: string;
  fileType?: string;
  size?: string;
  fileSize?: number;
  tabId?: string;
  recordId?: number;
}

export interface DocumentCategoryCount {
  id: string;
  label: string;
  count: number;
}

export interface DocumentListResponse {
  content: DocumentRecord[];
  categories: DocumentCategoryCount[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface DocumentUploadResponse {
  files: Record<string, { id: number; name: string; size: number; type: string; uploadedAt: string }[]>;
}

export interface RepositoryMetric {
  id: string;
  label: string;
  dataCompleteness: number;
  evidenceCompleteness: number;
  verificationPercent: number;
  readinessScore: number;
}

export interface DashboardData {
  coordinator: {
    name: string;
    role: string;
    institution: string;
    department: string;
    email: string;
    phone?: string;
  };
  scoreCards: { label: string; value: number }[];
  summary: { totalRecords: number; totalApproved: number; dataTabs: number; evidenceDocuments: number };
  modules: {
    id: string;
    label: string;
    tabs: { id: string; label: string; value: number }[];
  }[];
  analytics: {
    greenCampus: { renewableEnergyPercent: number; greenAuditStatus: string; carbonReductionInitiatives: number };
    safetySecurity: { fireSafetyCompliance: number; cctvCoverage: number; insuranceExpiryAlerts: number };
    utilities: { powerBackupReadiness: number; internetBandwidthUtilization: number; amcExpiryAlerts: number };
  };
  pending: { pendingReviews: number; pendingVerification: number; pendingDocuments: number };
  recentActivities: { id: number; action: string; detail: string; timestamp: string; type: string }[];
}

export interface VerificationStatusData {
  overall: { totalRecords: number; verified: number; approved: number; pendingVerification: number; rejected: number };
  repositories: RepositoryMetric[];
  attentionItems: { tabId: string; pendingVerification: number; rejected: number }[];
}

export interface ProfileData {
  coordinator: {
    name: string;
    role: string;
    institution: string;
    department: string;
    email: string;
    phone?: string;
  };
  assignment: { department: string; institution: string; academicYear: string };
  readiness: RepositoryMetric[];
  permissions: { allowed: string[]; restricted: string[] };
}

export interface UploadHistoryItem {
  id: number;
  fileName: string;
  tab: string;
  repository: string;
  uploadedAt: string;
  recordsCount: number;
  validRecords: number;
  invalidRecords: number;
  status: string;
  uploadedBy: string;
  workflowStatus: string;
}

export interface UploadHistoryData {
  summary: { totalUploads: number; approved: number; pending: number; rejected: number };
  content: UploadHistoryItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ============================================================
// REQUEST HELPERS
// ============================================================

export interface SectionListParams {
  academicYear?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface DocumentListParams {
  category?: string;
  search?: string;
  tabId?: string;
  recordId?: number;
  page?: number;
  size?: number;
}

export interface UploadHistoryParams {
  repository?: string;
  status?: string;
  search?: string;
  page?: number;
  size?: number;
}

function toQuery(params?: Record<string, unknown>): string {
  if (!params) return '';
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

// ============================================================
// SERVICE
// ============================================================

class InfrastructureRepositoryService {
  private readonly baseUrl = '/v1/infrastructure-coordinator';

  // ---------- Dashboard & aggregates ----------

  async getDashboard(): Promise<DashboardData> {
    return apiService.get<DashboardData>(`${this.baseUrl}/dashboard`);
  }

  async getUploadHistory(params?: UploadHistoryParams): Promise<UploadHistoryData> {
    return apiService.get<UploadHistoryData>(
      `${this.baseUrl}/upload-history${toQuery(params as Record<string, unknown>)}`
    );
  }

  async getVerificationStatus(): Promise<VerificationStatusData> {
    return apiService.get<VerificationStatusData>(`${this.baseUrl}/verification-status`);
  }

  async getProfile(): Promise<ProfileData> {
    return apiService.get<ProfileData>(`${this.baseUrl}/profile`);
  }

  // ---------- Section records (23 tabs) ----------

  async getSectionRecords(tabId: string, params?: SectionListParams): Promise<PaginatedData<SectionRecord>> {
    return apiService.get<PaginatedData<SectionRecord>>(
      `${this.baseUrl}/sections/${tabId}${toQuery(params as Record<string, unknown>)}`
    );
  }

  async getSectionRecord(tabId: string, id: number): Promise<SectionRecord> {
    return apiService.get<SectionRecord>(`${this.baseUrl}/sections/${tabId}/${id}`);
  }

  async createSectionRecord(tabId: string, data: unknown): Promise<SectionRecord> {
    return apiService.post<SectionRecord>(`${this.baseUrl}/sections/${tabId}`, data);
  }

  async updateSectionRecord(tabId: string, id: number, data: unknown): Promise<SectionRecord> {
    return apiService.put<SectionRecord>(`${this.baseUrl}/sections/${tabId}/${id}`, data);
  }

  async deleteSectionRecord(tabId: string, id: number): Promise<void> {
    return apiService.delete<void>(`${this.baseUrl}/sections/${tabId}/${id}`);
  }

  /** Download the header-only CSV template for a section tab. */
  async downloadSectionTemplate(tabId: string): Promise<void> {
    return apiService.download(`${this.baseUrl}/sections/${tabId}/template`, `${tabId}_template.csv`);
  }

  /** Phase 1 of the two-phase CSV import — validate, nothing persisted. */
  async validateCsvUpload(tabId: string, file: File, academicYear?: string): Promise<CsvValidationResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return apiService.post<CsvValidationResponse>(
      `${this.baseUrl}/sections/${tabId}/upload${toQuery({ academicYear })}`,
      formData
    );
  }

  /** Phase 2 — persist the valid rows of a validated upload. */
  async confirmCsvUpload(tabId: string, uploadId: number): Promise<CsvConfirmResponse> {
    return apiService.post<CsvConfirmResponse>(`${this.baseUrl}/sections/${tabId}/upload/confirm`, { uploadId });
  }

  // ---------- Documents ----------

  async getDocuments(params?: DocumentListParams): Promise<DocumentListResponse> {
    return apiService.get<DocumentListResponse>(
      `${this.baseUrl}/documents${toQuery(params as Record<string, unknown>)}`
    );
  }

  /** Upload one or more files; category is optional for per-record evidence. */
  async uploadDocuments(
    files: File[],
    category?: string,
    title?: string,
    version?: string,
    tabId?: string,
    recordId?: number
  ): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (category) formData.append('category', category);
    if (title) formData.append('title', title);
    if (version) formData.append('version', version);
    if (tabId) formData.append('tabId', tabId);
    if (recordId !== undefined) formData.append('recordId', String(recordId));
    return apiService.post<DocumentUploadResponse>(`${this.baseUrl}/documents`, formData);
  }

  async downloadDocument(id: number, filename?: string): Promise<void> {
    return apiService.download(`${this.baseUrl}/documents/${id}/download`, filename);
  }

  async deleteDocument(id: number): Promise<void> {
    return apiService.delete<void>(`${this.baseUrl}/documents/${id}`);
  }
}

export const infrastructureRepositoryService = new InfrastructureRepositoryService();

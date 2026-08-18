import { apiService } from './api.service';
import { PaginatedData } from './examination-repository.service';

// ============================================================
// RESPONSE DTOs (mirror backend finance coordinator DTOs)
// ============================================================

/** Section record — the tab's field set is flattened onto the record (JSONB), e.g. { id, workflowStatus, financialYear, ... } */
export interface FinanceSectionRecord {
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

export interface FinanceDocumentRecord {
  id: number;
  name: string;
  title?: string;
  category: string;
  type?: string;
  uploadedBy?: string;
  uploadDate?: string;
  uploadedAt?: string;
  status?: string;
  fileType?: string;
  size?: string;
  fileSize?: number;
}

export interface FinanceCategoryCount {
  id: string;
  label: string;
  count: number;
}

export interface FinanceDocumentListResponse {
  content: FinanceDocumentRecord[];
  categories: FinanceCategoryCount[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface FinanceDocumentUploadResponse {
  files: Record<string, { id: number; name: string; size: number; type: string; uploadedAt: string }[]>;
}

export interface FinanceDashboardData {
  coordinator?: {
    name: string;
    role: string;
    institution: string;
    department: string;
    email: string;
    phone?: string;
  };
  kpis: {
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
  }[];
  financialHealth: { label: string; value: number }[];
  recentActivities: { id: number; action: string; details: string; timestamp: string; type: string }[];
}

// ============================================================
// REQUEST HELPERS
// ============================================================

export interface FinanceSectionListParams {
  financialYear?: string;
  academicYear?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface FinanceDocumentListParams {
  category?: string;
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

class FinanceRepositoryService {
  private readonly baseUrl = '/v1/finance-coordinator';

  // ---------- Dashboard ----------

  async getDashboard(): Promise<FinanceDashboardData> {
    return apiService.get<FinanceDashboardData>(`${this.baseUrl}/dashboard`);
  }

  // ---------- Section records (8 tabs) ----------

  async getSectionRecords(tabId: string, params?: FinanceSectionListParams): Promise<PaginatedData<FinanceSectionRecord>> {
    return apiService.get<PaginatedData<FinanceSectionRecord>>(
      `${this.baseUrl}/sections/${tabId}${toQuery(params as Record<string, unknown>)}`
    );
  }

  async getSectionRecord(tabId: string, id: number): Promise<FinanceSectionRecord> {
    return apiService.get<FinanceSectionRecord>(`${this.baseUrl}/sections/${tabId}/${id}`);
  }

  async createSectionRecord(tabId: string, data: unknown): Promise<FinanceSectionRecord> {
    return apiService.post<FinanceSectionRecord>(`${this.baseUrl}/sections/${tabId}`, data);
  }

  async updateSectionRecord(tabId: string, id: number, data: unknown): Promise<FinanceSectionRecord> {
    return apiService.put<FinanceSectionRecord>(`${this.baseUrl}/sections/${tabId}/${id}`, data);
  }

  async deleteSectionRecord(tabId: string, id: number): Promise<void> {
    return apiService.delete<void>(`${this.baseUrl}/sections/${tabId}/${id}`);
  }

  /** Download the header-only CSV template for a section tab. */
  async downloadSectionTemplate(tabId: string): Promise<void> {
    return apiService.download(`${this.baseUrl}/sections/${tabId}/template`, `${tabId}_template.csv`);
  }

  /** Phase 1 of the two-phase CSV import — validate, nothing persisted. */
  async validateCsvUpload(tabId: string, file: File): Promise<CsvValidationResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return apiService.post<CsvValidationResponse>(`${this.baseUrl}/sections/${tabId}/upload`, formData);
  }

  /** Phase 2 — persist the valid rows of a validated upload. */
  async confirmCsvUpload(tabId: string, uploadId: number): Promise<CsvConfirmResponse> {
    return apiService.post<CsvConfirmResponse>(`${this.baseUrl}/sections/${tabId}/upload/confirm`, { uploadId });
  }

  // ---------- Documents ----------

  async getDocuments(params?: FinanceDocumentListParams): Promise<FinanceDocumentListResponse> {
    return apiService.get<FinanceDocumentListResponse>(
      `${this.baseUrl}/documents${toQuery(params as Record<string, unknown>)}`
    );
  }

  /** Upload one or more files to a category (all files share the category). */
  async uploadDocuments(files: File[], category: string, title?: string): Promise<FinanceDocumentUploadResponse> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('category', category);
    if (title) formData.append('title', title);
    return apiService.post<FinanceDocumentUploadResponse>(`${this.baseUrl}/documents`, formData);
  }

  async downloadDocument(id: number, filename?: string): Promise<void> {
    return apiService.download(`${this.baseUrl}/documents/${id}/download`, filename);
  }

  async deleteDocument(id: number): Promise<void> {
    return apiService.delete<void>(`${this.baseUrl}/documents/${id}`);
  }
}

export const financeRepositoryService = new FinanceRepositoryService();

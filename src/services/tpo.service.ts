import { apiService } from './api.service';
import { PaginatedData } from './examination-repository.service';

// ============================================================
// RESPONSE DTOs (mirror backend TPO DTOs)
// ============================================================

/**
 * Section record — the section's field set lives in `recordData` (JSONB);
 * the envelope carries the system fields. Views flatten recordData onto the
 * row (plus `id`) for display and editing.
 */
export interface TPOSectionRecord {
  id: number;
  departmentId?: number;
  academicYear?: string;
  moduleId?: string;
  recordData: Record<string, unknown>;
  status?: string;
  workflowStatus?: string;
  evidenceCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TpoSectionStats {
  section: string;
  cards: { key: string; label: string; value: number }[];
}

export interface TpoCsvImportError {
  row: number;
  message: string;
}

export interface TpoCsvImportResult {
  successfulRecords: number;
  failedRecords: number;
  errors: TpoCsvImportError[];
}

export interface TpoDashboardData {
  departmentId: number;
  department: string;
  academicYear: string;
  kpis: {
    key: string;
    label: string;
    value: number | string;
    change: string;
    changeType: string;
  }[];
  healthIndicators: { key: string; label: string; value: number }[];
  recentActivities: {
    id: number;
    action: string;
    details: string;
    timestamp: string;
    type: string;
  }[];
}

export interface TpoDocumentRecord {
  id: number;
  documentName: string;
  documentType: string;
  documentUrl: string;
  size: number;
  uploadedBy: number;
  uploadedAt: string;
  sectionName?: string;
  recordId?: number | null;
  departmentId?: number;
  academicYear?: string;
  status?: string;
}

export interface TpoDocumentUploadResponse {
  id: number;
  documentName: string;
  documentType: string;
  documentUrl: string;
  size: number;
  uploadedBy: number;
  uploadedAt: string;
}

// ============================================================
// REQUEST HELPERS
// ============================================================

export interface TpoSectionListParams {
  departmentId: number;
  academicYear: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface TpoDocumentListParams {
  departmentId: number;
  academicYear: string;
  sectionName?: string;
  recordId?: number;
  documentType?: string;
  page?: number;
  size?: number;
}

export interface TpoDocumentUploadParams {
  departmentId: number;
  academicYear: string;
  sectionName: string;
  recordId?: number;
  documentType: string;
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

class TpoRepositoryService {
  private readonly baseUrl = '/v1/tpo-repository';

  // ---------- Dashboard ----------

  async getDashboard(departmentId: number, academicYear: string): Promise<TpoDashboardData> {
    return apiService.get<TpoDashboardData>(
      `${this.baseUrl}/dashboard${toQuery({ departmentId, academicYear })}`
    );
  }

  // ---------- Section records (7 tabs) ----------

  async getSectionRecords(section: string, params: TpoSectionListParams): Promise<PaginatedData<TPOSectionRecord>> {
    return apiService.get<PaginatedData<TPOSectionRecord>>(
      `${this.baseUrl}/${section}${toQuery(params as unknown as Record<string, unknown>)}`
    );
  }

  async getSectionRecord(section: string, id: number, departmentId: number, academicYear: string): Promise<TPOSectionRecord> {
    return apiService.get<TPOSectionRecord>(
      `${this.baseUrl}/${section}/${id}${toQuery({ departmentId, academicYear })}`
    );
  }

  async createSectionRecord(section: string, data: unknown, departmentId: number, academicYear: string): Promise<TPOSectionRecord> {
    return apiService.post<TPOSectionRecord>(
      `${this.baseUrl}/${section}${toQuery({ departmentId, academicYear })}`,
      data
    );
  }

  async updateSectionRecord(section: string, id: number, data: unknown, departmentId: number, academicYear: string): Promise<TPOSectionRecord> {
    return apiService.put<TPOSectionRecord>(
      `${this.baseUrl}/${section}/${id}${toQuery({ departmentId, academicYear })}`,
      data
    );
  }

  async deleteSectionRecord(section: string, id: number, departmentId: number, academicYear: string): Promise<void> {
    return apiService.delete<void>(
      `${this.baseUrl}/${section}/${id}${toQuery({ departmentId, academicYear })}`
    );
  }

  async getSectionStats(section: string, departmentId: number, academicYear: string): Promise<TpoSectionStats> {
    return apiService.get<TpoSectionStats>(
      `${this.baseUrl}/${section}/stats${toQuery({ departmentId, academicYear })}`
    );
  }

  /** Download the header-only CSV template for a section. */
  async downloadSectionTemplate(section: string): Promise<void> {
    return apiService.download(`${this.baseUrl}/${section}/template`, `${section}_template.csv`);
  }

  /** Export the current (filtered) records of a section as CSV. */
  async exportSectionCsv(section: string, departmentId: number, academicYear: string, search?: string): Promise<void> {
    return apiService.download(
      `${this.baseUrl}/${section}/export${toQuery({ departmentId, academicYear, search })}`,
      `${section}_export.csv`
    );
  }

  /** Single-phase CSV bulk import (valid rows saved, invalid rows reported). */
  async uploadSectionCsv(section: string, file: File, departmentId: number, academicYear: string): Promise<TpoCsvImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return apiService.post<TpoCsvImportResult>(
      `${this.baseUrl}/${section}/upload${toQuery({ departmentId, academicYear })}`,
      formData
    );
  }

  // ---------- Supporting documents ----------

  async getDocuments(params: TpoDocumentListParams): Promise<PaginatedData<TpoDocumentRecord>> {
    return apiService.get<PaginatedData<TpoDocumentRecord>>(
      `${this.baseUrl}/supporting-documents${toQuery(params as unknown as Record<string, unknown>)}`
    );
  }

  /** Upload a single document; recordId is 0/omitted for the documents view. */
  async uploadDocument(file: File, params: TpoDocumentUploadParams): Promise<TpoDocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const query = toQuery(params as unknown as Record<string, unknown>);
    return apiService.post<TpoDocumentUploadResponse>(`${this.baseUrl}/supporting-documents/upload${query}`, formData);
  }

  async downloadDocument(id: number, departmentId: number, filename?: string): Promise<void> {
    return apiService.download(
      `${this.baseUrl}/supporting-documents/${id}/download${toQuery({ departmentId })}`,
      filename
    );
  }

  async deleteDocument(id: number, departmentId: number): Promise<void> {
    return apiService.delete<void>(
      `${this.baseUrl}/supporting-documents/${id}${toQuery({ departmentId })}`
    );
  }
}

export const tpoRepositoryService = new TpoRepositoryService();

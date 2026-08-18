import { apiService } from './api.service';
import { PaginatedData } from './examination-repository.service';

// ============================================================
// RESPONSE DTOs (mirror backend SDC DTOs)
// ============================================================

/** Section record — the section's field set lives in `recordData` (JSONB). */
export interface SdcSectionRecord {
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

export interface SdcSectionStats {
  section: string;
  cards: { key: string; label: string; value: number }[];
}

export interface SdcCsvImportError {
  row: number;
  message: string;
}

export interface SdcCsvImportResult {
  successfulRecords: number;
  failedRecords: number;
  errors: SdcCsvImportError[];
}

export interface SdcDashboardData {
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

export interface SdcDocumentRecord {
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

export interface SdcDocumentUploadResponse {
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

export interface SdcSectionListParams {
  departmentId: number;
  academicYear: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface SdcDocumentListParams {
  departmentId: number;
  academicYear: string;
  sectionName?: string;
  recordId?: number;
  documentType?: string;
  page?: number;
  size?: number;
}

export interface SdcDocumentUploadParams {
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

class SdcRepositoryService {
  private readonly baseUrl = '/v1/student-development-repository';

  // ---------- Dashboard ----------

  async getDashboard(departmentId: number, academicYear: string): Promise<SdcDashboardData> {
    return apiService.get<SdcDashboardData>(
      `${this.baseUrl}/dashboard${toQuery({ departmentId, academicYear })}`
    );
  }

  // ---------- Section records (11 tabs) ----------

  async getSectionRecords(section: string, params: SdcSectionListParams): Promise<PaginatedData<SdcSectionRecord>> {
    return apiService.get<PaginatedData<SdcSectionRecord>>(
      `${this.baseUrl}/${section}${toQuery(params as unknown as Record<string, unknown>)}`
    );
  }

  async getSectionRecord(section: string, id: number, departmentId: number, academicYear: string): Promise<SdcSectionRecord> {
    return apiService.get<SdcSectionRecord>(
      `${this.baseUrl}/${section}/${id}${toQuery({ departmentId, academicYear })}`
    );
  }

  async createSectionRecord(section: string, data: unknown, departmentId: number, academicYear: string): Promise<SdcSectionRecord> {
    return apiService.post<SdcSectionRecord>(
      `${this.baseUrl}/${section}${toQuery({ departmentId, academicYear })}`,
      data
    );
  }

  async updateSectionRecord(section: string, id: number, data: unknown, departmentId: number, academicYear: string): Promise<SdcSectionRecord> {
    return apiService.put<SdcSectionRecord>(
      `${this.baseUrl}/${section}/${id}${toQuery({ departmentId, academicYear })}`,
      data
    );
  }

  async deleteSectionRecord(section: string, id: number, departmentId: number, academicYear: string): Promise<void> {
    return apiService.delete<void>(
      `${this.baseUrl}/${section}/${id}${toQuery({ departmentId, academicYear })}`
    );
  }

  async getSectionStats(section: string, departmentId: number, academicYear: string): Promise<SdcSectionStats> {
    return apiService.get<SdcSectionStats>(
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
  async uploadSectionCsv(section: string, file: File, departmentId: number, academicYear: string): Promise<SdcCsvImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return apiService.post<SdcCsvImportResult>(
      `${this.baseUrl}/${section}/upload${toQuery({ departmentId, academicYear })}`,
      formData
    );
  }

  // ---------- Supporting documents ----------

  async getDocuments(params: SdcDocumentListParams): Promise<PaginatedData<SdcDocumentRecord>> {
    return apiService.get<PaginatedData<SdcDocumentRecord>>(
      `${this.baseUrl}/supporting-documents${toQuery(params as unknown as Record<string, unknown>)}`
    );
  }

  /** Upload a single document; recordId is 0/omitted for the documents view. */
  async uploadDocument(file: File, params: SdcDocumentUploadParams): Promise<SdcDocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const query = toQuery(params as unknown as Record<string, unknown>);
    return apiService.post<SdcDocumentUploadResponse>(`${this.baseUrl}/supporting-documents/upload${query}`, formData);
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

export const sdcRepositoryService = new SdcRepositoryService();

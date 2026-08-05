import { apiService } from './api.service';

const BASE = '/v1/research-repository';

// ─── Helper ───────────────────────────────────────────────────────────────────
function qs(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  });
  return q.toString();
}

// ─── Types & Health / Metrics ──────────────────────────────────────────────────

export interface ResearchTabMetric {
  tabId: string;
  tabLabel: string;
  recordsUploaded: number;
  pendingValidation: number;
  pendingVerification: number;
  verified: number;
  approved: number;
  rejected: number;
  lastUpdated?: string;
}

export interface ResearchRepositoryHealth {
  academicYear: string;
  dataCompleteness: number;
  evidenceCompleteness: number;
  verificationPercent: number;
  readinessScore: number;
  tabWiseMetrics?: Record<string, ResearchTabMetric>;
}

export interface ResearchDashboardResponse {
  departmentId?: number;
  department?: string;
  academicYear?: string;
  metrics?: {
    dataCompleteness?: number;
    evidenceScore?: number;
    verificationScore?: number;
    readinessScore?: number;
  };
  moduleSummary?: Array<{
    moduleId: string;
    label: string;
    count: number;
    status?: string;
    icon?: string;
    completionPercentage?: number;
  }>;
  financialSummary?: {
    totalResearchFunding?: number;
    totalResearchFundingFormatted?: string;
    consultancyRevenue?: number;
    consultancyRevenueFormatted?: string;
    pendingGrants?: number;
    totalSponsoredProjects?: number;
  };
  recentActivity?: Array<{
    id: string | number;
    action?: string;
    description?: string;
    timestamp?: string;
    type?: string;
    status?: string;
    title?: string;
    date?: string;
  }>;
  alerts?: Array<{
    id: string | number;
    title: string;
    description: string;
    type: string;
  }>;
}

/**
 * GET /api/v1/research-repository/dashboard?departmentId=X&academicYear=Y
 */
export async function getResearchDashboardSummary(
  academicYear: string = '2025-26',
  departmentId: number
): Promise<ResearchDashboardResponse | null> {
  const query = qs({ academicYear, departmentId });
  try {
    const res = await apiService.get<any>(`${BASE}/dashboard?${query}`);
    return res?.data ?? res ?? null;
  } catch (err) {
    console.warn('Dashboard summary call error', err);
    return null;
  }
}

/**
 * GET /api/v1/research-repository/metrics?departmentId=X&academicYear=Y
 */
export async function getResearchRepositoryHealth(
  academicYear: string = '2025-26',
  departmentId: number
): Promise<ResearchRepositoryHealth> {
  const query = qs({ academicYear, departmentId });
  try {
    const res = await apiService.get<any>(`${BASE}/metrics?${query}`);
    const data = res?.data ?? res;
    if (data) {
      return {
        academicYear,
        dataCompleteness: data.dataCompleteness ?? 0,
        evidenceCompleteness: data.evidenceScore ?? data.evidenceCompleteness ?? 0,
        verificationPercent: data.verificationScore ?? data.verificationPercent ?? 0,
        readinessScore: data.readinessScore ?? 0,
        tabWiseMetrics: data.tabWiseMetrics,
      };
    }
    return {
      academicYear,
      dataCompleteness: 0,
      evidenceCompleteness: 0,
      verificationPercent: 0,
      readinessScore: 0,
    };
  } catch (err) {
    console.warn('Falling back to default metrics', err);
    return {
      academicYear,
      dataCompleteness: 0,
      evidenceCompleteness: 0,
      verificationPercent: 0,
      readinessScore: 0,
    };
  }
}

// ─── Generic Handler Helper for Sub-Modules ──────────────────────────────────

export async function getResearchModuleRecords(
  tabId: string,
  academicYear: string,
  departmentId: number,
  extra?: { search?: string; page?: number; size?: number }
): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500, ...extra });
  return apiService.get<any>(`${BASE}/${tabId}?${query}`);
}

export async function createResearchModuleRecord(
  tabId: string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.post<any>(`${BASE}/${tabId}?${query}`, data);
}

export async function updateResearchModuleRecord(
  tabId: string,
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.put<any>(`${BASE}/${tabId}/${id}?${query}`, data);
}

export async function deleteResearchModuleRecord(
  tabId: string,
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/${tabId}/${id}?${query}`);
}

export async function uploadResearchModuleCsv(
  tabId: string,
  academicYear: string,
  departmentId: number,
  file: File
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  const form = new FormData();
  form.append('file', file);
  return apiService.post<any>(`${BASE}/${tabId}/upload?${query}`, form);
}

// ─── Supporting Documents / Evidence Repository APIs ──────────────────────────

export async function uploadResearchEvidenceDocument(params: {
  file: File;
  departmentId: number;
  uploadedBy: string;
  academicYear: string;
  sectionName: string;
  recordId: number | string;
  documentType: string;
}): Promise<any> {
  const query = qs({
    departmentId: params.departmentId,
    uploadedBy: params.uploadedBy,
  });

  const form = new FormData();
  form.append('file', params.file);
  form.append('academicYear', params.academicYear);
  form.append('sectionName', params.sectionName);
  form.append('recordId', String(params.recordId));
  form.append('documentType', params.documentType);

  return apiService.post<any>(`${BASE}/supporting-documents/upload?${query}`, form);
}

export async function getResearchEvidenceDocuments(params: {
  departmentId: number;
  academicYear: string;
  sectionName?: string;
  recordId?: number | string;
  page?: number;
  size?: number;
}): Promise<any> {
  const query = qs({ size: 50, ...params });
  return apiService.get<any>(`${BASE}/supporting-documents?${query}`);
}

export async function deleteResearchEvidenceDocument(
  id: number | string,
  departmentId: number
): Promise<any> {
  const query = qs({ departmentId });
  return apiService.delete<any>(`${BASE}/supporting-documents/${id}?${query}`);
}

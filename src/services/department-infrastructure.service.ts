import { apiService } from './api.service';

const BASE = '/v1/department-coordinator/infrastructure-repository';

function qs(params: Record<string, any>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      sp.append(k, String(v));
    }
  });
  return sp.toString();
}

/** Map frontend tab IDs to backend endpoint slugs */
export function mapInfraTabId(tabId: string): string {
  if (tabId === 'ict-classrooms') return 'ict-enabled-classrooms';
  if (tabId === 'dept-assets') return 'department-assets';
  return tabId;
}

export interface InfrastructureHealthMetrics {
  academicYear: string;
  dataCompleteness: number;
  evidenceCompleteness: number;
  verificationPercent: number;
  readinessScore: number;
  totalRecords?: number;
  tabWiseMetrics?: Record<string, any>;
}

// ─── Health / Dashboard Metrics ───────────────────────────────────────────────

export async function getInfrastructureHealth(
  academicYear: string = '2025-26',
  departmentId: number
): Promise<InfrastructureHealthMetrics> {
  const query = qs({ academicYear, departmentId });
  try {
    const res = await apiService.get<any>(`${BASE}/health?${query}`);
    const data = res?.data ?? res;
    if (data) {
      return {
        academicYear,
        dataCompleteness: data.dataCompleteness ?? 0,
        evidenceCompleteness: data.evidenceScore ?? data.evidenceCompleteness ?? 0,
        verificationPercent: data.verificationScore ?? data.verificationPercent ?? 0,
        readinessScore: data.readinessScore ?? 0,
        totalRecords: data.totalRecords ?? 0,
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
    console.warn('Falling back to default infrastructure health metrics', err);
    return {
      academicYear,
      dataCompleteness: 0,
      evidenceCompleteness: 0,
      verificationPercent: 0,
      readinessScore: 0,
    };
  }
}

// ─── Generic Sub-Module REST Handlers ────────────────────────────────────────

export async function getInfrastructureRecords(
  tabId: string,
  academicYear: string,
  departmentId: number,
  extra?: { search?: string; page?: number; size?: number; status?: string; block?: string }
): Promise<any> {
  const slug = mapInfraTabId(tabId);
  const query = qs({ academicYear, departmentId, size: 500, ...extra });
  return apiService.get<any>(`${BASE}/${slug}?${query}`);
}

export async function createInfrastructureRecord(
  tabId: string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const slug = mapInfraTabId(tabId);
  const query = qs({ academicYear, departmentId });
  return apiService.post<any>(`${BASE}/${slug}?${query}`, data);
}

export async function updateInfrastructureRecord(
  tabId: string,
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const slug = mapInfraTabId(tabId);
  const query = qs({ academicYear, departmentId });
  return apiService.put<any>(`${BASE}/${slug}/${id}?${query}`, data);
}

export async function deleteInfrastructureRecord(
  tabId: string,
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const slug = mapInfraTabId(tabId);
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/${slug}/${id}?${query}`);
}

export async function uploadInfrastructureCsv(
  tabId: string,
  academicYear: string,
  departmentId: number,
  file: File
): Promise<any> {
  const slug = mapInfraTabId(tabId);
  const query = qs({ academicYear, departmentId });
  const form = new FormData();
  form.append('file', file);
  return apiService.post<any>(`${BASE}/${slug}/upload?${query}`, form);
}

// ─── Evidence & Bulk Upload Handlers ─────────────────────────────────────────

export async function uploadInfrastructureEvidence(params: {
  file: File;
  departmentId: number;
  uploadedBy: number | string;
}): Promise<any> {
  const query = qs({
    departmentId: params.departmentId,
    uploadedBy: params.uploadedBy,
  });
  const form = new FormData();
  form.append('file', params.file);
  return apiService.post<any>(`${BASE}/upload?${query}`, form);
}

export async function uploadInfrastructureBulkData(params: {
  file: File;
  academicYear: string;
  departmentId: number;
}): Promise<any> {
  const query = qs({
    academicYear: params.academicYear,
    departmentId: params.departmentId,
  });
  const form = new FormData();
  form.append('file', params.file);
  return apiService.post<any>(`${BASE}/bulk-upload?${query}`, form);
}

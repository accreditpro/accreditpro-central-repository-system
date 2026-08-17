import { apiService } from './api.service';

const BASE = '/v1/department-coordinator/student-dev-outcomes';

function qs(params: Record<string, any>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      sp.append(k, String(v));
    }
  });
  return sp.toString();
}

export interface StudentDevHealthMetrics {
  academicYear: string;
  dataCompleteness: number;
  evidenceCompleteness: number;
  verificationPercent: number;
  readinessScore: number;
  totalRecords?: number;
  tabWiseMetrics?: Record<string, any>;
}

// ─── Health / Dashboard Metrics ───────────────────────────────────────────────

export async function getStudentDevHealth(
  academicYear: string = '2025-26',
  departmentId: number
): Promise<StudentDevHealthMetrics> {
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
    console.warn('Falling back to default student-dev-outcomes health metrics', err);
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

export async function getStudentDevRecords(
  tabId: string,
  academicYear: string,
  departmentId: number,
  extra?: { search?: string; page?: number; size?: number }
): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500, ...extra });
  return apiService.get<any>(`${BASE}/${tabId}?${query}`);
}

export async function createStudentDevRecord(
  tabId: string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.post<any>(`${BASE}/${tabId}?${query}`, data);
}

export async function updateStudentDevRecord(
  tabId: string,
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.put<any>(`${BASE}/${tabId}/${id}?${query}`, data);
}

export async function deleteStudentDevRecord(
  tabId: string,
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/${tabId}/${id}?${query}`);
}

export async function uploadStudentDevCsv(
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

// ─── Evidence & Bulk Upload Handlers ─────────────────────────────────────────

export async function uploadStudentDevEvidence(params: {
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

export async function uploadStudentDevBulkData(params: {
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

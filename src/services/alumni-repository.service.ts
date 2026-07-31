import { apiService } from './api.service';

const BASE = '/v1/department-coordinator/alumni-repository';

// ─── Helper ───────────────────────────────────────────────────────────────────
function qs(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  });
  return q.toString();
}

// ─── 1. Alumni Details ────────────────────────────────────────────────────────

/**
 * GET /details?departmentId=X&academicYear=Y&page=&size=&search=
 */
export async function getAlumniDetails(
  academicYear: string,
  departmentId: number,
  extra?: { search?: string; page?: number; size?: number }
): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500, ...extra });
  return apiService.get<any>(`${BASE}/details?${query}`);
}

/**
 * POST /details?departmentId=X&academicYear=Y
 */
export async function createAlumniDetail(
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.post<any>(`${BASE}/details?${query}`, data);
}

/**
 * PUT /details/{id}?departmentId=X&academicYear=Y
 */
export async function updateAlumniDetail(
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.put<any>(`${BASE}/details/${id}?${query}`, data);
}

/**
 * DELETE /details/{id}?departmentId=X&academicYear=Y
 */
export async function deleteAlumniDetail(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/details/${id}?${query}`);
}

/**
 * POST /details/upload (multipart/form-data)
 * Form parts: file (CSV), request (JSON with academicYear, department, replaceExisting)
 */
export async function uploadAlumniDetailsCsv(
  departmentId: number,
  file: File,
  request?: { academicYear?: string; department?: string; replaceExisting?: boolean }
): Promise<any> {
  const query = qs({ departmentId });
  const form = new FormData();
  form.append('file', file);
  if (request) {
    form.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
  }
  return apiService.post<any>(`${BASE}/details/upload?${query}`, form);
}

// ─── 2. Employment & Career ───────────────────────────────────────────────────

/**
 * GET /employment?departmentId=X&academicYear=Y&page=&size=&search=
 */
export async function getEmploymentRecords(
  academicYear: string,
  departmentId: number,
  extra?: {
    alumniId?: string;
    industrySector?: string;
    employmentType?: string;
    page?: number;
    size?: number;
  }
): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500, ...extra });
  return apiService.get<any>(`${BASE}/employment?${query}`);
}

/**
 * POST /employment/upload?departmentId=X&academicYear=Y (multipart/form-data)
 */
export async function uploadEmploymentCsv(
  departmentId: number,
  file: File,
  academicYear?: string
): Promise<any> {
  const query = qs({ departmentId, academicYear });
  const form = new FormData();
  form.append('file', file);
  return apiService.post<any>(`${BASE}/employment/upload?${query}`, form);
}

/**
 * POST /employment?departmentId=X&academicYear=Y
 */
export async function createEmploymentRecord(
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.post<any>(`${BASE}/employment?${query}`, data);
}

/**
 * PUT /employment/{id}?departmentId=X&academicYear=Y
 */
export async function updateEmploymentRecord(
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.put<any>(`${BASE}/employment/${id}?${query}`, data);
}

/**
 * DELETE /employment/{id}?departmentId=X&academicYear=Y
 */
export async function deleteEmploymentRecord(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/employment/${id}?${query}`);
}

// ─── 3. Higher Education ─────────────────────────────────────────────────────

/**
 * GET /higher-education?departmentId=X&academicYear=Y&page=&size=&search=
 */
export async function getHigherEducationRecords(
  academicYear: string,
  departmentId: number,
  extra?: { alumniId?: string; status?: string; page?: number; size?: number }
): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500, ...extra });
  return apiService.get<any>(`${BASE}/higher-education?${query}`);
}

/**
 * POST /higher-education?departmentId=X&academicYear=Y
 */
export async function createHigherEducationRecord(
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.post<any>(`${BASE}/higher-education?${query}`, data);
}

/**
 * POST /higher-education/upload?departmentId=X&academicYear=Y (multipart/form-data)
 */
export async function uploadHigherEducationCsv(
  departmentId: number,
  file: File,
  academicYear?: string
): Promise<any> {
  const query = qs({ departmentId, academicYear });
  const form = new FormData();
  form.append('file', file);
  return apiService.post<any>(`${BASE}/higher-education/upload?${query}`, form);
}

/**
 * PUT /higher-education/{id}?departmentId=X&academicYear=Y
 */
export async function updateHigherEducationRecord(
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.put<any>(`${BASE}/higher-education/${id}?${query}`, data);
}

/**
 * DELETE /higher-education/{id}?departmentId=X&academicYear=Y
 */
export async function deleteHigherEducationRecord(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/higher-education/${id}?${query}`);
}

// ─── 4. Alumni Engagement ───────────────────────────────────────────────────

/**
 * GET /engagement?departmentId=X&academicYear=Y&page=&size=&search=
 */
export async function getEngagementRecords(
  academicYear: string,
  departmentId: number,
  extra?: { alumniId?: string; engagementType?: string; page?: number; size?: number }
): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500, ...extra });
  return apiService.get<any>(`${BASE}/engagement?${query}`);
}

/**
 * POST /engagement?departmentId=X&academicYear=Y
 */
export async function createEngagementRecord(
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.post<any>(`${BASE}/engagement?${query}`, data);
}

/**
 * PUT /engagement/{id}?departmentId=X&academicYear=Y
 */
export async function updateEngagementRecord(
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.put<any>(`${BASE}/engagement/${id}?${query}`, data);
}

/**
 * DELETE /engagement/{id}?departmentId=X&academicYear=Y
 */
export async function deleteEngagementRecord(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/engagement/${id}?${query}`);
}

/**
 * POST /engagement/upload?departmentId=X&academicYear=Y (multipart/form-data)
 */
export async function uploadEngagementCsv(
  departmentId: number,
  file: File,
  academicYear?: string
): Promise<any> {
  const query = qs({ departmentId, academicYear });
  const form = new FormData();
  form.append('file', file);
  return apiService.post<any>(`${BASE}/engagement/upload?${query}`, form);
}

// ─── 5. Alumni Contributions ────────────────────────────────────────────────

/**
 * GET /contributions?departmentId=X&academicYear=Y&page=&size=&search=
 */
export async function getContributionRecords(
  academicYear: string,
  departmentId: number,
  extra?: { alumniId?: string; contributionType?: string; page?: number; size?: number }
): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500, ...extra });
  return apiService.get<any>(`${BASE}/contributions?${query}`);
}

/**
 * POST /contributions?departmentId=X&academicYear=Y
 */
export async function createContributionRecord(
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.post<any>(`${BASE}/contributions?${query}`, data);
}

/**
 * PUT /contributions/{id}?departmentId=X&academicYear=Y
 */
export async function updateContributionRecord(
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.put<any>(`${BASE}/contributions/${id}?${query}`, data);
}

/**
 * DELETE /contributions/{id}?departmentId=X&academicYear=Y
 */
export async function deleteContributionRecord(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/contributions/${id}?${query}`);
}

/**
 * POST /contributions/upload?departmentId=X&academicYear=Y (multipart/form-data)
 */
export async function uploadContributionCsv(
  departmentId: number,
  file: File,
  academicYear?: string
): Promise<any> {
  const query = qs({ departmentId, academicYear });
  const form = new FormData();
  form.append('file', file);
  return apiService.post<any>(`${BASE}/contributions/upload?${query}`, form);
}

// ─── 6. Alumni Mentorship ───────────────────────────────────────────────────

/**
 * GET /mentorship?departmentId=X&academicYear=Y&page=&size=&search=
 */
export async function getMentorshipRecords(
  academicYear: string,
  departmentId: number,
  extra?: { alumniId?: string; page?: number; size?: number }
): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500, ...extra });
  return apiService.get<any>(`${BASE}/mentorship?${query}`);
}

/**
 * POST /mentorship?departmentId=X&academicYear=Y
 */
export async function createMentorshipRecord(
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.post<any>(`${BASE}/mentorship?${query}`, data);
}

/**
 * PUT /mentorship/{id}?departmentId=X&academicYear=Y
 */
export async function updateMentorshipRecord(
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.put<any>(`${BASE}/mentorship/${id}?${query}`, data);
}

/**
 * DELETE /mentorship/{id}?departmentId=X&academicYear=Y
 */
export async function deleteMentorshipRecord(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/mentorship/${id}?${query}`);
}

/**
 * POST /mentorship/upload?departmentId=X&academicYear=Y (multipart/form-data)
 */
export async function uploadMentorshipCsv(
  departmentId: number,
  file: File,
  academicYear?: string
): Promise<any> {
  const query = qs({ departmentId, academicYear });
  const form = new FormData();
  form.append('file', file);
  return apiService.post<any>(`${BASE}/mentorship/upload?${query}`, form);
}

// ─── 7. Alumni Achievements ─────────────────────────────────────────────────

/**
 * GET /achievements?departmentId=X&academicYear=Y&page=&size=&search=
 */
export async function getAchievementRecords(
  academicYear: string,
  departmentId: number,
  extra?: { alumniId?: string; page?: number; size?: number }
): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500, ...extra });
  return apiService.get<any>(`${BASE}/achievements?${query}`);
}

/**
 * POST /achievements?departmentId=X&academicYear=Y
 */
export async function createAchievementRecord(
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.post<any>(`${BASE}/achievements?${query}`, data);
}

/**
 * PUT /achievements/{id}?departmentId=X&academicYear=Y
 */
export async function updateAchievementRecord(
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.put<any>(`${BASE}/achievements/${id}?${query}`, data);
}

/**
 * DELETE /achievements/{id}?departmentId=X&academicYear=Y
 */
export async function deleteAchievementRecord(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/achievements/${id}?${query}`);
}

/**
 * POST /achievements/upload?departmentId=X&academicYear=Y (multipart/form-data)
 */
export async function uploadAchievementCsv(
  departmentId: number,
  file: File,
  academicYear?: string
): Promise<any> {
  const query = qs({ departmentId, academicYear });
  const form = new FormData();
  form.append('file', file);
  return apiService.post<any>(`${BASE}/achievements/upload?${query}`, form);
}

// ─── 8. Alumni Chapters ───────────────────────────────────────────────────

/**
 * GET /chapters?departmentId=X&academicYear=Y&page=&size=&search=
 */
export async function getChapterRecords(
  academicYear: string,
  departmentId: number,
  extra?: { page?: number; size?: number }
): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500, ...extra });
  return apiService.get<any>(`${BASE}/chapters?${query}`);
}

/**
 * POST /chapters?departmentId=X&academicYear=Y
 */
export async function createChapterRecord(
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.post<any>(`${BASE}/chapters?${query}`, data);
}

/**
 * PUT /chapters/{id}?departmentId=X&academicYear=Y
 */
export async function updateChapterRecord(
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.put<any>(`${BASE}/chapters/${id}?${query}`, data);
}

/**
 * DELETE /chapters/{id}?departmentId=X&academicYear=Y
 */
export async function deleteChapterRecord(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/chapters/${id}?${query}`);
}

/**
 * POST /chapters/upload?departmentId=X&academicYear=Y (multipart/form-data)
 */
export async function uploadChapterCsv(
  departmentId: number,
  file: File,
  academicYear?: string
): Promise<any> {
  const query = qs({ departmentId, academicYear });
  const form = new FormData();
  form.append('file', file);
  return apiService.post<any>(`${BASE}/chapters/upload?${query}`, form);
}

// ─── 9. Alumni Events ───────────────────────────────────────────────────────

/**
 * GET /events?departmentId=X&academicYear=Y&page=&size=&search=
 */
export async function getEventRecords(
  academicYear: string,
  departmentId: number,
  extra?: { page?: number; size?: number }
): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500, ...extra });
  return apiService.get<any>(`${BASE}/events?${query}`);
}

/**
 * POST /events?departmentId=X&academicYear=Y
 */
export async function createEventRecord(
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.post<any>(`${BASE}/events?${query}`, data);
}

/**
 * PUT /events/{id}?departmentId=X&academicYear=Y
 */
export async function updateEventRecord(
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.put<any>(`${BASE}/events/${id}?${query}`, data);
}

/**
 * DELETE /events/{id}?departmentId=X&academicYear=Y
 */
export async function deleteEventRecord(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/events/${id}?${query}`);
}

/**
 * POST /events/upload?departmentId=X&academicYear=Y (multipart/form-data)
 */
export async function uploadEventCsv(
  departmentId: number,
  file: File,
  academicYear?: string
): Promise<any> {
  const query = qs({ departmentId, academicYear });
  const form = new FormData();
  form.append('file', file);
  return apiService.post<any>(`${BASE}/events/upload?${query}`, form);
}

// ─── Evidence Repository APIs ───────────────────────────────────────────────────

export function getSectionName(tabId: string): string {
  switch (tabId) {
    case 'alumni-details':
      return 'details';
    case 'employment-career':
      return 'employment';
    case 'higher-education':
      return 'higher-education';
    case 'alumni-engagement':
      return 'engagement';
    case 'alumni-contributions':
      return 'contributions';
    case 'alumni-mentorship':
      return 'mentorship';
    case 'alumni-achievements':
      return 'achievements';
    case 'alumni-chapters':
      return 'chapters';
    case 'alumni-events':
      return 'events';
    default:
      return tabId.replace('alumni-', '');
  }
}

/**
 * POST /evidence/upload?departmentId=X&uploadedBy=Y (multipart/form-data)
 */
export async function uploadEvidenceDocument(params: {
  departmentId: number;
  uploadedBy: number;
  file: File;
  academicYear: string;
  sectionName: string;
  recordId: number | string;
  documentType?: string;
  yearOfStudy?: string;
  semester?: string;
}): Promise<any> {
  const query = qs({ departmentId: params.departmentId, uploadedBy: params.uploadedBy });
  const form = new FormData();
  form.append('file', params.file);
  form.append('academicYear', params.academicYear);
  form.append('sectionName', params.sectionName);
  form.append('recordId', String(params.recordId));
  if (params.documentType) form.append('documentType', params.documentType);
  if (params.yearOfStudy) form.append('yearOfStudy', params.yearOfStudy);
  if (params.semester) form.append('semester', params.semester);

  return apiService.post<any>(`${BASE}/evidence/upload?${query}`, form);
}

/**
 * GET /evidence?departmentId=X&academicYear=Y&sectionName=Z&recordId=...
 */
export async function getEvidenceDocuments(params: {
  departmentId: number;
  academicYear: string;
  sectionName?: string;
  recordId?: number | string;
  page?: number;
  size?: number;
}): Promise<any> {
  const query = qs({ size: 50, ...params });
  return apiService.get<any>(`${BASE}/evidence?${query}`);
}

/**
 * DELETE /evidence/{id}?departmentId=X
 */
export async function deleteEvidenceDocument(
  id: number | string,
  departmentId: number
): Promise<any> {
  const query = qs({ departmentId });
  return apiService.delete<any>(`${BASE}/evidence/${id}?${query}`);
}

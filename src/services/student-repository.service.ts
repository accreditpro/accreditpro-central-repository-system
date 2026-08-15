import { apiService } from './api.service';
import { authService } from './auth.service';

const BASE = '/v1/department-coordinator/student-repository';

// ─── Helper ───────────────────────────────────────────────────────────────────
function getEffectiveInstitutionId(institutionId?: number): number {
  if (institutionId) return institutionId;
  const user = authService.getStoredUser();
  if (user?.institutionId) return Number(user.institutionId);
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.institutionId) return Number(parsed.institutionId);
    }
  } catch {}
  return 1;
}

function qs(params: Record<string, string | number | boolean | undefined>): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  });
  return q.toString();
}

// ─── 1. Student Profiles ──────────────────────────────────────────────────────

export interface StudentProfileRecord {
  id?: number | string;
  registrationNumber: string;
  studentId: string;
  rollNumber: string;
  studentName: string;
  gender: string;
  dateOfBirth: string;
  aadhaarNumber?: string;
  emailAddress?: string;
  mobileNumber?: string;
  currentSemesterYear: number;
  studentStatus: string;
  department?: string;
  academicYear?: string;
  year?: string;
  semester?: string;
  status?: string;
  workflowStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getStudentProfiles(
  academicYear: string,
  departmentId: number,
  extra?: {
    year?: string;
    semester?: string;
    studentStatus?: string;
    search?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }
): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500, ...extra });
  return apiService.get<any>(`${BASE}/profiles?${query}`);
}

export async function getStudentProfileById(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.get<any>(`${BASE}/profiles/${id}?${query}`);
}

export async function createStudentProfile(
  academicYear: string,
  departmentId: number,
  data: Record<string, any>,
  institutionId?: number
): Promise<any> {
  const effectiveInstId = getEffectiveInstitutionId(institutionId);
  const query = qs({ academicYear, departmentId, institutionId: effectiveInstId });
  return apiService.post<any>(`${BASE}/profiles?${query}`, {
    ...data,
    institutionId: data.institutionId || effectiveInstId,
    departmentId,
    academicYear,
  });
}

export async function updateStudentProfile(
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>,
  institutionId?: number
): Promise<any> {
  const effectiveInstId = getEffectiveInstitutionId(institutionId);
  const query = qs({ academicYear, departmentId, institutionId: effectiveInstId });
  return apiService.put<any>(`${BASE}/profiles/${id}?${query}`, {
    ...data,
    institutionId: data.institutionId || effectiveInstId,
  });
}

export async function deleteStudentProfile(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/profiles/${id}?${query}`);
}

export async function uploadStudentProfilesCSV(
  departmentId: number,
  file: File,
  academicYear: string,
  institutionId?: number
): Promise<any> {
  const effectiveInstId = getEffectiveInstitutionId(institutionId);
  const query = qs({ departmentId, academicYear, institutionId: effectiveInstId });
  const form = new FormData();
  form.append('file', file);
  form.append('institutionId', String(effectiveInstId));
  form.append('departmentId', String(departmentId));
  form.append('academicYear', academicYear);
  return apiService.post<any>(`${BASE}/profiles/upload?${query}`, form);
}

export async function downloadStudentProfilesTemplate(
  departmentId: number,
  academicYear: string,
  format: string = 'csv'
): Promise<any> {
  const query = qs({ departmentId, academicYear, format });
  return apiService.get<any>(`${BASE}/profiles/template?${query}`);
}

export async function getStudentProfileStatistics(
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.get<any>(`${BASE}/profiles/statistics?${query}`);
}

// ─── 2. Admission Info ────────────────────────────────────────────────────────

export interface StudentAdmissionRecord {
  id?: number | string;
  registrationNumber: string;
  studentName: string;
  admissionYear: string;
  admissionType: string;
  admissionCategory: string;
  admissionRank?: number;
  admissionQuota?: string;
  stateOfOrigin?: string;
  country?: string;
  admissionStatus: string;
  department?: string;
  academicYear?: string;
  status?: string;
  workflowStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getStudentAdmissions(
  academicYear: string,
  departmentId: number,
  extra?: {
    admissionType?: string;
    admissionCategory?: string;
    admissionStatus?: string;
    registrationNumber?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }
): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500, ...extra });
  return apiService.get<any>(`${BASE}/admissions?${query}`);
}

export async function getStudentAdmissionById(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.get<any>(`${BASE}/admissions/${id}?${query}`);
}

export async function createStudentAdmission(
  academicYear: string,
  departmentId: number,
  data: Record<string, any>,
  institutionId?: number
): Promise<any> {
  const effectiveInstId = getEffectiveInstitutionId(institutionId);
  const query = qs({ academicYear, departmentId, institutionId: effectiveInstId });
  return apiService.post<any>(`${BASE}/admissions?${query}`, {
    ...data,
    institutionId: data.institutionId || effectiveInstId,
    departmentId,
    academicYear,
  });
}

export async function updateStudentAdmission(
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>,
  institutionId?: number
): Promise<any> {
  const effectiveInstId = getEffectiveInstitutionId(institutionId);
  const query = qs({ academicYear, departmentId, institutionId: effectiveInstId });
  return apiService.put<any>(`${BASE}/admissions/${id}?${query}`, {
    ...data,
    institutionId: data.institutionId || effectiveInstId,
  });
}

export async function deleteStudentAdmission(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/admissions/${id}?${query}`);
}

export async function uploadStudentAdmissionsCSV(
  departmentId: number,
  file: File,
  academicYear: string,
  institutionId?: number
): Promise<any> {
  const effectiveInstId = getEffectiveInstitutionId(institutionId);
  const query = qs({ departmentId, academicYear, institutionId: effectiveInstId });
  const form = new FormData();
  form.append('file', file);
  form.append('institutionId', String(effectiveInstId));
  form.append('departmentId', String(departmentId));
  form.append('academicYear', academicYear);
  return apiService.post<any>(`${BASE}/admissions/upload?${query}`, form);
}

export async function downloadStudentAdmissionsTemplate(
  departmentId: number,
  academicYear: string,
  format: string = 'csv'
): Promise<any> {
  const query = qs({ departmentId, academicYear, format });
  return apiService.get<any>(`${BASE}/admissions/template?${query}`);
}

// ─── 3. Student Diversity ─────────────────────────────────────────────────────

export interface StudentDiversityRecord {
  id?: number | string;
  registrationNumber: string;
  studentName: string;
  socialCategory: string;
  economicallyWeakerSection?: string;
  minorityStatus?: string;
  differentlyAbled?: string;
  nationality?: string;
  firstGenerationLearner?: string;
  department?: string;
  academicYear?: string;
  status?: string;
  workflowStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getStudentDiversity(
  academicYear: string,
  departmentId: number,
  extra?: {
    socialCategory?: string;
    differentlyAbled?: string;
    minorityStatus?: string;
    firstGenerationLearner?: string;
    registrationNumber?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }
): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500, ...extra });
  return apiService.get<any>(`${BASE}/diversity?${query}`);
}

export async function getStudentDiversityById(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.get<any>(`${BASE}/diversity/${id}?${query}`);
}

export async function createStudentDiversity(
  academicYear: string,
  departmentId: number,
  data: Record<string, any>,
  institutionId?: number
): Promise<any> {
  const effectiveInstId = getEffectiveInstitutionId(institutionId);
  const query = qs({ academicYear, departmentId, institutionId: effectiveInstId });
  return apiService.post<any>(`${BASE}/diversity?${query}`, {
    ...data,
    institutionId: data.institutionId || effectiveInstId,
    departmentId,
    academicYear,
  });
}

export async function updateStudentDiversity(
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>,
  institutionId?: number
): Promise<any> {
  const effectiveInstId = getEffectiveInstitutionId(institutionId);
  const query = qs({ academicYear, departmentId, institutionId: effectiveInstId });
  return apiService.put<any>(`${BASE}/diversity/${id}?${query}`, {
    ...data,
    institutionId: data.institutionId || effectiveInstId,
  });
}

export async function deleteStudentDiversity(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/diversity/${id}?${query}`);
}

export async function uploadStudentDiversityCSV(
  departmentId: number,
  file: File,
  academicYear: string,
  institutionId?: number
): Promise<any> {
  const effectiveInstId = getEffectiveInstitutionId(institutionId);
  const query = qs({ departmentId, academicYear, institutionId: effectiveInstId });
  const form = new FormData();
  form.append('file', file);
  form.append('institutionId', String(effectiveInstId));
  form.append('departmentId', String(departmentId));
  form.append('academicYear', academicYear);
  return apiService.post<any>(`${BASE}/diversity/upload?${query}`, form);
}

export async function downloadStudentDiversityTemplate(
  departmentId: number,
  academicYear: string,
  format: string = 'csv'
): Promise<any> {
  const query = qs({ departmentId, academicYear, format });
  return apiService.get<any>(`${BASE}/diversity/template?${query}`);
}

// ─── 4. MOOCs & Certifications ────────────────────────────────────────────────

export interface StudentMOOCRecord {
  id?: number | string;
  registrationNumber: string;
  studentName: string;
  platform: string;
  courseName: string;
  courseCategory?: string;
  conductedBy?: string;
  startDate?: string;
  completionDate?: string;
  durationHours?: number;
  grade?: string;
  score?: string;
  certificationStatus: string;
  certificateId?: string;
  academicYear?: string;
  remarks?: string;
  department?: string;
  status?: string;
  workflowStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getStudentMOOCs(
  academicYear: string,
  departmentId: number,
  extra?: {
    platform?: string;
    certificationStatus?: string;
    registrationNumber?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }
): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500, ...extra });
  return apiService.get<any>(`${BASE}/moocs?${query}`);
}

export async function getStudentMOOCById(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.get<any>(`${BASE}/moocs/${id}?${query}`);
}

export async function createStudentMOOC(
  academicYear: string,
  departmentId: number,
  data: Record<string, any>,
  institutionId?: number
): Promise<any> {
  const effectiveInstId = getEffectiveInstitutionId(institutionId);
  const query = qs({ academicYear, departmentId, institutionId: effectiveInstId });
  return apiService.post<any>(`${BASE}/moocs?${query}`, {
    ...data,
    institutionId: data.institutionId || effectiveInstId,
    departmentId,
    academicYear,
  });
}

export async function updateStudentMOOC(
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>,
  institutionId?: number
): Promise<any> {
  const effectiveInstId = getEffectiveInstitutionId(institutionId);
  const query = qs({ academicYear, departmentId, institutionId: effectiveInstId });
  return apiService.put<any>(`${BASE}/moocs/${id}?${query}`, {
    ...data,
    institutionId: data.institutionId || effectiveInstId,
  });
}

export async function deleteStudentMOOC(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/moocs/${id}?${query}`);
}

export async function uploadStudentMOOCsCSV(
  departmentId: number,
  file: File,
  academicYear: string,
  institutionId?: number
): Promise<any> {
  const effectiveInstId = getEffectiveInstitutionId(institutionId);
  const query = qs({ departmentId, academicYear, institutionId: effectiveInstId });
  const form = new FormData();
  form.append('file', file);
  form.append('institutionId', String(effectiveInstId));
  form.append('departmentId', String(departmentId));
  form.append('academicYear', academicYear);
  return apiService.post<any>(`${BASE}/moocs/upload?${query}`, form);
}

export async function downloadStudentMOOCsTemplate(
  departmentId: number,
  academicYear: string,
  format: string = 'csv'
): Promise<any> {
  const query = qs({ departmentId, academicYear, format });
  return apiService.get<any>(`${BASE}/moocs/template?${query}`);
}

// ─── 5. Scholarships & Freeships ──────────────────────────────────────────────

export interface StudentScholarshipRecord {
  id?: number | string;
  registrationNumber: string;
  studentName: string;
  scholarshipName: string;
  type: string;
  provider: string;
  amount: number;
  academicYear?: string;
  feeWaiverStatus?: string;
  disbursementStatus: string;
  department?: string;
  status?: string;
  workflowStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getStudentScholarships(
  academicYear: string,
  departmentId: number,
  extra?: {
    type?: string;
    disbursementStatus?: string;
    feeWaiverStatus?: string;
    registrationNumber?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }
): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500, ...extra });
  return apiService.get<any>(`${BASE}/scholarships?${query}`);
}

export async function getStudentScholarshipById(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.get<any>(`${BASE}/scholarships/${id}?${query}`);
}

export async function createStudentScholarship(
  academicYear: string,
  departmentId: number,
  data: Record<string, any>,
  institutionId?: number
): Promise<any> {
  const effectiveInstId = getEffectiveInstitutionId(institutionId);
  const query = qs({ academicYear, departmentId, institutionId: effectiveInstId });
  return apiService.post<any>(`${BASE}/scholarships?${query}`, {
    ...data,
    institutionId: data.institutionId || effectiveInstId,
    departmentId,
    academicYear,
  });
}

export async function updateStudentScholarship(
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>,
  institutionId?: number
): Promise<any> {
  const effectiveInstId = getEffectiveInstitutionId(institutionId);
  const query = qs({ academicYear, departmentId, institutionId: effectiveInstId });
  return apiService.put<any>(`${BASE}/scholarships/${id}?${query}`, {
    ...data,
    institutionId: data.institutionId || effectiveInstId,
  });
}

export async function deleteStudentScholarship(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/scholarships/${id}?${query}`);
}

export async function uploadStudentScholarshipsCSV(
  departmentId: number,
  file: File,
  academicYear: string,
  institutionId?: number
): Promise<any> {
  const effectiveInstId = getEffectiveInstitutionId(institutionId);
  const query = qs({ departmentId, academicYear, institutionId: effectiveInstId });
  const form = new FormData();
  form.append('file', file);
  form.append('institutionId', String(effectiveInstId));
  form.append('departmentId', String(departmentId));
  form.append('academicYear', academicYear);
  return apiService.post<any>(`${BASE}/scholarships/upload?${query}`, form);
}

export async function downloadStudentScholarshipsTemplate(
  departmentId: number,
  academicYear: string,
  format: string = 'csv'
): Promise<any> {
  const query = qs({ departmentId, academicYear, format });
  return apiService.get<any>(`${BASE}/scholarships/template?${query}`);
}

// ─── 6. Student Evidence ──────────────────────────────────────────────────────

export interface StudentEvidenceDocument {
  id: string;
  name: string;
  category?: string;
  version?: string;
  uploadedBy?: string;
  uploadedDate?: string;
  status?: string;
  fileType?: string;
  size?: string;
  downloadUrl?: string;
}

export async function getStudentEvidence(
  tabId: string,
  academicYear: string,
  departmentId: number,
  extra?: { category?: string; status?: string }
): Promise<any> {
  const query = qs({ tabId, academicYear, departmentId, ...extra });
  return apiService.get<any>(`${BASE}/evidence?${query}`);
}

export async function uploadStudentEvidence(
  departmentId: number,
  academicYear: string,
  file: File,
  tabId: string,
  category: string,
  department: string,
  description?: string
): Promise<any> {
  const query = qs({ departmentId, academicYear });
  const form = new FormData();
  // Backend requires 'request' as a JSON blob (multipart/form-data part) alongside the 'file' binary.
  // NOTE: Chrome DevTools shows Blob parts as "(binary)" — this is correct behavior for multipart uploads.
  const requestPayload = {
    tabId,
    category,
    description: description || `${category} document for ${academicYear}`,
    academicYear,
    department,
  };
  form.append('request', new Blob([JSON.stringify(requestPayload)], { type: 'application/json' }));
  form.append('file', file);
  return apiService.post<any>(`${BASE}/evidence/upload?${query}`, form);
}

export async function downloadStudentEvidence(
  id: string | number,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.get<any>(`${BASE}/evidence/${id}/download?${query}`);
}

export async function deleteStudentEvidence(
  id: string | number,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/evidence/${id}?${query}`);
}

// ─── 7. Health Metrics ────────────────────────────────────────────────────────

export interface StudentRepositoryMetrics {
  dataCompleteness: number;
  evidenceScore: number;
  verificationScore: number;
  readinessScore: number;
}

export async function getStudentRepositoryHealthMetrics(
  academicYear: string,
  departmentId: number
): Promise<StudentRepositoryMetrics> {
  const query = qs({ academicYear, departmentId });
  return apiService.get<any>(`${BASE}/health-metrics?${query}`).then((res) => {
    const data = res?.data ?? res ?? {};
    return {
      dataCompleteness: typeof data.dataCompleteness === 'number' ? data.dataCompleteness : 0,
      evidenceScore: typeof data.evidenceScore === 'number' ? data.evidenceScore : 0,
      verificationScore: typeof data.verificationScore === 'number' ? data.verificationScore : 0,
      readinessScore: typeof data.readinessScore === 'number' ? data.readinessScore : 0,
    };
  });
}

// ─── 8. Bulk Upload & Validation ─────────────────────────────────────────────

export interface BulkUploadOptions {
  department: string;
  year?: string;
  semester?: string;
  replaceExisting?: boolean;
  uploadSections?: string[];
  profileFile?: File;
  admissionFile?: File;
  diversityFile?: File;
  moocFile?: File;
  scholarshipFile?: File;
  institutionId?: number;
}

export async function bulkUploadStudentData(
  departmentId: number,
  academicYear: string,
  options: BulkUploadOptions
): Promise<any> {
  const effectiveInstId = getEffectiveInstitutionId(options.institutionId);
  const query = qs({ departmentId, academicYear, institutionId: effectiveInstId });
  const form = new FormData();
  // Backend requires 'request' as a JSON blob (required: academicYear, department)
  const requestPayload = {
    academicYear,
    department: options.department,
    year: options.year,
    semester: options.semester,
    replaceExisting: options.replaceExisting ?? false,
    uploadSections: options.uploadSections,
  };
  form.append('request', new Blob([JSON.stringify(requestPayload)], { type: 'application/json' }));
  if (options.profileFile) form.append('profileFile', options.profileFile);
  if (options.admissionFile) form.append('admissionFile', options.admissionFile);
  if (options.diversityFile) form.append('diversityFile', options.diversityFile);
  if (options.moocFile) form.append('moocFile', options.moocFile);
  if (options.scholarshipFile) form.append('scholarshipFile', options.scholarshipFile);
  return apiService.post<any>(`${BASE}/bulk-upload?${query}`, form);
}

export async function getStudentBulkUploadStatus(
  bulkUploadId: string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.get<any>(`${BASE}/bulk-upload/${bulkUploadId}/status?${query}`);
}

export async function getStudentValidationReport(
  tabId: string,
  academicYear: string,
  departmentId: number,
  uploadId?: string
): Promise<any> {
  const query = qs({ tabId, academicYear, departmentId, uploadId });
  return apiService.get<any>(`${BASE}/validation-report?${query}`);
}

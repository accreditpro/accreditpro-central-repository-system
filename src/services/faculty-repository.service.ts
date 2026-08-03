import { apiService } from './api.service';

const BASE = '/v1/department-coordinator/faculty-repository';

// ─── Helper ───────────────────────────────────────────────────────────────────
function qs(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  });
  return q.toString();
}

// ─── 1. Faculty Profiles ──────────────────────────────────────────────────────

export async function getFacultyProfiles(
  academicYear: string,
  departmentId: number,
  extra?: { search?: string; status?: string }
): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500, ...extra });
  return apiService.get<any>(`${BASE}/profiles?${query}`);
}

export async function createFacultyProfile(
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.post<any>(`${BASE}/profiles?${query}`, data);
}

export async function updateFacultyProfile(
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.put<any>(`${BASE}/profiles/${id}?${query}`, data);
}

export async function deleteFacultyProfile(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/profiles/${id}?${query}`);
}

export async function uploadFacultyProfilesCSV(
  departmentId: number,
  file: File,
  academicYear: string
): Promise<any> {
  const query = qs({ departmentId });
  const form = new FormData();
  form.append('file', file);
  form.append('academicYear', academicYear);
  return apiService.post<any>(`${BASE}/profiles/upload-csv?${query}`, form);
}

export async function downloadFacultyProfilesTemplate(
  academicYear: string,
  departmentId: number
): Promise<void> {
  await apiService.download(
    `${BASE}/profiles/template?${qs({ academicYear, departmentId })}`,
    `faculty_profiles_${academicYear}.csv`
  );
}

// ─── 2. Faculty Qualifications ────────────────────────────────────────────────

export async function getFacultyQualifications(
  academicYear: string,
  departmentId: number,
  extra?: { empCode?: string }
): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500, ...extra });
  return apiService.get<any>(`${BASE}/qualifications?${query}`);
}

export async function createFacultyQualification(
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.post<any>(`${BASE}/qualifications?${query}`, data);
}

export async function updateFacultyQualification(
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.put<any>(`${BASE}/qualifications/${id}?${query}`, data);
}

export async function deleteFacultyQualification(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/qualifications/${id}?${query}`);
}

export async function uploadFacultyQualificationsCSV(
  departmentId: number,
  file: File,
  academicYear: string
): Promise<any> {
  const query = qs({ departmentId });
  const form = new FormData();
  form.append('file', file);
  form.append('academicYear', academicYear);
  return apiService.post<any>(`${BASE}/qualifications/upload-csv?${query}`, form);
}

export async function downloadFacultyQualificationsTemplate(
  academicYear: string,
  departmentId: number
): Promise<void> {
  await apiService.download(
    `${BASE}/qualifications/template?${qs({ academicYear, departmentId })}`,
    `qualifications_${academicYear}.csv`
  );
}

// ─── 3. Faculty Employment ────────────────────────────────────────────────────

export async function getFacultyEmployment(
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500 });
  return apiService.get<any>(`${BASE}/employment?${query}`);
}

export async function createFacultyEmployment(
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.post<any>(`${BASE}/employment?${query}`, data);
}

export async function updateFacultyEmployment(
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.put<any>(`${BASE}/employment/${id}?${query}`, data);
}

export async function deleteFacultyEmployment(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/employment/${id}?${query}`);
}

export async function uploadFacultyEmploymentCSV(
  departmentId: number,
  file: File,
  academicYear: string
): Promise<any> {
  const query = qs({ departmentId });
  const form = new FormData();
  form.append('file', file);
  form.append('academicYear', academicYear);
  return apiService.post<any>(`${BASE}/employment/upload-csv?${query}`, form);
}

export async function downloadFacultyEmploymentTemplate(
  academicYear: string,
  departmentId: number
): Promise<void> {
  await apiService.download(
    `${BASE}/employment/template?${qs({ academicYear, departmentId })}`,
    `employment_info_${academicYear}.csv`
  );
}

// ─── 4. Professor of Practice ─────────────────────────────────────────────────

export async function getProfessionPractice(
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500 });
  return apiService.get<any>(`${BASE}/profession-practice?${query}`);
}

export async function createProfessionPractice(
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.post<any>(`${BASE}/profession-practice?${query}`, data);
}

export async function updateProfessionPractice(
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.put<any>(`${BASE}/profession-practice/${id}?${query}`, data);
}

export async function deleteProfessionPractice(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/profession-practice/${id}?${query}`);
}

export async function uploadProfessionPracticeCSV(
  departmentId: number,
  file: File,
  academicYear: string
): Promise<any> {
  const query = qs({ departmentId });
  const form = new FormData();
  form.append('file', file);
  form.append('academicYear', academicYear);
  return apiService.post<any>(`${BASE}/profession-practice/upload-csv?${query}`, form);
}

export async function downloadProfessionPracticeTemplate(
  academicYear: string,
  departmentId: number
): Promise<void> {
  await apiService.download(
    `${BASE}/profession-practice/template?${qs({ academicYear, departmentId })}`,
    `professor_of_practice_${academicYear}.csv`
  );
}

// ─── 5.1 Professional Memberships ────────────────────────────────────────────

export async function getMemberships(academicYear: string, departmentId: number): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500 });
  return apiService.get<any>(`${BASE}/professional-development/memberships?${query}`);
}

export async function createMembership(
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.post<any>(`${BASE}/professional-development/memberships?${query}`, data);
}

export async function updateMembership(
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.put<any>(`${BASE}/professional-development/memberships/${id}?${query}`, data);
}

export async function deleteMembership(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/professional-development/memberships/${id}?${query}`);
}

export async function uploadMembershipsCSV(
  departmentId: number,
  file: File,
  academicYear: string
): Promise<any> {
  const query = qs({ departmentId });
  const form = new FormData();
  form.append('file', file);
  form.append('academicYear', academicYear);
  return apiService.post<any>(
    `${BASE}/professional-development/memberships/upload-csv?${query}`,
    form
  );
}

// ─── 5.2 FDP / STTP Participations (INCONSISTENT PATHS!) ─────────────────────
// GET/POST/DELETE → fdp-participations (plural)
// PUT/upload-csv  → fdp-participation  (SINGULAR)

export async function getFDPParticipations(
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500 });
  return apiService.get<any>(`${BASE}/professional-development/fdp-participations?${query}`);
}

export async function createFDPParticipation(
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.post<any>(`${BASE}/professional-development/fdp-participations?${query}`, data);
}

export async function updateFDPParticipation(
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  // PUT uses SINGULAR path: fdp-participation
  const query = qs({ academicYear, departmentId });
  return apiService.put<any>(
    `${BASE}/professional-development/fdp-participation/${id}?${query}`,
    data
  );
}

export async function deleteFDPParticipation(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(
    `${BASE}/professional-development/fdp-participations/${id}?${query}`
  );
}

export async function uploadFDPParticipationsCSV(
  departmentId: number,
  file: File,
  academicYear: string
): Promise<any> {
  // upload-csv uses SINGULAR path: fdp-participation
  const query = qs({ departmentId });
  const form = new FormData();
  form.append('file', file);
  form.append('academicYear', academicYear);
  return apiService.post<any>(
    `${BASE}/professional-development/fdp-participation/upload-csv?${query}`,
    form
  );
}

// ─── 5.3 Resource Persons (INCONSISTENT PATHS!) ───────────────────────────────
// GET/POST/DELETE → resource-persons
// PUT/upload-csv  → faculty-resource-person (DIFFERENT PREFIX!)

export async function getResourcePersons(academicYear: string, departmentId: number): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500 });
  return apiService.get<any>(`${BASE}/professional-development/resource-persons?${query}`);
}

export async function createResourcePerson(
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.post<any>(`${BASE}/professional-development/resource-persons?${query}`, data);
}

export async function updateResourcePerson(
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  // PUT uses DIFFERENT PREFIX: faculty-resource-person
  const query = qs({ academicYear, departmentId });
  return apiService.put<any>(
    `${BASE}/professional-development/faculty-resource-person/${id}?${query}`,
    data
  );
}

export async function deleteResourcePerson(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/professional-development/resource-persons/${id}?${query}`);
}

export async function uploadResourcePersonsCSV(
  departmentId: number,
  file: File,
  academicYear: string
): Promise<any> {
  // upload-csv uses DIFFERENT PREFIX: faculty-resource-person
  const query = qs({ departmentId });
  const form = new FormData();
  form.append('file', file);
  form.append('academicYear', academicYear);
  return apiService.post<any>(
    `${BASE}/professional-development/faculty-resource-person/upload-csv?${query}`,
    form
  );
}

// ─── 5.4 MOOC / Online Certifications (INCONSISTENT PATHS!) ──────────────────
// GET/POST/DELETE → moocs
// PUT/upload-csv  → moocs-certification (DIFFERENT SUFFIX!)

export async function getMOOCs(academicYear: string, departmentId: number): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500 });
  return apiService.get<any>(`${BASE}/professional-development/moocs?${query}`);
}

export async function createMOOC(
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.post<any>(`${BASE}/professional-development/moocs?${query}`, data);
}

export async function updateMOOC(
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  // PUT uses DIFFERENT SUFFIX: moocs-certification
  const query = qs({ academicYear, departmentId });
  return apiService.put<any>(
    `${BASE}/professional-development/moocs-certification/${id}?${query}`,
    data
  );
}

export async function deleteMOOC(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/professional-development/moocs/${id}?${query}`);
}

export async function uploadMOOCsCSV(
  departmentId: number,
  file: File,
  academicYear: string
): Promise<any> {
  // upload-csv uses DIFFERENT SUFFIX: moocs-certification
  const query = qs({ departmentId });
  const form = new FormData();
  form.append('file', file);
  form.append('academicYear', academicYear);
  return apiService.post<any>(
    `${BASE}/professional-development/moocs-certification/upload-csv?${query}`,
    form
  );
}

// ─── 5.5 Department Organized Programs ───────────────────────────────────────

export async function getDeptOrganizedPrograms(
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500 });
  return apiService.get<any>(`${BASE}/professional-development/dept-organized?${query}`);
}

export async function createDeptOrganizedProgram(
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.post<any>(`${BASE}/professional-development/dept-organized?${query}`, data);
}

export async function updateDeptOrganizedProgram(
  id: number | string,
  academicYear: string,
  departmentId: number,
  data: Record<string, any>
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.put<any>(
    `${BASE}/professional-development/dept-organized/${id}?${query}`,
    data
  );
}

export async function deleteDeptOrganizedProgram(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/professional-development/dept-organized/${id}?${query}`);
}

export async function uploadDeptOrganizedCSV(
  departmentId: number,
  file: File,
  academicYear: string
): Promise<any> {
  const query = qs({ departmentId });
  const form = new FormData();
  form.append('file', file);
  form.append('academicYear', academicYear);
  return apiService.post<any>(
    `${BASE}/professional-development/dept-organized/upload-csv?${query}`,
    form
  );
}

// ─── 6. Evidence ──────────────────────────────────────────────────────────────

export async function getFacultyEvidence(
  academicYear: string,
  departmentId: number,
  extra?: { empCode?: string; category?: string; status?: string }
): Promise<any> {
  const query = qs({ academicYear, departmentId, size: 500, ...extra });
  return apiService.get<any>(`${BASE}/evidence?${query}`);
}

export async function uploadFacultyEvidence(
  departmentId: number,
  uploadedBy: number,
  file: File,
  data: {
    academicYear: string;
    sectionName: string;
    recordId: string | number;
    documentType?: string;
  }
): Promise<any> {
  const query = qs({ departmentId, uploadedBy });
  const form = new FormData();
  form.append('file', file);
  form.append('academicYear', data.academicYear);
  form.append('sectionName', data.sectionName);
  form.append('recordId', String(data.recordId));
  if (data.documentType) form.append('documentType', data.documentType);
  return apiService.post<any>(`${BASE}/evidence/upload?${query}`, form);
}

export async function deleteFacultyEvidence(
  id: number | string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.delete<any>(`${BASE}/evidence/${id}?${query}`);
}

// ─── 7. Health Metrics ────────────────────────────────────────────────────────

export async function getFacultyRepositoryHealth(
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
}

// ─── 8. Faculty Evidence Tab ────────────────────────────────────────────────────────

const FACULTY_EVIDENCE_BASE = '/v1/department-coordinator/faculty-repository/faculty-evidence';

export async function getFacultyEvidenceSummary(
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.get<any>(`${FACULTY_EVIDENCE_BASE}/summary?${query}`);
}

export async function getFacultyEvidenceDocuments(
  facultyId: string,
  academicYear: string,
  departmentId: number
): Promise<any> {
  const query = qs({ academicYear, departmentId });
  return apiService.get<any>(`${FACULTY_EVIDENCE_BASE}/${facultyId}/documents?${query}`);
}

export async function uploadFacultyEvidenceDocument(
  facultyId: string,
  file: File,
  data: {
    categoryId: string;
    documentCode: string;
    documentName: string;
    departmentId: number;
    academicYear: string;
    uploadedBy: string;
  }
): Promise<any> {
  const form = new FormData();
  form.append('file', file);
  form.append('categoryId', data.categoryId);
  form.append('documentCode', data.documentCode);
  form.append('documentName', data.documentName);
  form.append('departmentId', String(data.departmentId));
  form.append('academicYear', data.academicYear);
  form.append('uploadedBy', data.uploadedBy);

  return apiService.post<any>(`${FACULTY_EVIDENCE_BASE}/${facultyId}/upload`, form);
}

export async function deleteFacultyEvidenceDocumentVersion(
  versionId: string | number
): Promise<any> {
  return apiService.delete<any>(`${FACULTY_EVIDENCE_BASE}/documents/versions/${versionId}`);
}

export async function downloadFacultyEvidenceDocumentVersion(
  versionId: string | number,
  fileName: string
): Promise<void> {
  await apiService.download(
    `${FACULTY_EVIDENCE_BASE}/documents/versions/${versionId}/download`,
    fileName
  );
}

export async function getFacultyEvidenceActivity(
  facultyId: string,
  academicYear: string,
  departmentId: number,
  limit: number = 10
): Promise<any> {
  const query = qs({ academicYear, departmentId, limit });
  return apiService.get<any>(`${FACULTY_EVIDENCE_BASE}/${facultyId}/activity?${query}`);
}

// ─── 8. Faculty Metrics ───────────────────────────────────────────────────────

export interface FacultyMetrics {
  dataCompleteness: number;
  evidenceScore: number;
  verificationScore: number;
  readinessScore: number;
}

export async function getFacultyMetrics(
  academicYear: string,
  departmentId: number
): Promise<FacultyMetrics> {
  const query = qs({ academicYear, departmentId });
  return apiService.get<FacultyMetrics>(`${BASE}/metrics?${query}`);
}

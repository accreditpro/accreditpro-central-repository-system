import { apiService } from './api.service';

// ============================================================
// PAGINATION
// ============================================================

/** Spring Data Page envelope as returned by the backend */
export interface PaginatedData<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ============================================================
// RESPONSE DTOs (mirror backend examination response DTOs)
// ============================================================

export interface ExaminationScheduleRecord {
  id: string;
  institutionId: number;
  examinationOfficerId: number;
  academicYear: string;
  academicYearId?: number;
  semester: string;
  examinationType: string;
  program: string;
  programId?: number;
  department: string;
  departmentId?: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  status: string;
  schedulePdf?: string;
  supportingDocuments?: string[];
  evidenceCount: number;
  createdBy?: number;
  updatedBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExaminationCircularRecord {
  id: string;
  institutionId: number;
  examinationOfficerId: number;
  circularNumber: string;
  circularDate: string;
  title: string;
  description: string;
  category: string;
  status: string;
  pdf?: string;
  supportingDocuments?: string[];
  evidenceCount: number;
  createdBy?: number;
  updatedBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResultPublicationRecord {
  id: string;
  institutionId: number;
  examinationOfficerId: number;
  academicYear: string;
  academicYearId?: number;
  semester: string;
  examinationType: string;
  program: string;
  programId?: number;
  title: string;
  publicationDate: string;
  totalStudentsAppeared?: number;
  totalStudentsPassed?: number;
  passPercentage?: number;
  status: string;
  resultGazette?: string;
  resultSummary?: string;
  supportingDocuments?: string[];
  evidenceCount: number;
  createdBy?: number;
  updatedBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupplementaryExaminationRecord {
  id: string;
  institutionId: number;
  examinationOfficerId: number;
  academicYear: string;
  academicYearId?: number;
  semester: string;
  program: string;
  programId?: number;
  examinationName: string;
  startDate: string;
  endDate: string;
  totalStudentsAppeared?: number;
  totalStudentsPassed?: number;
  passPercentage?: number;
  status: string;
  notification?: string;
  schedule?: string;
  supportingDocuments?: string[];
  evidenceCount: number;
  createdBy?: number;
  updatedBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BacklogRecordApi {
  id: string;
  institutionId: number;
  examinationOfficerId: number;
  academicYear: string;
  semester: string;
  program: string;
  programId?: number;
  department: string;
  departmentId?: number;
  subjectCode: string;
  subjectName: string;
  studentsAppeared: number;
  studentsPassed: number;
  studentsFailed: number;
  passPercentage?: number;
  failPercentage?: number;
  createdBy?: number;
  updatedBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExaminationEvidenceFile {
  id: string;
  institutionId: number;
  examinationOfficerId: number;
  name: string;
  size: number;
  type: string;
  moduleId: string;
  moduleLabel: string;
  recordId: string;
  recordTitle: string;
  sectionId: string;
  sectionLabel: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedByUserId: number;
  scheduleId?: string;
  circularId?: string;
  resultId?: string;
  supplementaryId?: string;
  uploadedAt: string;
  academicYear: string;
}

export interface SupportingDocumentApi {
  id: string;
  institutionId: number;
  examinationOfficerId: number;
  category: string;
  title: string;
  description: string;
  academicYear: string;
  tags: string[];
  version: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedByUserId: number;
  uploadedAt: string;
}

export interface DocumentFolderSummary {
  id: string;
  category: string;
  label: string;
  description: string;
  documentCount: number;
  lastUpdated: string;
}

export interface CsvUploadResult {
  totalRows: number;
  importedCount: number;
  failedCount: number;
  /** Rows skipped because an identical record already exists. */
  duplicatesCount?: number;
  errors: string[];
  /** Per-row messages describing ignored duplicate records. */
  duplicateMessages?: string[];
}

export interface DashboardStats {
  totalExaminationSchedules: number;
  publishedResults: number;
  supplementaryExaminations: number;
  backlogRecords: number;
  activeCirculars: number;
}

export interface DashboardActivity {
  text: string;
  time: string;
  type: string;
  timestamp?: string;
}

export interface DashboardUpcomingActivity {
  text: string;
  date: string;
  startDate?: string;
  endDate?: string;
  type: string;
}

export interface DashboardScheduleSummary {
  id: string;
  title: string;
  academicYear: string;
  semester: string;
  program: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface DashboardResultSummary {
  id: string;
  title: string;
  academicYear: string;
  semester: string;
  program: string;
  publicationDate: string;
  status: string;
}

export interface DashboardCircularSummary {
  id: string;
  title: string;
  circularNumber: string;
  circularDate: string;
  category: string;
  status: string;
}

export interface DashboardSupplementarySummary {
  id: string;
  examinationName: string;
  academicYear: string;
  semester: string;
  program: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface ExaminationDashboardData {
  academicYear: string;
  stats: DashboardStats;
  recentActivities: DashboardActivity[];
  upcomingActivities: DashboardUpcomingActivity[];
  recentSchedules: DashboardScheduleSummary[];
  recentResults: DashboardResultSummary[];
  recentCirculars: DashboardCircularSummary[];
  upcomingSchedules: DashboardScheduleSummary[];
  upcomingSupplementary: DashboardSupplementarySummary[];
}

export interface GlobalSearchResult {
  moduleId: string;
  moduleLabel: string;
  recordId: string;
  recordTitle: string;
  matchedFields: Record<string, unknown>;
  status?: string;
  academicYear?: string;
}

export interface GlobalSearchData {
  query: string;
  totalResults: number;
  results: GlobalSearchResult[];
  moduleCounts: Record<string, number>;
}

export interface BacklogAnalyticsData {
  academicYear: string;
  summary: {
    totalStudentsAppeared: number;
    totalStudentsPassed: number;
    totalStudentsFailed: number;
    overallPassPercentage?: number;
  };
  subjectWise: {
    subjectCode: string;
    subjectName: string;
    studentsAppeared: number;
    studentsPassed: number;
    studentsFailed: number;
    passPercentage?: number;
  }[];
  departmentWise: {
    department: string;
    studentsAppeared: number;
    studentsPassed: number;
    studentsFailed: number;
    passPercentage?: number;
  }[];
  semesterWise: {
    semester: string;
    studentsAppeared: number;
    studentsPassed: number;
    studentsFailed: number;
    passPercentage?: number;
  }[];
}

// ============================================================
// REQUEST HELPERS
// ============================================================

export interface ModuleListParams {
  academicYear?: string;
  semester?: string;
  program?: string;
  status?: string;
  examinationType?: string;
  department?: string;
  category?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
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

class ExaminationRepositoryService {
  private readonly baseUrl = '/v1/examination-officer';

  /**
   * Descriptive CSV filenames per module, used as a fallback when the
   * server's Content-Disposition header is unavailable (e.g. stripped by
   * the browser). Matches the server-provided attachment names.
   */
  private readonly moduleCsvFilenames: Record<string, string> = {
    'examination-schedules': 'examination_schedules.csv',
    'examination-circulars': 'examination_circulars.csv',
    'result-publications': 'result_publications.csv',
    'supplementary-examinations': 'supplementary_examinations.csv',
    'backlog-repository': 'backlog_records.csv',
  };

  private csvFilename(module: string): string {
    return this.moduleCsvFilenames[module] ?? `${module}.csv`;
  }

  /**
   * Export filename embedding the academic year when known, e.g.
   * "examination_schedules_2025-26.csv". Matches the server-provided
   * attachment names; falls back to the plain module name otherwise.
   */
  private csvExportFilename(module: string, params?: ModuleListParams): string {
    const base = this.csvFilename(module).replace(/\.csv$/, '');
    const year = params?.academicYear;
    return year ? `${base}_${year}.csv` : `${base}.csv`;
  }

  // ---------- Generic module endpoints (features 1-4) ----------
  // module = one of: examination-schedules, examination-circulars,
  // result-publications, supplementary-examinations

  async getModuleRecords<T>(module: string, params?: ModuleListParams): Promise<PaginatedData<T>> {
    return apiService.get<PaginatedData<T>>(
      `${this.baseUrl}/${module}${toQuery(params as Record<string, unknown>)}`
    );
  }

  async getModuleRecord<T>(module: string, id: string): Promise<T> {
    return apiService.get<T>(`${this.baseUrl}/${module}/${id}`);
  }

  async createModuleRecord<T>(module: string, data: unknown): Promise<T> {
    return apiService.post<T>(`${this.baseUrl}/${module}`, data);
  }

  async updateModuleRecord<T>(module: string, id: string, data: unknown): Promise<T> {
    return apiService.put<T>(`${this.baseUrl}/${module}/${id}`, data);
  }

  async deleteModuleRecord(module: string, id: string): Promise<void> {
    return apiService.delete<void>(`${this.baseUrl}/${module}/${id}`);
  }

  async exportModuleCsv(module: string, params?: ModuleListParams): Promise<void> {
    return apiService.download(
      `${this.baseUrl}/${module}/export${toQuery(params as Record<string, unknown>)}`,
      this.csvExportFilename(module, params)
    );
  }

  /** Bulk-import module records via CSV upload (validated server-side per row). */
  async uploadModuleCsv(module: string, file: File, academicYear: string): Promise<CsvUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    return apiService.post<CsvUploadResult>(
      `${this.baseUrl}/${module}/upload${toQuery({ academicYear })}`,
      formData
    );
  }

  /** Download the header-only CSV template for a module. */
  async downloadModuleTemplate(module: string, filename?: string): Promise<void> {
    return apiService.download(
      `${this.baseUrl}/${module}/template`,
      filename ?? this.csvFilename(module).replace(/\.csv$/, '_template.csv')
    );
  }

  // ---------- Backlog repository (feature 5) ----------

  async getBacklogRecords(params?: ModuleListParams): Promise<PaginatedData<BacklogRecordApi>> {
    return apiService.get<PaginatedData<BacklogRecordApi>>(
      `${this.baseUrl}/backlog-repository${toQuery(params as Record<string, unknown>)}`
    );
  }

  async createBacklogRecord(data: unknown): Promise<BacklogRecordApi> {
    return apiService.post<BacklogRecordApi>(`${this.baseUrl}/backlog-repository`, data);
  }

  async updateBacklogRecord(id: string, data: unknown): Promise<BacklogRecordApi> {
    return apiService.put<BacklogRecordApi>(`${this.baseUrl}/backlog-repository/${id}`, data);
  }

  async deleteBacklogRecord(id: string): Promise<void> {
    return apiService.delete<void>(`${this.baseUrl}/backlog-repository/${id}`);
  }

  async getBacklogAnalytics(params?: {
    academicYear?: string;
    semester?: string;
    program?: string;
  }): Promise<BacklogAnalyticsData> {
    return apiService.get<BacklogAnalyticsData>(
      `${this.baseUrl}/backlog-repository/analytics${toQuery(params as Record<string, unknown>)}`
    );
  }

  async uploadBacklogCsv(file: File, academicYear: string): Promise<CsvUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    return apiService.post<CsvUploadResult>(
      `${this.baseUrl}/backlog-repository/upload${toQuery({ academicYear })}`,
      formData
    );
  }

  async exportBacklogCsv(params?: ModuleListParams): Promise<void> {
    return apiService.download(
      `${this.baseUrl}/backlog-repository/export${toQuery(params as Record<string, unknown>)}`,
      this.csvExportFilename('backlog-repository', params)
    );
  }

  // ---------- Evidence (features 1-4, 6) ----------

  async getEvidence(params?: {
    academicYear?: string;
    moduleId?: string;
    recordId?: string;
    sectionId?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedData<ExaminationEvidenceFile>> {
    return apiService.get<PaginatedData<ExaminationEvidenceFile>>(
      `${this.baseUrl}/evidence${toQuery(params as Record<string, unknown>)}`
    );
  }

  async uploadEvidence(input: {
    file: File;
    academicYear: string;
    moduleId: string;
    recordId: string;
    sectionId: string;
    recordTitle?: string;
  }): Promise<ExaminationEvidenceFile> {
    const formData = new FormData();
    formData.append('file', input.file);
    formData.append('academicYear', input.academicYear);
    formData.append('moduleId', input.moduleId);
    formData.append('recordId', input.recordId);
    formData.append('sectionId', input.sectionId);
    if (input.recordTitle) formData.append('recordTitle', input.recordTitle);
    return apiService.post<ExaminationEvidenceFile>(`${this.baseUrl}/evidence/upload`, formData);
  }

  async deleteEvidence(id: string): Promise<void> {
    return apiService.delete<void>(`${this.baseUrl}/evidence/${id}`);
  }

  async downloadEvidence(id: string, filename?: string): Promise<void> {
    return apiService.download(`${this.baseUrl}/evidence/${id}/download`, filename);
  }

  /** Fetch an evidence file as a blob for in-app preview (authenticated) */
  async getEvidenceBlob(id: string): Promise<Blob> {
    return apiService.getBlob(`${this.baseUrl}/evidence/${id}/download`);
  }

  // ---------- Supporting documents (feature 6) ----------

  async getDocumentFolders(): Promise<DocumentFolderSummary[]> {
    return apiService.get<DocumentFolderSummary[]>(`${this.baseUrl}/supporting-documents/folders`);
  }

  async getSupportingDocuments(params?: {
    category?: string;
    academicYear?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedData<SupportingDocumentApi>> {
    return apiService.get<PaginatedData<SupportingDocumentApi>>(
      `${this.baseUrl}/supporting-documents${toQuery(params as Record<string, unknown>)}`
    );
  }

  async uploadSupportingDocument(input: {
    file: File;
    title: string;
    description?: string;
    category: string;
    academicYear: string;
    tags?: string;
    version?: string;
  }): Promise<SupportingDocumentApi> {
    const formData = new FormData();
    formData.append('file', input.file);
    formData.append('title', input.title);
    if (input.description) formData.append('description', input.description);
    formData.append('category', input.category);
    formData.append('academicYear', input.academicYear);
    if (input.tags) formData.append('tags', input.tags);
    if (input.version) formData.append('version', input.version);
    return apiService.post<SupportingDocumentApi>(`${this.baseUrl}/supporting-documents/upload`, formData);
  }

  async deleteSupportingDocument(id: string): Promise<void> {
    return apiService.delete<void>(`${this.baseUrl}/supporting-documents/${id}`);
  }

  async downloadSupportingDocument(id: string, filename?: string): Promise<void> {
    return apiService.download(`${this.baseUrl}/supporting-documents/${id}/download`, filename);
  }

  /** Fetch a supporting document as a blob for in-app preview (authenticated) */
  async getSupportingDocumentBlob(id: string): Promise<Blob> {
    return apiService.getBlob(`${this.baseUrl}/supporting-documents/${id}/download`);
  }

  // ---------- Dashboard (feature 7) ----------

  async getDashboard(academicYear: string): Promise<ExaminationDashboardData> {
    return apiService.get<ExaminationDashboardData>(
      `${this.baseUrl}/dashboard${toQuery({ academicYear })}`
    );
  }

  // ---------- Global search (feature 8) ----------

  async globalSearch(params?: {
    query: string;
    academicYear?: string;
    moduleId?: string;
    page?: number;
    size?: number;
  }): Promise<GlobalSearchData> {
    return apiService.get<GlobalSearchData>(
      `${this.baseUrl}/search${toQuery(params as Record<string, unknown>)}`
    );
  }
}

export const examinationRepositoryService = new ExaminationRepositoryService();

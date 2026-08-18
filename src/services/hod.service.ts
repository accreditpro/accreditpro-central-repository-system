import { apiService } from './api.service';
import { PaginatedData } from './examination-repository.service';

// ============================================================
// RESPONSE DTOs (mirror backend hod DTOs)
// ============================================================

export type EvidenceStatus = 'pending' | 'approved' | 'rejected' | 'changes-requested';

export interface EvidenceVersionDto {
  version: string;
  date: string;
  actor: string;
  note: string;
}

export interface EvidenceItemDto {
  id: string;
  repository: string;
  section: string;
  uploadedBy: string;
  documentName: string;
  documentCategory: string;
  uploadDate: string;
  status: EvidenceStatus;
  fileType: string;
  fileSize?: string;
  version: string;
  reviewNote?: string;
  reviewedBy?: string;
  reviewDate?: string;
  history: EvidenceVersionDto[];
}

export interface GapAccreditationDto {
  naac: { criterion: string; impact: string };
  nba: { criterion: string; impact: string };
  nirf: { criterion: string; impact: string };
}

export interface GapItemDto {
  id: string;
  category: string;
  description: string;
  repository: string;
  section: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
  recommendation: string;
  accreditation?: GapAccreditationDto;
}

export interface ReadinessDataDto {
  repository: string;
  weight: number;
  dataCompletion: number;
  evidenceCompletion: number;
  verification: number;
  approval: number;
}

export interface YearlyTrendDto {
  year: string;
  academic: number;
  faculty: number;
  student: number;
  research: number;
  alumni: number;
}

export interface AiInsightDto {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'critical' | 'success' | 'info';
}

export interface AccreditationCriterionDto {
  name: string;
  weightage: number;
  completion: number;
  status: 'ready' | 'in-progress' | 'not-started';
}

export interface AccreditationFrameworkDto {
  id: 'naac' | 'nba' | 'nirf';
  name: string;
  readiness: number;
  status: 'ready' | 'in-progress' | 'not-started';
  criteria: AccreditationCriterionDto[];
}

export interface RepositoryStatusDto {
  id: string;
  name: string;
  owner: string;
  completion: number;
  evidence: number;
  verification: number;
  pendingTasks: number;
  status: 'on-track' | 'at-risk' | 'critical' | 'completed';
}

export interface EvidenceSummaryDto {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  changesRequested: number;
}

export interface EvidenceObservationDto {
  id: string;
  documentId?: string;
  documentName?: string;
  department?: string;
  repository?: string;
  folder?: string;
  category?: string;
  title: string;
  priority: string;
  description?: string;
  recommendedCorrection?: string;
  dueDate: string;
  status: string;
  raisedBy?: string;
  raisedAt?: string;
}

export interface ActivityItemDto {
  id: string;
  type: string;
  description: string;
  user: string;
  timestamp: string;
  repository: string;
}

export interface HodDashboardDto {
  repositoryOverview: RepositoryStatusDto[];
  readiness: ReadinessDataDto[];
  evidence: EvidenceItemDto[];
  gaps: GapItemDto[];
  analytics: AnalyticsDto;
  activities: ActivityItemDto[];
  insights: AiInsightDto[];
  health: number;
  accreditation: AccreditationFrameworkDto[];
  evidenceSummary?: EvidenceSummaryDto;
  observations?: EvidenceObservationDto[];
}

export interface AnalyticsDto {
  facultyCount: number;
  students: number;
  research: number;
  placements: number;
  passPercentage: number;
  publications: number;
  patents: number;
  projects: number;
  facultyQualification?: { qualification: string; count: number; percentage: number }[];
  studentPerformance?: { category: string; percentage: number }[];
  researchMetrics?: { metric: string; value: number; target: number }[];
}

export interface HodReadinessDto {
  readiness: ReadinessDataDto[];
  trends: YearlyTrendDto[];
  overallScore: number;
}

export interface ReportTypeDto {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface RecentReportDto {
  id: string;
  name: string;
  generatedOn: string;
  format: string;
  size?: string;
}

export interface HodReportsDto {
  reportTypes: ReportTypeDto[];
  recentReports: RecentReportDto[];
}

// ============================================================
// REQUEST HELPERS
// ============================================================

export interface EvidenceListParams {
  academicYear?: string;
  status?: string;
  repository?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface GapListParams {
  academicYear?: string;
  severity?: string;
  repository?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface ActivityListParams {
  academicYear?: string;
  type?: string;
  repository?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface ReviewRequest {
  action: EvidenceStatus;
  note?: string;
}

export interface BulkReviewRequest {
  evidenceIds: number[];
  action: EvidenceStatus;
  note?: string;
}

export interface GenerateReportRequest {
  reportType: string;
  format: string;
  academicYear?: string;
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

class HodService {
  private readonly baseUrl = '/v1/head-of-department';

  // ---------- Dashboard ----------

  getDashboard(academicYear?: string): Promise<HodDashboardDto> {
    return apiService.get<HodDashboardDto>(`${this.baseUrl}/dashboard${toQuery({ academicYear })}`);
  }

  // ---------- Evidence ----------

  getEvidence(params: EvidenceListParams = {}): Promise<PaginatedData<EvidenceItemDto>> {
    return apiService.get<PaginatedData<EvidenceItemDto>>(
      `${this.baseUrl}/evidence${toQuery(params as unknown as Record<string, unknown>)}`
    );
  }

  getEvidenceById(id: string): Promise<EvidenceItemDto> {
    return apiService.get<EvidenceItemDto>(`${this.baseUrl}/evidence/${id}`);
  }

  reviewEvidence(id: string, request: ReviewRequest): Promise<EvidenceItemDto> {
    return apiService.post<EvidenceItemDto>(`${this.baseUrl}/evidence/${id}/review`, request);
  }

  bulkReviewEvidence(request: BulkReviewRequest): Promise<EvidenceItemDto[]> {
    return apiService.post<EvidenceItemDto[]>(`${this.baseUrl}/evidence/bulk-review`, request);
  }

  /** Download an evidence file (streamed by the backend with auth). */
  downloadEvidence(id: string, filename?: string): Promise<void> {
    return apiService.download(`${this.baseUrl}/evidence/${id}/download`, filename);
  }

  /** Fetch an evidence file as a blob for in-app preview. */
  async getEvidenceBlob(id: string): Promise<Blob> {
    return apiService.getBlob(`${this.baseUrl}/evidence/${id}/download`);
  }

  // ---------- Gaps ----------

  getGaps(params: GapListParams = {}): Promise<PaginatedData<GapItemDto>> {
    return apiService.get<PaginatedData<GapItemDto>>(
      `${this.baseUrl}/gaps${toQuery(params as unknown as Record<string, unknown>)}`
    );
  }

  // ---------- Readiness ----------

  getReadiness(academicYear?: string): Promise<HodReadinessDto> {
    return apiService.get<HodReadinessDto>(`${this.baseUrl}/readiness${toQuery({ academicYear })}`);
  }

  // ---------- Analytics ----------

  getAnalytics(academicYear?: string): Promise<AnalyticsDto> {
    return apiService.get<AnalyticsDto>(`${this.baseUrl}/analytics${toQuery({ academicYear })}`);
  }

  // ---------- Activities ----------

  getActivities(params: ActivityListParams = {}): Promise<PaginatedData<ActivityItemDto>> {
    return apiService.get<PaginatedData<ActivityItemDto>>(
      `${this.baseUrl}/activities${toQuery(params as unknown as Record<string, unknown>)}`
    );
  }

  // ---------- Reports ----------

  getReports(): Promise<HodReportsDto> {
    return apiService.get<HodReportsDto>(`${this.baseUrl}/reports`);
  }

  generateReport(request: GenerateReportRequest): Promise<RecentReportDto> {
    return apiService.post<RecentReportDto>(`${this.baseUrl}/reports/generate`, request);
  }

  emailReport(reportId: string, email?: string): Promise<void> {
    return apiService.post<void>(`${this.baseUrl}/reports/${reportId}/email${toQuery({ email })}`);
  }

  downloadReport(reportId: string, filename?: string): Promise<void> {
    return apiService.download(`${this.baseUrl}/reports/${reportId}/download`, filename);
  }
}

export const hodService = new HodService();

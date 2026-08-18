import { apiService } from './api.service';
import { PaginatedData } from './examination-repository.service';

// ============================================================
// RESPONSE DTOs (mirror backend iqac DTOs verbatim)
// ============================================================

export type TrafficStatus = 'ready' | 'attention' | 'critical';

export interface DashboardKpisDto {
  repositoryReadiness: number;
  nbaReadiness: number;
  naacReadiness: number;
  nirfReadiness: number;
  evidenceCompletion: number;
  departmentsReady: number;
  departmentsNeedingAttention: number;
  criticalDepartments: number;
  criticalGaps: number;
  pendingHodApprovals: number;
  activeObservations: number;
}

export interface InstitutionOverallDto {
  repositoryCompletion: number;
  evidenceCompletion: number;
  nba: number;
  naac: number;
  nirf: number;
}

export interface DepartmentReadinessRowDto {
  code: string;
  name: string;
  repositoryCompletion: number;
  nba: number;
  naac: number;
  nirf: number;
  status: TrafficStatus;
}

export interface VerificationSummaryDto {
  totalDocuments: number;
  pendingHodApproval: number;
  approvedNotVerified: number;
  verified: number;
  observationRaised: number;
  rejected: number;
  criticalObservations: number;
  openObservations: number;
  departmentWise: { department: string; total: number; verified: number; pending: number }[];
  repositoryWise: { repository: string; total: number; verified: number; pending: number }[];
}

export interface DashboardTrendsDto {
  years: string[];
  repositoryCompletion: number[];
  accreditationReadiness: number[];
  evidenceCompletion: number[];
}

export interface DashboardDto {
  kpis: DashboardKpisDto;
  institutionOverall: InstitutionOverallDto;
  departmentReadiness: DepartmentReadinessRowDto[];
  verificationSummary: VerificationSummaryDto;
  trends: DashboardTrendsDto;
}

export interface InstitutionReadinessDto {
  overall: InstitutionOverallDto;
  departments: {
    code: string;
    name: string;
    repositoryCompletion: number;
    status: TrafficStatus;
    repositories: {
      repo: string;
      completion: number;
      approved: number;
      pending: number;
      missing: number;
    }[];
  }[];
  repositories: {
    repository: string;
    totalRecords: number;
    approvedRecords: number;
    missingRecords: number;
    evidenceCompletion: number;
    readiness: number;
    status: TrafficStatus;
  }[];
}

export interface DepartmentReadinessDto {
  matrix: {
    code: string;
    name: string;
    readiness: number;
    status: TrafficStatus;
    repositories: { repo: string; completion: number }[];
  }[];
  drillDown: DrillDepartmentDto[];
}

export interface DrillEvidenceDto {
  name: string;
  fileType: string;
  size: string;
  status: 'approved' | 'uploaded' | 'pending' | 'rejected';
  uploadedBy: string;
  date: string;
}

export interface DrillFolderDto {
  folder: string;
  required: number;
  evidence: DrillEvidenceDto[];
}

export interface DrillRepositoryDto {
  repository: string;
  completion: number;
  folders: DrillFolderDto[];
}

export interface DrillDepartmentDto {
  code: string;
  name: string;
  repositories: DrillRepositoryDto[];
}

export interface RepositoryMonitoringDto {
  repository: string;
  totalRecords: number;
  pendingUploads: number;
  missingEvidence: number;
  pendingHodApproval: number;
  approvedRecords: number;
  completion: number;
  status: TrafficStatus;
}

export interface AccreditationDto {
  nba: {
    overall: number;
    criteria: { name: string; value: number; weight: number }[];
    departments: { dept: string; scores: number[]; overall: number }[];
  };
  naac: {
    overall: number;
    criteria: {
      id: string;
      name: string;
      weightage: number;
      completion: number;
      evidence: number;
      status: string;
    }[];
    departments: { dept: string; scores: number[]; overall: number }[];
  };
  nirf: {
    overall: number;
    parameters: { id: string; name: string; weightage: number; score: number }[];
    departments: { dept: string; scores: number[]; overall: number }[];
  };
}

export interface GapDto {
  id: string;
  scope: 'repository' | 'evidence' | 'criterion' | 'department' | 'year';
  department?: string;
  repository?: string;
  framework?: 'NBA' | 'NAAC' | 'NIRF' | 'All';
  criterion?: string;
  current: number;
  target: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  suggestedAction: string;
}

export interface GapAnalysisDto {
  stats: { critical: number; total: number };
  repository: GapDto[];
  evidence: GapDto[];
  criterion: GapDto[];
  department: GapDto[];
  year: GapDto[];
}

export interface AnalyticsTrendsDto {
  years: string[];
  repositoryCompletion: number[];
  accreditationReadiness: number[];
  evidenceCompletion: number[];
}

// ============================================================
// IQAC-OWNED ARTIFACTS
// ============================================================

export interface QualityObservationDto {
  id: string;
  title: string;
  department: string;
  repository: string;
  academicYear: string;
  framework: 'NBA' | 'NAAC' | 'NIRF' | 'All';
  criterion?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendedAction: string;
  dueDate: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdBy: string;
  createdAt: string;
  assignedTo?: string;
  resolution?: string;
  resolvedAt?: string;
}

export interface ImprovementInitiativeDto {
  id: string;
  title: string;
  category: string;
  department: string;
  academicYear: string;
  description: string;
  owner: string;
  startDate: string;
  targetDate: string;
  status: 'not-started' | 'in-progress' | 'on-track' | 'delayed' | 'completed';
  outcome?: string;
}

export interface IqacDocVersionDto {
  version: string;
  uploadedBy: string;
  uploadedDate: string;
  note?: string;
  fileSize: string;
}

export interface IqacDocumentDto {
  id: string;
  folder: string;
  name: string;
  description: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'zip';
  size: string;
  uploadedBy: string;
  uploadedDate: string;
  tags: string[];
  versions: IqacDocVersionDto[];
}

// ============================================================
// VERIFICATION
// ============================================================

export interface VerificationDocumentDto {
  id: string;
  name: string;
  department: string;
  departmentName: string;
  academicYear: string;
  repository: string;
  folder: string;
  category: string;
  faculty?: string;
  student?: string;
  fileType: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  lastModified: string;
  version: number;
  frameworks: string[];
  hodStatus: 'pending' | 'approved' | 'rejected';
  hodApprovedAt?: string;
  iqacStatus: 'not-verified' | 'verified' | 'observation-raised';
  verifiedBy?: string;
  verifiedAt?: string;
  comments?: string;
}

export interface EvidenceObservationDto {
  id: string;
  documentId: string;
  documentName: string;
  department: string;
  repository: string;
  folder: string;
  category: string;
  faculty?: string;
  student?: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendedCorrection: string;
  dueDate: string;
  status: 'open' | 'in-progress' | 'resolved' | 'verified';
  raisedBy: string;
  raisedAt: string;
  response?: string;
  respondedAt?: string;
  verifiedAt?: string;
}

// ============================================================
// REQUEST HELPERS
// ============================================================

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

class IqacService {
  private readonly baseUrl = '/v1/iqac';

  // ---------- Dashboard & monitoring (read-only) ----------

  getDashboard(academicYear?: string): Promise<DashboardDto> {
    return apiService.get<DashboardDto>(`${this.baseUrl}/dashboard${toQuery({ academicYear })}`);
  }

  getInstitutionReadiness(academicYear?: string): Promise<InstitutionReadinessDto> {
    return apiService.get<InstitutionReadinessDto>(
      `${this.baseUrl}/institution-readiness${toQuery({ academicYear })}`
    );
  }

  getDepartments(params?: {
    academicYear?: string;
    department?: string;
    program?: string;
    search?: string;
  }): Promise<DepartmentReadinessDto> {
    return apiService.get<DepartmentReadinessDto>(
      `${this.baseUrl}/departments${toQuery(params as Record<string, unknown>)}`
    );
  }

  getRepositoryMonitoring(status?: string): Promise<RepositoryMonitoringDto[]> {
    return apiService.get<RepositoryMonitoringDto[]>(
      `${this.baseUrl}/repository-monitoring${toQuery({ status })}`
    );
  }

  getAccreditation(framework?: string): Promise<AccreditationDto> {
    return apiService.get<AccreditationDto>(`${this.baseUrl}/accreditation${toQuery({ framework })}`);
  }

  getGaps(scope?: string): Promise<GapAnalysisDto> {
    return apiService.get<GapAnalysisDto>(`${this.baseUrl}/gaps${toQuery({ scope })}`);
  }

  getAnalytics(): Promise<AnalyticsTrendsDto> {
    return apiService.get<AnalyticsTrendsDto>(`${this.baseUrl}/analytics`);
  }

  // ---------- Quality observations ----------

  getObservations(params?: {
    search?: string;
    status?: string;
    priority?: string;
    department?: string;
    framework?: string;
  }): Promise<QualityObservationDto[]> {
    return apiService.get<QualityObservationDto[]>(
      `${this.baseUrl}/observations${toQuery(params as Record<string, unknown>)}`
    );
  }

  createObservation(data: Partial<QualityObservationDto>): Promise<QualityObservationDto> {
    return apiService.post<QualityObservationDto>(`${this.baseUrl}/observations`, data);
  }

  updateObservation(
    id: string,
    data: { status?: string; priority?: string; resolution?: string }
  ): Promise<QualityObservationDto> {
    return apiService.patch<QualityObservationDto>(`${this.baseUrl}/observations/${id}`, data);
  }

  deleteObservation(id: string): Promise<void> {
    return apiService.delete<void>(`${this.baseUrl}/observations/${id}`);
  }

  // ---------- Improvement initiatives ----------

  getInitiatives(params?: {
    search?: string;
    status?: string;
    category?: string;
    department?: string;
  }): Promise<ImprovementInitiativeDto[]> {
    return apiService.get<ImprovementInitiativeDto[]>(
      `${this.baseUrl}/initiatives${toQuery(params as Record<string, unknown>)}`
    );
  }

  createInitiative(data: Partial<ImprovementInitiativeDto>): Promise<ImprovementInitiativeDto> {
    return apiService.post<ImprovementInitiativeDto>(`${this.baseUrl}/initiatives`, data);
  }

  updateInitiative(
    id: string,
    data: { status?: string; outcome?: string; title?: string; description?: string; owner?: string }
  ): Promise<ImprovementInitiativeDto> {
    return apiService.patch<ImprovementInitiativeDto>(`${this.baseUrl}/initiatives/${id}`, data);
  }

  // ---------- Supporting documents ----------

  getDocuments(params?: { folder?: string; search?: string }): Promise<IqacDocumentDto[]> {
    return apiService.get<IqacDocumentDto[]>(
      `${this.baseUrl}/documents${toQuery(params as Record<string, unknown>)}`
    );
  }

  uploadDocument(formData: FormData): Promise<IqacDocumentDto> {
    return apiService.post<IqacDocumentDto>(`${this.baseUrl}/documents`, formData);
  }

  addDocumentVersion(id: string, formData: FormData): Promise<IqacDocumentDto> {
    return apiService.post<IqacDocumentDto>(`${this.baseUrl}/documents/${id}/versions`, formData);
  }

  downloadDocument(id: string, filename?: string): Promise<void> {
    return apiService.download(`${this.baseUrl}/documents/${id}/download`, filename);
  }

  // ---------- Verification ----------

  getVerificationDocuments(params?: {
    academicYear?: string;
    department?: string;
    repository?: string;
    folder?: string;
    faculty?: string;
    student?: string;
    framework?: string;
    iqacStatus?: string;
    hodStatus?: string;
    search?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }): Promise<PaginatedData<VerificationDocumentDto>> {
    return apiService.get<PaginatedData<VerificationDocumentDto>>(
      `${this.baseUrl}/verification/documents${toQuery(params as Record<string, unknown>)}`
    );
  }

  getVerificationSummary(academicYear?: string): Promise<VerificationSummaryDto> {
    return apiService.get<VerificationSummaryDto>(
      `${this.baseUrl}/verification/summary${toQuery({ academicYear })}`
    );
  }

  getVerificationObservations(params?: {
    department?: string;
    status?: string;
  }): Promise<EvidenceObservationDto[]> {
    return apiService.get<EvidenceObservationDto[]>(
      `${this.baseUrl}/verification/observations${toQuery(params as Record<string, unknown>)}`
    );
  }

  verifyDocument(id: string, data?: { comments?: string }): Promise<VerificationDocumentDto> {
    return apiService.post<VerificationDocumentDto>(
      `${this.baseUrl}/verification/documents/${id}/verify`,
      data ?? {}
    );
  }

  raiseVerificationObservation(
    id: string,
    data: {
      title: string;
      priority: string;
      description: string;
      recommendedCorrection: string;
      dueDate: string;
    }
  ): Promise<EvidenceObservationDto> {
    return apiService.post<EvidenceObservationDto>(
      `${this.baseUrl}/verification/documents/${id}/observations`,
      data
    );
  }

  updateVerificationObservation(
    id: string,
    data: { status?: string; response?: string }
  ): Promise<EvidenceObservationDto> {
    return apiService.patch<EvidenceObservationDto>(
      `${this.baseUrl}/verification/observations/${id}`,
      data
    );
  }

  verifyObservation(id: string, comments?: string): Promise<EvidenceObservationDto> {
    return apiService.post<EvidenceObservationDto>(
      `${this.baseUrl}/verification/observations/${id}/verify`,
      comments ? { comments } : {}
    );
  }
}

export const iqacService = new IqacService();

import { apiService } from './api.service';
import { PaginatedData } from './examination-repository.service';

// ============================================================
// RESPONSE DTOs (mirror backend principal DTOs)
// ============================================================

export interface KpiDto {
  repositoryCompletion: number;
  naacReadiness: number;
  nbaReadiness: number;
  nirfReadiness: number;
  evidenceCompletion: number;
  pendingApprovals: number;
  departments: number;
  programs: number;
  faculty: number;
  students: number;
  iqacObservations: number;
  criticalGaps: number;
}

export interface InfrastructureStatsDto {
  buildings: number;
  labs: number;
  library: string;
  ict: string;
}

export interface InstitutionStatsDto {
  programs: number;
  departments: number;
  students: number;
  faculty: number;
  researchPublications: number;
  patents: number;
  placementRate: number;
  averagePackage: string;
  highestPackage: string;
  recruiters: number;
  infrastructure?: InfrastructureStatsDto;
  budget: string;
  expenditure: string;
}

export interface DepartmentSummaryDto {
  code: string;
  name: string;
  readiness: number;
  nba: number;
  naac: number;
  nirf: number;
}

export interface CriticalGapDto {
  department: string;
  repository: string;
  framework: string;
  priority: string;
}

export interface PrincipalDashboardDto {
  academicYear: string;
  kpi: KpiDto;
  institutionStats: InstitutionStatsDto;
  departments: DepartmentSummaryDto[];
  criticalGaps: CriticalGapDto[];
}

export interface DeptRepoRowDto {
  repo: string;
  completion: number;
  approved: number;
  pending: number;
  missing: number;
}

export interface DepartmentRepositoryDto {
  code: string;
  name: string;
  readiness: number;
  repositories: DeptRepoRowDto[];
}

export interface DrillDocumentDto {
  name: string;
  status: string;
}

export interface DrillFolderDto {
  folder: string;
  documents: DrillDocumentDto[];
}

export interface DrillRepositoryDto {
  repo: string;
  completion: number;
  approved: number;
  pending: number;
  missing: number;
  folders: DrillFolderDto[];
}

export interface DrillDepartmentDto {
  code: string;
  name: string;
  readiness: number;
  repositories: DrillRepositoryDto[];
}

export interface PrincipalRepositoryReadinessDto {
  academicYear: string;
  institutionCompletion: number;
  departments: DrillDepartmentDto[];
}

export interface NbaCriterionDto {
  name: string;
  weightage: number;
}

export interface NaacCriterionDto {
  id: string;
  name: string;
  weightage: number;
  completion: number;
  evidence: number;
  status: string;
}

export interface NirfParameterDto {
  id: string;
  name: string;
  weightage: number;
  score: number;
  status: string;
}

export interface DeptScoreDto {
  dept: string;
  scores: number[];
  overall: number;
}

export interface NbaDto {
  overall: number;
  criteria: NbaCriterionDto[];
  departments: DeptScoreDto[];
}

export interface NaacDto {
  overall: number;
  criteria: NaacCriterionDto[];
  departments: DeptScoreDto[];
}

export interface NirfDto {
  overall: number;
  parameters: NirfParameterDto[];
  departments: DeptScoreDto[];
}

export interface PrincipalAccreditationDto {
  academicYear: string;
  nba: NbaDto;
  naac: NaacDto;
  nirf: NirfDto;
}

export interface PrincipalGapDto {
  id: string;
  department: string;
  repository: string;
  framework: string;
  description: string;
  current: number;
  target: number;
  priority: string;
  missingData: string[];
  missingEvidence: string[];
  pendingApproval: string;
  iqacObservation: string;
  recommendedActions: string[];
}

export interface PrincipalGapResponseDto {
  content: PrincipalGapDto[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export interface DeptAcademicDto {
  dept: string;
  passPercentage: number;
  backlogPercentage: number;
  semesterResults: number;
  courseCompletion: number;
  calendarCompletion: number;
}

export interface TrendSeriesDto {
  years: string[];
  values: number[];
}

export interface PrincipalAcademicDto {
  academicYear: string;
  departments: DeptAcademicDto[];
  passPercentageTrend: TrendSeriesDto;
  semesterResultsPublishedOnTime: number;
}

export interface QualificationSummaryDto {
  label: string;
  value: number;
  total: number;
}

export interface DeptFacultyDto {
  dept: string;
  strength: number;
  phdPercentage: number;
  fdpParticipation: number;
  publications: number;
  patents: number;
  sponsoredProjects: number;
  consultancy: number;
  researchFunding: number;
}

export interface PrincipalFacultyDto {
  academicYear: string;
  departments: DeptFacultyDto[];
  qualificationSummary: QualificationSummaryDto[];
  researchFundingTotal: string;
}

export interface DeptStudentDto {
  dept: string;
  strength: number;
  passPercentage: number;
  placements: number;
  higherStudies: number;
  internships: number;
  projects: number;
  publications: number;
  awards: number;
  certifications: number;
}

export interface PrincipalStudentDto {
  academicYear: string;
  departments: DeptStudentDto[];
}

export interface DeptResearchDto {
  dept: string;
  publications: number;
  patents: number;
  books: number;
  sponsoredProjects: number;
  consultancy: number;
  projectDevelopment: number;
  researchFunding: number;
}

export interface ResearchTotalsDto {
  publications: number;
  patents: number;
  books: number;
  sponsoredProjects: number;
  consultancy: number;
  projectDevelopment: number;
  researchFunding: number;
}

export interface PrincipalResearchDto {
  academicYear: string;
  departments: DeptResearchDto[];
  totals: ResearchTotalsDto;
  publicationsTrend: TrendSeriesDto;
}

export interface DeptInfraDto {
  dept: string;
  laboratories: number;
  equipment: number;
  softwareLicenses: number;
  ictFacilities: number;
  smartClassrooms: number;
  evidenceCompletion: number;
  alerts: string[];
}

export interface InfraAlertDto {
  dept: string;
  alert: string;
}

export interface PrincipalInfrastructureDto {
  academicYear: string;
  departments: DeptInfraDto[];
  alerts: InfraAlertDto[];
}

export interface ExamScheduleDto {
  id: string;
  exam: string;
  start: string;
  end: string;
  departments: number;
  status: string;
}

export interface PublishedResultDto {
  id: string;
  exam: string;
  published: string;
  departments: number;
  passPercentage: number;
}

export interface SupplementaryExamDto {
  id: string;
  exam: string;
  date: string;
  candidates: number;
  passPercentage: number;
}

export interface BacklogStatDto {
  dept: string;
  backlogs: number;
  pass: number;
}

export interface PrincipalExaminationDto {
  academicYear: string;
  schedules: ExamScheduleDto[];
  publishedResults: PublishedResultDto[];
  supplementaryExams: SupplementaryExamDto[];
  backlogStats: BacklogStatDto[];
}

export interface AnalyticsSeriesDto {
  year: string;
  repositoryCompletion: number;
  accreditationReadiness: number;
  evidenceCompletion: number;
  faculty: number;
  students: number;
  publications: number;
  placements: number;
  infrastructure: number;
}

export interface RecommendationDto {
  id: string;
  domain: string;
  title: string;
  description: string;
  severity: string;
  department?: string;
}

export interface PrincipalAiRecommendationsDto {
  content: RecommendationDto[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export interface ReportTypeDto {
  id: string;
  name: string;
  description: string;
}

export interface RecentReportDto {
  id: string;
  name: string;
  format: string;
  date: string;
}

export interface PrincipalReportsDto {
  reportTypes: ReportTypeDto[];
  recentReports: RecentReportDto[];
}

// ============================================================
// REQUEST HELPERS
// ============================================================

export interface DepartmentListParams {
  academicYear?: string;
  department?: string;
  program?: string;
  search?: string;
}

export interface GapListParams {
  academicYear?: string;
  department?: string;
  framework?: string;
  page?: number;
  size?: number;
}

export interface AiRecommendationParams {
  domain?: string;
  page?: number;
  size?: number;
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

class PrincipalService {
  private readonly baseUrl = '/v1/principal';

  // ---------- Dashboard ----------

  getDashboard(academicYear?: string): Promise<PrincipalDashboardDto> {
    return apiService.get<PrincipalDashboardDto>(
      `${this.baseUrl}/dashboard${toQuery({ academicYear })}`
    );
  }

  // ---------- Readiness ----------

  getDepartments(params: DepartmentListParams = {}): Promise<DepartmentRepositoryDto[]> {
    return apiService.get<DepartmentRepositoryDto[]>(
      `${this.baseUrl}/departments${toQuery(params as unknown as Record<string, unknown>)}`
    );
  }

  getRepositoryReadiness(
    academicYear?: string,
    department?: string
  ): Promise<PrincipalRepositoryReadinessDto> {
    return apiService.get<PrincipalRepositoryReadinessDto>(
      `${this.baseUrl}/repository-readiness${toQuery({ academicYear, department })}`
    );
  }

  getAccreditation(framework?: string, academicYear?: string): Promise<PrincipalAccreditationDto> {
    return apiService.get<PrincipalAccreditationDto>(
      `${this.baseUrl}/accreditation${toQuery({ framework, academicYear })}`
    );
  }

  getGaps(params: GapListParams = {}): Promise<PrincipalGapResponseDto> {
    return apiService.get<PrincipalGapResponseDto>(
      `${this.baseUrl}/gaps${toQuery(params as unknown as Record<string, unknown>)}`
    );
  }

  // ---------- Performance ----------

  getAcademic(academicYear?: string): Promise<PrincipalAcademicDto> {
    return apiService.get<PrincipalAcademicDto>(
      `${this.baseUrl}/academic${toQuery({ academicYear })}`
    );
  }

  getFaculty(academicYear?: string): Promise<PrincipalFacultyDto> {
    return apiService.get<PrincipalFacultyDto>(
      `${this.baseUrl}/faculty${toQuery({ academicYear })}`
    );
  }

  getStudents(academicYear?: string): Promise<PrincipalStudentDto> {
    return apiService.get<PrincipalStudentDto>(
      `${this.baseUrl}/students${toQuery({ academicYear })}`
    );
  }

  getResearch(academicYear?: string): Promise<PrincipalResearchDto> {
    return apiService.get<PrincipalResearchDto>(
      `${this.baseUrl}/research${toQuery({ academicYear })}`
    );
  }

  getInfrastructure(academicYear?: string): Promise<PrincipalInfrastructureDto> {
    return apiService.get<PrincipalInfrastructureDto>(
      `${this.baseUrl}/infrastructure${toQuery({ academicYear })}`
    );
  }

  getExamination(academicYear?: string): Promise<PrincipalExaminationDto> {
    return apiService.get<PrincipalExaminationDto>(
      `${this.baseUrl}/examination${toQuery({ academicYear })}`
    );
  }

  // ---------- Analytics / Insights / Reports ----------

  getAnalytics(): Promise<AnalyticsSeriesDto[]> {
    return apiService.get<AnalyticsSeriesDto[]>(`${this.baseUrl}/analytics`);
  }

  getAiRecommendations(
    params: AiRecommendationParams = {}
  ): Promise<PrincipalAiRecommendationsDto> {
    return apiService.get<PrincipalAiRecommendationsDto>(
      `${this.baseUrl}/ai-recommendations${toQuery(params as unknown as Record<string, unknown>)}`
    );
  }

  getReports(): Promise<PrincipalReportsDto> {
    return apiService.get<PrincipalReportsDto>(`${this.baseUrl}/reports`);
  }
}

export const principalService = new PrincipalService();

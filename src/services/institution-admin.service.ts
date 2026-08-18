import { apiService } from '@/services/api.service';
import { InstitutionProfile, DepartmentReadiness } from '@/pages/institution-admin/types';
import {
  AcademicStructureSummary,
  UserApiResponse,
  PaginatedListResponse,
  UserQueryParams,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UserStatusEnum,
  SettingsProfile,
  UpdateSettingsProfileRequest,
  ChangePasswordRequest,
  NotificationSettingsRequest,
  ActivityLogEntry,
  ActivityLogQueryParams,
} from '@/types/institution-admin.types';

/** Response shape for update endpoints: { updatedAt: string } */
export interface UpdateResponse {
  updatedAt: string;
}

/** Request body shape for PUT /api/v1/app/profile/basic */
export interface UpdateBasicInfoRequest {
  name: string;
  code: string;
  category: string;
  website: string;
  email: string;
  phone: string;
  aicteCode: string;
  aisheCode: string;
  ugcCode: string;
  yearOfEstablishment: string;
  typeOfInstitution: string;
  ownershipStatus: string;
  affiliatedUniversity: string;
  affiliatedUniversityAddress: string;
}

/** Request body shape for PUT /api/v1/app/profile/address */
export interface UpdateAddressRequest {
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  district: string;
  pincode: string;
  ruralUrbanStatus: string;
  geoLatitude: string;
  geoLongitude: string;
}

/** Request body shape for PUT /api/v1/app/profile/naac */
export interface UpdateNaacRequest {
  accreditationStatus: string;
  grade: string;
  cgpa: string;
  cycle: string;
  validFrom: string;
  validUpto: string;
  certificateNumber: string;
}

/** Request body shape for PUT /api/v1/app/profile/nba */
export interface UpdateNbaRequest {
  accreditationStatus: string;
  programsAccredited: string;
  validFrom: string;
  validUpto: string;
  tier: string;
}

/** Request body shape for PUT /api/v1/app/profile/nirf */
export interface UpdateNirfRequest {
  participationStatus: string;
  rank: string;
  year: string;
  category: string;
  score: string;
}

/** Request body shape for PUT /api/v1/app/profile/autonomous */
export interface UpdateAutonomousRequest {
  status: string;
  grantedBy: string;
  grantedDate: string;
  validUpto: string;
  orderNumber: string;
}

/** Request body shape for PUT /api/v1/app/profile/ugc */
export interface UpdateUgcRequest {
  recognitionStatus: string;
  section2f: string;
  section12b: string;
  recognitionDate: string;
  letterNumber: string;
}

/** Request body shape for PUT /api/v1/app/profile/aicte */
export interface UpdateAicteRequest {
  approvalStatus: string;
  applicationId: string;
  approvalYear: string;
  eoa: string;
  permanentId: string;
}

/** ── Specialization API Types ── */

/** A single specialization as returned by the backend */
export interface SpecializationApiResponse {
  id: number;
  name: string;
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  status: 'ACTIVE' | 'INACTIVE';
}

/** Request body for POST /api/v1/app/specializations */
export interface CreateSpecializationRequest {
  name: string;
  departmentId: number;
  status: 'ACTIVE' | 'INACTIVE';
}

/** ── Department API Types ── */

/** A single department as returned by GET /api/v1/app/departments */
export interface DepartmentApiResponse {
  id: number;
  code: string;
  name: string;
  program: string;
  programId: number;
  coordinator: string | null;
  repositoryCompletion: number | null;
  establishedYear: number | null;
  status: 'ACTIVE' | 'INACTIVE';
  specializationCount: number;
}

/** Request body for POST /api/v1/app/departments */
export interface CreateDepartmentRequest {
  name: string;
  code: string;
  programId: number;
  coordinator?: string;
  establishedYear?: number;
  status: 'ACTIVE' | 'INACTIVE';
}

/** Response shape from POST /api/v1/app/departments */
export interface CreateDepartmentResponse {
  id: number;
  name: string;
  code: string;
  programId: number;
  programName: string;
  institutionId: number;
  coordinator: string | null;
  establishedYear: number | null;
  status: 'ACTIVE' | 'INACTIVE';
}

/** ── Program API Types ── */

/** A single program as returned by the backend */
export interface ProgramApiResponse {
  id: number;
  programCode: string;
  name: string;
  level: 'UG' | 'PG' | 'Doctoral';
  durationYears: number;
  status: 'ACTIVE' | 'INACTIVE';
  isCustom: boolean;
  departmentCount: number;
}

/** Request body for POST /api/v1/app/programs */
export interface CreateProgramRequest {
  code?: string;
  programCode?: string;
  name: string;
  level: string;
  duration?: number;
  durationYears?: number;
  isCustom?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
}

/** Response shape from POST /api/v1/app/programs (returns `duration` not `durationYears`) */
export interface CreateProgramResponse {
  id: number;
  programCode: string;
  name: string;
  level: 'UG' | 'PG' | 'Doctoral';
  duration: number;
  institutionId: number;
  isCustom: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

/** ── Academic Year API Types ── */

/** A single academic year as returned by the backend */
export interface AcademicYearApiResponse {
  id: number;
  year: string;
  startDate: string; // ISO date string e.g. "2026-07-13"
  endDate: string; // ISO date string
  institutionId: number;
  status: 'ACTIVE' | 'INACTIVE';
}

/** Request body for POST /api/v1/app/acedmic-years */
export interface CreateAcademicYearRequest {
  year: string;
  startDate: string; // "2026-07-13"
  endDate: string; // "2026-07-13"
  status: 'ACTIVE' | 'INACTIVE';
}

/** ── Regulation API Types ── */

/** A single regulation as returned by the backend */
export interface RegulationApiResponse {
  id: number;
  regulationCode: string;
  regulationName: string;
  programId: number;
  programName: string;
  institutionId: number;
  academicYearIntroduced: string;
  effectiveFromBatch: string;
  effectiveToBatch: string;
  duration: number;
  status: 'ACTIVE' | 'INACTIVE';
  totalCredits: number;
  coreCredits: number;
  professionalElectiveCredits: number;
  openElectiveCredits: number;
  laboratoryCredits: number;
  projectCredits: number;
  internshipCredits: number;
  internalMarks: number;
  externalMarks: number;
  passingMarks: number;
  gradingSystem: string;
  cgpaScale: number;
  internshipMandatory: boolean;
  internshipDuration: string;
  industryTrainingMandatory: boolean;
  miniProjectMandatory: boolean;
  majorProjectMandatory: boolean;
  capstoneProjectMandatory: boolean;
  approvedBy: string;
  approvalDate: string;
  bosApproval: string;
  academicCouncilApproval: string;
  documents: string;
}

/** Request body for POST /api/v1/app/regulations */
export interface CreateRegulationRequest {
  regulationCode: string;
  regulationName: string;
  programId: number;
  academicYearIntroduced: string;
  effectiveFromBatch: string;
  effectiveToBatch: string;
  duration: number;
  totalCredits: number;
  coreCredits: number;
  professionalElectiveCredits: number;
  openElectiveCredits: number;
  laboratoryCredits: number;
  projectCredits: number;
  internshipCredits: number;
  internalMarks: number;
  externalMarks: number;
  passingMarks: number;
  gradingSystem: string;
  cgpaScale: number;
  internshipMandatory: boolean;
  internshipDuration: string;
  industryTrainingMandatory: boolean;
  miniProjectMandatory: boolean;
  majorProjectMandatory: boolean;
  capstoneProjectMandatory: boolean;
  approvedBy: string;
  approvalDate: string;
  bosApproval: string;
  academicCouncilApproval: string;
  documents: string;
  status: 'ACTIVE' | 'INACTIVE';
}

/** ── Dashboard Summary API Types ── */

/** KPI metrics from GET /api/v1/app/dashboard/summary */
export interface DashboardKPIs {
  totalDepartments: number;
  totalPrograms: number;
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  repositoryCompletion: number;
  pendingReviews: number;
  pendingApprovals: number;
  missingEvidence: number;
  repositoryHealthScore: number;
}

/** A single repository overview item from GET /api/v1/app/dashboard/summary */
export interface RepositoryOverviewItem {
  id: number;
  name: string;
  dataCompleteness: number;
  evidenceCompleteness: number;
  verificationScore: number;
  readinessScore: number;
}

/** A single recent activity from GET /api/v1/app/dashboard/summary */
export interface RecentActivityItem {
  id: number;
  user: string;
  role: string;
  action: string;
  module: string;
  timestamp: string;
  icon: string;
}

/** Top-level data shape returned by GET /api/v1/app/dashboard/summary */
export interface DashboardSummaryData {
  kpis: DashboardKPIs;
  repositoryOverview: RepositoryOverviewItem[];
  departmentReadiness: DepartmentReadiness[];
  recentActivities: RecentActivityItem[];
}

/** ── Readiness Dashboard API Types ── */

/** A single strength item from GET /api/v1/app/readiness/strengths */
export interface ReadinessStrengthItem {
  metric: string;
  score: number;
}

/** A single category breakdown item from GET /api/v1/app/readiness/overall */
export interface ReadinessCategoryBreakdown {
  label: string;
  value: number;
}

/** Top-level data shape returned by GET /api/v1/app/readiness/overall */
export interface ReadinessOverallData {
  overallReadiness: number;
  dataCompleteness: number;
  evidenceCompleteness: number;
  verificationScore: number;
  categoryBreakdown: ReadinessCategoryBreakdown[];
}

/** A single improvement item from GET /api/v1/app/readiness/improvements */
export interface ReadinessImprovementItem {
  metric: string;
  score: number;
  severity: string;
}

/** ── Role API Types ── */

/** A single role as returned by the backend */
export interface RoleApiResponse {
  name: string;
  usersAssigned: number;
  permissions: string[];
}

/** ── Program Intake API Types ── */

/** A single program intake as returned by the backend */
export interface ProgramIntakeApiResponse {
  id: number;
  academicYearId: number;
  programOfferingId: number;
  sanctionedIntake: number;
  admittedIntake: number;
  lateralEntryIntake: number;
  vacantSeats: number;
  approvalAuthority: string;
  status: 'ACTIVE' | 'INACTIVE';
}

/** Request body for POST /api/v1/app/program-intakes */
export interface CreateProgramIntakeRequest {
  academicYearId: number;
  programOfferingId: number;
  sanctionedIntake: number;
  admittedIntake: number;
  lateralEntryIntake: number;
  approvalAuthority: string;
  status: 'ACTIVE' | 'INACTIVE';
}

/** Response from POST /api/v1/app/program-intakes */
export interface CreateProgramIntakeResponse {
  id: number;
  sanctionedIntake: number;
  admittedIntake: number;
  vacantSeats: number;
  status: 'ACTIVE' | 'INACTIVE';
}

/** ── Program Offering API Types ── */

/** A single program offering as returned by the backend */
export interface ProgramOfferingApiResponse {
  id: number;
  academicYearId?: number;
  programId?: number;
  departmentId?: number;
  specializationId?: number;
  regulationId?: number;
  durationYears?: number;
  duration?: number;
  status: 'ACTIVE' | 'INACTIVE';
  generatedName?: string;
  offeringName?: string;
  academicYear?: string;
  academicYearName?: string;
  program?: string;
  programName?: string;
  department?: string;
  departmentName?: string;
  departmentCode?: string;
  specialization?: string;
  specializationName?: string;
  regulation?: string;
  regulationCode?: string;
  regulationName?: string;
}

/** Request body for POST /api/v1/app/program-offerings */
export interface CreateProgramOfferingRequest {
  academicYearId: number;
  programId: number;
  departmentId: number;
  specializationId: number;
  regulationId: number;
  duration: number;
  generatedName: string;
  status: 'ACTIVE' | 'INACTIVE';
}

/** Response from POST /api/v1/app/program-offerings */
export interface CreateProgramOfferingResponse {
  id: number;
  generatedName: string;
  status: 'ACTIVE' | 'INACTIVE';
}

/**
 * InstitutionAdminService — API calls for Institution Admin functionality.
 * All endpoints require INSTITUTION_ADMIN role + Bearer token.
 *
 * Endpoints:
 * - GET  /api/v1/app/profile                — Fetch institution profile
 * - PUT  /api/v1/app/profile/basic          — Update basic information
 * - PUT  /api/v1/app/profile/address        — Update address
 * - PUT  /api/v1/app/profile/naac           — Update NAAC accreditation
 * - PUT  /api/v1/app/profile/nba            — Update NBA accreditation
 * - PUT  /api/v1/app/profile/nirf           — Update NIRF ranking
 * - PUT  /api/v1/app/profile/autonomous     — Update autonomous status
 * - PUT  /api/v1/app/profile/ugc            — Update UGC recognition
 * - PUT  /api/v1/app/profile/aicte          — Update AICTE approvals
 * - GET  /api/v1/app/specializations        — Fetch all specializations
 * - POST /api/v1/app/specializations        — Create a new specialization
 * - PATCH /api/v1/app/specializations/{id}/status — Toggle specialization status
 * - DELETE /api/v1/app/specializations/{id}  — Delete a specialization
 * - GET  /api/v1/app/departments            — Fetch all departments
 * - POST /api/v1/app/departments            — Create a new department
 * - PATCH /api/v1/app/departments/{id}/status — Toggle department status
 * - DELETE /api/v1/app/departments/{id}      — Delete a department
 * - GET  /api/v1/app/programs               — Fetch all programs
 * - POST /api/v1/app/programs               — Create a new program
 * - PATCH /api/v1/app/programs/{id}/status   — Toggle program status
 * - DELETE /api/v1/app/programs/{id}         — Delete a program
 * - GET  /api/v1/app/academic-years         — Fetch all academic years
 * - POST /api/v1/app/academic-years          — Create a new academic year
 * - PATCH /api/v1/app/academic-years/{id}/activate — Activate an academic year
 * - DELETE /api/v1/app/academic-years/{id}   — Delete an academic year
 * - GET  /api/v1/app/regulations            — Fetch all regulations
 * - POST /api/v1/app/regulations            — Create a new regulation
 * - PATCH /api/v1/app/regulations/{id}/status — Toggle regulation status
 * - GET  /api/v1/app/regulations/{id}       — Get regulation by ID
 * - GET  /api/v1/app/program-offerings      — Fetch all program offerings (query: academicYearId, status)
 * - POST /api/v1/app/program-offerings      — Create a new program offering
 * - DELETE /api/v1/app/program-offerings/{id} — Delete a program offering
 * - GET  /api/v1/app/program-intakes         — Fetch all program intakes (query: academicYearId)
 * - POST /api/v1/app/program-intakes         — Create a new program intake
 * - DELETE /api/v1/app/program-intakes/{id}  — Delete a program intake
 * - GET  /api/v1/app/users                   — Fetch paginated users
 * - GET  /api/v1/app/users/{id}              — Get user by ID
 * - POST /api/v1/app/users                   — Create a new user
 * - PUT  /api/v1/app/users/{id}              — Update a user
 * - POST /api/v1/app/users/{id}/reset-password — Reset user password
 * - PATCH /api/v1/app/users/{id}/status      — Update user status
 * - GET  /api/v1/app/settings/profile          — Fetch admin settings profile
 * - PUT  /api/v1/app/settings/profile          — Update admin settings profile
 * - PUT  /api/v1/app/settings/password         — Change password
 * - PATCH /api/v1/app/settings/notifications   — Update notification preferences
 * - GET  /api/institution/activity-logs          — Fetch paginated activity logs
 */
class InstitutionAdminService {
  /**
   * Fetch institution profile for the logged-in admin's institution.
   * GET /api/v1/app/profile
   *
   * The apiService.get() method automatically:
   * - Injects the Bearer token from localStorage
   * - Unwraps ApiResponse<InstitutionProfile> → returns the `data` field directly
   * - Handles 401 responses globally via the response interceptor
   */
  async getProfile(): Promise<InstitutionProfile> {
    return apiService.get<InstitutionProfile>('/v1/app/profile');
  }

  /**
   * Update basic information of the institution profile.
   * PUT /api/v1/app/profile/basic
   *
   * Response: { updatedAt: "2026-07-13T06:36:09.859934978" }
   */
  async updateBasicInfo(data: UpdateBasicInfoRequest): Promise<UpdateResponse> {
    return apiService.put<UpdateResponse>('/v1/app/profile/basic', data);
  }

  /**
   * Update address of the institution profile.
   * PUT /api/v1/app/profile/address
   *
   * Response: { updatedAt: "2026-07-13T06:43:22.321873501" }
   */
  async updateAddress(data: UpdateAddressRequest): Promise<UpdateResponse> {
    return apiService.put<UpdateResponse>('/v1/app/profile/address', data);
  }

  /**
   * Update NAAC accreditation data of the institution profile.
   * PUT /api/v1/app/profile/naac
   *
   * Response: { updatedAt: "2026-07-13T06:55:35.059456869" }
   */
  async updateNaac(data: UpdateNaacRequest): Promise<UpdateResponse> {
    return apiService.put<UpdateResponse>('/v1/app/profile/naac', data);
  }

  /**
   * Update NBA accreditation data of the institution profile.
   * PUT /api/v1/app/profile/nba
   *
   * Response: { updatedAt: "2026-07-13T06:57:42.171529455" }
   */
  async updateNba(data: UpdateNbaRequest): Promise<UpdateResponse> {
    return apiService.put<UpdateResponse>('/v1/app/profile/nba', data);
  }

  /**
   * Update NIRF ranking data of the institution profile.
   * PUT /api/v1/app/profile/nirf
   *
   * Response: { updatedAt: "2026-07-13T07:00:43.230986469" }
   */
  async updateNirf(data: UpdateNirfRequest): Promise<UpdateResponse> {
    return apiService.put<UpdateResponse>('/v1/app/profile/nirf', data);
  }

  /**
   * Update autonomous status of the institution profile.
   * PUT /api/v1/app/profile/autonomous
   *
   * Response: { updatedAt: "2026-07-13T07:03:55.641372638" }
   */
  async updateAutonomous(data: UpdateAutonomousRequest): Promise<UpdateResponse> {
    return apiService.put<UpdateResponse>('/v1/app/profile/autonomous', data);
  }

  /**
   * Update UGC recognition data of the institution profile.
   * PUT /api/v1/app/profile/ugc
   *
   * Response: { updatedAt: "2026-07-13T07:05:40.687117362" }
   */
  async updateUgc(data: UpdateUgcRequest): Promise<UpdateResponse> {
    return apiService.put<UpdateResponse>('/v1/app/profile/ugc', data);
  }

  /**
   * Update AICTE approval data of the institution profile.
   * PUT /api/v1/app/profile/aicte
   *
   * Response: { updatedAt: "2026-07-13T07:07:46.478607525" }
   */
  async updateAicte(data: UpdateAicteRequest): Promise<UpdateResponse> {
    return apiService.put<UpdateResponse>('/v1/app/profile/aicte', data);
  }

  /**
   * Fetch Academic Structure Summary for the Dashboard.
   * GET /api/v1/app/academic-structure/summary
   */
  async getAcademicStructureSummary(): Promise<AcademicStructureSummary> {
    return apiService.get<AcademicStructureSummary>('/v1/app/academic-structure/summary');
  }

  // ── Specializations ──

  /**
   * Fetch all specializations for the institution.
   * GET /api/v1/app/specializations
   */
  async getSpecializations(): Promise<SpecializationApiResponse[]> {
    return apiService.get<SpecializationApiResponse[]>('/v1/app/specializations');
  }

  /**
   * Create a new specialization.
   * POST /api/v1/app/specializations
   */
  async createSpecialization(
    data: CreateSpecializationRequest
  ): Promise<SpecializationApiResponse> {
    return apiService.post<SpecializationApiResponse>('/v1/app/specializations', data);
  }

  /**
   * Toggle specialization status.
   * PATCH /api/v1/app/specializations/{id}/status
   */
  async toggleSpecializationStatus(
    id: number,
    data: Record<string, string>
  ): Promise<Record<string, unknown>> {
    return apiService.patch<Record<string, unknown>>(`/v1/app/specializations/${id}/status`, data);
  }

  /**
   * Toggle specialization active status.
   * PATCH /api/v1/app/specializations/{id}/toggle
   */
  async toggleSpecialization(id: number): Promise<Record<string, unknown>> {
    return apiService.patch<Record<string, unknown>>(`/v1/app/specializations/${id}/toggle`);
  }

  /**
   * Delete a specialization by ID.
   * DELETE /api/v1/app/specializations/{id}
   */
  async deleteSpecialization(id: number): Promise<Record<string, unknown>> {
    return apiService.delete<Record<string, unknown>>(`/v1/app/specializations/${id}`);
  }

  // ── Departments ──

  /**
   * Fetch all departments for the institution.
   * GET /api/v1/app/departments
   */
  async getDepartments(): Promise<DepartmentApiResponse[]> {
    return apiService.get<DepartmentApiResponse[]>('/v1/app/departments');
  }

  /**
   * Create a new department.
   * POST /api/v1/app/departments
   */
  async createDepartment(data: CreateDepartmentRequest): Promise<CreateDepartmentResponse> {
    return apiService.post<CreateDepartmentResponse>('/v1/app/departments', data);
  }

  /**
   * Toggle department status.
   * PATCH /api/v1/app/departments/{id}/status
   */
  async toggleDepartmentStatus(
    id: number,
    data: Record<string, string>
  ): Promise<Record<string, unknown>> {
    return apiService.patch<Record<string, unknown>>(`/v1/app/departments/${id}/status`, data);
  }

  /**
   * Toggle department active status.
   * PATCH /api/v1/app/departments/{id}/toggle
   */
  async toggleDepartment(id: number): Promise<Record<string, unknown>> {
    return apiService.patch<Record<string, unknown>>(`/v1/app/departments/${id}/toggle`);
  }

  /**
   * Delete a department by ID.
   * DELETE /api/v1/app/departments/{id}
   */
  async deleteDepartment(id: number): Promise<Record<string, unknown>> {
    return apiService.delete<Record<string, unknown>>(`/v1/app/departments/${id}`);
  }

  // ── Programs ──

  /**
   * Fetch all programs for the institution.
   * GET /api/v1/app/programs
   */
  async getPrograms(): Promise<ProgramApiResponse[]> {
    return apiService.get<ProgramApiResponse[]>('/v1/app/programs');
  }

  /**
   * Create a new program.
   * POST /api/v1/app/programs
   */
  async createProgram(data: CreateProgramRequest): Promise<CreateProgramResponse> {
    return apiService.post<CreateProgramResponse>('/v1/app/programs', data);
  }

  /**
   * Toggle program status.
   * PATCH /api/v1/app/programs/{id}/status
   */
  async toggleProgramStatus(
    id: number,
    data: Record<string, string>
  ): Promise<Record<string, unknown>> {
    return apiService.patch<Record<string, unknown>>(`/v1/app/programs/${id}/status`, data);
  }

  /**
   * Toggle program active status.
   * PATCH /api/v1/app/programs/{id}/toggle
   */
  async toggleProgram(id: number): Promise<Record<string, unknown>> {
    return apiService.patch<Record<string, unknown>>(`/v1/app/programs/${id}/toggle`);
  }

  /**
   * Delete a program by ID.
   * DELETE /api/v1/app/programs/{id}
   */
  async deleteProgram(id: number): Promise<Record<string, unknown>> {
    return apiService.delete<Record<string, unknown>>(`/v1/app/programs/${id}`);
  }

  // ── Academic Years ──

  /**
   * Fetch all academic years for the institution.
   * GET /api/v1/app/academic-years
   */
  async getAcademicYears(): Promise<AcademicYearApiResponse[]> {
    return apiService.get<AcademicYearApiResponse[]>('/v1/app/academic-years');
  }

  /**
   * Create a new academic year.
   * POST /api/v1/app/academic-years
   */
  async createAcademicYear(data: CreateAcademicYearRequest): Promise<AcademicYearApiResponse> {
    return apiService.post<AcademicYearApiResponse>('/v1/app/academic-years', data);
  }

  /**
   * Activate an academic year by ID.
   * PATCH /api/v1/app/academic-years/{id}/activate
   */
  async activateAcademicYear(id: number): Promise<Record<string, unknown>> {
    return apiService.patch<Record<string, unknown>>(`/v1/app/academic-years/${id}/activate`);
  }

  /**
   * Update an academic year by ID.
   * PUT /api/v1/app/academic-years/{id}
   */
  async updateAcademicYear(id: number, data: CreateAcademicYearRequest): Promise<AcademicYearApiResponse> {
    return apiService.put<AcademicYearApiResponse>(`/v1/app/academic-years/${id}`, data);
  }

  /**
   * Delete an academic year by ID.
   * DELETE /api/v1/app/academic-years/{id}
   */
  async deleteAcademicYear(id: number): Promise<Record<string, unknown>> {
    return apiService.delete<Record<string, unknown>>(`/v1/app/academic-years/${id}`);
  }

  // ── Regulations ──

  /**
   * Fetch all regulations for the institution.
   * GET /api/v1/app/regulations
   */
  async getRegulations(): Promise<RegulationApiResponse[]> {
    return apiService.get<RegulationApiResponse[]>('/v1/app/regulations');
  }

  /**
   * Create a new regulation.
   * POST /api/v1/app/regulations
   */
  async createRegulation(data: CreateRegulationRequest): Promise<RegulationApiResponse> {
    return apiService.post<RegulationApiResponse>('/v1/app/regulations', data);
  }

  /**
   * Toggle regulation status.
   * PATCH /api/v1/app/regulations/{id}/status
   */
  async toggleRegulationStatus(
    id: number,
    data: Record<string, string>
  ): Promise<Record<string, unknown>> {
    return apiService.patch<Record<string, unknown>>(`/v1/app/regulations/${id}/status`, data);
  }

  /**
   * Get regulation by ID.
   * GET /api/v1/app/regulations/{id}
   */
  async getRegulationById(id: number): Promise<RegulationApiResponse> {
    return apiService.get<RegulationApiResponse>(`/v1/app/regulations/${id}`);
  }

  /**
   * Update an existing regulation.
   * PUT /api/v1/app/regulations/{id}
   */
  async updateRegulation(
    id: number,
    data: CreateRegulationRequest
  ): Promise<RegulationApiResponse> {
    return apiService.put<RegulationApiResponse>(`/v1/app/regulations/${id}`, data);
  }

  /**
   * Delete a regulation by ID.
   * DELETE /api/v1/app/regulations/{id}
   */
  async deleteRegulation(id: number): Promise<Record<string, unknown>> {
    return apiService.delete<Record<string, unknown>>(`/v1/app/regulations/${id}`);
  }

  // ── Program Offerings ──

  /**
   * Fetch all program offerings for the institution.
   * Supports optional query params: academicYearId, status.
   * GET /api/v1/app/program-offerings?academicYearId=&status=
   */
  async getProgramOfferings(params?: {
    academicYearId?: number;
    status?: string;
  }): Promise<ProgramOfferingApiResponse[]> {
    const query = new URLSearchParams();
    if (params?.academicYearId) query.set('academicYearId', String(params.academicYearId));
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    const url = qs ? `/v1/app/program-offerings?${qs}` : '/v1/app/program-offerings';
    return apiService.get<ProgramOfferingApiResponse[]>(url);
  }

  /**
   * Create a new program offering.
   * POST /api/v1/app/program-offerings
   */
  async createProgramOffering(
    data: CreateProgramOfferingRequest
  ): Promise<CreateProgramOfferingResponse> {
    return apiService.post<CreateProgramOfferingResponse>('/v1/app/program-offerings', data);
  }

  /**
   * Delete a program offering by ID.
   * DELETE /api/v1/app/program-offerings/{id}
   */
  async deleteProgramOffering(id: number): Promise<Record<string, unknown>> {
    return apiService.delete<Record<string, unknown>>(`/v1/app/program-offerings/${id}`);
  }

  // ── Program Intakes ──

  /**
   * Fetch all program intakes for the institution.
   * Supports optional query param: academicYearId.
   * GET /api/v1/app/program-intakes?academicYearId=
   */
  async getProgramIntakes(params?: {
    academicYearId?: number;
  }): Promise<ProgramIntakeApiResponse[]> {
    const query = new URLSearchParams();
    if (params?.academicYearId) query.set('academicYearId', String(params.academicYearId));
    const qs = query.toString();
    const url = qs ? `/v1/app/program-intakes?${qs}` : '/v1/app/program-intakes';
    return apiService.get<ProgramIntakeApiResponse[]>(url);
  }

  /**
   * Create a new program intake.
   * POST /api/v1/app/program-intakes
   */
  async createProgramIntake(
    data: CreateProgramIntakeRequest
  ): Promise<CreateProgramIntakeResponse> {
    return apiService.post<CreateProgramIntakeResponse>('/v1/app/program-intakes', data);
  }

  /** ── Readiness Dashboard ── */

  /**
   * Fetch readiness strengths.
   * GET /api/v1/app/readiness/strengths
   */
  async getReadinessStrengths(): Promise<ReadinessStrengthItem[]> {
    return apiService.get<ReadinessStrengthItem[]>('/v1/app/readiness/strengths');
  }

  /**
   * Fetch overall readiness data (overall score, completeness, category breakdown).
   * GET /api/v1/app/readiness/overall
   */
  async getReadinessOverall(): Promise<ReadinessOverallData> {
    return apiService.get<ReadinessOverallData>('/v1/app/readiness/overall');
  }

  /**
   * Fetch areas for improvement.
   * GET /api/v1/app/readiness/improvements
   */
  async getReadinessImprovements(): Promise<ReadinessImprovementItem[]> {
    return apiService.get<ReadinessImprovementItem[]>('/v1/app/readiness/improvements');
  }

  /** ── Repository Monitoring ── */

  /**
   * Fetch repository metrics (Academic, Faculty, Student, Research).
   * GET /api/v1/app/repository/metrics
   */
  async getRepositoryMetrics(): Promise<RepositoryOverviewItem[]> {
    return apiService.get<RepositoryOverviewItem[]>('/v1/app/repository/metrics');
  }

  /**
   * Fetch department-wise repository readiness.
   * GET /api/v1/app/repository/department-readiness
   */
  async getDepartmentReadiness(): Promise<DepartmentReadiness[]> {
    return apiService.get<DepartmentReadiness[]>('/v1/app/repository/department-readiness');
  }

  /**
   * Fetch dashboard summary for the institution.
   * GET /api/v1/app/dashboard/summary
   *
   * Returns KPIs, repository overview, department readiness, and recent activities.
   */
  async getDashboardSummary(): Promise<DashboardSummaryData> {
    return apiService.get<DashboardSummaryData>('/v1/app/dashboard/summary');
  }

  /**
   * Fetch all roles for the institution.
   * GET /api/v1/app/roles
   */
  async getRoles(): Promise<RoleApiResponse[]> {
    return apiService.get<RoleApiResponse[]>('/v1/app/roles');
  }

  /**
   * Delete a program intake by ID.
   * DELETE /api/v1/app/program-intakes/{id}
   */
  async deleteProgramIntake(id: number): Promise<Record<string, unknown>> {
    return apiService.delete<Record<string, unknown>>(`/v1/app/program-intakes/${id}`);
  }

  // ──────────────────────────────────────────────
  // ── User Management ──
  // ──────────────────────────────────────────────

  /**
   * Fetch paginated users for the institution.
   * GET /api/v1/app/users?page=&pageSize=&search=&role=&status=&sortBy=&sortDirection=
   */
  async getUsers(params: UserQueryParams): Promise<PaginatedListResponse<UserApiResponse>> {
    const query = new URLSearchParams();
    query.set('page', String(params.page));
    query.set('pageSize', String(params.pageSize));
    if (params.search) query.set('search', params.search);
    if (params.role) query.set('role', params.role);
    if (params.status) query.set('status', params.status);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortDirection) query.set('sortDirection', params.sortDirection);
    return apiService.get<PaginatedListResponse<UserApiResponse>>(
      `/v1/app/users?${query.toString()}`
    );
  }

  /**
   * Get a single user by ID.
   * GET /api/v1/app/users/{id}
   */
  async getUserById(id: number): Promise<UserApiResponse> {
    return apiService.get<UserApiResponse>(`/v1/app/users/${id}`);
  }

  /**
   * Create a new user.
   * POST /api/v1/app/users
   *
   * Returns the created user details including the real temporary password
   * that the user can use for first-time login.
   */
  async createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
    return apiService.post<CreateUserResponse>('/v1/app/users', data);
  }

  /**
   * Update an existing user.
   * PUT /api/v1/app/users/{id}
   */
  async updateUser(id: number, data: UpdateUserRequest): Promise<UserApiResponse> {
    return apiService.put<UserApiResponse>(`/v1/app/users/${id}`, data);
  }

  /**
   * Reset a user's password.
   * POST /api/v1/app/users/{id}/reset-password
   */
  async resetUserPassword(id: number): Promise<Record<string, unknown>> {
    return apiService.post<Record<string, unknown>>(`/v1/app/users/${id}/reset-password`);
  }

  /**
   * Update user status (activate / deactivate / block / unblock).
   * PATCH /api/v1/app/users/{id}/status
   */
  async updateUserStatus(
    id: number,
    data: { status: UserStatusEnum }
  ): Promise<Record<string, unknown>> {
    return apiService.patch<Record<string, unknown>>(`/v1/app/users/${id}/status`, data);
  }

  // ──────────────────────────────────────────────
  // ── Settings / Account ──
  // ──────────────────────────────────────────────

  /**
   * Fetch the admin's settings profile (name, email, mobile).
   * GET /api/v1/app/settings/profile
   */
  async getSettingsProfile(): Promise<SettingsProfile> {
    return apiService.get<SettingsProfile>('/v1/app/settings/profile');
  }

  /**
   * Update the admin's settings profile.
   * PUT /api/v1/app/settings/profile
   */
  async updateSettingsProfile(data: UpdateSettingsProfileRequest): Promise<SettingsProfile> {
    return apiService.put<SettingsProfile>('/v1/app/settings/profile', data);
  }

  /**
   * Change the admin's password.
   * PUT /api/v1/app/settings/password
   */
  async changePassword(data: ChangePasswordRequest): Promise<Record<string, unknown>> {
    return apiService.put<Record<string, unknown>>('/v1/app/settings/password', data);
  }

  /**
   * Update notification preferences.
   * PATCH /api/v1/app/settings/notifications
   */
  async updateNotificationSettings(
    data: NotificationSettingsRequest
  ): Promise<Record<string, unknown>> {
    return apiService.patch<Record<string, unknown>>('/v1/app/settings/notifications', data);
  }

  // ──────────────────────────────────────────────
  // ── Activity Logs ──
  // ──────────────────────────────────────────────

  /**
   * Fetch paginated activity logs for the institution.
   * GET /api/institution/activity-logs?institutionId=&page=&pageSize=
   *
   * Note: This endpoint uses /api/institution/ prefix (not /api/v1/app/).
   */
  async getActivityLogs(
    params: ActivityLogQueryParams
  ): Promise<PaginatedListResponse<ActivityLogEntry>> {
    const query = new URLSearchParams();
    query.set('institutionId', String(params.institutionId));
    query.set('page', String(params.page));
    query.set('pageSize', String(params.pageSize));
    return apiService.get<PaginatedListResponse<ActivityLogEntry>>(
      `/institution/activity-logs?${query.toString()}`
    );
  }
}

export const institutionAdminService = new InstitutionAdminService();

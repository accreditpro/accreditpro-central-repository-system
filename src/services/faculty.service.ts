import { apiService } from './api.service';
import {
  PaginatedData,
  FacultyProfileResponse,
  CreateFacultyRequest,
  UpdateFacultyRequest,
  FacultyListParams,
  RepositoryMetricsResponse,
  QualificationResponse,
  CreateQualificationRequest,
  UpdateQualificationRequest,
  EmploymentResponse,
  UpdateEmploymentRequest,
  FdpResponse,
  CreateFdpRequest,
  UpdateFdpRequest,
} from '@/types/faculty.types';

/**
 * Faculty Service — wraps all /api/v1/departments/{departmentId}/faculty endpoints.
 *
 * All methods require `departmentId` to scope requests to the current department.
 * The apiService automatically injects the Bearer token and unwraps ApiResponse<T>.
 */
class FacultyService {
  private baseUrl(departmentId: number): string {
    return `/v1/departments/${departmentId}/faculty`;
  }

  // ── Section 3.1: LIST Faculty Profiles (paginated) ──

  /**
   * Fetch paginated list of faculty profiles with optional search/filter.
   */
  async listProfiles(
    departmentId: number,
    params: FacultyListParams = {}
  ): Promise<PaginatedData<FacultyProfileResponse>> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.size !== undefined) query.set('size', String(params.size));
    if (params.search) query.set('search', params.search);
    if (params.designation) query.set('designation', params.designation);
    if (params.status) query.set('status', params.status);

    const qs = query.toString();
    const url = qs ? `${this.baseUrl(departmentId)}?${qs}` : this.baseUrl(departmentId);
    return apiService.get<PaginatedData<FacultyProfileResponse>>(url);
  }

  // ── Section 3.2: GET Faculty by ID ──

  /**
   * Fetch a single faculty profile by its ID.
   */
  async getProfile(departmentId: number, id: number): Promise<FacultyProfileResponse> {
    return apiService.get<FacultyProfileResponse>(`${this.baseUrl(departmentId)}/${id}`);
  }

  // ── Section 3.3: CREATE Faculty Profile ──

  /**
   * Create a new faculty profile.
   */
  async createProfile(
    departmentId: number,
    data: CreateFacultyRequest
  ): Promise<FacultyProfileResponse> {
    return apiService.post<FacultyProfileResponse>(this.baseUrl(departmentId), data);
  }

  // ── Section 3.4: UPDATE Faculty Profile ──

  /**
   * Update an existing faculty profile. All fields are optional — only supplied fields are sent.
   */
  async updateProfile(
    departmentId: number,
    id: number,
    data: UpdateFacultyRequest
  ): Promise<FacultyProfileResponse> {
    return apiService.put<FacultyProfileResponse>(`${this.baseUrl(departmentId)}/${id}`, data);
  }

  // ── Section 3.5: DELETE Faculty Profile ──

  /**
   * Delete a faculty profile by its ID.
   */
  async deleteProfile(departmentId: number, id: number): Promise<void> {
    await apiService.delete<void>(`${this.baseUrl(departmentId)}/${id}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // Sections 3.6–3.9: Faculty Qualifications CRUD
  // ═══════════════════════════════════════════════════════════════

  /**
   * Section 3.6: LIST Faculty Qualifications
   * Returns an array of QualificationResponse for a given faculty member.
   */
  async listQualifications(
    departmentId: number,
    facultyId: number
  ): Promise<QualificationResponse[]> {
    return apiService.get<QualificationResponse[]>(
      `${this.baseUrl(departmentId)}/${facultyId}/qualifications`
    );
  }

  /**
   * Section 3.7: ADD Faculty Qualification
   */
  async addQualification(
    departmentId: number,
    facultyId: number,
    data: CreateQualificationRequest
  ): Promise<QualificationResponse> {
    return apiService.post<QualificationResponse>(
      `${this.baseUrl(departmentId)}/${facultyId}/qualifications`,
      data
    );
  }

  /**
   * Section 3.8: UPDATE Faculty Qualification
   */
  async updateQualification(
    departmentId: number,
    facultyId: number,
    qualificationId: number,
    data: UpdateQualificationRequest
  ): Promise<QualificationResponse> {
    return apiService.put<QualificationResponse>(
      `${this.baseUrl(departmentId)}/${facultyId}/qualifications/${qualificationId}`,
      data
    );
  }

  /**
   * Section 3.9: DELETE Faculty Qualification
   */
  async deleteQualification(
    departmentId: number,
    facultyId: number,
    qualificationId: number
  ): Promise<void> {
    await apiService.delete<void>(
      `${this.baseUrl(departmentId)}/${facultyId}/qualifications/${qualificationId}`
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // Sections 3.12–3.15: Faculty FDPs CRUD
  // ═══════════════════════════════════════════════════════════════

  /**
   * Section 3.12: LIST Faculty FDPs
   * Returns an array of FdpResponse for a given faculty member.
   */
  async listFdps(departmentId: number, facultyId: number): Promise<FdpResponse[]> {
    return apiService.get<FdpResponse[]>(`${this.baseUrl(departmentId)}/${facultyId}/fdps`);
  }

  /**
   * Section 3.13: ADD Faculty FDP
   */
  async addFdp(
    departmentId: number,
    facultyId: number,
    data: CreateFdpRequest
  ): Promise<FdpResponse> {
    return apiService.post<FdpResponse>(`${this.baseUrl(departmentId)}/${facultyId}/fdps`, data);
  }

  /**
   * Section 3.14: UPDATE Faculty FDP
   */
  async updateFdp(
    departmentId: number,
    facultyId: number,
    fdpId: number,
    data: UpdateFdpRequest
  ): Promise<FdpResponse> {
    return apiService.put<FdpResponse>(
      `${this.baseUrl(departmentId)}/${facultyId}/fdps/${fdpId}`,
      data
    );
  }

  /**
   * Section 3.15: DELETE Faculty FDP
   */
  async deleteFdp(departmentId: number, facultyId: number, fdpId: number): Promise<void> {
    await apiService.delete<void>(`${this.baseUrl(departmentId)}/${facultyId}/fdps/${fdpId}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // Sections 3.10–3.11: Faculty Employment
  // ═══════════════════════════════════════════════════════════════

  /**
   * Section 3.10: GET Faculty Employment
   * Returns a single EmploymentResponse for a given faculty member.
   * May throw a 404 if no employment record exists yet.
   */
  async getEmployment(departmentId: number, facultyId: number): Promise<EmploymentResponse> {
    return apiService.get<EmploymentResponse>(
      `${this.baseUrl(departmentId)}/${facultyId}/employment`
    );
  }

  /**
   * Section 3.11: UPDATE Faculty Employment
   * Creates or updates the employment record for a faculty member.
   */
  async updateEmployment(
    departmentId: number,
    facultyId: number,
    data: UpdateEmploymentRequest
  ): Promise<EmploymentResponse> {
    return apiService.put<EmploymentResponse>(
      `${this.baseUrl(departmentId)}/${facultyId}/employment`,
      data
    );
  }

  // ── Section 10.2: GET Metrics for Faculty Repository ──

  /**
   * Fetch metrics specific to the faculty repository.
   */
  async getMetrics(departmentId: number): Promise<RepositoryMetricsResponse> {
    return apiService.get<RepositoryMetricsResponse>(
      `/v1/departments/${departmentId}/metrics/faculty`
    );
  }

  /**
   * Fetch metrics for all repositories in this department.
   */
  async getAllMetrics(departmentId: number): Promise<RepositoryMetricsResponse[]> {
    return apiService.get<RepositoryMetricsResponse[]>(`/v1/departments/${departmentId}/metrics`);
  }
}

export const facultyService = new FacultyService();

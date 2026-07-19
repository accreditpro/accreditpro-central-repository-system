import { apiService } from './api.service';
import {
  PaginatedData,
  StudentProfileResponse,
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentListParams,
  AdmissionResponse,
  UpdateAdmissionRequest,
  DiversityResponse,
  UpdateDiversityRequest,
  PerformanceResponse,
  CreatePerformanceRequest,
  UpdatePerformanceRequest,
  ProgressionResponse,
  UpdateProgressionRequest,
  ScholarshipResponse,
  CreateScholarshipRequest,
  StudentAchievementResponse,
  CreateAchievementRequest,
} from '@/types/student.types';

/**
 * Student Service — wraps all /api/v1/departments/{departmentId}/students endpoints.
 *
 * All methods require `departmentId` to scope requests to the current department.
 * The apiService automatically injects the Bearer token and unwraps ApiResponse<T>.
 */
class StudentService {
  private baseUrl(departmentId: number): string {
    return `/v1/departments/${departmentId}/students`;
  }

  // ── Section 4.1: LIST Student Profiles (paginated) ──

  /**
   * Fetch paginated list of student profiles with optional search/filter.
   */
  async listProfiles(
    departmentId: number,
    params: StudentListParams = {}
  ): Promise<PaginatedData<StudentProfileResponse>> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.size !== undefined) query.set('size', String(params.size));
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);

    const qs = query.toString();
    const url = qs ? `${this.baseUrl(departmentId)}?${qs}` : this.baseUrl(departmentId);
    return apiService.get<PaginatedData<StudentProfileResponse>>(url);
  }

  // ── Section 4.2: GET Student by ID ──

  /**
   * Fetch a single student profile by its ID.
   */
  async getProfile(departmentId: number, id: number): Promise<StudentProfileResponse> {
    return apiService.get<StudentProfileResponse>(`${this.baseUrl(departmentId)}/${id}`);
  }

  // ── Section 4.3: CREATE Student Profile ──

  /**
   * Create a new student profile.
   */
  async createProfile(
    departmentId: number,
    data: CreateStudentRequest
  ): Promise<StudentProfileResponse> {
    return apiService.post<StudentProfileResponse>(this.baseUrl(departmentId), data);
  }

  // ── Section 4.4: UPDATE Student Profile ──

  /**
   * Update an existing student profile. All fields are optional.
   */
  async updateProfile(
    departmentId: number,
    id: number,
    data: UpdateStudentRequest
  ): Promise<StudentProfileResponse> {
    return apiService.put<StudentProfileResponse>(`${this.baseUrl(departmentId)}/${id}`, data);
  }

  // ── Section 4.5: DELETE Student Profile ──

  /**
   * Delete a student profile by its ID.
   */
  async deleteProfile(departmentId: number, id: number): Promise<void> {
    await apiService.delete<void>(`${this.baseUrl(departmentId)}/${id}`);
  }

  // ── Section 4.6: GET Student Admission ──

  /**
   * Fetch a single student's admission record.
   * Returns 404 (handled) if no admission record exists yet.
   */
  async getAdmission(departmentId: number, studentId: number): Promise<AdmissionResponse> {
    return apiService.get<AdmissionResponse>(`${this.baseUrl(departmentId)}/${studentId}/admission`);
  }

  // ── Section 4.7: UPDATE Student Admission ──

  /**
   * Create or update a student's admission record.
   * All fields are optional; only supplied fields are updated.
   */
  async updateAdmission(
    departmentId: number,
    studentId: number,
    data: UpdateAdmissionRequest
  ): Promise<AdmissionResponse> {
    return apiService.put<AdmissionResponse>(`${this.baseUrl(departmentId)}/${studentId}/admission`, data);
  }

  // ── Section 4.8: GET Student Diversity ──

  /**
   * Fetch a single student's diversity record.
   */
  async getDiversity(departmentId: number, studentId: number): Promise<DiversityResponse> {
    return apiService.get<DiversityResponse>(`${this.baseUrl(departmentId)}/${studentId}/diversity`);
  }

  // ── Section 4.9: UPDATE Student Diversity ──

  /**
   * Create or update a student's diversity record.
   */
  async updateDiversity(
    departmentId: number,
    studentId: number,
    data: UpdateDiversityRequest
  ): Promise<DiversityResponse> {
    return apiService.put<DiversityResponse>(`${this.baseUrl(departmentId)}/${studentId}/diversity`, data);
  }

  // ── Section 4.10: LIST Student Performances ──

  /**
   * Fetch all performance records for a student.
   */
  async listPerformances(departmentId: number, studentId: number): Promise<PerformanceResponse[]> {
    return apiService.get<PerformanceResponse[]>(`${this.baseUrl(departmentId)}/${studentId}/performance`);
  }

  // ── Section 4.11: ADD Student Performance ──

  /**
   * Create a new performance record for a student.
   */
  async addPerformance(
    departmentId: number,
    studentId: number,
    data: CreatePerformanceRequest
  ): Promise<PerformanceResponse> {
    return apiService.post<PerformanceResponse>(`${this.baseUrl(departmentId)}/${studentId}/performance`, data);
  }

  // ── Section 4.12: UPDATE Student Performance ──

  /**
   * Update an existing performance record.
   */
  async updatePerformance(
    departmentId: number,
    studentId: number,
    performanceId: number,
    data: UpdatePerformanceRequest
  ): Promise<PerformanceResponse> {
    return apiService.put<PerformanceResponse>(`${this.baseUrl(departmentId)}/${studentId}/performance/${performanceId}`, data);
  }

  // ── Section 4.13: GET Student Progression ──

  /**
   * Fetch a single student's progression record.
   */
  async getProgression(departmentId: number, studentId: number): Promise<ProgressionResponse> {
    return apiService.get<ProgressionResponse>(`${this.baseUrl(departmentId)}/${studentId}/progression`);
  }

  // ── Section 4.14: UPDATE Student Progression ──

  /**
   * Create or update a student's progression record.
   */
  async updateProgression(
    departmentId: number,
    studentId: number,
    data: UpdateProgressionRequest
  ): Promise<ProgressionResponse> {
    return apiService.put<ProgressionResponse>(`${this.baseUrl(departmentId)}/${studentId}/progression`, data);
  }

  // ── Section 4.15: LIST Student Scholarships ──

  /**
   * Fetch all scholarship records for a student.
   */
  async listScholarships(departmentId: number, studentId: number): Promise<ScholarshipResponse[]> {
    return apiService.get<ScholarshipResponse[]>(`${this.baseUrl(departmentId)}/${studentId}/scholarships`);
  }

  // ── Section 4.16: ADD Student Scholarship ──

  /**
   * Create a new scholarship record for a student.
   */
  async addScholarship(
    departmentId: number,
    studentId: number,
    data: CreateScholarshipRequest
  ): Promise<ScholarshipResponse> {
    return apiService.post<ScholarshipResponse>(`${this.baseUrl(departmentId)}/${studentId}/scholarships`, data);
  }

  // ── Section 4.17: LIST Student Achievements ──

  /**
   * Fetch all achievement records for a student.
   */
  async listAchievements(departmentId: number, studentId: number): Promise<StudentAchievementResponse[]> {
    return apiService.get<StudentAchievementResponse[]>(`${this.baseUrl(departmentId)}/${studentId}/achievements`);
  }

  // ── Section 4.18: ADD Student Achievement ──

  /**
   * Create a new achievement record for a student.
   */
  async addAchievement(
    departmentId: number,
    studentId: number,
    data: CreateAchievementRequest
  ): Promise<StudentAchievementResponse> {
    return apiService.post<StudentAchievementResponse>(`${this.baseUrl(departmentId)}/${studentId}/achievements`, data);
  }
}

export const studentService = new StudentService();

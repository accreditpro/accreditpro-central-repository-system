import { apiService } from './api.service';
import {
  PaginatedData,
  CurriculumResponse,
  CreateCurriculumRequest,
  UpdateCurriculumRequest,
  CurriculumListParams,
  CourseResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseListParams,
  AcademicCalendarResponse,
  CreateAcademicCalendarRequest,
  UpdateAcademicCalendarRequest,
  AcademicCalendarListParams,
  ValueAddedCourseResponse,
  CreateValueAddedCourseRequest,
  UpdateValueAddedCourseRequest,
  ValueAddedCourseListParams,
  MoocResponse,
  CreateMoocRequest,
  UpdateMoocRequest,
  MoocListParams
} from '@/types/academic.types';

/**
 * Academic Service — wraps all /api/v1/departments/{departmentId}/academic endpoints.
 *
 * All methods require `departmentId` to scope requests to the current department.
 * The apiService automatically injects the Bearer token and unwraps ApiResponse<T>.
 */
class AcademicService {
  private baseUrl(departmentId: number): string {
    return `/v1/departments/${departmentId}/academic`;
  }

  // ── Section 5.1: LIST Curricula ──

  /**
   * Fetch paginated list of curricula.
   */
  async listCurricula(
    departmentId: number,
    params: CurriculumListParams = {}
  ): Promise<PaginatedData<CurriculumResponse>> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.size !== undefined) query.set('size', String(params.size));

    const qs = query.toString();
    const url = qs ? `${this.baseUrl(departmentId)}/curricula?${qs}` : `${this.baseUrl(departmentId)}/curricula`;
    return apiService.get<PaginatedData<CurriculumResponse>>(url);
  }

  // ── Section 5.2: GET Curriculum by ID ──

  /**
   * Fetch a single curriculum by its ID.
   */
  async getCurriculum(departmentId: number, id: number): Promise<CurriculumResponse> {
    return apiService.get<CurriculumResponse>(`${this.baseUrl(departmentId)}/curricula/${id}`);
  }

  // ── Section 5.3: CREATE Curriculum ──

  /**
   * Create a new curriculum record.
   */
  async createCurriculum(
    departmentId: number,
    data: CreateCurriculumRequest
  ): Promise<CurriculumResponse> {
    return apiService.post<CurriculumResponse>(`${this.baseUrl(departmentId)}/curricula`, data);
  }

  // ── Section 5.4: UPDATE Curriculum ──

  /**
   * Update an existing curriculum record. All fields are optional.
   */
  async updateCurriculum(
    departmentId: number,
    id: number,
    data: UpdateCurriculumRequest
  ): Promise<CurriculumResponse> {
    return apiService.put<CurriculumResponse>(`${this.baseUrl(departmentId)}/curricula/${id}`, data);
  }

  // ── Section 5.5: DELETE Curriculum ──

  /**
   * Delete a curriculum record by its ID.
   */
  async deleteCurriculum(departmentId: number, id: number): Promise<void> {
    await apiService.delete<void>(`${this.baseUrl(departmentId)}/curricula/${id}`);
  }

  // ── Section 5.6: LIST Courses ──

  /**
   * Fetch paginated list of courses with optional search/filter.
   */
  async listCourses(
    departmentId: number,
    params: CourseListParams = {}
  ): Promise<PaginatedData<CourseResponse>> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.size !== undefined) query.set('size', String(params.size));
    if (params.search) query.set('search', params.search);
    if (params.type) query.set('type', params.type);

    const qs = query.toString();
    const url = qs ? `${this.baseUrl(departmentId)}/courses?${qs}` : `${this.baseUrl(departmentId)}/courses`;
    return apiService.get<PaginatedData<CourseResponse>>(url);
  }

  // ── Section 5.7: GET Course by ID ──

  /**
   * Fetch a single course by its ID.
   */
  async getCourse(departmentId: number, id: number): Promise<CourseResponse> {
    return apiService.get<CourseResponse>(`${this.baseUrl(departmentId)}/courses/${id}`);
  }

  // ── Section 5.8: CREATE Course ──

  /**
   * Create a new course record.
   */
  async createCourse(
    departmentId: number,
    data: CreateCourseRequest
  ): Promise<CourseResponse> {
    return apiService.post<CourseResponse>(`${this.baseUrl(departmentId)}/courses`, data);
  }

  // ── Section 5.9: UPDATE Course ──

  /**
   * Update an existing course record. All fields are optional.
   */
  async updateCourse(
    departmentId: number,
    id: number,
    data: UpdateCourseRequest
  ): Promise<CourseResponse> {
    return apiService.put<CourseResponse>(`${this.baseUrl(departmentId)}/courses/${id}`, data);
  }

  // ── Section 5.10: DELETE Course ──

  /**
   * Delete a course record by its ID.
   */
  async deleteCourse(departmentId: number, id: number): Promise<void> {
    await apiService.delete<void>(`${this.baseUrl(departmentId)}/courses/${id}`);
  }

  // ── Section 5.11: LIST Academic Calendars ──

  /**
   * Fetch paginated list of academic calendars.
   */
  async listCalendars(
    departmentId: number,
    params: AcademicCalendarListParams = {}
  ): Promise<PaginatedData<AcademicCalendarResponse>> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.size !== undefined) query.set('size', String(params.size));

    const qs = query.toString();
    const url = qs ? `${this.baseUrl(departmentId)}/calendars?${qs}` : `${this.baseUrl(departmentId)}/calendars`;
    return apiService.get<PaginatedData<AcademicCalendarResponse>>(url);
  }

  // ── Section 5.12: GET Academic Calendar by ID ──

  /**
   * Fetch a single academic calendar by its ID.
   */
  async getCalendar(departmentId: number, id: number): Promise<AcademicCalendarResponse> {
    return apiService.get<AcademicCalendarResponse>(`${this.baseUrl(departmentId)}/calendars/${id}`);
  }

  // ── Section 5.13: CREATE Academic Calendar ──

  /**
   * Create a new academic calendar record.
   */
  async createCalendar(
    departmentId: number,
    data: CreateAcademicCalendarRequest
  ): Promise<AcademicCalendarResponse> {
    return apiService.post<AcademicCalendarResponse>(`${this.baseUrl(departmentId)}/calendars`, data);
  }

  // ── Section 5.14: UPDATE Academic Calendar ──

  /**
   * Update an existing academic calendar record.
   */
  async updateCalendar(
    departmentId: number,
    id: number,
    data: UpdateAcademicCalendarRequest
  ): Promise<AcademicCalendarResponse> {
    return apiService.put<AcademicCalendarResponse>(`${this.baseUrl(departmentId)}/calendars/${id}`, data);
  }

  // ── Section 5.15: DELETE Academic Calendar ──

  /**
   * Delete an academic calendar record by its ID.
   */
  async deleteCalendar(departmentId: number, id: number): Promise<void> {
    await apiService.delete<void>(`${this.baseUrl(departmentId)}/calendars/${id}`);
  }

  // ── Section 5.16: LIST Value Added Courses ──

  /**
   * Fetch paginated list of value added courses.
   */
  async listValueAddedCourses(
    departmentId: number,
    params: ValueAddedCourseListParams = {}
  ): Promise<PaginatedData<ValueAddedCourseResponse>> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.size !== undefined) query.set('size', String(params.size));

    const qs = query.toString();
    const url = qs ? `${this.baseUrl(departmentId)}/value-added-courses?${qs}` : `${this.baseUrl(departmentId)}/value-added-courses`;
    return apiService.get<PaginatedData<ValueAddedCourseResponse>>(url);
  }

  // ── Section 5.17: GET Value Added Course by ID ──

  /**
   * Fetch a single value added course by its ID.
   */
  async getValueAddedCourse(
    departmentId: number,
    id: number
  ): Promise<ValueAddedCourseResponse> {
    return apiService.get<ValueAddedCourseResponse>(`${this.baseUrl(departmentId)}/value-added-courses/${id}`);
  }

  // ── Section 5.18: CREATE Value Added Course ──

  /**
   * Create a new value added course record.
   */
  async createValueAddedCourse(
    departmentId: number,
    data: CreateValueAddedCourseRequest
  ): Promise<ValueAddedCourseResponse> {
    return apiService.post<ValueAddedCourseResponse>(`${this.baseUrl(departmentId)}/value-added-courses`, data);
  }

  // ── Section 5.19: UPDATE Value Added Course ──

  /**
   * Update an existing value added course record.
   */
  async updateValueAddedCourse(
    departmentId: number,
    id: number,
    data: UpdateValueAddedCourseRequest
  ): Promise<ValueAddedCourseResponse> {
    return apiService.put<ValueAddedCourseResponse>(`${this.baseUrl(departmentId)}/value-added-courses/${id}`, data);
  }

  // ── Section 5.20: DELETE Value Added Course ──

  /**
   * Delete a value added course record by its ID.
   */
  async deleteValueAddedCourse(departmentId: number, id: number): Promise<void> {
    await apiService.delete<void>(`${this.baseUrl(departmentId)}/value-added-courses/${id}`);
  }

  // ── Section 5.21: LIST MOOCs ──

  /**
   * Fetch paginated list of MOOCs.
   */
  async listMoocs(
    departmentId: number,
    params: MoocListParams = {}
  ): Promise<PaginatedData<MoocResponse>> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.size !== undefined) query.set('size', String(params.size));

    const qs = query.toString();
    const url = qs ? `${this.baseUrl(departmentId)}/moocs?${qs}` : `${this.baseUrl(departmentId)}/moocs`;
    return apiService.get<PaginatedData<MoocResponse>>(url);
  }

  // ── Section 5.22: GET MOOC by ID ──

  /**
   * Fetch a single MOOC by its ID.
   */
  async getMooc(departmentId: number, id: number): Promise<MoocResponse> {
    return apiService.get<MoocResponse>(`${this.baseUrl(departmentId)}/moocs/${id}`);
  }

  // ── Section 5.23: CREATE MOOC ──

  /**
   * Create a new MOOC record.
   */
  async createMooc(
    departmentId: number,
    data: CreateMoocRequest
  ): Promise<MoocResponse> {
    return apiService.post<MoocResponse>(`${this.baseUrl(departmentId)}/moocs`, data);
  }

  // ── Section 5.24: UPDATE MOOC ──

  /**
   * Update an existing MOOC record.
   */
  async updateMooc(
    departmentId: number,
    id: number,
    data: UpdateMoocRequest
  ): Promise<MoocResponse> {
    return apiService.put<MoocResponse>(`${this.baseUrl(departmentId)}/moocs/${id}`, data);
  }

  // ── Section 5.25: DELETE MOOC ──

  /**
   * Delete a MOOC record by its ID.
   */
  async deleteMooc(departmentId: number, id: number): Promise<void> {
    await apiService.delete<void>(`${this.baseUrl(departmentId)}/moocs/${id}`);
  }

}

export const academicService = new AcademicService();

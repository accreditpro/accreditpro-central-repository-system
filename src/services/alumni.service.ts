import { apiService } from './api.service';
import {
  PaginatedData,
  AlumniDetailResponse,
  CreateAlumniRequest,
  UpdateAlumniRequest,
  AlumniListParams,
  AlumniEmploymentResponse,
  CreateAlumniEmploymentRequest,
  AlumniHigherEducationResponse,
  CreateAlumniHigherEducationRequest,
  AlumniEngagementResponse,
  CreateAlumniEngagementRequest,
  AlumniContributionResponse,
  CreateAlumniContributionRequest,
  AlumniMentorshipResponse,
  CreateAlumniMentorshipRequest,
  AlumniAchievementResponse,
  CreateAlumniAchievementRequest,
} from '@/types/alumni.types';

/**
 * Alumni Service — wraps all /api/v1/departments/{departmentId}/alumni endpoints.
 */
class AlumniService {
  private baseUrl(departmentId: number): string {
    return `/v1/departments/${departmentId}/alumni`;
  }

  // ── Section 7.1: LIST Alumni (paginated) ──

  async listAlumni(
    departmentId: number,
    params: AlumniListParams = {}
  ): Promise<PaginatedData<AlumniDetailResponse>> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.size !== undefined) query.set('size', String(params.size));
    if (params.search) query.set('search', params.search);

    const qs = query.toString();
    const url = qs ? `${this.baseUrl(departmentId)}?${qs}` : this.baseUrl(departmentId);
    return apiService.get<PaginatedData<AlumniDetailResponse>>(url);
  }

  // ── Section 7.2: GET Alumni by ID ──

  async getAlumni(departmentId: number, id: number): Promise<AlumniDetailResponse> {
    return apiService.get<AlumniDetailResponse>(`${this.baseUrl(departmentId)}/${id}`);
  }

  // ── Section 7.3: CREATE Alumni ──

  async createAlumni(
    departmentId: number,
    data: CreateAlumniRequest
  ): Promise<AlumniDetailResponse> {
    return apiService.post<AlumniDetailResponse>(this.baseUrl(departmentId), data);
  }

  // ── Section 7.4: UPDATE Alumni ──

  async updateAlumni(
    departmentId: number,
    id: number,
    data: UpdateAlumniRequest
  ): Promise<AlumniDetailResponse> {
    return apiService.put<AlumniDetailResponse>(`${this.baseUrl(departmentId)}/${id}`, data);
  }

  // ── Section 7.5: DELETE Alumni ──

  async deleteAlumni(departmentId: number, id: number): Promise<void> {
    await apiService.delete<void>(`${this.baseUrl(departmentId)}/${id}`);
  }

  // ── Section 7.6: LIST Alumni Employments ──

  async listEmployments(departmentId: number, alumniId: number): Promise<AlumniEmploymentResponse[]> {
    return apiService.get<AlumniEmploymentResponse[]>(`${this.baseUrl(departmentId)}/${alumniId}/employment`);
  }

  // ── Section 7.7: ADD Alumni Employment ──

  async addEmployment(
    departmentId: number,
    alumniId: number,
    data: CreateAlumniEmploymentRequest
  ): Promise<AlumniEmploymentResponse> {
    return apiService.post<AlumniEmploymentResponse>(`${this.baseUrl(departmentId)}/${alumniId}/employment`, data);
  }

  // ── Section 7.8: LIST Alumni Higher Educations ──

  async listHigherEducation(departmentId: number, alumniId: number): Promise<AlumniHigherEducationResponse[]> {
    return apiService.get<AlumniHigherEducationResponse[]>(`${this.baseUrl(departmentId)}/${alumniId}/higher-education`);
  }

  // ── Section 7.9: ADD Alumni Higher Education ──

  async addHigherEducation(
    departmentId: number,
    alumniId: number,
    data: CreateAlumniHigherEducationRequest
  ): Promise<AlumniHigherEducationResponse> {
    return apiService.post<AlumniHigherEducationResponse>(`${this.baseUrl(departmentId)}/${alumniId}/higher-education`, data);
  }

  // ── Section 7.10: LIST Alumni Engagements ──

  async listEngagements(departmentId: number, alumniId: number): Promise<AlumniEngagementResponse[]> {
    return apiService.get<AlumniEngagementResponse[]>(`${this.baseUrl(departmentId)}/${alumniId}/engagement`);
  }

  // ── Section 7.11: ADD Alumni Engagement ──

  async addEngagement(
    departmentId: number,
    alumniId: number,
    data: CreateAlumniEngagementRequest
  ): Promise<AlumniEngagementResponse> {
    return apiService.post<AlumniEngagementResponse>(`${this.baseUrl(departmentId)}/${alumniId}/engagement`, data);
  }

  // ── Section 7.12: LIST Alumni Contributions ──

  async listContributions(departmentId: number, alumniId: number): Promise<AlumniContributionResponse[]> {
    return apiService.get<AlumniContributionResponse[]>(`${this.baseUrl(departmentId)}/${alumniId}/contributions`);
  }

  // ── Section 7.13: ADD Alumni Contribution ──

  async addContribution(
    departmentId: number,
    alumniId: number,
    data: CreateAlumniContributionRequest
  ): Promise<AlumniContributionResponse> {
    return apiService.post<AlumniContributionResponse>(`${this.baseUrl(departmentId)}/${alumniId}/contributions`, data);
  }

  // ── Section 7.14: LIST Alumni Mentorships ──

  async listMentorships(departmentId: number, alumniId: number): Promise<AlumniMentorshipResponse[]> {
    return apiService.get<AlumniMentorshipResponse[]>(`${this.baseUrl(departmentId)}/${alumniId}/mentorship`);
  }

  // ── Section 7.15: ADD Alumni Mentorship ──

  async addMentorship(
    departmentId: number,
    alumniId: number,
    data: CreateAlumniMentorshipRequest
  ): Promise<AlumniMentorshipResponse> {
    return apiService.post<AlumniMentorshipResponse>(`${this.baseUrl(departmentId)}/${alumniId}/mentorship`, data);
  }

  // ── Section 7.16: LIST Alumni Achievements ──

  async listAlumniAchievements(departmentId: number, alumniId: number): Promise<AlumniAchievementResponse[]> {
    return apiService.get<AlumniAchievementResponse[]>(`${this.baseUrl(departmentId)}/${alumniId}/achievements`);
  }

  // ── Section 7.17: ADD Alumni Achievement ──

  async addAlumniAchievement(
    departmentId: number,
    alumniId: number,
    data: CreateAlumniAchievementRequest
  ): Promise<AlumniAchievementResponse> {
    return apiService.post<AlumniAchievementResponse>(`${this.baseUrl(departmentId)}/${alumniId}/achievements`, data);
  }
}

export const alumniService = new AlumniService();

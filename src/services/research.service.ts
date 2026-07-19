import { apiService } from './api.service';
import {
  PaginatedData,
  PublicationResponse,
  CreatePublicationRequest,
  UpdatePublicationRequest,
  PublicationListParams,
  PatentResponse,
  CreatePatentRequest,
  UpdatePatentRequest,
  PatentListParams,
  GrantResponse,
  CreateGrantRequest,
  UpdateGrantRequest,
  GrantListParams,
  SponsoredProjectResponse,
  CreateSponsoredProjectRequest,
  UpdateSponsoredProjectRequest,
  SponsoredProjectListParams,
  ConsultancyResponse,
  CreateConsultancyRequest,
  UpdateConsultancyRequest,
  ConsultancyListParams,
} from '@/types/research.types';

/**
 * Research Service — wraps all /api/v1/departments/{departmentId}/research endpoints.
 */
class ResearchService {
  private baseUrl(departmentId: number): string {
    return `/v1/departments/${departmentId}/research`;
  }

  // ── Section 6.1: LIST Publications (paginated) ──

  /**
   * Fetch paginated list of publications with optional search/filter.
   */
  async listPublications(
    departmentId: number,
    params: PublicationListParams = {}
  ): Promise<PaginatedData<PublicationResponse>> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.size !== undefined) query.set('size', String(params.size));
    if (params.search) query.set('search', params.search);
    if (params.type) query.set('type', params.type);

    const qs = query.toString();
    const url = qs
      ? `${this.baseUrl(departmentId)}/publications?${qs}`
      : `${this.baseUrl(departmentId)}/publications`;
    return apiService.get<PaginatedData<PublicationResponse>>(url);
  }

  // ── Section 6.2: GET Publication by ID ──

  /**
   * Fetch a single publication by its ID.
   */
  async getPublication(departmentId: number, id: number): Promise<PublicationResponse> {
    return apiService.get<PublicationResponse>(`${this.baseUrl(departmentId)}/publications/${id}`);
  }

  // ── Section 6.3: CREATE Publication ──

  /**
   * Create a new publication.
   */
  async createPublication(
    departmentId: number,
    data: CreatePublicationRequest
  ): Promise<PublicationResponse> {
    return apiService.post<PublicationResponse>(
      `${this.baseUrl(departmentId)}/publications`,
      data
    );
  }

  // ── Section 6.4: UPDATE Publication ──

  /**
   * Update an existing publication. All fields are optional.
   */
  async updatePublication(
    departmentId: number,
    id: number,
    data: UpdatePublicationRequest
  ): Promise<PublicationResponse> {
    return apiService.put<PublicationResponse>(
      `${this.baseUrl(departmentId)}/publications/${id}`,
      data
    );
  }

  // ── Section 6.5: DELETE Publication ──

  /**
   * Delete a publication by its ID.
   */
  async deletePublication(departmentId: number, id: number): Promise<void> {
    await apiService.delete<void>(`${this.baseUrl(departmentId)}/publications/${id}`);
  }

  // ── Section 6.6: LIST Patents (paginated) ──

  async listPatents(
    departmentId: number,
    params: PatentListParams = {}
  ): Promise<PaginatedData<PatentResponse>> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.size !== undefined) query.set('size', String(params.size));
    if (params.search) query.set('search', params.search);

    const qs = query.toString();
    const url = qs
      ? `${this.baseUrl(departmentId)}/patents?${qs}`
      : `${this.baseUrl(departmentId)}/patents`;
    return apiService.get<PaginatedData<PatentResponse>>(url);
  }

  // ── Section 6.7: GET Patent by ID ──

  async getPatent(departmentId: number, id: number): Promise<PatentResponse> {
    return apiService.get<PatentResponse>(`${this.baseUrl(departmentId)}/patents/${id}`);
  }

  // ── Section 6.8: CREATE Patent ──

  async createPatent(
    departmentId: number,
    data: CreatePatentRequest
  ): Promise<PatentResponse> {
    return apiService.post<PatentResponse>(`${this.baseUrl(departmentId)}/patents`, data);
  }

  // ── Section 6.9: UPDATE Patent ──

  async updatePatent(
    departmentId: number,
    id: number,
    data: UpdatePatentRequest
  ): Promise<PatentResponse> {
    return apiService.put<PatentResponse>(`${this.baseUrl(departmentId)}/patents/${id}`, data);
  }

  // ── Section 6.10: DELETE Patent ──

  async deletePatent(departmentId: number, id: number): Promise<void> {
    await apiService.delete<void>(`${this.baseUrl(departmentId)}/patents/${id}`);
  }

  // ── Section 6.11: LIST Grants (paginated) ──

  async listGrants(
    departmentId: number,
    params: GrantListParams = {}
  ): Promise<PaginatedData<GrantResponse>> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.size !== undefined) query.set('size', String(params.size));
    if (params.search) query.set('search', params.search);

    const qs = query.toString();
    const url = qs
      ? `${this.baseUrl(departmentId)}/grants?${qs}`
      : `${this.baseUrl(departmentId)}/grants`;
    return apiService.get<PaginatedData<GrantResponse>>(url);
  }

  // ── Section 6.12: GET Grant by ID ──

  async getGrant(departmentId: number, id: number): Promise<GrantResponse> {
    return apiService.get<GrantResponse>(`${this.baseUrl(departmentId)}/grants/${id}`);
  }

  // ── Section 6.13: CREATE Grant ──

  async createGrant(
    departmentId: number,
    data: CreateGrantRequest
  ): Promise<GrantResponse> {
    return apiService.post<GrantResponse>(`${this.baseUrl(departmentId)}/grants`, data);
  }

  // ── Section 6.14: UPDATE Grant ──

  async updateGrant(
    departmentId: number,
    id: number,
    data: UpdateGrantRequest
  ): Promise<GrantResponse> {
    return apiService.put<GrantResponse>(`${this.baseUrl(departmentId)}/grants/${id}`, data);
  }

  // ── Section 6.15: DELETE Grant ──

  async deleteGrant(departmentId: number, id: number): Promise<void> {
    await apiService.delete<void>(`${this.baseUrl(departmentId)}/grants/${id}`);
  }

  // ── Section 6.16: LIST Sponsored Projects (paginated) ──

  async listSponsoredProjects(
    departmentId: number,
    params: SponsoredProjectListParams = {}
  ): Promise<PaginatedData<SponsoredProjectResponse>> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.size !== undefined) query.set('size', String(params.size));
    if (params.search) query.set('search', params.search);

    const qs = query.toString();
    const url = qs
      ? `${this.baseUrl(departmentId)}/sponsored-projects?${qs}`
      : `${this.baseUrl(departmentId)}/sponsored-projects`;
    return apiService.get<PaginatedData<SponsoredProjectResponse>>(url);
  }

  // ── Section 6.17: GET Sponsored Project by ID ──

  async getSponsoredProject(departmentId: number, id: number): Promise<SponsoredProjectResponse> {
    return apiService.get<SponsoredProjectResponse>(`${this.baseUrl(departmentId)}/sponsored-projects/${id}`);
  }

  // ── Section 6.18: CREATE Sponsored Project ──

  async createSponsoredProject(
    departmentId: number,
    data: CreateSponsoredProjectRequest
  ): Promise<SponsoredProjectResponse> {
    return apiService.post<SponsoredProjectResponse>(`${this.baseUrl(departmentId)}/sponsored-projects`, data);
  }

  // ── Section 6.19: UPDATE Sponsored Project ──

  async updateSponsoredProject(
    departmentId: number,
    id: number,
    data: UpdateSponsoredProjectRequest
  ): Promise<SponsoredProjectResponse> {
    return apiService.put<SponsoredProjectResponse>(`${this.baseUrl(departmentId)}/sponsored-projects/${id}`, data);
  }

  // ── Section 6.20: DELETE Sponsored Project ──

  async deleteSponsoredProject(departmentId: number, id: number): Promise<void> {
    await apiService.delete<void>(`${this.baseUrl(departmentId)}/sponsored-projects/${id}`);
  }

  // ── Section 6.21: LIST Consultancy Projects (paginated) ──

  async listConsultancies(
    departmentId: number,
    params: ConsultancyListParams = {}
  ): Promise<PaginatedData<ConsultancyResponse>> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.size !== undefined) query.set('size', String(params.size));
    if (params.search) query.set('search', params.search);

    const qs = query.toString();
    const url = qs
      ? `${this.baseUrl(departmentId)}/consultancy?${qs}`
      : `${this.baseUrl(departmentId)}/consultancy`;
    return apiService.get<PaginatedData<ConsultancyResponse>>(url);
  }

  // ── Section 6.22: GET Consultancy by ID ──

  async getConsultancy(departmentId: number, id: number): Promise<ConsultancyResponse> {
    return apiService.get<ConsultancyResponse>(`${this.baseUrl(departmentId)}/consultancy/${id}`);
  }

  // ── Section 6.23: CREATE Consultancy ──

  async createConsultancy(
    departmentId: number,
    data: CreateConsultancyRequest
  ): Promise<ConsultancyResponse> {
    return apiService.post<ConsultancyResponse>(`${this.baseUrl(departmentId)}/consultancy`, data);
  }

  // ── Section 6.24: UPDATE Consultancy ──

  async updateConsultancy(
    departmentId: number,
    id: number,
    data: UpdateConsultancyRequest
  ): Promise<ConsultancyResponse> {
    return apiService.put<ConsultancyResponse>(`${this.baseUrl(departmentId)}/consultancy/${id}`, data);
  }

  // ── Section 6.25: DELETE Consultancy ──

  async deleteConsultancy(departmentId: number, id: number): Promise<void> {
    await apiService.delete<void>(`${this.baseUrl(departmentId)}/consultancy/${id}`);
  }
}

export const researchService = new ResearchService();

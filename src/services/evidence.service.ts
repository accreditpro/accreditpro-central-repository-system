import { apiService } from './api.service';
import {
  PaginatedData,
  EvidenceDocumentResponse,
  CreateEvidenceRequest,
  UpdateEvidenceRequest,
  VerifyEvidenceRequest,
  EvidenceListParams,
} from '@/types/evidence.types';

/**
 * Evidence Service — wraps all /api/v1/departments/{departmentId}/evidence endpoints.
 *
 * All methods require `departmentId` to scope requests to the current department.
 * The apiService automatically injects the Bearer token and unwraps ApiResponse<T>.
 */
class EvidenceService {
  private baseUrl(departmentId: number): string {
    return `/v1/departments/${departmentId}/evidence`;
  }

  // ── Section 8.1: LIST Evidence Documents (paginated) ──

  /**
   * Fetch paginated list of evidence documents with optional category filter.
   */
  async listEvidence(
    departmentId: number,
    params: EvidenceListParams = {}
  ): Promise<PaginatedData<EvidenceDocumentResponse>> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.size !== undefined) query.set('size', String(params.size));
    if (params.category) query.set('category', params.category);

    const qs = query.toString();
    const url = qs ? `${this.baseUrl(departmentId)}?${qs}` : this.baseUrl(departmentId);
    return apiService.get<PaginatedData<EvidenceDocumentResponse>>(url);
  }

  // ── Section 8.2: GET Evidence by ID ──

  /**
   * Fetch a single evidence document by its ID.
   */
  async getEvidence(departmentId: number, id: number): Promise<EvidenceDocumentResponse> {
    return apiService.get<EvidenceDocumentResponse>(`${this.baseUrl(departmentId)}/${id}`);
  }

  // ── Section 8.3: CREATE (Upload) Evidence Document ──

  /**
   * Upload a new evidence document.
   */
  async createEvidence(
    departmentId: number,
    data: CreateEvidenceRequest
  ): Promise<EvidenceDocumentResponse> {
    return apiService.post<EvidenceDocumentResponse>(this.baseUrl(departmentId), data);
  }

  // ── Section 8.4: UPDATE Evidence Document ──

  /**
   * Update an existing evidence document. All fields are optional.
   */
  async updateEvidence(
    departmentId: number,
    id: number,
    data: UpdateEvidenceRequest
  ): Promise<EvidenceDocumentResponse> {
    return apiService.put<EvidenceDocumentResponse>(`${this.baseUrl(departmentId)}/${id}`, data);
  }

  // ── Section 8.5: DELETE Evidence Document ──

  /**
   * Delete an evidence document by its ID.
   */
  async deleteEvidence(departmentId: number, id: number): Promise<void> {
    await apiService.delete<void>(`${this.baseUrl(departmentId)}/${id}`);
  }

  // ── Section 8.6: VERIFY Evidence Document ──

  /**
   * Verify or reject an evidence document.
   */
  async verifyEvidence(
    departmentId: number,
    id: number,
    data: VerifyEvidenceRequest
  ): Promise<EvidenceDocumentResponse> {
    return apiService.put<EvidenceDocumentResponse>(
      `${this.baseUrl(departmentId)}/${id}/verify`,
      data
    );
  }
}

export const evidenceService = new EvidenceService();

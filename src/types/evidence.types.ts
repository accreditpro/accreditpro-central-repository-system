// ============================================================================
// Evidence Document Types — matches backend API responses (Section 8)
// ============================================================================

import { PaginatedData } from './faculty.types';

export type { PaginatedData };

// ── Section 8: EvidenceDocumentResponse ──

export interface EvidenceDocumentResponse {
  id: number;
  departmentId: number;
  name: string;
  category: string;
  version: string;
  filePath: string;
  fileType: string;
  fileSize: string;
  uploadedBy: number;
  uploadedDate: string;
  status: 'uploaded' | 'verified' | 'rejected';
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Section 8.3: CREATE Evidence Document Request ──

export interface CreateEvidenceRequest {
  name: string;
  category: string;
  version: string;
  filePath: string;
  fileType: string;
  fileSize: string;
}

// ── Section 8.4: UPDATE Evidence Document Request ──

export type UpdateEvidenceRequest = Partial<CreateEvidenceRequest>;

// ── Section 8.6: VERIFY Evidence Document Request ──

export interface VerifyEvidenceRequest {
  status: 'verified' | 'rejected';
  comments?: string;
}

// ── Evidence List Query Parameters ──

export interface EvidenceListParams {
  page?: number;
  size?: number;
  category?: string;
}

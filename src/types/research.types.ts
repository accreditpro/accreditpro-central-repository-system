// ============================================================================
// Research Repository Types — matches backend API responses (Sections 6.1–6.25)
// ============================================================================

import { PaginatedData } from './faculty.types';

export type { PaginatedData };

// ── Publications (Sections 6.1 to 6.5) ──

export interface PublicationResponse {
  id: number;
  departmentId: number;
  publicationTitle: string;
  publicationType: string | null;
  authors: string;
  studentAuthors: string | null;
  correspondingAuthor: string | null;
  journalConferenceName: string | null;
  publisher: string | null;
  issnIsbn: string | null;
  doi: string | null;
  indexedIn: string | null;
  impactFactor: number | null;
  citationCount: number | null;
  publicationDate: string;
  academicYear: string | null;
  status: string | null;
  publicationUrl: string | null;
  workflowStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePublicationRequest {
  publicationTitle: string;
  publicationType?: string;
  authors: string;
  studentAuthors?: string;
  correspondingAuthor?: string;
  journalConferenceName?: string;
  publisher?: string;
  issnIsbn?: string;
  doi?: string;
  indexedIn?: string;
  impactFactor?: number;
  citationCount?: number;
  publicationDate: string;
  academicYear?: string;
  status?: string;
  publicationUrl?: string;
}

export type UpdatePublicationRequest = Partial<CreatePublicationRequest>;

export interface PublicationListParams {
  page?: number;
  size?: number;
  search?: string;
  type?: string;
}

// ── Patents (Sections 6.6 to 6.10) ──

export interface PatentResponse {
  id: number;
  departmentId: number;
  patentTitle: string;
  inventors: string;
  studentInventors: string | null;
  patentNumber: string | null;
  applicationNumber: string;
  country: string;
  filingDate: string;
  publicationDate: string | null;
  grantDate: string | null;
  patentStatus: string | null;
  commercialized: string | null;
  revenueGenerated: number | null;
  workflowStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatentRequest {
  patentTitle: string;
  inventors: string;
  studentInventors?: string;
  patentNumber?: string;
  applicationNumber: string;
  country: string;
  filingDate: string;
  publicationDate?: string;
  grantDate?: string;
  patentStatus?: string;
  commercialized?: string;
  revenueGenerated?: number;
}

export type UpdatePatentRequest = Partial<CreatePatentRequest>;

export interface PatentListParams {
  page?: number;
  size?: number;
  search?: string;
}

// ── Research Grants (Sections 6.11 to 6.15) ──

export interface GrantResponse {
  id: number;
  departmentId: number;
  grantTitle: string;
  fundingAgency: string;
  principalInvestigator: string;
  coInvestigators: string | null;
  grantCategory: string | null;
  amountSanctioned: number;
  amountReceived: number | null;
  startDate: string;
  endDate: string | null;
  status: string | null;
  workflowStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGrantRequest {
  grantTitle: string;
  fundingAgency: string;
  principalInvestigator: string;
  coInvestigators?: string;
  grantCategory?: string;
  amountSanctioned: number;
  amountReceived?: number;
  startDate: string;
  endDate?: string;
  status?: string;
}

export type UpdateGrantRequest = Partial<CreateGrantRequest>;

export interface GrantListParams {
  page?: number;
  size?: number;
  search?: string;
}

// ── Sponsored Projects (Sections 6.16 to 6.20) ──

export interface SponsoredProjectResponse {
  id: number;
  departmentId: number;
  projectTitle: string;
  sponsorOrganization: string;
  principalInvestigator: string;
  coInvestigators: string | null;
  projectValue: number;
  startDate: string;
  endDate: string | null;
  projectStatus: string | null;
  projectOutcome: string | null;
  workflowStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSponsoredProjectRequest {
  projectTitle: string;
  sponsorOrganization: string;
  principalInvestigator: string;
  coInvestigators?: string;
  projectValue: number;
  startDate: string;
  endDate?: string;
  projectStatus?: string;
  projectOutcome?: string;
}

export type UpdateSponsoredProjectRequest = Partial<CreateSponsoredProjectRequest>;

export interface SponsoredProjectListParams {
  page?: number;
  size?: number;
  search?: string;
}

// ── Consultancy Projects (Sections 6.21 to 6.25) ──

export interface ConsultancyResponse {
  id: number;
  departmentId: number;
  consultancyTitle: string;
  clientOrganization: string;
  facultyLead: string;
  teamMembers: string | null;
  consultancyValue: number;
  startDate: string;
  endDate: string | null;
  status: string | null;
  outcomeSummary: string | null;
  workflowStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConsultancyRequest {
  consultancyTitle: string;
  clientOrganization: string;
  facultyLead: string;
  teamMembers?: string;
  consultancyValue: number;
  startDate: string;
  endDate?: string;
  status?: string;
  outcomeSummary?: string;
}

export type UpdateConsultancyRequest = Partial<CreateConsultancyRequest>;

export interface ConsultancyListParams {
  page?: number;
  size?: number;
  search?: string;
}

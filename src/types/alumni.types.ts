// ============================================================================
// Alumni Repository Types — matches backend API responses (Sections 7.1–7.25)
// ============================================================================

import { PaginatedData } from './faculty.types';

export type { PaginatedData };

// ── Alumni Details (Sections 7.1 to 7.5) ──

export interface AlumniDetailResponse {
  id: number;
  departmentId: number;
  alumniId: string;
  alumniName: string;
  rollNumber: string;
  programId: number | null;
  specializationId: number | null;
  graduationYear: string;
  personalEmail: string | null;
  mobileNumber: string | null;
  currentCity: string | null;
  currentCountry: string | null;
  linkedinProfile: string | null;
  alumniStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAlumniRequest {
  alumniId: string;
  alumniName: string;
  rollNumber: string;
  programId?: number;
  specializationId?: number;
  graduationYear: string;
  personalEmail?: string;
  mobileNumber?: string;
  currentCity?: string;
  currentCountry?: string;
  linkedinProfile?: string;
  alumniStatus?: string;
}

export type UpdateAlumniRequest = Partial<CreateAlumniRequest>;

export interface AlumniListParams {
  page?: number;
  size?: number;
  search?: string;
}

// ── Alumni Employment (Sections 7.6 & 7.7) ──

export interface AlumniEmploymentResponse {
  id: number;
  alumniId: number;
  organizationName: string;
  designation: string;
  industrySector: string | null;
  employmentType: string | null;
  startDate: string;
  currentPackageLpa: number | null;
  careerLevel: string | null;
  createdAt: string;
}

export interface CreateAlumniEmploymentRequest {
  organizationName: string;
  designation: string;
  industrySector?: string;
  employmentType?: string;
  startDate: string;
  currentPackageLpa?: number;
  careerLevel?: string;
}

// ── Alumni Higher Education (Sections 7.8 & 7.9) ──

export interface AlumniHigherEducationResponse {
  id: number;
  alumniId: number;
  institutionName: string;
  programName: string;
  country: string | null;
  admissionYear: string;
  completionYear: string | null;
  status: string | null;
  createdAt: string;
}

export interface CreateAlumniHigherEducationRequest {
  institutionName: string;
  programName: string;
  country?: string;
  admissionYear: string;
  completionYear?: string;
  status?: string;
}

// ── Alumni Engagement (Sections 7.10 & 7.11) ──

export interface AlumniEngagementResponse {
  id: number;
  alumniId: number;
  engagementType: string | null;
  activityName: string;
  activityDate: string;
  role: string | null;
  contributionHours: number | null;
  createdAt: string;
}

export interface CreateAlumniEngagementRequest {
  engagementType?: string;
  activityName: string;
  activityDate: string;
  role?: string;
  contributionHours?: number;
}

// ── Alumni Contributions (Sections 7.12 & 7.13) ──

export interface AlumniContributionResponse {
  id: number;
  alumniId: number;
  contributionType: string | null;
  contributionTitle: string;
  contributionValue: number | null;
  contributionDate: string;
  beneficiaryDepartment: string | null;
  createdAt: string;
}

export interface CreateAlumniContributionRequest {
  contributionType?: string;
  contributionTitle: string;
  contributionValue: number;
  contributionDate: string;
  beneficiaryDepartment?: string;
}

// ── Alumni Mentorship (Sections 7.14 & 7.15) ──

export interface AlumniMentorshipResponse {
  id: number;
  alumniId: number;
  mentorshipProgram: string;
  mentorshipType: string | null;
  numberOfMentees: number | null;
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

export interface CreateAlumniMentorshipRequest {
  mentorshipProgram: string;
  mentorshipType?: string;
  numberOfMentees?: number;
  startDate: string;
  endDate?: string;
}

// ── Alumni Achievements (Sections 7.16 & 7.17) ──

export interface AlumniAchievementResponse {
  id: number;
  alumniId: number;
  achievementTitle: string;
  achievementCategory: string | null;
  awardingOrganization: string | null;
  achievementDate: string;
  description: string | null;
  createdAt: string;
}

export interface CreateAlumniAchievementRequest {
  achievementTitle: string;
  achievementCategory?: string;
  awardingOrganization?: string;
  achievementDate: string;
  description?: string;
}

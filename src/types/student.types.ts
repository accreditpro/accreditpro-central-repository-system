// ============================================================================
// Student Profile Types — matches backend API responses (Sections 4.1–4.5)
// ============================================================================

import { PaginatedData } from './faculty.types';

export type { PaginatedData };

// ── Student Profile (main response object) ──

export interface StudentProfileResponse {
  id: number;
  departmentId: number;
  registrationNumber: string;
  studentId: string;
  rollNumber: string;
  studentName: string;
  gender: string | null;
  dateOfBirth: string | null;
  aadhaarNumber: string | null;
  emailAddress: string | null;
  mobileNumber: string | null;
  programOfferingId: number | null;
  currentSemester: number | null;
  studentStatus: string;
  photoUrl: string | null;
  workflowStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Create / Update Student Request Bodies ──

export interface CreateStudentRequest {
  registrationNumber: string;
  studentId: string;
  rollNumber: string;
  studentName: string;
  gender?: string;
  dateOfBirth?: string;
  aadhaarNumber?: string;
  emailAddress?: string;
  mobileNumber?: string;
  programOfferingId: number;
  currentSemester?: number;
  studentStatus?: string;
}

export type UpdateStudentRequest = Partial<CreateStudentRequest>;

// ── Student Admission (Sections 4.6 & 4.7) ──

export interface AdmissionResponse {
  id: number;
  studentId: number;
  academicYearId: number | null;
  admissionType: string | null;
  admissionCategory: string | null;
  admissionRank: number | null;
  admissionQuota: string | null;
  stateOfOrigin: string | null;
  country: string | null;
  admissionStatus: string | null;
  createdAt: string;
}

export interface UpdateAdmissionRequest {
  academicYearId?: number;
  admissionType?: string;
  admissionCategory?: string;
  admissionRank?: number;
  admissionQuota?: string;
  stateOfOrigin?: string;
  country?: string;
  admissionStatus?: string;
}

// ── Student Diversity (Sections 4.8 & 4.9) ──

export interface DiversityResponse {
  id: number;
  studentId: number;
  socialCategory: string | null;
  economicallyWeakerSection: boolean;
  minorityStatus: boolean;
  differentlyAbled: boolean;
  nationality: string | null;
  firstGenerationLearner: boolean;
  createdAt: string;
}

export interface UpdateDiversityRequest {
  socialCategory?: string;
  economicallyWeakerSection?: boolean;
  minorityStatus?: boolean;
  differentlyAbled?: boolean;
  nationality?: string;
  firstGenerationLearner?: boolean;
}

// ── Student Performance (Sections 4.10 to 4.12) ──

export interface PerformanceResponse {
  id: number;
  studentId: number;
  academicYearId: number | null;
  semester: number;
  sgpa: number | null;
  cgpa: number | null;
  backlogCount: number;
  attendancePercentage: number | null;
  graduationStatus: string | null;
  createdAt: string;
}

export interface CreatePerformanceRequest {
  academicYearId?: number;
  semester: number;
  sgpa?: number;
  cgpa?: number;
  backlogCount?: number;
  attendancePercentage?: number;
  graduationStatus?: string;
}

export type UpdatePerformanceRequest = Partial<CreatePerformanceRequest>;

// ── Student Progression (Sections 4.13 & 4.14) ──

export interface ProgressionResponse {
  id: number;
  studentId: number;
  academicYearId: number | null;
  placementStatus: string | null;
  higherEducationStatus: string | null;
  competitiveExamQualified: string | null;
  entrepreneurshipStatus: string | null;
  internshipCompleted: string | null;
  createdAt: string;
}

export interface UpdateProgressionRequest {
  academicYearId?: number;
  placementStatus?: string;
  higherEducationStatus?: string;
  competitiveExamQualified?: string;
  internshipCompleted?: string;
  entrepreneurshipStatus?: string;
}

// ── Student Scholarships (Sections 4.15 & 4.16) ──

export interface ScholarshipResponse {
  id: number;
  studentId: number;
  scholarshipName: string;
  scholarshipType: string | null;
  provider: string | null;
  amount: number | null;
  academicYearId: number | null;
  feeWaiverStatus: string | null;
  disbursementStatus: string;
  createdAt: string;
}

export interface CreateScholarshipRequest {
  scholarshipName: string;
  scholarshipType?: string;
  provider?: string;
  amount?: number;
  academicYearId?: number;
  feeWaiverStatus?: string;
  disbursementStatus?: string;
}

// ── Student Achievements (Sections 4.17 & 4.18) ──

export interface StudentAchievementResponse {
  id: number;
  studentId: number;
  achievementType: string | null;
  achievementName: string;
  level: string | null;
  awardPosition: string | null;
  achievementDate: string;
  academicYearId: number | null;
  organizingBody: string | null;
  createdAt: string;
}

export interface CreateAchievementRequest {
  achievementType?: string;
  achievementName: string;
  level?: string;
  awardPosition?: string;
  achievementDate: string;
  academicYearId?: number;
  organizingBody?: string;
}

// ── Student List Query Parameters ──

export interface StudentListParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
}

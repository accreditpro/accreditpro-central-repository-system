// ============================================================================
// Faculty Profile Types — matches backend API responses (Sections 3.1–3.5)
// ============================================================================

/** Paginated response shape from Spring Page (wrapped inside ApiResponse.data) */
export interface PaginatedData<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  empty: boolean;
  numberOfElements: number;
}

// ── Qualification (nested inside FacultyProfileResponse) ──

export interface QualificationResponse {
  id: number;
  facultyId: number;
  qualificationLevel: string;
  degree: string;
  specialization: string | null;
  university: string | null;
  yearOfPassing: number | null;
  phdStatus: string;
  phdAwardedDate: string | null;
  createdAt: string;
}

// ── Employment (nested inside FacultyProfileResponse) ──

export interface EmploymentResponse {
  id: number;
  facultyId: number;
  employmentType: string;
  facultyCategory: string | null;
  dateOfJoiningInstitution: string;
  dateOfJoiningProfession: string | null;
  totalExperienceYears: number;
  industryExperienceYears: number;
  aicteFacultyId: string | null;
  updatedAt: string;
}

// ── FDP (nested inside FacultyProfileResponse) ──

export interface FdpResponse {
  id: number;
  facultyId: number;
  fdpName: string;
  organizingBody: string | null;
  startDate: string;
  endDate: string;
  durationDays: number | null;
  mode: string;
  certificationAvailable: boolean;
  certificateUrl: string | null;
  createdAt: string;
}

// ── Faculty Profile (main response object) ──

export interface FacultyProfileResponse {
  id: number;
  departmentId: number;
  employeeId: string;
  facultyName: string;
  gender: string | null;
  dateOfBirth: string | null;
  panNumber: string | null;
  officialEmail: string | null;
  personalEmail: string | null;
  mobileNumber: string | null;
  designation: string | null;
  status: string;
  photoUrl: string | null;
  workflowStatus: string | null;
  qualifications: QualificationResponse[];
  employment: EmploymentResponse | null;
  fdps: FdpResponse[];
  createdAt: string;
  updatedAt: string;
}

// ── FDP CRUD Request Bodies (Sections 3.12–3.15) ──

export interface CreateFdpRequest {
  fdpName: string;
  organizingBody?: string;
  startDate: string;
  endDate: string;
  durationDays?: number;
  mode: string;
  certificationAvailable?: boolean;
  certificateUrl?: string;
}

export type UpdateFdpRequest = Partial<CreateFdpRequest>;

// ── Employment Update Request Body (Section 3.11) ──

export interface UpdateEmploymentRequest {
  employmentType?: string;
  facultyCategory?: string;
  dateOfJoiningInstitution: string;
  dateOfJoiningProfession?: string;
  totalExperienceYears?: number;
  industryExperienceYears?: number;
  aicteFacultyId?: string;
}

// ── Qualification CRUD Request Bodies (Sections 3.6–3.9) ──

export interface CreateQualificationRequest {
  qualificationLevel: string;
  degree: string;
  specialization?: string;
  university?: string;
  yearOfPassing?: number;
  phdStatus?: string;
  phdAwardedDate?: string;
}

export type UpdateQualificationRequest = Partial<CreateQualificationRequest>;

// ── Create / Update Faculty Request Bodies ──

export interface CreateFacultyRequest {
  employeeId: string;
  facultyName: string;
  gender?: string;
  dateOfBirth?: string;
  panNumber?: string;
  officialEmail?: string;
  personalEmail?: string;
  mobileNumber?: string;
  designation?: string;
  status?: string;
}

export type UpdateFacultyRequest = Partial<CreateFacultyRequest>;

// ── Faculty List Query Parameters ──

export interface FacultyListParams {
  page?: number;
  size?: number;
  search?: string;
  designation?: string;
  status?: string;
}

// ── Section 10 Repository Metrics ──

export interface RepositoryMetricsResponse {
  id: number;
  departmentId: number;
  repositoryType: 'academic' | 'faculty' | 'student' | 'research' | 'alumni';
  dataCompleteness: number;
  evidenceCompleteness: number;
  verificationPercent: number;
  readinessScore: number;
  lastCalculatedAt: string;
}

export interface DashboardKpiResponse {
  departmentId: number;
  totalFaculty: number;
  activeFaculty: number;
  totalStudents: number;
  activeStudents: number;
  totalPublications: number;
  totalPatents: number;
  totalGrants: number;
  totalAlumni: number;
  uploadedEvidence: number;
  pendingApprovals: number;
  overallReadiness: number;
}

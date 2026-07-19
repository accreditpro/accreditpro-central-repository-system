import { PaginatedData } from '@/types';

/**
 * Response shape for a single Curriculum record (Sections 5.1–5.5).
 */
export interface CurriculumResponse {
  id: number;
  departmentId: number;
  academicYearId: number | null;
  programOfferingId: number | null;
  totalCredits: number | null;
  openElectives: number | null;
  professionalElectives: number | null;
  valueAddedCourses: number | null;
  internshipIncluded: boolean | null;
  projectIncluded: boolean | null;
  industryCoursesIncluded: boolean | null;
  revisionDate: string | null;
  workflowStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request body for CREATE Curriculum (Section 5.3).
 */
export interface CreateCurriculumRequest {
  academicYearId: number;
  programOfferingId: number;
  totalCredits: number;
  openElectives?: number;
  professionalElectives?: number;
  valueAddedCourses?: number;
  internshipIncluded?: boolean;
  projectIncluded?: boolean;
  industryCoursesIncluded?: boolean;
  revisionDate?: string;
}

/**
 * Request body for UPDATE Curriculum (Section 5.4). All fields optional.
 */
export interface UpdateCurriculumRequest extends Partial<CreateCurriculumRequest> {}

/**
 * Query parameters for listing curricula.
 */
export interface CurriculumListParams {
  page?: number;
  size?: number;
}

// ────────────────────────────────────────────
// Section 5.6 – 5.10: Courses
// ────────────────────────────────────────────

/**
 * Response shape for a single Course record (Sections 5.6–5.10).
 */
export interface CourseResponse {
  id: number;
  departmentId: number;
  programOfferingId: number | null;
  courseCode: string;
  courseName: string;
  semester: number | null;
  courseType: string | null;
  credits: number | null;
  theoryHours: number | null;
  labHours: number | null;
  status: string | null;
  workflowStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request body for CREATE Course (Section 5.8).
 */
export interface CreateCourseRequest {
  programOfferingId: number;
  courseCode: string;
  courseName: string;
  semester: number;
  courseType: string;
  credits: number;
  theoryHours?: number;
  labHours?: number;
  status?: string;
}

/**
 * Request body for UPDATE Course (Section 5.9). All fields optional.
 */
export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {}

/**
 * Query parameters for listing courses.
 */
export interface CourseListParams {
  page?: number;
  size?: number;
  search?: string;
  type?: string;
}

// ────────────────────────────────────────────
// Section 5.11 – 5.15: Academic Calendar
// ────────────────────────────────────────────

/**
 * Response shape for a single Academic Calendar record (Sections 5.11–5.15).
 */
export interface AcademicCalendarResponse {
  id: number;
  departmentId: number;
  academicYearId: number | null;
  semester: string | null;
  startDate: string | null;
  endDate: string | null;
  instructionalDays: number | null;
  midExamDates: string | null;
  endExamDates: string | null;
  workflowStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request body for CREATE Academic Calendar (Section 5.13).
 */
export interface CreateAcademicCalendarRequest {
  academicYearId: number;
  semester: string;
  startDate: string;
  endDate: string;
  instructionalDays?: number;
  midExamDates?: string;
  endExamDates?: string;
}

/**
 * Request body for UPDATE Academic Calendar (Section 5.14). All fields optional.
 */
export interface UpdateAcademicCalendarRequest extends Partial<CreateAcademicCalendarRequest> {}

/**
 * Query parameters for listing academic calendars.
 */
export interface AcademicCalendarListParams {
  page?: number;
  size?: number;
}

// ────────────────────────────────────────────
// Section 5.16 – 5.20: Value Added Courses
// ────────────────────────────────────────────

/**
 * Response shape for a single Value Added Course record (Sections 5.16–5.20).
 */
export interface ValueAddedCourseResponse {
  id: number;
  departmentId: number;
  courseName: string;
  conductingUnit: string | null;
  academicYearId: number | null;
  durationHours: number | null;
  studentsEnrolled: number;
  certificationProvided: boolean;
  workflowStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request body for CREATE Value Added Course (Section 5.18).
 */
export interface CreateValueAddedCourseRequest {
  courseName: string;
  conductingUnit?: string;
  academicYearId: number;
  durationHours?: number;
  studentsEnrolled?: number;
  certificationProvided?: boolean;
}

/**
 * Request body for UPDATE Value Added Course (Section 5.19). All fields optional.
 */
export interface UpdateValueAddedCourseRequest extends Partial<CreateValueAddedCourseRequest> {}

/**
 * Query parameters for listing value added courses.
 */
export interface ValueAddedCourseListParams {
  page?: number;
  size?: number;
}

// ────────────────────────────────────────────
// Section 5.21 – 5.25: MOOCs / SWAYAM / NPTEL
// ────────────────────────────────────────────

/**
 * Response shape for a single MOOC record (Sections 5.21–5.25).
 */
export interface MoocResponse {
  id: number;
  departmentId: number;
  platformId: number | null;
  courseName: string;
  academicYearId: number | null;
  studentsEnrolled: number;
  certificationsEarned: number;
  workflowStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request body for CREATE MOOC (Section 5.23).
 */
export interface CreateMoocRequest {
  platformId: number;
  courseName: string;
  academicYearId: number;
  studentsEnrolled?: number;
  certificationsEarned?: number;
}

/**
 * Request body for UPDATE MOOC (Section 5.24). All fields optional.
 */
export interface UpdateMoocRequest extends Partial<CreateMoocRequest> {}

/**
 * Query parameters for listing MOOCs.
 */
export interface MoocListParams {
  page?: number;
  size?: number;
}

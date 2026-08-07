/**
 * Response shape for GET /api/v1/app/academic-structure/summary
 */
export interface ProgramDistribution {
  programName?: string;
  name?: string;
  departmentCount?: number;
  departments?: number;
}

export interface IntakeTrend {
  departmentName?: string;
  name?: string;
  offeringCount?: number;
  offerings?: number;
  year?: string;
  count?: number;
}

export interface AcademicStructureSummary {
  academicYears: number;
  programs: number;
  departments: number;
  specializations: number;
  regulations: number;
  policiesSettings?: number;
  programOfferings: number;
  totalIntakeCurrentYear: number;
  programDistribution: ProgramDistribution[];
  intakeTrend: IntakeTrend[];
}

/** ── User Management API Types ── */

export type UserStatusEnum = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export type UserRoleEnum =
  | 'SUPER_ADMIN'
  | 'INSTITUTION_ADMIN'
  | 'PRINCIPAL'
  | 'IQAC_COORDINATOR'
  | 'DEPARTMENT_COORDINATOR'
  | 'RESEARCH_COORDINATOR'
  | 'PLACEMENT_OFFICER'
  | 'EXAMINATION_OFFICER'
  | 'COMPILANCE_OFFICER';

/** A single user as returned by GET /api/v1/app/users and GET /api/v1/app/users/{id} */
export interface UserApiResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  mobile: string;
  role: UserRoleEnum;
  roleDisplayName: string;
  institutionId: number;
  department: string | null;
  status: UserStatusEnum;
  lastLogin: string | null;
  createdAt: string;
}

/** Generic paginated list response wrapper */
export interface PaginatedListResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/** Query params for GET /api/v1/app/users */
export interface UserQueryParams {
  page: number;
  pageSize: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/** Response from POST /api/v1/app/users — contains the real temporary password */
export interface CreateUserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string | null;
  temporaryPassword: string;
  requiresPasswordChange: boolean;
}

/** Request body for POST /api/v1/app/users */
export interface CreateUserRequest {
  name: string;
  email: string;
  mobile: string;
  role: UserRoleEnum;
  departmentId?: number;
  autoGeneratePassword: boolean;
}

/** Request body for PUT /api/v1/app/users/{id} */
export interface UpdateUserRequest {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  role?: UserRoleEnum;
  departmentId?: number;
  status?: UserStatusEnum;
}

/** ── Settings API Types ── */

/** Profile data returned by GET /api/v1/app/settings/profile */
export interface SettingsProfile {
  name: string;
  email: string;
  mobile: string;
}

/** Request body for PUT /api/v1/app/settings/profile */
export interface UpdateSettingsProfileRequest {
  name: string;
  email: string;
  mobile: string;
}

/** Request body for PUT /api/v1/app/settings/password */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/** Request body for PATCH /api/v1/app/settings/notifications */
export interface NotificationSettingsRequest {
  emailNotifications?: boolean;
  inAppNotifications?: boolean;
}

/** ── Activity Logs API Types ── */

/** A single activity log entry from GET /api/institution/activity-logs */
export interface ActivityLogEntry {
  id: number;
  userId: number;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  institutionId: number;
  date: string;
  time: string;
}

/** Query params for GET /api/institution/activity-logs */
export interface ActivityLogQueryParams {
  institutionId: number;
  page: number;
  pageSize: number;
}

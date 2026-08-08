// ============================================================================
// API Response Types — Matches Spring Boot backend response wrapper
// ============================================================================

/** Standard API response envelope from backend */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// ============================================================================
// Auth Types
// ============================================================================

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  INSTITUTION_ADMIN = 'INSTITUTION_ADMIN',
  IQAC_COORDINATOR = 'IQAC_COORDINATOR',
  PRINCIPAL = 'PRINCIPAL',
  DEPARTMENT_COORDINATOR = 'DEPARTMENT_COORDINATOR',
  INFRASTRUCTURE_COORDINATOR = 'INFRASTRUCTURE_COORDINATOR',
  FINANCE_COORDINATOR = 'FINANCE_COORDINATOR',
  TPO_COORDINATOR = 'TPO_COORDINATOR',
  PLACEMENT_OFFICER = 'PLACEMENT_OFFICER',
  STUDENT_DEVELOPMENT_COORDINATOR = 'STUDENT_DEVELOPMENT_COORDINATOR',
  EXAMINATION_OFFICER = 'EXAMINATION_OFFICER',
  HEAD_OF_DEPARTMENT = 'HEAD_OF_DEPARTMENT',
  HOD = 'HOD',
  RESEARCH_COORDINATOR = 'RESEARCH_COORDINATOR',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
}

/** User object as returned by backend — /api/auth/login and /api/auth/me */
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  institutionId: number | null;
  institutionName: string | null;
  department: string | null;
  departmentId: number | null;
}

/** Auth tokens as returned by backend — embedded in login response data */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

/** Credentials sent to POST /api/auth/login */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Login response data — what the backend returns inside `data` field
 * of POST /api/auth/login
 */
export interface LoginResponseData extends User {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

/**
 * Normalized login result used throughout the frontend.
 * Derived by splitting LoginResponseData into user + tokens.
 */
export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

/** Redux auth slice state */
export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isImpersonating?: boolean;
  originalUser?: User | null;
}

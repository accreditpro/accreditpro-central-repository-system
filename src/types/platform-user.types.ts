export type PlatformUserStatus = 'active' | 'inactive' | 'blocked' | 'pending';

/**
 * A user visible in the Super Admin platform-wide user directory.
 * Covers platform staff (Super Admin) and users across all institutions.
 */
export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  /** Display role, e.g. "Institution Admin", "IQAC Coordinator". */
  role: string;
  /** Matches UserRole enum value, used for role filtering and badges. */
  roleKey: string;
  /** Institution the user belongs to ('' for platform-level Super Admins). */
  institutionId: string;
  institution: string;
  /** Department for departmental roles ('' otherwise). */
  department: string;
  status: PlatformUserStatus;
  lastLogin: string;
  createdAt: string;
}

export interface PlatformUserQueryParams {
  page: number;
  pageSize: number;
  search?: string;
  /** 'platform' = AccreditPro staff, 'college' = institution users. */
  type?: 'platform' | 'college';
  institutionId?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PlatformUserListResponse {
  data: PlatformUser[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface PlatformUserStats {
  total: number;
  /** AccreditPro platform staff (e.g. Super Admins). */
  platform: number;
  /** Users belonging to an institution. */
  college: number;
  active: number;
  pending: number;
  blocked: number;
  inactive: number;
}

export interface PlatformUserCreateInput {
  name: string;
  email: string;
  mobile: string;
  role: string;
  roleKey: string;
  institutionId: string;
  institution: string;
  department: string;
}

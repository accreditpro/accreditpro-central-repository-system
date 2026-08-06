import { apiService } from '@/services/api.service';
import { institutionService } from '@/services/institution.service';
import {
  PlatformUser,
  PlatformUserCreateInput,
  PlatformUserListResponse,
  PlatformUserQueryParams,
  PlatformUserStats,
  PlatformUserStatus,
} from '@/types/platform-user.types';

// Helper to convert backend role enum to display name
const ROLE_DISPLAY_NAMES: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  INSTITUTION_ADMIN: 'Institution Admin',
  IQAC_COORDINATOR: 'IQAC Coordinator',
  PRINCIPAL: 'Principal',
  HOD: 'HOD',
  DEPARTMENT_COORDINATOR: 'Department Coordinator',
  RESEARCH_COORDINATOR: 'Research Coordinator',
  PLACEMENT_OFFICER: 'Placement Officer',
  EXAMINATION_OFFICER: 'Examination Officer',
  COMPLIANCE_OFFICER: 'Compliance Officer',
};

// Helper to convert UI status string to backend UPPERCASE format
const STATUS_TO_API: Record<string, string> = {
  active: 'ACTIVE',
  inactive: 'INACTIVE',
  blocked: 'BLOCKED',
  pending: 'PENDING',
};

// Helper to convert backend UPPERCASE status to UI lowercase format
const STATUS_FROM_API: Record<string, PlatformUserStatus> = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
  PENDING: 'pending',
};

function formatBackendUser(u: any): PlatformUser {
  const firstName = u.firstName || u.name?.split(' ')[0] || '';
  const lastName = u.lastName || u.name?.split(' ').slice(1).join(' ') || '';
  const fullName = u.name || `${firstName} ${lastName}`.trim() || u.email || 'Unnamed User';
  const rawRole = String(u.role || 'SUPER_ADMIN').toUpperCase();
  const roleDisplay = u.roleDisplayName || ROLE_DISPLAY_NAMES[rawRole] || u.role || rawRole;
  const rawStatus = String(u.status || 'ACTIVE').toUpperCase();
  const normStatus = STATUS_FROM_API[rawStatus] || 'active';

  return {
    id: String(u.id ?? `user-${Date.now()}`),
    name: fullName,
    email: u.email || '',
    mobile: u.mobile || u.phone || '-',
    role: roleDisplay,
    roleKey: rawRole,
    institutionId: u.institutionId ? String(u.institutionId) : '',
    institution: u.institutionName || u.institution || (u.institutionId ? `Institution #${u.institutionId}` : 'AccreditPro Platform'),
    department: u.department || '-',
    status: normStatus,
    lastLogin: u.lastLogin || u.lastLoginAt ? String(u.lastLogin || u.lastLoginAt).slice(0, 16).replace('T', ' ') : '-',
    createdAt: u.createdAt ? String(u.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10),
  };
}

class UserService {
  /**
   * GET /api/admin/users
   *
   * Fetches paginated platform and college users from backend.
   */
  async getUsers(params: PlatformUserQueryParams): Promise<PlatformUserListResponse> {
    try {
      const queryParams: Record<string, any> = {
        page: params.page || 1,
        pageSize: params.pageSize || 10,
      };

      if (params.search && params.search.trim()) {
        queryParams.search = params.search.trim();
      }

      if (params.type === 'platform') {
        queryParams.role = 'SUPER_ADMIN';
      } else if (params.role && params.role !== 'all') {
        queryParams.role = params.role.toUpperCase().replace(/\s+/g, '_');
      }

      if (params.status && params.status !== 'all') {
        queryParams.status = STATUS_TO_API[params.status] || params.status.toUpperCase();
      }

      if (params.institutionId && params.institutionId !== 'all') {
        const numId = Number(params.institutionId);
        if (!isNaN(numId)) {
          queryParams.institutionId = numId;
        }
      }

      if (params.sortBy) {
        queryParams.sortBy = params.sortBy;
        queryParams.sortDirection = params.sortDirection || 'desc';
      }

      const raw = await apiService.get<any>('/admin/users', { params: queryParams });

      let rawData: any[] = [];
      let total = 0;

      if (Array.isArray(raw)) {
        rawData = raw;
        total = raw.length;
      } else if (raw && Array.isArray(raw.content)) {
        rawData = raw.content;
        total = raw.totalElements ?? raw.content.length;
      } else if (raw && Array.isArray(raw.data)) {
        rawData = raw.data;
        total = raw.total ?? raw.data.length;
      } else if (raw && raw.items && Array.isArray(raw.items)) {
        rawData = raw.items;
        total = raw.total ?? raw.items.length;
      }

      const data = rawData.map(formatBackendUser);

      return {
        data,
        pagination: {
          page: params.page,
          pageSize: params.pageSize,
          total: total || data.length,
        },
      };
    } catch (error) {
      console.warn('API error fetching users, returning fallback response:', error);
      return {
        data: [],
        pagination: { page: params.page, pageSize: params.pageSize, total: 0 },
      };
    }
  }

  /**
   * GET /api/admin/users/roles
   *
   * Fetches user role statistics from backend.
   */
  async getUserStats(): Promise<PlatformUserStats> {
    try {
      // 1. Fetch role breakdown counts
      const roleCounts = await apiService.get<any[]>('/admin/users/roles').catch(() => []);

      let platformCount = 0;
      let collegeCount = 0;

      if (Array.isArray(roleCounts)) {
        roleCounts.forEach((rc: any) => {
          const role = String(rc.role || rc.roleKey || '').toUpperCase();
          const count = Number(rc.count || rc.userCount || 0);
          if (role === 'SUPER_ADMIN') {
            platformCount += count;
          } else {
            collegeCount += count;
          }
        });
      }

      // 2. Fetch page 1 list to calculate active, pending, blocked counts
      const res = await this.getUsers({ page: 1, pageSize: 100 });
      const all = res.data;

      const active = all.filter((u) => u.status === 'active').length;
      const pending = all.filter((u) => u.status === 'pending').length;
      const blocked = all.filter((u) => u.status === 'blocked').length;
      const inactive = all.filter((u) => u.status === 'inactive').length;
      const total = res.pagination.total || all.length;

      return {
        total,
        platform: platformCount || all.filter((u) => u.roleKey === 'SUPER_ADMIN').length,
        college: collegeCount || all.filter((u) => u.roleKey !== 'SUPER_ADMIN').length,
        active,
        pending,
        blocked,
        inactive,
      };
    } catch {
      return {
        total: 0,
        platform: 0,
        college: 0,
        active: 0,
        pending: 0,
        blocked: 0,
        inactive: 0,
      };
    }
  }

  /**
   * GET /api/admin/users/{id}
   */
  async getUserById(id: number | string): Promise<PlatformUser> {
    const raw = await apiService.get<any>(`/admin/users/${id}`);
    return formatBackendUser(raw?.data || raw);
  }

  /**
   * POST /api/admin/users
   *
   * Creates a new platform user or college user.
   */
  async createUser(
    input: PlatformUserCreateInput,
    _credentials?: { username?: string; password?: string }
  ): Promise<{ user: PlatformUser; temporaryPassword?: string }> {
    const nameParts = input.name.trim().split(' ');
    const firstName = nameParts[0] || input.name;
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const payload: Record<string, any> = {
      firstName,
      lastName,
      email: input.email.trim(),
      mobile: input.mobile.trim(),
      role: input.roleKey || 'SUPER_ADMIN',
    };

    if (input.institutionId) {
      const instId = Number(input.institutionId);
      if (!isNaN(instId)) {
        payload.institutionId = instId;
      }
    }

    if (input.department && input.department !== '-') {
      payload.department = input.department;
    }

    const raw = await apiService.post<any>('/admin/users', payload);
    const dataObj = raw?.data || raw;
    const user = formatBackendUser(dataObj);
    const temporaryPassword = dataObj.temporaryPassword || dataObj.tempPassword || dataObj.password;

    return { user, temporaryPassword };
  }

  /**
   * PUT /api/admin/users/{id}
   */
  async updateUser(id: number | string, input: Partial<PlatformUserCreateInput>): Promise<PlatformUser> {
    const payload: Record<string, any> = {};
    if (input.name) {
      const parts = input.name.trim().split(' ');
      payload.firstName = parts[0];
      payload.lastName = parts.slice(1).join(' ') || parts[0];
    }
    if (input.email) payload.email = input.email.trim();
    if (input.mobile) payload.mobile = input.mobile.trim();
    if (input.roleKey) payload.role = input.roleKey;
    if (input.institutionId) {
      const instId = Number(input.institutionId);
      if (!isNaN(instId)) payload.institutionId = instId;
    }
    if (input.department && input.department !== '-') {
      payload.department = input.department;
    }

    const raw = await apiService.put<any>(`/admin/users/${id}`, payload);
    return formatBackendUser(raw?.data || raw);
  }

  /**
   * PATCH /api/admin/users/{id}/status
   *
   * Updates status (ACTIVE | INACTIVE | BLOCKED | PENDING)
   */
  async updateUserStatus(id: string | number, status: PlatformUserStatus): Promise<PlatformUser> {
    const apiStatus = STATUS_TO_API[status] || status.toUpperCase();
    const raw = await apiService.patch<any>(`/admin/users/${id}/status`, {
      status: apiStatus,
    });
    return formatBackendUser(raw?.data || raw);
  }

  /**
   * POST /api/admin/users/{id}/reset-password
   *
   * Resets temporary password for user.
   */
  async resetPassword(id: string | number, password: string): Promise<boolean> {
    await apiService.post(`/admin/users/${id}/reset-password`, {
      temporaryPassword: password,
    });
    return true;
  }

  /**
   * DELETE /api/admin/users/{id}
   */
  async deleteUser(id: string | number): Promise<void> {
    await apiService.delete(`/admin/users/${id}`);
  }

  /**
   * Helper to fetch institutions for picker dropdowns.
   */
  async getInstitutionsForPicker(): Promise<{ id: string; name: string; code: string }[]> {
    try {
      const res = await institutionService.getInstitutions({ page: 1, pageSize: 100 });
      return res.data.map((inst) => ({ id: String(inst.id), name: inst.name, code: inst.code }));
    } catch {
      return [];
    }
  }
}

export const userService = new UserService();

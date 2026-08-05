import { institutionService } from '@/services/institution.service';
import { Institution } from '@/types/institution.types';
import {
  PlatformUser,
  PlatformUserCreateInput,
  PlatformUserListResponse,
  PlatformUserQueryParams,
  PlatformUserStats,
  PlatformUserStatus,
} from '@/types/platform-user.types';

// ---------------------------------------------------------------------------
// Super Admin — Platform User Directory.
// Mock service that derives a deterministic set of users across every
// institution in the platform (reusing the institution service so institution
// names, admins and statuses stay consistent with the Institutions page).
// ---------------------------------------------------------------------------

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Deterministic pseudo-random helper (stable across renders / sessions).
function seeded(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const IQAC_NAMES = [
  'Dr. R. Kumar', 'Dr. Meera Nair', 'Dr. Anil Joshi', 'Dr. Sunita Rao',
  'Dr. Karthik Raja', 'Dr. Divya Menon', 'Dr. Suresh Babu', 'Dr. Priya Iyer',
];

const PRINCIPAL_NAMES = [
  'Dr. S. Ganesh Vaidyanathan', 'Dr. A. K. Sharma', 'Dr. V. Raman',
  'Dr. N. Krishnan', 'Dr. P. Subramanian', 'Dr. R. Deshpande',
];

const HOD_NAMES = [
  'Dr. Rajesh Kumar', 'Dr. Priya Sharma', 'Dr. Venkat Raman',
  'Dr. Lakshmi Devi', 'Dr. Arun Prakash', 'Dr. Karthik Raja',
  'Dr. Meena Kumari', 'Dr. Anitha Kumari', 'Dr. Suresh Babu', 'Dr. Divya Menon',
];

const DEPARTMENTS = ['CSE', 'IT', 'AI&ML', 'AI&DS', 'ECE', 'EEE', 'MECH', 'CIVIL'];

const PLATFORM_ADMINS = [
  { name: 'Platform Administrator', email: 'superadmin@accreditpro.com', mobile: '+91-9000000001', role: 'Super Admin', roleKey: 'SUPER_ADMIN' },
  { name: 'Operations Lead', email: 'ops@accreditpro.com', mobile: '+91-9000000002', role: 'Super Admin', roleKey: 'SUPER_ADMIN' },
  { name: 'Support Admin', email: 'support@accreditpro.com', mobile: '+91-9000000003', role: 'Super Admin', roleKey: 'SUPER_ADMIN' },
];

const slugOf = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 20);

const mobileOf = (seed: number) => {
  const digits = String(Math.floor(seeded(seed) * 900000000) + 100000000);
  return `+91-${digits}`;
};

const lastLoginOf = (seed: number, status: PlatformUserStatus) => {
  if (status === 'pending') return '-';
  const day = 1 + Math.floor(seeded(seed) * 15);
  const hour = String(8 + Math.floor(seeded(seed + 1) * 10)).padStart(2, '0');
  const minute = String(Math.floor(seeded(seed + 2) * 60)).padStart(2, '0');
  return `2026-06-${String(day).padStart(2, '0')} ${hour}:${minute}`;
};

const statusFor = (seed: number): PlatformUserStatus => {
  const roll = seeded(seed);
  if (roll < 0.62) return 'active';
  if (roll < 0.8) return 'pending';
  if (roll < 0.9) return 'inactive';
  return 'blocked';
};

const statusFromInstitution = (status: Institution['status']): PlatformUserStatus => {
  switch (status) {
    case 'active': return 'active';
    case 'pending': return 'pending';
    case 'inactive': return 'inactive';
    case 'suspended': return 'blocked';
  }
};

let cache: PlatformUser[] | null = null;

async function ensureUsers(): Promise<PlatformUser[]> {
  if (cache) return cache;
  const res = await institutionService.getInstitutions({ page: 1, pageSize: 100 });
  const institutions = res.data;

  const users: PlatformUser[] = [];

  // Platform staff
  PLATFORM_ADMINS.forEach((admin, i) => {
    users.push({
      id: `pu-platform-${i + 1}`,
      name: admin.name,
      email: admin.email,
      mobile: admin.mobile,
      role: admin.role,
      roleKey: admin.roleKey,
      institutionId: '',
      institution: 'AccreditPro Platform',
      department: '-',
      status: 'active',
      lastLogin: `2026-06-${String(16 - i).padStart(2, '0')} 09:0${i}`,
      createdAt: '2024-01-01',
    });
  });

  // One directory per institution — Institution Admin + representative roles.
  institutions.forEach((inst, instIdx) => {
    const slug = slugOf(inst.name);
    const base = instIdx * 31 + 7;

    // 1. Institution Admin (from the institution's own record)
    if (inst.admin) {
      users.push({
        id: `pu-${inst.id}-admin`,
        name: inst.admin.name,
        email: inst.admin.email,
        mobile: inst.admin.mobile,
        role: 'Institution Admin',
        roleKey: 'INSTITUTION_ADMIN',
        institutionId: inst.id,
        institution: inst.name,
        department: '-',
        status: statusFromInstitution(inst.status),
        lastLogin: lastLoginOf(base, statusFromInstitution(inst.status)),
        createdAt: inst.createdAt.slice(0, 10),
      });
    }

    // 2. IQAC Coordinator
    const iqacStatus = statusFor(base + 1);
    users.push({
      id: `pu-${inst.id}-iqac`,
      name: IQAC_NAMES[instIdx % IQAC_NAMES.length],
      email: `iqac@${slug}.edu.in`,
      mobile: mobileOf(base + 1),
      role: 'IQAC Coordinator',
      roleKey: 'IQAC_COORDINATOR',
      institutionId: inst.id,
      institution: inst.name,
      department: '-',
      status: iqacStatus,
      lastLogin: lastLoginOf(base + 1, iqacStatus),
      createdAt: inst.createdAt.slice(0, 10),
    });

    // 3. Principal
    const principalStatus = statusFor(base + 2);
    users.push({
      id: `pu-${inst.id}-principal`,
      name: PRINCIPAL_NAMES[instIdx % PRINCIPAL_NAMES.length],
      email: `principal@${slug}.edu.in`,
      mobile: mobileOf(base + 2),
      role: 'Principal',
      roleKey: 'PRINCIPAL',
      institutionId: inst.id,
      institution: inst.name,
      department: '-',
      status: principalStatus,
      lastLogin: lastLoginOf(base + 2, principalStatus),
      createdAt: inst.createdAt.slice(0, 10),
    });

    // 4-5. Department Coordinators (two departments per institution)
    const deptA = DEPARTMENTS[(instIdx * 2) % DEPARTMENTS.length];
    const deptB = DEPARTMENTS[(instIdx * 2 + 3) % DEPARTMENTS.length];
    [deptA, deptB].forEach((dept, i) => {
      const s = statusFor(base + 3 + i);
      users.push({
        id: `pu-${inst.id}-hod-${i + 1}`,
        name: HOD_NAMES[(instIdx * 2 + i) % HOD_NAMES.length],
        email: `hod.${dept.toLowerCase().replace(/&/g, '')}@${slug}.edu.in`,
        mobile: mobileOf(base + 3 + i),
        role: 'Department Coordinator',
        roleKey: 'DEPARTMENT_COORDINATOR',
        institutionId: inst.id,
        institution: inst.name,
        department: dept,
        status: s,
        lastLogin: lastLoginOf(base + 3 + i, s),
        createdAt: inst.createdAt.slice(0, 10),
      });
    });
  });

  cache = users;
  return users;
}

class UserService {
  async getUsers(params: PlatformUserQueryParams): Promise<PlatformUserListResponse> {
    await delay(500);
    const all = await ensureUsers();

    let filtered = [...all];

    // Search
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }

    // Filter by user type (platform staff vs college users)
    if (params.type === 'platform') {
      filtered = filtered.filter((u) => !u.institutionId);
    } else if (params.type === 'college') {
      filtered = filtered.filter((u) => !!u.institutionId);
    }

    // Filter by institution
    if (params.institutionId && params.institutionId !== 'all') {
      filtered = filtered.filter((u) => u.institutionId === params.institutionId);
    }

    // Filter by role
    if (params.role && params.role !== 'all') {
      filtered = filtered.filter((u) => u.roleKey === params.role || u.role === params.role);
    }

    // Filter by status
    if (params.status && params.status !== 'all') {
      filtered = filtered.filter((u) => u.status === params.status);
    }

    // Sorting
    if (params.sortBy) {
      const key = params.sortBy as keyof PlatformUser;
      const dir = params.sortDirection === 'desc' ? -1 : 1;
      filtered.sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return aVal.localeCompare(bVal) * dir;
        }
        return 0;
      });
    }

    // Pagination
    const total = filtered.length;
    const start = (params.page - 1) * params.pageSize;
    const data = filtered.slice(start, start + params.pageSize);

    return {
      data,
      pagination: { page: params.page, pageSize: params.pageSize, total },
    };
  }

  async getUserStats(): Promise<PlatformUserStats> {
    await delay(250);
    const all = await ensureUsers();
    const platform = all.filter((u) => !u.institutionId).length;
    const college = all.filter((u) => !!u.institutionId).length;
    return {
      total: all.length,
      platform,
      college,
      active: all.filter((u) => u.status === 'active').length,
      pending: all.filter((u) => u.status === 'pending').length,
      blocked: all.filter((u) => u.status === 'blocked').length,
      inactive: all.filter((u) => u.status === 'inactive').length,
    };
  }

  async createUser(
    input: PlatformUserCreateInput,
    _credentials?: { username?: string; password?: string }
  ): Promise<PlatformUser> {
    await delay(450);
    const user: PlatformUser = {
      id: `pu-${Date.now()}`,
      name: input.name,
      email: input.email,
      mobile: input.mobile,
      role: input.role,
      roleKey: input.roleKey,
      institutionId: input.institutionId,
      institution: input.institution,
      department: input.department,
      status: 'active',
      lastLogin: '-',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const all = await ensureUsers();
    all.unshift(user);
    return { ...user };
  }

  async updateUserStatus(id: string, status: PlatformUserStatus): Promise<PlatformUser | null> {
    await delay(300);
    const all = await ensureUsers();
    const user = all.find((u) => u.id === id);
    if (!user) return null;
    user.status = status;
    return { ...user };
  }

  /**
   * Issue a temporary password. The password is generated by the UI (single
   * source of truth) and recorded here so the issued value matches what was
   * shown to the user.
   */
  async resetPassword(id: string, password: string): Promise<boolean> {
    await delay(300);
    const all = await ensureUsers();
    if (!all.some((u) => u.id === id)) throw new Error('User not found');
    // In a real backend this would persist the hashed credential — mock only.
    void password;
    return true;
  }

  async getInstitutionsForPicker(): Promise<{ id: string; name: string; code: string }[]> {
    const res = await institutionService.getInstitutions({ page: 1, pageSize: 100 });
    return res.data.map((inst) => ({ id: inst.id, name: inst.name, code: inst.code }));
  }
}

export const userService = new UserService();

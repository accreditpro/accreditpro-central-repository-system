import { User, UserRole } from '@/types/auth.types';
import { Institution } from '@/types/institution.types';

const IMPERSONATION_STORAGE_KEY = 'accreditpro-impersonation';

export interface ImpersonationRecord {
  originalUser: User;
  impersonatedUser: User;
}

/** Human-readable labels used by the impersonation banner. */
const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.INSTITUTION_ADMIN]: 'Institution Admin',
  [UserRole.IQAC_COORDINATOR]: 'IQAC Coordinator',
  [UserRole.PRINCIPAL]: 'Principal',
  [UserRole.DEPARTMENT_COORDINATOR]: 'Department Coordinator',
  [UserRole.INFRASTRUCTURE_COORDINATOR]: 'Infrastructure Coordinator',
  [UserRole.FINANCE_COORDINATOR]: 'Finance Coordinator',
  [UserRole.TPO_COORDINATOR]: 'TPO Coordinator',
  [UserRole.PLACEMENT_OFFICER]: 'Placement Officer',
  [UserRole.STUDENT_DEVELOPMENT_COORDINATOR]: 'Student Development Coordinator',
  [UserRole.EXAMINATION_OFFICER]: 'Examination Officer',
  [UserRole.HEAD_OF_DEPARTMENT]: 'Head of Department',
  [UserRole.HOD]: 'Head of Department',
  [UserRole.RESEARCH_COORDINATOR]: 'Research Coordinator',
  [UserRole.COMPLIANCE_OFFICER]: 'Compliance Officer',
};

export const getRoleLabel = (role?: UserRole): string =>
  role ? ROLE_LABELS[role] || role : 'User';

/**
 * Builds the synthetic IQAC Coordinator user for an institution so a Super Admin
 * can preview it through that college's IQAC lens (read-only). The real admin
 * account is restored on exit.
 */
export const buildImpersonatedIqacUser = (institution: Institution): User => {
  const adminName = institution.admin?.name?.trim();
  const [first = 'IQAC', last = 'Coordinator'] = adminName ? adminName.split(/\s+/) : [];

  return {
    id: `impersonated-${institution.id}-iqac`,
    email: `iqac@${institution.code.toLowerCase()}.edu.in`,
    firstName: first,
    lastName: last,
    role: UserRole.IQAC_COORDINATOR,
    institution: institution.name,
    createdAt: new Date().toISOString(),
  };
};

/**
 * Persists an active impersonation in sessionStorage so a page reload keeps
 * the read-only preview (unlike localStorage, it dies with the tab/session).
 */
export const saveImpersonation = (originalUser: User, impersonatedUser: User): void => {
  try {
    sessionStorage.setItem(IMPERSONATION_STORAGE_KEY, JSON.stringify({ originalUser, impersonatedUser }));
  } catch {
    // Storage unavailable (private mode etc.) — impersonation simply won't survive reloads.
  }
};

export const loadImpersonation = (): ImpersonationRecord | null => {
  try {
    const raw = sessionStorage.getItem(IMPERSONATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ImpersonationRecord;
    if (!parsed?.originalUser?.id || !parsed?.impersonatedUser?.id) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const clearImpersonation = (): void => {
  try {
    sessionStorage.removeItem(IMPERSONATION_STORAGE_KEY);
  } catch {
    // Ignore — nothing to clear.
  }
};

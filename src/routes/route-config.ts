import { UserRole } from '@/types/auth.types';
import { NavItem } from '@/types/navigation.types';

// Navigation for Super Admin (uses /admin prefix)
export const adminNavigationConfig: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: 'LayoutDashboard',
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    title: 'Institutions',
    href: '/admin/institutions',
    icon: 'Building2',
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    title: 'Templates',
    href: '/admin/templates',
    icon: 'FileSpreadsheet',
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: 'BarChart3',
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: 'Users',
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: 'BarChart3',
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: 'Settings',
    roles: [UserRole.SUPER_ADMIN],
  },
];

// Navigation for App users (uses /app prefix)
export const appNavigationConfig: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/app/dashboard',
    icon: 'LayoutDashboard',
    roles: [
      UserRole.INSTITUTION_ADMIN,
      UserRole.IQAC_COORDINATOR,
      UserRole.PRINCIPAL,
    ],
  },
  {
    title: 'Institution Profile',
    href: '/app/institution-profile',
    icon: 'Building2',
    roles: [UserRole.INSTITUTION_ADMIN],
  },
  {
    title: 'Academic Structure',
    href: '/app/academic-structure',
    icon: 'GraduationCap',
    roles: [UserRole.INSTITUTION_ADMIN],
  },
  {
    title: 'User Management',
    href: '/app/users',
    icon: 'Users',
    roles: [UserRole.INSTITUTION_ADMIN],
  },
  {
    title: 'Role Management',
    href: '/app/roles',
    icon: 'Shield',
    roles: [UserRole.INSTITUTION_ADMIN],
  },
  {
    title: 'Repository Monitoring',
    href: '/app/repository-monitoring',
    icon: 'Database',
    roles: [UserRole.INSTITUTION_ADMIN],
  },
  {
    title: 'Readiness Dashboard',
    href: '/app/readiness',
    icon: 'Activity',
    roles: [UserRole.INSTITUTION_ADMIN],
  },
  {
    title: 'Activity Logs',
    href: '/app/activity-logs',
    icon: 'ClipboardList',
    roles: [UserRole.INSTITUTION_ADMIN],
  },
  {
    title: 'Supporting Documents',
    href: '/app/supporting-documents',
    icon: 'FileSpreadsheet',
    roles: [UserRole.INSTITUTION_ADMIN],
  },
  {
    title: 'Department Repository',
    href: '/app/department-repository',
    icon: 'Database',
    roles: [UserRole.DEPARTMENT_COORDINATOR],
  },
  {
    title: 'Documents',
    href: '/app/documents',
    icon: 'FileText',
    roles: [
      UserRole.IQAC_COORDINATOR,
      UserRole.PRINCIPAL,
    ],
  },
  {
    title: 'Accreditation',
    href: '/app/accreditation',
    icon: 'Award',
    roles: [
      UserRole.IQAC_COORDINATOR,
      UserRole.PRINCIPAL,
    ],
  },
  {
    title: 'Reports',
    href: '/app/reports',
    icon: 'BarChart3',
    roles: [
      UserRole.IQAC_COORDINATOR,
      UserRole.PRINCIPAL,
    ],
  },
  {
    title: 'Settings',
    href: '/app/settings',
    icon: 'Settings',
    roles: [UserRole.INSTITUTION_ADMIN],
  },
];

// Combined config for backward compatibility
export const navigationConfig: NavItem[] = [
  ...adminNavigationConfig,
  ...appNavigationConfig,
];

// Helper to get navigation based on user role
export const getNavigationForRole = (role: UserRole): NavItem[] => {
  if (role === UserRole.SUPER_ADMIN) {
    return adminNavigationConfig;
  }
  return appNavigationConfig.filter((item) => item.roles.includes(role));
};
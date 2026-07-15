import { UserRole } from './auth.types';

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  roles: UserRole[];
  children?: NavItem[];
  group?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
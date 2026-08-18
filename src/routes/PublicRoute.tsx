import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth.types';

interface PublicRouteProps {
  children: React.ReactNode;
}

const getRoleBasedRedirect = (role?: UserRole): string => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return '/admin/dashboard';
    case UserRole.DEPARTMENT_COORDINATOR:
      return '/app/department-repository';
    case UserRole.INFRASTRUCTURE_COORDINATOR:
      return '/app/infrastructure-repository';
    case UserRole.FINANCE_COORDINATOR:
      return '/app/finance-repository';
    case UserRole.TPO_COORDINATOR:
      return '/app/tpo-repository';
    case UserRole.STUDENT_DEVELOPMENT_COORDINATOR:
      return '/app/student-development-repository';
    case UserRole.EXAMINATION_OFFICER:
      return '/app/examination-repository';
    case UserRole.HEAD_OF_DEPARTMENT:
      return '/app/hod-dashboard';
    case UserRole.PRINCIPAL:
      return '/app/principal-dashboard';
    case UserRole.IQAC_COORDINATOR:
      return '/app/iqac-dashboard';
    default:
      return '/app/dashboard';
  }
};

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={getRoleBasedRedirect(user?.role)} replace />;
  }

  return <>{children}</>;
};
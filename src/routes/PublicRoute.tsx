import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { RouteLoadingSpinner } from '@/components/shared/RouteLoadingSpinner';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Still loading — don't redirect yet, show a spinner
  if (isLoading) {
    return <RouteLoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
};

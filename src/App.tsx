import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { AppLayout } from '@/layouts/AppLayout';
import { DepartmentCoordinatorLayout } from '@/layouts/DepartmentCoordinatorLayout';
import { InfrastructureCoordinatorLayout } from '@/layouts/InfrastructureCoordinatorLayout';
import { FinanceCoordinatorLayout } from '@/layouts/FinanceCoordinatorLayout';
import { TPOCoordinatorLayout } from '@/layouts/TPOCoordinatorLayout';
import { StudentDevelopmentCoordinatorLayout } from '@/layouts/StudentDevelopmentCoordinatorLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { PublicRoute } from '@/routes/PublicRoute';
import { UserRole } from '@/types/auth.types';
import { Toaster } from '@/components/ui/sonner';

// Pages
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { InstitutionsPage } from '@/pages/admin/institutions/InstitutionsPage';
import { CreateInstitutionPage } from '@/pages/admin/institutions/create/CreateInstitutionPage';
import { TemplatesPage } from '@/pages/admin/templates/TemplatesPage';
import { AnalyticsPage } from '@/pages/admin/analytics/AnalyticsPage';
import { DepartmentPage } from '@/pages/department/DepartmentPage';
import { AcademicRepositoryPage } from '@/pages/academic-repository/AcademicRepositoryPage';
import { DepartmentRepositoryPage } from '@/pages/department-repository/DepartmentRepositoryPage';
import { InfrastructureRepositoryPage } from '@/pages/infrastructure-repository/InfrastructureRepositoryPage';
import FinanceRepositoryPage from '@/pages/finance-repository/FinanceRepositoryPage';
import TPORepositoryPage from '@/pages/tpo-repository/TPORepositoryPage';
import StudentDevelopmentRepositoryPage from '@/pages/student-development-repository/StudentDevelopmentRepositoryPage';

// Institution Admin Pages
import { InstitutionDashboard } from '@/pages/institution-admin/InstitutionDashboard';
import { InstitutionProfilePage } from '@/pages/institution-admin/InstitutionProfilePage';
import { AcademicStructurePage } from '@/pages/institution-admin/AcademicStructurePage';
import { UserManagementPage } from '@/pages/institution-admin/UserManagementPage';
import {
  RoleManagementPage,
  RepositoryMonitoringPage,
  ReadinessDashboardPage,
  ActivityLogsPage,
  SettingsPage,
} from '@/pages/institution-admin/AdminPages';

import Unauthorized from '@/pages/Unauthorized';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Placeholder pages for routes
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
    <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
    <p className="text-muted-foreground">This module is under development.</p>
  </div>
);

const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  const { initialize } = useAuth();
  useTheme();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
      </Route>

      {/* Admin Routes - SUPER_ADMIN only */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="institutions" element={<InstitutionsPage />} />
        <Route path="institutions/create" element={<CreateInstitutionPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="users" element={<PlaceholderPage title="User Management" />} />
        <Route path="settings" element={<PlaceholderPage title="Platform Settings" />} />
        <Route path="reports" element={<PlaceholderPage title="Reports" />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* App Routes - All authenticated users */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<InstitutionDashboard />} />
        <Route path="institution-profile" element={<InstitutionProfilePage />} />
        <Route path="academic-structure" element={<AcademicStructurePage />} />
        <Route path="academic-structure/academic-years" element={<AcademicStructurePage />} />
        <Route path="academic-structure/programs" element={<AcademicStructurePage />} />
        <Route path="academic-structure/departments" element={<AcademicStructurePage />} />
        <Route path="academic-structure/specializations" element={<AcademicStructurePage />} />
        <Route path="academic-structure/regulations" element={<AcademicStructurePage />} />
        <Route path="academic-structure/offerings" element={<AcademicStructurePage />} />
        <Route path="academic-structure/intake" element={<AcademicStructurePage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="roles" element={<RoleManagementPage />} />
        <Route path="repository-monitoring" element={<RepositoryMonitoringPage />} />
        <Route path="readiness" element={<ReadinessDashboardPage />} />
        <Route path="activity-logs" element={<ActivityLogsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="department" element={<DepartmentPage />} />
        <Route path="academic-repository" element={<AcademicRepositoryPage />} />
        <Route path="documents" element={<PlaceholderPage title="Documents" />} />
        <Route path="reports" element={<PlaceholderPage title="Reports" />} />
        <Route
          path="accreditation"
          element={
            <ProtectedRoute
              allowedRoles={[
                UserRole.SUPER_ADMIN,
                UserRole.INSTITUTION_ADMIN,
                UserRole.IQAC_COORDINATOR,
                UserRole.PRINCIPAL,
              ]}
            >
              <PlaceholderPage title="Accreditation" />
            </ProtectedRoute>
          }
        />
        <Route path="profile" element={<PlaceholderPage title="Profile" />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Department Coordinator Routes - No outer sidebar */}
      <Route
        path="/app/department-repository"
        element={
          <ProtectedRoute allowedRoles={[UserRole.DEPARTMENT_COORDINATOR]}>
            <DepartmentCoordinatorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DepartmentRepositoryPage />} />
      </Route>

      {/* Infrastructure Coordinator Routes - No outer sidebar */}
      <Route
        path="/app/infrastructure-repository"
        element={
          <ProtectedRoute allowedRoles={[UserRole.INFRASTRUCTURE_COORDINATOR, UserRole.DEPARTMENT_COORDINATOR]}>
            <InfrastructureCoordinatorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<InfrastructureRepositoryPage />} />
      </Route>

      {/* Finance Coordinator Routes - No outer sidebar */}
      <Route
        path="/app/finance-repository"
        element={
          <ProtectedRoute allowedRoles={[UserRole.FINANCE_COORDINATOR]}>
            <FinanceCoordinatorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<FinanceRepositoryPage />} />
      </Route>

      {/* TPO Coordinator Routes - No outer sidebar */}
      <Route
        path="/app/tpo-repository"
        element={
          <ProtectedRoute allowedRoles={[UserRole.TPO_COORDINATOR]}>
            <TPOCoordinatorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TPORepositoryPage />} />
      </Route>

      {/* Student Development Coordinator Routes - No outer sidebar */}
      <Route
        path="/app/student-development-repository"
        element={
          <ProtectedRoute allowedRoles={[UserRole.STUDENT_DEVELOPMENT_COORDINATOR]}>
            <StudentDevelopmentCoordinatorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDevelopmentRepositoryPage />} />
      </Route>

      {/* Legacy routes - redirect to new structure */}
      <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/documents" element={<Navigate to="/app/documents" replace />} />
      <Route path="/reports" element={<Navigate to="/app/reports" replace />} />
      <Route path="/institutions" element={<Navigate to="/admin/institutions" replace />} />
      <Route path="/departments" element={<Navigate to="/app/academic-structure/departments" replace />} />
      <Route path="/accreditation" element={<Navigate to="/app/accreditation" replace />} />
      <Route path="/users" element={<Navigate to="/app/users" replace />} />
      <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
      <Route path="/profile" element={<Navigate to="/app/profile" replace />} />

      {/* Unauthorized */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppInitializer>
            <AppRoutes />
          </AppInitializer>
        </BrowserRouter>
        <Toaster position="top-right" />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Shield,
  Users,
  Database,
  Activity,
  ClipboardList,
  Settings,
  User,
  Lock,
  Bell,
  Search,
  Filter,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { institutionAdminService } from '@/services/institution-admin.service';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTablePagination } from '@/components/shared/DataTablePagination';
import { PaginationConfig } from '@/types/institution.types';

// ==================== ROLE MANAGEMENT ====================
export const RoleManagementPage = () => {
  const { isAuthenticated } = useAuth();

  const {
    data: roles,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['roles'],
    queryFn: () => institutionAdminService.getRoles(),
    enabled: isAuthenticated,
  });

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-20 mb-3" />
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Skeleton key={j} className="h-6 w-24 rounded-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">View roles, assigned users, and permissions</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Failed to load roles</h2>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
              We couldn't fetch the roles. Please check your connection and try again.
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
        <p className="text-muted-foreground">View roles, assigned users, and permissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(roles ?? []).map((role, idx) => (
          <motion.div
            key={role.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    {role.name}
                  </CardTitle>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {role.usersAssigned}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">Permissions</p>
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.map((perm) => (
                    <Badge key={perm} variant="outline" className="text-xs font-normal">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ==================== REPOSITORY MONITORING ====================
export const RepositoryMonitoringPage = () => {
  const { isAuthenticated } = useAuth();

  const metricsQuery = useQuery({
    queryKey: ['repositoryMetrics'],
    queryFn: () => institutionAdminService.getRepositoryMetrics(),
    enabled: isAuthenticated,
  });

  const readinessQuery = useQuery({
    queryKey: ['departmentReadiness'],
    queryFn: () => institutionAdminService.getDepartmentReadiness(),
    enabled: isAuthenticated,
  });

  const isLoading = metricsQuery.isLoading || readinessQuery.isLoading;
  const error = metricsQuery.error || readinessQuery.error;

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-56 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-36" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-56" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Repository Monitoring</h1>
          <p className="text-muted-foreground">Track institutional repository progress across all departments</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Failed to load repository data</h2>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
              We couldn't fetch the repository metrics. Please check your connection and try again.
            </p>
            <Button variant="outline" onClick={() => { metricsQuery.refetch(); readinessQuery.refetch(); }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metrics = metricsQuery.data ?? [];
  const deptReadiness = readinessQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Repository Monitoring</h1>
        <p className="text-muted-foreground">Track institutional repository progress across all departments</p>
      </div>

      {/* Repository Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((repo, idx) => (
          <motion.div
            key={repo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  {repo.name} Repository
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Data Completeness</span>
                    <span className="font-bold">{repo.dataCompleteness}%</span>
                  </div>
                  <Progress value={repo.dataCompleteness} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Evidence</span>
                    <span className="font-bold">{repo.evidenceCompleteness}%</span>
                  </div>
                  <Progress value={repo.evidenceCompleteness} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Verification</span>
                    <span className="font-bold">{repo.verificationScore}%</span>
                  </div>
                  <Progress value={repo.verificationScore} className="h-2" />
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Readiness</span>
                  <span className={`text-lg font-bold ${repo.readinessScore >= 85 ? 'text-green-600' : repo.readinessScore >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                    {repo.readinessScore}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Department View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Department-wise Repository Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-3 font-medium">Department</th>
                  <th className="text-center py-3 px-3 font-medium">Academic</th>
                  <th className="text-center py-3 px-3 font-medium">Faculty</th>
                  <th className="text-center py-3 px-3 font-medium">Student</th>
                  <th className="text-center py-3 px-3 font-medium">Research</th>
                  <th className="text-center py-3 px-3 font-medium">Evidence</th>
                  <th className="text-center py-3 px-3 font-medium">Overall</th>
                </tr>
              </thead>
              <tbody>
                {deptReadiness.map((dept) => (
                  <tr key={dept.department} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-3 px-3 font-medium">{dept.department}</td>
                    <td className="text-center py-3 px-3">
                      <span className={`text-xs font-medium ${dept.academic >= 90 ? 'text-green-600' : 'text-amber-600'}`}>{dept.academic}%</span>
                    </td>
                    <td className="text-center py-3 px-3">
                      <span className={`text-xs font-medium ${dept.faculty >= 90 ? 'text-green-600' : 'text-amber-600'}`}>{dept.faculty}%</span>
                    </td>
                    <td className="text-center py-3 px-3">
                      <span className={`text-xs font-medium ${dept.student >= 90 ? 'text-green-600' : 'text-amber-600'}`}>{dept.student}%</span>
                    </td>
                    <td className="text-center py-3 px-3">
                      <span className={`text-xs font-medium ${dept.research >= 80 ? 'text-green-600' : 'text-amber-600'}`}>{dept.research}%</span>
                    </td>
                    <td className="text-center py-3 px-3">
                      <span className={`text-xs font-medium ${dept.evidence >= 80 ? 'text-green-600' : 'text-amber-600'}`}>{dept.evidence}%</span>
                    </td>
                    <td className="text-center py-3 px-3">
                      <Badge variant={dept.overall >= 85 ? 'default' : 'secondary'} className="text-xs font-bold">
                        {dept.overall}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ==================== READINESS DASHBOARD ====================
export const ReadinessDashboardPage = () => {
  const { isAuthenticated } = useAuth();

  const strengthsQuery = useQuery({
    queryKey: ['readinessStrengths'],
    queryFn: () => institutionAdminService.getReadinessStrengths(),
    enabled: isAuthenticated,
  });

  const overallQuery = useQuery({
    queryKey: ['readinessOverall'],
    queryFn: () => institutionAdminService.getReadinessOverall(),
    enabled: isAuthenticated,
  });

  const improvementsQuery = useQuery({
    queryKey: ['readinessImprovements'],
    queryFn: () => institutionAdminService.getReadinessImprovements(),
    enabled: isAuthenticated,
  });

  const isLoading = strengthsQuery.isLoading || overallQuery.isLoading || improvementsQuery.isLoading;
  const error = strengthsQuery.error || overallQuery.error || improvementsQuery.error;

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-56 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        {/* Overall score skeleton */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-6 w-48" />
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Readiness cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="text-center">
              <CardContent className="p-6">
                <Skeleton className="h-20 w-20 mx-auto rounded-full mb-3" />
                <Skeleton className="h-4 w-28 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Health metrics skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Skeleton className="h-5 w-20" />
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
              <div className="space-y-3">
                <Skeleton className="h-5 w-28" />
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Readiness Dashboard</h1>
          <p className="text-muted-foreground">Institution health monitoring and accreditation readiness</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Failed to load readiness data</h2>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
              We couldn't fetch the readiness dashboard. Please check your connection and try again.
            </p>
            <Button variant="outline" onClick={() => { strengthsQuery.refetch(); overallQuery.refetch(); improvementsQuery.refetch(); }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overall = overallQuery.data!;
  const strengths = strengthsQuery.data ?? [];
  const improvements = improvementsQuery.data ?? [];

  // Map category labels to consistent colors
  const categoryColors: Record<string, string> = {
    Academic: 'text-blue-600',
    Faculty: 'text-purple-600',
    Student: 'text-green-600',
    Research: 'text-amber-600',
  };

  // Map improvement severity to badge classes
  const severityBadge = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'warning': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Readiness Dashboard</h1>
        <p className="text-muted-foreground">Institution health monitoring and accreditation readiness</p>
      </div>

      {/* Overall Readiness Score */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <svg className="w-32 h-32" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                <circle
                  cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8"
                  className="text-primary"
                  strokeDasharray={`${overall.overallReadiness * 3.14} 314`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{overall.overallReadiness}%</span>
                <span className="text-xs text-muted-foreground">Readiness</span>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="text-lg font-semibold">Institution Readiness Score</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Data Completeness</p>
                  <div className="flex items-center gap-2">
                    <Progress value={overall.dataCompleteness} className="h-2 flex-1" />
                    <span className="text-sm font-bold">{overall.dataCompleteness}%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Evidence Completeness</p>
                  <div className="flex items-center gap-2">
                    <Progress value={overall.evidenceCompleteness} className="h-2 flex-1" />
                    <span className="text-sm font-bold">{overall.evidenceCompleteness}%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Verification Score</p>
                  <div className="flex items-center gap-2">
                    <Progress value={overall.verificationScore} className="h-2 flex-1" />
                    <span className="text-sm font-bold">{overall.verificationScore}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Readiness Cards (from API categoryBreakdown) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overall.categoryBreakdown.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="relative mx-auto w-20 h-20 mb-3">
                  <svg className="w-20 h-20" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
                    <circle
                      cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="6"
                      className={categoryColors[card.label] ?? 'text-primary'}
                      strokeDasharray={`${card.value * 2.01} 201`}
                      strokeLinecap="round"
                      transform="rotate(-90 40 40)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">{card.value}%</span>
                  </div>
                </div>
                <p className="text-sm font-medium">{card.label} Readiness</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Metrics Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Health Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Strengths
              </h4>
              {strengths.length === 0 ? (
                <p className="text-sm text-muted-foreground">No strengths data available.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {strengths.map((item) => (
                    <li key={item.metric} className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                        {item.score}%
                      </Badge>
                      {item.metric}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Areas for Improvement */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Areas for Improvement
              </h4>
              {improvements.length === 0 ? (
                <p className="text-sm text-muted-foreground">No improvements data available.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {improvements.map((item) => (
                    <li key={item.metric} className="flex items-center gap-2">
                      <Badge className={`text-xs ${severityBadge(item.severity)}`}>
                        {item.score}%
                      </Badge>
                      {item.metric}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ==================== ACTIVITY LOGS ====================
export const ActivityLogsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const institutionId = user?.institutionId;

  // Build query params
  const queryParams =
    institutionId !== undefined
      ? { institutionId, page, pageSize }
      : null;

  // Fetch activity logs
  const {
    data: paginatedData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['activityLogs', queryParams],
    queryFn: () => institutionAdminService.getActivityLogs(queryParams!),
    enabled: isAuthenticated && queryParams !== null,
  });

  const allLogs = paginatedData?.data ?? [];

  // Client-side filters (API only supports pagination, not search or module)
  const lowerSearch = search.toLowerCase();
  const filteredLogs = allLogs.filter((log) => {
    const matchesSearch =
      !search ||
      log.userName.toLowerCase().includes(lowerSearch) ||
      log.action.toLowerCase().includes(lowerSearch);
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  // Extract unique modules from the current page's data
  const modules = [...new Set(allLogs.map((l) => l.module))].sort();

  const pagination: PaginationConfig = paginatedData
    ? {
        page: paginatedData.page,
        pageSize: paginatedData.pageSize,
        total: paginatedData.total,
        totalPages: paginatedData.totalPages,
      }
    : { page: 1, pageSize: 20, total: 0, totalPages: 1 };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-[200px]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <th key={i} className="py-3 px-4">
                        <Skeleton className="h-4 w-20" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, rowIdx) => (
                    <tr key={rowIdx} className="border-t">
                      {Array.from({ length: 6 }).map((_, colIdx) => (
                        <td key={colIdx} className="py-3 px-4">
                          <Skeleton className="h-4 w-full max-w-[120px]" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-muted-foreground">Audit trail of all user actions</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Failed to load activity logs</h2>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
              We couldn't fetch the activity logs. Please check your connection and try again.
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground">Audit trail of all user actions</p>
      </div>

      {/* Filters — search (client-side) + module filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user or action..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={moduleFilter}
              onValueChange={(v) => {
                setModuleFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Action</th>
                  <th className="text-left py-3 px-4 font-medium">Module</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-3" />
                        <p className="text-sm text-muted-foreground">No activity logs found</p>
                        {(search || moduleFilter !== 'all') && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Try adjusting your search or filter
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium">{log.userName}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">
                          {log.userRole}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{log.action}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="text-xs">
                          {log.module}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{log.date}</td>
                      <td className="py-3 px-4 text-muted-foreground">{log.time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.total > 0 && (
        <DataTablePagination
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          pageSizeOptions={[10, 20, 30, 50]}
        />
      )}
    </div>
  );
};

// ==================== SETTINGS ====================
export const SettingsPage = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // ── Local form state ──
  const [profileForm, setProfileForm] = useState({ name: '', email: '', mobile: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);

  // ── Fetch profile ──
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['settingsProfile'],
    queryFn: () => institutionAdminService.getSettingsProfile(),
    enabled: isAuthenticated,
  });

  // Sync local form state when profile data loads
  useEffect(() => {
    if (profile) {
      setProfileForm({ name: profile.name, email: profile.email, mobile: profile.mobile });
    }
  }, [profile]);

  // ── Mutations ──

  const updateProfileMutation = useMutation({
    mutationFn: (data: { name: string; email: string; mobile: string }) =>
      institutionAdminService.updateSettingsProfile(data),
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['settingsProfile'] });
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update profile'),
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      institutionAdminService.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to change password'),
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: (data: { emailNotifications: boolean; inAppNotifications: boolean }) =>
      institutionAdminService.updateNotificationSettings(data),
    onSuccess: () => toast.success('Notification preferences updated'),
    onError: (err: Error) => toast.error(err.message || 'Failed to update notifications'),
  });

  // ── Handlers ──

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileForm);
  };

  const handleChangePassword = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Please fill in both password fields');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const handleNotificationChange = (
    type: 'email' | 'inApp',
    value: boolean
  ) => {
    if (type === 'email') {
      setEmailNotifications(value);
      updateNotificationsMutation.mutate({
        emailNotifications: value,
        inAppNotifications,
      });
    } else {
      setInAppNotifications(value);
      updateNotificationsMutation.mutate({
        emailNotifications,
        inAppNotifications: value,
      });
    }
  };

  // ── Loading State ──
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-9 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // ── Error State ──
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Failed to load settings</h2>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
              We couldn&apos;t load your profile. Please check your connection and try again.
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Mobile</Label>
              <Input
                value={profileForm.mobile}
                onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
              />
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleSaveProfile}
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5 text-primary" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
              />
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleChangePassword}
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Email Notifications</p>
              <p className="text-xs text-muted-foreground">
                Receive email alerts for important updates
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={(v) => handleNotificationChange('email', v)}
              disabled={updateNotificationsMutation.isPending}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">In-App Notifications</p>
              <p className="text-xs text-muted-foreground">
                Show notifications within the application
              </p>
            </div>
            <Switch
              checked={inAppNotifications}
              onCheckedChange={(v) => handleNotificationChange('inApp', v)}
              disabled={updateNotificationsMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
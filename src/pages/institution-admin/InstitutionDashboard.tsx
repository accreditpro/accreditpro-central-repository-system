import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Building2,
  GraduationCap,
  Users,
  UserCheck,
  UserX,
  Database,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Activity,
  TrendingUp,
  Upload,
  Shield,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { institutionAdminService, DashboardSummaryData } from '@/services/institution-admin.service';
import { Skeleton } from '@/components/ui/skeleton';

/** ── Helper: convert an ISO timestamp to a short relative time string ── */
function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/** ── Map the API icon string to a known icon type for rendering ── */
function mapIcon(icon: string): 'upload' | 'check' | 'verify' | 'calendar' {
  const lower = icon.toLowerCase();
  if (lower.includes('upload') || lower.includes('create')) return 'upload';
  if (lower.includes('verify') || lower.includes('audit')) return 'verify';
  if (lower.includes('check') || lower.includes('approve')) return 'check';
  if (lower.includes('calendar') || lower.includes('date') || lower.includes('schedule')) return 'calendar';
  return 'upload';
}

// KPI card configuration (values populated from API data inside the component)
const kpiDefinitions = [
  { label: 'Total Departments', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30', key: 'totalDepartments' as const, suffix: '' },
  { label: 'Total Programs', icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30', key: 'totalPrograms' as const, suffix: '' },
  { label: 'Total Users', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30', key: 'totalUsers' as const, suffix: '' },
  { label: 'Active Users', icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30', key: 'activeUsers' as const, suffix: '' },
  { label: 'Blocked Users', icon: UserX, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30', key: 'blockedUsers' as const, suffix: '' },
  { label: 'Repository Completion', icon: Database, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/30', key: 'repositoryCompletion' as const, suffix: '%' },
  { label: 'Pending Reviews', icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30', key: 'pendingReviews' as const, suffix: '' },
  { label: 'Pending Approvals', icon: CheckCircle2, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30', key: 'pendingApprovals' as const, suffix: '' },
  { label: 'Missing Evidence', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/30', key: 'missingEvidence' as const, suffix: '' },
  { label: 'Health Score', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', key: 'repositoryHealthScore' as const, suffix: '%' },
];

export const InstitutionDashboard = () => {
  const { isAuthenticated } = useAuth();

  const {
    data: summary,
    isLoading,
    error,
    refetch,
  } = useQuery<DashboardSummaryData>({
    queryKey: ['dashboardSummary'],
    queryFn: () => institutionAdminService.getDashboardSummary(),
    enabled: isAuthenticated,
  });

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-56 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-44" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="border bg-muted/30">
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-28" />
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="space-y-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-1.5 w-full" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
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
          <h1 className="text-2xl font-bold tracking-tight">Institution Dashboard</h1>
          <p className="text-muted-foreground">Overview of your institution's accreditation readiness</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Failed to load dashboard</h2>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
              We couldn't fetch your dashboard data. Please check your connection and try again.
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

  const { kpis, repositoryOverview, departmentReadiness, recentActivities } = summary!;

  // Build KPI card values from live API data
  const kpiCards = kpiDefinitions.map((def) => ({
    ...def,
    value: def.suffix ? `${kpis[def.key]}${def.suffix}` : kpis[def.key],
  }));

  // Transform recent activities to the UI-friendly format
  const transformedActivities = recentActivities.map((act) => ({
    text: `${act.user} ${act.action}`,
    time: timeAgo(act.timestamp),
    icon: mapIcon(act.icon),
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Institution Dashboard</h1>
        <p className="text-muted-foreground">Overview of your institution's accreditation readiness</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${kpi.bg}`}>
                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
                    <p className="text-lg font-bold">{kpi.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Repository Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Repository Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {repositoryOverview.map((repo) => (
              <Card key={repo.id} className="border bg-muted/30">
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-semibold text-sm">{repo.name} Repository</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-medium">{repo.dataCompleteness}%</span>
                    </div>
                    <Progress value={repo.dataCompleteness} className="h-1.5" />
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Verification</span>
                      <span className="font-medium">{repo.verificationScore}%</span>
                    </div>
                    <Progress value={repo.verificationScore} className="h-1.5" />
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Evidence</span>
                      <span className="font-medium">{repo.evidenceCompleteness}%</span>
                    </div>
                    <Progress value={repo.evidenceCompleteness} className="h-1.5" />
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Readiness</span>
                      <span className="font-bold text-primary">{repo.readinessScore}%</span>
                    </div>
                    <Progress value={repo.readinessScore} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Wise Readiness */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Department Wise Readiness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Department</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Academic</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Faculty</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Students</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Research</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Evidence</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Readiness</th>
                </tr>
              </thead>
              <tbody>
                {departmentReadiness.map((dept) => (
                  <tr key={dept.department} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-2 font-medium">{dept.department}</td>
                    <td className="text-center py-3 px-2">
                      <Badge variant={dept.academic >= 90 ? 'default' : 'secondary'} className="text-xs">
                        {dept.academic}%
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-2">
                      <Badge variant={dept.faculty >= 90 ? 'default' : 'secondary'} className="text-xs">
                        {dept.faculty}%
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-2">
                      <Badge variant={dept.student >= 90 ? 'default' : 'secondary'} className="text-xs">
                        {dept.student}%
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-2">
                      <Badge variant={dept.research >= 80 ? 'default' : 'secondary'} className="text-xs">
                        {dept.research}%
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-2">
                      <Badge variant={dept.evidence >= 80 ? 'default' : 'secondary'} className="text-xs">
                        {dept.evidence}%
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className={`font-bold ${dept.overall >= 85 ? 'text-green-600' : dept.overall >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                        {dept.overall}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transformedActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Activity className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No recent activities</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transformedActivities.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <div className="p-1.5 rounded-full bg-primary/10">
                    {activity.icon === 'upload' && <Upload className="h-3.5 w-3.5 text-primary" />}
                    {activity.icon === 'check' && <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
                    {activity.icon === 'verify' && <Shield className="h-3.5 w-3.5 text-blue-600" />}
                    {activity.icon === 'calendar' && <Calendar className="h-3.5 w-3.5 text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.text}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
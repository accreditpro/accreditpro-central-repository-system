import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { GovernancePage } from './governance/GovernancePage';
import { RoleInfo } from './types';
import { institutionAdminService } from '@/services/institution-admin.service';

export { GovernancePage };

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
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { roles, repositoryMetrics, departmentReadiness, activityLogs } from './mock-data';

// ==================== ROLE MANAGEMENT ====================
export const RoleManagementPage = () => {
  const [rolesList, setRolesList] = useState<RoleInfo[]>(roles);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    institutionAdminService.getRoles()
      .then((res) => {
        const rawList = Array.isArray(res)
          ? res
          : (Array.isArray((res as any)?.data)
              ? (res as any).data
              : []);
        if (Array.isArray(rawList) && rawList.length > 0) {
          setRolesList(
            rawList.map((r: any) => ({
              name: r.name || r.roleDisplayName || r.role || 'Role',
              usersAssigned: r.usersAssigned ?? r.userCount ?? 0,
              permissions: Array.isArray(r.permissions) ? r.permissions : [],
            }))
          );
        }
      })
      .catch(() => {
        // Fallback to local mock data if offline
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
        <p className="text-muted-foreground">View roles, assigned users, and permissions</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Loading roles...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rolesList.map((role, idx) => (
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
                      {role.usersAssigned} {role.usersAssigned === 1 ? 'user' : 'users'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-2">Permissions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions && role.permissions.length > 0 ? (
                      role.permissions.map((perm) => (
                        <Badge key={perm} variant="outline" className="text-xs font-normal">
                          {perm}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No specific permissions listed</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== REPOSITORY MONITORING ====================
export const RepositoryMonitoringPage = () => {
  const [metricsList, setMetricsList] = useState<RepositoryMetric[]>(repositoryMetrics);
  const [deptReadinessList, setDeptReadinessList] = useState<DepartmentReadiness[]>(departmentReadiness);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      institutionAdminService.getRepositoryMetrics()
        .then((res) => {
          const rawList = Array.isArray(res)
            ? res
            : (Array.isArray((res as any)?.data)
                ? (res as any).data
                : []);
          if (Array.isArray(rawList) && rawList.length > 0) {
            setMetricsList(
              rawList.map((m: any) => ({
                name: m.name || m.repositoryName || 'Repository',
                dataCompleteness: m.dataCompleteness ?? m.dataCompletenessPercentage ?? 0,
                evidenceCompleteness: m.evidenceCompleteness ?? m.evidenceCompletenessPercentage ?? 0,
                verificationScore: m.verificationScore ?? m.verificationPercentage ?? 0,
                readinessScore: m.readinessScore ?? m.readinessPercentage ?? 0,
              }))
            );
          }
        }),
      institutionAdminService.getDepartmentReadiness()
        .then((res) => {
          const rawList = Array.isArray(res)
            ? res
            : (Array.isArray((res as any)?.data)
                ? (res as any).data
                : []);
          if (Array.isArray(rawList) && rawList.length > 0) {
            setDeptReadinessList(
              rawList.map((d: any) => ({
                department: d.department || d.departmentCode || d.name || 'Dept',
                academic: d.academic ?? d.academicScore ?? 0,
                faculty: d.faculty ?? d.facultyScore ?? 0,
                student: d.student ?? d.studentScore ?? 0,
                research: d.research ?? d.researchScore ?? 0,
                evidence: d.evidence ?? d.evidenceScore ?? 0,
                overall: d.overall ?? d.overallScore ?? 0,
              }))
            );
          }
        }),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Repository Monitoring</h1>
        <p className="text-muted-foreground">Track institutional repository progress across all departments</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Loading repository metrics...
        </div>
      ) : (
        <>
          {/* Repository Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metricsList.map((repo, idx) => (
              <motion.div
                key={repo.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary" />
                      {repo.name}
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
                    {deptReadinessList.map((dept) => (
                      <tr key={dept.department} className="border-b last:border-0 hover:bg-muted/50">
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
        </>
      )}
    </div>
  );
};

// ==================== READINESS DASHBOARD ====================
export const ReadinessDashboardPage = () => {
  const [overallData, setOverallData] = useState<{
    overallReadiness: number;
    dataCompleteness: number;
    evidenceCompleteness: number;
    verificationScore: number;
    categoryBreakdown: Array<{ label: string; value: number }>;
  }>({
    overallReadiness: 86,
    dataCompleteness: 90,
    evidenceCompleteness: 85,
    verificationScore: 82,
    categoryBreakdown: [
      { label: 'Academic Readiness', value: 90 },
      { label: 'Faculty Readiness', value: 83 },
      { label: 'Student Readiness', value: 92 },
      { label: 'Research Readiness', value: 75 },
    ],
  });

  const [strengthsList, setStrengthsList] = useState<Array<{ score?: number; percentage?: number; label?: string; title?: string; text?: string }>>([
    { percentage: 95, label: 'Student data completeness' },
    { percentage: 92, label: 'Academic repository verification' },
    { percentage: 91, label: 'CSE department readiness' },
  ]);

  const [improvementsList, setImprovementsList] = useState<Array<{ score?: number; percentage?: number; label?: string; title?: string; text?: string }>>([
    { percentage: 72, label: 'Research evidence completeness' },
    { percentage: 75, label: 'CIVIL department overall' },
    { percentage: 23, label: 'Missing evidence documents' },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      institutionAdminService.getReadinessOverall()
        .then((res) => {
          const data = (res as any)?.data || res;
          if (data && typeof data === 'object') {
            setOverallData({
              overallReadiness: data.overallReadiness ?? 0,
              dataCompleteness: data.dataCompleteness ?? 0,
              evidenceCompleteness: data.evidenceCompleteness ?? 0,
              verificationScore: data.verificationScore ?? 0,
              categoryBreakdown: Array.isArray(data.categoryBreakdown) && data.categoryBreakdown.length > 0
                ? data.categoryBreakdown
                : [
                    { label: 'Academic Readiness', value: data.academicReadiness ?? 0 },
                    { label: 'Faculty Readiness', value: data.facultyReadiness ?? 0 },
                    { label: 'Student Readiness', value: data.studentReadiness ?? 0 },
                    { label: 'Research Readiness', value: data.researchReadiness ?? 0 },
                  ],
            });
          }
        }),
      institutionAdminService.getReadinessStrengths()
        .then((res) => {
          const raw = Array.isArray(res)
            ? res
            : (Array.isArray((res as any)?.data)
                ? (res as any).data
                : []);
          if (Array.isArray(raw) && raw.length > 0) {
            setStrengthsList(raw);
          }
        }),
      institutionAdminService.getReadinessImprovements()
        .then((res) => {
          const raw = Array.isArray(res)
            ? res
            : (Array.isArray((res as any)?.data)
                ? (res as any).data
                : []);
          if (Array.isArray(raw) && raw.length > 0) {
            setImprovementsList(raw);
          }
        }),
    ]).finally(() => setLoading(false));
  }, []);

  const getCardColor = (label: string, index: number) => {
    const l = (label || '').toLowerCase();
    if (l.includes('academic')) return 'text-blue-600';
    if (l.includes('faculty')) return 'text-purple-600';
    if (l.includes('student')) return 'text-green-600';
    if (l.includes('research')) return 'text-amber-600';
    const fallbackColors = ['text-blue-600', 'text-purple-600', 'text-green-600', 'text-amber-600'];
    return fallbackColors[index % fallbackColors.length];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Readiness Dashboard</h1>
        <p className="text-muted-foreground">Institution health monitoring and accreditation readiness</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Loading readiness metrics...
        </div>
      ) : (
        <>
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
                      strokeDasharray={`${overallData.overallReadiness * 3.14} 314`}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{overallData.overallReadiness}%</span>
                    <span className="text-xs text-muted-foreground">Readiness</span>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <h3 className="text-lg font-semibold">Institution Readiness Score</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Data Completeness</p>
                      <div className="flex items-center gap-2">
                        <Progress value={overallData.dataCompleteness} className="h-2 flex-1" />
                        <span className="text-sm font-bold">{overallData.dataCompleteness}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Evidence Completeness</p>
                      <div className="flex items-center gap-2">
                        <Progress value={overallData.evidenceCompleteness} className="h-2 flex-1" />
                        <span className="text-sm font-bold">{overallData.evidenceCompleteness}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Verification Score</p>
                      <div className="flex items-center gap-2">
                        <Progress value={overallData.verificationScore} className="h-2 flex-1" />
                        <span className="text-sm font-bold">{overallData.verificationScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Readiness Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {overallData.categoryBreakdown.map((card, idx) => (
              <motion.div
                key={card.label || idx}
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
                          className={getCardColor(card.label, idx)}
                          strokeDasharray={`${card.value * 2.01} 201`}
                          strokeLinecap="round"
                          transform="rotate(-90 40 40)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold">{card.value}%</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium">{card.label}</p>
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
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Strengths
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {strengthsList.map((item, idx) => {
                      const score = item.percentage ?? item.score ?? 0;
                      const text = item.label ?? item.title ?? item.text ?? '';
                      return (
                        <li key={idx} className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                            {score}%
                          </Badge>
                          {text}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {improvementsList.map((item, idx) => {
                      const score = item.percentage ?? item.score ?? 0;
                      const text = item.label ?? item.title ?? item.text ?? '';
                      return (
                        <li key={idx} className="flex items-center gap-2">
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs">
                            {score}%
                          </Badge>
                          {text}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

// ==================== ACTIVITY LOGS ====================
export const ActivityLogsPage = () => {
  const [logsList, setLogsList] = useState<ActivityLog[]>(activityLogs);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await institutionAdminService.getAppActivityLogs({
        page: 1,
        pageSize: 100,
        search: search.trim() ? search.trim() : undefined,
        module: moduleFilter !== 'all' ? moduleFilter : undefined,
      });

      const rawList = Array.isArray(res)
        ? res
        : (Array.isArray((res as any)?.content)
            ? (res as any).content
            : (Array.isArray((res as any)?.data)
                ? (res as any).data
                : (Array.isArray((res as any)?.data?.content)
                    ? (res as any).data.content
                    : [])));

      if (Array.isArray(rawList) && rawList.length > 0) {
        setLogsList(
          rawList.map((log: any, idx: number) => ({
            id: String(log.id || idx + 1),
            user: log.userName || log.user || log.name || 'User',
            role: log.userRole || log.role || 'Role',
            action: log.action || 'Performed action',
            module: log.module || 'Repository',
            date: log.date ? (log.date.includes('T') ? log.date.split('T')[0] : log.date) : (log.createdAt ? log.createdAt.split('T')[0] : '-'),
            time: log.time || (log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'),
          }))
        );
      }
    } catch {
      // Fallback to local filtering if offline
    } finally {
      setLoading(false);
    }
  }, [search, moduleFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filtered = logsList.filter((log) => {
    const matchesSearch = log.user.toLowerCase().includes(search.toLowerCase()) || log.action.toLowerCase().includes(search.toLowerCase());
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const modules = Array.from(new Set([...activityLogs.map((l) => l.module), ...logsList.map((l) => l.module)]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground">Audit trail of all user actions</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by user or action..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Module" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

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
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                      Loading activity logs...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-3" />
                        <p className="text-sm text-muted-foreground">No activity logs found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => (
                    <tr key={log.id} className="border-t hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{log.user}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">{log.role}</Badge>
                      </td>
                      <td className="py-3 px-4">{log.action}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="text-xs">{log.module}</Badge>
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
    </div>
  );
};

// ==================== SETTINGS ====================
export const SettingsPage = () => {
  const [profile, setProfile] = useState({
    name: 'Dr. S. Ganesh Vaidyanathan',
    email: 'principal@svce.ac.in',
    mobile: '+91-9876543210',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);

  useEffect(() => {
    institutionAdminService.getSettingsProfile()
      .then((res: any) => {
        const data = res?.data || res;
        if (data && typeof data === 'object') {
          setProfile({
            name: data.name || data.firstName || 'Dr. S. Ganesh Vaidyanathan',
            email: data.email || 'principal@svce.ac.in',
            mobile: data.mobile || data.phoneNumber || '+91-9876543210',
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await institutionAdminService.updateSettingsProfile({
        name: profile.name,
        email: profile.email,
        mobile: profile.mobile,
      });
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword) {
      toast.error('Please enter current password');
      return;
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      await institutionAdminService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleNotificationChange = async (type: 'email' | 'inApp', value: boolean) => {
    if (type === 'email') setEmailNotifications(value);
    if (type === 'inApp') setInAppNotifications(value);
    try {
      await institutionAdminService.updateNotificationSettings({
        emailNotifications: type === 'email' ? value : emailNotifications,
        inAppNotifications: type === 'inApp' ? value : inAppNotifications,
      });
      toast.success('Notification preferences updated');
    } catch {
      // Preferences saved locally
    }
  };

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
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Mobile</Label>
              <Input
                value={profile.mobile}
                onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
              />
            </div>
          </div>
          <Button size="sm" onClick={handleSaveProfile} disabled={savingProfile}>
            {savingProfile ? 'Saving...' : 'Save Changes'}
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
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                  aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <Button size="sm" onClick={handleChangePassword} disabled={changingPassword}>
            {changingPassword ? 'Updating...' : 'Update Password'}
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
              <p className="text-xs text-muted-foreground">Receive email alerts for important updates</p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={(val) => handleNotificationChange('email', val)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">In-App Notifications</p>
              <p className="text-xs text-muted-foreground">Show notifications within the application</p>
            </div>
            <Switch
              checked={inAppNotifications}
              onCheckedChange={(val) => handleNotificationChange('inApp', val)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
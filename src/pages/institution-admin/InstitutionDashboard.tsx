import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  dashboardKPIs,
  repositoryMetrics,
  departmentReadiness,
  recentActivities,
} from './mock-data';

const kpiCards = [
  { label: 'Total Departments', value: dashboardKPIs.totalDepartments, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  { label: 'Total Programs', value: dashboardKPIs.totalPrograms, icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  { label: 'Total Users', value: dashboardKPIs.totalUsers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
  { label: 'Active Users', value: dashboardKPIs.activeUsers, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
  { label: 'Blocked Users', value: dashboardKPIs.blockedUsers, icon: UserX, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30' },
  { label: 'Repository Completion', value: `${dashboardKPIs.repositoryCompletion}%`, icon: Database, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/30' },
  { label: 'Pending Reviews', value: dashboardKPIs.pendingReviews, icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { label: 'Pending Approvals', value: dashboardKPIs.pendingApprovals, icon: CheckCircle2, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  { label: 'Missing Evidence', value: dashboardKPIs.missingEvidence, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/30' },
  { label: 'Health Score', value: `${dashboardKPIs.repositoryHealthScore}%`, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
];

export const InstitutionDashboard = () => {
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
            {repositoryMetrics.map((repo) => (
              <Card key={repo.name} className="border bg-muted/30">
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-semibold text-sm">{repo.name}</h4>
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
          <div className="space-y-3">
            {recentActivities.map((activity, idx) => (
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
        </CardContent>
      </Card>
    </div>
  );
};
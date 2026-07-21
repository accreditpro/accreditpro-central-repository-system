import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { dashboardService } from '@/services/dashboard.service';
import { RepositoryModule } from '../types';
import type { DashboardData, DashboardKpi } from '@/types/dashboard.types';
import {
  GraduationCap,
  Users,
  BookOpen,
  FlaskConical,
  FileText,
  Clock,
  Shield,
  Target,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  Upload,
  Building2,
  Calendar,
  User,
  AlertCircle,
  RefreshCw,
  Users2,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  Users,
  BookOpen,
  FlaskConical,
  FileText,
  Clock,
  Shield,
  Target,
  Users2,
  Building2,
};

interface RepositoryDashboardProps {
  onNavigate: (module: RepositoryModule) => void;
  academicYear: string;
  departmentId: number;
}

const getIcon = (iconName?: string) => {
  if (!iconName) return FileText;
  return iconMap[iconName] || FileText;
};

export const RepositoryDashboard = ({ onNavigate, academicYear, departmentId }: RepositoryDashboardProps) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dashboardService.getDashboard({
        academicYear,
        departmentId,
      });
      if (result !== null) {
        setData(result);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [academicYear, departmentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Loading State ──

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-4">
                <Skeleton className="h-3 w-24 mb-3" />
                <Skeleton className="h-7 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-border/50">
          <CardHeader>
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3 w-64 mt-1" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 rounded-xl border border-border/50">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-2 w-full mb-1" />
                  <Skeleton className="h-2 w-full mb-1" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Error State ──

  if (error) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl font-bold tracking-tight">Department Repository Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Academic Year: {academicYear}
          </p>
        </motion.div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load dashboard</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={fetchData}>
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) return null;

  const allKpis: DashboardKpi[] = [
    ...data.repositoryKpis,
    ...data.pendingKpis,
    data.overallReadinessKpi,
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold tracking-tight">Department Repository Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of repository data, evidence, and verification status
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {allKpis.map((kpi, index) => {
          const Icon = getIcon(kpi.icon);
          return (
            <motion.div
              key={`${kpi.label}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
            >
              <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:border-primary/20 cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        {kpi.label}
                      </p>
                      <p className="text-xl font-bold tracking-tight">
                        {kpi.value}{kpi.suffix || ''}
                      </p>
                      <div className="flex items-center gap-1">
                        {kpi.trendPositive ? (
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <span className={cn('text-[10px] font-medium', kpi.trendPositive ? 'text-emerald-500' : 'text-red-500')}>
                          {kpi.trendPositive ? '+' : ''}{kpi.trend}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{kpi.trendLabel}</span>
                      </div>
                    </div>
                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', kpi.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Department Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Department Information</CardTitle>
            <CardDescription>Your assigned department and academic context</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Department</p>
                  <p className="text-xs font-semibold">{data.departmentInfo.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Program Offerings</p>
                  <p className="text-xs font-semibold">{data.departmentInfo.programOfferingsCount} programs</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Specializations</p>
                  <p className="text-xs font-semibold">{data.departmentInfo.specializations.join(', ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Coordinator</p>
                  <p className="text-xs font-semibold">{data.departmentInfo.coordinator}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-4 w-4 text-cyan-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Academic Year</p>
                  <p className="text-xs font-semibold">{data.departmentInfo.academicYear}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Repository Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Repository Health</CardTitle>
                <CardDescription>Data completeness and verification status across all repositories</CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary font-semibold">
                Overall Readiness: {data.repositoryHealth.overallReadiness}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {data.repositoryHealth.repositories.map((repo) => {
                const Icon = getIcon(repo.icon);
                return (
                  <div
                    key={repo.repositoryType}
                    className="p-4 rounded-xl border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => onNavigate(repo.repositoryType as RepositoryModule)}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', repo.color.replace('text-', 'bg-').replace('600', '500/10'))}>
                        <Icon className={cn('h-4 w-4', repo.color)} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{repo.label}</p>
                        <p className="text-[10px] text-muted-foreground">Readiness: {repo.readiness}%</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: 'Data Completeness', value: repo.dataCompleteness },
                        { label: 'Evidence', value: repo.evidenceCompleteness },
                        { label: 'Verification', value: repo.verificationPercent },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground w-24">{item.label}</span>
                          <Progress value={item.value} className="h-1.5 flex-1" />
                          <span className="text-[10px] font-medium w-8 text-right">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions & Recent Uploads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Repository Workspaces */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
        >
          <Card className="border-border/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Repository Workspaces</CardTitle>
              <CardDescription>Navigate to repository modules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.repositoryWorkspaces.map((workspace) => {
                const Icon = getIcon(workspace.icon);
                return (
                  <Button
                    key={workspace.repositoryType}
                    variant="ghost"
                    className="w-full justify-between h-12 px-3 hover:bg-muted/50"
                    onClick={() => onNavigate(workspace.repositoryType as RepositoryModule)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', workspace.color.replace('text-', 'bg-').replace('600', '500/10'))}>
                        <Icon className={cn('h-4 w-4', workspace.color)} />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-medium block">{workspace.label}</span>
                        <span className="text-[10px] text-muted-foreground">{workspace.description.slice(0, 50)}...</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Uploads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="border-border/50 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Recent Uploads</CardTitle>
                  <CardDescription>Latest CSV uploads across all repositories</CardDescription>
                </div>
                <Badge variant="secondary" className="text-[10px]">{data.recentUploads.totalCount} total</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.recentUploads.uploads.map((upload) => (
                  <div
                    key={upload.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                      <Upload className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{upload.fileName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">{upload.repository}</Badge>
                        <span className="text-[11px] text-muted-foreground">{upload.recordsCount} records</span>
                        <span className="text-[11px] text-muted-foreground">•</span>
                        <span className="text-[11px] text-muted-foreground">{upload.uploadedDate}</span>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-[10px] shrink-0',
                        upload.status === 'approved' && 'bg-emerald-500/10 text-emerald-600',
                        upload.status === 'pending' && 'bg-amber-500/10 text-amber-600',
                        upload.status === 'rejected' && 'bg-red-500/10 text-red-600',
                      )}
                    >
                      {upload.status === 'approved' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {upload.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {upload.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Readiness Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.45 }}
      >
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Readiness Analytics</CardTitle>
            <CardDescription>
              Formula: {data.readinessAnalytics.formula}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {data.readinessAnalytics.analytics.map((item) => (
                <div key={item.repositoryType} className="p-4 rounded-xl border border-border/50 text-center">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    {item.label} Readiness
                  </p>
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-16 h-16 -rotate-90">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
                      <circle
                        cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
                        strokeDasharray={`${(item.readiness / 100) * 176} 176`}
                        className={item.color}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-sm font-bold">{item.readiness}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
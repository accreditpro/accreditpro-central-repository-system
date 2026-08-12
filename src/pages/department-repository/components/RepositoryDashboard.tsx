import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { allRepositoryConfigs } from '../repository-configs';
import { RepositoryModule } from '../types';
import { PendingIQACObservations } from './PendingIQACObservations';
import { dashboardService } from '@/services/dashboard.service';
import type { DashboardData } from '@/types/dashboard.types';
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
};

interface RepositoryDashboardProps {
  onNavigate: (module: RepositoryModule) => void;
  academicYear?: string;
  departmentId?: number;
}

export const RepositoryDashboard = ({ onNavigate, academicYear, departmentId = 1 }: RepositoryDashboardProps) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const data = await dashboardService.getDashboard({
          academicYear: academicYear || '2025-26',
          departmentId,
        });
        if (isMounted && data) {
          setDashboardData(data);
        }
      } catch (err) {
        console.warn('Live dashboard fetch error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, [academicYear, departmentId]);

  // Merge live KPIs
  const displayKPIs = useMemo(() => {
    if (!dashboardData) return [];

    const list: Array<{
      id: string;
      label: string;
      value: number | string;
      suffix?: string;
      trend: number;
      trendLabel: string;
      icon: string;
      color: string;
    }> = [];

    if (dashboardData.repositoryKpis && dashboardData.repositoryKpis.length > 0) {
      dashboardData.repositoryKpis.forEach((kpi, idx) => {
        list.push({
          id: `repo-${idx}`,
          label: kpi.label,
          value: kpi.value,
          suffix: kpi.suffix ?? '%',
          trend: kpi.trend ?? 0,
          trendLabel: kpi.trendLabel || 'vs last month',
          icon: kpi.icon || 'FileText',
          color: kpi.color || 'bg-blue-500/10 text-blue-600',
        });
      });
    }

    if (dashboardData.pendingKpis && dashboardData.pendingKpis.length > 0) {
      dashboardData.pendingKpis.forEach((kpi, idx) => {
        list.push({
          id: `pending-${idx}`,
          label: kpi.label,
          value: kpi.value,
          suffix: kpi.suffix || '',
          trend: kpi.trend ?? 0,
          trendLabel: kpi.trendLabel || 'vs last week',
          icon: kpi.icon || 'Clock',
          color: kpi.color || 'bg-amber-500/10 text-amber-600',
        });
      });
    }

    if (dashboardData.overallReadinessKpi) {
      const kpi = dashboardData.overallReadinessKpi;
      list.push({
        id: 'readiness-score',
        label: kpi.label || 'Readiness Score',
        value: kpi.value,
        suffix: kpi.suffix ?? '%',
        trend: kpi.trend ?? 0,
        trendLabel: kpi.trendLabel || 'improvement',
        icon: kpi.icon || 'Target',
        color: kpi.color || 'bg-emerald-500/10 text-emerald-600',
      });
    }

    return list;
  }, [dashboardData]);

  // Department Information
  const displayDeptInfo = useMemo(() => {
    if (dashboardData?.departmentInfo) {
      const d = dashboardData.departmentInfo;
      return {
        department: d.code ? `${d.name} (${d.code})` : d.name || '—',
        programCount: d.programOfferingsCount ?? 0,
        specializations:
          d.specializations && d.specializations.length > 0 ? d.specializations.join(', ') : '—',
        coordinatorName: d.coordinator || '—',
        academicYear: d.academicYear || academicYear || '—',
      };
    }
    return {
      department: '—',
      programCount: 0,
      specializations: '—',
      coordinatorName: '—',
      academicYear: academicYear || '—',
    };
  }, [dashboardData, academicYear]);

  // Repository Health Mapping
  const displayHealth = useMemo(() => {
    if (dashboardData?.repositoryHealth?.repositories && dashboardData.repositoryHealth.repositories.length > 0) {
      const map: Record<string, {
        dataCompleteness: number;
        evidenceCompleteness: number;
        verificationPercent: number;
        readinessScore: number;
      }> = {};
      dashboardData.repositoryHealth.repositories.forEach((repo) => {
        const key =
          repo.repositoryType ||
          repo.label.toLowerCase().replace(/ repository/g, '').replace(/\s+/g, '-');
        map[key] = {
          dataCompleteness: repo.dataCompleteness ?? 0,
          evidenceCompleteness: repo.evidenceCompleteness ?? 0,
          verificationPercent: repo.verificationPercent ?? 0,
          readinessScore: repo.readiness ?? 0,
        };
      });
      return map;
    }
    return {};
  }, [dashboardData]);

  const overallReadiness = useMemo(() => {
    if (dashboardData?.repositoryHealth?.overallReadiness !== undefined) {
      return Math.round(dashboardData.repositoryHealth.overallReadiness);
    }
    const scores = Object.values(displayHealth).map(m => m.readinessScore);
    if (scores.length > 0) {
      return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }
    return 0;
  }, [dashboardData, displayHealth]);

  // Recent Uploads Mapping
  const displayUploads = useMemo(() => {
    if (dashboardData?.recentUploads?.uploads && dashboardData.recentUploads.uploads.length > 0) {
      return dashboardData.recentUploads.uploads.map((u) => ({
        id: String(u.id),
        fileName: u.fileName,
        repository: u.repository,
        recordsCount: u.recordsCount,
        uploadedAt: u.uploadedDate,
        status: u.status,
      }));
    }
    return [];
  }, [dashboardData]);

  const totalUploadsCount = useMemo(() => {
    return dashboardData?.recentUploads?.totalCount ?? displayUploads.length;
  }, [dashboardData, displayUploads]);

  // Render Skeleton when loading and no data yet
  if (loading && !dashboardData) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-xl font-bold tracking-tight">Department Repository Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of repository data, evidence, and verification status
          </p>
        </div>

        {/* KPI Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-7 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-9 w-9 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dept Info Skeleton */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3.5 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-2.5 w-16" />
                    <Skeleton className="h-3.5 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Health Skeleton */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3.5 w-72" />
              </div>
              <Skeleton className="h-6 w-32 rounded-md" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-border/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-2.5 w-16" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      {displayKPIs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {displayKPIs.map((kpi, index) => {
            const Icon = iconMap[kpi.icon] || FileText;
            const isPositive = kpi.trend >= 0;
            return (
              <motion.div
                key={kpi.id}
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
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                          <span className={cn('text-[10px] font-medium', isPositive ? 'text-emerald-500' : 'text-red-500')}>
                            {isPositive ? '+' : ''}{kpi.trend}
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
      )}

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
                  <p className="text-xs font-semibold">{displayDeptInfo.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Program Offerings</p>
                  <p className="text-xs font-semibold">{displayDeptInfo.programCount} programs</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Specializations</p>
                  <p className="text-xs font-semibold">{displayDeptInfo.specializations}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Coordinator</p>
                  <p className="text-xs font-semibold">{displayDeptInfo.coordinatorName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-4 w-4 text-cyan-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Academic Year</p>
                  <p className="text-xs font-semibold">{displayDeptInfo.academicYear}</p>
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
                Overall Readiness: {overallReadiness}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {allRepositoryConfigs.map((config) => {
                const metrics = displayHealth[config.id] || {
                  dataCompleteness: 0,
                  evidenceCompleteness: 0,
                  verificationPercent: 0,
                  readinessScore: 0,
                };
                const Icon = iconMap[config.icon] || FileText;
                return (
                  <div
                    key={config.id}
                    className="p-4 rounded-xl border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => onNavigate(config.id as RepositoryModule)}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', config.color.replace('text-', 'bg-').replace('600', '500/10'))}>
                        <Icon className={cn('h-4 w-4', config.color)} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{config.label.replace(' Repository', '')}</p>
                        <p className="text-[10px] text-muted-foreground">Readiness: {metrics.readinessScore}%</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: 'Data Completeness', value: metrics.dataCompleteness },
                        { label: 'Evidence', value: metrics.evidenceCompleteness },
                        { label: 'Verification', value: metrics.verificationPercent },
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
        {/* Quick Actions */}
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
              {allRepositoryConfigs.map((config) => {
                const Icon = iconMap[config.icon] || FileText;
                return (
                  <Button
                    key={config.id}
                    variant="ghost"
                    className="w-full justify-between h-12 px-3 hover:bg-muted/50"
                    onClick={() => onNavigate(config.id as RepositoryModule)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', config.color.replace('text-', 'bg-').replace('600', '500/10'))}>
                        <Icon className={cn('h-4 w-4', config.color)} />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-medium block">{config.label}</span>
                        <span className="text-[10px] text-muted-foreground">{config.description.slice(0, 50)}...</span>
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
                <Badge variant="secondary" className="text-[10px]">{totalUploadsCount} total</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {displayUploads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-xs font-medium text-muted-foreground">No recent uploads for this academic year</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {displayUploads.slice(0, 5).map((upload) => (
                    <div
                      key={upload.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
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
                          <span className="text-[11px] text-muted-foreground">{upload.uploadedAt ? upload.uploadedAt.split(' ')[0] : '—'}</span>
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
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* My Pending IQAC Observations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.42 }}
      >
        <PendingIQACObservations />
      </motion.div>

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
              Formula: Readiness = Data Completeness × Evidence Completeness × Verification Score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {allRepositoryConfigs.map((config) => {
                const metrics = displayHealth[config.id] || { readinessScore: 0 };
                return (
                  <div key={config.id} className="p-4 rounded-xl border border-border/50 text-center">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      {config.label.replace(' Repository', '')} Readiness
                    </p>
                    <div className="relative inline-flex items-center justify-center">
                      <svg className="w-16 h-16 -rotate-90">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
                        <circle
                          cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
                          strokeDasharray={`${(metrics.readinessScore / 100) * 176} 176`}
                          className={config.color}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-sm font-bold">{metrics.readinessScore}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
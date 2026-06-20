import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { dashboardKPIs, repositoryHealth, uploadHistory, allRepositoryConfigs, departmentInfo } from '../repository-configs';
import { RepositoryModule } from '../types';
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
}

export const RepositoryDashboard = ({ onNavigate }: RepositoryDashboardProps) => {
  const overallReadiness = Math.round(
    Object.values(repositoryHealth).reduce((sum, m) => sum + m.readinessScore, 0) /
    Object.values(repositoryHealth).length
  );

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
        {dashboardKPIs.map((kpi, index) => {
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
                  <p className="text-xs font-semibold">{departmentInfo.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Program Offerings</p>
                  <p className="text-xs font-semibold">{departmentInfo.programOfferings.length} programs</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Specializations</p>
                  <p className="text-xs font-semibold">{departmentInfo.specializations.join(', ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Coordinator</p>
                  <p className="text-xs font-semibold">{departmentInfo.coordinatorName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-4 w-4 text-cyan-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Academic Year</p>
                  <p className="text-xs font-semibold">{departmentInfo.academicYear}</p>
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
                const metrics = repositoryHealth[config.id];
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
                <Badge variant="secondary" className="text-[10px]">{uploadHistory.length} total</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {uploadHistory.slice(0, 5).map((upload) => (
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
                        <span className="text-[11px] text-muted-foreground">{upload.uploadedAt.split(' ')[0]}</span>
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
              Formula: Readiness = Data Completeness × Evidence Completeness × Verification Score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(repositoryHealth).map(([key, metrics]) => {
                const config = allRepositoryConfigs.find(c => c.id === key);
                if (!config) return null;
                return (
                  <div key={key} className="p-4 rounded-xl border border-border/50 text-center">
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
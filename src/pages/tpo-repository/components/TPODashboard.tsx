import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Briefcase,
  UserCheck,
  BookOpen,
  Rocket,
  Presentation,
  TrendingUp,
  Wallet,
  BarChart3,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { tpoRepositoryService, TpoDashboardData } from '@/services/tpo.service';

interface DashboardProps {
  departmentId: number;
  academicYear: string;
}

const iconByKey: Record<string, React.ReactNode> = {
  activeRecruiters: <Building2 className="h-5 w-5" />,
  placementOffers: <Briefcase className="h-5 w-5" />,
  internships: <UserCheck className="h-5 w-5" />,
  higherEducation: <BookOpen className="h-5 w-5" />,
  startupsIncubated: <Rocket className="h-5 w-5" />,
  trainingPrograms: <Presentation className="h-5 w-5" />,
  placementRate: <TrendingUp className="h-5 w-5" />,
  averagePackage: <Wallet className="h-5 w-5" />,
};

const colorByKey: Record<string, string> = {
  activeRecruiters: 'bg-blue-500/10 text-blue-600',
  placementOffers: 'bg-emerald-500/10 text-emerald-600',
  internships: 'bg-cyan-500/10 text-cyan-600',
  higherEducation: 'bg-purple-500/10 text-purple-600',
  startupsIncubated: 'bg-orange-500/10 text-orange-600',
  trainingPrograms: 'bg-rose-500/10 text-rose-600',
  placementRate: 'bg-green-500/10 text-green-600',
  averagePackage: 'bg-indigo-500/10 text-indigo-600',
};

function formatValue(value: number | string): string {
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return String(value);
    return value.toLocaleString('en-IN', { maximumFractionDigits: 1 });
  }
  return value;
}

export function TPODashboard({ departmentId, academicYear }: DashboardProps) {
  const [dashboard, setDashboard] = useState<TpoDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    tpoRepositoryService
      .getDashboard(departmentId, academicYear)
      .then((data) => {
        if (!cancelled) setDashboard(data);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load placement dashboard. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [departmentId, academicYear]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading placement dashboard...
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
        {error || 'Dashboard unavailable'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Placement Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            {dashboard.department} · Academic Year {dashboard.academicYear}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboard.kpis.map((kpi) => (
          <Card key={kpi.key}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${colorByKey[kpi.key] || 'bg-slate-500/10 text-slate-600'}`}>
                  {iconByKey[kpi.key] || <BarChart3 className="h-5 w-5" />}
                </div>
                <Badge
                  variant="secondary"
                  className={
                    kpi.changeType === 'positive'
                      ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400'
                      : 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400'
                  }
                >
                  {kpi.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold mt-4">{formatValue(kpi.value)}</p>
              <p className="text-sm text-muted-foreground mt-1">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Indicators */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Placement Health Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard.healthIndicators.map((indicator) => (
              <div key={indicator.key}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">{indicator.label}</span>
                  <span className="font-medium">{indicator.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, indicator.value))}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard.recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {dashboard.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-primary/10 text-primary">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.details}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(activity.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Shield,
  Trophy,
  Music,
  HandHeart,
  Users,
  Layers,
  Award,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  FileText,
  Paperclip,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { sdcRepositoryService, SdcDashboardData } from '@/services/sdc.service';

interface DashboardProps {
  departmentId: number;
  academicYear: string;
}

const iconByKey: Record<string, React.ReactNode> = {
  nss: <Heart className="h-5 w-5" />,
  ncc: <Shield className="h-5 w-5" />,
  sportsActivities: <Trophy className="h-5 w-5" />,
  culturalActivities: <Music className="h-5 w-5" />,
  extensionActivities: <HandHeart className="h-5 w-5" />,
  totalRecords: <FileText className="h-5 w-5" />,
  withEvidence: <Paperclip className="h-5 w-5" />,
  events: <Calendar className="h-5 w-5" />,
};

const colorByKey: Record<string, string> = {
  nss: 'text-red-500',
  ncc: 'text-blue-600',
  sportsActivities: 'text-amber-500',
  culturalActivities: 'text-purple-500',
  extensionActivities: 'text-green-500',
  totalRecords: 'text-indigo-500',
  withEvidence: 'text-teal-500',
  events: 'text-orange-500',
};

function formatValue(value: number | string): string {
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return String(value);
    return value.toLocaleString('en-IN', { maximumFractionDigits: 1 });
  }
  return value;
}

export function StudentDevelopmentDashboard({ departmentId, academicYear }: DashboardProps) {
  const [dashboard, setDashboard] = useState<SdcDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    sdcRepositoryService
      .getDashboard(departmentId, academicYear)
      .then((data) => {
        if (!cancelled) setDashboard(data);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load the student development dashboard. Please try again.');
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
        Loading dashboard...
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
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Student Development Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of student activities, achievements, and development programs · {dashboard.department} · {dashboard.academicYear}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dashboard.kpis.map((kpi) => (
          <Card key={kpi.key} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`h-5 w-5 ${colorByKey[kpi.key] || 'text-slate-500'}`}>
                  {iconByKey[kpi.key]}
                </span>
                <Badge variant="secondary" className="text-xs font-medium">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {kpi.change}
                </Badge>
              </div>
              <div className="text-2xl font-bold">{formatValue(kpi.value)}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Repository Health */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Repository Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {dashboard.healthIndicators.map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.value} records</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.value >= 10
                            ? 'bg-green-500'
                            : item.value >= 5
                              ? 'bg-blue-500'
                              : item.value >= 1
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(4, item.value * 4))}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold w-10 text-right">{item.value}</span>
                </div>
              ))}
            </div>
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
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {dashboard.recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.action}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-xs py-0 px-1.5">
                          {activity.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Section Summary ({dashboard.academicYear})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {dashboard.healthIndicators.slice(0, 12).map((indicator) => (
              <div
                key={indicator.key}
                className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900/30"
              >
                <div className="h-5 w-5 mx-auto mb-1 text-slate-500">{iconByKey[indicator.key]}</div>
                <div className="text-lg font-bold">{indicator.value}</div>
                <p className="text-xs text-muted-foreground">{indicator.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  PieChart,
  FileCheck,
  GraduationCap,
  Heart,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  financeRepositoryService,
  FinanceDashboardData,
} from '@/services/finance-repository.service';

interface KpiCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

// Icon/color palette for the 8 KPI slots (positional — matches the backend KPI order).
const kpiPalette: { icon: React.ReactNode; color: string }[] = [
  { icon: <PieChart className="h-5 w-5" />, color: 'bg-blue-500/10 text-blue-600' },
  { icon: <TrendingUp className="h-5 w-5" />, color: 'bg-emerald-500/10 text-emerald-600' },
  { icon: <TrendingDown className="h-5 w-5" />, color: 'bg-orange-500/10 text-orange-600' },
  { icon: <IndianRupee className="h-5 w-5" />, color: 'bg-purple-500/10 text-purple-600' },
  { icon: <GraduationCap className="h-5 w-5" />, color: 'bg-cyan-500/10 text-cyan-600' },
  { icon: <Heart className="h-5 w-5" />, color: 'bg-pink-500/10 text-pink-600' },
  { icon: <FileCheck className="h-5 w-5" />, color: 'bg-green-500/10 text-green-600' },
  { icon: <Landmark className="h-5 w-5" />, color: 'bg-amber-500/10 text-amber-600' },
];

const healthColors = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-orange-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-cyan-500',
];

const getActivityColor = (type: string) => {
  switch (type) {
    case 'income': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'expense': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'audit': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'scholarship': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    case 'investment': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

export function FinanceDashboard() {
  const [dashboard, setDashboard] = useState<FinanceDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    financeRepositoryService
      .getDashboard()
      .then((data) => {
        if (!cancelled) setDashboard(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load dashboard');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading dashboard...</span>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-lg border border-red-500/20 bg-red-500/5">
        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
        <p className="text-xs text-red-600">{error || 'Failed to load dashboard'}</p>
      </div>
    );
  }

  const kpiCards: KpiCard[] = (dashboard.kpis || []).map((kpi, index) => ({
    title: kpi.title,
    value: kpi.value,
    change: kpi.change,
    changeType: kpi.changeType || 'neutral',
    icon: kpiPalette[index % kpiPalette.length]?.icon,
    color: kpiPalette[index % kpiPalette.length]?.color || 'bg-muted',
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">{kpi.title}</p>
                  <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
                  <div className="flex items-center gap-1">
                    {kpi.changeType === 'positive' && <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />}
                    {kpi.changeType === 'negative' && <ArrowDownRight className="h-3.5 w-3.5 text-red-600" />}
                    <span className={`text-xs ${
                      kpi.changeType === 'positive' ? 'text-emerald-600' :
                      kpi.changeType === 'negative' ? 'text-red-600' : 'text-muted-foreground'
                    }`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <div className={`p-2.5 rounded-lg ${kpi.color}`}>
                  {kpi.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial Health Summary & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Financial Health Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(dashboard.financialHealth || []).map((item, index) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold">{item.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${healthColors[index % healthColors.length]} transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(0, item.value))}%` }}
                  />
                </div>
              </div>
            ))}
            {(dashboard.financialHealth || []).length === 0 && (
              <p className="text-center py-8 text-sm text-muted-foreground">No health indicators available</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {(dashboard.recentActivities || []).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <Badge variant="secondary" className={`text-[10px] px-1.5 py-0.5 shrink-0 ${getActivityColor(activity.type)}`}>
                    {activity.type}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.details}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="h-3 w-3" />
                    <span>{activity.timestamp}</span>
                  </div>
                </div>
              ))}
              {(dashboard.recentActivities || []).length === 0 && (
                <p className="text-center py-8 text-sm text-muted-foreground">No recent activities</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

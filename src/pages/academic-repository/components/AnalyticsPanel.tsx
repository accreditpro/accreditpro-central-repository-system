import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { repositoryMetrics, repositoryKPIs } from '../repository-config';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export const AnalyticsPanel = () => {
  const metrics = [
    { label: 'Data Completeness', value: repositoryMetrics.dataCompleteness, color: 'text-indigo-600' },
    { label: 'Evidence Completeness', value: repositoryMetrics.evidenceCompleteness, color: 'text-violet-600' },
    { label: 'Verification', value: repositoryMetrics.verificationPercent, color: 'text-emerald-600' },
  ];

  const getHealthColor = (value: number) => {
    if (value >= 85) return 'text-emerald-500';
    if (value >= 65) return 'text-amber-500';
    return 'text-red-500';
  };

  const getHealthLabel = (value: number) => {
    if (value >= 85) return 'Excellent';
    if (value >= 65) return 'Good';
    if (value >= 45) return 'Needs Attention';
    return 'Critical';
  };

  return (
    <div className="sticky top-4 space-y-4">
      {/* Readiness Score */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Academic Readiness
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex items-center justify-center mb-3">
            <div className="relative">
              <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  strokeDasharray={`${repositoryMetrics.readinessScore * 2.64} 264`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{repositoryMetrics.readinessScore}%</span>
                <span className="text-[9px] text-muted-foreground">Score</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-center text-muted-foreground">
            = (Data + Evidence + Verification) / 3
          </p>
        </CardContent>
      </Card>

      {/* Metrics Breakdown */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pb-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium">{metric.label}</span>
                <span className={cn('text-xs font-bold', metric.color)}>{metric.value}%</span>
              </div>
              <Progress value={metric.value} className="h-1.5" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Health Indicators */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Health Indicators
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pb-4">
          {repositoryKPIs.slice(0, 6).map((kpi) => (
            <div key={kpi.id} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-1.5">
                {kpi.verificationStatus === 'verified' ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                ) : kpi.verificationStatus === 'partial' ? (
                  <Clock className="h-3 w-3 text-amber-500" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-500" />
                )}
                <span className="text-[11px]">{kpi.label}</span>
              </div>
              <span className={cn('text-[11px] font-medium', getHealthColor(kpi.completionPercent))}>
                {getHealthLabel(kpi.completionPercent)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
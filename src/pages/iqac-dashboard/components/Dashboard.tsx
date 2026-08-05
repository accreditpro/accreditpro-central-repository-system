import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  Trophy,
  Award,
  TrendingUp,
  FileCheck,
  Building,
  AlertTriangle,
  CheckSquare,
  MessageSquareWarning,
  Gauge,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAppSelector } from '@/store';
import { selectObservations } from '@/store/slices/iqacSlice';
import {
  iqacKpis,
  departmentReadinessRows,
  departmentRepositories,
  institutionOverall,
  gapStats,
} from '../iqac-data';
import { StatCard, statusOf, StatusBadge, ReadinessBar, scoreTone, PRIORITY_META } from './common';
import { InstitutionalCharts } from './InstitutionalCharts';
import { VerificationOverview } from './VerificationOverview';

function ReadinessGauge({ value, label }: { value: number; label: string }) {
  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/20" />
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          className={value >= 85 ? 'text-emerald-500' : value >= 70 ? 'text-amber-500' : 'text-red-500'}
          strokeDasharray={`${value * 3.14} 314`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{value}%</span>
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const observations = useAppSelector(selectObservations);
  const activeObservations = observations.filter((o) => o.status !== 'closed');
  const openObservations = observations.filter((o) => o.status === 'open');
  const criticalObs = observations.filter((o) => o.priority === 'critical' && o.status !== 'closed');

  const kpiCards = [
    { label: 'Overall Repository Readiness', value: `${iqacKpis.repositoryReadiness}%`, icon: Database, tone: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40' },
    { label: 'NBA Readiness', value: `${iqacKpis.nbaReadiness}%`, icon: Trophy, tone: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { label: 'NAAC Readiness', value: `${iqacKpis.naacReadiness}%`, icon: Award, tone: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/40' },
    { label: 'NIRF Readiness', value: `${iqacKpis.nirfReadiness}%`, icon: TrendingUp, tone: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { label: 'Evidence Completion', value: `${iqacKpis.evidenceCompletion}%`, icon: FileCheck, tone: 'text-fuchsia-600', bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/40' },
    { label: 'Departments Ready', value: `${iqacKpis.departmentsReady}`, icon: Building, tone: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { label: 'Needing Attention', value: `${iqacKpis.departmentsNeedingAttention}`, icon: Building, tone: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { label: 'Critical Gaps', value: `${gapStats.critical}`, icon: AlertTriangle, tone: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/40' },
    { label: 'Pending HOD Approvals', value: `${iqacKpis.pendingHodApprovals}`, icon: CheckSquare, tone: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/40' },
    { label: 'Active Observations', value: `${activeObservations.length}`, icon: MessageSquareWarning, tone: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-950/40' },
  ];

  return (
    <div className="space-y-6">
      {/* Executive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {kpiCards.map((kpi) => (
          <StatCard key={kpi.label} icon={kpi.icon} label={kpi.label} value={kpi.value} tone={kpi.tone} iconBg={kpi.bg} />
        ))}
      </div>

      {/* Evidence Verification Overview */}
      <VerificationOverview />

      {/* Institution Readiness Gauge + Department Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Gauge className="h-4 w-4 text-primary" />
              Institution Readiness
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <ReadinessGauge value={institutionOverall.repositoryCompletion} label="Repository Completion" />
            <div className="space-y-3">
              {[
                { label: 'Repository Completion', value: institutionOverall.repositoryCompletion, tone: 'text-blue-600' },
                { label: 'Evidence Completion', value: institutionOverall.evidenceCompletion, tone: 'text-fuchsia-600' },
                { label: 'NBA Readiness', value: institutionOverall.nba, tone: 'text-amber-600' },
                { label: 'NAAC Readiness', value: institutionOverall.naac, tone: 'text-purple-600' },
                { label: 'NIRF Readiness', value: institutionOverall.nirf, tone: 'text-emerald-600' },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className={`font-semibold ${m.tone}`}>{m.value}%</span>
                  </div>
                  <ReadinessBar value={m.value} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Summary */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Department Readiness Summary</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/app/iqac-dashboard?view=departments')}>
                View all <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2.5 font-medium text-muted-foreground">Department</th>
                    <th className="text-center p-2.5 font-medium text-muted-foreground">Repository Completion</th>
                    <th className="text-center p-2.5 font-medium text-emerald-600">Top Repository</th>
                    <th className="text-center p-2.5 font-medium text-red-600">Needs Focus</th>
                    <th className="text-center p-2.5 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentReadinessRows.map((dept) => {
                    const repos = departmentRepositories.find((d) => d.code === dept.code)?.repositories ?? [];
                    const top = [...repos].sort((a, b) => b.completion - a.completion)[0];
                    const weak = [...repos].sort((a, b) => a.completion - b.completion)[0];
                    return (
                      <tr key={dept.code} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                        <td className="p-2.5 font-medium">
                          {dept.code}
                          <p className="text-[10px] text-muted-foreground">{dept.name}</p>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={scoreTone(dept.repositoryCompletion)}>{dept.repositoryCompletion}%</span>
                        </td>
                        <td className="p-2.5 text-center">
                          {top && (
                            <span className="text-emerald-600">
                              {top.repo} <span className="font-semibold">{top.completion}%</span>
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-center">
                          {weak && (
                            <span className="text-red-600">
                              {weak.repo} <span className="font-semibold">{weak.completion}%</span>
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-center">
                          <StatusBadge status={statusOf(dept.repositoryCompletion)} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Ready (≥85%)</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Needs Attention (70–84%)</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Critical (&lt;70%)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts — repository trends, observation status, department comparisons */}
      <InstitutionalCharts />

      {/* Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {criticalObs.length > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                {criticalObs.length} critical quality observation{criticalObs.length !== 1 ? 's' : ''} require action
              </p>
              <div className="mt-1.5 space-y-1">
                {criticalObs.slice(0, 3).map((o) => (
                  <p key={o.id} className="text-[11px] text-muted-foreground truncate">
                    <span className="font-medium text-foreground">{o.department} · {o.repository}</span> — {o.title}
                  </p>
                ))}
              </div>
              <button
                className="mt-2 text-[11px] font-medium text-red-600 hover:underline"
                onClick={() => navigate('/app/iqac-dashboard?view=observations')}
              >
                Open Quality Observations →
              </button>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4">
          <ShieldCheck className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
              IQAC monitoring overview — {openObservations.length} open observations
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {(['critical', 'high', 'medium', 'low'] as const).map((p) => {
                const count = observations.filter((o) => o.priority === p && o.status !== 'closed').length;
                return (
                  <Badge key={p} variant="outline" className={PRIORITY_META[p].badge}>
                    {count} {PRIORITY_META[p].label}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

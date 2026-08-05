import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  Trophy,
  Award,
  TrendingUp,
  Building,
  BookOpen,
  Users,
  FileCheck,
  CheckSquare,
  ClipboardList,
  AlertTriangle,
  Gauge,
  ChevronRight,
} from 'lucide-react';
import {
  kpiData,
  institutionStats,
  departmentRepositories,
  nbaDeptScores,
  naacDeptScores,
  nirfDeptScores,
  principalGaps,
} from '../principal-data';
import { StatCard, statusOf, StatusBadge, ReadinessBar, scoreTone } from './common';

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

const kpiCards = [
  { label: 'Overall Repository Readiness', value: `${kpiData.repositoryCompletion}%`, icon: Database, tone: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40' },
  { label: 'NBA Readiness', value: `${kpiData.nbaReadiness}%`, icon: Trophy, tone: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
  { label: 'NAAC Readiness', value: `${kpiData.naacReadiness}%`, icon: Award, tone: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/40' },
  { label: 'NIRF Readiness', value: `${kpiData.nirfReadiness}%`, icon: TrendingUp, tone: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
  { label: 'Total Departments', value: `${institutionStats.departments}`, icon: Building, tone: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
  { label: 'Total Programs', value: `${institutionStats.programs}`, icon: BookOpen, tone: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950/40' },
  { label: 'Total Faculty', value: `${institutionStats.faculty}`, icon: Users, tone: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/40' },
  { label: 'Total Students', value: `${institutionStats.students.toLocaleString()}`, icon: Users, tone: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/40' },
  { label: 'Overall Evidence Completion', value: `${kpiData.evidenceCompletion}%`, icon: FileCheck, tone: 'text-fuchsia-600', bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/40' },
  { label: 'Pending HOD Approvals', value: `${kpiData.pendingApprovals}`, icon: CheckSquare, tone: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/40' },
  { label: 'IQAC Observations', value: '5', icon: ClipboardList, tone: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-950/40' },
  { label: 'Critical Gaps', value: `${principalGaps.filter((g) => g.priority === 'critical').length}`, icon: AlertTriangle, tone: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/40' },
];

export function ExecutiveDashboard() {
  const navigate = useNavigate();
  const criticalGaps = principalGaps.filter((g) => g.priority === 'critical').length;
  const approvedEvidence = Math.round(kpiData.evidenceCompletion * 0.72);

  return (
    <div className="space-y-6">
      {/* Executive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {kpiCards.map((kpi) => (
          <StatCard key={kpi.label} icon={kpi.icon} label={kpi.label} value={kpi.value} tone={kpi.tone} iconBg={kpi.bg} />
        ))}
      </div>

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
            <ReadinessGauge value={kpiData.repositoryCompletion} label="Repository Completion" />
            <div className="space-y-3">
              {[
                { label: 'Repository Completion', value: kpiData.repositoryCompletion, tone: 'text-blue-600' },
                { label: 'Approved Evidence', value: approvedEvidence, tone: 'text-emerald-600' },
                { label: 'Missing Evidence', value: 100 - approvedEvidence, tone: 'text-red-600' },
                { label: 'Accreditation Readiness', value: kpiData.naacReadiness, tone: 'text-purple-600' },
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
              <CardTitle className="text-base font-semibold">Department Summary</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/app/principal-dashboard?view=departments')}>
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
                    <th className="text-center p-2.5 font-medium text-muted-foreground">Repository Readiness</th>
                    <th className="text-center p-2.5 font-medium text-amber-600">NBA</th>
                    <th className="text-center p-2.5 font-medium text-purple-600">NAAC</th>
                    <th className="text-center p-2.5 font-medium text-emerald-600">NIRF</th>
                    <th className="text-center p-2.5 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentRepositories.map((dept) => {
                    const nba = nbaDeptScores.find((d) => d.dept === dept.code)?.overall ?? 0;
                    const naac = naacDeptScores.find((d) => d.dept === dept.code)?.overall ?? 0;
                    const nirf = nirfDeptScores.find((d) => d.dept === dept.code)?.overall ?? 0;
                    return (
                      <tr key={dept.code} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                        <td className="p-2.5 font-medium">
                          {dept.code}
                          <p className="text-[10px] text-muted-foreground">{dept.name}</p>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={scoreTone(dept.readiness)}>{dept.readiness}%</span>
                        </td>
                        <td className="p-2.5 text-center">{nba}%</td>
                        <td className="p-2.5 text-center">{naac}%</td>
                        <td className="p-2.5 text-center">{nirf}%</td>
                        <td className="p-2.5 text-center">
                          <StatusBadge status={statusOf(dept.readiness)} />
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

      {/* Quick alert strip */}
      {criticalGaps > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-3">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-700 dark:text-red-400">
            {criticalGaps} critical gap{criticalGaps !== 1 ? 's' : ''} require immediate attention —{' '}
            {principalGaps.filter((g) => g.priority === 'critical').map((g) => `${g.department} (${g.repository})`).join(', ')}.
          </p>
          <Badge variant="outline" className="text-[10px] shrink-0">Gap Analysis</Badge>
        </div>
      )}
    </div>
  );
}

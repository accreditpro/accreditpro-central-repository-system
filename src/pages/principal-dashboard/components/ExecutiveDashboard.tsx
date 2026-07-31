import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  Award,
  Trophy,
  TrendingUp,
  Database,
  FileCheck,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Heart,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { kpiData, departmentScores } from '../principal-configs';

const kpiCards = [
  {
    label: 'Institution Readiness',
    value: kpiData.institutionReadiness,
    icon: Target,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    label: 'NAAC Readiness',
    value: kpiData.naacReadiness,
    icon: Award,
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-950',
  },
  {
    label: 'NBA Readiness',
    value: kpiData.nbaReadiness,
    icon: Trophy,
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950',
  },
  {
    label: 'NIRF Readiness',
    value: kpiData.nirfReadiness,
    icon: TrendingUp,
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-950',
  },
  {
    label: 'Repository Completion',
    value: kpiData.repositoryCompletion,
    icon: Database,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-950',
  },
  {
    label: 'Evidence Completion',
    value: kpiData.evidenceCompletion,
    icon: FileCheck,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50 dark:bg-cyan-950',
  },
  {
    label: 'Verification Status',
    value: kpiData.verificationStatus,
    icon: ShieldCheck,
    color: 'text-teal-600',
    bg: 'bg-teal-50 dark:bg-teal-950',
  },
  {
    label: 'Pending Approvals',
    value: kpiData.pendingApprovals,
    icon: Clock,
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-950',
    isCount: true,
  },
  {
    label: 'Departments at Risk',
    value: kpiData.departmentsAtRisk,
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-950',
    isCount: true,
  },
  {
    label: 'Overall Health Score',
    value: kpiData.overallHealthScore,
    icon: Heart,
    color: 'text-pink-600',
    bg: 'bg-pink-50 dark:bg-pink-950',
  },
  {
    label: 'Performance Index',
    value: kpiData.performanceIndex,
    icon: BarChart3,
    color: 'text-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-950',
  },
  {
    label: 'Data Quality Score',
    value: kpiData.dataQualityScore,
    icon: Sparkles,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950',
  },
];

const getHealthBadge = (health: string) => {
  switch (health) {
    case 'excellent':
      return (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-[10px]">
          🟢 Excellent
        </Badge>
      );
    case 'good':
      return (
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-[10px]">
          🔵 Good
        </Badge>
      );
    case 'warning':
      return (
        <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 text-[10px]">
          🟡 Warning
        </Badge>
      );
    case 'critical':
      return (
        <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-[10px]">
          🔴 Critical
        </Badge>
      );
    default:
      return null;
  }
};

export function ExecutiveDashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {kpiCards.map(kpi => (
          <Card key={kpi.label} className="relative overflow-hidden">
            <CardContent className="p-3">
              <div
                className={`inline-flex items-center justify-center h-8 w-8 rounded-lg ${kpi.bg} mb-2`}
              >
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                  {kpi.label}
                </p>
                <p className="text-xl font-bold mt-0.5">
                  {kpi.value}
                  {!kpi.isCount && '%'}
                </p>
              </div>
              {!kpi.isCount && <Progress value={kpi.value} className="h-1 mt-2" />}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Department Performance Scorecard */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Department Performance Scorecard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                    Department
                  </th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">
                    Repository
                  </th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">
                    Evidence
                  </th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">
                    Verification
                  </th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">
                    Readiness
                  </th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">
                    Health
                  </th>
                </tr>
              </thead>
              <tbody>
                {departmentScores.map(dept => (
                  <tr
                    key={dept.id}
                    className="border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3">
                      <div>
                        <p className="font-medium text-sm">{dept.code}</p>
                        <p className="text-[10px] text-muted-foreground">{dept.name}</p>
                      </div>
                    </td>
                    <td className="text-center py-2.5 px-3">
                      <span
                        className={`font-semibold ${dept.repository >= 85 ? 'text-green-600' : dept.repository >= 70 ? 'text-yellow-600' : 'text-red-600'}`}
                      >
                        {dept.repository}%
                      </span>
                    </td>
                    <td className="text-center py-2.5 px-3">
                      <span
                        className={`font-semibold ${dept.evidence >= 85 ? 'text-green-600' : dept.evidence >= 70 ? 'text-yellow-600' : 'text-red-600'}`}
                      >
                        {dept.evidence}%
                      </span>
                    </td>
                    <td className="text-center py-2.5 px-3">
                      <span
                        className={`font-semibold ${dept.verification >= 85 ? 'text-green-600' : dept.verification >= 70 ? 'text-yellow-600' : 'text-red-600'}`}
                      >
                        {dept.verification}%
                      </span>
                    </td>
                    <td className="text-center py-2.5 px-3">
                      <span
                        className={`font-semibold ${dept.readiness >= 85 ? 'text-green-600' : dept.readiness >= 70 ? 'text-yellow-600' : 'text-red-600'}`}
                      >
                        {dept.readiness}%
                      </span>
                    </td>
                    <td className="text-center py-2.5 px-3">{getHealthBadge(dept.health)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Readiness Gauge */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Accreditation Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">NAAC</span>
                <span className="text-xs font-semibold">{kpiData.naacReadiness}%</span>
              </div>
              <Progress value={kpiData.naacReadiness} className="h-2" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">NBA</span>
                <span className="text-xs font-semibold">{kpiData.nbaReadiness}%</span>
              </div>
              <Progress value={kpiData.nbaReadiness} className="h-2" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">NIRF</span>
                <span className="text-xs font-semibold">{kpiData.nirfReadiness}%</span>
              </div>
              <Progress value={kpiData.nirfReadiness} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Top Performing */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top Performing Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {departmentScores
                .sort((a, b) => b.readiness - a.readiness)
                .slice(0, 4)
                .map((dept, idx) => (
                  <div key={dept.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-4">
                        {idx + 1}.
                      </span>
                      <span className="text-xs font-medium">{dept.code}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={dept.readiness} className="h-1.5 w-16" />
                      <span className="text-xs font-semibold w-8 text-right">
                        {dept.readiness}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Quick Insight */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              AI Quick Insight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Institution is performing well with 81% overall health. Focus areas: EEE department
              needs immediate attention (63% readiness). 14 approvals pending your review. NAAC
              readiness on track for Grade A by March 2025.
            </p>
            <Badge variant="outline" className="mt-3 text-[10px]">
              Updated 5 min ago
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Award, TrendingUp } from 'lucide-react';
import {
  nbaDeptScores,
  naacDeptScores,
  nirfDeptScores,
  NBA_CRITERIA,
  NAAC_CRITERIA,
  NIRF_PARAMETERS,
  NIRF_SHORT,
  naacCriteria,
  nirfParameters,
  kpiData,
} from '../principal-data';
import { ReadinessBar, scoreTone, StatCard, StatusBadge, statusOf } from './common';
import { cn } from '@/lib/utils';

function FrameworkHeader({
  icon: Icon,
  title,
  overall,
  chip,
}: {
  icon: React.ElementType;
  title: string;
  overall: number;
  chip: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-lg bg-muted/40">
          <Icon className={cn('h-4 w-4', chip)} />
        </span>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-[10px] text-muted-foreground">Department & criterion level readiness</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Overall</span>
        <span className={cn('text-2xl font-bold', scoreTone(overall))}>{overall}%</span>
        <StatusBadge status={statusOf(overall)} />
      </div>
    </div>
  );
}

function CriterionTable({
  deptRows,
  criteria,
  weight,
  headers,
}: {
  deptRows: { dept: string; scores: number[]; overall: number }[];
  criteria: string[];
  weight: number[];
  /** Optional column headers (e.g. NIRF abbreviations TLR/RP/GO/OI/PR). */
  headers?: string[];
}) {
  const criterionAvgs = criteria.map((_, ci) =>
    Math.round(deptRows.reduce((a, d) => a + d.scores[ci], 0) / deptRows.length)
  );
  return (
    <div className="space-y-5">
      {/* Criterion-wise averages */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Criterion-wise Institution Readiness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {criteria.map((name, ci) => (
            <div key={name}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium">C{ci + 1}. {name}</span>
                <span className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] text-muted-foreground">W {weight[ci]}</Badge>
                  <span className={scoreTone(criterionAvgs[ci])}>{criterionAvgs[ci]}%</span>
                </span>
              </div>
              <ReadinessBar value={criterionAvgs[ci]} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Department-wise matrix */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Department-wise Readiness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-2 font-medium text-muted-foreground">Dept</th>
                  {criteria.map((_, ci) => (
                    <th key={ci} className="text-center p-2 font-medium text-muted-foreground">
                      {headers?.[ci] ?? `C${ci + 1}`}
                    </th>
                  ))}
                  <th className="text-center p-2 font-medium">Overall</th>
                </tr>
              </thead>
              <tbody>
                {deptRows.map((d) => (
                  <tr key={d.dept} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="p-2 font-semibold">{d.dept}</td>
                    {d.scores.map((s, ci) => (
                      <td key={ci} className="p-2 text-center">
                        <span className={scoreTone(s)}>{s}%</span>
                      </td>
                    ))}
                    <td className="p-2 text-center font-bold">{d.overall}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AccreditationReadiness() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="nba">
        <TabsList>
          <TabsTrigger value="nba" className="gap-1.5"><Trophy className="h-3.5 w-3.5 text-amber-500" /> NBA</TabsTrigger>
          <TabsTrigger value="naac" className="gap-1.5"><Award className="h-3.5 w-3.5 text-purple-500" /> NAAC</TabsTrigger>
          <TabsTrigger value="nirf" className="gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> NIRF</TabsTrigger>
        </TabsList>

        {/* ---------------- NBA ---------------- */}
        <TabsContent value="nba" className="mt-4 space-y-4">
          <FrameworkHeader icon={Trophy} title="NBA Readiness" overall={kpiData.nbaReadiness} chip="text-amber-500" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={Trophy} label="Overall Readiness" value={`${kpiData.nbaReadiness}%`} tone="text-amber-600" iconBg="bg-amber-50 dark:bg-amber-950/40" />
            <StatCard icon={Trophy} label="Programs Eligible" value="3" sub="CSE, ECE, IT" tone="text-amber-600" iconBg="bg-amber-50 dark:bg-amber-950/40" />
            <StatCard icon={Trophy} label="Best Department" value="CSE" sub="92% readiness" tone="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950/40" />
            <StatCard icon={Trophy} label="Departments at Risk" value={`${nbaDeptScores.filter((d) => d.overall < 70).length}`} sub="Below 70%" tone="text-red-600" iconBg="bg-red-50 dark:bg-red-950/40" />
          </div>
          <CriterionTable deptRows={nbaDeptScores} criteria={NBA_CRITERIA} weight={[60, 80, 120, 120, 100, 80, 40]} />
        </TabsContent>

        {/* ---------------- NAAC ---------------- */}
        <TabsContent value="naac" className="mt-4 space-y-4">
          <FrameworkHeader icon={Award} title="NAAC Readiness" overall={kpiData.naacReadiness} chip="text-purple-500" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={Award} label="Overall Readiness" value={`${kpiData.naacReadiness}%`} tone="text-purple-600" iconBg="bg-purple-50 dark:bg-purple-950/40" />
            <StatCard icon={Award} label="Criteria Ready" value="1/7" sub="Criterion 4" tone="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950/40" />
            <StatCard icon={Award} label="Projected Grade" value="A" sub="CGPA 3.25–3.50" tone="text-purple-600" iconBg="bg-purple-50 dark:bg-purple-950/40" />
            <StatCard icon={Award} label="Departments at Risk" value={`${naacDeptScores.filter((d) => d.overall < 70).length}`} sub="Below 70%" tone="text-red-600" iconBg="bg-red-50 dark:bg-red-950/40" />
          </div>

          {/* Institution criterion-wise (from config) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Institution-wise Criterion Readiness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {naacCriteria.map((c) => (
                <div key={c.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium">C{c.id}. {c.name}</span>
                    <span className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px] text-muted-foreground">W {c.weightage}</Badge>
                      <span className={scoreTone(c.completion)}>{c.completion}%</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <ReadinessBar value={c.completion} />
                    <ReadinessBar value={c.evidence} className="opacity-50" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <CriterionTable deptRows={naacDeptScores} criteria={NAAC_CRITERIA} weight={[150, 200, 250, 100, 100, 100, 100]} />
        </TabsContent>

        {/* ---------------- NIRF ---------------- */}
        <TabsContent value="nirf" className="mt-4 space-y-4">
          <FrameworkHeader icon={TrendingUp} title="NIRF Readiness" overall={kpiData.nirfReadiness} chip="text-emerald-500" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={TrendingUp} label="Overall Score" value={`${kpiData.nirfReadiness}%`} tone="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950/40" />
            <StatCard icon={TrendingUp} label="Projected Band" value="101–150" sub="Engineering category" tone="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-950/40" />
            <StatCard icon={TrendingUp} label="Best Category" value="GO" sub="76%" tone="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950/40" />
            <StatCard icon={TrendingUp} label="Weakest Category" value="Perception" sub="65%" tone="text-red-600" iconBg="bg-red-50 dark:bg-red-950/40" />
          </div>

          {/* Category-wise readiness */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Readiness by Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {nirfParameters.map((p) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium">{p.name}</span>
                    <span className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px] text-muted-foreground">Weight {p.weightage}%</Badge>
                      <span className={scoreTone(p.score)}>{p.score}/100</span>
                    </span>
                  </div>
                  <ReadinessBar value={p.score} />
                </div>
              ))}
            </CardContent>
          </Card>

          <CriterionTable deptRows={nirfDeptScores} criteria={NIRF_PARAMETERS} weight={[30, 30, 20, 10, 10]} headers={NIRF_SHORT} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

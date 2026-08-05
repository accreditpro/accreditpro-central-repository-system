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
  iqacKpis,
} from '../iqac-data';
import { ReadinessBar, StatCard, StatusBadge, statusOf, scoreTone } from './common';
import { cn } from '@/lib/utils';

function criterionAvg(matrix: { scores: number[] }[], index: number): number {
  return Math.round(matrix.reduce((a, d) => a + d.scores[index], 0) / matrix.length);
}

function CriterionBars({
  rows,
  weightLabel,
}: {
  rows: { name: string; value: number; weight: number }[];
  weightLabel: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Criterion-wise Readiness</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((c) => (
          <div key={c.name}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium">{c.name}</span>
              <span className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] text-muted-foreground">
                  {weightLabel} {c.weight}
                </Badge>
                <span className={scoreTone(c.value)}>{c.value}%</span>
              </span>
            </div>
            <ReadinessBar value={c.value} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DeptMatrix({
  rows,
  criteria,
  title,
  headers,
}: {
  rows: { dept: string; scores: number[]; overall: number }[];
  criteria: string[];
  title: string;
  /** Optional column headers (e.g. NIRF abbreviations TLR/RP/GO/OI/PR). */
  headers?: string[];
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
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
              <th className="text-center p-2 font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.dept} className="border-b last:border-0 hover:bg-muted/40">
                <td className="p-2 font-semibold">{d.dept}</td>
                {d.scores.map((s, ci) => (
                  <td key={ci} className="p-2 text-center">
                    <span className={scoreTone(s)}>{s}%</span>
                  </td>
                ))}
                <td className="p-2 text-center font-bold">{d.overall}%</td>
                <td className="p-2 text-center">
                  <StatusBadge status={statusOf(d.overall)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function FrameworkHeader({
  icon: Icon,
  title,
  overall,
  chip,
  sub,
}: {
  icon: React.ElementType;
  title: string;
  overall: number;
  chip: string;
  sub: string;
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className={cn('p-2.5 rounded-lg', chip)}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-[11px] text-muted-foreground">{sub}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Overall</span>
            <span className={cn('text-2xl font-bold', scoreTone(overall))}>{overall}%</span>
            <StatusBadge status={statusOf(overall)} />
          </div>
        </div>
      </CardContent>
    </Card>
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
          <FrameworkHeader
            icon={Trophy}
            title="NBA Readiness"
            overall={iqacKpis.nbaReadiness}
            chip="bg-amber-500/10 text-amber-600"
            sub="Criterion-wise, department-wise and overall readiness for NBA accreditation"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={Trophy} label="Overall Readiness" value={`${iqacKpis.nbaReadiness}%`} tone="text-amber-600" iconBg="bg-amber-50 dark:bg-amber-950/40" />
            <StatCard icon={Trophy} label="Best Criterion" value={`C${(() => {
              const avgs = NBA_CRITERIA.map((_, ci) => criterionAvg(nbaDeptScores, ci));
              return avgs.indexOf(Math.max(...avgs)) + 1;
            })()}`} sub="Highest average" tone="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950/40" />
            <StatCard icon={Trophy} label="Best Department" value={nbaDeptScores.reduce((a, b) => (a.overall > b.overall ? a : b)).dept} sub="Highest overall" tone="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950/40" />
            <StatCard icon={Trophy} label="Departments at Risk" value={`${nbaDeptScores.filter((d) => d.overall < 70).length}`} sub="Below 70%" tone="text-red-600" iconBg="bg-red-50 dark:bg-red-950/40" />
          </div>
          <CriterionBars
            rows={NBA_CRITERIA.map((name, ci) => ({ name, value: criterionAvg(nbaDeptScores, ci), weight: [60, 80, 120, 120, 100, 80, 40][ci] }))}
            weightLabel="Weight"
          />
          <DeptMatrix rows={nbaDeptScores} criteria={NBA_CRITERIA} title="Department-wise Readiness" />
        </TabsContent>

        {/* ---------------- NAAC ---------------- */}
        <TabsContent value="naac" className="mt-4 space-y-4">
          <FrameworkHeader
            icon={Award}
            title="NAAC Readiness"
            overall={iqacKpis.naacReadiness}
            chip="bg-purple-500/10 text-purple-600"
            sub="Criterion-wise, department-wise and institution readiness for NAAC accreditation"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={Award} label="Overall Readiness" value={`${iqacKpis.naacReadiness}%`} tone="text-purple-600" iconBg="bg-purple-50 dark:bg-purple-950/40" />
            <StatCard icon={Award} label="Criteria Ready" value={`${naacCriteria.filter((c) => c.completion >= 85).length}/7`} sub="At or above 85%" tone="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950/40" />
            <StatCard icon={Award} label="Projected Grade" value="A" sub="CGPA 3.25–3.50" tone="text-purple-600" iconBg="bg-purple-50 dark:bg-purple-950/40" />
            <StatCard icon={Award} label="Departments at Risk" value={`${naacDeptScores.filter((d) => d.overall < 70).length}`} sub="Below 70%" tone="text-red-600" iconBg="bg-red-50 dark:bg-red-950/40" />
          </div>
          <CriterionBars
            rows={NAAC_CRITERIA.map((name, ci) => ({ name, value: criterionAvg(naacDeptScores, ci), weight: [150, 200, 250, 100, 100, 100, 100][ci] }))}
            weightLabel="Weight"
          />
          <DeptMatrix rows={naacDeptScores} criteria={NAAC_CRITERIA} title="Department-wise Readiness" />

          {/* Institution readiness from config */}
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
                  <ReadinessBar value={c.completion} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- NIRF ---------------- */}
        <TabsContent value="nirf" className="mt-4 space-y-4">
          <FrameworkHeader
            icon={TrendingUp}
            title="NIRF Readiness"
            overall={iqacKpis.nirfReadiness}
            chip="bg-emerald-500/10 text-emerald-600"
            sub="Category-wise readiness — Teaching, Learning and Resources (TLR), Research and Professional Practice (RP), Graduation Outcomes (GO), Outreach and Inclusivity (OI), Perception (PR)"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={TrendingUp} label="Overall Score" value={`${iqacKpis.nirfReadiness}%`} tone="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950/40" />
            <StatCard icon={TrendingUp} label="Projected Band" value="101–150" sub="Engineering category" tone="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-950/40" />
            <StatCard icon={TrendingUp} label="Best Category" value="GO" sub={`${criterionAvg(nirfDeptScores, 2)}%`} tone="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950/40" />
            <StatCard icon={TrendingUp} label="Weakest Category" value="Perception" sub={`${criterionAvg(nirfDeptScores, 4)}%`} tone="text-red-600" iconBg="bg-red-50 dark:bg-red-950/40" />
          </div>
          <CriterionBars
            rows={NIRF_PARAMETERS.map((name, ci) => ({ name, value: criterionAvg(nirfDeptScores, ci), weight: [30, 30, 20, 10, 10][ci] }))}
            weightLabel="Weight %"
          />
          <DeptMatrix rows={nirfDeptScores} criteria={NIRF_PARAMETERS} headers={NIRF_SHORT} title="Department-wise Readiness" />

          {/* Config-based NIRF parameters */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">NIRF Parameter Scores</CardTitle>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertTriangle,
  Database,
  FileQuestion,
  Clock,
  ClipboardList,
  Lightbulb,
  ChevronRight,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { departmentOptions, academicYearOptions } from '../principal-data';
import { principalService, PrincipalGapDto } from '@/services/principal.service';
import { StatCard, FilterBar, FilterSelect, ReadinessBar } from './common';

const frameworkOptions = [
  { value: 'all', label: 'All Frameworks' },
  { value: 'NAAC', label: 'NAAC' },
  { value: 'NBA', label: 'NBA' },
  { value: 'NIRF', label: 'NIRF' },
];

type GapPriority = 'critical' | 'high' | 'medium' | 'low';

const priorityMeta: Record<GapPriority, { label: string; badge: string }> = {
  critical: { label: 'Critical', badge: 'bg-red-500/10 text-red-600 border-red-500/30' },
  high: { label: 'High', badge: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  medium: { label: 'Medium', badge: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  low: { label: 'Low', badge: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
};

export function GapAnalysis() {
  const [year, setYear] = useState('2025-26');
  const [dept, setDept] = useState('all');
  const [framework, setFramework] = useState('all');
  const [selected, setSelected] = useState<PrincipalGapDto | null>(null);

  const [gaps, setGaps] = useState<PrincipalGapDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    principalService
      .getGaps({
        academicYear: year,
        department: dept === 'all' ? undefined : dept,
        framework: framework === 'all' ? undefined : framework,
        page: 0,
        size: 100,
      })
      .then(response => {
        if (!cancelled) setGaps(response.content ?? []);
      })
      .catch(() => {
        if (!cancelled) setGaps([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [year, dept, framework]);

  const filtered = useMemo(() => gaps, [gaps]);

  const counts = {
    critical: filtered.filter(g => g.priority === 'critical').length,
    high: filtered.filter(g => g.priority === 'high').length,
    medium: filtered.filter(g => g.priority === 'medium').length,
    total: filtered.length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading gap analysis...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <FilterBar>
            <FilterSelect
              value={year}
              onValueChange={setYear}
              options={academicYearOptions}
              placeholder="Academic Year"
            />
            <FilterSelect
              value={dept}
              onValueChange={setDept}
              options={departmentOptions}
              placeholder="Department"
            />
            <FilterSelect
              value={framework}
              onValueChange={setFramework}
              options={frameworkOptions}
              placeholder="Framework"
            />
            <span className="ml-auto text-[11px] text-muted-foreground">
              Click any gap for remediation detail
            </span>
          </FilterBar>
        </CardContent>
      </Card>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={AlertTriangle}
          label="Critical Gaps"
          value={`${counts.critical}`}
          sub="Immediate action"
          tone="text-red-600"
          iconBg="bg-red-50 dark:bg-red-950/40"
        />
        <StatCard
          icon={AlertTriangle}
          label="High Priority"
          value={`${counts.high}`}
          sub="This quarter"
          tone="text-orange-600"
          iconBg="bg-orange-50 dark:bg-orange-950/40"
        />
        <StatCard
          icon={AlertTriangle}
          label="Medium"
          value={`${counts.medium}`}
          sub="Tracked"
          tone="text-amber-600"
          iconBg="bg-amber-50 dark:bg-amber-950/40"
        />
        <StatCard
          icon={AlertTriangle}
          label="Total Gaps"
          value={`${counts.total}`}
          sub={`AY ${year}`}
          tone="text-indigo-600"
          iconBg="bg-indigo-50 dark:bg-indigo-950/40"
        />
      </div>

      {/* Gap table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Current vs Target Readiness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-2.5 font-medium text-muted-foreground">Department</th>
                  <th className="text-left p-2.5 font-medium text-muted-foreground">Repository</th>
                  <th className="text-left p-2.5 font-medium text-muted-foreground hidden lg:table-cell">
                    Description
                  </th>
                  <th className="text-center p-2.5 font-medium text-muted-foreground">Current</th>
                  <th className="text-center p-2.5 font-medium text-muted-foreground">Target</th>
                  <th className="text-center p-2.5 font-medium text-muted-foreground">Gap</th>
                  <th className="text-center p-2.5 font-medium text-muted-foreground">Priority</th>
                  <th className="text-right p-2.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(g => {
                  const gap = g.target - g.current;
                  const prio =
                    (g.priority as GapPriority) in priorityMeta
                      ? (g.priority as GapPriority)
                      : 'low';
                  return (
                    <tr
                      key={g.id}
                      onClick={() => setSelected(g)}
                      className="border-b last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
                    >
                      <td className="p-2.5 font-medium">{g.department}</td>
                      <td className="p-2.5">{g.repository}</td>
                      <td className="p-2.5 text-muted-foreground truncate max-w-[260px] hidden lg:table-cell">
                        {g.description}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className="font-semibold">{g.current}%</span>
                      </td>
                      <td className="p-2.5 text-center text-muted-foreground">{g.target}%</td>
                      <td className="p-2.5 text-center">
                        <Badge
                          variant="outline"
                          className={
                            gap >= 25
                              ? 'text-red-600 border-red-500/30'
                              : gap >= 15
                                ? 'text-amber-600 border-amber-500/30'
                                : 'text-emerald-600 border-emerald-500/30'
                          }
                        >
                          -{gap} pts
                        </Badge>
                      </td>
                      <td className="p-2.5 text-center">
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${priorityMeta[prio].badge}`}
                        >
                          {priorityMeta[prio].label}
                        </Badge>
                      </td>
                      <td className="p-2.5 text-right">
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground inline" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Gap detail dialog */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base">
                    {selected.department} — {selected.repository} ({selected.framework})
                  </DialogTitle>
                  <Badge
                    variant="outline"
                    className={`text-[9px] ${priorityMeta[(selected.priority as GapPriority) in priorityMeta ? (selected.priority as GapPriority) : 'low'].badge}`}
                  >
                    {
                      priorityMeta[
                        (selected.priority as GapPriority) in priorityMeta
                          ? (selected.priority as GapPriority)
                          : 'low'
                      ].label
                    }
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{selected.description}</p>
              </DialogHeader>

              {/* Current / Target / Gap */}
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">Current Readiness</p>
                    <p className="text-xl font-bold text-red-600">{selected.current}%</p>
                    <ReadinessBar value={selected.current} className="mt-1.5" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">Target Readiness</p>
                    <p className="text-xl font-bold text-emerald-600">{selected.target}%</p>
                    <ReadinessBar value={selected.target} className="mt-1.5" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">Gap</p>
                    <p className="text-xl font-bold text-amber-600">
                      {selected.target - selected.current} pts
                    </p>
                    <TrendingUp className="h-4 w-4 mx-auto mt-1.5 text-amber-500" />
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DetailBlock
                  icon={Database}
                  title="Missing Data"
                  items={selected.missingData ?? []}
                  tone="text-blue-600"
                />
                <DetailBlock
                  icon={FileQuestion}
                  title="Missing Evidence"
                  items={selected.missingEvidence ?? []}
                  tone="text-orange-600"
                />
                <DetailBlock
                  icon={Clock}
                  title="Pending Approval"
                  items={selected.pendingApproval ? [selected.pendingApproval] : []}
                  tone="text-amber-600"
                />
                <DetailBlock
                  icon={ClipboardList}
                  title="IQAC Observation"
                  items={selected.iqacObservation ? [selected.iqacObservation] : []}
                  tone="text-purple-600"
                />
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <p className="text-xs font-semibold">Recommended Actions</p>
                </div>
                <ol className="space-y-1.5">
                  {(selected.recommendedActions ?? []).map((action, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className="h-4 w-4 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-px">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground">{action}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={() => setSelected(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailBlock({
  icon: Icon,
  title,
  items,
  tone,
}: {
  icon: React.ElementType;
  title: string;
  items: string[];
  tone: string;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-3.5 w-3.5 ${tone}`} />
        <p className="text-xs font-semibold">{title}</p>
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
            <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

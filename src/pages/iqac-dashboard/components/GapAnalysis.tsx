import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  Database,
  FileCheck,
  Award,
  Building2,
  CalendarRange,
  AlertTriangle,
  Target,
  Lightbulb,
} from 'lucide-react';
import {
  repositoryGaps,
  evidenceGaps,
  criterionGaps,
  departmentGaps,
  yearGaps,
  gapStats,
} from '../iqac-data';
import type { IqaGap } from '../iqac-data';
import { StatCard, PRIORITY_META, PriorityBadge, scoreTone, ReadinessBar } from './common';
import { cn } from '@/lib/utils';

const SCOPE_TABS = [
  { id: 'repository', label: 'Repository Gaps', icon: Database },
  { id: 'evidence', label: 'Evidence Gaps', icon: FileCheck },
  { id: 'criterion', label: 'Criterion-wise Gaps', icon: Award },
  { id: 'department', label: 'Department-wise Gaps', icon: Building2 },
  { id: 'year', label: 'Academic Year Gaps', icon: CalendarRange },
];

function GapTable({ gaps }: { gaps: IqaGap[] }) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-2.5 font-medium text-muted-foreground">Scope</th>
            <th className="text-left p-2.5 font-medium text-muted-foreground">Department / Criterion</th>
            <th className="text-center p-2.5 font-medium text-muted-foreground w-36">Current Status</th>
            <th className="text-center p-2.5 font-medium text-muted-foreground">Target</th>
            <th className="text-center p-2.5 font-medium text-muted-foreground">Gap</th>
            <th className="text-center p-2.5 font-medium text-muted-foreground">Priority</th>
            <th className="text-left p-2.5 font-medium text-muted-foreground">Suggested Action</th>
          </tr>
        </thead>
        <tbody>
          {gaps.map((g) => (
            <tr key={g.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
              <td className="p-2.5 capitalize text-muted-foreground">{g.scope}</td>
              <td className="p-2.5">
                <span className="font-semibold">{g.department ?? g.criterion ?? g.repository ?? '-'}</span>
                {g.repository && <span className="text-muted-foreground"> · {g.repository}</span>}
                {g.framework && (
                  <Badge variant="outline" className="ml-1.5 text-[9px]">{g.framework}</Badge>
                )}
              </td>
              <td className="p-2.5">
                <div className="flex items-center gap-2">
                  <ReadinessBar value={g.current} className="flex-1" />
                  <span className={cn('font-semibold w-10 text-right', scoreTone(g.current))}>{g.current}%</span>
                </div>
              </td>
              <td className="p-2.5 text-center font-medium">{g.target}%</td>
              <td className={cn('p-2.5 text-center font-bold', g.target - g.current >= 25 ? 'text-red-600' : g.target - g.current >= 15 ? 'text-orange-600' : 'text-amber-600')}>
                {g.target - g.current}%
              </td>
              <td className="p-2.5 text-center">
                <PriorityBadge priority={g.priority} />
              </td>
              <td className="p-2.5 text-muted-foreground max-w-[280px]">
                <span className="flex items-start gap-1.5">
                  <Lightbulb className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                  {g.suggestedAction}
                </span>
              </td>
            </tr>
          ))}
          {gaps.length === 0 && (
            <tr>
              <td colSpan={7} className="p-6 text-center text-muted-foreground text-xs">
                No gaps in this category — all targets met. 🎉
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function GapAnalysis() {
  const [tab, setTab] = useState('repository');

  const tabGaps: Record<string, IqaGap[]> = useMemo(
    () => ({
      repository: repositoryGaps,
      evidence: evidenceGaps,
      criterion: criterionGaps,
      department: departmentGaps,
      year: yearGaps,
    }),
    []
  );

  const criticalCount = gapStats.critical;

  return (
    <div className="space-y-6">
      {/* Auto-generation banner */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold">Auto-Generated Gap Analysis</h3>
              <p className="text-xs text-muted-foreground">
                Gaps are computed automatically from live repository and accreditation data — the IQAC never calculates gaps manually.
              </p>
            </div>
            <Badge variant="outline" className="text-[10px]">Updated 5 min ago</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={AlertTriangle} label="Critical Gaps" value={`${criticalCount}`} tone="text-red-600" iconBg="bg-red-50 dark:bg-red-950/40" />
        <StatCard icon={Database} label="Repository Gaps" value={`${repositoryGaps.length}`} tone="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-950/40" />
        <StatCard icon={FileCheck} label="Evidence Gaps" value={`${evidenceGaps.length}`} tone="text-fuchsia-600" iconBg="bg-fuchsia-50 dark:bg-fuchsia-950/40" />
        <StatCard icon={Target} label="Institutional Target" value="85%" sub="Across all scopes" tone="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950/40" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          {SCOPE_TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="gap-1.5">
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
              <Badge variant="secondary" className="h-4 px-1 text-[9px]">
                {tabGaps[t.id].length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {SCOPE_TABS.map((t) => (
          <TabsContent key={t.id} value={t.id} className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {tabGaps[t.id].length} gap{tabGaps[t.id].length !== 1 ? 's' : ''} detected — generated from repository data
              </p>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                {(['critical', 'high', 'medium', 'low'] as const).map((p) => (
                  <span key={p} className="flex items-center gap-1">
                    <Badge variant="outline" className={PRIORITY_META[p].badge}>
                      {tabGaps[t.id].filter((g) => g.priority === p).length} {PRIORITY_META[p].label}
                    </Badge>
                  </span>
                ))}
              </div>
            </div>
            <GapTable gaps={tabGaps[t.id]} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

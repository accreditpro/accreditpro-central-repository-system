import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays,
  ClipboardList,
  FileCheck2,
  RefreshCcw,
  Lock,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { principalService, PrincipalExaminationDto } from '@/services/principal.service';
import { academicYearOptions } from '../principal-data';
import { StatCard, ScoreCell, FilterBar, FilterSelect } from './common';

const statusBadge: Record<string, string> = {
  Published: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  Scheduled: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  Planned: 'bg-muted text-muted-foreground',
};

export function ExaminationOverview() {
  const [year, setYear] = useState('2025-26');
  const [data, setData] = useState<PrincipalExaminationDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    principalService
      .getExamination(year)
      .then(response => {
        if (!cancelled) setData(response);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [year]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading examination overview...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <AlertTriangle className="h-5 w-5 mr-2" />
        Unable to load examination data. Please try again.
      </div>
    );
  }

  const examSchedules = data.schedules ?? [];
  const publishedResults = data.publishedResults ?? [];
  const supplementaryExams = data.supplementaryExams ?? [];
  const backlogStats = data.backlogStats ?? [];
  const latestPass = publishedResults[0]?.passPercentage ?? 0;
  const avgBacklog = Math.round(
    backlogStats.reduce((a, b) => a + b.backlogs, 0) / Math.max(backlogStats.length, 1)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-3">
          <FilterBar>
            <FilterSelect
              value={year}
              onValueChange={setYear}
              options={academicYearOptions}
              placeholder="Academic Year"
            />
            <span className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Lock className="h-3 w-3" /> Read-only — no operational controls
            </span>
          </FilterBar>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={CalendarDays}
          label="Examinations Scheduled"
          value={`${examSchedules.length}`}
          sub={`AY ${year}`}
          tone="text-blue-600"
          iconBg="bg-blue-50 dark:bg-blue-950/40"
        />
        <StatCard
          icon={FileCheck2}
          label="Results Published"
          value={`${publishedResults.length}`}
          sub={latestPass > 0 ? `Latest: ${latestPass}% pass` : undefined}
          tone="text-emerald-600"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
        />
        <StatCard
          icon={RefreshCcw}
          label="Supplementary Candidates"
          value={`${supplementaryExams.reduce((a, s) => a + s.candidates, 0)}`}
          sub="Last 3 cycles"
          tone="text-amber-600"
          iconBg="bg-amber-50 dark:bg-amber-950/40"
        />
        <StatCard
          icon={ClipboardList}
          label="Avg Backlog Rate"
          value={`${avgBacklog}%`}
          sub="Across departments"
          tone="text-red-600"
          iconBg="bg-red-50 dark:bg-red-950/40"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Examination schedules */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              Examination Schedules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {examSchedules.map(e => (
              <div key={e.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-xs font-medium">{e.exam}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {e.start} → {e.end} • {e.departments} departments
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[9px] ${statusBadge[e.status] ?? statusBadge.Planned}`}
                >
                  {e.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Supplementary examinations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <RefreshCcw className="h-4 w-4 text-amber-500" />
              Supplementary Examinations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {supplementaryExams.map(s => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-xs font-medium">{s.exam}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold">{s.candidates} candidates</p>
                  <p className="text-[10px] text-muted-foreground">Pass {s.passPercentage}%</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Published results */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-emerald-500" />
              Published Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {publishedResults.map(r => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-xs font-medium">{r.exam}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Published {r.published} • {r.departments} departments
                  </p>
                </div>
                <span className="text-sm font-bold text-emerald-600">{r.passPercentage}%</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Backlog statistics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-red-500" />
              Backlog Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {backlogStats.map(b => (
              <div
                key={b.dept}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <span className="text-xs font-medium">{b.dept}</span>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-muted-foreground">Pass {b.pass}%</span>
                  <span
                    className={
                      b.backlogs <= 5
                        ? 'text-xs font-semibold text-emerald-600'
                        : b.backlogs <= 10
                          ? 'text-xs font-semibold text-amber-600'
                          : 'text-xs font-semibold text-red-600'
                    }
                  >
                    {b.backlogs}% backlogs
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

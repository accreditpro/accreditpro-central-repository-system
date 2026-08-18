import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  GraduationCap,
  AlertTriangle,
  ClipboardList,
  FolderCheck,
  CalendarCheck,
  Loader2,
} from 'lucide-react';
import { principalService, DeptAcademicDto } from '@/services/principal.service';
import { StatCard, ScoreCell, ReadinessBar, FilterBar, FilterSelect, SearchInput } from './common';
import { academicYearOptions } from '../principal-data';

export function AcademicPerformance() {
  const [year, setYear] = useState('2025-26');
  const [search, setSearch] = useState('');
  const [data, setData] = useState<{
    departments: DeptAcademicDto[];
    passPercentageTrend: { years: string[]; values: number[] };
    semesterResultsPublishedOnTime: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    principalService
      .getAcademic(year)
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
        Loading academic performance...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <AlertTriangle className="h-5 w-5 mr-2" />
        Unable to load academic data. Please try again.
      </div>
    );
  }

  const deptAcademic = data.departments ?? [];
  const analyticsTrends = data.passPercentageTrend;
  const rows = deptAcademic.filter(d => d.dept.toLowerCase().includes(search.toLowerCase()));

  const avg = (fn: (d: DeptAcademicDto) => number) =>
    Math.round(deptAcademic.reduce((a, d) => a + fn(d), 0) / Math.max(deptAcademic.length, 1));

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
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search department…"
              className="w-52"
            />
            <span className="ml-auto text-[11px] text-muted-foreground">
              Semester results published on time: {data.semesterResultsPublishedOnTime}%
            </span>
          </FilterBar>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard
          icon={GraduationCap}
          label="Avg Pass Percentage"
          value={`${avg(d => d.passPercentage)}%`}
          tone="text-teal-600"
          iconBg="bg-teal-50 dark:bg-teal-950/40"
        />
        <StatCard
          icon={AlertTriangle}
          label="Avg Backlog %"
          value={`${avg(d => d.backlogPercentage)}%`}
          tone="text-red-600"
          iconBg="bg-red-50 dark:bg-red-950/40"
        />
        <StatCard
          icon={ClipboardList}
          label="Semester Results"
          value={`${data.semesterResultsPublishedOnTime}%`}
          sub="Published on time"
          tone="text-blue-600"
          iconBg="bg-blue-50 dark:bg-blue-950/40"
        />
        <StatCard
          icon={FolderCheck}
          label="Course Completion"
          value={`${avg(d => d.courseCompletion)}%`}
          tone="text-emerald-600"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
        />
        <StatCard
          icon={CalendarCheck}
          label="Calendar Completion"
          value={`${avg(d => d.calendarCompletion)}%`}
          tone="text-indigo-600"
          iconBg="bg-indigo-50 dark:bg-indigo-950/40"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Department-wise Academic Performance — {year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-2.5 font-medium text-muted-foreground">Department</th>
                  <th className="text-center p-2.5 font-medium text-teal-600">Pass %</th>
                  <th className="text-center p-2.5 font-medium text-red-600">Backlog %</th>
                  <th className="text-center p-2.5 font-medium text-blue-600">Semester Results</th>
                  <th className="text-left p-2.5 font-medium text-muted-foreground w-40">
                    Course Completion
                  </th>
                  <th className="text-left p-2.5 font-medium text-muted-foreground w-40">
                    Calendar Completion
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(d => (
                  <tr key={d.dept} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="p-2.5 font-medium">{d.dept}</td>
                    <td className="p-2.5 text-center">
                      <ScoreCell value={d.passPercentage} />
                    </td>
                    <td className="p-2.5 text-center">
                      <span
                        className={
                          d.backlogPercentage <= 5
                            ? 'text-emerald-600 font-semibold'
                            : d.backlogPercentage <= 10
                              ? 'text-amber-600 font-semibold'
                              : 'text-red-600 font-semibold'
                        }
                      >
                        {d.backlogPercentage}%
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <ScoreCell value={d.semesterResults} />
                    </td>
                    <td className="p-2.5">
                      <ReadinessBar value={d.courseCompletion} />
                    </td>
                    <td className="p-2.5">
                      <ReadinessBar value={d.calendarCompletion} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Academic Year-wise Pass Percentage Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(analyticsTrends?.years ?? []).map((y, i) => (
              <div key={y} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-16">{y}</span>
                <ReadinessBar value={analyticsTrends.values[i]} />
                <span className="text-xs font-semibold w-10">{analyticsTrends.values[i]}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

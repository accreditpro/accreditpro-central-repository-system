import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { departmentOptions, academicYearOptions, programOptions } from '../principal-data';
import { principalService, DepartmentRepositoryDto } from '@/services/principal.service';
import {
  StatCard,
  StatusBadge,
  ReadinessBar,
  scoreTone,
  statusOf,
  FilterBar,
  FilterSelect,
  SearchInput,
} from './common';

const statusColor = (score: number) =>
  score >= 85
    ? 'bg-emerald-500/15 text-emerald-600'
    : score >= 70
      ? 'bg-amber-500/15 text-amber-600'
      : 'bg-red-500/15 text-red-600';

export function DepartmentPerformance() {
  const [year, setYear] = useState('2025-26');
  const [dept, setDept] = useState('all');
  const [program, setProgram] = useState('all');
  const [search, setSearch] = useState('');
  const [breakdownDept, setBreakdownDept] = useState('CSE');

  const [allDepartments, setAllDepartments] = useState<DepartmentRepositoryDto[]>([]);
  const [filtered, setFiltered] = useState<DepartmentRepositoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Full department list (matrix columns + breakdown chips) — fetched once.
  useEffect(() => {
    let cancelled = false;
    principalService
      .getDepartments()
      .then(data => {
        if (!cancelled) setAllDepartments(data);
      })
      .catch(() => {
        /* matrix falls back to the filtered list */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Server-side filtered list — every filter change triggers a real query.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    principalService
      .getDepartments({
        academicYear: year,
        department: dept === 'all' ? undefined : dept,
        program: program === 'all' ? undefined : program,
        search: search || undefined,
      })
      .then(data => {
        if (!cancelled) setFiltered(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [year, dept, program, search]);

  const departmentRepositories = allDepartments.length > 0 ? allDepartments : filtered;

  const avgReadiness = Math.round(
    filtered.reduce((a, d) => a + d.readiness, 0) / Math.max(filtered.length, 1)
  );
  const best = [...filtered].sort((a, b) => b.readiness - a.readiness)[0];
  const worst = [...filtered].sort((a, b) => a.readiness - b.readiness)[0];

  // Department whose full repository breakdown is shown below.
  const breakdown =
    departmentRepositories.find(d => d.code === breakdownDept) ??
    filtered[0] ??
    departmentRepositories[0];

  const filteredCount = useMemo(() => filtered.length, [filtered]);

  if (loading && departmentRepositories.length === 0) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading department performance...
      </div>
    );
  }

  if (error && departmentRepositories.length === 0) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <AlertTriangle className="h-5 w-5 mr-2" />
        Unable to load department data. Please try again.
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
              value={program}
              onValueChange={setProgram}
              options={programOptions}
              placeholder="Program"
            />
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search department…"
              className="w-52"
            />
            <span className="ml-auto text-[11px] text-muted-foreground">
              AY {year} • {program === 'all' ? 'All programs' : program}
            </span>
          </FilterBar>
        </CardContent>
      </Card>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={Building}
          label="Departments"
          value={`${filteredCount}`}
          sub={`of ${departmentRepositories.length}`}
          tone="text-indigo-600"
          iconBg="bg-indigo-50 dark:bg-indigo-950/40"
        />
        <StatCard
          icon={BarChart3}
          label="Avg Repository Readiness"
          value={`${avgReadiness}%`}
          sub="Across selected"
          tone="text-blue-600"
          iconBg="bg-blue-50 dark:bg-blue-950/40"
        />
        {best && (
          <StatCard
            icon={TrendingUp}
            label="Top Department"
            value={best.code}
            sub={`${best.readiness}% readiness`}
            tone="text-emerald-600"
            iconBg="bg-emerald-50 dark:bg-emerald-950/40"
          />
        )}
        {worst && (
          <StatCard
            icon={TrendingDown}
            label="Needs Attention"
            value={worst.code}
            sub={`${worst.readiness}% readiness`}
            tone="text-red-600"
            iconBg="bg-red-50 dark:bg-red-950/40"
          />
        )}
      </div>

      {/* Repository matrix (all departments) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Repository Readiness Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-2.5 font-medium text-muted-foreground">Repository</th>
                  {departmentRepositories.map(d => (
                    <th key={d.code} className="text-center p-2.5 font-medium">
                      {d.code}
                    </th>
                  ))}
                  <th className="text-center p-2.5 font-medium text-muted-foreground">
                    Institution
                  </th>
                </tr>
              </thead>
              <tbody>
                {(departmentRepositories[0]?.repositories ?? []).map((repoRow, ri) => {
                  const instAvg = Math.round(
                    departmentRepositories.reduce((a, d) => a + d.repositories[ri].completion, 0) /
                      Math.max(departmentRepositories.length, 1)
                  );
                  return (
                    <tr key={repoRow.repo} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="p-2.5 font-medium">{repoRow.repo}</td>
                      {departmentRepositories.map(d => {
                        const cell = d.repositories[ri];
                        return (
                          <td key={d.code} className="p-2.5 text-center">
                            <span
                              className={`inline-block min-w-[52px] rounded-md px-1.5 py-0.5 font-semibold ${statusColor(cell.completion)}`}
                            >
                              {cell.completion}%
                            </span>
                          </td>
                        );
                      })}
                      <td className="p-2.5 text-center font-semibold">{instAvg}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Selected department detail */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold">
              {breakdown?.code ?? '—'} — Repository Breakdown
            </CardTitle>
            <div className="flex flex-wrap items-center gap-1.5">
              {departmentRepositories.map(d => (
                <button
                  key={d.code}
                  onClick={() => setBreakdownDept(d.code)}
                  className={`rounded-md px-2 py-1 text-[10px] font-semibold border transition-colors ${
                    breakdown?.code === d.code
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'text-muted-foreground border-border hover:bg-muted/50'
                  }`}
                >
                  {d.code}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-2.5 font-medium text-muted-foreground">Repository</th>
                  <th className="text-left p-2.5 font-medium text-muted-foreground w-40">
                    Completion
                  </th>
                  <th className="text-center p-2.5 font-medium text-emerald-600">Approved</th>
                  <th className="text-center p-2.5 font-medium text-amber-600">Pending</th>
                  <th className="text-center p-2.5 font-medium text-red-600">Missing</th>
                </tr>
              </thead>
              <tbody>
                {(breakdown?.repositories ?? []).map(r => (
                  <tr key={r.repo} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="p-2.5 font-medium">{r.repo} Repository</td>
                    <td className="p-2.5">
                      <div className="flex items-center gap-2">
                        <ReadinessBar value={r.completion} className="flex-1" />
                        <span className={scoreTone(r.completion)}>{r.completion}%</span>
                      </div>
                    </td>
                    <td className="p-2.5 text-center">{r.approved}%</td>
                    <td className="p-2.5 text-center">{r.pending}%</td>
                    <td className="p-2.5 text-center">{r.missing}%</td>
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

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Database,
  FolderOpen,
  FileText,
  ChevronRight,
  Lock,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { departmentOptions, academicYearOptions } from '../principal-data';
import {
  principalService,
  PrincipalRepositoryReadinessDto,
  DrillDepartmentDto,
} from '@/services/principal.service';
import {
  StatusBadge,
  ReadinessBar,
  scoreTone,
  statusOf,
  FilterBar,
  FilterSelect,
  StatCard,
} from './common';
import { cn } from '@/lib/utils';
import type { StatusLevel } from '../principal-data';

export function RepositoryReadiness() {
  const [year, setYear] = useState('2025-26');
  const [deptFilter, setDeptFilter] = useState('all');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedRepo, setSelectedRepo] = useState('');

  const [data, setData] = useState<PrincipalRepositoryReadinessDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    principalService
      .getRepositoryReadiness(year, deptFilter === 'all' ? undefined : deptFilter)
      .then(response => {
        if (cancelled) return;
        setData(response);
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
  }, [year, deptFilter]);

  // Keep the selection valid against the real department list whenever it changes.
  useEffect(() => {
    if (!data) return;
    const depts = data.departments ?? [];
    setSelectedDept(prev => (depts.some(d => d.code === prev) ? prev : (depts[0]?.code ?? '')));
  }, [data]);

  useEffect(() => {
    if (!data) return;
    const depts = data.departments ?? [];
    const dept = depts.find(d => d.code === selectedDept) ?? depts[0];
    const repos = dept?.repositories ?? [];
    setSelectedRepo(prev => (repos.some(r => r.repo === prev) ? prev : (repos[0]?.repo ?? '')));
  }, [data, selectedDept]);

  const departments: DrillDepartmentDto[] = useMemo(() => data?.departments ?? [], [data]);
  const instAvg = data?.institutionCompletion ?? 0;

  const deptData = useMemo(
    () => departments.find(d => d.code === selectedDept) ?? departments[0],
    [departments, selectedDept]
  );

  const repoCount = departments[0]?.repositories.length ?? 0;
  const evidenceFolders = useMemo(
    () =>
      departments.reduce(
        (sum, d) => sum + d.repositories.reduce((s, r) => s + (r.folders?.length ?? 0), 0),
        0
      ),
    [departments]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading repository readiness...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <AlertTriangle className="h-5 w-5 mr-2" />
        Unable to load repository readiness. Please try again.
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
              value={deptFilter}
              onValueChange={setDeptFilter}
              options={departmentOptions}
              placeholder="Department"
            />
            <span className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Lock className="h-3 w-3" /> Read-only monitoring — no data entry
            </span>
          </FilterBar>
        </CardContent>
      </Card>

      {/* Institution summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={Database}
          label="Institution Completion"
          value={`${instAvg}%`}
          sub={`${departments.length} departments`}
          tone="text-blue-600"
          iconBg="bg-blue-50 dark:bg-blue-950/40"
        />
        <StatCard
          icon={Database}
          label="Departments Visible"
          value={`${departments.length}`}
          sub="Selected filter"
          tone="text-indigo-600"
          iconBg="bg-indigo-50 dark:bg-indigo-950/40"
        />
        <StatCard
          icon={Database}
          label="Repositories Tracked"
          value={`${repoCount}`}
          sub="Per department"
          tone="text-violet-600"
          iconBg="bg-violet-50 dark:bg-violet-950/40"
        />
        <StatCard
          icon={Database}
          label="Evidence Folders"
          value={`${evidenceFolders}`}
          sub="Across repositories"
          tone="text-teal-600"
          iconBg="bg-teal-50 dark:bg-teal-950/40"
        />
      </div>

      {/* Drill-down: Department → Repository → Folder/Documents */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Departments */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">1 · Department</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {departments.map(d => (
              <button
                key={d.code}
                onClick={() => setSelectedDept(d.code)}
                className={cn(
                  'w-full flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-all',
                  selectedDept === d.code ? 'border-primary/40 bg-primary/5' : 'hover:bg-muted/50'
                )}
              >
                <div>
                  <p className="text-xs font-semibold">{d.code}</p>
                  <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                    {d.name}
                  </p>
                </div>
                <span className={scoreTone(d.readiness)}>{d.readiness}%</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Repositories */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              2 · Repository — {deptData?.code ?? '—'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {(deptData?.repositories ?? []).map(r => (
              <button
                key={r.repo}
                onClick={() => setSelectedRepo(r.repo)}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-left transition-all',
                  selectedRepo === r.repo ? 'border-primary/40 bg-primary/5' : 'hover:bg-muted/50'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{r.repo} Repository</span>
                  <span className={scoreTone(r.completion)}>{r.completion}%</span>
                </div>
                <ReadinessBar value={r.completion} className="mt-1.5" />
                <div className="flex items-center gap-2 mt-1.5 text-[9px] text-muted-foreground">
                  <span className="text-emerald-600">Approved {r.approved}%</span>
                  <span className="text-amber-600">Pending {r.pending}%</span>
                  <span className="text-red-600">Missing {r.missing}%</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Folders & Documents */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              3 · Folder / Document — {selectedRepo}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(deptData?.repositories.find(r => r.repo === selectedRepo)?.folders ?? []).map(
              folder => (
                <div key={folder.folder} className="rounded-lg border">
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 rounded-t-lg">
                    <FolderOpen className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs font-medium flex-1">{folder.folder}</span>
                    <Badge variant="outline" className="text-[9px]">
                      {(folder.documents ?? []).length} docs
                    </Badge>
                  </div>
                  <div className="divide-y">
                    {(folder.documents ?? []).map(doc => (
                      <div key={doc.name} className="flex items-center gap-2 px-3 py-1.5">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[11px] flex-1 truncate">{doc.name}</span>
                        <StatusBadge status={(doc.status as StatusLevel) ?? statusOf(70)} />
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
            <div className="flex items-center justify-center gap-1 pt-1 text-[10px] text-muted-foreground">
              <Lock className="h-3 w-3" /> Read-only — current status{' '}
              <ChevronRight className="h-3 w-3" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

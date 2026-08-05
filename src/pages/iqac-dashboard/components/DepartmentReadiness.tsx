import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  FolderOpen,
  FolderTree,
  FileText,
  ChevronRight,
  ArrowLeft,
  Eye,
  Lock,
  Search,
  GraduationCap,
  Users,
  BookOpen,
  FlaskConical,
  Landmark,
  ClipboardList,
  UsersRound,
  Briefcase,
  Database,
} from 'lucide-react';
import {
  departmentRepositoriesForYear,
  drillDownData,
  DEPARTMENT_OPTIONS,
  DEPARTMENT_PROGRAMS,
  YEAR_OPTIONS,
  PROGRAM_OPTIONS,
  REPOSITORY_LIST,
  statusOf,
} from '../iqac-data';
import type { DrillDepartment, DrillFolder, DrillRepository } from '../iqac-data';
import {
  FilterBar,
  FilterSelect,
  SearchInput,
  StatusBadge,
  scoreTone,
} from './common';
import { cn } from '@/lib/utils';

const REPO_HEADER_ICONS: Record<string, React.ElementType> = {
  Academic: GraduationCap,
  Faculty: Users,
  Student: BookOpen,
  Research: FlaskConical,
  Infrastructure: Landmark,
  Examination: ClipboardList,
  Alumni: UsersRound,
  Placement: Briefcase,
};

const EVIDENCE_STATUS_META: Record<DrillFolder['evidence'][number]['status'], { label: string; badge: string; emoji: string }> = {
  approved: { label: 'Approved', badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', emoji: '🟢' },
  uploaded: { label: 'Uploaded', badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20', emoji: '🟡' },
  pending: { label: 'Pending Review', badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20', emoji: '🟡' },
  rejected: { label: 'Rejected', badge: 'bg-red-500/10 text-red-600 border-red-500/20', emoji: '🔴' },
};

export function DepartmentReadiness() {
  const [year, setYear] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [program, setProgram] = useState('all');
  const [search, setSearch] = useState('');

  // Drill-down state (read-only)
  const [drillDept, setDrillDept] = useState<DrillDepartment | null>(null);
  const [drillRepo, setDrillRepo] = useState<DrillRepository | null>(null);
  const [drillFolder, setDrillFolder] = useState<DrillFolder | null>(null);

  // Year-aware department × repository matrix
  const matrix = useMemo(() => departmentRepositoriesForYear(year), [year]);

  const rows = useMemo(
    () =>
      matrix
        .map((dept) => ({
          code: dept.code,
          name: dept.name,
          readiness: dept.readiness,
          status: statusOf(dept.readiness),
          repos: REPOSITORY_LIST.map(
            (repo) => dept.repositories.find((r) => r.repo === repo)?.completion ?? 0
          ),
        }))
        .filter((d) => {
          const matchesDept = deptFilter === 'all' || d.code === deptFilter;
          const matchesProgram =
            program === 'all' || (DEPARTMENT_PROGRAMS[d.code] ?? []).includes(program);
          const matchesSearch =
            !search ||
            d.code.toLowerCase().includes(search.toLowerCase()) ||
            d.name.toLowerCase().includes(search.toLowerCase());
          return matchesDept && matchesProgram && matchesSearch;
        }),
    [matrix, deptFilter, program, search]
  );

  // Reset the drill-down when the data context changes.
  useEffect(() => {
    resetDrill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, deptFilter, program]);

  const openDepartment = (code: string) => {
    const found = drillDownData.find((d) => d.code === code);
    if (!found) return;
    setDrillDept(found);
    setDrillRepo(null);
    setDrillFolder(null);
  };

  const resetDrill = () => {
    setDrillDept(null);
    setDrillRepo(null);
    setDrillFolder(null);
  };

  const folderStatus = (folder: DrillFolder) => {
    const approved = folder.evidence.filter((e) => e.status === 'approved').length;
    return Math.round((approved / Math.max(1, folder.evidence.length)) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Department-wise Repository Readiness</CardTitle>
            <Badge variant="outline" className="text-[9px] gap-1">
              <Eye className="h-3 w-3" /> Read-only — IQAC does not edit departmental data
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <FilterBar>
            <FilterSelect value={year} onValueChange={setYear} options={YEAR_OPTIONS} placeholder="Academic Year" />
            <FilterSelect value={deptFilter} onValueChange={setDeptFilter} options={DEPARTMENT_OPTIONS} placeholder="Department" />
            <FilterSelect value={program} onValueChange={setProgram} options={PROGRAM_OPTIONS} placeholder="Program" />
            <SearchInput value={search} onChange={setSearch} placeholder="Search department…" className="w-52" />
            <span className="ml-auto text-[11px] text-muted-foreground">
              {rows.length} of {matrix.length} departments {year !== 'all' ? `· AY ${year}` : ''}
            </span>
          </FilterBar>

          <div className="rounded-lg border mt-3 overflow-x-auto">
            <table className="w-full text-xs min-w-[980px]">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-2.5 font-medium text-muted-foreground sticky left-0 bg-muted/50">Department</th>
                  {REPOSITORY_LIST.map((repo) => {
                    const Icon = REPO_HEADER_ICONS[repo] ?? Database;
                    return (
                      <th key={repo} className="text-center p-2.5 font-medium text-muted-foreground min-w-[76px]">
                        <span className="flex items-center justify-center gap-1">
                          <Icon className="h-3 w-3" /> {repo}
                        </span>
                      </th>
                    );
                  })}
                  <th className="text-center p-2.5 font-medium text-muted-foreground">Repository Completion</th>
                  <th className="text-center p-2.5 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-2.5 font-medium text-muted-foreground">Drill Down</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr
                    key={d.code}
                    className={cn(
                      'border-b last:border-0 transition-colors',
                      drillDept?.code === d.code ? 'bg-primary/5' : 'hover:bg-muted/40'
                    )}
                  >
                    <td className="p-2.5 font-medium sticky left-0 bg-background">
                      {d.code}
                      <p className="text-[10px] text-muted-foreground">{d.name}</p>
                    </td>
                    {d.repos.map((completion, ci) => (
                      <td key={ci} className="p-2.5 text-center">
                        <span className={cn('font-semibold', scoreTone(completion))}>{completion}%</span>
                        <div className="h-1 w-full rounded-full bg-muted/60 overflow-hidden mt-1">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              completion >= 85 ? 'bg-emerald-500' : completion >= 70 ? 'bg-amber-500' : 'bg-red-500'
                            )}
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                      </td>
                    ))}
                    <td className="p-2.5 text-center">
                      <span className={cn('font-bold', scoreTone(d.readiness))}>{d.readiness}%</span>
                    </td>
                    <td className="p-2.5 text-center">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="p-2.5 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => openDepartment(d.code)}>
                        <FolderTree className="h-3 w-3" />
                        Drill Down
                      </Button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={REPOSITORY_LIST.length + 4} className="p-6 text-center text-muted-foreground text-xs">
                      No departments match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Ready (≥85%)</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Needs Attention (70–84%)</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Critical (&lt;70%)</span>
            <span className="ml-auto">
              Accreditation readiness (NBA / NAAC / NIRF) is available under{' '}
              <span className="font-medium text-primary">Accreditation Readiness</span>.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Drill-down panel */}
      <AnimatePresence>
        {drillDept && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={resetDrill}>
                    <ArrowLeft className="h-3 w-3" /> Back
                  </Button>
                  {/* Breadcrumb */}
                  <div className="flex items-center gap-1.5 text-xs flex-wrap">
                    <span className="flex items-center gap-1 font-semibold">
                      <Building2 className="h-3.5 w-3.5 text-primary" /> {drillDept.code}
                    </span>
                    {drillRepo && (
                      <>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <button
                          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                          onClick={() => { setDrillRepo(null); setDrillFolder(null); }}
                        >
                          <FolderOpen className="h-3 w-3" /> {drillRepo.repository}
                        </button>
                      </>
                    )}
                    {drillFolder && (
                      <>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <button
                          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                          onClick={() => setDrillFolder(null)}
                        >
                          <FolderTree className="h-3 w-3" /> {drillFolder.folder}
                        </button>
                      </>
                    )}
                  </div>
                  <Badge variant="secondary" className="ml-auto text-[9px] gap-1">
                    <Lock className="h-3 w-3" /> Current status (read-only)
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {!drillRepo ? (
                  /* Level 1 — repositories */
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                    {drillDept.repositories.map((repo) => (
                      <button
                        key={repo.repository}
                        onClick={() => { setDrillRepo(repo); setDrillFolder(null); }}
                        className="text-left rounded-xl border p-4 transition-all hover:border-primary/40 hover:shadow-md group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{repo.repository}</span>
                          <StatusBadge status={statusOf(repo.completion)} />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{repo.folders.length} folders</p>
                        <div className="mt-3 flex items-center gap-2">
                          <div className="h-1.5 flex-1 rounded-full bg-muted/60 overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', repo.completion >= 85 ? 'bg-emerald-500' : repo.completion >= 70 ? 'bg-amber-500' : 'bg-red-500')}
                              style={{ width: `${repo.completion}%` }}
                            />
                          </div>
                          <span className={cn('text-xs font-semibold', scoreTone(repo.completion))}>{repo.completion}%</span>
                        </div>
                        <p className="mt-3 text-[10px] text-primary flex items-center gap-1 group-hover:gap-1.5 transition-all">
                          View folders <ChevronRight className="h-3 w-3" />
                        </p>
                      </button>
                    ))}
                  </div>
                ) : !drillFolder ? (
                  /* Level 2 — folders */
                  <div className="space-y-2">
                    {drillRepo.folders.map((folder) => (
                      <button
                        key={folder.folder}
                        onClick={() => setDrillFolder(folder)}
                        className="w-full flex items-center gap-3 rounded-xl border p-3.5 transition-all hover:border-primary/40 hover:shadow-sm group"
                      >
                        <span className="p-2 rounded-lg bg-primary/5">
                          <FolderOpen className="h-4 w-4 text-primary" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold">{folder.folder}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {folder.evidence.length} documents • {folder.evidence.filter((e) => e.status === 'approved').length} approved
                          </p>
                        </div>
                        <div className="w-36">
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-muted-foreground">Status</span>
                            <span className={scoreTone(folderStatus(folder))}>{folderStatus(folder)}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', folderStatus(folder) >= 85 ? 'bg-emerald-500' : folderStatus(folder) >= 70 ? 'bg-amber-500' : 'bg-red-500')}
                              style={{ width: `${folderStatus(folder)}%` }}
                            />
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Level 3 — evidence documents */
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-2.5 font-medium text-muted-foreground">Document</th>
                          <th className="text-center p-2.5 font-medium text-muted-foreground">Type</th>
                          <th className="text-center p-2.5 font-medium text-muted-foreground">Size</th>
                          <th className="text-center p-2.5 font-medium text-muted-foreground">Uploaded By</th>
                          <th className="text-center p-2.5 font-medium text-muted-foreground">Date</th>
                          <th className="text-center p-2.5 font-medium text-muted-foreground">Current Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drillFolder.evidence.map((ev) => {
                          const meta = EVIDENCE_STATUS_META[ev.status];
                          return (
                            <tr key={ev.name} className="border-b last:border-0 hover:bg-muted/40">
                              <td className="p-2.5 font-medium flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                {ev.name}
                              </td>
                              <td className="p-2.5 text-center uppercase text-[10px] text-muted-foreground">{ev.fileType}</td>
                              <td className="p-2.5 text-center text-muted-foreground">{ev.size}</td>
                              <td className="p-2.5 text-center">{ev.uploadedBy}</td>
                              <td className="p-2.5 text-center text-muted-foreground">{ev.date}</td>
                              <td className="p-2.5 text-center">
                                <Badge variant="outline" className={cn('text-[9px] gap-1', meta.badge)}>
                                  {meta.emoji} {meta.label}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground">
        {Object.values(EVIDENCE_STATUS_META).map((meta) => (
          <span key={meta.label} className="flex items-center gap-1">
            {meta.emoji} {meta.label}
          </span>
        ))}
        <span className="ml-auto flex items-center gap-1">
          <Search className="h-3 w-3" /> Drill Down: Department → Repository → Folder → Evidence
        </span>
      </div>
    </div>
  );
}

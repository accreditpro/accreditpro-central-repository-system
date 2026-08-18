import { Fragment, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  Users,
  BookOpen,
  FlaskConical,
  Landmark,
  ClipboardList,
  UsersRound,
  Briefcase,
  Gauge,
  CheckCircle2,
  XCircle,
  FileCheck,
  Database,
  ChevronDown,
  ChevronRight,
  Building2,
  Layers,
  Loader2,
} from 'lucide-react';
import { useAppSelector } from '@/store';
import { iqacService } from '@/services/iqac.service';
import type { InstitutionReadinessDto } from '@/services/iqac.service';
import { statusOf } from '../iqac-data';
import { ReadinessBar, StatusBadge, scoreTone } from './common';
import { cn } from '@/lib/utils';

const REPO_ICONS: Record<string, React.ElementType> = {
  Academic: GraduationCap,
  Faculty: Users,
  Student: BookOpen,
  Research: FlaskConical,
  Infrastructure: Landmark,
  Examination: ClipboardList,
  Alumni: UsersRound,
  Placement: Briefcase,
};

const REPO_TONES: Record<string, { icon: string; bar: string }> = {
  Academic: { icon: 'text-violet-600 bg-violet-500/10', bar: 'bg-violet-500' },
  Faculty: { icon: 'text-indigo-600 bg-indigo-500/10', bar: 'bg-indigo-500' },
  Student: { icon: 'text-emerald-600 bg-emerald-500/10', bar: 'bg-emerald-500' },
  Research: { icon: 'text-pink-600 bg-pink-500/10', bar: 'bg-pink-500' },
  Infrastructure: { icon: 'text-amber-600 bg-amber-500/10', bar: 'bg-amber-500' },
  Examination: { icon: 'text-cyan-600 bg-cyan-500/10', bar: 'bg-cyan-500' },
  Alumni: { icon: 'text-teal-600 bg-teal-500/10', bar: 'bg-teal-500' },
  Placement: { icon: 'text-blue-600 bg-blue-500/10', bar: 'bg-blue-500' },
};

export function InstitutionReadiness() {
  const selectedAcademicYear = useAppSelector((state) => state.ui.selectedAcademicYear);
  const [data, setData] = useState<InstitutionReadinessDto | null>(null);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    iqacService
      .getInstitutionReadiness(selectedAcademicYear)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedAcademicYear]);

  if (!data) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading institution readiness…
      </div>
    );
  }

  const institutionOverall = data.overall;
  const departmentReadinessRows = data.departments ?? [];
  const institutionRepositories = data.repositories ?? [];
  const departmentRepositories = (data.departments ?? []).map((d) => ({
    code: d.code,
    repositories: d.repositories ?? [],
  }));
  const REPOSITORY_LIST = institutionRepositories.map((r) => r.repository);

  return (
    <div className="space-y-6">
      {/* Overall strip */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Gauge className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Institutional Readiness</p>
                <p className="text-[11px] text-muted-foreground">
                  Department-wise readiness, repository-wise breakdown and institutional aggregates
                </p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-5 text-xs">
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">{institutionOverall.repositoryCompletion}%</p>
                <p className="text-[10px] text-muted-foreground">Repository Completion</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-fuchsia-600">{institutionOverall.evidenceCompletion}%</p>
                <p className="text-[10px] text-muted-foreground">Evidence Completion</p>
              </div>
              <StatusBadge status={statusOf(institutionOverall.repositoryCompletion)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department-wise readiness with repository drill-down */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Department-wise Readiness
            </CardTitle>
            <Badge variant="outline" className="text-[9px] gap-1">
              <Layers className="h-3 w-3" /> Expand a department for repository-wise readiness
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[720px]">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="w-8 p-2.5" />
                  <th className="text-left p-2.5 font-medium text-muted-foreground">Department</th>
                  <th className="text-center p-2.5 font-medium text-muted-foreground">Repository Completion</th>
                  <th className="text-center p-2.5 font-medium text-muted-foreground">Repositories Ready</th>
                  <th className="text-center p-2.5 font-medium text-muted-foreground">Weakest Repository</th>
                  <th className="text-center p-2.5 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {departmentReadinessRows.map((dept) => {
                  const repos = departmentRepositories.find((d) => d.code === dept.code)?.repositories ?? [];
                  const readyCount = repos.filter((r) => r.completion >= 85).length;
                  const weakest = [...repos].sort((a, b) => a.completion - b.completion)[0];
                  const isOpen = expandedDept === dept.code;
                  return (
                    <Fragment key={dept.code}>
                      <tr
                        className={cn(
                          'border-b transition-colors cursor-pointer',
                          isOpen ? 'bg-primary/5' : 'hover:bg-muted/40'
                        )}
                        onClick={() => setExpandedDept(isOpen ? null : dept.code)}
                      >
                        <td className="p-2.5 text-center">
                          {isOpen ? (
                            <ChevronDown className="h-3.5 w-3.5 text-primary inline" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground inline" />
                          )}
                        </td>
                        <td className="p-2.5 font-medium">
                          {dept.code}
                          <p className="text-[10px] text-muted-foreground">{dept.name}</p>
                        </td>
                        <td className="p-2.5">
                          <div className="flex items-center gap-2">
                            <ReadinessBar value={dept.repositoryCompletion} className="flex-1" />
                            <span className={cn('font-semibold w-10 text-right', scoreTone(dept.repositoryCompletion))}>
                              {dept.repositoryCompletion}%
                            </span>
                          </div>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="font-semibold text-emerald-600">{readyCount}</span>
                          <span className="text-muted-foreground">/{repos.length}</span>
                        </td>
                        <td className="p-2.5 text-center">
                          {weakest && (
                            <span className="text-muted-foreground">
                              {weakest.repo}
                              <span className={cn(' font-semibold ml-1', scoreTone(weakest.completion))}>{weakest.completion}%</span>
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-center">
                          <StatusBadge status={dept.status} />
                        </td>
                      </tr>
                      {/* Expanded repository-wise breakdown */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.tr
                            key={`${dept.code}-repos`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-b bg-muted/20"
                          >
                            <td colSpan={6} className="p-0">
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-xs font-semibold flex items-center gap-1.5">
                                    <Layers className="h-3.5 w-3.5 text-primary" />
                                    {dept.code} — Repository-wise Readiness
                                  </p>
                                  <Badge variant="secondary" className="text-[9px]">Read-only</Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                                  {repos.map((repo) => {
                                    const Icon = REPO_ICONS[repo.repo] ?? Database;
                                    const tone = REPO_TONES[repo.repo] ?? REPO_TONES.Academic;
                                    return (
                                      <div key={repo.repo} className="rounded-xl border bg-card p-3.5 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <span className={cn('p-1.5 rounded-lg', tone.icon)}>
                                              <Icon className="h-3.5 w-3.5" />
                                            </span>
                                            <span className="text-xs font-semibold">{repo.repo}</span>
                                          </div>
                                          <StatusBadge status={statusOf(repo.completion)} />
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                          <div className="h-1.5 flex-1 rounded-full bg-muted/60 overflow-hidden">
                                            <div
                                              className={cn('h-full rounded-full', tone.bar)}
                                              style={{ width: `${repo.completion}%` }}
                                            />
                                          </div>
                                          <span className={cn('text-xs font-bold', scoreTone(repo.completion))}>{repo.completion}%</span>
                                        </div>
                                        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                                          <div className="rounded-md bg-emerald-500/5 p-1.5">
                                            <p className="text-xs font-bold text-emerald-600">{repo.approved}%</p>
                                            <p className="text-[9px] text-muted-foreground">Approved</p>
                                          </div>
                                          <div className="rounded-md bg-amber-500/5 p-1.5">
                                            <p className="text-xs font-bold text-amber-600">{repo.pending}%</p>
                                            <p className="text-[9px] text-muted-foreground">Pending</p>
                                          </div>
                                          <div className="rounded-md bg-red-500/5 p-1.5">
                                            <p className="text-xs font-bold text-red-600">{repo.missing}%</p>
                                            <p className="text-[9px] text-muted-foreground">Missing</p>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-4 p-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Ready (≥85%)</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Needs Attention (70–84%)</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Critical (&lt;70%)</span>
          </div>
        </CardContent>
      </Card>

      {/* Repository-wise institution summary */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Repository-wise Institution Summary
            </CardTitle>
            <Badge variant="outline" className="text-[9px]">{REPOSITORY_LIST.length} repositories</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {institutionRepositories.map((repo) => {
              const Icon = REPO_ICONS[repo.repository] ?? Database;
              const tone = REPO_TONES[repo.repository] ?? REPO_TONES.Academic;
              return (
                <Card key={repo.repository} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn('p-2 rounded-lg', tone.icon)}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <CardTitle className="text-sm font-semibold">{repo.repository}</CardTitle>
                      </div>
                      <StatusBadge status={repo.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-muted/40 p-2">
                        <p className="text-sm font-bold">{repo.totalRecords.toLocaleString()}</p>
                        <p className="text-[9px] text-muted-foreground">Total Records</p>
                      </div>
                      <div className="rounded-lg bg-emerald-500/5 p-2">
                        <p className="text-sm font-bold text-emerald-600">{repo.approvedRecords.toLocaleString()}</p>
                        <p className="text-[9px] text-muted-foreground">Approved</p>
                      </div>
                      <div className="rounded-lg bg-red-500/5 p-2">
                        <p className="text-sm font-bold text-red-600">{repo.missingRecords.toLocaleString()}</p>
                        <p className="text-[9px] text-muted-foreground">Missing</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <FileCheck className="h-3 w-3" /> Evidence Completion
                          </span>
                          <span className={scoreTone(repo.evidenceCompletion)}>{repo.evidenceCompletion}%</span>
                        </div>
                        <ReadinessBar value={repo.evidenceCompletion} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-muted-foreground">Readiness</span>
                          <span className={cn('font-semibold', scoreTone(repo.readiness))}>{repo.readiness}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                          <div className={cn('h-full rounded-full', tone.bar)} style={{ width: `${repo.readiness}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <Badge variant="secondary" className="text-[9px] gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        {Math.round((repo.approvedRecords / repo.totalRecords) * 100)}% verified
                      </Badge>
                      <Badge variant="secondary" className="text-[9px] gap-1">
                        <XCircle className="h-3 w-3 text-red-500" />
                        {repo.missingRecords.toLocaleString()} pending
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

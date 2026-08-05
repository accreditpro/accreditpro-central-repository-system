import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  Award,
  Trophy,
  BarChart3,
  FolderOpen,
} from 'lucide-react';
import { getHODYearData, GapItem, GapAccreditation } from '../hod-configs';
import { REPO_ICONS, REPO_ACCENT } from './evidence-utils';
import { cn } from '@/lib/utils';

const FRAMEWORK_META: Record<keyof GapAccreditation, { label: string; icon: React.ComponentType<{ className?: string }>; badge: string; border: string; chip: string }> = {
  naac: { label: 'NAAC Impact', icon: Award, badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', border: 'border-l-emerald-500', chip: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' },
  nba: { label: 'NBA Impact', icon: Trophy, badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', border: 'border-l-blue-500', chip: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30' },
  nirf: { label: 'NIRF Impact', icon: BarChart3, badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', border: 'border-l-orange-500', chip: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30' },
};

const REPO_ORDER = ['Academic', 'Course', 'Faculty', 'Student', 'Research', 'Student Dev', 'Infrastructure', 'Alumni'];

interface RepoGapGroup {
  repository: string;
  gaps: GapItem[];
}

/** Group gaps by repository in the same order as Evidence Review / Approval Queue. */
function buildGapGroups(gaps: GapItem[]): RepoGapGroup[] {
  const map = new Map<string, RepoGapGroup>();
  for (const gap of gaps) {
    let group = map.get(gap.repository);
    if (!group) {
      group = { repository: gap.repository, gaps: [] };
      map.set(gap.repository, group);
    }
    group.gaps.push(gap);
  }
  return [...map.values()].sort((a, b) => {
    const ai = REPO_ORDER.indexOf(a.repository);
    const bi = REPO_ORDER.indexOf(b.repository);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

export function GapAnalysis({ academicYear }: { academicYear: string }) {
  const gapAnalysisData = getHODYearData(academicYear).gaps;
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [repositoryFilter, setRepositoryFilter] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredData = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return gapAnalysisData.filter((item) => {
      const accText = item.accreditation
        ? [item.accreditation.naac, item.accreditation.nba, item.accreditation.nirf]
            .map((a) => `${a?.criterion} ${a?.impact}`)
            .join(' ')
        : '';
      const matchesSearch =
        !q ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.repository.toLowerCase().includes(q) ||
        (item.section ?? '').toLowerCase().includes(q) ||
        accText.toLowerCase().includes(q);
      const matchesSeverity = severityFilter === 'all' || item.severity === severityFilter;
      const matchesRepo = repositoryFilter === 'all' || item.repository === repositoryFilter;
      return matchesSearch && matchesSeverity && matchesRepo;
    });
  }, [gapAnalysisData, searchTerm, severityFilter, repositoryFilter]);

  const repoGroups = useMemo(() => buildGapGroups(filteredData), [filteredData]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Critical</Badge>;
      case 'high': return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">High</Badge>;
      case 'medium': return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Medium</Badge>;
      case 'low': return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Low</Badge>;
      default: return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'high': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityBorder = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-amber-500';
      default: return 'border-l-blue-500';
    }
  };

  const criticalCount = gapAnalysisData.filter(g => g.severity === 'critical').length;
  const highCount = gapAnalysisData.filter(g => g.severity === 'high').length;
  const mediumCount = gapAnalysisData.filter(g => g.severity === 'medium').length;
  const lowCount = gapAnalysisData.filter(g => g.severity === 'low').length;
  const reposWithGaps = buildGapGroups(gapAnalysisData).length;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border border-red-200 dark:border-red-900/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Critical</p>
              <p className="text-xl font-bold text-red-600">{criticalCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-orange-200 dark:border-orange-900/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/30">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">High</p>
              <p className="text-xl font-bold text-orange-600">{highCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-amber-200 dark:border-amber-900/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Medium</p>
              <p className="text-xl font-bold text-amber-600">{mediumCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-blue-200 dark:border-blue-900/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <Info className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Low</p>
              <p className="text-xl font-bold text-blue-600">{lowCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search gaps by category, repository, section, or accreditation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={repositoryFilter} onValueChange={setRepositoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Repository" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Repositories</SelectItem>
                  {REPO_ORDER.map((repo) => (
                    <SelectItem key={repo} value={repo}>{repo} Repository</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gaps grouped by repository */}
      <div className="space-y-4">
        {repoGroups.length === 0 && (
          <Card>
            <CardContent className="p-10 text-center">
              <Search className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No gaps match your filters</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Try clearing the search or filters.</p>
            </CardContent>
          </Card>
        )}

        {repoGroups.map((group) => {
          const Icon = REPO_ICONS[group.repository] || FolderOpen;
          const accent = REPO_ACCENT[group.repository] || 'text-primary bg-primary/10 border-primary/30';
          const critical = group.gaps.filter((g) => g.severity === 'critical').length;
          const high = group.gaps.filter((g) => g.severity === 'high').length;

          return (
            <Card key={group.repository} className="border shadow-sm overflow-hidden">
              {/* Repository header */}
              <div className="flex items-center gap-3 p-4 bg-muted/20 border-b border-border/50">
                <div className={cn('h-10 w-10 rounded-xl border flex items-center justify-center shrink-0', accent)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold">{group.repository} Repository</h3>
                    <Badge variant="outline" className="text-[9px]">{group.gaps.length} gap{group.gaps.length !== 1 ? 's' : ''}</Badge>
                    {critical > 0 && <Badge variant="secondary" className="text-[9px] bg-red-500/10 text-red-600">{critical} critical</Badge>}
                    {high > 0 && <Badge variant="secondary" className="text-[9px] bg-orange-500/10 text-orange-600">{high} high</Badge>}
                  </div>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                {group.gaps.map((item: GapItem) => (
                  <div key={item.id} className={cn('border rounded-lg border-l-4 overflow-hidden', getSeverityBorder(item.severity))}>
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleExpand(item.id)}
                    >
                      <div className="flex items-center gap-3">
                        {getSeverityIcon(item.severity)}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{item.category}</span>
                            {getSeverityBadge(item.severity)}
                            <Badge variant="outline" className="text-[10px]">
                              <FolderOpen className="h-2.5 w-2.5 mr-1 text-muted-foreground" />
                              {item.section}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        {expandedItems.has(item.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                    {expandedItems.has(item.id) && (
                      <div className="px-4 pb-4 border-t bg-muted/20">
                        <div className="flex flex-wrap items-center gap-2 pt-3">
                          <div className="flex items-start gap-2 mr-2">
                            <Target className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm max-w-xl">{item.impact}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                          {(Object.keys(FRAMEWORK_META) as Array<keyof GapAccreditation>).map((key) => {
                            const meta = FRAMEWORK_META[key];
                            const acc = item.accreditation?.[key];
                            const IconF = meta.icon;
                            return (
                              <div key={key} className={cn('rounded-lg border border-l-4 bg-card p-3', meta.border)}>
                                <div className="flex items-center gap-1.5">
                                  <IconF className="h-3.5 w-3.5" />
                                  <span className="text-[11px] font-semibold">{meta.label}</span>
                                </div>
                                {acc ? (
                                  <>
                                    <p className="text-[10px] text-muted-foreground mt-1.5">{acc.criterion}</p>
                                    <p className="text-xs mt-1">{acc.impact}</p>
                                  </>
                                ) : (
                                  <p className="text-xs mt-1.5">Not assessed for this gap.</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-start gap-2 mt-3 pt-3 border-t">
                          <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Recommendation</p>
                            <p className="text-sm">{item.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

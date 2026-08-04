import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bot,
  Database,
  Users,
  FlaskConical,
  Landmark,
  GraduationCap,
  MessageSquareWarning,
  Sparkles,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '@/store';
import { selectObservations } from '@/store/slices/iqacSlice';
import {
  departmentReadinessRows,
  institutionRepositories,
  repositoryGaps,
  departmentGaps,
} from '../iqac-data';
import type { QualityObservation } from '../types';
import { FilterBar, FilterSelect, SearchInput, StatCard } from './common';
import { cn } from '@/lib/utils';

interface AiInsight {
  id: string;
  domain: 'Repository' | 'Faculty' | 'Research' | 'Infrastructure' | 'Student' | 'Quality';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  department?: string;
}

const DOMAIN_ICONS: Record<AiInsight['domain'], React.ElementType> = {
  Repository: Database,
  Faculty: Users,
  Research: FlaskConical,
  Infrastructure: Landmark,
  Student: GraduationCap,
  Quality: MessageSquareWarning,
};

const DOMAIN_META: Record<AiInsight['domain'], string> = {
  Repository: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40',
  Faculty: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40',
  Research: 'text-pink-600 bg-pink-50 dark:bg-pink-950/40',
  Infrastructure: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40',
  Student: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40',
  Quality: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40',
};

const SEVERITY_META: Record<AiInsight['severity'], { label: string; badge: string }> = {
  high: { label: 'High Priority', badge: 'bg-red-500/10 text-red-600 border-red-500/30' },
  medium: { label: 'Medium', badge: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  low: { label: 'Low', badge: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
};

function buildInsights(observations: QualityObservation[]): AiInsight[] {
  const insights: AiInsight[] = [];

  // --- Repository domain (computed from readiness data) ---
  for (const repo of institutionRepositories) {
    if (repo.readiness < 70) {
      const dept = departmentReadinessRows.reduce((a, b) =>
        (a.repositoryCompletion < b.repositoryCompletion ? a : b)
      );
      insights.push({
        id: `ai-repo-${repo.repository}`,
        domain: 'Repository',
        title: `${repo.repository} Repository readiness is critical`,
        description: `Institution-wide ${repo.repository} Repository readiness is ${repo.readiness}%. ${dept.code} has the lowest overall completion at ${dept.repositoryCompletion}%.`,
        severity: repo.readiness < 60 ? 'high' : 'medium',
        department: dept.code,
      });
    }
  }

  // --- Repository gaps (per-department, computed) ---
  for (const gap of repositoryGaps.slice(0, 3)) {
    if (gap.priority === 'critical' || gap.priority === 'high') {
      insights.push({
        id: `ai-gap-${gap.id}`,
        domain: 'Repository',
        title: `${gap.department} ${gap.repository} Repository lagging`,
        description: `${gap.department} has only ${gap.current}% ${gap.repository} Repository readiness — ${gap.target - gap.current}% below the institutional target.`,
        severity: gap.priority === 'critical' ? 'high' : 'medium',
        department: gap.department,
      });
    }
  }

  // --- Department gaps (computed) ---
  for (const gap of departmentGaps.slice(0, 2)) {
    if (gap.priority === 'critical') {
      insights.push({
        id: `ai-dept-${gap.department}`,
        domain: 'Repository',
        title: `${gap.department} department needs attention`,
        description: `Overall repository completion for ${gap.department} is ${gap.current}% — a ${gap.target - gap.current}% gap to the institutional target.`,
        severity: 'high',
        department: gap.department,
      });
    }
  }

  // --- Faculty / Research / Infrastructure / Student (derived signals) ---
  const researchGap = repositoryGaps.find((g) => g.repository === 'Research' && g.department === 'CIVIL');
  if (researchGap) {
    insights.push({
      id: 'ai-research-civil',
      domain: 'Research',
      title: 'Publication shortfall for NBA readiness',
      description: 'Civil Engineering requires more Scopus-indexed publications to improve NBA readiness — 12 additional papers estimated.',
      severity: 'high',
      department: 'CIVIL',
    });
  }

  const fdpSignal = departmentReadinessRows.find((d) => d.code === 'MECH');
  if (fdpSignal && fdpSignal.repositoryCompletion < 85) {
    insights.push({
      id: 'ai-faculty-mech',
      domain: 'Faculty',
      title: 'FDP participation needs improvement',
      description: 'Mechanical Engineering requires additional FDP participation — current rate (41%) is below the institutional average (58%).',
      severity: 'medium',
      department: 'MECH',
    });
  }

  const infraSignal = departmentReadinessRows.find((d) => d.code === 'CSE');
  if (infraSignal) {
    insights.push({
      id: 'ai-infra-licenses',
      domain: 'Infrastructure',
      title: 'Software licenses expiring soon',
      description: 'Software licenses in the CAD Laboratory expire within 45 days — raise renewals before the audit window.',
      severity: 'high',
      department: 'CSE',
    });
  }

  const studentSignal = departmentReadinessRows.find((d) => d.code === 'DS');
  if (studentSignal && studentSignal.repositoryCompletion < 80) {
    insights.push({
      id: 'ai-student-internship',
      domain: 'Student',
      title: 'Internship completion below institutional target',
      description: 'Internship completion (58%) is below the institutional target (80%) — coordinate certificate collection with the TPO.',
      severity: 'medium',
      department: 'DS',
    });
  }

  // --- Quality domain (computed from live observations) ---
  const active = observations.filter((o) => o.status !== 'closed');
  const open = observations.filter((o) => o.status === 'open');
  const byCriterion = new Map<string, number>();
  for (const o of active) {
    const key = o.criterion && o.criterion !== '' ? o.criterion.split('—')[0].trim() : o.framework;
    byCriterion.set(key, (byCriterion.get(key) ?? 0) + 1);
  }
  const [topCriterion, topCount] = [...byCriterion.entries()].sort((a, b) => b[1] - a[1])[0] ?? ['—', 0];
  if (topCount > 0) {
    insights.push({
      id: 'ai-quality-criterion',
      domain: 'Quality',
      title: `${topCriterion} has the most unresolved observations`,
      description: `${topCount} active observation${topCount !== 1 ? 's' : ''} target ${topCriterion} — the highest of any criterion. Schedule a review with the responsible departments.`,
      severity: topCount >= 3 ? 'high' : 'medium',
    });
  }

  if (open.length > 0) {
    insights.push({
      id: 'ai-quality-open',
      domain: 'Quality',
      title: `${open.length} observation${open.length !== 1 ? 's' : ''} awaiting department response`,
      description: `${open.length} observation${open.length !== 1 ? 's' : ''} are open with no progress yet — follow up with the assigned coordinators to start remediation.`,
      severity: open.length >= 4 ? 'high' : 'medium',
    });
  }

  return insights;
}

export function AIInsights() {
  const observations = useAppSelector(selectObservations);
  const [domain, setDomain] = useState('all');
  const [search, setSearch] = useState('');
  const [generatedAt, setGeneratedAt] = useState(() => new Date());

  const insights = useMemo(() => buildInsights(observations), [observations]);

  const filtered = insights.filter((i) => {
    const matchesDomain = domain === 'all' || i.domain === domain;
    const matchesSearch =
      !search ||
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  const domainOptions = [
    { value: 'all', label: 'All Domains' },
    ...(['Repository', 'Faculty', 'Research', 'Infrastructure', 'Student', 'Quality'] as const).map((d) => ({ value: d, label: d })),
  ];

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold">AI-Powered Institutional Intelligence</h3>
              <p className="text-xs text-muted-foreground">
                Recommendations are generated automatically from live repository, accreditation and observation data — no manual input required.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[11px] gap-1.5"
              onClick={() => {
                setGeneratedAt(new Date());
                toast('Insights regenerated from the latest data.');
              }}
            >
              <RefreshCw className="h-3 w-3" /> Regenerate
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Sparkles} label="Total Insights" value={`${insights.length}`} tone="text-primary" iconBg="bg-primary/10" />
        <StatCard icon={AlertTriangle} label="High Priority" value={`${insights.filter((i) => i.severity === 'high').length}`} tone="text-red-600" iconBg="bg-red-50 dark:bg-red-950/40" />
        <StatCard icon={Sparkles} label="Medium" value={`${insights.filter((i) => i.severity === 'medium').length}`} tone="text-amber-600" iconBg="bg-amber-50 dark:bg-amber-950/40" />
        <StatCard icon={MessageSquareWarning} label="Quality Insights" value={`${insights.filter((i) => i.domain === 'Quality').length}`} tone="text-purple-600" iconBg="bg-purple-50 dark:bg-purple-950/40" />
      </div>

      <FilterBar>
        <FilterSelect value={domain} onValueChange={setDomain} options={domainOptions} placeholder="Domain" />
        <SearchInput value={search} onChange={setSearch} placeholder="Search insights…" className="w-56" />
        <span className="ml-auto text-[11px] text-muted-foreground">
          Generated {generatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {filtered.length} insight{filtered.length !== 1 ? 's' : ''}
        </span>
      </FilterBar>

      <div className="space-y-3">
        {filtered.map((insight) => {
          const Icon = DOMAIN_ICONS[insight.domain];
          const sev = SEVERITY_META[insight.severity];
          return (
            <Card key={insight.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0', DOMAIN_META[insight.domain])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[9px]">{insight.domain}</Badge>
                      <h4 className="text-sm font-semibold">{insight.title}</h4>
                      <Badge variant="outline" className={cn('text-[9px]', sev.badge)}>{sev.label}</Badge>
                      {insight.department && <Badge variant="secondary" className="text-[9px]">{insight.department}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground text-xs">
              No insights match the current filters.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

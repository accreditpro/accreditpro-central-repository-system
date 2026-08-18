import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Database,
  Trophy,
  Award,
  TrendingUp,
  Users,
  Landmark,
  GraduationCap,
  FlaskConical,
  Briefcase,
  Sparkles,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { principalService, RecommendationDto } from '@/services/principal.service';
import { domainMeta } from '../principal-data';
import { StatCard, FilterBar, FilterSelect } from './common';
import { cn } from '@/lib/utils';

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  Repository: Database,
  NBA: Trophy,
  NAAC: Award,
  NIRF: TrendingUp,
  Faculty: Users,
  Infrastructure: Landmark,
  Student: GraduationCap,
  Research: FlaskConical,
  Placement: Briefcase,
};

const severityMeta: Record<string, { label: string; badge: string }> = {
  high: { label: 'High Priority', badge: 'bg-red-500/10 text-red-600 border-red-500/30' },
  medium: { label: 'Medium', badge: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  low: { label: 'Low', badge: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
};

const domainFilterOptions = [
  { value: 'all', label: 'All Domains' },
  ...(Object.keys(domainMeta) as string[]).map(d => ({ value: d, label: d })),
];

export function AIRecommendations() {
  const [domain, setDomain] = useState('all');
  const [recommendations, setRecommendations] = useState<RecommendationDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    principalService
      .getAiRecommendations({ domain: domain === 'all' ? undefined : domain, page: 0, size: 100 })
      .then(response => {
        if (!cancelled) setRecommendations(response.content ?? []);
      })
      .catch(() => {
        if (!cancelled) setRecommendations([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [domain]);

  const filtered = recommendations;

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
                Insights are generated automatically from repository data — no manual input
                required.
              </p>
            </div>
            <Badge variant="outline" className="text-[10px]">
              Updated 5 min ago
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={Sparkles}
          label="Total Insights"
          value={`${filtered.length}`}
          tone="text-primary"
          iconBg="bg-primary/10"
        />
        <StatCard
          icon={AlertTriangle}
          label="High Priority"
          value={`${filtered.filter(r => r.severity === 'high').length}`}
          tone="text-red-600"
          iconBg="bg-red-50 dark:bg-red-950/40"
        />
        <StatCard
          icon={Sparkles}
          label="Medium"
          value={`${filtered.filter(r => r.severity === 'medium').length}`}
          tone="text-amber-600"
          iconBg="bg-amber-50 dark:bg-amber-950/40"
        />
        <StatCard
          icon={Sparkles}
          label="Low"
          value={`${filtered.filter(r => r.severity === 'low').length}`}
          tone="text-blue-600"
          iconBg="bg-blue-50 dark:bg-blue-950/40"
        />
      </div>

      <FilterBar>
        <FilterSelect
          value={domain}
          onValueChange={setDomain}
          options={domainFilterOptions}
          placeholder="Domain"
        />
        <span className="ml-auto text-[11px] text-muted-foreground">
          {loading
            ? 'Loading…'
            : `Generated automatically • ${filtered.length} insight${filtered.length !== 1 ? 's' : ''}`}
        </span>
      </FilterBar>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading recommendations...
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const Icon = DOMAIN_ICONS[r.domain] ?? Sparkles;
            const sev = severityMeta[r.severity] ?? severityMeta.low;
            const meta = domainMeta[r.domain as keyof typeof domainMeta];
            const color = meta?.color.split(' ')[0] ?? 'text-muted-foreground';
            return (
              <Card key={r.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0',
                        meta?.color
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant="outline" className={cn('text-[9px]', color)}>
                          {r.domain}
                        </Badge>
                        <h4 className="text-sm font-semibold">{r.title}</h4>
                        <Badge variant="outline" className={`text-[9px] ${sev.badge}`}>
                          {sev.label}
                        </Badge>
                        {r.department && (
                          <Badge variant="secondary" className="text-[9px]">
                            {r.department}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {r.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

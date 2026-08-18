import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Award,
  Trophy,
  TrendingUp,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
} from 'lucide-react';
import { ACADEMIC_YEARS, AccreditationFrameworkData } from '../hod-configs';
import { hodService, AccreditationFrameworkDto } from '@/services/hod.service';
import { cn } from '@/lib/utils';

const FRAMEWORK_META: Record<
  AccreditationFrameworkData['id'],
  {
    icon: React.ElementType;
    label: string;
    description: string;
    accent: string;
    softBg: string;
    ring: string;
    bar: string;
    glow: string;
  }
> = {
  naac: {
    icon: Award,
    label: 'NAAC',
    description: 'National Assessment & Accreditation Council',
    accent: 'text-purple-600',
    softBg: 'bg-purple-50 dark:bg-purple-950/40',
    ring: 'text-purple-500',
    bar: 'bg-purple-500',
    glow: 'from-purple-500/[0.07]',
  },
  nba: {
    icon: Trophy,
    label: 'NBA',
    description: 'National Board of Accreditation',
    accent: 'text-amber-600',
    softBg: 'bg-amber-50 dark:bg-amber-950/40',
    ring: 'text-amber-500',
    bar: 'bg-amber-500',
    glow: 'from-amber-500/[0.07]',
  },
  nirf: {
    icon: TrendingUp,
    label: 'NIRF',
    description: 'National Institutional Ranking Framework',
    accent: 'text-emerald-600',
    softBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    ring: 'text-emerald-500',
    bar: 'bg-emerald-500',
    glow: 'from-emerald-500/[0.07]',
  },
};

const STATUS_META: Record<AccreditationFrameworkData['status'], { label: string; badge: string }> = {
  ready: { label: 'On Track', badge: 'bg-emerald-500/10 text-emerald-600' },
  'in-progress': { label: 'In Progress', badge: 'bg-amber-500/10 text-amber-600' },
  'not-started': { label: 'Needs Attention', badge: 'bg-red-500/10 text-red-600' },
};

function ReadinessGauge({ value, ringClass }: { value: number; ringClass: string }) {
  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/20" />
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          className={ringClass}
          strokeDasharray={`${value * 3.14} 314`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold leading-none">{value}%</span>
      </div>
    </div>
  );
}

interface AccreditationReadinessProps {
  academicYear: string;
  /** Real accreditation data from the dashboard API (optional — falls back to mock). */
  frameworks?: AccreditationFrameworkDto[];
}

export function AccreditationReadiness({ academicYear, frameworks }: AccreditationReadinessProps) {
  const [previousFrameworks, setPreviousFrameworks] = useState<AccreditationFrameworkDto[] | undefined>(undefined);

  const accreditation: AccreditationFrameworkDto[] = frameworks ?? [];

  // Previous academic year (used to show YoY movement) — fetched from the API.
  const yearIndex = ACADEMIC_YEARS.indexOf(academicYear);
  const previousYear =
    yearIndex >= 0 && yearIndex < ACADEMIC_YEARS.length - 1 ? ACADEMIC_YEARS[yearIndex + 1] : undefined;

  useEffect(() => {
    if (!previousYear) {
      setPreviousFrameworks(undefined);
      return;
    }
    let cancelled = false;
    hodService
      .getDashboard(previousYear)
      .then((data) => {
        if (!cancelled) setPreviousFrameworks(data.accreditation);
      })
      .catch(() => {
        if (!cancelled) setPreviousFrameworks(undefined);
      });
    return () => {
      cancelled = true;
    };
  }, [previousYear]);

  const previous = previousFrameworks;

  const getDelta = (id: AccreditationFrameworkData['id']): number | null => {
    const prev = previous?.find((f) => f.id === id);
    const current = accreditation.find((f) => f.id === id);
    if (!prev || !current) return null;
    return current.readiness - prev.readiness;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Accreditation Readiness</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                NAAC, NBA &amp; NIRF framework readiness derived from repository completion
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px]">AY {academicYear}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Framework summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accreditation.map((framework) => {
            const meta = FRAMEWORK_META[framework.id];
            const status = STATUS_META[framework.status];
            const delta = getDelta(framework.id);
            return (
              <div key={framework.id} className="relative overflow-hidden rounded-xl border p-4 hover:shadow-md transition-shadow">
                <div
                  className={cn(
                    'pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent',
                    meta.glow
                  )}
                />
                <div className="relative flex items-center gap-4">
                  <ReadinessGauge value={framework.readiness} ringClass={meta.ring} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`p-1.5 rounded-lg ${meta.softBg}`}>
                        <meta.icon className={`h-3.5 w-3.5 ${meta.accent}`} />
                      </span>
                      <span className="text-sm font-bold">{meta.label} Readiness</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2">{meta.description}</p>
                    <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                      <Badge className={cn('text-[9px] h-4 px-1.5', status.badge)}>{status.label}</Badge>
                      {delta !== null && previousYear && (
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[9px] h-4 px-1.5 gap-0.5',
                            delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-600' : 'text-muted-foreground'
                          )}
                        >
                          {delta > 0 ? (
                            <ArrowUpRight className="h-2.5 w-2.5" />
                          ) : delta < 0 ? (
                            <ArrowDownRight className="h-2.5 w-2.5" />
                          ) : (
                            <Minus className="h-2.5 w-2.5" />
                          )}
                          {delta > 0 ? '+' : ''}{delta}% vs {previousYear}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Criterion-wise breakdown */}
        {accreditation.length > 0 && (
          <Tabs defaultValue="naac">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <TabsList className="h-9">
                {accreditation.map((f) => {
                  const meta = FRAMEWORK_META[f.id];
                  return (
                    <TabsTrigger key={f.id} value={f.id} className="text-xs gap-1.5 px-3">
                      <meta.icon className={cn('h-3.5 w-3.5', meta.accent)} />
                      {f.name}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              <span className="text-[11px] text-muted-foreground">
                Weighted across {accreditation[0]?.criteria.length ?? 0} criteria per framework
              </span>
            </div>

            {accreditation.map((f) => {
              const meta = FRAMEWORK_META[f.id];
              return (
                <TabsContent key={f.id} value={f.id} className="mt-4">
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-lg ${meta.softBg}`}>
                          <meta.icon className={`h-3.5 w-3.5 ${meta.accent}`} />
                        </span>
                        <span className="text-sm font-semibold">{f.name} Criterion-wise Readiness</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Sparkles className={cn('h-3 w-3', meta.accent)} />
                        <span>
                          Overall{' '}
                          <span className={`font-bold text-sm ${meta.accent}`}>{f.readiness}%</span>
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-4">
                      {f.criteria.map((c) => (
                        <div key={c.name}>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs font-medium truncate">{c.name}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant="outline" className="text-[9px] h-4 px-1.5 text-muted-foreground">
                                W {c.weightage}
                              </Badge>
                              <span className="text-xs font-semibold w-9 text-right">{c.completion}%</span>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                            <div
                              className={cn('h-full rounded-full transition-all duration-500', meta.bar)}
                              style={{ width: `${c.completion}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

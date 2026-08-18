import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquareWarning, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store';
import { selectVerificationObservations } from '@/store/slices/iqacVerificationSlice';
import { useAuth } from '@/hooks/useAuth';
import { PRIORITY_META } from '@/pages/iqac-dashboard/components/common';
import { resolveDepartmentCode } from '@/pages/iqac-dashboard/components/verification/verification-utils';
import type { EvidenceObservation } from '@/pages/iqac-dashboard/verification-data';
import type { EvidenceObservationDto } from '@/services/hod.service';

const STATUS_META: Record<EvidenceObservation['status'], { label: string; badge: string }> = {
  open: { label: 'Open', badge: 'bg-red-500/10 text-red-600 border-red-500/25' },
  'in-progress': { label: 'In Progress', badge: 'bg-amber-500/10 text-amber-600 border-amber-500/25' },
  resolved: { label: 'Resolved', badge: 'bg-blue-500/10 text-blue-600 border-blue-500/25' },
  verified: { label: 'Verified', badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25' },
};

interface IQACObservationsWidgetProps {
  /** Real observations from the dashboard API (optional — falls back to the IQAC store). */
  observations?: EvidenceObservationDto[];
}

export function IQACObservationsWidget({ observations: apiObservations }: IQACObservationsWidgetProps) {
  const { user } = useAuth();
  const storeObservations = useAppSelector(selectVerificationObservations);

  // API-backed observations win; the local IQAC store is the fallback when the
  // backend returns none (e.g. no observations raised yet).
  const observations = useMemo((): EvidenceObservation[] => {
    if (apiObservations && apiObservations.length > 0) {
      return apiObservations.map((o) => ({
        id: o.id,
        documentId: o.documentId ?? '',
        documentName: o.documentName ?? o.title,
        title: o.title,
        description: o.description ?? '',
        repository: o.repository ?? '',
        folder: o.folder ?? '',
        category: o.category ?? '',
        department: o.department ?? '',
        priority: o.priority as EvidenceObservation['priority'],
        status: o.status as EvidenceObservation['status'],
        dueDate: o.dueDate,
        recommendedCorrection: o.recommendedCorrection ?? '',
        raisedBy: o.raisedBy ?? 'IQAC',
        raisedAt: o.raisedAt ?? new Date().toISOString(),
      }));
    }
    return storeObservations;
  }, [apiObservations, storeObservations]);

  const dept = useMemo(
    () => resolveDepartmentCode(user?.department ?? '', observations[0]?.department ?? 'CSE'),
    [user, observations]
  );
  const deptObservations = observations
    .filter((o) => o.department === dept)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const active = deptObservations.filter((o) => o.status !== 'verified');

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MessageSquareWarning className="h-4 w-4 text-orange-500" />
            Department Quality Observations
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">{dept}</Badge>
            <Badge
              className={cn(
                'text-[10px]',
                active.length > 0 ? 'bg-red-500/10 text-red-600' : 'bg-emerald-500/10 text-emerald-600'
              )}
            >
              {active.length} pending
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {deptObservations.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No IQAC observations raised for this department yet.
          </p>
        )}
        {deptObservations.slice(0, 5).map((obs) => {
          const priority = PRIORITY_META[obs.priority] ?? { label: obs.priority, badge: 'bg-muted text-muted-foreground' };
          const status = STATUS_META[obs.status] ?? { label: obs.status, badge: 'bg-muted text-muted-foreground' };
          const isOverdue = obs.status !== 'verified' && obs.dueDate < new Date().toISOString().slice(0, 10);
          return (
            <div key={obs.id} className="rounded-lg border p-3 hover:border-orange-500/30 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{obs.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {obs.repository}
                    {obs.faculty ? ` · ${obs.faculty}` : obs.student ? ` · ${obs.student}` : ''}
                  </p>
                </div>
                <Badge variant="outline" className={cn('text-[9px] h-5 shrink-0', priority.badge)}>
                  {priority.label}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline" className={cn('text-[9px] h-5', status.badge)}>{status.label}</Badge>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Due {obs.dueDate}
                </span>
                {isOverdue && (
                  <Badge variant="outline" className="text-[9px] h-5 bg-red-500/10 text-red-600 border-red-500/25">
                    Overdue
                  </Badge>
                )}
                {obs.status !== 'verified' && (
                  <span className="ml-auto text-[10px] text-muted-foreground italic truncate max-w-[220px]">
                    Pending correction: {obs.recommendedCorrection}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {deptObservations.length > 5 && (
          <p className="text-[11px] text-muted-foreground text-center">
            +{deptObservations.length - 5} more — observations are managed by the IQAC in the Evidence Verification module.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

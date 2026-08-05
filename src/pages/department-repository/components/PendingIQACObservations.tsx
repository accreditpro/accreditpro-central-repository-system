import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquareWarning, Calendar, PlayCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectVerificationObservations, updateObservationStatus } from '@/store/slices/iqacVerificationSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { useReadOnly } from '@/hooks/useReadOnly';
import { toast } from 'sonner';
import { departmentInfo } from '../repository-configs';
import { PRIORITY_META } from '@/pages/iqac-dashboard/components/common';
import { resolveDepartmentCode as resolveDept } from '@/pages/iqac-dashboard/components/verification/verification-utils';
import type { EvidenceObservation } from '@/pages/iqac-dashboard/verification-data';

// Map the coordinator's department name (repository-configs) to the verification
// module department code. Defaults to the first department with observations.
function resolveDepartmentCode(observations: EvidenceObservation[]): string {
  return resolveDept(departmentInfo.department, observations[0]?.department ?? 'CSE');
}

export function PendingIQACObservations() {
  const isReadOnly = useReadOnly();
  const dispatch = useAppDispatch();
  const observations = useAppSelector(selectVerificationObservations);

  const dept = useMemo(() => resolveDepartmentCode(observations), [observations]);
  const deptObservations = observations
    .filter((o) => o.department === dept && o.status !== 'verified')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const handleRespond = (obs: EvidenceObservation, status: 'in-progress' | 'resolved') => {
    dispatch(
      updateObservationStatus({
        id: obs.id,
        status,
        response:
          status === 'in-progress'
            ? 'Department is working on the correction.'
            : 'Corrected evidence uploaded and forwarded for HOD re-approval.',
      })
    );
    dispatch(
      addNotification({
        title: status === 'resolved' ? 'Evidence resubmitted' : 'Observation in progress',
        message: `Updated observation on "${obs.documentName}" — ${status}.`,
        type: 'success',
        read: false,
      })
    );
    toast.success(status === 'resolved' ? 'Evidence marked resolved — HOD notified for re-approval' : 'Observation marked in progress');
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MessageSquareWarning className="h-4 w-4 text-orange-500" />
            My Pending IQAC Observations
          </CardTitle>
          <Badge
            className={cn(
              'text-[10px]',
              deptObservations.length > 0 ? 'bg-orange-500/10 text-orange-600' : 'bg-emerald-500/10 text-emerald-600'
            )}
          >
            {deptObservations.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {deptObservations.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No pending IQAC observations. Evidence flagged by the IQAC will appear here for you to correct and resubmit.
          </p>
        )}
        {deptObservations.map((obs) => {
          const priority = PRIORITY_META[obs.priority];
          const isOverdue = obs.dueDate < new Date().toISOString().slice(0, 10);
          return (
            <div key={obs.id} className="rounded-lg border p-3 hover:border-orange-500/30 hover:shadow-sm transition-all">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{obs.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {obs.repository} · {obs.folder}
                    {obs.faculty ? ` · ${obs.faculty}` : obs.student ? ` · ${obs.student}` : ''}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1.5">{obs.recommendedCorrection}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Badge variant="outline" className={cn('text-[9px] h-5', priority.badge)}>{priority.label}</Badge>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Due {obs.dueDate}
                  </span>
                  {isOverdue && (
                    <Badge variant="outline" className="text-[9px] h-5 bg-red-500/10 text-red-600 border-red-500/25">
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>
              {!isReadOnly && (
                <div className="flex gap-2 mt-2.5">
                  {obs.status === 'open' && (
                    <Button size="sm" variant="outline" className="h-8 text-[11px] gap-1.5" onClick={() => handleRespond(obs, 'in-progress')}>
                      <PlayCircle className="h-3.5 w-3.5" />
                      Start Working
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className={cn('h-8 text-[11px] gap-1.5', obs.status === 'resolved' && 'bg-blue-600 hover:bg-blue-700')}
                    onClick={() => handleRespond(obs, 'resolved')}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {obs.status === 'resolved' ? 'Mark Resolved (Re-submit)' : 'Mark Resolved'}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

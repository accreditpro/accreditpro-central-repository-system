import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppDispatch } from '@/store';
import { markObservationVerified } from '@/store/slices/iqacVerificationSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { iqacService } from '@/services/iqac.service';
import { useReadOnly } from '@/hooks/useReadOnly';
import { toast } from 'sonner';
import { MessageSquareWarning, CheckCircle2, Calendar, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVerificationDocuments } from './useVerificationDocuments';
import { PRIORITY_META } from '../common';
import type { EvidenceObservation, EvidenceObservationStatus } from '../../verification-data';

const STATUS_ORDER: EvidenceObservationStatus[] = ['open', 'in-progress', 'resolved', 'verified'];

const STATUS_META: Record<EvidenceObservationStatus, { label: string; badge: string; dot: string }> = {
  open: { label: 'Open', badge: 'bg-red-500/10 text-red-600 border-red-500/25', dot: 'bg-red-500' },
  'in-progress': { label: 'In Progress', badge: 'bg-amber-500/10 text-amber-600 border-amber-500/25', dot: 'bg-amber-500' },
  resolved: { label: 'Resolved', badge: 'bg-blue-500/10 text-blue-600 border-blue-500/25', dot: 'bg-blue-500' },
  verified: { label: 'Verified', badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25', dot: 'bg-emerald-500' },
};

export function VerificationObservationsView() {
  const isReadOnly = useReadOnly();
  const dispatch = useAppDispatch();
  const { observations } = useVerificationDocuments();
  const [statusFilter, setStatusFilter] = useState<'all' | EvidenceObservationStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filtered = useMemo(() => {
    return observations
      .filter((o) => (statusFilter === 'all' ? true : o.status === statusFilter))
      .filter((o) => (priorityFilter === 'all' ? true : o.priority === priorityFilter))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [observations, statusFilter, priorityFilter]);

  const counts = {
    open: observations.filter((o) => o.status === 'open').length,
    'in-progress': observations.filter((o) => o.status === 'in-progress').length,
    resolved: observations.filter((o) => o.status === 'resolved').length,
    verified: observations.filter((o) => o.status === 'verified').length,
  };

  const handleVerify = async (obs: EvidenceObservation) => {
    if (obs.status !== 'resolved') {
      toast.info('Observation must be resolved by the department before it can be verified.');
      return;
    }
    try {
      await iqacService.verifyObservation(obs.id);
      // Optimistic local overlay — the observation list reflects the change immediately.
      dispatch(markObservationVerified({ id: obs.id }));
      dispatch(
        addNotification({
          title: 'Observation verified',
          message: `Observation on "${obs.documentName}" verified and closed.`,
          type: 'success',
          read: false,
        })
      );
      toast.success('Observation verified — document marked as verified');
    } catch {
      toast.error('Failed to verify the observation. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Workflow strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATUS_ORDER.map((s, i) => (
          <div key={s} className="flex items-center gap-2 rounded-xl border bg-card p-3.5">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className={cn('h-2 w-2 rounded-full shrink-0', STATUS_META[s].dot)} />
              <p className="text-[11px] font-medium truncate">{STATUS_META[s].label}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold">{counts[s]}</span>
              {i < STATUS_ORDER.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/50" />}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="h-8 w-[170px] text-xs">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
            {STATUS_ORDER.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">{STATUS_META[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="h-8 w-[160px] text-xs">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Priorities</SelectItem>
            {(['low', 'medium', 'high', 'critical'] as const).map((p) => (
              <SelectItem key={p} value={p} className="text-xs capitalize">{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground ml-auto">{filtered.length} observation{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Observation list */}
      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquareWarning className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No observations match the current filters.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {filtered.map((obs) => {
          const meta = STATUS_META[obs.status];
          const priority = PRIORITY_META[obs.priority];
          const isOverdue = obs.status !== 'verified' && obs.dueDate < new Date().toISOString().slice(0, 10);
          return (
            <Card key={obs.id} className={cn('hover:shadow-md transition-shadow', isOverdue && 'border-red-500/30')}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                    <MessageSquareWarning className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{obs.title}</p>
                      <Badge variant="outline" className={cn('text-[9px] h-5', priority.badge)}>{priority.label}</Badge>
                      <Badge variant="outline" className={cn('text-[9px] h-5', meta.badge)}>{meta.label}</Badge>
                      {isOverdue && (
                        <Badge variant="outline" className="text-[9px] h-5 bg-red-500/10 text-red-600 border-red-500/25">
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {obs.department} · {obs.repository} · {obs.folder}
                      {obs.faculty ? ` · ${obs.faculty}` : obs.student ? ` · ${obs.student}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5">{obs.description}</p>
                    <div className="mt-2 rounded-lg bg-muted/40 p-2.5 text-[11px]">
                      <span className="font-medium">Recommended correction: </span>
                      <span className="text-muted-foreground">{obs.recommendedCorrection}</span>
                    </div>
                    {obs.response && (
                      <div className="mt-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-2.5 text-[11px]">
                        <span className="font-medium text-blue-700 dark:text-blue-300">Department response: </span>
                        <span className="text-muted-foreground">{obs.response} {obs.respondedAt ? `(${obs.respondedAt})` : ''}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Due {obs.dueDate}
                    </div>
                    <p className="text-[10px] text-muted-foreground">Raised by {obs.raisedBy} · {obs.raisedAt}</p>
                    {!isReadOnly && obs.status === 'resolved' && (
                      <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => handleVerify(obs)}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Verify
                      </Button>
                    )}
                    {!isReadOnly && obs.status !== 'resolved' && obs.status !== 'verified' && (
                      <span className="text-[10px] text-muted-foreground italic">
                        Waiting for department to resolve
                      </span>
                    )}
                    {obs.status === 'verified' && (
                      <span className="text-[10px] text-emerald-600 font-medium">
                        Verified {obs.verifiedAt ? `on ${obs.verifiedAt}` : ''}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

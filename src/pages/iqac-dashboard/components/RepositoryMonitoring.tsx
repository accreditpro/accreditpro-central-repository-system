import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Database,
  UploadCloud,
  XCircle,
  CheckSquare,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Loader2,
} from 'lucide-react';
import { iqacService } from '@/services/iqac.service';
import type { RepositoryMonitoringDto } from '@/services/iqac.service';
import { statusOf } from '../iqac-data';
import { FilterBar, FilterSelect, ReadinessBar, StatusBadge, scoreTone } from './common';
import { cn } from '@/lib/utils';

const REPO_STATUS_OPTIONS = [
  { value: 'all', label: 'All Repositories' },
  { value: 'ready', label: 'Ready' },
  { value: 'attention', label: 'Needs Attention' },
  { value: 'critical', label: 'Critical' },
];

export function RepositoryMonitoring() {
  const [filter, setFilter] = useState('all');
  const [repositoryMonitoringRows, setRepositoryMonitoringRows] = useState<RepositoryMonitoringDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    iqacService
      .getRepositoryMonitoring()
      .then((rows) => {
        if (!cancelled) setRepositoryMonitoringRows(rows ?? []);
      })
      .catch(() => {
        if (!cancelled) setRepositoryMonitoringRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows =
    filter === 'all'
      ? repositoryMonitoringRows
      : repositoryMonitoringRows.filter((r) => statusOf(r.completion) === filter);

  const highlighted = repositoryMonitoringRows.filter((r) => {
    const st = statusOf(r.completion);
    return st === 'critical' || r.missingEvidence > 60 || r.pendingHodApproval > 25;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading repository monitoring…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertOctagon className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                {repositoryMonitoringRows.filter((r) => statusOf(r.completion) === 'critical').length} critical repository{repositoryMonitoringRows.filter((r) => statusOf(r.completion) === 'critical').length !== 1 ? 'ies' : ''}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {repositoryMonitoringRows.filter((r) => statusOf(r.completion) === 'critical').map((r) => r.repository).join(', ') || 'None'} below 70% completion — immediate action required.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                {repositoryMonitoringRows.filter((r) => statusOf(r.completion) === 'attention').length} repositories need attention
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Between 70–84% completion. Missing mandatory evidence and pending HOD approvals are slowing readiness.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">Monitoring scope</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Repository completion aggregates all departments. IQAC monitors — it never uploads or approves records.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monitoring table */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Repository Completion Monitoring
            </CardTitle>
            <FilterBar>
              <FilterSelect value={filter} onValueChange={setFilter} options={REPO_STATUS_OPTIONS} placeholder="Status" />
            </FilterBar>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs min-w-[760px]">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-2.5 font-medium text-muted-foreground">Repository</th>
                <th className="text-right p-2.5 font-medium text-muted-foreground">Total Records</th>
                <th className="text-right p-2.5 font-medium text-amber-600">Pending Uploads</th>
                <th className="text-right p-2.5 font-medium text-red-600">Missing Evidence</th>
                <th className="text-right p-2.5 font-medium text-orange-600">Pending HOD Approval</th>
                <th className="text-right p-2.5 font-medium text-emerald-600">Approved Records</th>
                <th className="text-center p-2.5 font-medium text-muted-foreground w-48">Completion %</th>
                <th className="text-center p-2.5 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const isCritical = statusOf(r.completion) === 'critical';
                const isAttention = statusOf(r.completion) === 'attention';
                return (
                  <tr
                    key={r.repository}
                    className={cn(
                      'border-b last:border-0 transition-colors',
                      isCritical ? 'bg-red-500/[0.03] hover:bg-red-500/[0.06]' : isAttention ? 'bg-amber-500/[0.03] hover:bg-amber-500/[0.06]' : 'hover:bg-muted/40'
                    )}
                  >
                    <td className="p-2.5 font-semibold">{r.repository}</td>
                    <td className="p-2.5 text-right font-medium">{r.totalRecords.toLocaleString()}</td>
                    <td className="p-2.5 text-right">
                      <span className="flex items-center justify-end gap-1 text-amber-600">
                        <UploadCloud className="h-3 w-3" /> {r.pendingUploads.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <span className={cn('flex items-center justify-end gap-1', r.missingEvidence > 60 ? 'font-semibold text-red-600' : 'text-red-500')}>
                        <XCircle className="h-3 w-3" /> {r.missingEvidence.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <span className="flex items-center justify-end gap-1 text-orange-600">
                        <CheckSquare className="h-3 w-3" /> {r.pendingHodApproval.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <span className="flex items-center justify-end gap-1 text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" /> {r.approvedRecords.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <div className="flex items-center gap-2">
                        <ReadinessBar value={r.completion} className="flex-1" />
                        <span className={cn('font-semibold w-10 text-right', scoreTone(r.completion))}>{r.completion}%</span>
                      </div>
                    </td>
                    <td className="p-2.5 text-center">
                      <StatusBadge status={statusOf(r.completion)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Missing mandatory evidence / critical completion</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Incomplete repository (70–84%)</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> On track (≥85%)</span>
            {highlighted.length > 0 && (
              <span className="ml-auto flex items-center gap-1 text-amber-600">
                <AlertTriangle className="h-3 w-3" /> {highlighted.length} repositories flagged
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

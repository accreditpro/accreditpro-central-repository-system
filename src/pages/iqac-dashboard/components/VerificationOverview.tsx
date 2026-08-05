import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShieldCheck, CheckCircle2, MessageSquareWarning, AlertTriangle, ChevronRight, History } from 'lucide-react';
import { useVerificationDocuments } from './verification/useVerificationDocuments';
import { summarizeVerification } from '../verification-data';
import { PRIORITY_META } from './common';

export function VerificationOverview() {
  const navigate = useNavigate();
  const { documents, observations } = useVerificationDocuments();
  const summary = summarizeVerification(documents, observations);

  const cards = [
    { label: 'Pending Verification', value: summary.approvedNotVerified, icon: ShieldCheck, cls: 'text-blue-600 bg-blue-500/10', link: 'pending-verification' },
    { label: 'Verified Documents', value: summary.verified, icon: CheckCircle2, cls: 'text-emerald-600 bg-emerald-500/10', link: 'verified-documents' },
    { label: 'Open Observations', value: summary.openObservations, icon: MessageSquareWarning, cls: 'text-orange-600 bg-orange-500/10', link: 'verification-observations' },
    { label: 'Critical Observations', value: summary.criticalObservations, icon: AlertTriangle, cls: 'text-red-600 bg-red-500/10', link: 'verification-observations' },
  ];

  const recentActivity = [
    ...observations
      .filter((o) => o.status === 'verified')
      .map((o) => ({ text: `Observation verified — ${o.documentName}`, type: 'verified' as const, at: o.verifiedAt ?? o.raisedAt })),
    ...observations
      .filter((o) => o.status === 'resolved')
      .map((o) => ({ text: `Department resolved — ${o.documentName}`, type: 'resolved' as const, at: o.respondedAt ?? o.raisedAt })),
    ...documents
      .filter((d) => d.iqacStatus === 'verified')
      .slice(0, 4)
      .map((d) => ({ text: `Verified — ${d.name} (${d.department})`, type: 'verified' as const, at: d.verifiedAt ?? '' })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 6);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Evidence Verification
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/app/iqac-dashboard?view=verification')}>
            Open Repository Verification <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {cards.map((c) => (
            <button
              key={c.label}
              className="text-left rounded-xl border bg-muted/20 p-3.5 hover:border-primary/30 hover:shadow-sm transition-all"
              onClick={() => navigate(`/app/iqac-dashboard?view=${c.link}`)}
            >
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg mb-2', c.cls)}>
                <c.icon className="h-4 w-4" />
              </div>
              <p className="text-xl font-bold leading-tight">{c.value}</p>
              <p className="text-[11px] text-muted-foreground">{c.label}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Department-wise verification */}
          <div className="rounded-xl border p-3.5">
            <p className="text-xs font-semibold mb-2.5">Department-wise Verification</p>
            <div className="space-y-2">
              {summary.departmentWise.slice(0, 6).map((d) => {
                const pct = d.total ? Math.round((d.verified / d.total) * 100) : 0;
                return (
                  <div key={d.department} className="flex items-center gap-2">
                    <span className="text-[11px] font-medium w-12 shrink-0">{d.department}</span>
                    <div className="h-1.5 flex-1 rounded-full bg-muted/60 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', pct >= 60 ? 'bg-emerald-500' : pct >= 30 ? 'bg-amber-500' : 'bg-red-500')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-14 text-right">{d.verified}/{d.total}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Repository-wise verification */}
          <div className="rounded-xl border p-3.5">
            <p className="text-xs font-semibold mb-2.5">Repository-wise Verification</p>
            <div className="space-y-2">
              {summary.repositoryWise.slice(0, 7).map((r) => {
                const pct = r.total ? Math.round((r.verified / r.total) * 100) : 0;
                return (
                  <div key={r.repository} className="flex items-center gap-2">
                    <span className="text-[11px] font-medium w-24 truncate shrink-0">{r.repository}</span>
                    <div className="h-1.5 flex-1 rounded-full bg-muted/60 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', pct >= 60 ? 'bg-emerald-500' : pct >= 30 ? 'bg-amber-500' : 'bg-red-500')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-14 text-right">{r.verified}/{r.total}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent verification activity */}
          <div className="rounded-xl border p-3.5">
            <p className="text-xs font-semibold mb-2.5 flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-muted-foreground" />
              Recent Verification Activity
            </p>
            <div className="space-y-2">
              {recentActivity.length === 0 && (
                <p className="text-[11px] text-muted-foreground">No verification activity yet.</p>
              )}
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={cn('mt-1 h-1.5 w-1.5 rounded-full shrink-0', a.type === 'verified' ? 'bg-emerald-500' : 'bg-blue-500')} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] truncate">{a.text}</p>
                    <p className="text-[9px] text-muted-foreground">{a.at}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority breakdown */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['critical', 'high', 'medium', 'low'] as const).map((p) => {
            const count = observations.filter((o) => o.priority === p && (o.status === 'open' || o.status === 'in-progress')).length;
            return (
              <Badge key={p} variant="outline" className={PRIORITY_META[p].badge}>
                {count} {PRIORITY_META[p].label} observation{count !== 1 ? 's' : ''}
              </Badge>
            );
          })}
          <span className="text-[10px] text-muted-foreground ml-auto">
            {summary.pendingHodApproval} documents awaiting HOD approval
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

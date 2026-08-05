import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { HodApprovalStatus, IqacVerificationStatus } from '../../verification-data';

// ---------------------------------------------------------------------------
// Dual-status badges — HOD Approval (🟢/🟡/🔴) and IQAC Verification (⚪/🔵/🟠)
// ---------------------------------------------------------------------------

const HOD_STATUS_META: Record<HodApprovalStatus, { label: string; badge: string; emoji: string }> = {
  approved: { label: 'HOD Approved', badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25', emoji: '🟢' },
  pending: { label: 'Pending HOD Approval', badge: 'bg-amber-500/10 text-amber-600 border-amber-500/25', emoji: '🟡' },
  rejected: { label: 'Rejected by HOD', badge: 'bg-red-500/10 text-red-600 border-red-500/25', emoji: '🔴' },
};

const IQAC_STATUS_META: Record<IqacVerificationStatus, { label: string; badge: string; emoji: string }> = {
  'not-verified': { label: 'Not Verified', badge: 'bg-slate-500/10 text-slate-600 border-slate-500/25 dark:text-slate-300', emoji: '⚪' },
  verified: { label: 'IQAC Verified', badge: 'bg-blue-500/10 text-blue-600 border-blue-500/25', emoji: '🔵' },
  'observation-raised': { label: 'Observation Raised', badge: 'bg-orange-500/10 text-orange-600 border-orange-500/25', emoji: '🟠' },
};

export function HodStatusBadge({ status, className }: { status: HodApprovalStatus; className?: string }) {
  const meta = HOD_STATUS_META[status];
  return (
    <Badge variant="outline" className={cn('text-[9px] font-medium gap-1 h-5 whitespace-nowrap', meta.badge, className)}>
      <span>{meta.emoji}</span>
      {meta.label}
    </Badge>
  );
}

export function IqacStatusBadge({ status, className }: { status: IqacVerificationStatus; className?: string }) {
  const meta = IQAC_STATUS_META[status];
  return (
    <Badge variant="outline" className={cn('text-[9px] font-medium gap-1 h-5 whitespace-nowrap', meta.badge, className)}>
      <span>{meta.emoji}</span>
      {meta.label}
    </Badge>
  );
}

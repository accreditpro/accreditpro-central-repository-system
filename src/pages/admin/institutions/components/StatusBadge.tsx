import { Badge } from '@/components/ui/badge';
import { InstitutionStatus } from '@/types/institution.types';

const STATUS_CONFIG: Record<InstitutionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; dot: string }> = {
  active: { label: 'Active', variant: 'default', dot: 'bg-emerald-500' },
  inactive: { label: 'Inactive', variant: 'secondary', dot: 'bg-muted-foreground' },
  pending: { label: 'Pending', variant: 'outline', dot: 'bg-amber-500' },
  suspended: { label: 'Suspended', variant: 'destructive', dot: 'bg-destructive' },
};

export function StatusBadge({ status }: { status: InstitutionStatus }) {
  const { label, variant, dot } = STATUS_CONFIG[status];
  return (
    <Badge variant={variant} className="gap-1.5 text-[10px] font-medium capitalize">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </Badge>
  );
}

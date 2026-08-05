import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { StatusLevel } from '../principal-data';

// ---------------------------------------------------------------------------
// Shared UI primitives for the Principal module (dashboard-first, KPI cards,
// progress bars, color-coded status, search/filter/export on every page).
// ---------------------------------------------------------------------------

export const STATUS_META: Record<StatusLevel, { label: string; badge: string; dot: string }> = {
  ready: { label: 'Ready', badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', dot: 'bg-emerald-500' },
  attention: { label: 'Needs Attention', badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20', dot: 'bg-amber-500' },
  critical: { label: 'Critical', badge: 'bg-red-500/10 text-red-600 border-red-500/20', dot: 'bg-red-500' },
};

export function statusOf(score: number): StatusLevel {
  if (score >= 85) return 'ready';
  if (score >= 70) return 'attention';
  return 'critical';
}

export function StatusBadge({ status, className }: { status: StatusLevel; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <Badge variant="outline" className={cn('text-[9px] font-medium gap-1 h-5', meta.badge, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </Badge>
  );
}

export function scoreTone(score: number): string {
  if (score >= 85) return 'text-emerald-600';
  if (score >= 70) return 'text-amber-600';
  return 'text-red-600';
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = 'text-foreground',
  iconBg = 'bg-primary/10',
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  tone?: string;
  iconBg?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-2.5 rounded-lg flex-shrink-0', iconBg)}>
            <Icon className={cn('h-4 w-4', tone)} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground truncate">{label}</p>
            <p className="text-xl font-bold leading-tight truncate">{value}</p>
            {sub && <p className="text-[10px] text-muted-foreground truncate">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReadinessBar({ value, className }: { value: number; className?: string }) {
  const color = value >= 85 ? 'bg-emerald-500' : value >= 70 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className={cn('h-1.5 w-full rounded-full bg-muted/60 overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', color)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function ScoreCell({ value, suffix = '%' }: { value: number; suffix?: string }) {
  return (
    <span className={cn('font-semibold', scoreTone(value))}>
      {value}
      {suffix}
    </span>
  );
}

export function FilterSelect({
  value,
  onValueChange,
  options,
  placeholder,
  className,
}: {
  value: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn('h-8 w-[170px] text-xs', className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {children}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 pl-8 text-xs"
      />
    </div>
  );
}

import { Calendar, Building2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VERIFICATION_YEARS } from '../../verification-data';

interface VerificationScopeBarProps {
  year: string;
  onYearChange: (year: string) => void;
  department: string;
  onDepartmentChange: (department: string) => void;
  departments: string[];
  count: number;
}

/**
 * Academic year + department scope used by the Pending Verification and
 * Verified Documents lists, so the IQAC can review one department's evidence
 * for a particular year at a time.
 */
export function VerificationScopeBar({
  year,
  onYearChange,
  department,
  onDepartmentChange,
  departments,
  count,
}: VerificationScopeBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        Scope:
      </div>
      <Select value={year} onValueChange={onYearChange}>
        <SelectTrigger className="h-8 w-[150px] text-xs">
          <SelectValue placeholder="Academic Year" />
        </SelectTrigger>
        <SelectContent>
          {VERIFICATION_YEARS.map((y) => (
            <SelectItem key={y} value={y} className="text-xs">
              {y}
              {y === '2025-26' && <span className="ml-2 text-[9px] text-blue-600 font-medium">(Current)</span>}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={department} onValueChange={onDepartmentChange}>
        <SelectTrigger className="h-8 w-[190px] text-xs">
          <Building2 className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
          <SelectValue placeholder="All Departments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">All Departments</SelectItem>
          {departments.map((d) => (
            <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground ml-auto">
        {department === 'all' ? 'All departments' : department} · {year} —{' '}
        <span className="font-semibold text-foreground">{count}</span> document{count !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

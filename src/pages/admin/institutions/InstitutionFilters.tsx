import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { InstitutionFilters as IFilters } from '@/types/institution.types';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry',
];

const CATEGORIES = [
  'Engineering', 'Medical', 'Arts & Science', 'Management', 'Law', 'Education', 'Pharmacy',
];

interface InstitutionFiltersProps {
  filters: IFilters;
  onFilterChange: (filters: IFilters) => void;
}

export const InstitutionFilters = ({
  filters,
  onFilterChange,
}: InstitutionFiltersProps) => {
  const activeFilterCount = [
    filters.status !== 'all',
    filters.category !== 'all',
    filters.state !== 'all',
    filters.repositoryCompletion !== 'all',
  ].filter(Boolean).length;

  const handleReset = () => {
    onFilterChange({
      search: '',
      status: 'all',
      category: 'all',
      state: 'all',
      repositoryCompletion: 'all',
    });
  };

  return (
    <div className="space-y-4">
      {/* Search + Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search institutions by name, code, or city..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="pl-9 h-9 text-sm"
          />
          {filters.search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => onFilterChange({ ...filters, search: '' })}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={filters.status}
            onValueChange={(val) => onFilterChange({ ...filters, status: val as IFilters['status'] })}
          >
            <SelectTrigger className="h-9 w-[130px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Status</SelectItem>
              <SelectItem value="ACTIVE" className="text-xs">Active</SelectItem>
              <SelectItem value="INACTIVE" className="text-xs">Inactive</SelectItem>
              <SelectItem value="PENDING" className="text-xs">Pending</SelectItem>
              <SelectItem value="SUSPENDED" className="text-xs">Suspended</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.category}
            onValueChange={(val) => onFilterChange({ ...filters, category: val as IFilters['category'] })}
          >
            <SelectTrigger className="h-9 w-[140px] text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-xs">{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.state}
            onValueChange={(val) => onFilterChange({ ...filters, state: val as IFilters['state'] })}
          >
            <SelectTrigger className="h-9 w-[140px] text-xs">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All States</SelectItem>
              {INDIAN_STATES.map((state) => (
                <SelectItem key={state} value={state} className="text-xs">{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.repositoryCompletion}
            onValueChange={(val) =>
              onFilterChange({ ...filters, repositoryCompletion: val as IFilters['repositoryCompletion'] })
            }
          >
            <SelectTrigger className="h-9 w-[150px] text-xs">
              <SelectValue placeholder="Completion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Completion</SelectItem>
              <SelectItem value="below-50" className="text-xs">Below 50%</SelectItem>
              <SelectItem value="50-75" className="text-xs">50% - 75%</SelectItem>
              <SelectItem value="above-75" className="text-xs">Above 75%</SelectItem>
            </SelectContent>
          </Select>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 text-xs text-muted-foreground"
              onClick={handleReset}
            >
              <X className="h-3 w-3" />
              Clear ({activeFilterCount})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
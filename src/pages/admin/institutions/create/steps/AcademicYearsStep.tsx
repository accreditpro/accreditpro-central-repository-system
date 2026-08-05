import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Plus, X, Calendar } from 'lucide-react';
import { CreateInstitutionFormData } from '../types';
import { useState } from 'react';

export const AcademicYearsStep = () => {
  const form = useFormContext<CreateInstitutionFormData>();
  const [newYear, setNewYear] = useState('');

  const academicYears = form.watch('academicYears.academicYears') || [];

  const addYear = () => {
    if (newYear.trim() && !academicYears.includes(newYear.trim())) {
      form.setValue('academicYears.academicYears', [...academicYears, newYear.trim()]);
      setNewYear('');
    }
  };

  const removeYear = (year: string) => {
    form.setValue(
      'academicYears.academicYears',
      academicYears.filter((y) => y !== year)
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Academic Years
        </h2>
        <p className="text-sm text-muted-foreground">Configure the academic years for this institution</p>
      </div>

      <FormField
        control={form.control}
        name="academicYears.academicYears"
        render={() => (
          <FormItem>
            <FormLabel className="text-sm">
              Academic Years <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {academicYears.map((year) => (
                    <div
                      key={year}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{year}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeYear(year)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Academic Year */}
                <div className="flex gap-2 max-w-sm">
                  <Input
                    placeholder="e.g., 2027-28"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="h-9 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addYear();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addYear}
                    disabled={!newYear.trim()}
                    className="h-9 text-xs gap-1 px-4"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Year
                  </Button>
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
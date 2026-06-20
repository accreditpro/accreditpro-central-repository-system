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
import { Plus, X, GraduationCap, Building } from 'lucide-react';
import { DEFAULT_PROGRAMS, DEFAULT_DEPARTMENTS, CreateInstitutionFormData } from '../types';
import { useState } from 'react';

export const AcademicConfigStep = () => {
  const form = useFormContext<CreateInstitutionFormData>();
  const [newDepartment, setNewDepartment] = useState('');

  const programs = form.watch('academicConfig.programs') || DEFAULT_PROGRAMS;
  const departments = form.watch('academicConfig.departments') || DEFAULT_DEPARTMENTS;

  const addDepartment = () => {
    if (newDepartment.trim() && !departments.includes(newDepartment.trim())) {
      form.setValue('academicConfig.departments', [...departments, newDepartment.trim()]);
      setNewDepartment('');
    }
  };

  const removeDepartment = (dept: string) => {
    form.setValue(
      'academicConfig.departments',
      departments.filter((d) => d !== dept)
    );
  };

  const toggleProgram = (program: string) => {
    if (programs.includes(program)) {
      form.setValue(
        'academicConfig.programs',
        programs.filter((p) => p !== program)
      );
    } else {
      form.setValue('academicConfig.programs', [...programs, program]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          Academic Configuration
        </h2>
        <p className="text-sm text-muted-foreground">Configure programs and departments</p>
      </div>

      {/* Programs */}
      <FormField
        control={form.control}
        name="academicConfig.programs"
        render={() => (
          <FormItem>
            <FormLabel className="text-sm flex items-center gap-2">
              <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
              Programs <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/20">
                {DEFAULT_PROGRAMS.map((program) => (
                  <Badge
                    key={program}
                    variant={programs.includes(program) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs h-7 px-3 transition-colors"
                    onClick={() => toggleProgram(program)}
                  >
                    {program}
                    {programs.includes(program) && <X className="h-3 w-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Departments */}
      <FormField
        control={form.control}
        name="academicConfig.departments"
        render={() => (
          <FormItem>
            <FormLabel className="text-sm flex items-center gap-2">
              <Building className="h-3.5 w-3.5 text-muted-foreground" />
              Departments <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/20 min-h-[60px]">
                  {departments.map((dept) => (
                    <Badge
                      key={dept}
                      variant="secondary"
                      className="text-xs h-7 px-3 gap-1"
                    >
                      {dept}
                      <button
                        type="button"
                        onClick={() => removeDepartment(dept)}
                        className="ml-0.5 hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                {/* Add Department */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new department..."
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="h-8 text-sm flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addDepartment();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDepartment}
                    disabled={!newDepartment.trim()}
                    className="h-8 text-xs gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add
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
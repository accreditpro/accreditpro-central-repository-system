import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { User, Mail, Phone, Key } from 'lucide-react';
import { CreateInstitutionFormData } from '../types';

interface UserStepProps {
  title: string;
  description: string;
  fieldPrefix: 'admin' | 'iqacCoordinator' | 'principal';
  icon: React.ReactNode;
}

export const UserStep = ({ title, description, fieldPrefix, icon }: UserStepProps) => {
  const form = useFormContext<CreateInstitutionFormData>();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
        {/* Name */}
        <FormField
          control={form.control}
          name={`${fieldPrefix}.name`}
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="flex items-center gap-2 text-sm">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Full Name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter full name" {...field} className="h-9" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name={`${fieldPrefix}.email`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="user@institution.edu" type="email" {...field} className="h-9" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Mobile */}
        <FormField
          control={form.control}
          name={`${fieldPrefix}.mobile`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                Mobile <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="9876543210" {...field} className="h-9" maxLength={10} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Auto Generate Password */}
        <FormField
          control={form.control}
          name={`${fieldPrefix}.autoGeneratePassword`}
          render={({ field }) => (
            <FormItem className="md:col-span-2 flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 bg-muted/20">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="flex items-center gap-2 text-sm cursor-pointer">
                  <Key className="h-3.5 w-3.5 text-muted-foreground" />
                  Auto Generate Password
                </FormLabel>
                <FormDescription className="text-xs">
                  A secure password will be generated and sent to the user&apos;s email
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

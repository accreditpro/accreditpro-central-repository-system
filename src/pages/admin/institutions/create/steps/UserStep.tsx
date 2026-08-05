import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { User, Mail, Phone, KeyRound } from 'lucide-react';
import { CreateInstitutionFormData } from '../types';

interface UserStepProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const UserStep = ({ title, description, icon }: UserStepProps) => {
  const form = useFormContext<CreateInstitutionFormData>();

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        {/* Name */}
        <FormField
          control={form.control}
          name="admin.name"
          render={({ field }) => (
            <FormItem className="md:col-span-2 space-y-4">
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
          name="admin.email"
          render={({ field }) => (
            <FormItem className="space-y-4">
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
          name="admin.mobile"
          render={({ field }) => (
            <FormItem className="space-y-4">
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
      </div>

      <div className="flex w-full items-start gap-3 rounded-lg border bg-muted/20 p-4">
        <KeyRound className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          A secure password will be auto-generated. You can share the login credentials with the
          institution admin from the success screen after creating the institution.
        </p>
      </div>
    </div>
  );
};
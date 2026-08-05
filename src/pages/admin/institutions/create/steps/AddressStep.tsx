import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { MapPin } from 'lucide-react';
import { INDIAN_STATES, CreateInstitutionFormData } from '../types';

export const AddressStep = () => {
  const form = useFormContext<CreateInstitutionFormData>();

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Address
        </h2>
        <p className="text-sm text-muted-foreground">Enter the institution&apos;s physical address</p>
      </div>

      <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        {/* Address Line 1 */}
        <FormField
          control={form.control}
          name="address.addressLine1"
          render={({ field }) => (
            <FormItem className="md:col-span-2 space-y-4">
              <FormLabel className="text-sm">
                Address Line 1 <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Street address, building name" {...field} className="h-9" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address Line 2 */}
        <FormField
          control={form.control}
          name="address.addressLine2"
          render={({ field }) => (
            <FormItem className="md:col-span-2 space-y-4">
              <FormLabel className="text-sm">Address Line 2</FormLabel>
              <FormControl>
                <Input placeholder="Area, landmark (optional)" {...field} className="h-9" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* State */}
        <FormField
          control={form.control}
          name="address.state"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <FormLabel className="text-sm">
                State <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* District */}
        <FormField
          control={form.control}
          name="address.district"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <FormLabel className="text-sm">
                District <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g., Chennai" {...field} className="h-9" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Pincode */}
        <FormField
          control={form.control}
          name="address.pincode"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <FormLabel className="text-sm">
                Pincode <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="600001" {...field} className="h-9" maxLength={6} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
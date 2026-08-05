import { useFormContext } from 'react-hook-form';
import { Separator } from '@/components/ui/separator';
import {
  Building2, MapPin, UserCog,
} from 'lucide-react';
import { CreateInstitutionFormData } from '../types';

const Section = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-3">
    <h3 className="text-sm font-semibold flex items-center gap-2">
      {icon}
      {title}
    </h3>
    <div className="pl-6 space-y-2">{children}</div>
  </div>
);

const Field = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
  <div className="flex items-start gap-2">
    <span className="text-xs text-muted-foreground min-w-[100px]">{label}:</span>
    <span className="text-xs font-medium">{value}</span>
  </div>
);

export const ReviewStep = () => {
  const form = useFormContext<CreateInstitutionFormData>();
  const data = form.getValues();

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Review & Submit</h2>
        <p className="text-sm text-muted-foreground">Please review all information before submitting</p>
      </div>

      <div className="w-full rounded-lg border p-6 space-y-6 bg-card">
        {/* Basic Info */}
        <Section icon={<Building2 className="h-4 w-4 text-blue-500" />} title="Basic Information">
          <Field label="Name" value={data.basicInfo.name} />
          <Field label="Code" value={<code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{data.basicInfo.code}</code>} />
          <Field label="Category" value={data.basicInfo.category} />
          <Field label="Email" value={data.basicInfo.email} />
          <Field label="Phone" value={data.basicInfo.phone} />
          {data.basicInfo.website && <Field label="Website" value={data.basicInfo.website} />}
        </Section>

        <Separator />

        {/* Address */}
        <Section icon={<MapPin className="h-4 w-4 text-emerald-500" />} title="Address">
          <Field label="Address" value={`${data.address.addressLine1}${data.address.addressLine2 ? ', ' + data.address.addressLine2 : ''}`} />
          <Field label="State" value={data.address.state} />
          <Field label="District" value={data.address.district} />
          <Field label="Pincode" value={data.address.pincode} />
        </Section>

        <Separator />

        {/* Admin */}
        <Section icon={<UserCog className="h-4 w-4 text-red-500" />} title="Institution Admin">
          <Field label="Name" value={data.admin.name} />
          <Field label="Email" value={data.admin.email} />
          <Field label="Mobile" value={data.admin.mobile} />
          <Field label="Password" value="Auto-generated (shown after creation)" />
        </Section>
      </div>
    </div>
  );
};
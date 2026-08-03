import { useFormContext } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, MapPin, GraduationCap, Calendar, UserCog, Shield, User } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Review & Submit</h2>
        <p className="text-sm text-muted-foreground">
          Please review all information before submitting
        </p>
      </div>

      <div className="rounded-lg border p-5 space-y-5 bg-card">
        {/* Basic Info */}
        <Section icon={<Building2 className="h-4 w-4 text-blue-500" />} title="Basic Information">
          <Field label="Name" value={data.basicInfo.name} />
          <Field
            label="Code"
            value={
              <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">
                {data.basicInfo.code}
              </code>
            }
          />
          <Field label="Category" value={data.basicInfo.category} />
          <Field label="Email" value={data.basicInfo.email} />
          <Field label="Phone" value={data.basicInfo.phone} />
          {data.basicInfo.website && <Field label="Website" value={data.basicInfo.website} />}
        </Section>

        <Separator />

        {/* Address */}
        <Section icon={<MapPin className="h-4 w-4 text-emerald-500" />} title="Address">
          <Field
            label="Address"
            value={`${data.address.addressLine1}${data.address.addressLine2 ? ', ' + data.address.addressLine2 : ''}`}
          />
          <Field label="State" value={data.address.state} />
          <Field label="District" value={data.address.district} />
          <Field label="Pincode" value={data.address.pincode} />
        </Section>

        <Separator />

        {/* Academic Config */}
        <Section
          icon={<GraduationCap className="h-4 w-4 text-purple-500" />}
          title="Academic Configuration"
        >
          <div className="flex items-start gap-2">
            <span className="text-xs text-muted-foreground min-w-[100px]">Programs:</span>
            <div className="flex flex-wrap gap-1">
              {data.academicConfig.programs.map(p => (
                <Badge key={p} variant="secondary" className="text-[10px]">
                  {p}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs text-muted-foreground min-w-[100px]">Departments:</span>
            <div className="flex flex-wrap gap-1">
              {data.academicConfig.departments.map(d => (
                <Badge key={d} variant="outline" className="text-[10px]">
                  {d}
                </Badge>
              ))}
            </div>
          </div>
        </Section>

        <Separator />

        {/* Academic Years */}
        <Section icon={<Calendar className="h-4 w-4 text-amber-500" />} title="Academic Years">
          <div className="flex flex-wrap gap-1">
            {data.academicYears.academicYears.map(y => (
              <Badge key={y} variant="secondary" className="text-[10px]">
                {y}
              </Badge>
            ))}
          </div>
        </Section>

        <Separator />

        {/* Admin */}
        <Section icon={<UserCog className="h-4 w-4 text-red-500" />} title="Institution Admin">
          <Field label="Name" value={data.admin.name} />
          <Field label="Email" value={data.admin.email} />
          <Field label="Mobile" value={data.admin.mobile} />
          <Field
            label="Password"
            value={data.admin.autoGeneratePassword ? 'Auto-generated' : 'Manual'}
          />
        </Section>

        <Separator />

        {/* IQAC */}
        <Section icon={<Shield className="h-4 w-4 text-cyan-500" />} title="IQAC Coordinator">
          <Field label="Name" value={data.iqacCoordinator.name} />
          <Field label="Email" value={data.iqacCoordinator.email} />
          <Field label="Mobile" value={data.iqacCoordinator.mobile} />
          <Field
            label="Password"
            value={data.iqacCoordinator.autoGeneratePassword ? 'Auto-generated' : 'Manual'}
          />
        </Section>

        <Separator />

        {/* Principal */}
        <Section icon={<User className="h-4 w-4 text-indigo-500" />} title="Principal">
          <Field label="Name" value={data.principal.name} />
          <Field label="Email" value={data.principal.email} />
          <Field label="Mobile" value={data.principal.mobile} />
          <Field
            label="Password"
            value={data.principal.autoGeneratePassword ? 'Auto-generated' : 'Manual'}
          />
        </Section>
      </div>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  MapPin,
  GraduationCap,
  Calendar,
  UserCog,
  Shield,
  User,
  ClipboardCheck,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { adminService } from '@/services/admin.service';
import type {
  CreateInstitutionRequest,
  CreateInstitutionResponse,
} from '@/types/institution.types';
import {
  CreateInstitutionFormData,
  createInstitutionSchema,
  basicInfoSchema,
  addressSchema,
  academicConfigSchema,
  academicYearsSchema,
  adminUserSchema,
  iqacCoordinatorSchema,
  principalSchema,
  STEPS,
  DEFAULT_PROGRAMS,
  DEFAULT_DEPARTMENTS,
  DEFAULT_ACADEMIC_YEARS,
} from '@/pages/admin/institutions/create/types';
import { BasicInfoStep } from '@/pages/admin/institutions/create/steps/BasicInfoStep';
import { AddressStep } from '@/pages/admin/institutions/create/steps/AddressStep';
import { AcademicConfigStep } from '@/pages/admin/institutions/create/steps/AcademicConfigStep';
import { AcademicYearsStep } from '@/pages/admin/institutions/create/steps/AcademicYearsStep';
import { UserStep } from '@/pages/admin/institutions/create/steps/UserStep';
import { useFormContext } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';

type LoadState = 'loading' | 'ready' | 'error';

/**
 * Map the GET /api/admin/institutions/{id} response (CreateInstitutionResponse)
 * to the nested form structure used by the multi-step create/edit form.
 *
 * The institution detail endpoint only returns a summary of the institution
 * (name, code, category, state, city). Fields like address, academic config,
 * academic years, and user accounts are populated with sensible defaults.
 *
 * For the logo: the API returns logoUrl, while the form expects a logo field.
 * We use logoUrl from the response as the form's logo value.
 */
const mapResponseToFormData = (res: any): CreateInstitutionFormData => {
  const inst = res?.institution || res?.basicInfo || res || {};
  const addr = res?.address || res?.institution || res || {};
  const adm = res?.adminUser || res?.admin || {};
  const iqac = res?.iqacUser || adm;
  const princ = res?.principalUser || adm;

  return {
    basicInfo: {
      name: inst.name || '',
      code: inst.code || '',
      category: inst.category || '',
      email: inst.email || '',
      phone: inst.phone || '',
      website: inst.website || '',
      logo: inst.logoUrl || inst.logo || '',
    },
    address: {
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      state: addr.state || '',
      district: addr.district || addr.city || '',
      pincode: addr.pincode || '',
    },
    academicConfig: {
      programs: DEFAULT_PROGRAMS,
      departments: DEFAULT_DEPARTMENTS,
    },
    academicYears: {
      academicYears: res?.academicEntities?.academicYears?.map((y: any) => y.year) || DEFAULT_ACADEMIC_YEARS,
    },
    admin: {
      name: adm.name || '',
      email: adm.email || '',
      mobile: adm.mobile || '',
      autoGeneratePassword: true,
    },
    iqacCoordinator: {
      name: iqac.name || '',
      email: iqac.email || '',
      mobile: iqac.mobile || '',
      autoGeneratePassword: true,
    },
    principal: {
      name: princ.name || '',
      email: princ.email || '',
      mobile: princ.mobile || '',
      autoGeneratePassword: true,
    },
  };
};

export const EditInstitutionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateInstitutionFormData>({
    resolver: zodResolver(createInstitutionSchema),
    defaultValues: {
      basicInfo: { name: '', code: '', category: '', email: '', phone: '', website: '', logo: '' },
      address: { addressLine1: '', addressLine2: '', state: '', district: '', pincode: '' },
      academicConfig: { programs: DEFAULT_PROGRAMS, departments: DEFAULT_DEPARTMENTS },
      academicYears: { academicYears: DEFAULT_ACADEMIC_YEARS },
      admin: { name: '', email: '', mobile: '', autoGeneratePassword: true },
      iqacCoordinator: { name: '', email: '', mobile: '', autoGeneratePassword: true },
      principal: { name: '', email: '', mobile: '', autoGeneratePassword: true },
    },
    mode: 'onChange',
  });

  // ── Fetch existing institution data ──
  useEffect(() => {
    if (!id) {
      setLoadState('error');
      return;
    }

    setLoadState('loading');
    adminService
      .getInstitutionById(Number(id))
      .then(data => {
        const formData = mapResponseToFormData(data);
        form.reset(formData);
        setLoadState('ready');
      })
      .catch(() => {
        setLoadState('error');
      });
  }, [id, form]);

  const stepSchemas = [
    basicInfoSchema,
    addressSchema,
    academicConfigSchema,
    academicYearsSchema,
    adminUserSchema,
    iqacCoordinatorSchema,
    principalSchema,
    null, // Review step — no validation
  ];

  const stepFieldPrefixes: (keyof CreateInstitutionFormData | null)[] = [
    'basicInfo',
    'address',
    'academicConfig',
    'academicYears',
    'admin',
    'iqacCoordinator',
    'principal',
    null,
  ];

  const validateCurrentStep = async (): Promise<boolean> => {
    const prefix = stepFieldPrefixes[currentStep - 1];
    if (!prefix) return true;

    const schema = stepSchemas[currentStep - 1];
    if (!schema) return true;

    const values = form.getValues(prefix);
    const result = schema.safeParse(values);

    if (!result.success) {
      const fields = Object.keys(result.error.formErrors.fieldErrors);
      fields.forEach(field => {
        form.trigger(`${prefix}.${field}` as keyof CreateInstitutionFormData);
      });
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 8));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    if (!id) return;

    setIsSubmitting(true);
    try {
      const formData = form.getValues() as CreateInstitutionRequest;
      await adminService.updateInstitution(Number(id), formData);
      toast.success('Institution updated successfully!');
      navigate(`/admin/institutions/${id}`);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to update institution. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepIcons = [
    <Building2 key="1" className="h-4 w-4" />,
    <MapPin key="2" className="h-4 w-4" />,
    <GraduationCap key="3" className="h-4 w-4" />,
    <Calendar key="4" className="h-4 w-4" />,
    <UserCog key="5" className="h-4 w-4" />,
    <Shield key="6" className="h-4 w-4" />,
    <User key="7" className="h-4 w-4" />,
    <ClipboardCheck key="8" className="h-4 w-4" />,
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep />;
      case 2:
        return <AddressStep />;
      case 3:
        return <AcademicConfigStep />;
      case 4:
        return <AcademicYearsStep />;
      case 5:
        return (
          <UserStep
            title="Institution Admin"
            description="Set up the institution administrator account"
            fieldPrefix="admin"
            icon={<UserCog className="h-5 w-5 text-primary" />}
          />
        );
      case 6:
        return (
          <UserStep
            title="IQAC Coordinator"
            description="Set up the IQAC coordinator account"
            fieldPrefix="iqacCoordinator"
            icon={<Shield className="h-5 w-5 text-primary" />}
          />
        );
      case 7:
        return (
          <UserStep
            title="Principal"
            description="Set up the principal account"
            fieldPrefix="principal"
            icon={<User className="h-5 w-5 text-primary" />}
          />
        );
      case 8:
        return <ReviewStepReadOnly />;
      default:
        return null;
    }
  };

  // ── Loading state ──
  if (loadState === 'loading') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  // ── Error state ──
  if (loadState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold">Could not load institution</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-md">
          The institution you're trying to edit doesn't exist or you don't have access. Please go
          back and try again.
        </p>
        <Button variant="outline" onClick={() => navigate('/admin/institutions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Institutions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate('/admin/institutions')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Edit Institution</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1].title}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="relative">
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {STEPS.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div
                key={step.id}
                className={cn(
                  'flex flex-col items-center gap-1.5 min-w-[70px] relative',
                  index < STEPS.length - 1 && 'flex-1'
                )}
              >
                {/* Connector line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'absolute top-4 left-[calc(50%+16px)] right-[calc(-50%+16px)] h-0.5',
                      isCompleted ? 'bg-primary' : 'bg-border'
                    )}
                  />
                )}

                {/* Step circle */}
                <button
                  type="button"
                  className={cn(
                    'relative z-10 flex items-center justify-center h-8 w-8 rounded-full border-2 transition-all',
                    isCompleted && 'bg-primary border-primary text-primary-foreground',
                    isCurrent && 'border-primary bg-primary/10 text-primary',
                    !isCompleted &&
                      !isCurrent &&
                      'border-muted-foreground/30 text-muted-foreground/50'
                  )}
                  onClick={() => {
                    if (isCompleted) setCurrentStep(step.id);
                  }}
                  disabled={!isCompleted && !isCurrent}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : stepIcons[index]}
                </button>

                {/* Label */}
                <span
                  className={cn(
                    'text-[10px] font-medium text-center leading-tight',
                    isCurrent ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <Form {...form}>
        <form onSubmit={e => e.preventDefault()}>
          <div className="rounded-xl border bg-card p-6 min-h-[380px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="gap-2 h-9 text-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              {currentStep < 8 ? (
                <Button type="button" onClick={handleNext} className="gap-2 h-9 text-sm">
                  Next
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="gap-2 h-9 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Update Institution
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

// ── Review Step (uses useFormContext from the parent Form provider) ──

const ReviewField = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
  <div className="flex items-start gap-2">
    <span className="text-xs text-muted-foreground min-w-[100px]">{label}:</span>
    <span className="text-xs font-medium">{value}</span>
  </div>
);

const ReviewSection = ({
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

const ReviewStepReadOnly = () => {
  const form = useFormContext<CreateInstitutionFormData>();
  const data = form.getValues();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Review Changes</h2>
        <p className="text-sm text-muted-foreground">Please review all information before saving</p>
      </div>

      <div className="rounded-lg border p-5 space-y-5 bg-card">
        <ReviewSection
          icon={<Building2 className="h-4 w-4 text-blue-500" />}
          title="Basic Information"
        >
          <ReviewField label="Name" value={data.basicInfo.name} />
          <ReviewField
            label="Code"
            value={
              <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">
                {data.basicInfo.code}
              </code>
            }
          />
          <ReviewField label="Category" value={data.basicInfo.category} />
          <ReviewField label="Email" value={data.basicInfo.email} />
          <ReviewField label="Phone" value={data.basicInfo.phone} />
          {data.basicInfo.website && <ReviewField label="Website" value={data.basicInfo.website} />}
        </ReviewSection>

        <Separator />

        <ReviewSection icon={<MapPin className="h-4 w-4 text-emerald-500" />} title="Address">
          <ReviewField
            label="Address"
            value={`${data.address.addressLine1}${data.address.addressLine2 ? ', ' + data.address.addressLine2 : ''}`}
          />
          <ReviewField label="State" value={data.address.state} />
          <ReviewField label="District" value={data.address.district} />
          <ReviewField label="Pincode" value={data.address.pincode} />
        </ReviewSection>

        <Separator />

        <ReviewSection
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
        </ReviewSection>

        <Separator />

        <ReviewSection
          icon={<Calendar className="h-4 w-4 text-amber-500" />}
          title="Academic Years"
        >
          <div className="flex flex-wrap gap-1">
            {data.academicYears.academicYears.map(y => (
              <Badge key={y} variant="secondary" className="text-[10px]">
                {y}
              </Badge>
            ))}
          </div>
        </ReviewSection>

        <Separator />

        <ReviewSection
          icon={<UserCog className="h-4 w-4 text-red-500" />}
          title="Institution Admin"
        >
          <ReviewField label="Name" value={data.admin.name || '(unchanged)'} />
          <ReviewField label="Email" value={data.admin.email || '(unchanged)'} />
          <ReviewField label="Mobile" value={data.admin.mobile || '(unchanged)'} />
          <ReviewField
            label="Password"
            value={data.admin.autoGeneratePassword ? 'Auto-generated' : 'Manual'}
          />
        </ReviewSection>

        <Separator />

        <ReviewSection icon={<Shield className="h-4 w-4 text-cyan-500" />} title="IQAC Coordinator">
          <ReviewField label="Name" value={data.iqacCoordinator.name || '(unchanged)'} />
          <ReviewField label="Email" value={data.iqacCoordinator.email || '(unchanged)'} />
          <ReviewField label="Mobile" value={data.iqacCoordinator.mobile || '(unchanged)'} />
          <ReviewField
            label="Password"
            value={data.iqacCoordinator.autoGeneratePassword ? 'Auto-generated' : 'Manual'}
          />
        </ReviewSection>

        <Separator />

        <ReviewSection icon={<User className="h-4 w-4 text-indigo-500" />} title="Principal">
          <ReviewField label="Name" value={data.principal.name || '(unchanged)'} />
          <ReviewField label="Email" value={data.principal.email || '(unchanged)'} />
          <ReviewField label="Mobile" value={data.principal.mobile || '(unchanged)'} />
          <ReviewField
            label="Password"
            value={data.principal.autoGeneratePassword ? 'Auto-generated' : 'Manual'}
          />
        </ReviewSection>
      </div>
    </div>
  );
};

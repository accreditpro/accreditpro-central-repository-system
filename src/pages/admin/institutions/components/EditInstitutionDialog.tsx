import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Institution, InstitutionCategory } from '@/types/institution.types';
import { institutionService } from '@/services/institution.service';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Building2, MapPin, UserCog, ClipboardCheck, Check, Loader2 } from 'lucide-react';
import {
  CreateInstitutionFormData,
  createInstitutionSchema,
  basicInfoSchema,
  addressSchema,
  adminUserSchema,
  STEPS,
  CATEGORY_MAP,
  CATEGORY_LABEL_MAP,
} from '../create/types';
import { StepStepper } from '../create/StepStepper';
import { BasicInfoStep } from '../create/steps/BasicInfoStep';
import { AddressStep } from '../create/steps/AddressStep';
import { UserStep } from '../create/steps/UserStep';
import { ReviewStep } from '../create/steps/ReviewStep';

interface EditInstitutionDialogProps {
  institution: Institution | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (updated: Institution) => void;
}

const stepIcons = [
  <Building2 key="1" className="h-4 w-4" />,
  <MapPin key="2" className="h-4 w-4" />,
  <UserCog key="3" className="h-4 w-4" />,
  <ClipboardCheck key="4" className="h-4 w-4" />,
];

export function EditInstitutionDialog({
  institution,
  open,
  onOpenChange,
  onSaved,
}: EditInstitutionDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const form = useForm<CreateInstitutionFormData>({
    resolver: zodResolver(createInstitutionSchema),
    defaultValues: {
      basicInfo: { name: '', code: '', category: '', email: '', phone: '', website: '', logo: '' },
      address: { addressLine1: '', addressLine2: '', state: '', district: '', pincode: '' },
      admin: { name: '', email: '', mobile: '' },
    },
    mode: 'onChange',
  });

  // Pre-fill the wizard from the institution record every time it opens
  useEffect(() => {
    if (institution && open) {
      form.reset({
        basicInfo: {
          name: institution.name,
          code: institution.code,
          category: CATEGORY_LABEL_MAP[institution.category] ?? institution.category,
          email: institution.email || '',
          phone: institution.phone || '',
          website: institution.website || '',
          logo: institution.logo || '',
        },
        address: {
          addressLine1: institution.addressLine1 || '',
          addressLine2: institution.addressLine2 || '',
          state: institution.state,
          district: institution.district || institution.city || '',
          pincode: institution.pincode || '',
        },
        admin: {
          name: institution.admin?.name || '',
          email: institution.admin?.email || '',
          mobile: institution.admin?.mobile || '',
        },
      });
      setCurrentStep(1);
      setSaving(false);
    }
  }, [institution, open, form]);

  const stepSchemas = [
    basicInfoSchema,
    addressSchema,
    adminUserSchema,
    null, // Review step - no validation
  ];

  const stepFieldPrefixes: (keyof CreateInstitutionFormData | null)[] = [
    'basicInfo',
    'address',
    'admin',
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
      fields.forEach((field) => {
        form.trigger(`${prefix}.${field}` as keyof CreateInstitutionFormData);
      });
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSave = async () => {
    if (!institution) return;
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    setSaving(true);
    try {
      const data = form.getValues();
      const updated = await institutionService.updateInstitution(institution.id, {
        name: data.basicInfo.name,
        code: data.basicInfo.code,
        category: (CATEGORY_MAP[data.basicInfo.category] ?? data.basicInfo.category) as InstitutionCategory,
        email: data.basicInfo.email,
        phone: data.basicInfo.phone,
        website: data.basicInfo.website || undefined,
        logo: data.basicInfo.logo || institution.logo,
        state: data.address.state,
        city: data.address.district,
        district: data.address.district,
        addressLine1: data.address.addressLine1,
        addressLine2: data.address.addressLine2,
        pincode: data.address.pincode,
        admin: {
          name: data.admin.name,
          email: data.admin.email,
          mobile: data.admin.mobile,
        },
      });
      if (updated) {
        toast.success(`${updated.name} has been updated`);
        onSaved(updated);
        onOpenChange(false);
      } else {
        toast.error('Institution not found');
      }
    } catch {
      toast.error('Failed to update institution');
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep />;
      case 2:
        return <AddressStep />;
      case 3:
        return (
          <UserStep
            title="Institution Admin"
            description="Set up the institution administrator account"
            icon={<UserCog className="h-5 w-5 text-primary" />}
          />
        );
      case 4:
        return <ReviewStep />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Institution</DialogTitle>
          <DialogDescription>
            Update the institution&apos;s registration details — the same steps used when adding an
            institution
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Stepper */}
            <StepStepper
              steps={STEPS}
              currentStep={currentStep}
              icons={stepIcons}
              onStepClick={(id) => setCurrentStep(id)}
              className="mb-6"
            />

            {/* Step content */}
            <div className="w-full rounded-xl border bg-card p-5 sm:p-6 min-h-[320px]">
              {renderStep()}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-5">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={saving}
                  className="gap-2 h-9 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 1 || saving}
                  className="gap-2 h-9 text-sm"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </Button>
              </div>

              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="gap-2 h-9 text-sm"
                >
                  Next
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="gap-2 h-9 text-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Save Changes
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>

        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Building2,
  MapPin,
  UserCog,
  ClipboardCheck,
  Copy,
  Mail,
  User,
  KeyRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { institutionService } from '@/services/institution.service';
import { InstitutionCategory } from '@/types/institution.types';
import {
  CreateInstitutionFormData,
  createInstitutionSchema,
  basicInfoSchema,
  addressSchema,
  adminUserSchema,
  STEPS,
  CATEGORY_MAP,
} from './types';
import { StepStepper } from './StepStepper';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { AddressStep } from './steps/AddressStep';
import { UserStep } from './steps/UserStep';
import { ReviewStep } from './steps/ReviewStep';

interface CreatedInstitution {
  id: string;
  name: string;
  admin: {
    name: string;
    email: string;
    password: string;
  };
}

const createInstitutionApi = async (data: CreateInstitutionFormData): Promise<CreatedInstitution> => {
  const generatedFallback = `Acc@${Math.random().toString(36).slice(2, 8)}`;
  const created = await institutionService.createInstitution({
    name: data.basicInfo.name,
    code: data.basicInfo.code,
    category: CATEGORY_MAP[data.basicInfo.category] || (data.basicInfo.category as InstitutionCategory),
    email: data.basicInfo.email,
    phone: data.basicInfo.phone,
    website: data.basicInfo.website || undefined,
    state: data.address.state,
    city: data.address.district,
    addressLine1: data.address.addressLine1,
    addressLine2: data.address.addressLine2,
    district: data.address.district,
    pincode: data.address.pincode,
    admin: {
      name: data.admin.name,
      email: data.admin.email,
      mobile: data.admin.mobile,
    },
    logo: data.basicInfo.logo,
  });
  return {
    id: created.id,
    name: created.name,
    admin: {
      name: data.admin.name,
      email: data.admin.email,
      password: created.admin?.temporaryPassword || created.admin?.password || generatedFallback,
    },
  };
};

const copyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  } catch {
    toast.error('Failed to copy to clipboard');
  }
};

export const CreateInstitutionPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdInstitution, setCreatedInstitution] = useState<CreatedInstitution | null>(null);

  const form = useForm<CreateInstitutionFormData>({
    resolver: zodResolver(createInstitutionSchema),
    defaultValues: {
      basicInfo: { name: '', code: '', category: '', email: '', phone: '', website: '', logo: '' },
      address: { addressLine1: '', addressLine2: '', state: '', district: '', pincode: '' },
      admin: { name: '', email: '', mobile: '' },
    },
    mode: 'onChange',
  });

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
      // Trigger form validation for the current step fields
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

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = form.getValues();
      const result = await createInstitutionApi(data);
      setCreatedInstitution(result);
      setShowSuccessDialog(true);
    } catch {
      toast.error('Failed to create institution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepIcons = [
    <Building2 key="1" className="h-4 w-4" />,
    <MapPin key="2" className="h-4 w-4" />,
    <UserCog key="3" className="h-4 w-4" />,
    <ClipboardCheck key="4" className="h-4 w-4" />,
  ];

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
    <div className="mx-auto w-full max-w-7xl space-y-8">
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
          <h1 className="text-xl font-bold tracking-tight">Create Institution</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1].title}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <StepStepper
        steps={STEPS}
        currentStep={currentStep}
        icons={stepIcons}
        onStepClick={(id) => setCurrentStep(id)}
      />

      {/* Form Content */}
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="w-full rounded-xl border bg-card p-6 md:p-8 min-h-[380px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6">
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
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="gap-2 h-9 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Create Institution
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <DialogTitle className="text-center">Institution Created Successfully!</DialogTitle>
            <DialogDescription className="text-center">
              <strong>{createdInstitution?.name}</strong> has been registered. Share the institution
              admin login details below with the administrator.
            </DialogDescription>
          </DialogHeader>

          {/* Admin Credentials */}
          {createdInstitution && (
            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    Admin Name
                  </p>
                  <p className="text-sm font-medium truncate">{createdInstitution.admin.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  aria-label="Copy admin name"
                  title="Copy admin name"
                  onClick={() => copyToClipboard(createdInstitution.admin.name, 'Admin name')}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    Login Email
                  </p>
                  <p className="text-sm font-medium truncate">{createdInstitution.admin.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  aria-label="Copy login email"
                  title="Copy login email"
                  onClick={() => copyToClipboard(createdInstitution.admin.email, 'Email')}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <KeyRound className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    Password
                  </p>
                  <p className="text-sm font-medium truncate font-mono">
                    {createdInstitution.admin.password}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  aria-label="Copy password"
                  title="Copy password"
                  onClick={() => copyToClipboard(createdInstitution.admin.password, 'Password')}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>

              <p className="text-[10px] text-muted-foreground">
                Credentials are shown only once. Save them before closing this window.
              </p>
            </div>
          )}

          <DialogFooter className="sm:justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessDialog(false);
                navigate('/admin/institutions');
              }}
            >
              Go to Institutions
            </Button>
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                setCreatedInstitution(null);
                form.reset();
                setCurrentStep(1);
              }}
            >
              Create Another
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

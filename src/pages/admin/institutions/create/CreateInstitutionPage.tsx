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
  GraduationCap,
  Calendar,
  UserCog,
  Shield,
  User,
  ClipboardCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
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
} from './types';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { AddressStep } from './steps/AddressStep';
import { AcademicConfigStep } from './steps/AcademicConfigStep';
import { AcademicYearsStep } from './steps/AcademicYearsStep';
import { UserStep } from './steps/UserStep';
import { ReviewStep } from './steps/ReviewStep';

// Mock API
const mockCreateInstitution = async (_data: CreateInstitutionFormData): Promise<{ success: boolean; id: string }> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { success: true, id: `inst-${Date.now()}` };
};

export const CreateInstitutionPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

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

  const stepSchemas = [
    basicInfoSchema,
    addressSchema,
    academicConfigSchema,
    academicYearsSchema,
    adminUserSchema,
    iqacCoordinatorSchema,
    principalSchema,
    null, // Review step - no validation
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
      setCurrentStep((prev) => Math.min(prev + 1, 8));
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
      await mockCreateInstitution(data);
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
        return <ReviewStep />;
      default:
        return null;
    }
  };

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
          <h1 className="text-xl font-bold tracking-tight">Create Institution</h1>
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
                    !isCompleted && !isCurrent && 'border-muted-foreground/30 text-muted-foreground/50'
                  )}
                  onClick={() => {
                    if (isCompleted) setCurrentStep(step.id);
                  }}
                  disabled={!isCompleted && !isCurrent}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    stepIcons[index]
                  )}
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
        <form onSubmit={(e) => e.preventDefault()}>
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
              The institution has been created and the admin accounts have been set up.
              Login credentials will be sent to the respective email addresses.
            </DialogDescription>
          </DialogHeader>
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
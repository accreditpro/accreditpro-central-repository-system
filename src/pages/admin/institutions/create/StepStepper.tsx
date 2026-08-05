import { Fragment } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StepConfig } from './types';

interface StepStepperProps {
  steps: StepConfig[];
  currentStep: number;
  icons?: React.ReactNode[];
  onStepClick?: (stepId: number) => void;
  className?: string;
}

/**
 * Responsive horizontal progress stepper. Steps are evenly distributed with
 * flex-1 (no fixed widths / absolute positioning), so it never overflows and
 * always matches the width of the container it is rendered in.
 */
export function StepStepper({ steps, currentStep, icons = [], onStepClick, className }: StepStepperProps) {
  return (
    <nav aria-label="Progress" className={cn('w-full', className)}>
      <ol className="flex w-full items-start">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <Fragment key={step.id}>
              <li className="flex min-w-0 flex-1 flex-col items-center gap-2.5">
                <button
                  type="button"
                  aria-current={isCurrent ? 'step' : undefined}
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                    isCompleted && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && 'border-primary bg-primary/10 text-primary',
                    !isCompleted && !isCurrent && 'border-muted-foreground/30 text-muted-foreground/50'
                  )}
                  onClick={() => onStepClick?.(step.id)}
                  disabled={!isCompleted && !isCurrent}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    icons[index]
                  )}
                </button>

                <span
                  className={cn(
                    'text-[10px] font-medium text-center leading-tight px-1',
                    isCurrent ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </span>
              </li>

              {index < steps.length - 1 && (
                <li
                  aria-hidden="true"
                  className={cn(
                    'mt-[15px] h-0.5 min-w-6 flex-1 rounded-full transition-colors',
                    isCompleted ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

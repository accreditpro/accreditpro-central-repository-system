import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { WorkflowStepInfo, WorkflowStepId } from '../types';
import {
  CheckCircle2,
  Circle,
  Lock,
  FileText,
  Upload,
  Brain,
  Target,
  GitBranch,
  Search,
  RefreshCw,
  GitFork,
  ClipboardList,
  FileSpreadsheet,
  BarChart3,
} from 'lucide-react';

const stepIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Upload,
  Brain,
  Target,
  GitBranch,
  Search,
  RefreshCw,
  GitFork,
  ClipboardList,
  FileSpreadsheet,
  BarChart3,
};

interface ProgressStepperProps {
  steps: WorkflowStepInfo[];
  currentStepId: WorkflowStepId;
  onStepClick: (stepId: WorkflowStepId) => void;
}

export const ProgressStepper = ({ steps, currentStepId, onStepClick }: ProgressStepperProps) => {
  const currentIndex = steps.findIndex(s => s.id === currentStepId);

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-start gap-0 min-w-[900px] px-2 py-4">
        {steps.map((step, index) => {
          const Icon = stepIcons[step.icon] || Circle;
          const isCompleted = step.status === 'completed';
          const isCurrent = step.id === currentStepId;
          const isPending = step.status === 'pending';
          const isPast = index < currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div key={step.id} className="flex-1 flex flex-col items-center relative">
              {/* Connector Line */}
              {index > 0 && (
                <div
                  className={cn(
                    'absolute top-4 right-1/2 w-full h-[2px] -z-10',
                    isPast || isCurrent ? 'bg-indigo-500' : 'bg-border'
                  )}
                  style={{ left: '-50%' }}
                />
              )}

              {/* Step Circle */}
              <button
                onClick={() => !isFuture && onStepClick(step.id)}
                disabled={isFuture}
                className={cn(
                  'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200',
                  isCompleted &&
                    'border-indigo-500 bg-indigo-500 text-white cursor-pointer hover:bg-indigo-600',
                  isCurrent &&
                    'border-indigo-500 bg-indigo-500/10 text-indigo-600 cursor-pointer ring-2 ring-indigo-500/30',
                  isPending && 'border-border bg-card text-muted-foreground',
                  isFuture &&
                    'border-border/50 bg-muted/30 text-muted-foreground/40 cursor-not-allowed'
                )}
                title={`Step ${step.stepNumber}: ${step.label}`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : isCurrent ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.div>
                ) : isFuture ? (
                  <Lock className="h-3.5 w-3.5" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </button>

              {/* Step Number */}
              <span
                className={cn(
                  'text-[9px] font-bold mt-1',
                  isCompleted && 'text-indigo-600',
                  isCurrent && 'text-indigo-600',
                  isPending && 'text-muted-foreground',
                  isFuture && 'text-muted-foreground/40'
                )}
              >
                Step {step.stepNumber}
              </span>

              {/* Step Label */}
              <span
                className={cn(
                  'text-[10px] font-medium text-center mt-0.5 leading-tight max-w-[80px]',
                  isCompleted && 'text-indigo-600',
                  isCurrent && 'text-indigo-700 dark:text-indigo-400 font-semibold',
                  isPending && 'text-muted-foreground',
                  isFuture && 'text-muted-foreground/40'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

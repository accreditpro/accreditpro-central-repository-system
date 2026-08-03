import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Brain,
  BookOpen,
  Lightbulb,
  Library,
  FlaskConical,
  Layers,
  Database,
  GraduationCap,
  Award,
  ShieldCheck,
  Target,
  PenTool,
  CheckCircle,
  BookCheck,
  ClipboardList,
  Network,
  Shield,
  Sparkles,
  GitCompare,
  Search,
  BarChart,
  Equal,
  TrendingUp,
  FileCheck,
  Activity,
  AlertCircle,
  SearchX,
  Scale,
  RefreshCw,
  Users,
  ClipboardCheck,
  Table,
  GitBranch,
  Briefcase,
  Compass,
  Link,
  Building,
  Loader2,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import aiLoadingMessages from '@/data/ai-loading-messages.json';

// ============ Types ============

export interface AIMessage {
  title: string;
  subtitle: string;
  icon: string;
}

export interface AIWorkflowConfig {
  duration: number;
  loop: boolean;
  messages: AIMessage[];
}

export type WorkflowKey =
  | 'course-analysis'
  | 'course-outcomes'
  | 'co-po-mapping'
  | 'gap-analysis'
  | 'revised-co-po-mapping'
  | 'co-pso-mapping';

export type AIStatus = 'loading' | 'error' | 'complete';

export interface AILoadingScreenProps {
  /** The workflow key to look up messages from the JSON data file */
  workflow: WorkflowKey;
  /** Whether the API call is still in progress */
  isProcessing: boolean;
  /** Error message if the API call failed */
  error?: string | null;
  /** Called when the user wants to retry after an error */
  onRetry?: () => void;
  /** Called when the user wants to cancel/go back */
  onCancel?: () => void;
  /** Called when the process completes successfully */
  onComplete?: () => void;
  /** Optional title displayed above the message carousel */
  title?: string;
  /** Optional subtitle displayed below the title */
  subtitle?: string;
  /** Custom class name to override container styles */
  className?: string;
}

// ============ Icon Map ============

const iconMap: Record<string, LucideIcon> = {
  brain: Brain,
  'book-open': BookOpen,
  lightbulb: Lightbulb,
  library: Library,
  'flask-conical': FlaskConical,
  layers: Layers,
  database: Database,
  'graduation-cap': GraduationCap,
  award: Award,
  'shield-check': ShieldCheck,
  target: Target,
  'pen-tool': PenTool,
  'check-circle': CheckCircle,
  'book-check': BookCheck,
  'clipboard-list': ClipboardList,
  network: Network,
  shield: Shield,
  sparkles: Sparkles,
  'git-compare': GitCompare,
  search: Search,
  'bar-chart': BarChart,
  equal: Equal,
  'trending-up': TrendingUp,
  'file-check': FileCheck,
  activity: Activity,
  'alert-circle': AlertCircle,
  'search-x': SearchX,
  scale: Scale,
  'refresh-cw': RefreshCw,
  users: Users,
  'clipboard-check': ClipboardCheck,
  table: Table,
  'git-branch': GitBranch,
  briefcase: Briefcase,
  compass: Compass,
  link: Link,
  building: Building,
};

// ============ Helpers ============

function getIconComponent(iconName: string): LucideIcon {
  return iconMap[iconName] || Sparkles;
}

function getGradientColors(index: number): string {
  const gradients = [
    'from-indigo-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-600',
    'from-blue-500 to-cyan-600',
    'from-rose-500 to-pink-600',
    'from-violet-500 to-indigo-600',
    'from-teal-500 to-emerald-600',
    'from-amber-500 to-orange-600',
    'from-sky-500 to-blue-600',
    'from-fuchsia-500 to-violet-600',
  ];
  return gradients[index % gradients.length];
}

// ============ Progress Indicator ============

function ProgressDots({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            scale: i === current ? 1.2 : 1,
            opacity: i === current ? 1 : 0.3,
          }}
          transition={{ duration: 0.3 }}
          className={cn(
            'h-1.5 rounded-full transition-all duration-300',
            i === current
              ? 'w-4 bg-indigo-500'
              : 'w-1.5 bg-muted-foreground/30'
          )}
        />
      ))}
    </div>
  );
}

// ============ Spinning Ring ============

function SpinningRing() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer spinning ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 border-r-indigo-400/50"
      />
      {/* Middle counter-rotating ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-1 rounded-full border border-transparent border-b-emerald-500 border-l-emerald-400/50"
      />
    </div>
  );
}

// ============ Error State ============

function ErrorState({
  message,
  onRetry,
  onCancel,
}: {
  message: string;
  onRetry?: () => void;
  onCancel?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-8"
    >
      {/* Error Icon */}
      <div className="relative mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/10 to-rose-600/10"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </motion.div>
      </div>

      {/* Error Title */}
      <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
        AI Processing Failed
      </h3>

      {/* Error Message */}
      <Card className="w-full max-w-md border-red-500/20 bg-red-500/5 mb-6">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                Error Details
              </p>
              <p className="text-[10px] text-red-600/70 mt-0.5 break-words">
                {message}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {onRetry && (
          <Button
            onClick={onRetry}
            className="gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg shadow-red-500/20"
          >
            <RotateCcw className="h-4 w-4" />
            Retry
          </Button>
        )}
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="gap-2"
          >
            Cancel
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ============ Main Component ============

export function AILoadingScreen({
  workflow,
  isProcessing,
  error,
  onRetry,
  onCancel,
  onComplete,
  title,
  subtitle,
  className,
}: AILoadingScreenProps) {
  const config = (aiLoadingMessages as Record<string, AIWorkflowConfig>)[workflow];

  // Fallback if workflow is not found
  const messages = config?.messages || [];
  const duration = config?.duration || 7000;
  const shouldLoop = config?.loop ?? true;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isCompleteRef = useRef(false);
  const hasStartedRef = useRef(false);

  const status: AIStatus = error
    ? 'error'
    : !isProcessing && hasStartedRef.current
      ? 'complete'
      : 'loading';

  // Reset when workflow or isProcessing changes
  useEffect(() => {
    if (isProcessing) {
      setCurrentIndex(0);
      setDirection(1);
      isCompleteRef.current = false;
      hasStartedRef.current = true;
    }
  }, [isProcessing, workflow]);

  // Notify on complete
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (status === 'complete' && !isCompleteRef.current && !error) {
      isCompleteRef.current = true;
      onCompleteRef.current?.();
    }
  }, [status, error]);

  // Message cycling timer
  const advanceMessage = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= messages.length) {
        // If processing is still ongoing, loop back to 0
        return shouldLoop ? 0 : messages.length - 1;
      }
      return next;
    });
  }, [messages.length, shouldLoop]);

  useEffect(() => {
    // Only cycle if we're processing, have messages, and no error
    if (!isProcessing || messages.length === 0 || error) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      advanceMessage();
    }, duration);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isProcessing, duration, advanceMessage, messages.length, error]);

  // If there's an error, show error state
  if (status === 'error' && error) {
    return (
      <div className={cn('w-full max-w-lg mx-auto', className)}>
        <ErrorState message={error} onRetry={onRetry} onCancel={onCancel} />
      </div>
    );
  }

  // If not processing and no messages loaded yet
  if (messages.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground mt-3">Initializing...</p>
      </div>
    );
  }

  const currentMessage = messages[currentIndex];
  const IconComponent = getIconComponent(currentMessage?.icon || 'sparkles');

  return (
    <div className={cn('w-full max-w-lg mx-auto', className)}>
      <div className="flex flex-col items-center justify-center py-6">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center mb-6">
            {title && (
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        )}

        {/* Animated Icon Container */}
        <div className="relative mb-6">
          <div className="flex items-center justify-center">
            {/* Spinning rings behind the icon */}
            <div className="absolute h-24 w-24">
              <SpinningRing />
            </div>

            {/* Icon with gradient background */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className={cn(
                'flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br',
                getGradientColors(currentIndex)
              )}
            >
              <IconComponent className="h-10 w-10 text-white" />
            </motion.div>
          </div>
        </div>

        {/* Message Carousel */}
        <div className="h-24 flex items-center justify-center text-center mb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: direction > 0 ? 12 : -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: direction > 0 ? -12 : 12 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="px-4"
            >
              <p className="text-sm font-semibold text-foreground mb-1">
                {currentMessage.title}
              </p>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {currentMessage.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Dots */}
        <ProgressDots total={messages.length} current={currentIndex} />

        {/* Processing indicator */}
        <div className="flex items-center gap-2 mt-4">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Loader2 className="h-3.5 w-3.5 text-indigo-500 animate-spin" />
          </motion.div>
          <span className="text-[10px] text-muted-foreground">
            Processing step {currentIndex + 1} of {messages.length}
          </span>
        </div>

        {/* Cancel button */}
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="gap-1.5 text-muted-foreground hover:text-foreground mt-4 text-xs"
          >
            <XCircle className="h-3.5 w-3.5" />
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

export default AILoadingScreen;

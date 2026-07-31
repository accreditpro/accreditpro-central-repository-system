import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle2, CalendarDays, Clock, GraduationCap, Info, Lightbulb, Save } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { GAP_ANALYSIS_STRATEGIES, OBEConfiguration } from '../types';

interface Props {
  config: OBEConfiguration;
  onUpdate: (config: OBEConfiguration) => void;
}

const timingIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'before-semester': CalendarDays,
  'after-semester': Clock,
  'after-program': GraduationCap,
};

const timingAccents: Record<string, string> = {
  'before-semester': 'bg-blue-500',
  'after-semester': 'bg-amber-500',
  'after-program': 'bg-purple-500',
};

export const GapAnalysisStrategyPage = ({ config, onUpdate }: Props) => {
  const [draft, setDraft] = useState({ ...config.gapAnalysis });

  const enabledCount = Object.values(draft).filter(Boolean).length;
  const hasError = enabledCount === 0;

  const toggle = useCallback((key: keyof typeof draft) => {
    setDraft((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSave = () => {
    if (enabledCount === 0) {
      toast.error('At least one Gap Analysis strategy must be enabled');
      return;
    }
    onUpdate({ ...config, gapAnalysis: draft });
    toast.success('Gap Analysis strategy saved');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold">Gap Analysis Strategy</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure when the system should perform Gap Analysis. Select one or more strategies.
        </p>
      </div>

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 gap-4">
        {GAP_ANALYSIS_STRATEGIES.map((strategy, idx) => {
          const key = strategy.timing as keyof typeof draft;
          const isEnabled = draft[key];
          const Icon = timingIcons[strategy.timing];

          return (
            <motion.div
              key={strategy.timing}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:shadow-md',
                  isEnabled
                    ? 'ring-2 ring-primary/30 border-primary/40 bg-gradient-to-r from-primary/[0.03] to-transparent'
                    : 'border-border/50 opacity-70 hover:opacity-90'
                )}
                onClick={() => toggle(key)}
              >
                <CardContent className="p-0">
                  <div className="flex items-start gap-4 p-4">
                    {/* Checkbox */}
                    <div className="pt-0.5">
                      <div
                        className={cn(
                          'w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 shrink-0',
                          isEnabled
                            ? 'bg-primary border-primary text-primary-foreground scale-110'
                            : 'border-muted-foreground/30'
                        )}
                      >
                        {isEnabled && <CheckCircle2 className="h-4 w-4" />}
                      </div>
                    </div>

                    {/* Icon */}
                    <div
                      className={cn(
                        'p-2.5 rounded-xl shrink-0 transition-colors',
                        isEnabled
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted/30 text-muted-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{strategy.title}</h3>
                        {strategy.timing === 'before-semester' && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-blue-500/10 text-blue-600 border-blue-500/30">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {strategy.description}
                      </p>

                      {/* Used In Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                        <Lightbulb className="h-3 w-3 text-muted-foreground/60" />
                        {strategy.usedIn.map((item) => (
                          <Badge
                            key={item}
                            variant="outline"
                            className={cn(
                              'text-[9px] px-1.5 py-0',
                              isEnabled
                                ? 'bg-primary/5 border-primary/20'
                                : 'bg-muted/20'
                            )}
                          >
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Active Status Bar */}
                  <div
                    className={cn(
                      'h-0.5 transition-all duration-300 rounded-b-lg',
                      isEnabled ? timingAccents[strategy.timing] : 'bg-transparent'
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Validation & Save */}
      <Card className={cn('border', hasError ? 'border-red-300 dark:border-red-800' : 'border-border/50')}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              {hasError ? (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
              <div>
                <p className={cn('text-xs font-medium', hasError ? 'text-red-600' : 'text-green-600')}>
                  {hasError
                    ? 'Validation Error: At least one strategy must be enabled'
                    : `${enabledCount} of ${GAP_ANALYSIS_STRATEGIES.length} strategies enabled`}
                </p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  Changes affect only future calculations. Historical data remains unchanged.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={handleSave}
              disabled={hasError}
            >
              <Save className="h-3.5 w-3.5" /> Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

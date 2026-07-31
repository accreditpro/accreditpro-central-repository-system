import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Info, BarChart3, GitBranch, ArrowUpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { COPO_ATTAINMENT_METHODS, COPOAttainmentMethod, OBEConfiguration } from '../types';

interface Props {
  config: OBEConfiguration;
  onUpdate: (config: OBEConfiguration) => void;
}

const methodIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'average-mapping': BarChart3,
  'weighted-average': GitBranch,
  'highest-mapping': ArrowUpCircle,
};

export const COPOAttainmentCalculationPage = ({ config, onUpdate }: Props) => {
  const selected = config.coPOAttainmentMethod;

  const handleSelect = (method: string) => {
    onUpdate({ ...config, coPOAttainmentMethod: method as COPOAttainmentMethod });
    toast.success(`CO-PO method set to ${COPO_ATTAINMENT_METHODS.find(m => m.value === method)?.title}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">CO–PO / CO–PSO Attainment Calculation</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure how Program Outcome (PO) and Program Specific Outcome (PSO) attainment are
          calculated from Course Outcome attainment values. Choose one method.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {COPO_ATTAINMENT_METHODS.map((method, idx) => {
          const isSelected = selected === method.value;
          const Icon = methodIcons[method.value] || BarChart3;

          return (
            <motion.div
              key={method.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:shadow-md',
                  isSelected
                    ? 'ring-2 ring-primary/30 border-primary/40 bg-gradient-to-r from-primary/[0.04] to-transparent'
                    : 'border-border/50'
                )}
                onClick={() => handleSelect(method.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Radio Button */}
                    <div className="pt-0.5">
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0',
                          isSelected
                            ? 'border-primary'
                            : 'border-muted-foreground/30'
                        )}
                      >
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>

                    {/* Icon */}
                    <div
                      className={cn(
                        'p-2.5 rounded-xl shrink-0 transition-colors',
                        isSelected
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted/30 text-muted-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{method.title}</h3>
                        {method.recommended && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {method.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Card */}
      <Card className="border-primary/10 bg-primary/[0.02]">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-foreground">
                Current Method:{' '}
                <span className="text-primary">
                  {COPO_ATTAINMENT_METHODS.find(m => m.value === selected)?.title}
                </span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Used by the PO Attainment Engine, Gap Analysis Engine, and Department Coordinator
                module for calculating PO and PSO attainment across all programs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

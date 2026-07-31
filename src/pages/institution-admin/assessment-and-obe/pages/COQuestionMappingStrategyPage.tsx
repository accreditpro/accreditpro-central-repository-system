import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Info, Link2, Share2, LayoutGrid } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CO_QUESTION_MAPPING_STRATEGIES, COQuestionMappingStrategy, OBEConfiguration } from '../types';

interface Props {
  config: OBEConfiguration;
  onUpdate: (config: OBEConfiguration) => void;
}

const methodIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'one-to-one': Link2,
  'one-to-many': Share2,
  'section-wise': LayoutGrid,
};

export const COQuestionMappingStrategyPage = ({ config, onUpdate }: Props) => {
  const selected = config.coQuestionMappingStrategy;

  const handleSelect = (method: string) => {
    onUpdate({ ...config, coQuestionMappingStrategy: method as COQuestionMappingStrategy });
    toast.success(`CO-Question mapping set to ${CO_QUESTION_MAPPING_STRATEGIES.find(m => m.value === method)?.title}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">CO–Question Mapping Strategy</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure how questions are mapped to Course Outcomes. Choose one strategy that
          will be used while creating question papers and calculating CO attainment.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {CO_QUESTION_MAPPING_STRATEGIES.map((method, idx) => {
          const isSelected = selected === method.value;
          const Icon = methodIcons[method.value] || Link2;

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
                Current Strategy:{' '}
                <span className="text-primary">
                  {CO_QUESTION_MAPPING_STRATEGIES.find(m => m.value === selected)?.title}
                </span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Used by the Question Paper Blueprint, CO Attainment Engine, and Examination Module
                for mapping questions to Course Outcomes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

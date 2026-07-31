import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { repositoryKPIs } from '../repository-config';
import { TrendingUp, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const verificationConfig = {
  verified: {
    icon: CheckCircle2,
    label: 'Verified',
    className: 'bg-emerald-500/10 text-emerald-600',
  },
  partial: { icon: Clock, label: 'Partial', className: 'bg-amber-500/10 text-amber-600' },
  pending: { icon: AlertCircle, label: 'Pending', className: 'bg-red-500/10 text-red-600' },
};

export const RepositoryKPICards = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
      {repositoryKPIs.map((kpi, index) => {
        const vConfig = verificationConfig[kpi.verificationStatus];
        const VIcon = vConfig.icon;
        return (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
          >
            <Card className="border-border/50 hover:shadow-md transition-all duration-200 hover:border-primary/20 cursor-pointer group h-full">
              <CardContent className="p-3.5">
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                    {kpi.label}
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold">{kpi.totalRecords}</span>
                    <span className="text-[10px] text-muted-foreground">records</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          kpi.completionPercent >= 90
                            ? 'bg-emerald-500'
                            : kpi.completionPercent >= 70
                              ? 'bg-indigo-500'
                              : 'bg-amber-500'
                        )}
                        style={{ width: `${kpi.completionPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium">{kpi.completionPercent}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className={cn('text-[9px] px-1.5 py-0', vConfig.className)}
                    >
                      <VIcon className="h-2.5 w-2.5 mr-0.5" />
                      {vConfig.label}
                    </Badge>
                    {kpi.trend > 0 && (
                      <span className="text-[9px] text-emerald-500 flex items-center gap-0.5">
                        <TrendingUp className="h-2.5 w-2.5" />+{kpi.trend}%
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-muted-foreground">{kpi.lastUpdated}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

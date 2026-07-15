import { motion } from 'framer-motion';
import { Upload, Plus, Pencil, Trash2, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { RecentActivityItem } from './types';

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  upload: { icon: Upload, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  create: { icon: Plus, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  update: { icon: Pencil, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  delete: { icon: Trash2, color: 'text-red-500', bg: 'bg-red-500/10' },
  login: { icon: LogIn, color: 'text-violet-500', bg: 'bg-violet-500/10' },
};

interface RecentActivityProps {
  data: RecentActivityItem[];
}

export function RecentActivity({ data }: RecentActivityProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <Card className="border-border/50 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
              <CardDescription>Latest platform activities across all institutions</CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {data.map((item, index) => {
              const config = typeConfig[item.type] || typeConfig.update;
              const Icon = config.icon;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', config.bg)}>
                    <Icon className={cn('h-4 w-4', config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.action}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{item.user}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground truncate">{item.institution}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                    {item.timestamp}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
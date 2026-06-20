import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Activity } from './mock-data';
import {
  FileText,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Database,
  ArrowRight,
} from 'lucide-react';

const activityConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  document_upload: { icon: FileText, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
  user_registration: { icon: UserPlus, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10' },
  approval: { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  compliance: { icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  repository: { icon: Database, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500/10' },
};

interface RecentActivitiesProps {
  activities: Activity[];
}

export const RecentActivities = ({ activities }: RecentActivitiesProps) => {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Recent Activities</CardTitle>
            <CardDescription className="text-xs">
              Latest actions across all institutions
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
            View all
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          {activities.map((activity, index) => {
            const config = activityConfig[activity.type] || activityConfig.document_upload;
            const Icon = config.icon;

            return (
              <div
                key={activity.id}
                className={cn(
                  'flex gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50',
                  index === 0 && 'bg-muted/30'
                )}
              >
                <div className={cn('rounded-lg p-2 h-fit shrink-0', config.bg)}>
                  <Icon className={cn('h-3.5 w-3.5', config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                      {activity.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-normal">
                      {activity.institution}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">by {activity.user}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
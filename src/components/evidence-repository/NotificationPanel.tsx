import { Badge } from '@/components/ui/badge';
import { AlertTriangle, XCircle, Clock, CalendarClock, RefreshCw } from 'lucide-react';
import { NotificationItem } from './types';

interface NotificationPanelProps {
  notifications: NotificationItem[];
}

export function NotificationPanel({ notifications }: NotificationPanelProps) {
  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'missing': return <AlertTriangle className="h-3.5 w-3.5 text-red-500" />;
      case 'rejected': return <XCircle className="h-3.5 w-3.5 text-red-500" />;
      case 'pending_review': return <Clock className="h-3.5 w-3.5 text-amber-500" />;
      case 'expiring': return <CalendarClock className="h-3.5 w-3.5 text-orange-500" />;
      case 'recently_updated': return <RefreshCw className="h-3.5 w-3.5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: NotificationItem['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800';
      case 'warning': return 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800';
      case 'info': return 'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800';
    }
  };

  return (
    <div className="space-y-2">
      {notifications.slice(0, 5).map(notification => (
        <div
          key={notification.id}
          className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${getSeverityColor(notification.severity)}`}
        >
          <div className="mt-0.5">{getIcon(notification.type)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium">{notification.title}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{notification.description}</p>
          </div>
          <Badge variant="outline" className="text-[9px] flex-shrink-0">
            {notification.timestamp}
          </Badge>
        </div>
      ))}
    </div>
  );
}
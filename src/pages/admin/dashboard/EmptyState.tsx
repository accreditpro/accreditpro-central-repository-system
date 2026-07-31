import { cn } from '@/lib/utils';
import { Inbox, BarChart3, FileText, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const iconMap = {
  institutions: Building2,
  charts: BarChart3,
  documents: FileText,
  default: Inbox,
};

interface EmptyStateProps {
  type?: keyof typeof iconMap;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState = ({
  type = 'default',
  title,
  description,
  action,
  className,
}: EmptyStateProps) => {
  const Icon = iconMap[type];

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-[280px] mb-4">{description}</p>
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

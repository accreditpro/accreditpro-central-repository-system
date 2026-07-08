import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FolderOpen, FileCheck, Upload, ShieldCheck } from 'lucide-react';
import {
  EvidenceFolder,
  FolderMetrics,
  getCompletionBadgeColor,
  getCompletionEmoji,
  getCompletionStatusText,
} from './types';

interface FolderCardProps {
  folder: EvidenceFolder;
  metrics: FolderMetrics;
  onClick: () => void;
}

export function FolderCard({ folder, metrics, onClick }: FolderCardProps) {
  const completionColor = metrics.completionPercentage >= 100
    ? 'text-emerald-600 dark:text-emerald-400'
    : metrics.completionPercentage >= 75
      ? 'text-amber-600 dark:text-amber-400'
      : metrics.completionPercentage >= 50
        ? 'text-orange-600 dark:text-orange-400'
        : 'text-red-600 dark:text-red-400';

  const progressColor = metrics.completionPercentage >= 100
    ? '[&>div]:bg-emerald-500'
    : metrics.completionPercentage >= 75
      ? '[&>div]:bg-amber-500'
      : metrics.completionPercentage >= 50
        ? '[&>div]:bg-orange-500'
        : '[&>div]:bg-red-500';

  return (
    <Card
      className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <FolderOpen className="h-4.5 w-4.5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold truncate">{folder.name}</h3>
              {folder.description && (
                <p className="text-[11px] text-muted-foreground line-clamp-1">{folder.description}</p>
              )}
            </div>
          </div>
          <span className="text-sm shrink-0 ml-1">{getCompletionEmoji(metrics.completionPercentage)}</span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs">
            <FileCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Required:</span>
            <span className="font-medium">{metrics.requiredDocuments}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Upload className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Uploaded:</span>
            <span className="font-medium">{metrics.uploadedDocuments}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Approved:</span>
            <span className="font-medium">{metrics.approvedDocuments}</span>
          </div>
        </div>

        {/* Progress Bar with percentage */}
        <div className="flex items-center gap-2">
          <Progress value={metrics.completionPercentage} className={`h-1.5 flex-1 ${progressColor}`} />
          <span className={`text-xs font-semibold shrink-0 ${completionColor}`}>
            {metrics.completionPercentage}%
          </span>
        </div>

        {/* Status Badge */}
        <div className="mt-2.5 flex items-center justify-between">
          <Badge
            variant="secondary"
            className={`text-[10px] px-1.5 py-0 ${getCompletionBadgeColor(metrics.completionPercentage)}`}
          >
            {getCompletionStatusText(metrics.completionPercentage)}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {metrics.totalDocuments} docs
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
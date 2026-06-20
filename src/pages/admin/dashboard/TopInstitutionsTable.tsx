import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Institution } from './mock-data';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopInstitutionsTableProps {
  institutions: Institution[];
}

export const TopInstitutionsTable = ({ institutions }: TopInstitutionsTableProps) => {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Top Institutions</CardTitle>
            <CardDescription className="text-xs">
              Most active institutions by completion
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
            View all
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {institutions.map((institution, index) => (
            <div
              key={institution.id}
              className="group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
            >
              {/* Rank */}
              <div className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                index === 0 && 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                index === 1 && 'bg-slate-400/10 text-slate-500 dark:text-slate-400',
                index === 2 && 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
                index > 2 && 'bg-muted text-muted-foreground'
              )}>
                #{index + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{institution.name}</p>
                  <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-normal">
                    {institution.category}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {institution.documentsUploaded.toLocaleString()} docs
                  </span>
                  <span className="text-[10px] text-muted-foreground">•</span>
                  <span className="text-[10px] text-muted-foreground">
                    {institution.lastActive}
                  </span>
                </div>
                {/* Progress */}
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={institution.repositoryCompletion} className="h-1.5 flex-1" />
                  <span className="text-[10px] font-medium text-muted-foreground w-8 text-right">
                    {institution.repositoryCompletion}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
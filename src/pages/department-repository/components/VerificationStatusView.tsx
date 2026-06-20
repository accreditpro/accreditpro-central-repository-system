import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { allRepositoryConfigs, repositoryHealth, repositorySummaries } from '../repository-configs';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Shield,
  AlertTriangle,
} from 'lucide-react';

export const VerificationStatusView = () => {
  // Calculate overall verification stats
  const allSummaries = Object.values(repositorySummaries);
  const totalRecords = allSummaries.reduce((sum, s) => sum + s.recordsUploaded, 0);
  const totalVerified = allSummaries.reduce((sum, s) => sum + s.verified, 0);
  const totalApproved = allSummaries.reduce((sum, s) => sum + s.approved, 0);
  const totalPendingVerification = allSummaries.reduce((sum, s) => sum + s.pendingVerification, 0);
  const totalRejected = allSummaries.reduce((sum, s) => sum + s.rejected, 0);

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold tracking-tight">Verification Status</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track verification and approval status across all repositories
        </p>
      </motion.div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Records', value: totalRecords, icon: Shield, color: 'text-indigo-600 bg-indigo-500/10' },
          { label: 'Verified', value: totalVerified, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-500/10' },
          { label: 'Approved', value: totalApproved, icon: CheckCircle2, color: 'text-green-600 bg-green-500/10' },
          { label: 'Pending Verification', value: totalPendingVerification, icon: Clock, color: 'text-amber-600 bg-amber-500/10' },
          { label: 'Rejected', value: totalRejected, icon: XCircle, color: 'text-red-600 bg-red-500/10' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', stat.color.split(' ')[1])}>
                    <Icon className={cn('h-4 w-4', stat.color.split(' ')[0])} />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground">{stat.label}</p>
                    <p className={cn('text-lg font-bold', stat.color.split(' ')[0])}>{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Repository-wise Verification */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Repository Verification Progress</CardTitle>
          <CardDescription className="text-xs">Verification status breakdown by repository</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {allRepositoryConfigs.map((config) => {
            const metrics = repositoryHealth[config.id];
            return (
              <div key={config.id} className="p-4 rounded-xl border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold">{config.label}</h4>
                    <Badge variant="secondary" className={cn('text-[9px]',
                      metrics.verificationPercent >= 80 ? 'bg-emerald-500/10 text-emerald-600' :
                      metrics.verificationPercent >= 60 ? 'bg-amber-500/10 text-amber-600' :
                      'bg-red-500/10 text-red-600'
                    )}>
                      {metrics.verificationPercent}% verified
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Readiness: {metrics.readinessScore}%
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-28">Data Completeness</span>
                    <Progress value={metrics.dataCompleteness} className="h-2 flex-1" />
                    <span className="text-[10px] font-medium w-10 text-right">{metrics.dataCompleteness}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-28">Evidence</span>
                    <Progress value={metrics.evidenceCompleteness} className="h-2 flex-1" />
                    <span className="text-[10px] font-medium w-10 text-right">{metrics.evidenceCompleteness}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-28">Verification</span>
                    <Progress value={metrics.verificationPercent} className="h-2 flex-1" />
                    <span className="text-[10px] font-medium w-10 text-right">{metrics.verificationPercent}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Pending Items */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-sm font-semibold">Items Requiring Attention</CardTitle>
          </div>
          <CardDescription className="text-xs">Records pending verification or with issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(repositorySummaries)
              .filter(([, summary]) => summary.pendingVerification > 0 || summary.rejected > 0)
              .slice(0, 8)
              .map(([tabId, summary]) => (
                <div key={tabId} className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium capitalize">{tabId.replace(/-/g, ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {summary.pendingVerification > 0 && (
                      <Badge variant="secondary" className="text-[9px] bg-amber-500/10 text-amber-600">
                        <Clock className="h-2.5 w-2.5 mr-1" />
                        {summary.pendingVerification} pending
                      </Badge>
                    )}
                    {summary.rejected > 0 && (
                      <Badge variant="secondary" className="text-[9px] bg-red-500/10 text-red-600">
                        <XCircle className="h-2.5 w-2.5 mr-1" />
                        {summary.rejected} rejected
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
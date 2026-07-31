import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Download,
  FileText,
  Sheet,
  FileDown,
  BarChart3,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { StatCards } from './StatCards';
import {
  InstitutionGrowthChart,
  InstitutionDistributionChart,
  TopInstitutionsChart,
  RepositoryCompletionChart,
  ActivityHeatmap,
} from './Charts';
import { RecentActivity } from './RecentActivity';
import { handleExport } from './export-utils';
import { adminService } from '@/services/admin.service';
import { ExportFormat } from './types';

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('12months');

  // ── Fetch analytics summary from API ──
  const {
    data: summaryCards,
    isLoading: cardsLoading,
    isError: cardsError,
    isRefetching: cardsRefetching,
    refetch: refetchCards,
  } = useQuery({
    queryKey: ['admin', 'analytics', 'summary', timeRange],
    queryFn: () => adminService.getAnalyticsSummary(timeRange),
    select: data => data.filter(card => card.title !== 'Active Institutions'),
  });

  // ── Fetch institution growth data from API ──
  const {
    data: institutionGrowth,
    isLoading: growthLoading,
    isError: growthError,
    isRefetching: growthRefetching,
    refetch: refetchGrowth,
  } = useQuery({
    queryKey: ['admin', 'analytics', 'institution-growth', timeRange],
    queryFn: () => adminService.getAnalyticsInstitutionGrowth(timeRange),
  });

  // ── Fetch institution distribution data from API ──
  const {
    data: distribution,
    isLoading: distributionLoading,
    isError: distributionError,
    isRefetching: distributionRefetching,
  } = useQuery({
    queryKey: ['admin', 'analytics', 'distribution', timeRange],
    queryFn: () => adminService.getAnalyticsDistribution(timeRange),
  });

  // ── Fetch top institutions data from API ──
  const {
    data: topInstitutions,
    isLoading: topInstLoading,
    isError: topInstError,
    isRefetching: topInstRefetching,
  } = useQuery({
    queryKey: ['admin', 'analytics', 'top-institutions', timeRange],
    queryFn: () => adminService.getAnalyticsTopInstitutions(timeRange, 10),
  });

  // ── Fetch repository completion data from API ──
  const {
    data: repoCompletion,
    isLoading: repoCompletionLoading,
    isError: repoCompletionError,
    isRefetching: repoCompletionRefetching,
  } = useQuery({
    queryKey: ['admin', 'analytics', 'repository-completion', timeRange],
    queryFn: () => adminService.getAnalyticsRepositoryCompletion(timeRange, 10),
  });

  // ── Fetch activity heatmap data from API ──
  const {
    data: heatmapData,
    isLoading: heatmapLoading,
    isError: heatmapError,
    isRefetching: heatmapRefetching,
  } = useQuery({
    queryKey: ['admin', 'analytics', 'activity-heatmap', timeRange],
    queryFn: () => adminService.getAnalyticsActivityHeatmap(timeRange),
  });

  // ── Fetch recent activity data from API ──
  const {
    data: recentActivity,
    isLoading: activityLoading,
    isError: activityError,
    isRefetching: activityRefetching,
  } = useQuery({
    queryKey: ['admin', 'analytics', 'recent-activity', timeRange],
    queryFn: () => adminService.getAnalyticsRecentActivity(timeRange, 10),
  });

  // ── Fetch analytics overview (one call covering all sections, used for exports) ──
  const { data: overviewData } = useQuery({
    queryKey: ['admin', 'analytics', 'overview', timeRange],
    queryFn: () => adminService.getAnalyticsOverview(timeRange),
    staleTime: 60_000, // refresh every minute — exports need fresh data
  });

  const queryClient = useQueryClient();
  const isRefreshing =
    cardsRefetching ||
    growthRefetching ||
    distributionRefetching ||
    topInstRefetching ||
    repoCompletionRefetching ||
    heatmapRefetching ||
    activityRefetching;

  const handleRefresh = () => {
    // Invalidate ALL analytics queries so every hook refetches
    queryClient.invalidateQueries({ queryKey: ['admin', 'analytics'] });
  };

  const overviewLoading = !overviewData;

  const onExport = (format: ExportFormat) => {
    if (overviewData) {
      handleExport(format, overviewData);
    }
  };

  return (
    <div className="space-y-6 p-1">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Platform-wide insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="12months">Last 12 months</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="h-9">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Export Format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onExport('csv')} disabled={overviewLoading}>
                {overviewLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('excel')} disabled={overviewLoading}>
                {overviewLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sheet className="h-4 w-4 mr-2" />
                )}
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('pdf')} disabled={overviewLoading}>
                {overviewLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4 mr-2" />
                )}
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Stat Cards — Loading State */}
      {cardsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <div className="rounded-xl border border-border/50 bg-card p-5 animate-pulse space-y-3">
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="h-7 w-16 bg-muted rounded" />
                <div className="h-3 w-32 bg-muted rounded" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : cardsError ? (
        /* Stat Cards — Error State */
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load analytics</AlertTitle>
          <AlertDescription>
            Could not fetch summary data.{' '}
            <Button
              variant="link"
              className="h-auto p-0 text-destructive-foreground underline"
              onClick={() => refetchCards()}
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <StatCards cards={summaryCards || []} />
      )}

      {/* Charts Row 1: Growth + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {growthLoading ? (
            <div className="rounded-xl border border-border/50 bg-card p-5 animate-pulse h-[350px] flex items-center justify-center">
              <div className="space-y-3 w-full max-w-md">
                <div className="h-4 w-48 bg-muted rounded" />
                <div className="h-3 w-64 bg-muted rounded" />
                <div className="h-[200px] bg-muted rounded mt-6" />
              </div>
            </div>
          ) : growthError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Failed to load institution growth</AlertTitle>
              <AlertDescription>
                <Button
                  variant="link"
                  className="h-auto p-0 text-destructive-foreground underline"
                  onClick={() => refetchGrowth()}
                >
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <InstitutionGrowthChart data={institutionGrowth || []} />
          )}
        </div>
        <div>
          {distributionLoading ? (
            <div className="rounded-xl border border-border/50 bg-card p-5 animate-pulse h-[350px] flex items-center justify-center">
              <div className="space-y-3 w-full max-w-xs">
                <div className="h-4 w-40 bg-muted rounded mx-auto" />
                <div className="h-3 w-52 bg-muted rounded mx-auto" />
                <div className="h-[180px] w-[180px] bg-muted rounded-full mx-auto mt-4" />
              </div>
            </div>
          ) : distributionError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Failed to load distribution</AlertTitle>
              <AlertDescription>Could not fetch distribution data.</AlertDescription>
            </Alert>
          ) : (
            <InstitutionDistributionChart data={distribution || []} />
          )}
        </div>
      </div>

      {/* Charts Row 2: Top Institutions + Repository Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {topInstLoading ? (
          <div className="rounded-xl border border-border/50 bg-card p-5 animate-pulse h-[350px] flex items-center justify-center">
            <div className="space-y-3 w-full max-w-md">
              <div className="h-4 w-36 bg-muted rounded" />
              <div className="h-3 w-48 bg-muted rounded" />
              <div className="h-[200px] bg-muted rounded mt-6" />
            </div>
          </div>
        ) : topInstError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to load top institutions</AlertTitle>
            <AlertDescription>Could not fetch top institutions data.</AlertDescription>
          </Alert>
        ) : (
          <TopInstitutionsChart data={topInstitutions || []} />
        )}

        {repoCompletionLoading ? (
          <div className="rounded-xl border border-border/50 bg-card p-5 animate-pulse h-[350px] flex items-center justify-center">
            <div className="space-y-3 w-full max-w-md">
              <div className="h-4 w-44 bg-muted rounded" />
              <div className="h-3 w-56 bg-muted rounded" />
              <div className="h-[200px] bg-muted rounded mt-6" />
            </div>
          </div>
        ) : repoCompletionError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to load repository completion</AlertTitle>
            <AlertDescription>Could not fetch repository completion data.</AlertDescription>
          </Alert>
        ) : (
          <RepositoryCompletionChart data={repoCompletion || []} />
        )}
      </div>

      {/* Charts Row 3: Heatmap + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {heatmapLoading ? (
          <div className="rounded-xl border border-border/50 bg-card p-5 animate-pulse h-[350px] flex items-center justify-center">
            <div className="space-y-3 w-full max-w-md">
              <div className="h-4 w-36 bg-muted rounded" />
              <div className="h-3 w-48 bg-muted rounded" />
              {/* Simulate heatmap grid rows */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-1">
                  <div className="h-3 w-8 bg-muted rounded shrink-0" />
                  <div className="flex-1 h-3 bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : heatmapError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to load activity heatmap</AlertTitle>
            <AlertDescription>Could not fetch heatmap data.</AlertDescription>
          </Alert>
        ) : (
          <ActivityHeatmap data={heatmapData || []} />
        )}
        {activityLoading ? (
          <div className="rounded-xl border border-border/50 bg-card p-5 animate-pulse h-[350px] flex items-center justify-center">
            <div className="space-y-3 w-full max-w-md">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-44 bg-muted rounded" />
                </div>
                <div className="h-5 w-10 bg-muted rounded-full" />
              </div>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-muted rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-3/4 bg-muted rounded" />
                    <div className="flex gap-2">
                      <div className="h-3 w-20 bg-muted rounded" />
                      <div className="h-3 w-24 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="h-3 w-16 bg-muted rounded shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ) : activityError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to load recent activity</AlertTitle>
            <AlertDescription>Could not fetch recent activity data.</AlertDescription>
          </Alert>
        ) : (
          <RecentActivity data={recentActivity || []} />
        )}
      </div>
    </div>
  );
}

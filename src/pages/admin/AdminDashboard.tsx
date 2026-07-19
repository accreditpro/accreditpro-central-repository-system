import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { StatCards } from './dashboard/StatCards';
import {
  InstitutionGrowthChart,
  CategoryDistributionChart,
  RepositoryCompletionChart,
  TopInstitutionsChart,
} from './dashboard/Charts';
import { RecentActivities } from './dashboard/RecentActivities';
import { TopInstitutionsTable } from './dashboard/TopInstitutionsTable';
import { DashboardSkeleton } from './dashboard/DashboardSkeleton';
import { ErrorState } from './dashboard/ErrorState';
import { adminService } from '@/services/admin.service';
import type { AdminDashboardData } from './dashboard/types';

type DashboardState = 'loading' | 'success' | 'error';

export const AdminDashboard = () => {
  const [state, setState] = useState<DashboardState>('loading');
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setState('loading');
    setErrorMessage('');

    // Step 1: Try the summary endpoint first (all data in one call)
    const summaryResult = await adminService.getDashboardSummary().catch((err) => {
      console.warn('[Dashboard] Summary endpoint failed, falling back to individual endpoints:', err?.message);
      return null;
    });

    if (summaryResult) {
      setData({
        stats: summaryResult.stats || [],
        institutionGrowth: summaryResult.institutionGrowth || [],
        categoryDistribution: summaryResult.categoryDistribution || [],
        repositoryCompletion: summaryResult.repositoryCompletion || [],
        topInstitutions: summaryResult.topInstitutions || [],
        recentActivities: summaryResult.recentActivities || [],
      });
      setLastRefresh(new Date());
      setState('success');
      return;
    }

    // Step 2: Fallback — fetch all data from individual endpoints in parallel
    const [stats, institutionGrowth, categoryDistribution, repositoryCompletion, topInstitutions, recentActivities] =
      await Promise.allSettled([
        adminService.getDashboardStats(),
        adminService.getInstitutionGrowth(),
        adminService.getCategoryDistribution(),
        adminService.getRepositoryCompletion(),
        adminService.getTopInstitutions(),
        adminService.getRecentActivities(),
      ]);

    const unwrap = <T,>(result: PromiseSettledResult<T>): T[] => {
      if (result.status === 'fulfilled') {
        return Array.isArray(result.value) ? result.value : [];
      }
      console.warn('[Dashboard] Endpoint failed:', result.reason?.message);
      return [];
    };

    setData({
      stats: unwrap(stats),
      institutionGrowth: unwrap(institutionGrowth),
      categoryDistribution: unwrap(categoryDistribution),
      repositoryCompletion: unwrap(repositoryCompletion),
      topInstitutions: unwrap(topInstitutions),
      recentActivities: unwrap(recentActivities),
    });

    setLastRefresh(new Date());
    setState('success');
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboard();
    setIsRefreshing(false);
  };

  if (state === 'loading') {
    return <DashboardSkeleton />;
  }

  if (state === 'error') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            System overview and analytics
          </p>
        </div>
        <ErrorState
          title="Failed to load dashboard"
          message={errorMessage || "We couldn't fetch the latest data. Please check your connection and try again."}
          onRetry={fetchDashboard}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            System overview and platform analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] gap-1 font-normal hidden sm:flex">
            <Calendar className="h-3 w-3" />
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-8"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2 h-8">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <StatCards data={data?.stats || []} />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InstitutionGrowthChart data={data?.institutionGrowth || []} />
        <CategoryDistributionChart data={data?.categoryDistribution || []} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RepositoryCompletionChart data={data?.repositoryCompletion || []} />
        <TopInstitutionsChart institutions={data?.topInstitutions || []} />
      </div>

      {/* Tables & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopInstitutionsTable institutions={data?.topInstitutions || []} />
        <RecentActivities activities={data?.recentActivities || []} />
      </div>
    </motion.div>
  );
};

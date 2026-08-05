import { useState, useEffect } from 'react';
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
import {
  statCards,
  topInstitutions,
  recentActivities,
} from './dashboard/mock-data';

type DashboardState = 'loading' | 'success' | 'error';

export const AdminDashboard = () => {
  const [state, setState] = useState<DashboardState>('loading');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setState('success');
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefresh(new Date());
      setIsRefreshing(false);
    }, 800);
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
          message="We couldn't fetch the latest data. Please check your connection and try again."
          onRetry={() => {
            setState('loading');
            setTimeout(() => setState('success'), 1200);
          }}
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
      <StatCards data={statCards} />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InstitutionGrowthChart />
        <CategoryDistributionChart />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RepositoryCompletionChart />
        <TopInstitutionsChart />
      </div>

      {/* Tables & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopInstitutionsTable institutions={topInstitutions} />
        <RecentActivities activities={recentActivities} />
      </div>
    </motion.div>
  );
};


import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
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
import { AdminDashboardData } from './dashboard/types';
import {
  statCards as defaultStatCards,
  topInstitutions as defaultTopInstitutions,
  recentActivities as defaultRecentActivities,
} from './dashboard/mock-data';

type DashboardState = 'loading' | 'success' | 'error';

export const AdminDashboard = () => {
  const [state, setState] = useState<DashboardState>('loading');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setState('loading');
    }

    try {
      const summary = await adminService.getDashboardSummary();
      setDashboardData(summary);
      setLastRefresh(new Date());
      setState('success');
    } catch {
      // If full summary endpoint fails, try individual stats or fallback to default data gracefully
      try {
        const stats = await adminService.getDashboardStats();
        const topInstitutions = await adminService.getTopInstitutions();
        const recentActivities = await adminService.getRecentActivities();
        const repositoryCompletion = await adminService.getRepositoryCompletion();
        const institutionGrowth = await adminService.getInstitutionGrowth();
        const categoryDistribution = await adminService.getCategoryDistribution();

        setDashboardData({
          stats,
          topInstitutions,
          recentActivities,
          repositoryCompletion,
          institutionGrowth,
          categoryDistribution,
        });
        setLastRefresh(new Date());
        setState('success');
      } catch (err) {
        console.warn('API error loading admin dashboard, rendering default layout:', err);
        // Fallback gracefully to default structure if offline / stage server unavailable
        setState('success');
      }
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Fetch full summary from GET /api/admin/dashboard/summary
      const summary = await adminService.getDashboardSummary();
      const exportStats = summary?.stats || stats;
      const exportInstitutions = summary?.topInstitutions || topInstitutions;
      const exportActivities = summary?.recentActivities || recentActivities;
      const exportCategories = summary?.categoryDistribution || categoryDistribution || [];

      let csv = '';

      // Section 1: Key Metrics
      csv += '1. DASHBOARD KEY METRICS\n';
      csv += 'Metric Title,Value,Change (%),Change Label\n';
      exportStats.forEach((item) => {
        const title = `"${(item.title || '').replace(/"/g, '""')}"`;
        const value = `"${(item.value || '').toString().replace(/"/g, '""')}"`;
        const changeLabel = `"${(item.changeLabel || '').replace(/"/g, '""')}"`;
        csv += `${title},${value},${item.change},${changeLabel}\n`;
      });

      // Section 2: Top Active Institutions
      csv += '\n2. TOP ACTIVE INSTITUTIONS\n';
      csv += 'Institution Name,Category,Status,Documents Uploaded,Repository Completion (%),Last Active\n';
      exportInstitutions.forEach((inst) => {
        const name = `"${(inst.name || '').replace(/"/g, '""')}"`;
        const category = `"${(inst.category || '').replace(/"/g, '""')}"`;
        const status = `"${(inst.status || '').replace(/"/g, '""')}"`;
        const lastActive = `"${(inst.lastActive || '').replace(/"/g, '""')}"`;
        csv += `${name},${category},${status},${inst.documentsUploaded || 0},${inst.repositoryCompletion || 0}%,${lastActive}\n`;
      });

      // Section 3: Recent Activities
      csv += '\n3. RECENT PLATFORM ACTIVITIES\n';
      csv += 'Activity Title,User,Institution,Timestamp,Type,Description\n';
      exportActivities.forEach((act) => {
        const title = `"${(act.title || '').replace(/"/g, '""')}"`;
        const user = `"${(act.user || '').replace(/"/g, '""')}"`;
        const inst = `"${(act.institution || '').replace(/"/g, '""')}"`;
        const ts = `"${(act.timestamp || '').replace(/"/g, '""')}"`;
        const type = `"${(act.type || '').replace(/"/g, '""')}"`;
        const desc = `"${(act.description || '').replace(/"/g, '""')}"`;
        csv += `${title},${user},${inst},${ts},${type},${desc}\n`;
      });

      // Section 4: Category Distribution
      if (exportCategories.length > 0) {
        csv += '\n4. CATEGORY DISTRIBUTION\n';
        csv += 'Category Name,Count\n';
        exportCategories.forEach((cat) => {
          const name = `"${(cat.name || '').replace(/"/g, '""')}"`;
          csv += `${name},${cat.value || 0}\n`;
        });
      }

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `admin_dashboard_summary_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Complete dashboard exported successfully');
    } catch {
      toast.error('Failed to export dashboard summary');
    } finally {
      setIsExporting(false);
    }
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
          onRetry={() => fetchDashboardData()}
        />
      </div>
    );
  }

  // Extract data or fall back to default arrays
  const stats = dashboardData?.stats && dashboardData.stats.length > 0 ? dashboardData.stats : defaultStatCards;
  const topInstitutions = dashboardData?.topInstitutions && dashboardData.topInstitutions.length > 0 ? dashboardData.topInstitutions : defaultTopInstitutions;
  const recentActivities = dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? dashboardData.recentActivities : defaultRecentActivities;
  const institutionGrowth = dashboardData?.institutionGrowth;
  const categoryDistribution = dashboardData?.categoryDistribution;
  const repositoryCompletion = dashboardData?.repositoryCompletion;

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
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-8"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className={cn('h-3.5 w-3.5', isExporting && 'animate-spin')} />
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export'}</span>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <StatCards data={stats} />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InstitutionGrowthChart data={institutionGrowth} />
        <CategoryDistributionChart data={categoryDistribution} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RepositoryCompletionChart data={repositoryCompletion} />
        <TopInstitutionsChart data={topInstitutions} />
      </div>

      {/* Tables & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopInstitutionsTable institutions={topInstitutions} />
        <RecentActivities activities={recentActivities} />
      </div>
    </motion.div>
  );
};



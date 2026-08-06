import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Sheet, FileDown, BarChart3, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import {
  analyticsCards,
  institutionGrowthData,
  institutionDistributionData,
  topInstitutionsData,
  repositoryCompletionData,
  activityHeatmapData,
  recentActivityData,
} from './mock-data';
import {
  AnalyticsCard,
  InstitutionGrowthData,
  InstitutionDistributionData,
  TopInstitutionData,
  RepositoryCompletionData,
  ActivityHeatmapData,
  RecentActivityItem,
  ExportFormat,
} from './types';
import { toast } from 'sonner';

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('12months');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live state with fallbacks to mock data
  const [cards, setCards] = useState<AnalyticsCard[]>(analyticsCards);
  const [growthData, setGrowthData] = useState<InstitutionGrowthData[]>(institutionGrowthData);
  const [distributionData, setDistributionData] = useState<InstitutionDistributionData[]>(institutionDistributionData);
  const [topInstitutions, setTopInstitutions] = useState<TopInstitutionData[]>(topInstitutionsData);
  const [completionData, setCompletionData] = useState<RepositoryCompletionData[]>(repositoryCompletionData);
  const [heatmapData, setHeatmapData] = useState<ActivityHeatmapData[]>(activityHeatmapData);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>(recentActivityData);

  const fetchAnalyticsData = useCallback(async (range: string) => {
    setIsRefreshing(true);
    try {
      // 1. Stat cards summary
      const summaryCards = await adminService.getAnalyticsSummary(range).catch(() => null);
      if (summaryCards && summaryCards.length > 0) {
        setCards(summaryCards);
      }

      // 2. Institution Growth
      const growth = await adminService.getAnalyticsInstitutionGrowth(range).catch(() => null);
      if (growth && growth.length > 0) {
        setGrowthData(growth);
      }

      // 3. Category Distribution
      const distribution = await adminService.getAnalyticsDistribution(range).catch(() => null);
      if (distribution && distribution.length > 0) {
        setDistributionData(distribution);
      }

      // 4. Top Institutions
      const topInst = await adminService.getAnalyticsTopInstitutions(range).catch(() => null);
      if (topInst && topInst.length > 0) {
        setTopInstitutions(topInst as any);
      }

      // 5. Repository Completion
      const completion = await adminService.getAnalyticsRepositoryCompletion(range).catch(() => null);
      if (completion && completion.length > 0) {
        setCompletionData(completion);
      }

      // 6. Activity Heatmap
      const heatmap = await adminService.getAnalyticsActivityHeatmap(range).catch(() => null);
      if (heatmap && heatmap.length > 0) {
        setHeatmapData(heatmap);
      }

      // 7. Recent Activity
      const activity = await adminService.getAnalyticsRecentActivity(range).catch(() => null);
      if (activity && activity.length > 0) {
        setRecentActivity(activity);
      }
    } catch {
      toast.error('Failed to refresh analytics data');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData(timeRange);
  }, [timeRange, fetchAnalyticsData]);

  const handleRefresh = () => {
    fetchAnalyticsData(timeRange);
  };

  const onExport = (format: ExportFormat) => {
    handleExport(format, {
      cards,
      growthData,
      topInstitutions,
      completionData,
      recentActivity,
    });
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
              <DropdownMenuItem onClick={() => onExport('csv')}>
                <FileText className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('excel')}>
                <Sheet className="h-4 w-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('pdf')}>
                <FileDown className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Stat Cards - Clean 5-column row */}
      <StatCards cards={cards.slice(0, 5)} />

      {/* Charts Row 1: Growth + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <InstitutionGrowthChart data={growthData} />
        </div>
        <div>
          <InstitutionDistributionChart data={distributionData} />
        </div>
      </div>

      {/* Charts Row 2: Top Institutions + Repository Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopInstitutionsChart data={topInstitutions} />
        <RepositoryCompletionChart data={completionData} />
      </div>

      {/* Charts Row 3: Heatmap + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActivityHeatmap data={heatmapData} />
        <RecentActivity data={recentActivity} />
      </div>
    </div>
  );
}
import { useState, useEffect, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { RepositoryModuleConfig } from '../types';
import { repositoryHealth, departmentInfo, evidenceDocuments } from '../repository-configs';
import { RepositoryTabContent } from './RepositoryTabContent';
import { getModuleTabActiveClasses } from './module-tab-styles';
import { EvidenceUploadDialog, EvidenceCategory } from '@/components/shared/EvidenceUploadDialog';
import {
  getResearchRepositoryHealth,
  getResearchDashboardSummary,
  ResearchRepositoryHealth,
  ResearchDashboardResponse,
} from '@/services/research-repository.service';
import {
  LayoutDashboard,
  FileText,
  Shield,
  BookOpen,
  BookMarked,
  FolderKanban,
  Briefcase,
  FlaskConical,
  Users,
  GraduationCap,
  Award,
  Trophy,
  TrendingUp,
  CheckCircle2,
  Clock,
  Eye,
  DownloadCloud,
  Upload,
  DollarSign,
  Building2,
  Zap,
  Book,
  FileSpreadsheet,
  Activity,
  BarChart3,
  PieChart,
} from 'lucide-react';

interface ResearchModuleProps {
  config: RepositoryModuleConfig;
  academicYear?: string;
  departmentId?: number;
  departmentName?: string;
}

const researchUploadCategories: EvidenceCategory[] = [
  { id: 'journals', label: 'Journal Publications', icon: <FileText className="h-4 w-4 text-primary" /> },
  { id: 'conferences', label: 'Conference Publications', icon: <FileSpreadsheet className="h-4 w-4 text-primary" /> },
  { id: 'patents', label: 'Patents', icon: <Shield className="h-4 w-4 text-primary" /> },
  { id: 'books', label: 'Books & Book Chapters', icon: <Book className="h-4 w-4 text-primary" /> },
  { id: 'sponsored', label: 'Sponsored Projects', icon: <DollarSign className="h-4 w-4 text-primary" /> },
  { id: 'consultancy', label: 'Consultancy Projects', icon: <Briefcase className="h-4 w-4 text-primary" /> },
  { id: 'research-projects', label: 'Research Projects', icon: <FlaskConical className="h-4 w-4 text-primary" /> },
  { id: 'student', label: 'Student Research & Publications', icon: <GraduationCap className="h-4 w-4 text-primary" /> },
];

const tabIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'dashboard': LayoutDashboard,
  'faculty-journal-publications': FileText,
  'faculty-conference-publications': FileSpreadsheet,
  'faculty-patents': Shield,
  'faculty-books': Book,
  'faculty-book-chapters': BookMarked,
  'faculty-sponsored-projects': DollarSign,
  'faculty-consultancy-projects': Briefcase,
  'faculty-research-projects': FlaskConical,
  'student-journal-publications': FileText,
  'student-conference-publications': FileSpreadsheet,
  'student-patents': Shield,
  'student-books': Book,
  'student-book-chapters': BookMarked,
  'student-research-projects': FlaskConical,
  'department-project-development': Building2,
  'supporting-documents': FileText,
};

export const ResearchModule = ({ config, academicYear, departmentId, departmentName }: ResearchModuleProps) => {
  const { user } = useAuth();
  const effectiveDeptId = departmentId || user?.departmentId || 4;
  const effectiveYear = academicYear || '2025-26';
  const effectiveDeptName = departmentName || user?.department || departmentInfo.department;

  const [activeTab, setActiveTab] = useState('dashboard');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const activeClasses = getModuleTabActiveClasses(config.id);

  const [healthMetrics, setHealthMetrics] = useState<ResearchRepositoryHealth | null>(null);
  const [dashboardData, setDashboardData] = useState<ResearchDashboardResponse | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadMetrics = async () => {
      setLoadingMetrics(true);
      try {
        const [healthRes, dashRes] = await Promise.allSettled([
          getResearchRepositoryHealth(effectiveYear, effectiveDeptId),
          getResearchDashboardSummary(effectiveYear, effectiveDeptId),
        ]);
        if (!isMounted) return;
        if (healthRes.status === 'fulfilled' && healthRes.value) {
          setHealthMetrics(healthRes.value);
        }
        if (dashRes.status === 'fulfilled' && dashRes.value) {
          setDashboardData(dashRes.value);
        }
      } catch (err) {
        console.warn('Error loading research metrics:', err);
      } finally {
        if (isMounted) setLoadingMetrics(false);
      }
    };
    loadMetrics();
    return () => {
      isMounted = false;
    };
  }, [effectiveDeptId, effectiveYear]);

  const fallbackMetrics = repositoryHealth[config.id] || { dataCompleteness: 74, evidenceCompleteness: 60, verificationPercent: 65, readinessScore: 66 };

  // Score card data (matching exact UI)
  const moduleScores = [
    {
      label: 'Data Completeness',
      value: healthMetrics?.dataCompleteness ?? dashboardData?.metrics?.dataCompleteness ?? fallbackMetrics.dataCompleteness,
      color: 'text-indigo-600 bg-indigo-500/10',
    },
    {
      label: 'Evidence Score',
      value: healthMetrics?.evidenceCompleteness ?? dashboardData?.metrics?.evidenceScore ?? fallbackMetrics.evidenceCompleteness,
      color: 'text-violet-600 bg-violet-500/10',
    },
    {
      label: 'Verification Score',
      value: healthMetrics?.verificationPercent ?? dashboardData?.metrics?.verificationScore ?? fallbackMetrics.verificationPercent,
      color: 'text-emerald-600 bg-emerald-500/10',
    },
    {
      label: 'Readiness Score',
      value: healthMetrics?.readinessScore ?? dashboardData?.metrics?.readinessScore ?? fallbackMetrics.readinessScore,
      color: 'text-pink-600 bg-pink-500/10',
    },
  ];

  // Map module summary for rapid lookup
  const modSummaryMap = useMemo(() => {
    const map: Record<string, { count: number; completionPercentage?: number; status?: string }> = {};
    (dashboardData?.moduleSummary || []).forEach((item) => {
      if (item.moduleId) map[item.moduleId] = item;
      if (item.label) map[item.label.toLowerCase()] = item;
    });
    return map;
  }, [dashboardData]);

  // KPI data for dashboard
  const kpiCards = useMemo(() => [
    {
      label: 'Faculty Journal Pubs',
      value: String(modSummaryMap['faculty-journal-publications']?.count ?? 45),
      icon: FileText,
      color: 'text-blue-600 bg-blue-500/10',
    },
    {
      label: 'Faculty Conference Pubs',
      value: String(modSummaryMap['faculty-conference-publications']?.count ?? 32),
      icon: FileSpreadsheet,
      color: 'text-violet-600 bg-violet-500/10',
    },
    {
      label: 'Faculty Patents',
      value: String(modSummaryMap['faculty-patents']?.count ?? 8),
      icon: Shield,
      color: 'text-emerald-600 bg-emerald-500/10',
    },
    {
      label: 'Faculty Books/Chapters',
      value: String((modSummaryMap['faculty-books']?.count ?? 5) + (modSummaryMap['faculty-book-chapters']?.count ?? 7)),
      icon: BookOpen,
      color: 'text-amber-600 bg-amber-500/10',
    },
    {
      label: 'Sponsored Projects',
      value: String(dashboardData?.financialSummary?.totalSponsoredProjects ?? modSummaryMap['faculty-sponsored-projects']?.count ?? 6),
      icon: DollarSign,
      color: 'text-orange-600 bg-orange-500/10',
    },
    {
      label: 'Consultancy Projects',
      value: String(modSummaryMap['faculty-consultancy-projects']?.count ?? 4),
      icon: Briefcase,
      color: 'text-purple-600 bg-purple-500/10',
    },
    {
      label: 'Student Publications',
      value: String((modSummaryMap['student-journal-publications']?.count ?? 18) + (modSummaryMap['student-conference-publications']?.count ?? 10)),
      icon: Users,
      color: 'text-cyan-600 bg-cyan-500/10',
    },
    {
      label: 'Student Patents',
      value: String(modSummaryMap['student-patents']?.count ?? 3),
      icon: Award,
      color: 'text-rose-600 bg-rose-500/10',
    },
  ], [modSummaryMap, dashboardData]);

  const totalResearchFunding = dashboardData?.financialSummary?.totalResearchFunding ?? 25000000;
  const consultancyRevenue = dashboardData?.financialSummary?.consultancyRevenue ?? 4500000;

  const rawActivities = useMemo(() => {
    const raw =
      dashboardData?.recentActivity ??
      (dashboardData as any)?.recentActivities ??
      (dashboardData as any)?.activities ??
      (dashboardData as any)?.activityLogs ??
      (dashboardData as any)?.recent_activities ??
      (dashboardData as any)?.recent_activity;
    if (Array.isArray(raw)) return raw;
    return null;
  }, [dashboardData]);

  const recentActivities = useMemo(() => {
    if (rawActivities && rawActivities.length > 0) {
      return rawActivities.map((activity: any, idx: number) => {
        let dateStr = activity.date || activity.timeAgo || 'Recently';
        const ts = activity.timestamp || activity.createdAt || activity.createdDate || activity.updatedAt || activity.date;
        if (ts) {
          try {
            const parsed = new Date(ts);
            if (!isNaN(parsed.getTime())) {
              dateStr = formatDistanceToNow(parsed, { addSuffix: true });
            }
          } catch {
            dateStr = String(ts);
          }
        }
        const title =
          activity.title ||
          activity.description ||
          activity.action ||
          activity.details ||
          activity.activityName ||
          activity.name ||
          `Research activity #${idx + 1}`;
        const type =
          activity.type ||
          activity.module ||
          activity.category ||
          activity.moduleName ||
          'Research Activity';
        const isCompleted =
          activity.status === 'completed' ||
          activity.status === 'verified' ||
          activity.status === 'approved' ||
          activity.status === 'ACTIVE' ||
          activity.isVerified;

        return {
          title,
          date: dateStr,
          type,
          status: isCompleted ? 'completed' : 'in-progress',
        };
      });
    }
    // If backend returned empty list or no activities, return empty array (no dummy data)
    return [];
  }, [rawActivities]);

  const healthData = useMemo(() => {
    return config.tabs
      .filter((t) => t.id !== 'dashboard' && t.id !== 'supporting-documents')
      .map((t) => {
        const item = modSummaryMap[t.id];
        const tabMetric = healthMetrics?.tabWiseMetrics?.[t.id];
        const records = item?.count ?? tabMetric?.recordsUploaded ?? 25;
        const completion = item?.completionPercentage ?? tabMetric?.verified ?? Math.min(100, Math.max(60, records * 3));
        return {
          module: t.label,
          completion,
          records,
        };
      });
  }, [config.tabs, modSummaryMap, healthMetrics]);

  // Render Dashboard
  const renderDashboard = () => {
    const categoryColors = [
      'bg-blue-50 dark:bg-blue-950/20 text-blue-600',
      'bg-violet-50 dark:bg-violet-950/20 text-violet-600',
      'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600',
      'bg-amber-50 dark:bg-amber-950/20 text-amber-600',
      'bg-orange-50 dark:bg-orange-950/20 text-orange-600',
      'bg-purple-50 dark:bg-purple-950/20 text-purple-600',
      'bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600',
      'bg-rose-50 dark:bg-rose-950/20 text-rose-600',
      'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600',
      'bg-teal-50 dark:bg-teal-950/20 text-teal-600',
      'bg-pink-50 dark:bg-pink-950/20 text-pink-600',
      'bg-green-50 dark:bg-green-950/20 text-green-600',
      'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600',
      'bg-sky-50 dark:bg-sky-950/20 text-sky-600',
      'bg-lime-50 dark:bg-lime-950/20 text-lime-600',
    ];

    const annualFacultyStats = [
      { label: 'Journal Pubs', value: String(modSummaryMap['faculty-journal-publications']?.count ?? 45), icon: FileText },
      { label: 'Conference Pubs', value: String(modSummaryMap['faculty-conference-publications']?.count ?? 32), icon: FileSpreadsheet },
      { label: 'Patents Filed', value: String(modSummaryMap['faculty-patents']?.count ?? 8), icon: Shield },
      { label: 'Books Published', value: String(modSummaryMap['faculty-books']?.count ?? 5), icon: Book },
      { label: 'Book Chapters', value: String(modSummaryMap['faculty-book-chapters']?.count ?? 7), icon: BookMarked },
      { label: 'Sponsored Projects', value: String(dashboardData?.financialSummary?.totalSponsoredProjects ?? modSummaryMap['faculty-sponsored-projects']?.count ?? 6), icon: DollarSign },
      { label: 'Consultancy Projects', value: String(modSummaryMap['faculty-consultancy-projects']?.count ?? 4), icon: Briefcase },
      { label: 'Research Projects', value: String(modSummaryMap['faculty-research-projects']?.count ?? 10), icon: FlaskConical },
    ];

    const annualStudentStats = [
      { label: 'Student Journal Pubs', value: String(modSummaryMap['student-journal-publications']?.count ?? 18), colorClass: 'text-pink-600', bgClass: 'from-pink-50 to-pink-100/50 dark:from-pink-950/20 dark:to-pink-900/10 border-pink-200 dark:border-pink-900/30' },
      { label: 'Student Conference Pubs', value: String(modSummaryMap['student-conference-publications']?.count ?? 10), colorClass: 'text-cyan-600', bgClass: 'from-cyan-50 to-cyan-100/50 dark:from-cyan-950/20 dark:to-cyan-900/10 border-cyan-200 dark:border-cyan-900/30' },
      { label: 'Student Patents', value: String(modSummaryMap['student-patents']?.count ?? 3), colorClass: 'text-violet-600', bgClass: 'from-violet-50 to-violet-100/50 dark:from-violet-950/20 dark:to-violet-900/10 border-violet-200 dark:border-violet-900/30' },
      { label: 'Dept Project Developments', value: String(modSummaryMap['department-project-development']?.count ?? 5), colorClass: 'text-orange-600', bgClass: 'from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 border-orange-200 dark:border-orange-900/30' },
    ];

    const evidenceCompletionItems = [
      { label: 'Faculty Journal Pubs', value: healthMetrics?.tabWiseMetrics?.['faculty-journal-publications']?.verified ?? modSummaryMap['faculty-journal-publications']?.completionPercentage ?? 82 },
      { label: 'Faculty Conference Pubs', value: healthMetrics?.tabWiseMetrics?.['faculty-conference-publications']?.verified ?? modSummaryMap['faculty-conference-publications']?.completionPercentage ?? 75 },
      { label: 'Faculty Patents', value: healthMetrics?.tabWiseMetrics?.['faculty-patents']?.verified ?? modSummaryMap['faculty-patents']?.completionPercentage ?? 68 },
      { label: 'Faculty Books', value: healthMetrics?.tabWiseMetrics?.['faculty-books']?.verified ?? modSummaryMap['faculty-books']?.completionPercentage ?? 90 },
      { label: 'Faculty Book Chapters', value: healthMetrics?.tabWiseMetrics?.['faculty-book-chapters']?.verified ?? modSummaryMap['faculty-book-chapters']?.completionPercentage ?? 85 },
      { label: 'Faculty Sponsored Projects', value: healthMetrics?.tabWiseMetrics?.['faculty-sponsored-projects']?.verified ?? modSummaryMap['faculty-sponsored-projects']?.completionPercentage ?? 70 },
      { label: 'Faculty Consultancy', value: healthMetrics?.tabWiseMetrics?.['faculty-consultancy-projects']?.verified ?? modSummaryMap['faculty-consultancy-projects']?.completionPercentage ?? 65 },
      { label: 'Faculty Research Projects', value: healthMetrics?.tabWiseMetrics?.['faculty-research-projects']?.verified ?? modSummaryMap['faculty-research-projects']?.completionPercentage ?? 72 },
      { label: 'Student Journal Pubs', value: healthMetrics?.tabWiseMetrics?.['student-journal-publications']?.verified ?? modSummaryMap['student-journal-publications']?.completionPercentage ?? 78 },
      { label: 'Student Conference Pubs', value: healthMetrics?.tabWiseMetrics?.['student-conference-publications']?.verified ?? modSummaryMap['student-conference-publications']?.completionPercentage ?? 72 },
      { label: 'Student Patents', value: healthMetrics?.tabWiseMetrics?.['student-patents']?.verified ?? modSummaryMap['student-patents']?.completionPercentage ?? 60 },
      { label: 'Student Books', value: healthMetrics?.tabWiseMetrics?.['student-books']?.verified ?? modSummaryMap['student-books']?.completionPercentage ?? 88 },
      { label: 'Student Book Chapters', value: healthMetrics?.tabWiseMetrics?.['student-book-chapters']?.verified ?? modSummaryMap['student-book-chapters']?.completionPercentage ?? 82 },
      { label: 'Student Research Projects', value: healthMetrics?.tabWiseMetrics?.['student-research-projects']?.verified ?? modSummaryMap['student-research-projects']?.completionPercentage ?? 70 },
      { label: 'Dept Project Dev', value: healthMetrics?.tabWiseMetrics?.['department-project-development']?.verified ?? modSummaryMap['department-project-development']?.completionPercentage ?? 75 },
    ];

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <Card key={kpi.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <kpi.icon className={`h-5 w-5 ${kpi.color.split(' ')[0]}`} />
                  <Badge variant="secondary" className="text-xs font-medium">
                    <Activity className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Research Funding & Consultancy Revenue */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10 border-emerald-200 dark:border-emerald-900/30">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Total Research Funding</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {dashboardData?.financialSummary?.totalResearchFundingFormatted || `₹${(totalResearchFunding / 10000000).toFixed(2)} Cr`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-600 font-medium">+18%</span>
                <span>vs last academic year</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 border-amber-200 dark:border-amber-900/30">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Consultancy Revenue</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {dashboardData?.financialSummary?.consultancyRevenueFormatted || `₹${(consultancyRevenue / 100000).toFixed(2)} L`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-amber-600 font-medium">+12%</span>
                <span>vs last academic year</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Module Health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Module Health</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[380px] pr-2">
                <div className="space-y-3">
                  {healthData.map((item) => (
                    <div key={item.module} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium truncate">{item.module}</span>
                          <span className="text-xs text-muted-foreground">{item.records} records</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              item.completion >= 90 ? 'bg-green-500' : item.completion >= 75 ? 'bg-blue-500' : item.completion >= 60 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${item.completion}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-semibold w-10 text-right">{item.completion}%</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[380px] pr-2">
                <div className="space-y-3">
                  {recentActivities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
                      <Activity className="h-8 w-8 text-muted-foreground/40 mb-2" />
                      <p className="text-sm font-medium text-muted-foreground">No recent activities recorded</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Recent activities will appear here as records are added and verified in the repository.
                      </p>
                    </div>
                  ) : (
                    recentActivities.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="mt-0.5">
                          {activity.status === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{activity.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-xs py-0 px-1.5">{activity.type}</Badge>
                            <span className="text-xs text-muted-foreground">{activity.date}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Annual Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Annual Summary ({effectiveYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {annualFacultyStats.map((stat, idx) => (
                <div key={stat.label} className="text-center p-3 rounded-lg border border-border/50">
                  <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${categoryColors[idx]} mb-1`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <div className="text-lg font-bold">{stat.value}</div>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {annualStudentStats.map((stat) => (
                <div key={stat.label} className={cn('p-4 rounded-xl bg-gradient-to-br border', stat.bgClass)}>
                  <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                  <p className={cn('text-xl font-bold', stat.colorClass)}>{stat.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Evidence Completion */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Evidence Completion Percentage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {evidenceCompletionItems.map((item) => (
                <div key={item.label} className="p-3 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-medium truncate">{item.label}</span>
                    <span className="text-xs font-bold">{item.value}%</span>
                  </div>
                  <Progress value={item.value} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render Supporting Documents
  const renderSupportingDocs = () => {
    const totalDocs = evidenceDocuments.length;
    const categories = [
      { name: 'Journal Publication Proofs', count: 45, icon: FileText },
      { name: 'Conference Paper Proofs', count: 32, icon: FileSpreadsheet },
      { name: 'Patent Documents', count: 8, icon: Shield },
      { name: 'Book Publication Documents', count: 5, icon: Book },
      { name: 'Book Chapter Documents', count: 7, icon: BookMarked },
      { name: 'Sponsored Project Documents', count: 6, icon: DollarSign },
      { name: 'Consultancy Project Documents', count: 4, icon: Briefcase },
      { name: 'Research Project Documents', count: 10, icon: FlaskConical },
      { name: 'Student Publication Proofs', count: 28, icon: Users },
      { name: 'Student Patent Documents', count: 3, icon: Award },
      { name: 'Student Research Docs', count: 15, icon: GraduationCap },
      { name: 'Project Development Docs', count: 5, icon: Building2 },
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Supporting Documents Repository</h3>
            <p className="text-sm text-muted-foreground">Central repository for all research evidence documents</p>
          </div>
          <Button className="gap-2" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm py-1 px-3">
            <FileText className="h-4 w-4 mr-1.5" />
            {categories.length} Categories
          </Badge>
          <Badge variant="outline" className="text-sm py-1 px-3">
            <Eye className="h-4 w-4 mr-1.5" />
            {totalDocs} Total Documents
          </Badge>
        </div>

        <div className="relative max-w-sm">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search document categories..." className="pl-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card key={cat.name} className="hover:shadow-md transition-all hover:border-primary/30 cursor-pointer group">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors flex items-center gap-2">
                    <cat.icon className="h-4 w-4 text-muted-foreground" />
                    {cat.name}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">{cat.count}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <DownloadCloud className="h-3.5 w-3.5" />
                  <span>{cat.count} documents available</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Evidence table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Document Uploads</CardTitle>
              <Badge variant="secondary" className="text-[10px]">{evidenceDocuments.length} documents</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-medium">Document</th>
                    <th className="text-left p-3 font-medium">Category</th>
                    <th className="text-left p-3 font-medium">Version</th>
                    <th className="text-left p-3 font-medium">Uploaded By</th>
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {evidenceDocuments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <FileText className="h-6 w-6 text-muted-foreground/30" />
                          <p className="text-xs font-medium">No supporting documents uploaded</p>
                          <p className="text-[10px] text-muted-foreground/60">
                            Use the &quot;Upload Document&quot; button to upload research evidence documents.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    evidenceDocuments.slice(0, 5).map((doc) => (
                      <tr key={doc.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-xs font-medium truncate max-w-[180px]">{doc.name}</span>
                          </div>
                        </td>
                        <td className="p-3"><Badge variant="outline" className="text-[9px]">{doc.category}</Badge></td>
                        <td className="p-3 text-muted-foreground">{doc.version}</td>
                        <td className="p-3 text-muted-foreground">{doc.uploadedBy}</td>
                        <td className="p-3 text-muted-foreground">{doc.uploadedDate}</td>
                        <td className="p-3">
                          <Badge variant="secondary" className={cn('text-[9px]',
                            doc.status === 'verified' && 'bg-emerald-500/10 text-emerald-600',
                            doc.status === 'pending' && 'bg-amber-500/10 text-amber-600',
                            doc.status === 'rejected' && 'bg-red-500/10 text-red-600',
                            doc.status === 'uploaded' && 'bg-blue-500/10 text-blue-600',
                          )}>{doc.status}</Badge>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-0.5">
                            <Button variant="ghost" size="icon" className="h-6 w-6"><Eye className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6"><DownloadCloud className="h-3 w-3" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Evidence Upload Dialog */}
        <EvidenceUploadDialog
          open={uploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
          title="Research Supporting Documents"
          subtitle="Upload research evidence documents across all research categories"
          categories={researchUploadCategories}
        />
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{config.label}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{config.description}</p>
          </div>
        </div>
        {/* Score Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {moduleScores.map((metric) => (
            <div key={metric.label} className="p-3 rounded-xl border border-border/50 bg-card">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{metric.label}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('text-xl font-bold', metric.color.split(' ')[0])}>{metric.value}%</span>
                <Progress value={metric.value} className="h-1.5 flex-1" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); }} className="w-full">
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl flex-wrap gap-0.5">
          {config.tabs.map((tab) => {
            const Icon = tabIcons[tab.id] || FileText;
            const isActive = activeTab === tab.id;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all',
                  isActive && activeClasses.ring,
                  !isActive && activeClasses.hover
                )}
              >
                <Icon className={cn('h-3.5 w-3.5', isActive && activeClasses.icon)} />
                <span className="hidden md:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {config.tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-4">
            {tab.id === 'dashboard' ? (
              renderDashboard()
            ) : tab.id === 'supporting-documents' ? (
              renderSupportingDocs()
            ) : (
              <RepositoryTabContent
                tabConfig={tab}
                academicYear={effectiveYear}
                departmentId={effectiveDeptId}
                departmentName={effectiveDeptName}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

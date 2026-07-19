import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { RepositoryModuleConfig } from '../types';
import { repositoryHealth } from '../repository-configs';
import { RepositoryTabContent } from './RepositoryTabContent';
import { FacultyProfileTab } from './FacultyProfileTab';
import { FacultyQualificationsTab } from './FacultyQualificationsTab';
import { FacultyEmploymentTab } from './FacultyEmploymentTab';
import { FacultyFdpsTab } from './FacultyFdpsTab';
import { CurriculumTab } from '@/pages/academic-repository/components/CurriculumTab';
import { CoursesTab } from '@/pages/academic-repository/components/CoursesTab';
import { AcademicCalendarTab } from '@/pages/academic-repository/components/AcademicCalendarTab';
import { ValueAddedCoursesTab } from '@/pages/academic-repository/components/ValueAddedCoursesTab';
import { MoocsTab } from '@/pages/academic-repository/components/MoocsTab';
import { StudentProfileTab } from './StudentProfileTab';
import { StudentAdmissionTab } from './StudentAdmissionTab';
import { StudentDiversityTab } from './StudentDiversityTab';
import { StudentPerformanceTab } from './StudentPerformanceTab';
import { StudentProgressionTab } from './StudentProgressionTab';
import { StudentScholarshipTab } from './StudentScholarshipTab';
import { StudentAchievementTab } from './StudentAchievementTab';
import { ResearchPublicationTab } from './ResearchPublicationTab';
import { ResearchPatentTab } from './ResearchPatentTab';
import { ResearchGrantTab } from './ResearchGrantTab';
import { ResearchSponsoredProjectTab } from './ResearchSponsoredProjectTab';
import { ResearchConsultancyTab } from './ResearchConsultancyTab';
import { AlumniDetailTab } from './AlumniDetailTab';
import { AlumniEmploymentTab } from './AlumniEmploymentTab';
import { AlumniHigherEducationTab } from './AlumniHigherEducationTab';
import { AlumniEngagementTab } from './AlumniEngagementTab';
import { AlumniContributionTab } from './AlumniContributionTab';
import { AlumniMentorshipTab } from './AlumniMentorshipTab';
import { AlumniAchievementTab } from './AlumniAchievementTab';
import { facultyService } from '@/services/faculty.service';
import { useAuth } from '@/hooks/useAuth';
import {
  GraduationCap,
  Users,
  Users2,
  UsersRound,
  BookOpen,
  FlaskConical,
  FileText,
  Calendar,
  CalendarDays,
  Award,
  Globe,
  FolderOpen,
  Shield,
  Banknote,
  Briefcase,
  FolderKanban,
  Trophy,
  Wallet,
  UserPlus,
  BarChart3,
  UserCircle,
  BadgeCheck,
  Presentation,
  TrendingUp,
  Building2,
  School,
  Wrench,
  Monitor,
  Home,
  Bus,
  Leaf,
  Handshake,
  Heart,
  MapPin,
  Zap,
  Droplets,
  Trash2,
  ClipboardCheck,
  Flame,
  Camera,
  AlertTriangle,
  ShieldCheck,
  Settings,
  Wifi,
  Package,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  Users,
  Users2,
  UsersRound,
  BookOpen,
  FlaskConical,
  FileText,
  Calendar,
  CalendarDays,
  Award,
  Globe,
  FolderOpen,
  Shield,
  Banknote,
  Briefcase,
  FolderKanban,
  Trophy,
  Wallet,
  UserPlus,
  BarChart3,
  UserCircle,
  BadgeCheck,
  Presentation,
  TrendingUp,
  Building2,
  School,
  Wrench,
  Monitor,
  Home,
  Bus,
  Leaf,
  Handshake,
  Heart,
  MapPin,
  Zap,
  Droplets,
  Trash2,
  ClipboardCheck,
  Flame,
  Camera,
  AlertTriangle,
  ShieldCheck,
  Settings,
  Wifi,
  Package,
};

interface RepositoryWorkspaceProps {
  config: RepositoryModuleConfig;
  initialTabIndex?: number;
  hideTabs?: boolean;
}

export const RepositoryWorkspace = ({ config, initialTabIndex, hideTabs = false }: RepositoryWorkspaceProps) => {
  const { user } = useAuth();
  const departmentId = user?.departmentId ?? 0;
  const [activeTab, setActiveTab] = useState(config.tabs[initialTabIndex ?? 0]?.id || '');
  const [apiMetrics, setApiMetrics] = useState<{ dataCompleteness: number; evidenceCompleteness: number; verificationPercent: number; readinessScore: number } | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const activeTabConfig = config.tabs.find((tab) => tab.id === activeTab) ?? config.tabs[initialTabIndex ?? 0];

  // Fetch real metrics from API for the current repository
  useEffect(() => {
    if (!departmentId) return;
    setMetricsLoading(true);
    facultyService.getAllMetrics(departmentId)
      .then((allMetrics) => {
        const repoMetrics = allMetrics.find(m => m.repositoryType === config.id);
        if (repoMetrics) {
          setApiMetrics({
            dataCompleteness: repoMetrics.dataCompleteness,
            evidenceCompleteness: repoMetrics.evidenceCompleteness,
            verificationPercent: repoMetrics.verificationPercent,
            readinessScore: repoMetrics.readinessScore,
          });
        } else {
          setApiMetrics(null);
        }
      })
      .catch((err) => {
        console.warn('[RepositoryWorkspace] Failed to load metrics:', err);
        setApiMetrics(null);
      })
      .finally(() => setMetricsLoading(false));
  }, [departmentId, config.id]);

  // Use API metrics if available, otherwise fall back to mock data
  const metrics = apiMetrics ?? repositoryHealth[config.id] ?? repositoryHealth['academic'];

  // Reset active tab when config changes (e.g., switching between repositories)
  useEffect(() => {
    setActiveTab(config.tabs[initialTabIndex ?? 0]?.id || '');
  }, [config.id, initialTabIndex]);

  return (
    <div className="space-y-5">
      {/* Repository Header */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {hideTabs && activeTabConfig ? activeTabConfig.label : config.label}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {hideTabs && activeTabConfig ? `${config.label} — ${config.description}` : config.description}
            </p>
          </div>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Data Completeness', value: metrics.dataCompleteness, textColor: 'text-indigo-600', barColor: 'bg-indigo-500' },
            { label: 'Evidence Score', value: metrics.evidenceCompleteness, textColor: 'text-violet-600', barColor: 'bg-violet-500' },
            { label: 'Verification Score', value: metrics.verificationPercent, textColor: 'text-emerald-600', barColor: 'bg-emerald-500' },
            { label: 'Readiness Score', value: metrics.readinessScore, textColor: 'text-amber-600', barColor: 'bg-amber-500' },
          ].map((metric) => (
            <div
              key={metric.label}
              className="p-3 rounded-xl border border-border/50 bg-card"
            >
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{metric.label}</p>
              <div className="flex items-center gap-2 mt-1">
                {metricsLoading ? (
                  <Skeleton className="h-7 w-16" />
                ) : (
                  <>
                    <span className={cn('text-xl font-bold', metric.textColor)}>{Math.round(metric.value)}%</span>
                    <Progress value={metric.value} className="h-1.5 flex-1" />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {hideTabs && activeTabConfig ? (
        <RepositoryTabContent tabConfig={activeTabConfig} repositoryId={config.id} />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl flex-wrap gap-0.5">
            {config.tabs.map((tab) => {
              const Icon = iconMap[tab.icon] || FileText;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {config.tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-4">
              {tab.id === 'faculty-profiles' ? (
                <FacultyProfileTab />
              ) : tab.id === 'qualifications' ? (
                <FacultyQualificationsTab />
              ) : tab.id === 'employment-info' ? (
                <FacultyEmploymentTab />
              ) : tab.id === 'fdps' ? (
                <FacultyFdpsTab />
              ) : tab.id === 'student-profile' ? (
                <StudentProfileTab />
              ) : tab.id === 'admission-info' ? (
                <StudentAdmissionTab />
              ) : tab.id === 'student-diversity' ? (
                <StudentDiversityTab />
              ) : tab.id === 'academic-performance' ? (
                <StudentPerformanceTab />
              ) : tab.id === 'student-progression' ? (
                <StudentProgressionTab />
              ) : tab.id === 'scholarship-financial-support' ? (
                <StudentScholarshipTab />
              ) : tab.id === 'student-achievements' ? (
                <StudentAchievementTab />
              ) : tab.id === 'publications' ? (
                <ResearchPublicationTab />
              ) : tab.id === 'patents' ? (
                <ResearchPatentTab />
              ) : tab.id === 'research-grants' ? (
                <ResearchGrantTab />
              ) : tab.id === 'sponsored-projects' ? (
                <ResearchSponsoredProjectTab />
              ) : tab.id === 'consultancy-projects' ? (
                <ResearchConsultancyTab />
              ) : tab.id === 'alumni-achievements' ? (
                <AlumniAchievementTab />
              ) : tab.id === 'alumni-mentorship' ? (
                <AlumniMentorshipTab />
              ) : tab.id === 'alumni-contributions' ? (
                <AlumniContributionTab />
              ) : tab.id === 'alumni-engagement' ? (
                <AlumniEngagementTab />
              ) : tab.id === 'higher-education' ? (
                <AlumniHigherEducationTab />
              ) : tab.id === 'employment-career' ? (
                <AlumniEmploymentTab />
              ) : tab.id === 'alumni-details' ? (
                <AlumniDetailTab />
              ) : tab.id === 'curriculum' ? (
                <CurriculumTab />
              ) : tab.id === 'courses' ? (
                <CoursesTab />
              ) : tab.id === 'academic-calendar' ? (
                <AcademicCalendarTab />
              ) : tab.id === 'value-added-courses' ? (
                <ValueAddedCoursesTab />
              ) : tab.id === 'moocs' ? (
                <MoocsTab />
              ) : (
                <RepositoryTabContent tabConfig={tab} repositoryId={config.id} />
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};
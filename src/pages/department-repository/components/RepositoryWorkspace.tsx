import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { RepositoryModuleConfig } from '../types';
import { repositoryHealth, departmentInfo } from '../repository-configs';
import { RepositoryTabContent } from './RepositoryTabContent';
import { getModuleTabActiveClasses } from './module-tab-styles';
import { AcademicCalendarModule } from './AcademicCalendarModule';
import { AddOnProgramsModule } from './AddOnProgramsModule';
import { ValueAddedCoursesModule } from './ValueAddedCoursesModule';
import { AcademicTimetableModule } from './AcademicTimetableModule';
import { FacultyProfileModule } from './FacultyProfileModule';
import { FacultyQualificationModule } from './FacultyQualificationModule';
import { FacultyEmploymentModule } from './FacultyEmploymentModule';
import { FacultyProfessionPracticeModule } from './FacultyProfessionPracticeModule';
import { FacultyEvidenceModule } from './FacultyEvidenceModule';
import { FacultyProfessionalDevelopmentModule } from './FacultyProfessionalDevelopmentModule';
import { StudentRepositoryModule } from './StudentRepositoryModule';
import { StudentDevOutcomesModule } from './StudentDevOutcomesModule';
import { DepartmentInfrastructureModule } from './DepartmentInfrastructureModule';
import { ResearchModule } from './ResearchModule';
import {
  academicRepositoryService,
  AcademicRepositorySummary,
} from '@/services/academic-repository.service';
import {
  getFacultyRepositoryHealthMetrics,
  FacultyRepositoryMetrics,
} from '@/services/faculty-repository.service';
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
  Clock,
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
  Clock,
};

interface RepositoryWorkspaceProps {
  config: RepositoryModuleConfig;
  initialTabIndex?: number;
  academicYear?: string;
  departmentId?: number;
  departmentName?: string;
}

export const RepositoryWorkspace = ({
  config,
  initialTabIndex,
  academicYear = '2025-26',
  departmentId = 1,
  departmentName,
}: RepositoryWorkspaceProps) => {
  const currentDepartment = departmentName || departmentInfo.department;
  const [activeTab, setActiveTab] = useState(config.tabs[initialTabIndex ?? 0]?.id || '');
  const activeClasses = getModuleTabActiveClasses(config.id);

  // Live summary for Academic Repository score cards
  const [academicSummary, setAcademicSummary] = useState<AcademicRepositorySummary | null>(null);
  // Live metrics for Faculty Repository score cards
  const [facultyMetrics, setFacultyMetrics] = useState<FacultyRepositoryMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (config.id === 'academic') {
      setLoadingMetrics(true);
      academicRepositoryService
        .getDashboardSummary(academicYear, departmentId)
        .then((res) => {
          if (isMounted && res) {
            setAcademicSummary(res);
          }
        })
        .catch((err) => {
          console.warn('Live academic summary fetch error:', err);
        })
        .finally(() => {
          if (isMounted) {
            setLoadingMetrics(false);
          }
        });
    } else if (config.id === 'faculty') {
      setLoadingMetrics(true);
      getFacultyRepositoryHealthMetrics(academicYear, departmentId)
        .then((res) => {
          if (isMounted && res) {
            setFacultyMetrics(res);
          }
        })
        .catch((err) => {
          console.warn('Live faculty metrics fetch error:', err);
        })
        .finally(() => {
          if (isMounted) {
            setLoadingMetrics(false);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [config.id, academicYear, departmentId]);

  // Reset active tab when config changes (e.g., switching between repositories)
  useEffect(() => {
    setActiveTab(config.tabs[initialTabIndex ?? 0]?.id || '');
  }, [config.id, initialTabIndex]);

  // Derive score cards metrics
  const scoreMetrics = useMemo(() => {
    if (config.id === 'academic') {
      return {
        dataCompleteness: academicSummary?.dataCompleteness ?? 0,
        evidenceCompleteness: academicSummary?.evidenceScore ?? 0,
        verificationPercent: academicSummary?.verificationScore ?? 0,
        readinessScore: academicSummary?.readinessScore ?? 0,
      };
    }
    if (config.id === 'faculty') {
      return {
        dataCompleteness: facultyMetrics?.dataCompleteness ?? repositoryHealth.faculty?.dataCompleteness ?? 0,
        evidenceCompleteness: facultyMetrics?.evidenceScore ?? repositoryHealth.faculty?.evidenceCompleteness ?? 0,
        verificationPercent: facultyMetrics?.verificationScore ?? repositoryHealth.faculty?.verificationPercent ?? 0,
        readinessScore: facultyMetrics?.readinessScore ?? repositoryHealth.faculty?.readinessScore ?? 0,
      };
    }
    const fallback = repositoryHealth[config.id] || {
      dataCompleteness: 0,
      evidenceCompleteness: 0,
      verificationPercent: 0,
      readinessScore: 0,
    };
    return fallback;
  }, [config.id, academicSummary, facultyMetrics]);

  // Render Student Repository with its own dedicated module (with Department/Year/Semester selectors)
  if (config.id === 'student') {
    return (
      <StudentRepositoryModule
        config={config}
        academicYear={academicYear}
        departmentId={departmentId}
        departmentName={currentDepartment}
      />
    );
  }

  // Render Student Dev & Outcomes Repository with its own dedicated module
  if (config.id === 'student-dev-outcomes') {
    return <StudentDevOutcomesModule config={config} academicYear={academicYear} />;
  }

  // Render Department Infrastructure Repository with its own dedicated module
  if (config.id === 'infrastructure') {
    return <DepartmentInfrastructureModule config={config} academicYear={academicYear} />;
  }

  // Render Research Repository with its own dedicated module (Faculty Research, Student Research, Dept Project Dev, Dashboard)
  if (config.id === 'research') {
    return (
      <ResearchModule
        config={config}
        academicYear={academicYear}
        departmentId={departmentId}
        departmentName={currentDepartment}
      />
    );
  }

  return (
    <div className="space-y-5 w-full min-w-0 max-w-full">
      {/* Repository Header */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{config.label}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{config.description}</p>
          </div>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Data Completeness', value: scoreMetrics.dataCompleteness, color: 'text-indigo-600 bg-indigo-500/10' },
            { label: 'Evidence Score', value: scoreMetrics.evidenceCompleteness, color: 'text-violet-600 bg-violet-500/10' },
            { label: 'Verification Score', value: scoreMetrics.verificationPercent, color: 'text-emerald-600 bg-emerald-500/10' },
            { label: 'Readiness Score', value: scoreMetrics.readinessScore, color: 'text-amber-600 bg-amber-500/10' },
          ].map((metric) => (
            <div
              key={metric.label}
              className="p-3 rounded-xl border border-border/50 bg-card"
            >
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{metric.label}</p>
              <div className="flex items-center gap-2 mt-1">
                {loadingMetrics && !academicSummary && !facultyMetrics ? (
                  <div className="flex items-center gap-2 w-full">
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-1.5 flex-1" />
                  </div>
                ) : (
                  <>
                    <span className={cn('text-xl font-bold', metric.color.split(' ')[0])}>{metric.value}%</span>
                    <Progress value={metric.value} className="h-1.5 flex-1" />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-w-0 max-w-full">
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl flex-wrap gap-0.5">
          {config.tabs.map((tab) => {
            const Icon = iconMap[tab.icon] || FileText;
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
          <TabsContent key={tab.id} value={tab.id} className="mt-4 w-full min-w-0 max-w-full">
            {tab.id === 'academic-calendar' && config.id === 'academic' ? (
              <AcademicCalendarModule
                department={currentDepartment}
                academicYear={academicYear || '2025-26'}
                departmentId={departmentId || 1}
              />
            ) : tab.id === 'add-on-programs' && config.id === 'academic' ? (
              <AddOnProgramsModule
                department={currentDepartment}
                academicYear={academicYear || '2025-26'}
                departmentId={departmentId || 1}
              />
            ) : tab.id === 'value-added-courses' && config.id === 'academic' ? (
              <ValueAddedCoursesModule
                department={currentDepartment}
                academicYear={academicYear || '2025-26'}
                departmentId={departmentId || 1}
              />
            ) : tab.id === 'academic-timetable' && config.id === 'academic' ? (
              <AcademicTimetableModule
                department={currentDepartment}
                academicYear={academicYear || '2025-26'}
                departmentId={departmentId || 1}
              />
            ) : tab.id === 'faculty-profiles' && config.id === 'faculty' ? (
              <FacultyProfileModule
                department={currentDepartment}
                academicYear={academicYear || '2025-26'}
              />
            ) : tab.id === 'faculty-qualifications' && config.id === 'faculty' ? (
              <FacultyQualificationModule
                department={currentDepartment}
                academicYear={academicYear || '2025-26'}
              />
            ) : tab.id === 'faculty-employment' && config.id === 'faculty' ? (
              <FacultyEmploymentModule
                department={currentDepartment}
                academicYear={academicYear || '2025-26'}
              />
            ) : tab.id === 'faculty-profession-practice' && config.id === 'faculty' ? (
              <FacultyProfessionPracticeModule
                department={currentDepartment}
                academicYear={academicYear || '2025-26'}
              />
            ) : tab.id === 'faculty-evidence' && config.id === 'faculty' ? (
              <FacultyEvidenceModule
                department={currentDepartment}
                academicYear={academicYear || '2025-26'}
              />
            ) : tab.id === 'faculty-professional-development' && config.id === 'faculty' ? (
              <FacultyProfessionalDevelopmentModule
                department={currentDepartment}
                academicYear={academicYear || '2025-26'}
              />
            ) : (
              <RepositoryTabContent tabConfig={tab} repositoryId={config.id} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
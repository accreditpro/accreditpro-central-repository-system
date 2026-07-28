import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { academicRepositoryService, AcademicRepositorySummary } from '@/services/academic-repository.service';
import { getFacultyMetrics, FacultyMetrics } from '@/services/faculty-repository.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { RepositoryModuleConfig } from '../types';
import { repositoryHealth, departmentInfo } from '../repository-configs';
import { RepositoryTabContent } from './RepositoryTabContent';
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
}

export const RepositoryWorkspace = ({ config, initialTabIndex, academicYear }: RepositoryWorkspaceProps) => {
  const [activeTab, setActiveTab] = useState(config.tabs[initialTabIndex ?? 0]?.id || '');
  const { user } = useAuth();
  const [academicSummary, setAcademicSummary] = useState<AcademicRepositorySummary | null>(null);
  const [facultySummary, setFacultySummary] = useState<FacultyMetrics | null>(null);

  // Reset active tab when config changes (e.g., switching between repositories)
  useEffect(() => {
    setActiveTab(config.tabs[initialTabIndex ?? 0]?.id || '');
  }, [config.id, initialTabIndex]);

  useEffect(() => {
    const departmentId = user?.departmentId || 101;
    const year = academicYear || '2025-26';

    if (config.id === 'academic') {
      academicRepositoryService.getDashboardSummary(year, departmentId)
        .then(setAcademicSummary)
        .catch(console.error);
    } else if (config.id === 'faculty') {
      getFacultyMetrics(year, departmentId)
        .then(setFacultySummary)
        .catch(console.error);
    }
  }, [config.id, academicYear, user]);

  let metrics = repositoryHealth[config.id] || {
    dataCompleteness: 0,
    evidenceCompleteness: 0,
    verificationPercent: 0,
    readinessScore: 0
  };

  if (config.id === 'academic' && academicSummary) {
    metrics = {
      ...metrics,
      dataCompleteness: academicSummary.dataCompleteness,
      evidenceCompleteness: academicSummary.evidenceScore,
      verificationPercent: academicSummary.verificationScore,
      readinessScore: academicSummary.readinessScore,
    };
  } else if (config.id === 'faculty' && facultySummary) {
    metrics = {
      ...metrics,
      dataCompleteness: facultySummary.dataCompleteness,
      evidenceCompleteness: facultySummary.evidenceScore,
      verificationPercent: facultySummary.verificationScore,
      readinessScore: facultySummary.readinessScore,
    };
  }

  // Render Student Repository with its own dedicated module (with Department/Year/Semester selectors)
  if (config.id === 'student') {
    return <StudentRepositoryModule config={config} academicYear={academicYear} />;
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
    return <ResearchModule config={config} academicYear={academicYear} />;
  }

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
            <h2 className="text-xl font-bold tracking-tight">{config.label}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{config.description}</p>
          </div>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Data Completeness', value: metrics.dataCompleteness, color: 'text-indigo-600 bg-indigo-500/10' },
            { label: 'Evidence Score', value: metrics.evidenceCompleteness, color: 'text-violet-600 bg-violet-500/10' },
            { label: 'Verification Score', value: metrics.verificationPercent, color: 'text-emerald-600 bg-emerald-500/10' },
            { label: 'Readiness Score', value: metrics.readinessScore, color: 'text-amber-600 bg-amber-500/10' },
          ].map((metric) => (
            <div
              key={metric.label}
              className="p-3 rounded-xl border border-border/50 bg-card"
            >
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
            {tab.id === 'academic-calendar' && config.id === 'academic' ? (
              <AcademicCalendarModule
                department={departmentInfo.department}
                academicYear={academicYear || '2025-26'}
              />
            ) : tab.id === 'add-on-programs' && config.id === 'academic' ? (
              <AddOnProgramsModule
                department={departmentInfo.department}
                academicYear={academicYear || '2025-26'}
              />
            ) : tab.id === 'value-added-courses' && config.id === 'academic' ? (
              <ValueAddedCoursesModule
                department={departmentInfo.department}
                academicYear={academicYear || '2025-26'}
              />
            ) : tab.id === 'academic-timetable' && config.id === 'academic' ? (
              <AcademicTimetableModule
                department={departmentInfo.department}
                academicYear={academicYear || '2025-26'}
              />
            ) : tab.id === 'faculty-profiles' && config.id === 'faculty' ? (
              <FacultyProfileModule
                department={departmentInfo.department}
                academicYear={academicYear || '2025-26'}
              />
            ) : tab.id === 'faculty-qualifications' && config.id === 'faculty' ? (
              <FacultyQualificationModule
                department={departmentInfo.department}
                academicYear={academicYear || '2025-26'}
              />
            ) : tab.id === 'faculty-employment' && config.id === 'faculty' ? (
              <FacultyEmploymentModule
                department={departmentInfo.department}
                academicYear={academicYear || '2025-26'}
              />
            ) : tab.id === 'faculty-profession-practice' && config.id === 'faculty' ? (
              <FacultyProfessionPracticeModule
                department={departmentInfo.department}
                academicYear={academicYear || '2025-26'}
              />
            ) : tab.id === 'faculty-evidence' && config.id === 'faculty' ? (
              <FacultyEvidenceModule
                department={departmentInfo.department}
                academicYear={academicYear || '2025-26'}
              />
            ) : tab.id === 'faculty-professional-development' && config.id === 'faculty' ? (
              <FacultyProfessionalDevelopmentModule
                department={departmentInfo.department}
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
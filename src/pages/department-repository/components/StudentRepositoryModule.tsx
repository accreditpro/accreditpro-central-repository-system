import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { RepositoryModuleConfig } from '../types';
import { repositoryHealth, departmentInfo } from '../repository-configs';
import { RepositoryTabContent } from './RepositoryTabContent';
import { getModuleTabActiveClasses } from './module-tab-styles';
import { StudentProfileModule } from './StudentProfileModule';
import { StudentAdmissionModule } from './StudentAdmissionModule';
import { StudentDiversityModule } from './StudentDiversityModule';
import { StudentMOOCModule } from './StudentMOOCModule';
import { StudentScholarshipModule } from './StudentScholarshipModule';
import {
  getStudentRepositoryHealthMetrics,
  StudentRepositoryMetrics,
} from '@/services/student-repository.service';
import {
  Building2,
  CalendarDays,
  GraduationCap,
  BookOpen,
  Users,
  UserPlus,
  BarChart3,
  TrendingUp,
  Wallet,
  Globe,
  FileText,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  UserPlus,
  BarChart3,
  TrendingUp,
  Wallet,
  Globe,
  FileText,
  BookOpen,
};

import { useAuth } from '@/hooks/useAuth';

interface StudentRepositoryModuleProps {
  config: RepositoryModuleConfig;
  academicYear?: string;
  departmentId?: number;
  departmentName?: string;
}

const academicYearOptions = ['2023-24', '2024-25', '2025-26', '2026-27'];
const yearOptions = ['I Year', 'II Year', 'III Year', 'IV Year'];
const semesterOptions = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];

export const StudentRepositoryModule = ({
  config,
  academicYear,
  departmentId,
  departmentName,
}: StudentRepositoryModuleProps) => {
  const { user } = useAuth();
  const effectiveDeptId = departmentId || user?.departmentId || 4;
  const effectiveDeptName = departmentName || user?.department || departmentInfo.department;

  const [activeTab, setActiveTab] = useState(config.tabs[0]?.id || '');
  const activeClasses = getModuleTabActiveClasses(config.id);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(academicYear || '2025-26');
  const [selectedYear, setSelectedYear] = useState('III Year');
  const [selectedSemester, setSelectedSemester] = useState('Semester 5');
  const [liveMetrics, setLiveMetrics] = useState<StudentRepositoryMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoadingMetrics(true);
    getStudentRepositoryHealthMetrics(selectedAcademicYear, effectiveDeptId)
      .then((res) => {
        if (isMounted && res) {
          setLiveMetrics(res);
        }
      })
      .catch((err) => {
        console.warn('Live student health metrics error:', err);
      })
      .finally(() => {
        if (isMounted) {
          setLoadingMetrics(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [selectedAcademicYear, effectiveDeptId]);

  const metrics = useMemo(() => {
    return {
      dataCompleteness: liveMetrics?.dataCompleteness ?? repositoryHealth[config.id]?.dataCompleteness ?? 0,
      evidenceCompleteness: liveMetrics?.evidenceScore ?? repositoryHealth[config.id]?.evidenceCompleteness ?? 0,
      verificationPercent: liveMetrics?.verificationScore ?? repositoryHealth[config.id]?.verificationPercent ?? 0,
      readinessScore: liveMetrics?.readinessScore ?? repositoryHealth[config.id]?.readinessScore ?? 0,
    };
  }, [liveMetrics, config.id]);

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

        {/* Context Selector Cards - Department, Academic Year, Year, Semester */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Department Card - Static/Read-only */}
          <div className="relative p-4 rounded-xl border border-border/60 bg-gradient-to-br from-slate-900/80 to-slate-800/80 dark:from-slate-800/60 dark:to-slate-900/60 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-blue-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Department</span>
            </div>
            <p className="text-sm font-semibold text-white truncate" title={effectiveDeptName}>
              {effectiveDeptName}
            </p>
          </div>

          {/* Academic Year Card - Dropdown */}
          <div className="relative p-4 rounded-xl border border-border/60 bg-gradient-to-br from-slate-900/80 to-slate-800/80 dark:from-slate-800/60 dark:to-slate-900/60 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="h-4 w-4 text-purple-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Academic Year</span>
            </div>
            <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
              <SelectTrigger className="h-7 border-0 bg-transparent p-0 text-sm font-semibold text-purple-300 shadow-none focus:ring-0 [&>svg]:text-slate-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {academicYearOptions.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year Card - Dropdown */}
          <div className="relative p-4 rounded-xl border border-border/60 bg-gradient-to-br from-slate-900/80 to-slate-800/80 dark:from-slate-800/60 dark:to-slate-900/60 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-4 w-4 text-emerald-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Year</span>
            </div>
            <Select value={selectedYear} onValueChange={(value) => {
              setSelectedYear(value);
              const yearIndex = yearOptions.indexOf(value);
              const defaultSemester = `Semester ${yearIndex * 2 + 1}`;
              setSelectedSemester(defaultSemester);
            }}>
              <SelectTrigger className="h-7 border-0 bg-transparent p-0 text-sm font-semibold text-emerald-300 shadow-none focus:ring-0 [&>svg]:text-slate-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Semester Card - Dropdown */}
          <div className="relative p-4 rounded-xl border border-border/60 bg-gradient-to-br from-slate-900/80 to-slate-800/80 dark:from-slate-800/60 dark:to-slate-900/60 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Semester</span>
            </div>
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="h-7 border-0 bg-transparent p-0 text-sm font-semibold text-amber-300 shadow-none focus:ring-0 [&>svg]:text-slate-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {semesterOptions.map((sem) => (
                  <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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

      {/* Context Info Banner */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/40 border border-border/30">
        <span className="text-xs text-muted-foreground">
          Showing data for <span className="font-semibold text-foreground">{effectiveDeptName}</span> &bull; 
          <span className="font-semibold text-foreground"> {selectedAcademicYear}</span> &bull; 
          <span className="font-semibold text-foreground"> {selectedYear}</span> &bull; 
          <span className="font-semibold text-foreground"> {selectedSemester}</span>
        </span>
      </div>

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
            {tab.id === 'student-profile' ? (
              <StudentProfileModule
                department={effectiveDeptName}
                departmentId={effectiveDeptId}
                academicYear={selectedAcademicYear}
                year={selectedYear}
                semester={selectedSemester}
              />
            ) : tab.id === 'admission-info' ? (
              <StudentAdmissionModule
                department={effectiveDeptName}
                departmentId={effectiveDeptId}
                academicYear={selectedAcademicYear}
                year={selectedYear}
                semester={selectedSemester}
              />
            ) : tab.id === 'student-diversity' ? (
              <StudentDiversityModule
                department={effectiveDeptName}
                departmentId={effectiveDeptId}
                academicYear={selectedAcademicYear}
                year={selectedYear}
                semester={selectedSemester}
              />
            ) : tab.id === 'mooc-online-certifications' ? (
              <StudentMOOCModule
                department={effectiveDeptName}
                departmentId={effectiveDeptId}
                academicYear={selectedAcademicYear}
              />
            ) : tab.id === 'scholarship-freeship' || tab.id === 'scholarships-freeships' ? (
              <StudentScholarshipModule
                department={effectiveDeptName}
                departmentId={effectiveDeptId}
                academicYear={selectedAcademicYear}
                year={selectedYear}
                semester={selectedSemester}
              />
            ) : (
              <RepositoryTabContent
                tabConfig={tab}
                repositoryId={config.id}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
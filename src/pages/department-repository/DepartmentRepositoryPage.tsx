import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { RepositoryDashboard } from './components/RepositoryDashboard';
import { RepositoryWorkspace } from './components/RepositoryWorkspace';
import { DepartmentMissionVision } from './components/DepartmentMissionVision';
import { DocumentsView } from './components/DocumentsView';
import { UploadHistoryView } from './components/UploadHistoryView';
import { VerificationStatusView } from './components/VerificationStatusView';
import { ProfileView } from './components/ProfileView';
import { AcademicCalendarModule } from './components/AcademicCalendarModule';
import { CourseRepositoryModule } from './components/course-repository/CourseRepositoryModule';
import {
  academicRepositoryConfig,
  facultyRepositoryConfig,
  studentRepositoryConfig,
  researchRepositoryConfig,
  alumniRepositoryConfig,
  studentDevOutcomesConfig,
  departmentInfrastructureConfig,
  departmentInfo,
} from './repository-configs';
import { SidebarView } from './types';
import {
  LayoutDashboard,
  Target,
  GraduationCap,
  Users,
  Users2,
  BookOpen,
  FlaskConical,
  FileText,
  Upload,
  ShieldCheck,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  Calendar,
  UsersRound,
  Building2,
  BookMarked,
} from 'lucide-react';

// Academic years for the last 7 years
const ACADEMIC_YEARS = [
  '2025-26',
  '2024-25',
  '2023-24',
  '2022-23',
  '2021-22',
  '2020-21',
  '2019-20',
];

const sidebarItems: { id: SidebarView; label: string; icon: React.ComponentType<{ className?: string }>; separator?: boolean }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'mission-vision', label: 'Mission & Vision', icon: Target, separator: true },
  { id: 'course-repository', label: 'Course Repository ⭐', icon: BookMarked },
  { id: 'academic-repository', label: 'Academic Repository', icon: GraduationCap },
  { id: 'faculty-repository', label: 'Faculty Repository', icon: Users },
  { id: 'student-repository', label: 'Student Repository', icon: BookOpen },
  { id: 'research-repository', label: 'Research Repository', icon: FlaskConical },
  { id: 'alumni-repository', label: 'Alumni Repository', icon: Users2 },
  { id: 'student-dev-outcomes-repository', label: 'Student Dev & Outcomes', icon: UsersRound },
  { id: 'infrastructure-repository', label: 'Infrastructure Repository', icon: Building2, separator: true },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'upload-history', label: 'Upload History', icon: Upload },
  { id: 'verification-status', label: 'Verification Status', icon: ShieldCheck, separator: true },
  { id: 'profile', label: 'Profile', icon: User },
];

const repositoryConfigMap: Record<string, typeof academicRepositoryConfig> = {
  'academic-repository': academicRepositoryConfig,
  'faculty-repository': facultyRepositoryConfig,
  'student-repository': studentRepositoryConfig,
  'research-repository': researchRepositoryConfig,
  'alumni-repository': alumniRepositoryConfig,
  'student-dev-outcomes-repository': studentDevOutcomesConfig,
  'infrastructure-repository': departmentInfrastructureConfig,
};

export const DepartmentRepositoryPage = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<SidebarView>('academic-repository');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2025-26');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <RepositoryDashboard
            onNavigate={(module) => setActiveView(`${module}-repository` as SidebarView)}
            academicYear={selectedAcademicYear}
            departmentId={user?.departmentId ?? 0}
          />
        );
      case 'mission-vision':
        return (
          <DepartmentMissionVision
            academicYear={selectedAcademicYear}
            departmentId={user?.departmentId ?? 0}
          />
        );
      case 'course-repository':
        return <CourseRepositoryModule />;
      case 'academic-repository':
      case 'faculty-repository':
      case 'student-repository':
      case 'research-repository':
      case 'alumni-repository':
      case 'student-dev-outcomes-repository':
      case 'infrastructure-repository':
        return (
          <RepositoryWorkspace
            config={repositoryConfigMap[activeView]}
            academicYear={selectedAcademicYear}
          />
        );
      case 'documents':
        return <DocumentsView />;
      case 'upload-history':
        return <UploadHistoryView />;
      case 'verification-status':
        return <VerificationStatusView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <RepositoryDashboard onNavigate={(module) => setActiveView(`${module}-repository` as SidebarView)} />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          'h-full border-r border-border/50 bg-card/50 backdrop-blur-sm flex flex-col z-50',
          'fixed lg:relative',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          sidebarCollapsed ? 'w-16' : 'w-64',
          'transition-all duration-300 ease-in-out'
        )}
      >
        {/* Sidebar Header */}
        <div className={cn('p-4 border-b border-border/50', sidebarCollapsed && 'p-2')}>
          {!sidebarCollapsed ? (
            <div className="space-y-2">
              <h2 className="text-sm font-bold tracking-tight">{departmentInfo.department}</h2>
              <div className="flex items-center gap-1.5">
                <Badge
                  variant="outline"
                  className="text-[10px] px-2 py-0.5 font-semibold bg-blue-500/10 text-blue-700 border-blue-500/30"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  {selectedAcademicYear}
                </Badge>
              </div>
              {/* Academic Year Selector */}
              <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                <SelectTrigger className="h-8 text-xs w-full border-dashed">
                  <SelectValue placeholder="Select Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  {ACADEMIC_YEARS.map((year) => (
                    <SelectItem key={year} value={year} className="text-xs">
                      {year}
                      {year === '2025-26' && (
                        <span className="ml-2 text-[9px] text-blue-600 font-medium">(Current)</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <Badge variant="outline" className="text-[8px] px-1 py-0">
                {selectedAcademicYear.slice(0, 4)}
              </Badge>
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-0.5 px-2">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              const showSeparator = item.separator && index < sidebarItems.length - 1;

              return (
                <div key={item.id}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'w-full justify-start gap-2.5 h-9 px-3 text-xs font-medium rounded-lg transition-all',
                      isActive && 'bg-primary/10 text-primary hover:bg-primary/15 shadow-sm border border-primary/20',
                      !isActive && 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                      sidebarCollapsed && 'justify-center px-0'
                    )}
                    onClick={() => {
                      setActiveView(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className={cn('h-4 w-4 shrink-0', isActive && 'text-primary')} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Button>
                  {showSeparator && <Separator className="my-2 opacity-50" />}
                </div>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Collapse Toggle */}
        <div className="p-2 border-t border-border/50 hidden lg:block">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!sidebarCollapsed && <span className="ml-2">Collapse</span>}
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-3 p-3 border-b border-border/50">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <p className="text-sm font-semibold">
              {sidebarItems.find(i => i.id === activeView)?.label || 'Dashboard'}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {departmentInfo.department} • {selectedAcademicYear}
            </p>
          </div>
          <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
            <SelectTrigger className="h-7 w-[100px] text-[10px] border-dashed">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACADEMIC_YEARS.map((year) => (
                <SelectItem key={year} value={year} className="text-xs">{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeView}-${selectedAcademicYear}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
};
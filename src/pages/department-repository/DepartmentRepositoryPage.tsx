import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { RepositoryDashboard } from './components/RepositoryDashboard';
import { RepositoryWorkspace } from './components/RepositoryWorkspace';
import { DepartmentMissionVision } from './components/DepartmentMissionVision';
import { DocumentsView } from './components/DocumentsView';
import { UploadHistoryView } from './components/UploadHistoryView';
import { VerificationStatusView } from './components/VerificationStatusView';
import { ProfileView } from './components/ProfileView';
import {
  academicRepositoryConfig,
  facultyRepositoryConfig,
  studentRepositoryConfig,
  researchRepositoryConfig,
  alumniRepositoryConfig,
  coordinatorContext,
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
} from 'lucide-react';

const sidebarItems: { id: SidebarView; label: string; icon: React.ComponentType<{ className?: string }>; separator?: boolean }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'mission-vision', label: 'Mission & Vision', icon: Target, separator: true },
  { id: 'academic-repository', label: 'Academic Repository', icon: GraduationCap },
  { id: 'faculty-repository', label: 'Faculty Repository', icon: Users },
  { id: 'student-repository', label: 'Student Repository', icon: BookOpen },
  { id: 'research-repository', label: 'Research Repository', icon: FlaskConical },
  { id: 'alumni-repository', label: 'Alumni Repository', icon: Users2, separator: true },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'upload-history', label: 'Upload History', icon: Upload },
  { id: 'verification-status', label: 'Verification Status', icon: ShieldCheck, separator: true },
  { id: 'profile', label: 'Profile', icon: User },
];

const repositoryConfigMap = {
  'academic-repository': academicRepositoryConfig,
  'faculty-repository': facultyRepositoryConfig,
  'student-repository': studentRepositoryConfig,
  'research-repository': researchRepositoryConfig,
  'alumni-repository': alumniRepositoryConfig,
};

export const DepartmentRepositoryPage = () => {
  const [activeView, setActiveView] = useState<SidebarView>('student-repository');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <RepositoryDashboard onNavigate={(module) => setActiveView(`${module}-repository` as SidebarView)} />;
      case 'mission-vision':
        return <DepartmentMissionVision />;
      case 'academic-repository':
      case 'faculty-repository':
      case 'student-repository':
      case 'research-repository':
      case 'alumni-repository':
        return <RepositoryWorkspace config={repositoryConfigMap[activeView]} />;
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
            <div className="space-y-1">
              <h2 className="text-sm font-bold tracking-tight">Repository Workspace</h2>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-medium">
                  {coordinatorContext.department}
                </Badge>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-medium bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  {coordinatorContext.academicYear}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
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
          <div>
            <p className="text-sm font-semibold">
              {sidebarItems.find(i => i.id === activeView)?.label || 'Dashboard'}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {coordinatorContext.department} • {coordinatorContext.academicYear}
            </p>
          </div>
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
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
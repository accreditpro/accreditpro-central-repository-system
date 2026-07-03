import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CoordinatorSidebar } from '@/components/layout/CoordinatorSidebar';
import { RepositoryDashboard } from './components/RepositoryDashboard';
import { RepositoryWorkspace } from './components/RepositoryWorkspace';
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
  GraduationCap,
  Users,
  Users2,
  BookOpen,
  FlaskConical,
  FileText,
  Upload,
  ShieldCheck,
  User,
  Menu,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleNotificationPanel } from '@/store/slices/uiSlice';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { UserProfileMenu } from '@/components/layout/UserProfileMenu';
import { Bell } from 'lucide-react';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'academic-repository', label: 'Academic Repository', icon: GraduationCap, separatorAfter: true },
  { id: 'faculty-repository', label: 'Faculty Repository', icon: Users },
  { id: 'student-repository', label: 'Student Repository', icon: BookOpen },
  { id: 'research-repository', label: 'Research Repository', icon: FlaskConical },
  { id: 'alumni-repository', label: 'Alumni Repository', icon: Users2, separatorAfter: true },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'upload-history', label: 'Upload History', icon: Upload },
  { id: 'verification-status', label: 'Verification Status', icon: ShieldCheck, separatorAfter: true },
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
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.ui);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [activeView, setActiveView] = useState<SidebarView>('student-repository');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <RepositoryDashboard onNavigate={(module) => setActiveView(`${module}-repository` as SidebarView)} />;
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

  const currentLabel = sidebarItems.find((i) => i.id === activeView)?.label || 'Dashboard';

  return (
    <div className="flex h-screen overflow-hidden">
      <CoordinatorSidebar
        subtitle="Department Coordinator"
        activeView={activeView}
        onNavigate={(id) => setActiveView(id as SidebarView)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        items={sidebarItems}
      />

      <main className="flex-1 overflow-hidden flex flex-col min-w-0">
        <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border/50 bg-background/80 px-4 md:px-6 backdrop-blur-xl">
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden shrink-0"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-semibold">{currentLabel}</h1>
              <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                {coordinatorContext.department}
              </Badge>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hidden sm:inline-flex">
                {coordinatorContext.academicYear}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8"
              onClick={() => dispatch(toggleNotificationPanel())}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive animate-pulse" />
              )}
            </Button>

            <div className="h-6 w-px bg-border mx-2 hidden sm:block" />

            {user && <UserProfileMenu user={user} />}
          </div>
        </div>

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

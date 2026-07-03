import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { CoordinatorSidebar } from '@/components/layout/CoordinatorSidebar';
import { InfrastructureDashboard } from './components/InfrastructureDashboard';
import { InfrastructureDocumentsView } from './components/InfrastructureDocumentsView';
import { RepositoryWorkspace } from '../department-repository/components/RepositoryWorkspace';
import { UploadHistoryView } from '../department-repository/components/UploadHistoryView';
import { VerificationStatusView } from '../department-repository/components/VerificationStatusView';
import { ProfileView } from '../department-repository/components/ProfileView';
import {
  infrastructureRepositoryConfig,
  greenCampusRepositoryConfig,
  safetySecurityRepositoryConfig,
  utilitiesRepositoryConfig,
} from './infrastructure-configs';
import {
  LayoutDashboard,
  Building2,
  School,
  FlaskConical,
  Wrench,
  BookOpen,
  Monitor,
  Home,
  Trophy,
  Presentation,
  Bus,
  Leaf,
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
  FileText,
  Upload,
  User,
  Menu,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleNotificationPanel } from '@/store/slices/uiSlice';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { UserProfileMenu } from '@/components/layout/UserProfileMenu';
import { Bell } from 'lucide-react';

type InfrastructureView =
  | 'dashboard'
  | 'buildings'
  | 'classrooms'
  | 'laboratories'
  | 'equipment'
  | 'library'
  | 'ict-infrastructure'
  | 'hostels'
  | 'sports-facilities'
  | 'seminar-halls'
  | 'transport'
  | 'green-initiatives'
  | 'energy-management'
  | 'water-management'
  | 'waste-management'
  | 'green-audit'
  | 'fire-safety'
  | 'security-infrastructure'
  | 'emergency-preparedness'
  | 'insurance-compliance'
  | 'power-infrastructure'
  | 'water-supply'
  | 'internet-network'
  | 'utility-assets'
  | 'supporting-documents'
  | 'upload-history'
  | 'verification-status'
  | 'profile';

const sidebarGroups = [
  {
    title: 'Infrastructure',
    icon: Building2,
    color: 'text-emerald-600',
    items: [
      { id: 'buildings', label: 'Buildings', icon: Building2 },
      { id: 'classrooms', label: 'Classrooms', icon: School },
      { id: 'laboratories', label: 'Laboratories', icon: FlaskConical },
      { id: 'equipment', label: 'Equipment', icon: Wrench },
      { id: 'library', label: 'Library', icon: BookOpen },
      { id: 'ict-infrastructure', label: 'ICT Infrastructure', icon: Monitor },
      { id: 'hostels', label: 'Hostels', icon: Home },
      { id: 'sports-facilities', label: 'Sports Facilities', icon: Trophy },
      { id: 'seminar-halls', label: 'Seminar Halls', icon: Presentation },
      { id: 'transport', label: 'Transport', icon: Bus },
    ],
  },
  {
    title: 'Green Campus & Sustainability',
    icon: Leaf,
    color: 'text-green-600',
    items: [
      { id: 'green-initiatives', label: 'Green Initiatives', icon: Leaf },
      { id: 'energy-management', label: 'Energy Management', icon: Zap },
      { id: 'water-management', label: 'Water Management', icon: Droplets },
      { id: 'waste-management', label: 'Waste Management', icon: Trash2 },
      { id: 'green-audit', label: 'Green Audit', icon: ClipboardCheck },
    ],
  },
  {
    title: 'Safety & Security',
    icon: ShieldCheck,
    color: 'text-red-600',
    items: [
      { id: 'fire-safety', label: 'Fire Safety', icon: Flame },
      { id: 'security-infrastructure', label: 'Security Infrastructure', icon: Camera },
      { id: 'emergency-preparedness', label: 'Emergency Preparedness', icon: AlertTriangle },
      { id: 'insurance-compliance', label: 'Insurance & Compliance', icon: ShieldCheck },
    ],
  },
  {
    title: 'Utilities',
    icon: Settings,
    color: 'text-amber-600',
    items: [
      { id: 'power-infrastructure', label: 'Power Infrastructure', icon: Zap },
      { id: 'water-supply', label: 'Water Supply', icon: Droplets },
      { id: 'internet-network', label: 'Internet & Network', icon: Wifi },
      { id: 'utility-assets', label: 'Utility Assets', icon: Package },
    ],
  },
];

const bottomItems = [
  { id: 'supporting-documents', label: 'Supporting Documents', icon: FileText },
  { id: 'upload-history', label: 'Upload History', icon: Upload },
  { id: 'verification-status', label: 'Verification Status', icon: ShieldCheck },
  { id: 'profile', label: 'Profile', icon: User },
];

const getConfigForView = (view: InfrastructureView): { config: typeof infrastructureRepositoryConfig; tabIndex: number } | null => {
  const infraTabs = ['buildings', 'classrooms', 'laboratories', 'equipment', 'library', 'ict-infrastructure', 'hostels', 'sports-facilities', 'seminar-halls', 'transport'];
  const greenTabs = ['green-initiatives', 'energy-management', 'water-management', 'waste-management', 'green-audit'];
  const safetyTabs = ['fire-safety', 'security-infrastructure', 'emergency-preparedness', 'insurance-compliance'];
  const utilityTabs = ['power-infrastructure', 'water-supply', 'internet-network', 'utility-assets'];

  const infraIndex = infraTabs.indexOf(view);
  if (infraIndex >= 0) return { config: infrastructureRepositoryConfig, tabIndex: infraIndex };

  const greenIndex = greenTabs.indexOf(view);
  if (greenIndex >= 0) return { config: greenCampusRepositoryConfig, tabIndex: greenIndex };

  const safetyIndex = safetyTabs.indexOf(view);
  if (safetyIndex >= 0) return { config: safetySecurityRepositoryConfig, tabIndex: safetyIndex };

  const utilityIndex = utilityTabs.indexOf(view);
  if (utilityIndex >= 0) return { config: utilitiesRepositoryConfig, tabIndex: utilityIndex };

  return null;
};

const getCurrentLabel = (activeView: InfrastructureView): string => {
  if (activeView === 'dashboard') return 'Dashboard';
  for (const group of sidebarGroups) {
    const item = group.items.find((i) => i.id === activeView);
    if (item) return item.label;
  }
  const bottomItem = bottomItems.find((i) => i.id === activeView);
  if (bottomItem) return bottomItem.label;
  return 'Dashboard';
};

export const InfrastructureRepositoryPage = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.ui);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [activeView, setActiveView] = useState<InfrastructureView>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderContent = () => {
    if (activeView === 'dashboard') {
      return <InfrastructureDashboard onNavigate={(tabId) => setActiveView(tabId as InfrastructureView)} />;
    }
    if (activeView === 'supporting-documents') {
      return <InfrastructureDocumentsView />;
    }
    if (activeView === 'upload-history') {
      return <UploadHistoryView />;
    }
    if (activeView === 'verification-status') {
      return <VerificationStatusView />;
    }
    if (activeView === 'profile') {
      return <ProfileView />;
    }

    const viewConfig = getConfigForView(activeView);
    if (viewConfig) {
      return (
        <RepositoryWorkspace
          config={viewConfig.config}
          initialTabIndex={viewConfig.tabIndex}
          hideTabs
        />
      );
    }

    return <InfrastructureDashboard onNavigate={(tabId) => setActiveView(tabId as InfrastructureView)} />;
  };

  return (
    <div className="flex h-screen">
      <CoordinatorSidebar
        subtitle="Infrastructure Coordinator"
        activeView={activeView}
        onNavigate={(id) => setActiveView(id as InfrastructureView)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        items={[{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, separatorAfter: true }]}
        groups={sidebarGroups}
        bottomItems={bottomItems}
      />

      <main className="flex-1 overflow-hidden flex flex-col min-w-0">

      <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border/50 bg-background/80 px-4 md:px-6 backdrop-blur-xl">
          
          {/* Left Side: Menu Toggle, Title & Badges */}
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
              <h1 className="text-lg font-semibold">{getCurrentLabel(activeView)}</h1>
              <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">
                Infrastructure Coordinator
              </Badge>
            </div>
          </div>

          {/* Right Side: Action Buttons */}
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

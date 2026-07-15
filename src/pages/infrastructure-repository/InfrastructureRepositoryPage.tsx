import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
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
  infrastructureCoordinatorContext,
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
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';

type InfrastructureView =
  | 'dashboard'
  // Infrastructure tabs
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
  // Green Campus tabs
  | 'green-initiatives'
  | 'energy-management'
  | 'water-management'
  | 'waste-management'
  | 'green-audit'
  // Safety & Security tabs
  | 'fire-safety'
  | 'security-infrastructure'
  | 'emergency-preparedness'
  | 'insurance-compliance'
  // Utilities tabs
  | 'power-infrastructure'
  | 'water-supply'
  | 'internet-network'
  | 'utility-assets'
  // Other views
  | 'supporting-documents'
  | 'upload-history'
  | 'verification-status'
  | 'profile';

interface SidebarGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  items: { id: InfrastructureView; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

const sidebarGroups: SidebarGroup[] = [
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

const bottomItems: { id: InfrastructureView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'supporting-documents', label: 'Supporting Documents', icon: FileText },
  { id: 'upload-history', label: 'Upload History', icon: Upload },
  { id: 'verification-status', label: 'Verification Status', icon: ShieldCheck },
  { id: 'profile', label: 'Profile', icon: User },
];

// Map tab IDs to their config and index
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

export const InfrastructureRepositoryPage = () => {
  const [activeView, setActiveView] = useState<InfrastructureView>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Infrastructure': true,
    'Green Campus & Sustainability': true,
    'Safety & Security': true,
    'Utilities': true,
  });

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

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
        />
      );
    }

    return <InfrastructureDashboard onNavigate={(tabId) => setActiveView(tabId as InfrastructureView)} />;
  };

  // Find the label for current view
  const getCurrentLabel = (): string => {
    if (activeView === 'dashboard') return 'Dashboard';
    for (const group of sidebarGroups) {
      const item = group.items.find(i => i.id === activeView);
      if (item) return item.label;
    }
    const bottomItem = bottomItems.find(i => i.id === activeView);
    if (bottomItem) return bottomItem.label;
    return 'Dashboard';
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          'fixed lg:relative z-50 lg:z-0 h-full bg-card border-r flex flex-col transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64',
          mobileSidebarOpen ? 'left-0' : '-left-64 lg:left-0'
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">Infrastructure</p>
                <p className="text-[10px] text-muted-foreground">Coordinator</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hidden lg:flex"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Coordinator Info */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-b">
            <p className="text-xs font-medium text-muted-foreground">Coordinator</p>
            <p className="text-sm font-semibold truncate">{infrastructureCoordinatorContext.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{infrastructureCoordinatorContext.institution}</p>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <div className="px-2 space-y-0.5">
            {/* Dashboard */}
            <button
              onClick={() => {
                setActiveView('dashboard');
                setMobileSidebarOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                activeView === 'dashboard'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              title={sidebarCollapsed ? 'Dashboard' : undefined}
            >
              <LayoutDashboard className={cn('h-4 w-4 shrink-0', activeView === 'dashboard' && 'text-primary')} />
              {!sidebarCollapsed && <span className="truncate">Dashboard</span>}
            </button>

            <Separator className="my-2" />

            {/* Module Groups */}
            {sidebarGroups.map((group) => (
              <div key={group.title} className="mb-1">
                {!sidebarCollapsed ? (
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                  >
                    <span className={cn('flex items-center gap-1.5', group.color)}>
                      <group.icon className="h-3 w-3" />
                      <span className="truncate">{group.title}</span>
                    </span>
                    <ChevronRight className={cn('h-3 w-3 transition-transform', expandedGroups[group.title] && 'rotate-90')} />
                  </button>
                ) : (
                  <div className="flex justify-center py-1">
                    <group.icon className={cn('h-4 w-4', group.color)} />
                  </div>
                )}

                {(expandedGroups[group.title] || sidebarCollapsed) && (
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveView(item.id);
                          setMobileSidebarOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-all',
                          !sidebarCollapsed && 'pl-6',
                          activeView === item.id
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <item.icon className={cn('h-3.5 w-3.5 shrink-0', activeView === item.id && 'text-primary')} />
                        {!sidebarCollapsed && <span className="truncate text-xs">{item.label}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <Separator className="my-2" />

            {/* Bottom Items */}
            {bottomItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                  activeView === item.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className={cn('h-4 w-4 shrink-0', activeView === item.id && 'text-primary')} />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            ))}
          </div>
        </ScrollArea>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Content Header */}
        <div className="border-b px-6 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">
              {getCurrentLabel()}
            </h1>
            <Badge variant="secondary" className="text-[10px]">
              Infrastructure Coordinator
            </Badge>
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
      </div>
    </div>
  );
};
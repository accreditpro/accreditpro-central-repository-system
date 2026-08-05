import { useState } from 'react';
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Landmark,
  Building2,
  Database,
  Trophy,
  AlertTriangle,
  MessageSquareWarning,
  TrendingUp,
  FileBarChart,
  Bot,
  FolderOpen,
  Clock,
  FileCheck,
  MessageSquareWarning as ObsIcon,
  FileBarChart2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useAppSelector } from '@/store';
import { selectObservations } from '@/store/slices/iqacSlice';
import { selectVerificationObservations } from '@/store/slices/iqacVerificationSlice';
import { gapStats } from '@/pages/iqac-dashboard/iqac-data';
import { useVerificationDocuments } from '@/pages/iqac-dashboard/components/verification/useVerificationDocuments';
import { ImpersonationBanner } from '@/components/shared/ImpersonationBanner';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  group: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
  { id: 'institution', label: 'Institution Readiness', icon: Landmark, group: 'Readiness' },
  { id: 'departments', label: 'Department Readiness', icon: Building2, group: 'Readiness' },
  { id: 'repository-monitoring', label: 'Repository Monitoring', icon: Database, group: 'Readiness' },
  { id: 'accreditation', label: 'Accreditation Readiness', icon: Trophy, group: 'Readiness' },
  { id: 'gaps', label: 'Gap Analysis', icon: AlertTriangle, group: 'Readiness' },
  { id: 'observations', label: 'Quality Observations', icon: MessageSquareWarning, group: 'Quality' },
  { id: 'improvement', label: 'Continuous Improvement', icon: TrendingUp, group: 'Quality' },
  { id: 'reports', label: 'Institutional Reports', icon: FileBarChart, group: 'Intelligence' },
  { id: 'ai-insights', label: 'AI Insights', icon: Bot, group: 'Intelligence' },
  { id: 'documents', label: 'Supporting Documents', icon: FolderOpen, group: 'Documents' },
  { id: 'verification', label: 'Repository Verification', icon: ShieldCheck, group: 'Verification' },
  { id: 'pending-verification', label: 'Pending Verification', icon: Clock, group: 'Verification' },
  { id: 'verified-documents', label: 'Verified Documents', icon: FileCheck, group: 'Verification' },
  { id: 'verification-observations', label: 'Observations', icon: ObsIcon, group: 'Verification' },
  { id: 'verification-reports', label: 'Verification Reports', icon: FileBarChart2, group: 'Verification' },
];

const groupLabels: Record<string, string> = {
  Overview: 'Overview',
  Readiness: 'Readiness',
  Quality: 'Quality',
  Intelligence: 'Intelligence',
  Documents: 'Documents',
  Verification: 'Verification',
};

export default function IQACLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout, isImpersonating } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const observations = useAppSelector(selectObservations);
  const verificationObservations = useAppSelector(selectVerificationObservations);
  const { documents: verificationDocuments } = useVerificationDocuments();
  const activeView = searchParams.get('view') || 'dashboard';

  const activeObservations = observations.filter((o) => o.status !== 'closed').length;
  const pendingVerification = verificationDocuments.filter(
    (d) => d.hodStatus === 'approved' && d.iqacStatus === 'not-verified'
  ).length;
  const openVerificationObservations = verificationObservations.filter(
    (o) => o.status === 'open' || o.status === 'in-progress'
  ).length;
  const badgeFor: Record<string, string | undefined> = {
    observations: activeObservations > 0 ? String(activeObservations) : undefined,
    gaps: gapStats.critical > 0 ? String(gapStats.critical) : undefined,
    'pending-verification': pendingVerification > 0 ? String(pendingVerification) : undefined,
    'verification-observations': openVerificationObservations > 0 ? String(openVerificationObservations) : undefined,
  };

  const handleNavClick = (id: string) => {
    navigate(`/app/iqac-dashboard?view=${id}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const groupedItems = navItems.reduce(
    (acc, item) => {
      const group = item.group || 'Other';
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    },
    {} as Record<string, NavItem[]>
  );

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Impersonation banner (read-only preview by a Super Admin) */}
      <ImpersonationBanner />

      <div className="flex min-h-0 flex-1">
      {/* Sidebar */}
      <aside className={`flex flex-col border-r bg-card transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
        {/* Logo */}
        <div className="flex items-center gap-2 p-4 border-b">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex-shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">AccreditPro</p>
              <p className="text-xs text-muted-foreground truncate">
                {isImpersonating ? 'Read-only preview' : 'IQAC Coordinator'}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-2">
            {Object.entries(groupedItems).map(([group, items]) => (
              <div key={group} className="mb-2">
                {!collapsed && (
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {groupLabels[group] || group}
                  </p>
                )}
                {items.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={cn(
                      'w-full justify-start gap-3 h-8 rounded-lg transition-all',
                      collapsed ? 'px-2' : 'px-3',
                      activeView === item.id
                        ? 'bg-primary/10 text-primary font-medium shadow-sm hover:bg-primary/15'
                        : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                    )}
                    onClick={() => handleNavClick(item.id)}
                  >
                    <item.icon className={cn('h-3.5 w-3.5 flex-shrink-0', activeView === item.id && 'text-primary')} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left truncate text-xs">{item.label}</span>
                        {badgeFor[item.id] && (
                          <Badge
                            variant="secondary"
                            className={cn(
                              'h-4 px-1 text-[10px]',
                              item.id === 'observations' && activeObservations > 0 ? 'bg-red-500/10 text-red-600' : ''
                            )}
                          >
                            {badgeFor[item.id]}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                ))}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-2 space-y-1">
          <Button variant="ghost" size="sm" className={`w-full justify-start gap-2 h-8 ${collapsed ? 'px-2' : 'px-3'}`} onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {!collapsed && <span className="text-xs">Toggle Theme</span>}
          </Button>
          <Button variant="ghost" size="sm" className={`w-full justify-start gap-2 h-8 ${collapsed ? 'px-2' : 'px-3'}`} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            {!collapsed && <span className="text-xs">Collapse</span>}
          </Button>
        </div>

        {/* User */}
        <div className="border-t p-3">
          <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs dark:bg-indigo-900 dark:text-indigo-300">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{user?.firstName} {user?.lastName}</p>
                {isImpersonating ? (
                  <span className="mt-0.5 inline-flex items-center gap-1 rounded border border-amber-300/50 bg-amber-500/10 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                    <Lock className="h-2.5 w-2.5" />
                    Read-only
                  </span>
                ) : (
                  <p className="text-[10px] text-muted-foreground truncate">IQAC Coordinator</p>
                )}
              </div>
            )}
            {!collapsed && (
              <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={handleLogout}>
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
      </div>
    </div>
  );
}

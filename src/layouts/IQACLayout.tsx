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
  LogOut,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useAppSelector } from '@/store';
import { selectObservations } from '@/store/slices/iqacSlice';
import { gapStats } from '@/pages/iqac-dashboard/iqac-data';
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
];

const groupLabels: Record<string, string> = {
  Overview: 'Overview',
  Readiness: 'Readiness',
  Quality: 'Quality',
  Intelligence: 'Intelligence',
  Documents: 'Documents',
};

export default function IQACLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const observations = useAppSelector(selectObservations);
  const activeView = searchParams.get('view') || 'dashboard';

  const activeObservations = observations.filter((o) => o.status !== 'closed').length;
  const badgeFor: Record<string, string | undefined> = {
    observations: activeObservations > 0 ? String(activeObservations) : undefined,
    gaps: gapStats.critical > 0 ? String(gapStats.critical) : undefined,
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
    <div className="flex h-screen bg-background">
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
              <p className="text-xs text-muted-foreground truncate">IQAC Coordinator</p>
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
                <p className="text-[10px] text-muted-foreground truncate">IQAC Coordinator</p>
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
  );
}

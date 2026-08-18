import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  FileCheck,
  CheckSquare,
  AlertTriangle,
  Target,
  BarChart3,
  FileText,
  Activity,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { ImpersonationBanner } from '@/components/shared/ImpersonationBanner';
import { useAppSelector } from '@/store';
import { hodService } from '@/services/hod.service';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'evidence', label: 'Evidence Review', icon: FileCheck },
  { id: 'approvals', label: 'Approval Queue', icon: CheckSquare },
  { id: 'gaps', label: 'Gap Analysis', icon: AlertTriangle },
  { id: 'readiness', label: 'Repository Readiness', icon: Target },
  { id: 'analytics', label: 'Department Analytics', icon: BarChart3 },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'activity', label: 'Activity Timeline', icon: Activity },
];

export default function HODLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const selectedAcademicYear = useAppSelector((state) => state.ui.selectedAcademicYear);

  const activeView = searchParams.get('view') || 'dashboard';

  // Badge counts come from the live dashboard aggregate (pending evidence + gaps).
  const [badges, setBadges] = useState<{ pending: number; gaps: number }>({ pending: 0, gaps: 0 });
  useEffect(() => {
    let cancelled = false;
    hodService
      .getDashboard(selectedAcademicYear)
      .then((data) => {
        if (cancelled) return;
        const pending = data.evidenceSummary?.pending ?? data.evidence.filter((e) => e.status === 'pending').length;
        setBadges({ pending, gaps: data.gaps.length });
      })
      .catch(() => {
        if (!cancelled) setBadges({ pending: 0, gaps: 0 });
      });
    return () => {
      cancelled = true;
    };
  }, [selectedAcademicYear]);

  const badgeFor: Record<string, string | undefined> = {
    evidence: String(badges.pending),
    approvals: String(badges.pending),
    gaps: String(badges.gaps),
  };

  const handleNavClick = (id: string) => {
    navigate(`/app/hod-dashboard?view=${id}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Impersonation banner (read-only preview by a Super Admin) */}
      <ImpersonationBanner />

      <div className="flex min-h-0 flex-1">
      {/* Sidebar */}
      <aside className={`flex flex-col border-r bg-card transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
        {/* Logo */}
        <div className="flex items-center gap-2 p-4 border-b">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0">
            <Building2 className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">AccreditPro</p>
              <p className="text-xs text-muted-foreground truncate">Head of Department</p>
              <Badge variant="outline" className="mt-1 h-4 px-1.5 text-[9px] font-medium">
                AY {selectedAcademicYear}
              </Badge>
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 rounded-lg transition-all',
                  collapsed ? 'px-2' : 'px-3',
                  activeView === item.id
                    ? 'bg-primary/10 text-primary font-medium shadow-sm hover:bg-primary/15'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                )}
                onClick={() => handleNavClick(item.id)}
              >
                <item.icon className={cn('h-4 w-4 flex-shrink-0', activeView === item.id && 'text-primary')} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate text-sm">{item.label}</span>
                    {badgeFor[item.id] && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                        {badgeFor[item.id]}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-2 space-y-1">
          <Button variant="ghost" size="sm" className={`w-full justify-start gap-2 ${collapsed ? 'px-2' : 'px-3'}`} onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {!collapsed && <span className="text-sm">Toggle Theme</span>}
          </Button>
          <Button variant="ghost" size="sm" className={`w-full justify-start gap-2 ${collapsed ? 'px-2' : 'px-3'}`} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span className="text-sm">Collapse</span>}
          </Button>
        </div>

        {/* User */}
        <div className="border-t p-3">
          <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground truncate">CSE Department</p>
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
import { useState } from 'react';
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Building,
  Database,
  GraduationCap,
  Users,
  FlaskConical,
  Landmark,
  ClipboardList,
  Heart,
  AlertTriangle,
  Trophy,
  Bot,
  FileBarChart,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  group?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, group: 'Executive' },
  { id: 'departments', label: 'Department Performance', icon: Building, group: 'Monitoring' },
  { id: 'repository-health', label: 'Repository Readiness', icon: Database, group: 'Monitoring' },
  { id: 'accreditation', label: 'Accreditation Readiness', icon: Trophy, group: 'Monitoring' },
  { id: 'gaps', label: 'Gap Analysis', icon: AlertTriangle, group: 'Monitoring' },
  { id: 'analytics', label: 'Institution Analytics', icon: BarChart3, group: 'Monitoring' },
  { id: 'academic', label: 'Academic Performance', icon: GraduationCap, group: 'Performance' },
  { id: 'faculty', label: 'Faculty Performance', icon: Users, group: 'Performance' },
  { id: 'student', label: 'Student Performance', icon: Heart, group: 'Performance' },
  { id: 'research', label: 'Research & Innovation', icon: FlaskConical, group: 'Performance' },
  { id: 'infrastructure', label: 'Infrastructure Readiness', icon: Landmark, group: 'Performance' },
  { id: 'examination', label: 'Examination Overview', icon: ClipboardList, group: 'Performance' },
  { id: 'ai-recommendations', label: 'AI Recommendations', icon: Bot, group: 'Intelligence' },
  { id: 'reports', label: 'Reports', icon: FileBarChart, group: 'Intelligence' },
];

const groupLabels: Record<string, string> = {
  Executive: 'Executive',
  Monitoring: 'Monitoring',
  Performance: 'Performance',
  Intelligence: 'Intelligence',
};

export default function PrincipalLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const activeView = searchParams.get('view') || 'dashboard';

  const handleNavClick = (id: string) => {
    navigate(`/app/principal-dashboard?view=${id}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Group nav items
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white flex-shrink-0">
            <Trophy className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">AccreditPro</p>
              <p className="text-xs text-muted-foreground truncate">Principal</p>
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
                        {item.badge && (
                          <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                            {item.badge}
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
              <AvatarFallback className="bg-amber-100 text-amber-700 text-xs dark:bg-amber-900 dark:text-amber-300">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-muted-foreground truncate">Principal</p>
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
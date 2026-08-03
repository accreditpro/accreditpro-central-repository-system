import { useState } from 'react';
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Building2,
  Building,
  Database,
  GraduationCap,
  Users,
  BookOpen,
  FlaskConical,
  Briefcase,
  Landmark,
  Wallet,
  ClipboardList,
  Heart,
  ShieldCheck,
  FolderCheck,
  CheckSquare,
  AlertTriangle,
  Trophy,
  Bot,
  FileBarChart,
  Activity,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  group?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, group: 'Executive' },
  { id: 'institution', label: 'Institution Overview', icon: Building2, group: 'Executive' },
  { id: 'departments', label: 'Department Performance', icon: Building, group: 'Executive' },
  { id: 'repository-health', label: 'Repository Health', icon: Database, group: 'Monitoring' },
  { id: 'academic', label: 'Academic Performance', icon: GraduationCap, group: 'Monitoring' },
  { id: 'student-success', label: 'Student Success', icon: Users, group: 'Monitoring' },
  { id: 'faculty', label: 'Faculty Excellence', icon: BookOpen, group: 'Monitoring' },
  { id: 'research', label: 'Research Performance', icon: FlaskConical, group: 'Monitoring' },
  { id: 'placement', label: 'Placement Performance', icon: Briefcase, group: 'Monitoring' },
  { id: 'infrastructure', label: 'Infrastructure Overview', icon: Landmark, group: 'Monitoring' },
  { id: 'financial', label: 'Financial Overview', icon: Wallet, group: 'Monitoring' },
  { id: 'examination', label: 'Examination Analytics', icon: ClipboardList, group: 'Monitoring' },
  { id: 'student-dev', label: 'Student Development', icon: Heart, group: 'Monitoring' },
  { id: 'compliance', label: 'Compliance Status', icon: ShieldCheck, group: 'Governance' },
  { id: 'evidence', label: 'Evidence Readiness', icon: FolderCheck, group: 'Governance' },
  {
    id: 'approvals',
    label: 'Approval Center',
    icon: CheckSquare,
    badge: '14',
    group: 'Governance',
  },
  { id: 'gaps', label: 'Gap Analysis', icon: AlertTriangle, badge: '12', group: 'Governance' },
  { id: 'framework', label: 'Framework Readiness', icon: Trophy, group: 'Accreditation' },
  { id: 'ai-insights', label: 'AI Insights', icon: Bot, group: 'Accreditation' },
  { id: 'reports', label: 'Executive Reports', icon: FileBarChart, group: 'Accreditation' },
  { id: 'activity', label: 'Activity Timeline', icon: Activity, group: 'Accreditation' },
  { id: 'profile', label: 'Profile', icon: User, group: 'Account' },
];

const groupLabels: Record<string, string> = {
  Executive: 'Executive',
  Monitoring: 'Monitoring',
  Governance: 'Governance',
  Accreditation: 'Accreditation',
  Account: 'Account',
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
      <aside
        className={`flex flex-col border-r bg-card transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
      >
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
                {items.map(item => (
                  <Button
                    key={item.id}
                    variant={activeView === item.id ? 'secondary' : 'ghost'}
                    className={`w-full justify-start gap-3 h-8 ${collapsed ? 'px-2' : 'px-3'} ${activeView === item.id ? 'bg-primary/10 text-primary font-medium' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                  >
                    <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
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
          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-start gap-2 h-8 ${collapsed ? 'px-2' : 'px-3'}`}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {!collapsed && <span className="text-xs">Toggle Theme</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-start gap-2 h-8 ${collapsed ? 'px-2' : 'px-3'}`}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
            {!collapsed && <span className="text-xs">Collapse</span>}
          </Button>
        </div>

        {/* User */}
        <div className="border-t p-3">
          <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-amber-100 text-amber-700 text-xs dark:bg-amber-900 dark:text-amber-300">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">Principal</p>
              </div>
            )}
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 flex-shrink-0"
                onClick={handleLogout}
              >
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

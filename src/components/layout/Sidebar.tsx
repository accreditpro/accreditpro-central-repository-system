import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getNavigationForRole } from '@/routes/route-config';
import { NavItem } from '@/types/navigation.types';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleSidebar } from '@/store/slices/uiSlice';
import {
  Shield,
  PanelLeftClose,
  PanelLeft,
  X,
  ChevronDown,
  LayoutDashboard,
  Building2,
  GraduationCap,
  FileText,
  FileSpreadsheet,
  Award,
  BarChart3,
  Users,
  Settings,
  Database,
  Layers,
  Calendar,
  Activity,
  ClipboardList,
  ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Building2,
  GraduationCap,
  FileText,
  FileSpreadsheet,
  Award,
  BarChart3,
  Users,
  Settings,
  Database,
  Layers,
  Calendar,
  Activity,
  ClipboardList,
  ClipboardCheck,
  Shield,
};

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ mobile = false, onClose }: SidebarProps) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);
  const location = useLocation();
  const navItems = user ? getNavigationForRole(user.role) : [];
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ 'Academic Structure': true });

  const collapsed = !mobile && sidebarCollapsed;

  const handleToggle = () => {
    dispatch(toggleSidebar());
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  // Group navigation items
  const groupedNav = navItems.reduce<{ ungrouped: NavItem[]; groups: Record<string, NavItem[]> }>(
    (acc, item) => {
      if (item.group) {
        if (!acc.groups[item.group]) acc.groups[item.group] = [];
        acc.groups[item.group].push(item);
      } else {
        acc.ungrouped.push(item);
      }
      return acc;
    },
    { ungrouped: [], groups: {} }
  );

  // Build ordered nav with groups inserted at first occurrence position
  const buildOrderedNav = () => {
    const result: (NavItem | { type: 'group'; name: string; items: NavItem[] })[] = [];
    const insertedGroups = new Set<string>();

    for (const item of navItems) {
      if (item.group) {
        if (!insertedGroups.has(item.group)) {
          insertedGroups.add(item.group);
          result.push({ type: 'group', name: item.group, items: groupedNav.groups[item.group] });
        }
      } else {
        result.push(item);
      }
    }
    return result;
  };

  const orderedNav = buildOrderedNav();

  const renderNavLink = (item: NavItem, indented = false) => {
    const Icon = iconMap[item.icon] || LayoutDashboard;
    const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');

    if (collapsed) {
      return (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>
            <NavLink
              to={item.href}
              onClick={mobile ? onClose : undefined}
              className={cn(
                'flex items-center justify-center rounded-lg h-10 w-10 mx-auto transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
              )}
            >
              <Icon className="h-4 w-4" />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <NavLink
        key={item.href}
        to={item.href}
        onClick={mobile ? onClose : undefined}
        className={cn(
          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 relative',
          indented && 'ml-4 pl-3',
          isActive
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.05 }}
        >
          {item.title}
        </motion.span>
      </NavLink>
    );
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className={cn(
        'flex items-center border-b border-border/50 h-16 shrink-0',
        collapsed ? 'justify-center px-2' : 'justify-between px-4'
      )}>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col"
            >
              <span className="text-sm font-semibold tracking-tight">AccreditPro</span>
              <span className="text-[10px] text-muted-foreground leading-none">
                {user?.role === 'SUPER_ADMIN' ? 'Admin Console' : 'Institution Portal'}
              </span>
            </motion.div>
          )}
        </div>
        {mobile ? (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        ) : !collapsed ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleToggle}
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      {/* Collapsed Toggle */}
      {collapsed && !mobile && (
        <div className="flex justify-center py-2 border-b border-border/50">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleToggle}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <TooltipProvider delayDuration={0}>
          {orderedNav.map((entry, idx) => {
            if ('type' in entry && entry.type === 'group') {
              const isExpanded = expandedGroups[entry.name] ?? false;
              const hasActiveChild = entry.items.some(
                (item) => location.pathname === item.href || location.pathname.startsWith(item.href + '/')
              );

              if (collapsed) {
                return entry.items.map((item) => renderNavLink(item));
              }

              return (
                <div key={entry.name} className="space-y-1">
                  <button
                    onClick={() => toggleGroup(entry.name)}
                    className={cn(
                      'flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                      hasActiveChild
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="h-4 w-4 shrink-0" />
                      <span>{entry.name}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden space-y-1"
                      >
                        {entry.items.map((item) => renderNavLink(item, true))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return renderNavLink(entry as NavItem);
          })}
        </TooltipProvider>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t border-border/50 px-4 py-3"
        >
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  return <NavContent />;
};
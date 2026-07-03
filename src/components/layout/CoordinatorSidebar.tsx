import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, PanelLeftClose, PanelLeft, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export interface CoordinatorNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  separatorAfter?: boolean;
}

export interface CoordinatorNavGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  items: CoordinatorNavItem[];
}

interface CoordinatorSidebarProps {
  subtitle: string;
  activeView: string;
  onNavigate: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  items?: CoordinatorNavItem[];
  groups?: CoordinatorNavGroup[];
  bottomItems?: CoordinatorNavItem[];
  className?: string;
}

export const CoordinatorSidebar = ({
  subtitle,
  activeView,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
  onMobileClose,
  items = [],
  groups = [],
  bottomItems = [],
  className,
}: CoordinatorSidebarProps) => {
  const { user } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((g) => [g.title, true]))
  );

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleNavigate = (id: string) => {
    onNavigate(id);
    onMobileClose?.();
  };

  const renderNavButton = (item: CoordinatorNavItem, indented = false) => {
    const Icon = item.icon;
    const isActive = activeView === item.id;

    const button = (
      <button
        key={item.id}
        onClick={() => handleNavigate(item.id)}
        className={cn(
          'w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200',
          collapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 py-2',
          indented && !collapsed && 'ml-4 pl-3',
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.id}>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed lg:relative z-50 lg:z-0 h-full bg-card border-r border-border/50 flex flex-col transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'left-0' : '-left-64 lg:left-0',
          className
        )}
      >
        {/* Logo Section */}
        <div
          className={cn(
            'flex items-center border-b border-border/50 h-16 shrink-0',
            collapsed ? 'justify-center px-2' : 'justify-between px-4'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <span className="text-sm font-semibold tracking-tight">AccreditPro</span>
                <span className="text-[10px] text-muted-foreground leading-none">{subtitle}</span>
              </motion.div>
            )}
          </div>
          {mobileOpen ? (
            <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" onClick={onMobileClose}>
              <X className="h-4 w-4" />
            </Button>
          ) : !collapsed ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground hidden lg:flex"
              onClick={onToggleCollapse}
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        {/* Collapsed Toggle */}
        {collapsed && (
          <div className="justify-center py-2 border-b border-border/50 hidden lg:flex">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={onToggleCollapse}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <TooltipProvider delayDuration={0}>
            <nav className={cn('space-y-1', collapsed ? 'px-2' : 'px-3')}>
              {items.map((item) => (
                <div key={item.id}>
                  {renderNavButton(item)}
                  {item.separatorAfter && !collapsed && <Separator className="my-2 opacity-50" />}
                </div>
              ))}

              {groups.map((group) => (
                <div key={group.title} className="space-y-1">
                  {!collapsed ? (
                    <button
                      onClick={() => toggleGroup(group.title)}
                      className={cn(
                        'flex items-center justify-between w-full rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200',
                        group.color || 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <group.icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{group.title}</span>
                      </span>
                      <ChevronDown
                        className={cn(
                          'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
                          expandedGroups[group.title] && 'rotate-180'
                        )}
                      />
                    </button>
                  ) : (
                    <div className="flex justify-center py-1">
                      <group.icon className={cn('h-4 w-4', group.color)} />
                    </div>
                  )}

                  <AnimatePresence>
                    {(expandedGroups[group.title] || collapsed) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden space-y-1"
                      >
                        {group.items.map((item) => renderNavButton(item, true))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {bottomItems.length > 0 && (items.length > 0 || groups.length > 0) && (
                <Separator className={cn('my-2 opacity-50', collapsed && 'mx-1')} />
              )}

              {bottomItems.map((item) => renderNavButton(item))}
            </nav>
          </TooltipProvider>
        </ScrollArea>

        {/* User Footer */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-t border-border/50 px-4 py-3 shrink-0"
          >
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </motion.div>
        )}
      </aside>
    </>
  );
};

import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleNotificationPanel, toggleSidebar } from '@/store/slices/uiSlice';
import { ThemeToggle } from './ThemeToggle';
import { UserProfileMenu } from './UserProfileMenu';
import { Breadcrumbs } from './Breadcrumbs';
import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface HeaderProps {
  onMobileMenuOpen?: () => void;
  hideMobileMenuButton?: boolean;
}

export const Header = ({ onMobileMenuOpen, hideMobileMenuButton }: HeaderProps) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.ui);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 gap-4">
      {/* Mobile Menu Button */}
      {!hideMobileMenuButton && (
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8 shrink-0"
          onClick={onMobileMenuOpen}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Breadcrumbs */}
      <div className="flex-1 min-w-0">
        <Breadcrumbs />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <ThemeToggle />

        {/* Notifications */}
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

        <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />

        {/* User Profile */}
        {user && <UserProfileMenu user={user} />}
      </div>
    </header>
  );
};
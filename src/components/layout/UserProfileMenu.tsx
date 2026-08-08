import { useAuth } from '@/hooks/useAuth';
import { useExitImpersonation } from '@/hooks/useExitImpersonation';
import { User } from '@/types/auth.types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  Settings,
  User as UserIcon,
  ChevronsUpDown,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface UserProfileMenuProps {
  user: User;
}

export const UserProfileMenu = ({ user }: UserProfileMenuProps) => {
  const { logout, isImpersonating } = useAuth();
  const handleExitImpersonation = useExitImpersonation();

  const getRoleBadge = (role: string) => {
    const roleLabels: Record<string, string> = {
      SUPER_ADMIN: 'Super Admin',
      INSTITUTION_ADMIN: 'Institution Admin',
      IQAC_COORDINATOR: 'IQAC Coordinator',
      PRINCIPAL: 'Principal',
      DEPARTMENT_COORDINATOR: 'Dept. Coordinator',
      INFRASTRUCTURE_COORDINATOR: 'Infrastructure Coordinator',
      FINANCE_COORDINATOR: 'Finance Coordinator',
      TPO_COORDINATOR: 'TPO Coordinator',
      PLACEMENT_OFFICER: 'Placement Officer',
      STUDENT_DEVELOPMENT_COORDINATOR: 'Student Development Coordinator',
      EXAMINATION_OFFICER: 'Examination Officer',
      HEAD_OF_DEPARTMENT: 'Head of Department',
      HOD: 'Head of Department',
      RESEARCH_COORDINATOR: 'Research Coordinator',
      COMPLIANCE_OFFICER: 'Compliance Officer',
    };
    return roleLabels[role] || role;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 gap-2 px-2 hover:bg-accent"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-[10px] font-semibold text-primary-foreground">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <span className="hidden sm:inline-block text-sm font-medium max-w-[100px] truncate">
            {user.firstName}
          </span>
          <ChevronsUpDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" sideOffset={8}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-sm font-semibold text-primary-foreground">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            {isImpersonating ? (
              <div className="rounded-md border border-amber-300/50 bg-amber-500/10 px-2 py-1 flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-amber-600" />
                <p className="text-[10px] font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Read-only preview
                </p>
              </div>
            ) : (
              <div className="rounded-md bg-muted/50 px-2 py-1">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {getRoleBadge(user.role)}
                </p>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!isImpersonating && (
          <DropdownMenuGroup>
            <DropdownMenuItem className="cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
        <DropdownMenuSeparator />
        {isImpersonating ? (
          <DropdownMenuItem
            className="cursor-pointer text-amber-700 focus:text-amber-700 dark:text-amber-400"
            onClick={handleExitImpersonation}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            <span>Exit impersonation</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

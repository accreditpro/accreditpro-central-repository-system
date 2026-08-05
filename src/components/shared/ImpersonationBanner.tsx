import { useAuth } from '@/hooks/useAuth';
import { useExitImpersonation } from '@/hooks/useExitImpersonation';
import { Button } from '@/components/ui/button';
import { getRoleLabel } from '@/services/impersonation.service';
import { ShieldCheck, LogOut } from 'lucide-react';

export const ImpersonationBanner = () => {
  const { isImpersonating, user } = useAuth();
  const handleExit = useExitImpersonation();

  if (!isImpersonating) return null;

  const roleLabel = getRoleLabel(user?.role);

  return (
    <div className="flex items-center gap-3 border-b border-amber-300/40 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/15 px-4 py-2 backdrop-blur-sm">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-500/20">
        <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
      </div>
      <p className="min-w-0 flex-1 truncate text-[11px] font-medium text-amber-700 dark:text-amber-400">
        Viewing as <span className="font-semibold">{roleLabel}</span> of{' '}
        <span className="font-semibold">{user?.institution}</span> — read-only preview. You can view
        data and evidence but cannot edit, upload or comment.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="h-7 shrink-0 gap-1.5 border-amber-300/50 bg-background/60 text-[11px] font-medium text-amber-700 hover:bg-amber-500/10 hover:text-amber-700 dark:text-amber-400"
        onClick={handleExit}
      >
        <LogOut className="h-3 w-3" />
        Exit impersonation
      </Button>
    </div>
  );
};

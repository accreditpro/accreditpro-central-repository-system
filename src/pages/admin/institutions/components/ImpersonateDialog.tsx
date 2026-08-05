import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Institution } from '@/types/institution.types';
import { buildImpersonatedIqacUser } from '@/services/impersonation.service';
import { useAuth } from '@/hooks/useAuth';
import { InstitutionLogo } from './InstitutionLogo';
import { toast } from 'sonner';
import { ShieldCheck, Eye, Lock, GraduationCap, Ban } from 'lucide-react';

interface ImpersonateDialogProps {
  institution: Institution | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImpersonateDialog({ institution, open, onOpenChange }: ImpersonateDialogProps) {
  const { startImpersonation } = useAuth();
  const navigate = useNavigate();

  if (!institution) return null;

  const handleStart = () => {
    startImpersonation(buildImpersonatedIqacUser(institution));
    onOpenChange(false);
    toast.success(`Now viewing ${institution.name} as IQAC Coordinator (read-only)`);
    navigate('/app/iqac-dashboard');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-amber-600" />
            Preview Institution
          </DialogTitle>
          <DialogDescription>
            View this institution through its <span className="font-medium text-foreground">IQAC
            Coordinator</span>'s dashboard. The preview is{' '}
            <span className="font-medium text-foreground">read-only</span> — you can only view data,
            not add or edit any files. Your admin account is restored when you exit.
          </DialogDescription>
        </DialogHeader>

        {/* Institution header */}
        <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
          <InstitutionLogo name={institution.name} logo={institution.logo} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{institution.name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Lock className="h-3 w-3" />
              You will enter read-only preview mode
            </p>
          </div>
        </div>

        {/* Single IQAC preview action */}
        <button
          type="button"
          onClick={handleStart}
          className="group flex w-full items-center gap-3 rounded-xl border border-indigo-300/60 bg-indigo-500/5 px-4 py-4 text-left transition-all hover:border-indigo-400/80 hover:bg-indigo-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-600/10 transition-colors group-hover:bg-indigo-600/20">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold flex items-center gap-2">
              View as IQAC Coordinator
              <GraduationCap className="h-3.5 w-3.5 text-indigo-500" />
            </p>
            <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
              IQAC dashboard, supporting documents, quality observations & continuous improvement
            </p>
          </div>
          <span className="text-xs font-medium text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100">
            Enter preview →
          </span>
        </button>

        {/* Read-only reminder */}
        <div className="flex items-start gap-2 rounded-lg border border-amber-300/40 bg-amber-500/5 px-3 py-2.5">
          <Ban className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
          <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-snug">
            Editing, uploading and commenting are disabled during the preview. Exit anytime from the
            amber banner at the top of the page.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleStart} className="gap-1.5">
            <Eye className="h-4 w-4" />
            Preview Institution
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

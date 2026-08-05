import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { History, FileText, User, Calendar } from 'lucide-react';
import type { VerificationDocument } from '../../verification-data';
import { IqacStatusBadge, HodStatusBadge } from './verification-status';

interface VersionHistoryDialogProps {
  document: VerificationDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VersionHistoryDialog({ document, open, onOpenChange }: VersionHistoryDialogProps) {
  if (!document) return null;

  // Derive a plausible version trail from the document metadata.
  const versions = Array.from({ length: document.version }, (_, i) => {
    const v = document.version - i;
    return {
      version: v,
      fileName: document.name,
      uploadedBy: v === 1 ? document.uploadedBy : document.uploadedBy,
      uploadedAt:
        v === document.version
          ? document.uploadedAt
          : `2025-${String(2 + i).padStart(2, '0')}-${String(4 + ((i * 7) % 20)).padStart(2, '0')}`,
      note:
        v === 1
          ? 'Initial upload'
          : v === document.version
            ? 'Latest revision uploaded after HOD feedback'
            : `Revision after HOD re-approval (v${v})`,
    };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Version History
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <span className="truncate">{document.name}</span>
            <HodStatusBadge status={document.hodStatus} />
            <IqacStatusBadge status={document.iqacStatus} />
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {versions.map((v) => (
            <div key={v.version} className="flex items-start gap-3 rounded-lg border p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">Version {v.version}</p>
                  {v.version === document.version && (
                    <Badge className="bg-blue-500/10 text-blue-600 text-[9px] px-1.5 py-0">Current</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{v.note}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {v.uploadedBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {v.uploadedAt}
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0">{document.size}</Badge>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

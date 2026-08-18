import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch } from '@/store';
import { verifyDocument } from '@/store/slices/iqacVerificationSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { iqacService } from '@/services/iqac.service';
import { toast } from 'sonner';
import { ShieldCheck, FileText, CheckCircle2, Calendar, User } from 'lucide-react';
import { VerificationDocument } from '../../verification-data';
import { IqacStatusBadge, HodStatusBadge } from './verification-status';

interface VerifyDocumentDialogProps {
  document: VerificationDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VerifyDocumentDialog({ document, open, onOpenChange }: VerifyDocumentDialogProps) {
  const dispatch = useAppDispatch();
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!document) return null;

  const handleVerify = async () => {
    setSubmitting(true);
    try {
      await iqacService.verifyDocument(document.id, { comments: comments.trim() || undefined });
      // Optimistic local overlay — the view refreshes its list immediately.
      dispatch(verifyDocument({ id: document.id, comments, hodApproved: document.hodStatus === 'approved' }));
      dispatch(
        addNotification({
          title: 'Document verified',
          message: `"${document.name}" verified for ${document.department} · ${document.repository}.`,
          type: 'success',
          read: false,
        })
      );
      toast.success(`"${document.name}" verified`);
      setComments('');
      onOpenChange(false);
    } catch {
      toast.error('Failed to verify the document. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setComments(''); }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            Verify Document
          </DialogTitle>
          <DialogDescription>
            Confirm that this evidence is institutionally verified for accreditation.
          </DialogDescription>
        </DialogHeader>

        {/* Document summary */}
        <div className="rounded-xl border bg-muted/30 p-3.5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{document.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {document.department} · {document.repository} · {document.folder}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <HodStatusBadge status={document.hodStatus} />
                <IqacStatusBadge status={document.iqacStatus} />
                {document.frameworks.map((f) => (
                  <Badge key={f} variant="outline" className="text-[9px] h-5 px-1.5">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Uploaded {document.uploadedAt}
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <User className="h-3 w-3" />
              {document.uploadedBy}
            </div>
          </div>
        </div>

        {/* Verification fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Verification Date</p>
              <p className="text-sm font-medium mt-1">{new Date().toLocaleDateString()}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Verified By</p>
              <p className="text-sm font-medium mt-1">IQAC Coordinator</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Comments (Optional)</Label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add a verification comment (e.g. evidence matches repository claims)…"
              className="min-h-[90px] text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleVerify} className="gap-1.5" disabled={submitting}>
            <CheckCircle2 className="h-4 w-4" />
            {submitting ? 'Verifying…' : 'Verify'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

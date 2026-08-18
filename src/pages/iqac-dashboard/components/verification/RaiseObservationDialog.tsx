import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppDispatch } from '@/store';
import { raiseObservation } from '@/store/slices/iqacVerificationSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { iqacService } from '@/services/iqac.service';
import { toast } from 'sonner';
import { MessageSquareWarning, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VerificationDocument } from '../../verification-data';
import { PRIORITY_META } from '../common';
import type { ObservationPriority } from '../../types';

interface RaiseObservationDialogProps {
  document: VerificationDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRIORITIES: ObservationPriority[] = ['low', 'medium', 'high', 'critical'];

export function RaiseObservationDialog({ document, open, onOpenChange }: RaiseObservationDialogProps) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<ObservationPriority>('medium');
  const [description, setDescription] = useState('');
  const [recommendedCorrection, setRecommendedCorrection] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!document) return null;

  const reset = () => {
    setTitle('');
    setPriority('medium');
    setDescription('');
    setRecommendedCorrection('');
    setDueDate('');
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !recommendedCorrection.trim() || !dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await iqacService.raiseVerificationObservation(document.id, {
        title,
        priority,
        description,
        recommendedCorrection,
        dueDate,
      });
      // Optimistic local overlay — the views reflect the raised observation immediately.
      dispatch(
        raiseObservation({
          document,
          input: { title, priority, description, recommendedCorrection, dueDate },
        })
      );
      dispatch(
        addNotification({
          title: 'Observation raised',
          message: `Observation on "${document.name}" sent to ${document.department} Coordinator and HOD.`,
          type: 'warning',
          read: false,
        })
      );
      toast.success('Observation raised — department coordinator & HOD notified');
      reset();
      onOpenChange(false);
    } catch {
      toast.error('Failed to raise the observation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquareWarning className="h-4 w-4 text-orange-600" />
            Raise Observation
          </DialogTitle>
          <DialogDescription>
            Flag an issue with this document for the department to correct. Observations are tracked
            until resolved and verified.
          </DialogDescription>
        </DialogHeader>

        {/* Document context */}
        <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
            <FileText className="h-4 w-4 text-orange-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{document.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {document.department} · {document.repository} · {document.folder}
              {document.faculty ? ` · ${document.faculty}` : document.student ? ` · ${document.student}` : ''}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Observation Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Uploaded copy is missing signature page"
              className="h-9 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Repository</Label>
              <Input value={document.repository} readOnly className="h-9 text-sm bg-muted/40" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Input value={document.category} readOnly className="h-9 text-sm bg-muted/40" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Priority *</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as ObservationPriority)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">
                      <span className={cn('font-medium capitalize', PRIORITY_META[p].badge.split(' ')[1])}>
                        {p}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Due Date *</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-9 text-sm" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the quality / completeness / relevance issue…"
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Recommended Correction *</Label>
            <Textarea
              value={recommendedCorrection}
              onChange={(e) => setRecommendedCorrection(e.target.value)}
              placeholder="What should the department correct and re-upload?"
              className="min-h-[70px] text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="gap-1.5" disabled={submitting}>
            <MessageSquareWarning className="h-4 w-4" />
            {submitting ? 'Submitting…' : 'Submit Observation'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

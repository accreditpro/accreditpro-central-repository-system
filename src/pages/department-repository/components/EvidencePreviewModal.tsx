import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  User,
  Calendar,
  Layers,
  HardDrive,
  FileCheck,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface EvidencePreviewModalProps {
  open: boolean;
  onClose: () => void;
  document: any | null;
  sectionName?: string;
}

export const EvidencePreviewModal = ({
  open,
  onClose,
  document: doc,
  sectionName,
}: EvidencePreviewModalProps) => {
  const [zoom, setZoom] = useState(100);

  if (!doc) return null;

  const fileName = doc.fileName || doc.documentName || 'document.pdf';
  const docTitle = doc.documentName || doc.fileName || 'Evidence Document';
  const docType = doc.documentType || 'General Evidence';
  const fileSizeStr = doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : '57.3 KB';
  const uploadDateStr = doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : 'N/A';
  const status = (doc.verificationStatus || 'PENDING').toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-border shadow-2xl">
        {/* Modal Top Toolbar Header */}
        <div className="p-4 border-b bg-muted/30 flex items-center justify-between gap-3 pr-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate leading-tight" title={docTitle}>
                {docTitle}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-200 py-0 px-1.5 font-normal">
                  {docType}
                </Badge>
                <span className="text-[11px] text-muted-foreground truncate">• Section: {doc.sectionName || sectionName || 'General'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Badge
              variant="secondary"
              className={cn(
                'text-[10px] font-medium px-2 py-0.5 flex items-center gap-1',
                status === 'VERIFIED' && 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                status === 'PENDING' && 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                status === 'REJECTED' && 'bg-red-500/10 text-red-600 border-red-500/20'
              )}
            >
              {status === 'VERIFIED' && <CheckCircle2 className="h-3 w-3" />}
              {status === 'PENDING' && <Clock className="h-3 w-3" />}
              {status === 'REJECTED' && <XCircle className="h-3 w-3" />}
              {status}
            </Badge>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
          {/* Document Viewer Paper Sheet Canvas */}
          <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
            {/* Viewer Controls Header */}
            <div className="px-4 py-2 border-b bg-muted/40 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <FileCheck className="h-3.5 w-3.5 text-blue-600" />
                <span>Document Viewer</span>
                <span className="text-muted-foreground/50">|</span>
                <span>Page 1 of 1</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(z => Math.max(75, z - 10))}>
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <span className="text-[10px] font-mono w-10 text-center">{zoom}%</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(z => Math.min(150, z + 10))}>
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Document Paper Preview Card */}
            <div className="p-6 md:p-8 min-h-[300px] bg-slate-950/5 dark:bg-slate-900/60 flex flex-col items-center justify-center">
              <div
                className="w-full max-w-xl bg-background border shadow-md rounded-lg p-6 space-y-4 transition-all"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              >
                {/* Document Letterhead Stamp */}
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-indigo-600 shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">AccreditPro Evidence Repository</h4>
                      <p className="text-[10px] text-muted-foreground truncate">Central Academic & Department Verification Asset</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-mono bg-indigo-500/5 text-indigo-600 border-indigo-200 shrink-0">
                    AUTHENTICATED
                  </Badge>
                </div>

                {/* Document Body Simulation */}
                <div className="space-y-3 py-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border">
                    <FileText className="h-8 w-8 text-blue-600 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground break-all leading-tight">
                        {fileName}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>Format: PDF / Document</span>
                        <span>•</span>
                        <span>Size: {fileSizeStr}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-muted/20 border border-border/40">
                      <span className="text-muted-foreground block text-[9px] uppercase font-semibold">Document Type</span>
                      <span className="font-medium text-foreground truncate block">{docType}</span>
                    </div>
                    <div className="p-2 rounded bg-muted/20 border border-border/40">
                      <span className="text-muted-foreground block text-[9px] uppercase font-semibold">Associated Record</span>
                      <span className="font-mono text-foreground truncate block">Record #{doc.recordId || '-'}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-dashed bg-blue-500/5 border-blue-500/20 text-center">
                    <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                      Official Supporting Evidence Document
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Verified for {doc.sectionName || sectionName || 'Department'} Repository Audit Requirements.
                    </p>
                  </div>
                </div>

                {/* Footer Stamp */}
                <div className="border-t pt-2 flex items-center justify-between text-[9px] text-muted-foreground font-mono">
                  <span>ID: EV-{doc.id || '101'}</span>
                  <span>Uploaded: {uploadDateStr}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Metadata Breakdown Card */}
          <div className="border rounded-xl p-4 bg-card shadow-sm space-y-3">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-indigo-600" />
              Document Metadata & Audit Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg border bg-muted/20 min-w-0">
                <span className="text-[10px] font-medium text-muted-foreground block flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Full File Name
                </span>
                <span className="font-mono text-[11px] text-foreground break-all block mt-1">
                  {fileName}
                </span>
              </div>

              <div className="p-2.5 rounded-lg border bg-muted/20 min-w-0">
                <span className="text-[10px] font-medium text-muted-foreground block flex items-center gap-1">
                  <User className="h-3 w-3" /> Uploaded By
                </span>
                <span className="font-medium text-foreground block mt-1">
                  {doc.uploadedBy || 'Admin User'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg border bg-muted/20 min-w-0">
                <span className="text-[10px] font-medium text-muted-foreground block flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Upload Date & Time
                </span>
                <span className="font-medium text-foreground block mt-1">
                  {uploadDateStr}
                </span>
              </div>

              <div className="p-2.5 rounded-lg border bg-muted/20 min-w-0">
                <span className="text-[10px] font-medium text-muted-foreground block flex items-center gap-1">
                  <HardDrive className="h-3 w-3" /> File Size
                </span>
                <span className="font-medium text-foreground block mt-1">
                  {fileSizeStr}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t bg-muted/30 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground font-mono pl-2">
            Record Reference: #{doc.recordId || '-'}
          </span>
          <Button variant="outline" size="sm" className="text-xs h-8 px-4" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

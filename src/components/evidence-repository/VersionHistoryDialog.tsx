import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Eye, FileText, GitBranch } from 'lucide-react';
import { EvidenceDocument, getStatusColor, getStatusLabel } from './types';

interface VersionHistoryDialogProps {
  document: EvidenceDocument | null;
  open: boolean;
  onClose: () => void;
}

export function VersionHistoryDialog({ document, open, onClose }: VersionHistoryDialogProps) {
  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Version History
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Document Info */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <FileText className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">{document.name}</p>
          </div>

          {/* Version Timeline */}
          <ScrollArea className="max-h-[400px]">
            <div className="relative pl-6 space-y-0">
              {/* Timeline line */}
              <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />

              {[...document.versions].reverse().map((version, index) => (
                <div key={version.id} className="relative pb-4">
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-[-13px] top-2 h-3 w-3 rounded-full border-2 ${
                      index === 0
                        ? 'bg-primary border-primary'
                        : 'bg-background border-muted-foreground/30'
                    }`}
                  />

                  <div className="ml-4 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-bold">
                          V{version.version}
                        </Badge>
                        <Badge className={`text-[9px] ${getStatusColor(version.status)}`}>
                          {getStatusLabel(version.status)}
                        </Badge>
                        {index === 0 && (
                          <Badge variant="default" className="text-[9px] bg-primary">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" title="Preview">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" title="Download">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium">{version.fileName}</p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>By: {version.uploadedBy}</span>
                        <span>•</span>
                        <span>{version.uploadedAt}</span>
                        <span>•</span>
                        <span>{(version.fileSize / 1024).toFixed(0)} KB</span>
                      </div>
                      {version.versionNotes && (
                        <p className="text-xs text-muted-foreground italic mt-1">
                          &ldquo;{version.versionNotes}&rdquo;
                        </p>
                      )}
                      {version.verifiedBy && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                          ✓ Verified by {version.verifiedBy} on {version.verifiedAt}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
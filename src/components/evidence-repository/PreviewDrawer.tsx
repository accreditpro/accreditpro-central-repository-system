import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Calendar, User, ShieldCheck, Clock, Tag, Layers } from 'lucide-react';
import { EvidenceDocument, getStatusColor, getStatusLabel } from './types';

interface PreviewDrawerProps {
  document: EvidenceDocument | null;
  open: boolean;
  onClose: () => void;
}

export function PreviewDrawer({ document, open, onClose }: PreviewDrawerProps) {
  if (!document) return null;

  const latestVersion = document.versions[document.versions.length - 1];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[450px] sm:w-[500px] p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="flex items-center gap-2 text-left">
            <FileText className="h-5 w-5 text-primary" />
            Document Preview
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="px-6 pb-6 space-y-5">
            {/* Document Preview Area */}
            <div className="rounded-lg border bg-muted/30 p-8 flex flex-col items-center justify-center min-h-[200px]">
              <FileText className="h-16 w-16 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                {latestVersion?.fileName || document.name}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {latestVersion?.fileType?.toUpperCase() || 'PDF'} •{' '}
                {latestVersion ? `${(latestVersion.fileSize / 1024).toFixed(0)} KB` : '—'}
              </p>
            </div>

            <Separator />

            {/* Document Information */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Document Information
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <InfoItem label="Document Name" value={document.name} />
                <InfoItem label="Mandatory" value={document.mandatory ? 'Yes' : 'No'} />
                <InfoItem
                  label="Status"
                  value={
                    <Badge className={`text-[10px] ${getStatusColor(document.status)}`}>
                      {getStatusLabel(document.status)}
                    </Badge>
                  }
                />
                <InfoItem
                  label="Current Version"
                  value={document.currentVersion ? `V${document.currentVersion}` : '—'}
                />
              </div>
            </div>

            <Separator />

            {/* Framework Mapping */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Framework Mapping
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {document.frameworks.map(fw => (
                  <Badge key={fw} variant="secondary" className="text-xs">
                    {fw}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Upload Details */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upload Details
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <InfoItem
                  label="Uploaded By"
                  value={
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {latestVersion?.uploadedBy || document.uploadedBy || '—'}
                    </span>
                  }
                />
                <InfoItem
                  label="Uploaded Date"
                  value={
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {document.uploadedOn || '—'}
                    </span>
                  }
                />
                <InfoItem
                  label="Verified By"
                  value={
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      {latestVersion?.verifiedBy || '—'}
                    </span>
                  }
                />
                <InfoItem
                  label="Verification Date"
                  value={
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {latestVersion?.verifiedAt || '—'}
                    </span>
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Version History */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Version History
              </h4>
              {document.versions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No versions available</p>
              ) : (
                <div className="space-y-2">
                  {[...document.versions].reverse().map(version => (
                    <div
                      key={version.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                          V{version.version}
                        </div>
                        <div>
                          <p className="text-xs font-medium">{version.fileName}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {version.uploadedBy} • {version.uploadedAt}
                          </p>
                        </div>
                      </div>
                      <Badge className={`text-[9px] ${getStatusColor(version.status)}`}>
                        {getStatusLabel(version.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comments */}
            {latestVersion?.comments && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Comments</h4>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    {latestVersion.comments}
                  </p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <div className="text-sm font-medium mt-0.5">{value}</div>
    </div>
  );
}

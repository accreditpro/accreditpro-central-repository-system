import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Eye,
  DownloadCloud,
  ImageIcon,
  FileType,
  HardDrive,
  CalendarDays,
  User,
  ShieldCheck,
  FileUp,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageZoomViewer } from '@/components/shared/ImageZoomViewer';
import { DocxViewer } from '@/components/shared/DocxViewer';

export interface EvidencePreviewData {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  dataUrl: string;
  uploadedAt?: string;
  uploadedBy?: string;
  status?: string;
  category?: string;
}

interface EvidencePreviewDialogProps {
  evidence: EvidencePreviewData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Reusable Evidence Preview Dialog
 * Supports: PNG, JPG, JPEG (image preview) + PDF (embedded viewer)
 * Extensible for DOCX / XLSX / ZIP (shows file info with download prompt)
 */
export function EvidencePreviewDialog({ evidence, open, onOpenChange }: EvidencePreviewDialogProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'details'>('preview');
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => setIsFullScreen(prev => !prev);

  if (!evidence) return null;

  const ext = evidence.fileType?.toLowerCase();
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);
  const isPdf = ext === 'pdf';
  const isPreviewable = isImage || isPdf;
  const isDoc = ['doc', 'docx'].includes(ext);
  const isDocx = ext === 'docx';
  const isSpreadsheet = ['xls', 'xlsx'].includes(ext);
  const isArchive = ext === 'zip';

  const getFileIcon = () => {
    if (isImage) return <ImageIcon className="h-5 w-5 text-blue-600" />;
    if (isPdf) return <FileText className="h-5 w-5 text-red-600" />;
    if (isDoc) return <FileText className="h-5 w-5 text-indigo-600" />;
    if (isSpreadsheet) return <FileText className="h-5 w-5 text-emerald-600" />;
    return <FileType className="h-5 w-5 text-muted-foreground" />;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-500/10 text-emerald-600';
      case 'under-review': return 'bg-amber-500/10 text-amber-600';
      case 'uploaded': return 'bg-blue-500/10 text-blue-600';
      case 'rejected': return 'bg-red-500/10 text-red-600';
      case 'changes-requested': return 'bg-purple-500/10 text-purple-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const renderPreview = (fullScreen = false) => {
    if (isImage) {
      return (
        <ImageZoomViewer
          src={evidence.dataUrl}
          alt={evidence.fileName}
          className={cn(
            fullScreen ? 'min-h-0 flex-1' : 'min-h-[300px] max-h-[65vh]',
          )}
          showControls
          showFitButton
          variant={fullScreen ? 'minimal' : 'default'}
        />
      );
    }

    if (isPdf) {
      return (
        <div className={cn(
          'rounded-xl overflow-hidden border bg-muted/10',
          fullScreen ? 'flex-1 min-h-0' : 'min-h-[400px] max-h-[70vh]',
        )}>
          <iframe
            src={evidence.dataUrl}
            title={evidence.fileName}
            className={cn('w-full border-none', fullScreen ? 'h-full' : 'h-[70vh]')}
          >
            <p className="text-sm text-muted-foreground p-4">
              Your browser doesn't support PDF preview.{' '}
              <a
                href={evidence.dataUrl}
                download={evidence.fileName}
                className="text-indigo-600 hover:underline"
              >
                Download instead
              </a>
            </p>
          </iframe>
        </div>
      );
    }

    if (isDocx) {
      return (
        <div className={cn(
          'rounded-xl overflow-hidden border',
          fullScreen ? 'flex-1 min-h-0' : 'min-h-[400px] max-h-[70vh]',
        )}>
          <DocxViewer
            src={evidence.dataUrl}
            fileName={evidence.fileName}
            variant={fullScreen ? 'minimal' : 'default'}
            className="h-full"
          />
        </div>
      );
    }

    // Non-previewable file types — show download prompt
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl bg-muted/20 border border-dashed">
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
            <FileText className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <div className="absolute -top-2 -right-2">
            <Badge variant="secondary" className="text-[9px] uppercase">{ext}</Badge>
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Preview not available for {ext.toUpperCase()} files
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1 mb-4">
          Download the file to view its contents
        </p>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => download()}
        >
          <DownloadCloud className="h-4 w-4" />
          Download {evidence.fileName}
        </Button>
      </div>
    );
  };

  const download = () => {
    const link = document.createElement('a');
    link.href = evidence.dataUrl;
    link.download = evidence.fileName;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => {
      if (!o && isFullScreen) {
        // Dialog trying to close (Escape / click outside) while in full-screen
        // — just exit full-screen instead of closing
        setIsFullScreen(false);
        return;
      }
      if (!o) {
        setIsFullScreen(false);
      }
      onOpenChange(o);
    }}>
      <DialogContent
        className={cn(
          'overflow-hidden flex flex-col p-0 gap-0 transition-all duration-300',
          isFullScreen
            ? 'max-w-[98vw] max-h-[98vh] sm:max-w-[98vw] sm:max-h-[98vh] rounded-2xl'
            : 'sm:max-w-4xl max-h-[90vh]',
        )}
      >
        {/* Header */}
        <div className={cn('p-5 pr-14 border-b', isFullScreen ? 'pb-3 shrink-0' : 'pb-3')}>
          <DialogHeader className="space-y-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                  {getFileIcon()}
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-sm font-semibold truncate max-w-[300px] sm:max-w-[500px]" title={evidence.fileName}>
                    {evidence.fileName}
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <Badge variant="secondary" className="text-[9px] uppercase">
                      .{ext}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      {evidence.fileSize}
                    </span>
                    {evidence.uploadedAt && (
                      <>
                        <span className="text-[9px] text-muted-foreground">•</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {evidence.uploadedAt}
                        </span>
                      </>
                    )}
                    {evidence.status && (
                      <Badge className={cn('text-[8px] py-0', getStatusColor(evidence.status))}>
                        {evidence.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Full-screen toggle */}
                {isPreviewable && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                    onClick={toggleFullScreen}
                    title={isFullScreen ? 'Exit full screen' : 'Full screen'}
                  >
                    {isFullScreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                )}

                {/* Download button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 gap-1.5"
                  onClick={download}
                >
                  <DownloadCloud className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Full-screen banner hint */}
        {isFullScreen && (
          <div className="px-5 py-1.5 bg-indigo-500/5 border-b border-indigo-500/10 flex items-center justify-between shrink-0">
            <p className="text-[10px] text-indigo-600/70 flex items-center gap-1.5">
              <Maximize2 className="h-3 w-3" />
              Full-screen mode — press <kbd className="px-1 py-0.5 rounded bg-indigo-500/10 text-[9px] font-mono">Esc</kbd> to exit
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] gap-1 text-indigo-600 hover:text-indigo-700"
              onClick={() => setIsFullScreen(false)}
            >
              <Minimize2 className="h-3 w-3" />
              Exit
            </Button>
          </div>
        )}

        {/* Tabs: Preview / Details */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'preview' | 'details')}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className={cn('px-5 shrink-0', isFullScreen ? 'pt-3 pb-2' : 'pt-3')}>
            <TabsList className="h-8">
              <TabsTrigger value="preview" className="text-xs gap-1.5" disabled={!isPreviewable}>
                <Eye className="h-3.5 w-3.5" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="details" className="text-xs gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Details
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Preview tab */}
          <TabsContent
            value="preview"
            className={cn(
              'm-0 overflow-auto',
              isFullScreen ? 'flex-1 px-5 pb-5 pt-2 min-h-0' : 'flex-1 px-5 pb-5 pt-3',
            )}
          >
            <div className={cn(isFullScreen ? 'h-full flex flex-col' : '')}>
              {renderPreview(isFullScreen)}
            </div>
          </TabsContent>

          {/* Details tab */}
          <TabsContent value="details" className="flex-1 px-5 pb-5 pt-3 m-0 overflow-auto">
            <div className="space-y-5">
              {/* File Information */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  File Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem
                    icon={<FileType className="h-3.5 w-3.5" />}
                    label="File Type"
                    value={ext.toUpperCase()}
                  />
                  <DetailItem
                    icon={<HardDrive className="h-3.5 w-3.5" />}
                    label="File Size"
                    value={evidence.fileSize}
                  />
                  <DetailItem
                    icon={<FileText className="h-3.5 w-3.5" />}
                    label="File Name"
                    value={evidence.fileName}
                    span
                  />
                </div>
              </div>

              <Separator />

              {/* Upload Information */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FileUp className="h-3.5 w-3.5" />
                  Upload Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {evidence.uploadedBy && (
                    <DetailItem
                      icon={<User className="h-3.5 w-3.5" />}
                      label="Uploaded By"
                      value={evidence.uploadedBy}
                    />
                  )}
                  {evidence.uploadedAt && (
                    <DetailItem
                      icon={<CalendarDays className="h-3.5 w-3.5" />}
                      label="Uploaded On"
                      value={evidence.uploadedAt}
                    />
                  )}
                  {evidence.status && (
                    <DetailItem
                      icon={<ShieldCheck className="h-3.5 w-3.5" />}
                      label="Status"
                      value={
                        <Badge className={cn('text-[9px]', getStatusColor(evidence.status))}>
                          {evidence.status}
                        </Badge>
                      }
                    />
                  )}
                  {evidence.category && (
                    <DetailItem
                      icon={<FileText className="h-3.5 w-3.5" />}
                      label="Category"
                      value={evidence.category}
                    />
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({
  icon,
  label,
  value,
  span,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  span?: boolean;
}) {
  return (
    <div className={cn('space-y-1', span && 'col-span-2')}>
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">{icon}</span>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
      <div className="text-xs font-medium pl-5">{value}</div>
    </div>
  );
}

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, FileText, Download, Eye, Image as ImageIcon, FileSpreadsheet, FileArchive, FileType2 } from 'lucide-react';
import type { VerificationDocument, VerificationFileType } from '../../verification-data';
import { HodStatusBadge, IqacStatusBadge } from './verification-status';

const FILE_ICON: Record<VerificationFileType, React.ElementType> = {
  pdf: FileText,
  docx: FileText,
  xlsx: FileSpreadsheet,
  pptx: FileType2,
  zip: FileArchive,
  image: ImageIcon,
  other: FileText,
};

const FILE_TINT: Record<VerificationFileType, string> = {
  pdf: 'from-red-500/15 to-orange-500/10 text-red-600',
  docx: 'from-blue-500/15 to-indigo-500/10 text-blue-600',
  xlsx: 'from-emerald-500/15 to-green-500/10 text-emerald-600',
  pptx: 'from-orange-500/15 to-amber-500/10 text-orange-600',
  zip: 'from-violet-500/15 to-purple-500/10 text-violet-600',
  image: 'from-sky-500/15 to-cyan-500/10 text-sky-600',
  other: 'from-slate-500/15 to-slate-500/10 text-slate-600',
};

interface DocumentPreviewPanelProps {
  document: VerificationDocument;
  onClose: () => void;
  onDownload: (doc: VerificationDocument) => void;
}

export function DocumentPreviewPanel({ document, onClose, onDownload }: DocumentPreviewPanelProps) {
  const Icon = FILE_ICON[document.fileType];

  return (
    <div className="rounded-xl border bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{document.name}</p>
          <p className="text-[10px] text-muted-foreground">
            {document.department} · {document.repository} · {document.folder} · v{document.version}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => onDownload(document)}>
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">
        {/* Inline preview — file-type aware placeholder */}
        <div className={`relative flex min-h-[280px] items-center justify-center bg-gradient-to-br ${FILE_TINT[document.fileType]}`}>
          {document.fileType === 'image' ? (
            <div className="text-center">
              <ImageIcon className="h-16 w-16 mx-auto opacity-60" />
              <p className="mt-2 text-xs font-medium opacity-70">Image preview</p>
              <p className="text-[10px] opacity-50">{document.size}</p>
            </div>
          ) : (
            <div className="text-center px-6">
              <div className="relative inline-block">
                <Icon className="h-16 w-16 opacity-60" />
                <Badge className="absolute -bottom-1 -right-3 bg-background text-[9px] shadow-sm">
                  .{document.fileType === 'other' ? 'doc' : document.fileType}
                </Badge>
              </div>
              <p className="mt-3 text-xs font-medium opacity-70">Document preview</p>
              <p className="text-[10px] opacity-50 mt-0.5">{document.size} · uploaded {document.uploadedAt}</p>
            </div>
          )}
          <Badge variant="outline" className="absolute top-3 left-3 bg-background/80 text-[9px]">
            <Eye className="h-3 w-3 mr-1" />
            Inline preview — {document.fileType.toUpperCase()}
          </Badge>
        </div>

        {/* Metadata */}
        <div className="border-l p-4 space-y-3 text-xs">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Status</p>
            <div className="flex flex-col gap-1.5">
              <HodStatusBadge status={document.hodStatus} />
              <IqacStatusBadge status={document.iqacStatus} />
            </div>
          </div>
          <dl className="space-y-1.5">
            {[
              ['Repository', document.repository],
              ['Department', document.department],
              ['Academic Year', document.academicYear],
              ['Category', document.category],
              ['Faculty / Student', document.faculty ?? document.student ?? '—'],
              ['Uploaded By', document.uploadedBy],
              ['Upload Date', document.uploadedAt],
              ['Last Modified', document.lastModified],
              ['Version', `v${document.version}`],
              ['Size', document.size],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium text-right truncate max-w-[150px]">{v}</dd>
              </div>
            ))}
          </dl>
          {document.verifiedAt && (
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-2 text-[10px] text-blue-700 dark:text-blue-300">
              Verified by {document.verifiedBy} on {document.verifiedAt}
              {document.comments ? ` — "${document.comments}"` : ''}
            </div>
          )}
          <div className="flex flex-wrap gap-1">
            {document.frameworks.map((f) => (
              <Badge key={f} variant="outline" className="text-[9px] h-5 px-1.5">
                {f}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

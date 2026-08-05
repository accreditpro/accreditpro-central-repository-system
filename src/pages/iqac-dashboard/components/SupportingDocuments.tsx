import { useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  FolderOpen,
  Plus,
  Eye,
  Download,
  History,
  FileText,
  FileSpreadsheet,
  FileType,
  UploadCloud,
  Folder,
  ShieldCheck,
} from 'lucide-react';
import { EvidencePreviewDialog, type EvidencePreviewData } from '@/components/shared/EvidencePreviewDialog';
import { useAppDispatch, useAppSelector } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import { addDocument, addDocumentVersion, selectDocuments } from '@/store/slices/iqacSlice';
import { DOC_FOLDERS, IQAC_NAME } from '../iqac-data';
import type { IQACDocument, IQACDocumentInput } from '../types';
import { SearchInput } from './common';
import { cn } from '@/lib/utils';

const urlCache = new Map<string, string>();

function getDocUrl(doc: IQACDocument): string {
  // Key by id + current version so a new version re-generates the preview.
  const cacheKey = `${doc.id}-${doc.versions[0]?.version ?? 'v1'}`;
  const cached = urlCache.get(cacheKey);
  if (cached) return cached;
  let url: string;
  if (doc.fileType === 'pdf') {
    const pdf = new jsPDF();
    pdf.setFillColor(241, 245, 249);
    pdf.rect(0, 0, 210, 297, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor(79, 70, 229);
    pdf.text(doc.name, 20, 32);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`${doc.folder} • ${doc.description}`, 20, 42);
    pdf.setFontSize(9);
    pdf.setTextColor(148, 163, 184);
    pdf.text('AccreditPro — IQAC Supporting Document (auto-generated preview)', 20, 258);
    url = String(pdf.output('bloburl'));
  } else {
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000">` +
      `<rect width="100%" height="100%" fill="#f1f5f9"/>` +
      `<rect x="30" y="30" width="740" height="940" rx="10" fill="#ffffff" stroke="#cbd5e1"/>` +
      `<text x="400" y="120" font-family="Arial, sans-serif" font-size="26" font-weight="bold" text-anchor="middle" fill="#4f46e5">${doc.name}</text>` +
      `<text x="400" y="160" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#64748b">${doc.folder}</text>` +
      `<rect x="60" y="200" width="680" height="520" rx="8" fill="#e2e8f0"/>` +
      `<text x="400" y="460" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="#94a3b8">[ ${doc.fileType.toUpperCase()} Document ]</text>` +
      `<rect x="60" y="760" width="680" height="100" rx="8" fill="#f8fafc" stroke="#e2e8f0"/>` +
      `<text x="400" y="810" font-family="Arial, sans-serif" font-size="13" text-anchor="middle" fill="#64748b">Maintained by IQAC — ${IQAC_NAME}</text>` +
      `</svg>`;
    url = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  }
  urlCache.set(cacheKey, url);
  return url;
}

function toPreviewData(doc: IQACDocument): EvidencePreviewData {
  return {
    id: doc.id,
    fileName: doc.name,
    fileType: doc.fileType === 'xlsx' ? 'xlsx' : doc.fileType === 'docx' ? 'doc' : doc.fileType === 'zip' ? 'zip' : 'pdf',
    fileSize: doc.size,
    dataUrl: getDocUrl(doc),
    uploadedAt: doc.uploadedDate,
    uploadedBy: doc.uploadedBy,
    status: 'approved',
    category: doc.folder,
  };
}

const TYPE_ICON: Record<IQACDocument['fileType'], React.ElementType> = {
  pdf: FileText,
  docx: FileText,
  xlsx: FileSpreadsheet,
  pptx: FileType,
  zip: FileType,
};

const TYPE_COLOR: Record<IQACDocument['fileType'], string> = {
  pdf: 'text-red-500',
  docx: 'text-indigo-500',
  xlsx: 'text-emerald-500',
  pptx: 'text-orange-500',
  zip: 'text-amber-500',
};

export function SupportingDocuments() {
  const dispatch = useAppDispatch();
  const { isImpersonating } = useAuth();
  const documents = useAppSelector(selectDocuments);

  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('all');
  const [preview, setPreview] = useState<IQACDocument | null>(null);
  const [history, setHistory] = useState<IQACDocument | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [form, setForm] = useState<Omit<IQACDocumentInput, 'uploadedBy'>>({
    folder: DOC_FOLDERS[0],
    name: '',
    description: '',
    fileType: 'pdf',
    size: '1.0 MB',
    tags: [],
  });

  const filtered = useMemo(
    () =>
      documents.filter((d) => {
        const matchesSearch =
          !search ||
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.description.toLowerCase().includes(search.toLowerCase()) ||
          d.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
        const matchesFolder = folder === 'all' || d.folder === folder;
        return matchesSearch && matchesFolder;
      }),
    [documents, search, folder]
  );

  const folderCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of documents) counts.set(d.folder, (counts.get(d.folder) ?? 0) + 1);
    return counts;
  }, [documents]);

  const download = (doc: IQACDocument) => {
    const link = document.createElement('a');
    link.href = getDocUrl(doc);
    link.download = doc.name;
    link.click();
    toast.success(`Downloading ${doc.name}`);
  };

  const submit = () => {
    if (!form.name.trim()) {
      toast.error('Please provide a document name.');
      return;
    }
    dispatch(addDocument({ ...form, uploadedBy: IQAC_NAME }));
    toast.success('Document uploaded to the IQAC document store.');
    setUploadOpen(false);
    setForm({ folder: DOC_FOLDERS[0], name: '', description: '', fileType: 'pdf', size: '1.0 MB', tags: [] });
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold">IQAC Supporting Documents</h3>
              <p className="text-xs text-muted-foreground">
                Institutional quality documents — annual reports, AQAR, SSR evidence, best practices, policies and minutes.
              </p>
            </div>
            {isImpersonating ? (
              <Badge
                variant="outline"
                className="gap-1 border-amber-300/50 text-[10px] font-medium text-amber-700 dark:text-amber-400"
              >
                <Eye className="h-3 w-3" /> Read-only preview
              </Badge>
            ) : (
              <Button size="sm" className="gap-1.5" onClick={() => setUploadOpen(true)}>
                <UploadCloud className="h-4 w-4" /> Upload Document
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Folder chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFolder('all')}
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all',
            folder === 'all' ? 'border-primary/50 bg-primary/10 text-primary' : 'hover:bg-muted/50 text-muted-foreground'
          )}
        >
          <Folder className="h-3 w-3" /> All Folders
          <Badge variant="secondary" className="h-4 px-1 text-[9px]">{documents.length}</Badge>
        </button>
        {DOC_FOLDERS.map((f) => (
          <button
            key={f}
            onClick={() => setFolder(folder === f ? 'all' : f)}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all',
              folder === f ? 'border-primary/50 bg-primary/10 text-primary' : 'hover:bg-muted/50 text-muted-foreground'
            )}
          >
            <FolderOpen className="h-3 w-3" /> {f}
            <Badge variant="secondary" className="h-4 px-1 text-[9px]">{folderCounts.get(f) ?? 0}</Badge>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Search documents, tags, descriptions…" className="w-72" />
        <span className="text-[11px] text-muted-foreground">{filtered.length} document{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Documents table */}
      <Card className="border-border/50">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs min-w-[760px]">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Document</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Folder</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Version</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Size</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Uploaded By</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Date</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => {
                const Icon = TYPE_ICON[doc.fileType];
                return (
                  <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <span className={cn('p-1.5 rounded-lg bg-muted/40', TYPE_COLOR[doc.fileType])}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[240px]">{doc.name}</p>
                          <div className="flex gap-1 mt-0.5 flex-wrap">
                            {doc.tags.map((t) => (
                              <Badge key={t} variant="secondary" className="text-[8px] h-3.5 px-1">{t}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{doc.folder}</td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className="text-[9px]">{doc.versions[0]?.version ?? 'v1'}</Badge>
                    </td>
                    <td className="p-3 text-center text-muted-foreground">{doc.size}</td>
                    <td className="p-3 text-center">{doc.uploadedBy}</td>
                    <td className="p-3 text-center text-muted-foreground">{doc.uploadedDate}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Preview" onClick={() => setPreview(doc)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Version history" onClick={() => setHistory(doc)}>
                          <History className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Download" onClick={() => download(doc)}>
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        {!isImpersonating && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px] gap-1"
                            onClick={() => {
                              dispatch(addDocumentVersion({ id: doc.id, note: 'New version uploaded' }));
                              toast.success('New version added.');
                            }}
                          >
                            <Plus className="h-3 w-3" /> New Version
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground text-xs">
                    No documents match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Preview dialog (reuses the shared evidence preview) */}
      <EvidencePreviewDialog
        evidence={preview ? toPreviewData(preview) : null}
        open={preview !== null}
        onOpenChange={(o) => !o && setPreview(null)}
      />

      {/* Version history dialog */}
      <Dialog open={history !== null} onOpenChange={(o) => !o && setHistory(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4 text-primary" /> Version History
            </DialogTitle>
            <DialogDescription>{history?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {history?.versions.map((v, i) => (
              <div key={v.version} className="flex items-start gap-3 rounded-lg border p-3">
                <span className={cn('mt-0.5 h-2 w-2 rounded-full shrink-0', i === 0 ? 'bg-emerald-500' : 'bg-muted-foreground/40')} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px]">{v.version}</Badge>
                    {i === 0 && <Badge className="text-[8px] h-4">Latest</Badge>}
                    <span className="text-[10px] text-muted-foreground ml-auto">{v.fileSize}</span>
                  </div>
                  <p className="text-xs mt-1">
                    <span className="font-medium">{v.uploadedBy}</span>
                    <span className="text-muted-foreground"> · {v.uploadedDate}</span>
                  </p>
                  {v.note && <p className="text-[11px] text-muted-foreground mt-1">“{v.note}”</p>}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setHistory(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UploadCloud className="h-4 w-4 text-primary" /> Upload IQAC Document
            </DialogTitle>
            <DialogDescription>
              Documents are maintained by the IQAC and versioned automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Folder *</Label>
              <Select value={form.folder} onValueChange={(v) => setForm({ ...form, folder: v })}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DOC_FOLDERS.map((f) => (
                    <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Document Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. IQAC Annual Report 2025-26.pdf" className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" className="h-9 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">File Type *</Label>
                <Select value={form.fileType} onValueChange={(v) => setForm({ ...form, fileType: v as IQACDocument['fileType'] })}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['pdf', 'docx', 'xlsx', 'pptx', 'zip'] as const).map((t) => (
                      <SelectItem key={t} value={t} className="text-xs uppercase">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Size</Label>
                <Input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="e.g. 1.2 MB" className="h-9 text-xs" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tags (comma separated)</Label>
              <Input
                value={form.tags.join(', ')}
                onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
                placeholder="annual, report, naac"
                className="h-9 text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={submit}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <ShieldCheck className="h-3 w-3 text-emerald-500" />
        Documents are stored locally in this session and survive reloads via the IQAC store.
      </p>
    </div>
  );
}

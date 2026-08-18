import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Search, FileText, Download, Eye, FolderOpen,
  ArrowLeft, Clock, Calendar, FileEdit, BadgeCheck, Repeat,
  Trash2, FileImage, File, Upload, Loader2, Landmark,
} from 'lucide-react';
import { toast } from 'sonner';
import { EvidencePreviewDialog, EvidencePreviewData } from '@/components/shared/EvidencePreviewDialog';
import {
  examinationRepositoryService,
  ExaminationEvidenceFile,
  DocumentFolderSummary,
  SupportingDocumentApi,
} from '@/services/examination-repository.service';
import { cn } from '@/lib/utils';
import { useReadOnly } from '@/hooks/useReadOnly';

// ============================================================
// FOLDER DEFINITIONS
// ============================================================

interface FolderDefinition {
  key: string;
  kind: 'module' | 'category';
  label: string;
  description: string;
  icon: React.ReactNode;
  bgClass: string;
  borderClass: string;
}

const MODULE_FOLDERS: FolderDefinition[] = [
  {
    key: 'examination-schedules',
    kind: 'module',
    label: 'Examination Schedules',
    description: 'Uploaded schedule documents and evidence',
    icon: <Calendar className="h-5 w-5 text-blue-600" />,
    bgClass: 'bg-blue-50 dark:bg-blue-950/30',
    borderClass: 'border-blue-200/60 dark:border-blue-800/40',
  },
  {
    key: 'examination-circulars',
    kind: 'module',
    label: 'Examination Circulars',
    description: 'Uploaded circular PDFs and notifications',
    icon: <FileEdit className="h-5 w-5 text-amber-600" />,
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    borderClass: 'border-amber-200/60 dark:border-amber-800/40',
  },
  {
    key: 'result-publications',
    kind: 'module',
    label: 'Result Publications',
    description: 'Uploaded result gazettes and summaries',
    icon: <BadgeCheck className="h-5 w-5 text-emerald-600" />,
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderClass: 'border-emerald-200/60 dark:border-emerald-800/40',
  },
  {
    key: 'supplementary-examinations',
    kind: 'module',
    label: 'Supplementary Examinations',
    description: 'Uploaded supplementary exam notifications and schedules',
    icon: <Repeat className="h-5 w-5 text-purple-600" />,
    bgClass: 'bg-purple-50 dark:bg-purple-950/30',
    borderClass: 'border-purple-200/60 dark:border-purple-800/40',
  },
];

const CATEGORY_COLORS = [
  { bg: 'bg-slate-50 dark:bg-slate-950/30', border: 'border-slate-200/60 dark:border-slate-800/40' },
  { bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200/60 dark:border-rose-800/40' },
  { bg: 'bg-teal-50 dark:bg-teal-950/30', border: 'border-teal-200/60 dark:border-teal-800/40' },
  { bg: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-200/60 dark:border-indigo-800/40' },
  { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200/60 dark:border-orange-800/40' },
  { bg: 'bg-cyan-50 dark:bg-cyan-950/30', border: 'border-cyan-200/60 dark:border-cyan-800/40' },
  { bg: 'bg-lime-50 dark:bg-lime-950/30', border: 'border-lime-200/60 dark:border-lime-800/40' },
  { bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/30', border: 'border-fuchsia-200/60 dark:border-fuchsia-800/40' },
  { bg: 'bg-stone-50 dark:bg-stone-950/30', border: 'border-stone-200/60 dark:border-stone-800/40' },
];

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <FileImage className="h-4 w-4 text-pink-500" />;
  if (type.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
  if (type.includes('word') || type.includes('docx')) return <FileText className="h-4 w-4 text-blue-500" />;
  if (type.includes('sheet') || type.includes('excel') || type.includes('csv'))
    return <FileText className="h-4 w-4 text-emerald-500" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExt(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

async function fetchPreviewBlob(
  kind: 'module' | 'category',
  id: string
): Promise<Blob> {
  const blob =
    kind === 'module'
      ? await examinationRepositoryService.getEvidenceBlob(id)
      : await examinationRepositoryService.getSupportingDocumentBlob(id);
  if (blob.type === 'application/json') {
    const text = await blob.text();
    throw new Error(text || 'Failed to load preview');
  }
  return blob;
}

// ============================================================
// FILE CARD (server-backed: preview via blob, download via API)
// ============================================================

interface FileCardProps {
  name: string;
  type: string;
  size: number;
  meta?: string;
  kind: 'module' | 'category';
  id: string;
  isImage?: boolean;
  onPreview?: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

function EvidenceFileCard({ name, type, size, meta, isImage, onPreview, onDownload, onDelete }: FileCardProps) {
  const isReadOnly = useReadOnly();

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6, scale: 0.95 }}
      layout
      className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3 hover:shadow-sm hover:border-primary/30 transition-all"
    >
      {/* Thumbnail / Icon */}
      <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-muted flex items-center justify-center">
        {isImage ? (
          <FileImage className="h-4 w-4 text-pink-500" />
        ) : (
          getFileIcon(type)
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
          <span>{formatFileSize(size)}</span>
          {meta && (
            <span className="flex items-center gap-1 truncate">
              <Clock className="h-3 w-3 shrink-0" />
              <span className="truncate">{meta}</span>
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {onPreview && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onPreview}
            title="Preview"
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onDownload}
          title="Download"
        >
          <Download className="h-4 w-4" />
        </Button>
        {!isReadOnly && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================
// SUPPORTING DOCUMENT UPLOAD DIALOG
// ============================================================

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  categoryId: string;
  categoryLabel: string;
  academicYear: string;
  onUploaded: () => void;
}

function SupportingDocumentUploadDialog({ open, onClose, categoryId, categoryLabel, academicYear, onUploaded }: UploadDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setVersion('');
      setTags('');
      setFile(null);
    }
  }, [open]);

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please choose a file to upload');
      return;
    }
    if (!title.trim()) {
      toast.error('Document title is required');
      return;
    }
    setUploading(true);
    try {
      await examinationRepositoryService.uploadSupportingDocument({
        file,
        title: title.trim(),
        description: description.trim() || undefined,
        category: categoryId,
        academicYear,
        tags: tags.trim() || undefined,
        version: version.trim() || undefined,
      });
      toast.success('Document uploaded successfully');
      onUploaded();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !uploading && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload Document — {categoryLabel}
          </DialogTitle>
          <DialogDescription>
            Upload an institutional document into this folder.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Examination Policy 2025" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" className="h-9" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Version</Label>
              <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="e.g. 1.0" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Tags (comma separated)</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="policy, guidelines" className="h-9" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              File <span className="text-destructive">*</span>
            </Label>
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="h-9 file:h-8 file:text-xs"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleUpload} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// MAIN EXPORT
// ============================================================

export function ExaminationDocumentsView({ academicYear }: { academicYear: string }) {
  const [moduleEvidence, setModuleEvidence] = useState<ExaminationEvidenceFile[]>([]);
  const [categoryFolders, setCategoryFolders] = useState<DocumentFolderSummary[]>([]);
  const [categoryDocs, setCategoryDocs] = useState<SupportingDocumentApi[]>([]);
  const [selectedFolderKey, setSelectedFolderKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [previewData, setPreviewData] = useState<EvidencePreviewData | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(false);

  const selectedFolder = useMemo(() => {
    const all = [
      ...MODULE_FOLDERS,
      ...categoryFolders.map((f, idx) => {
        const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
        return {
          key: f.category,
          kind: 'category' as const,
          label: f.label,
          description: f.description,
          icon: <Landmark className="h-5 w-5 text-slate-600" />,
          bgClass: color.bg,
          borderClass: color.border,
        };
      }),
    ];
    return all.find((f) => f.key === selectedFolderKey) || null;
  }, [selectedFolderKey, categoryFolders]);

  // ── Load module evidence (per module) + category folder summaries ──
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [evRes, folderRes] = await Promise.all([
        Promise.all(
          MODULE_FOLDERS.map((f) =>
            examinationRepositoryService
              .getEvidence({ moduleId: f.key, page: 0, size: 500 })
              .then((p) => p.content)
              .catch(() => [] as ExaminationEvidenceFile[])
          )
        ),
        examinationRepositoryService.getDocumentFolders().catch(() => [] as DocumentFolderSummary[]),
      ]);
      setModuleEvidence(evRes.flat());
      setCategoryFolders(folderRes);
    } catch {
      // non-blocking
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Load documents for a selected category folder ──
  const fetchCategoryDocs = useCallback(async () => {
    if (!selectedFolder || selectedFolder.kind !== 'category') return;
    setDocsLoading(true);
    try {
      const data = await examinationRepositoryService.getSupportingDocuments({
        category: selectedFolder.key,
        academicYear: yearFilter !== 'all' ? yearFilter : undefined,
        page: 0,
        size: 200,
      });
      setCategoryDocs(data.content);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load documents');
      setCategoryDocs([]);
    } finally {
      setDocsLoading(false);
    }
  }, [selectedFolder, yearFilter]);

  useEffect(() => {
    fetchCategoryDocs();
  }, [fetchCategoryDocs]);

  // ── Build folder grid stats ──
  const folderStats = useMemo(() => {
    return [
      ...MODULE_FOLDERS.map((folder) => {
        const files = moduleEvidence.filter((f) => f.moduleId === folder.key);
        return {
          ...folder,
          count: files.length,
          recordCount: new Set(files.map((f) => f.recordId)).size,
        };
      }),
      ...categoryFolders.map((f, idx) => {
        const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
        return {
          key: f.category,
          kind: 'category' as const,
          label: f.label,
          description: f.description,
          icon: <Landmark className="h-5 w-5 text-slate-600" />,
          bgClass: color.bg,
          borderClass: color.border,
          count: f.documentCount,
          recordCount: 0,
        };
      }),
    ];
  }, [moduleEvidence, categoryFolders]);

  const filteredFolders = useMemo(() => {
    if (!searchQuery) return folderStats;
    const q = searchQuery.toLowerCase();
    return folderStats.filter(
      (f) =>
        f.label.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q)
    );
  }, [folderStats, searchQuery]);

  // Files for the selected module folder
  const selectedFolderFiles = useMemo(() => {
    if (!selectedFolder) return [];
    if (selectedFolder.kind === 'category') return categoryDocs;
    let files = moduleEvidence.filter((f) => f.moduleId === selectedFolder.key);
    if (yearFilter !== 'all') {
      files = files.filter((f) => f.academicYear === yearFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      files = files.filter(
        (f) => f.name.toLowerCase().includes(q) || f.recordTitle.toLowerCase().includes(q)
      );
    }
    return files;
  }, [selectedFolder, moduleEvidence, categoryDocs, yearFilter, searchQuery]);

  const years = useMemo(() => {
    const yrSet = new Set<string>();
    moduleEvidence.forEach((f) => yrSet.add(f.academicYear));
    categoryDocs.forEach((d) => yrSet.add(d.academicYear));
    return Array.from(yrSet).filter(Boolean).sort().reverse();
  }, [moduleEvidence, categoryDocs]);

  const totalEvidenceFiles = moduleEvidence.length;

  const handlePreview = async (kind: 'module' | 'category', file: { id: string; name: string; size: number; type: string; uploadedAt: string }) => {
    try {
      const blob = await fetchPreviewBlob(kind, file.id);
      const dataUrl = URL.createObjectURL(blob);
      const ext = getFileExt(file.name);
      setPreviewData({
        id: file.id,
        fileName: file.name,
        fileType: ext,
        fileSize: formatFileSize(file.size),
        dataUrl,
        uploadedAt: new Date(file.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        category: selectedFolder?.label || '',
      });
      setPreviewOpen(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load preview');
    }
  };

  const handleDownload = async (kind: 'module' | 'category', file: { id: string; name: string }) => {
    try {
      if (kind === 'module') {
        await examinationRepositoryService.downloadEvidence(file.id, file.name);
      } else {
        await examinationRepositoryService.downloadSupportingDocument(file.id, file.name);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to download file');
    }
  };

  const handleDelete = async (kind: 'module' | 'category', file: { id: string; name: string }) => {
    if (!window.confirm(`Delete "${file.name}"? This cannot be undone.`)) return;
    try {
      if (kind === 'module') {
        await examinationRepositoryService.deleteEvidence(file.id);
      } else {
        await examinationRepositoryService.deleteSupportingDocument(file.id);
      }
      toast.success('Document deleted successfully');
      if (kind === 'module') fetchAll();
      else fetchCategoryDocs();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete document');
    }
  };

  return (
    <>
      {!selectedFolder ? (
        /* === FOLDER GRID VIEW === */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Supporting Documents</h2>
              <p className="text-muted-foreground">
                {totalEvidenceFiles > 0
                  ? `${totalEvidenceFiles} evidence file${totalEvidenceFiles !== 1 ? 's' : ''} across modules`
                  : 'Upload evidence from Examination Schedules, Circulars, Results, or Supplementary modules'}
              </p>
            </div>
          </div>

          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search folders...  "
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {MODULE_FOLDERS.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    Module Evidence
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {folderStats
                      .filter((f) => f.kind === 'module')
                      .filter((f) => !searchQuery || f.label.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((folder) => (
                        <FolderCard
                          key={folder.key}
                          folder={folder}
                          onClick={() => {
                            setSelectedFolderKey(folder.key);
                            setSearchQuery('');
                          }}
                        />
                      ))}
                  </div>
                </div>
              )}
              {categoryFolders.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 mt-6">
                    Institutional Documents
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {folderStats
                      .filter((f) => f.kind === 'category')
                      .filter((f) => !searchQuery || f.label.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((folder) => (
                        <FolderCard
                          key={folder.key}
                          folder={folder}
                          onClick={() => {
                            setSelectedFolderKey(folder.key);
                            setSearchQuery('');
                          }}
                        />
                      ))}
                  </div>
                </div>
              )}

              {filteredFolders.length === 0 && (
                <div className="text-center py-16">
                  <FolderOpen className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">No folders found</h3>
                  <p className="text-sm text-muted-foreground/70 mt-1 max-w-md mx-auto">
                    Upload evidence from any examination module, or add institutional documents, and they will appear here.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* === FOLDER DETAIL VIEW === */
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => {
                setSelectedFolderKey(null);
                setSearchQuery('');
                setYearFilter('all');
              }}
            >
              <ArrowLeft className="h-4 w-4" /> Back to Folders
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', selectedFolder.bgClass)}>
                {selectedFolder.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold">{selectedFolder.label}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedFolderFiles.length} file{selectedFolderFiles.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {selectedFolder.kind === 'category' && (
              <Button size="sm" className="gap-2" onClick={() => setUploadDialogOpen(true)}>
                <Upload className="h-4 w-4" />
                Upload Document
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files or record titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {years.length > 0 && (
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-36 h-9 text-xs">
                  <SelectValue placeholder="Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={y} className="text-xs">{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Badge variant="secondary" className="text-[10px]">
              {selectedFolderFiles.length} file{selectedFolderFiles.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {docsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : selectedFolderFiles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No files found</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {selectedFolder.kind === 'module'
                  ? `Upload evidence from the ${selectedFolder.label} module to see it here`
                  : 'Upload a document to see it here'}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-2">
                {selectedFolderFiles.map((file) => {
                  const isEvidence = selectedFolder.kind === 'module';
                  const f = file as unknown as ExaminationEvidenceFile;
                  const d = file as unknown as SupportingDocumentApi;
                  const name = isEvidence ? f.name : d.title;
                  const type = isEvidence ? f.type : 'application/pdf';
                  const size = isEvidence ? f.size : 0;
                  const uploadedAt = isEvidence ? f.uploadedAt : d.uploadedAt;
                  const meta = isEvidence ? f.recordTitle : d.description || d.version;
                  return (
                    <EvidenceFileCard
                      key={file.id}
                      name={name}
                      type={type}
                      size={size}
                      meta={meta || undefined}
                      isImage={type.startsWith('image/')}
                      kind={selectedFolder.kind}
                      id={file.id}
                      onPreview={() =>
                        handlePreview(selectedFolder.kind, { id: file.id, name, size, type, uploadedAt })
                      }
                      onDownload={() => handleDownload(selectedFolder.kind, { id: file.id, name })}
                      onDelete={() => handleDelete(selectedFolder.kind, { id: file.id, name })}
                    />
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Upload dialog for category folders */}
      {selectedFolder?.kind === 'category' && (
        <SupportingDocumentUploadDialog
          open={uploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
          categoryId={selectedFolder.key}
          categoryLabel={selectedFolder.label}
          academicYear={academicYear}
          onUploaded={() => {
            fetchCategoryDocs();
            fetchAll();
          }}
        />
      )}

      {/* Evidence Preview Dialog — ALWAYS rendered at the top level */}
      <EvidencePreviewDialog
        evidence={previewData}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </>
  );
}

interface FolderCardProps {
  folder: {
    key: string;
    kind: 'module' | 'category';
    label: string;
    description: string;
    icon: React.ReactNode;
    bgClass: string;
    borderClass: string;
    count: number;
    recordCount: number;
  };
  onClick: () => void;
}

function FolderCard({ folder, onClick }: FolderCardProps) {
  return (
    <Card
      className={cn(
        'hover:shadow-md transition-all duration-200 cursor-pointer group hover:-translate-y-0.5',
        folder.borderClass
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={cn('h-12 w-12 shrink-0 rounded-xl flex items-center justify-center', folder.bgClass)}>
            {folder.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold truncate">{folder.label}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{folder.description}</p>
            <div className="flex items-center gap-3 mt-3">
              <Badge variant="secondary" className="text-[10px]">
                {folder.count} file{folder.count !== 1 ? 's' : ''}
              </Badge>
              {folder.kind === 'module' && folder.recordCount > 0 && (
                <Badge variant="outline" className="text-[10px]">
                  {folder.recordCount} record{folder.recordCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1">
            View &rarr;
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

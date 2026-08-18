import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  Upload,
  FileText,
  FileImage,
  FileArchive,
  FileSpreadsheet,
  File,
  X,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Paperclip,
  Eye,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  dataUrl?: string;
  /** Original File object for session-uploaded files (used by API-backed callers) */
  file?: File;
}

export interface EvidenceCategory {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  acceptedTypes?: string[];
}

export interface EvidenceUploadResult {
  files: Record<string, UploadedFile[]>;
}

// Supported across all modules: docx, pdf, zip, png, xlsx, csv, jpg
export const DEFAULT_ACCEPTED_TYPES = [
  '.pdf',
  '.docx',
  '.zip',
  '.png',
  '.jpg',
  '.jpeg',
  '.xlsx',
  '.csv',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'image/png',
  'image/jpeg',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
];

// ============================================================
// HELPERS
// ============================================================

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(filename: string): string {
  return '.' + filename.split('.').pop()?.toLowerCase() || '';
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <FileImage className="h-4 w-4 text-pink-500" />;
  if (type.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
  if (type.includes('word') || type.includes('docx')) return <FileText className="h-4 w-4 text-blue-500" />;
  if (type.includes('sheet') || type.includes('excel')) return <FileSpreadsheet className="h-4 w-4 text-emerald-500" />;
  if (type.includes('csv') || type.includes('text/')) return <FileSpreadsheet className="h-4 w-4 text-teal-500" />;
  if (type.includes('zip') || type.includes('compressed')) return <FileArchive className="h-4 w-4 text-amber-500" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
}

// ============================================================
// DROP ZONE COMPONENT
// ============================================================

interface DropZoneProps {
  acceptedTypes: string[];
  onFilesSelected: (files: File[]) => void;
}

function DropZone({ acceptedTypes, onFilesSelected }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const validateAndProcessFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      const validFiles = files.filter((f) => {
        const ext = getFileExtension(f.name);
        const mimeOk = ACCEPTED_MIME_TYPES.includes(f.type);
        const extOk = acceptedTypes.includes(ext);
        const sizeOk = f.size <= MAX_FILE_SIZE;
        return (mimeOk || extOk) && sizeOk;
      });
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    },
    [acceptedTypes, onFilesSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        validateAndProcessFiles(e.dataTransfer.files);
      }
    },
    [validateAndProcessFiles]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        validateAndProcessFiles(e.target.files);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [validateAndProcessFiles]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        'relative rounded-lg border-2 border-dashed p-4 cursor-pointer transition-all duration-200',
        isDragOver
          ? 'border-primary bg-primary/5 scale-[1.02] shadow-lg'
          : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="flex flex-col items-center gap-1.5 text-center">
        <div
          className={cn(
            'rounded-full p-2 transition-colors',
            isDragOver ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
          )}
        >
          <Upload className={cn('h-5 w-5', isDragOver && 'animate-bounce')} />
        </div>
        <p className="text-xs font-medium">
          {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-[10px] text-muted-foreground">
          or <span className="text-primary font-medium">click to browse</span>
        </p>
        <p className="text-[9px] text-muted-foreground">
          Supported: {acceptedTypes.join(', ')} • Max 10MB each
        </p>
      </div>
    </div>
  );
}

// ============================================================
// FILE CARD COMPONENT
// ============================================================

interface FileCardProps {
  file: UploadedFile;
  onRemove: (id: string) => void;
}

function FileCard({ file, onRemove }: FileCardProps) {
  const isImage = file.type.startsWith('image/');

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      className="flex items-center gap-2 rounded-lg border border-border/50 bg-card p-2 pr-1 group hover:border-primary/30 transition-colors"
    >
      {isImage && file.dataUrl ? (
        <div className="h-8 w-8 rounded overflow-hidden shrink-0 bg-muted">
          <img
            src={file.dataUrl}
            alt={file.name}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="h-8 w-8 rounded flex items-center justify-center bg-muted shrink-0">
          {getFileIcon(file.type)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium truncate">{file.name}</p>
        <p className="text-[9px] text-muted-foreground">{formatFileSize(file.size)}</p>
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {isImage && file.dataUrl && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => window.open(file.dataUrl, '_blank')}
            title="Preview"
          >
            <Eye className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={() => onRemove(file.id)}
          title="Remove file"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </motion.div>
  );
}

// ============================================================
// MAIN DIALOG COMPONENT
// ============================================================

interface EvidenceUploadDialogProps {
  open: boolean;
  onClose: () => void;
  /** What we are uploading the evidence for, e.g. "Campus Master Plan" or "Curriculum R22" */
  title: string;
  /** Optional extra context shown under the title */
  subtitle?: string;
  /** Category sections, each of which accepts one or more documents */
  categories: EvidenceCategory[];
  /** Pre-populated files keyed by category id */
  initialFiles?: Record<string, UploadedFile[]>;
  /** Called with the latest files when the dialog is saved/closed */
  onSave?: (result: EvidenceUploadResult) => void;
  /** Called when the dialog is dismissed without saving (Close / X / Escape) */
  onCancel?: () => void;
}

export function EvidenceUploadDialog({
  open,
  onClose,
  title,
  subtitle,
  categories,
  initialFiles,
  onSave,
  onCancel,
}: EvidenceUploadDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile[]>>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Reset local state each time the dialog opens so a fresh record never
  // inherits stale files from a previous session (categories may also change).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (open) {
      const initial: Record<string, UploadedFile[]> = {};
      categories.forEach((s) => {
        initial[s.id] = initialFiles?.[s.id] || [];
      });
      setUploadedFiles(initial);
      setExpandedSections(new Set(categories.map((c) => c.id)));
      setUploadSuccess(null);
    }
  }, [open]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleFilesSelected = useCallback(
    (categoryId: string, files: File[]) => {
      const newUploadedFiles: UploadedFile[] = files.map((f) => ({
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        name: f.name,
        size: f.size,
        type: f.type,
        uploadedAt: new Date().toISOString(),
        dataUrl: URL.createObjectURL(f),
        file: f,
      }));

      setUploadedFiles((prev) => ({
        ...prev,
        [categoryId]: [...(prev[categoryId] || []), ...newUploadedFiles],
      }));

      setUploadSuccess(
        `${newUploadedFiles.length} file(s) added to ${
          categories.find((s) => s.id === categoryId)?.label
        }`
      );
      setTimeout(() => setUploadSuccess(null), 3000);
    },
    [categories]
  );

  const handleRemoveFile = useCallback(
    (categoryId: string, fileId: string) => {
      setUploadedFiles((prev) => {
        const sectionFiles = prev[categoryId] || [];
        const fileToRemove = sectionFiles.find((f) => f.id === fileId);
        // Only revoke URLs for files uploaded in this session. Files that came
        // in via `initialFiles` are owned by the caller (e.g. an evidence store)
        // and must keep working URLs even if removed here but not saved.
        const isInitialFile =
          fileToRemove != null &&
          categories.some((c) => initialFiles?.[c.id]?.some((f) => f.id === fileId));
        if (fileToRemove?.dataUrl && !isInitialFile) {
          URL.revokeObjectURL(fileToRemove.dataUrl);
        }
        return {
          ...prev,
          [categoryId]: sectionFiles.filter((f) => f.id !== fileId),
        };
      });
    },
    [categories, initialFiles]
  );

  // Revoke object URLs for files uploaded in this session so they don't leak
  // when the dialog is dismissed without saving. Files that came in via
  // `initialFiles` are owned by the caller and keep their URLs.
  const revokeSessionUrls = useCallback(() => {
    const initialIds = new Set(
      (initialFiles ? Object.values(initialFiles).flat() : []).map((f) => f.id)
    );
    Object.values(uploadedFiles)
      .flat()
      .forEach((f) => {
        if (f.dataUrl && !initialIds.has(f.id)) {
          URL.revokeObjectURL(f.dataUrl);
        }
      });
  }, [uploadedFiles, initialFiles]);

  const [saving, setSaving] = useState(false);

  const handleSaveClose = () => {
    if (saving) return;
    setSaving(true);
    // onSave may return a Promise (API-backed callers perform real uploads);
    // only close once the work is complete so the dialog can surface errors.
    const result = onSave?.({ files: uploadedFiles });
    Promise.resolve(result)
      .then(() => {
        setSaving(false);
        onClose();
      })
      .catch(() => {
        setSaving(false);
        // Keep the dialog open so the caller's error handling can be retried
      });
  };

  const handleDismiss = () => {
    if (saving) return;
    if (onCancel || !onSave) {
      // Discard — release this session's object URLs since nothing is persisted
      // (covers explicit cancel AND the plain documents views that only discard)
      revokeSessionUrls();
      onCancel?.();
    } else {
      onSave?.({ files: uploadedFiles });
    }
    onClose();
  };

  const allExpanded = expandedSections.size === categories.length;

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedSections(new Set());
    } else {
      setExpandedSections(new Set(categories.map((s) => s.id)));
    }
  };

  const totalFiles = Object.values(uploadedFiles).reduce((sum, files) => sum + files.length, 0);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Paperclip className="h-5 w-5 text-primary" />
            Upload Evidence — {title}
          </DialogTitle>
          <DialogDescription>
            {subtitle || 'Upload and manage supporting documents. Each category accepts one or more files.'}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence>
          {uploadSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 shrink-0"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-xs font-medium text-emerald-700">{uploadSuccess}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-3 px-1 text-xs text-muted-foreground overflow-x-auto flex-1 min-w-0">
            <span className="font-semibold text-foreground whitespace-nowrap">{totalFiles} total files</span>
            {categories.map((c) => {
              const count = uploadedFiles[c.id]?.length || 0;
              return (
                <span key={c.id} className="flex items-center gap-1 whitespace-nowrap">
                  {c.icon}
                  <span>{count}</span>
                </span>
              );
            })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] shrink-0 px-2"
            onClick={toggleAll}
          >
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </Button>
        </div>

        <Separator className="shrink-0" />

        <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-3">
          {categories.map((category) => {
            const isExpanded = expandedSections.has(category.id);
            const files = uploadedFiles[category.id] || [];
            const acceptedTypes = category.acceptedTypes || DEFAULT_ACCEPTED_TYPES;

            return (
              <div
                key={category.id}
                className="rounded-lg border border-border/50 overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(category.id)}
                  className="flex items-center gap-2 w-full px-3 py-2.5 bg-muted/20 hover:bg-muted/50 transition-colors text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  )}
                  {category.icon}
                  <span className="text-xs font-semibold flex-1">{category.label}</span>
                  <Badge
                    variant={files.length > 0 ? 'secondary' : 'outline'}
                    className="text-[9px]"
                  >
                    {files.length} file{files.length !== 1 ? 's' : ''}
                  </Badge>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key={`content-${category.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                      <div className="p-3 space-y-3">
                        {category.description && (
                          <p className="text-[10px] text-muted-foreground">{category.description}</p>
                        )}

                        <DropZone
                          acceptedTypes={acceptedTypes}
                          onFilesSelected={(files) => handleFilesSelected(category.id, files)}
                        />

                        {files.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-medium text-muted-foreground">
                              Uploaded Documents
                            </p>
                            <AnimatePresence>
                              {files.map((file) => (
                                <FileCard
                                  key={file.id}
                                  file={file}
                                  onRemove={(id) => handleRemoveFile(category.id, id)}
                                />
                              ))}
                            </AnimatePresence>
                            {files.length > 3 && (
                              <p className="text-[9px] text-muted-foreground text-center pt-1">
                                {files.length} file{files.length !== 1 ? 's' : ''} uploaded
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-3 border-t shrink-0">
          <p className="text-[10px] text-muted-foreground">
            Accepted formats: PDF, DOCX, ZIP, PNG, JPG, XLSX, CSV (max 10MB each)
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDismiss} disabled={saving}>
              Close
            </Button>
            <Button size="sm" onClick={handleSaveClose} disabled={saving}>
              {saving ? 'Saving...' : 'Save & Close'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

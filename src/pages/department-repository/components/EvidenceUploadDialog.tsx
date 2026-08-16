import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Upload, FileText, CheckCircle2, X, FolderOpen } from 'lucide-react';

interface EvidenceUploadDialogProps {
  open: boolean;
  onClose: () => void;
  /** Required evidence categories for this section */
  categories: string[];
  /** Section label shown in the dialog header */
  sectionLabel: string;
  /** Called with (file, selectedCategory) when user confirms upload */
  onUpload: (file: File, category: string) => Promise<void>;
}

const ACCEPTED_TYPES = '.pdf,.jpg,.jpeg,.png,.docx,.zip';
const MAX_SIZE_MB = 25;

export function EvidenceUploadDialog({
  open,
  onClose,
  categories,
  sectionLabel,
  onUpload,
}: EvidenceUploadDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setSelectedCategory(null);
    setSelectedFile(null);
    setUploading(false);
    setDragOver(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`File exceeds ${MAX_SIZE_MB}MB limit.`);
      return;
    }
    setSelectedFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files?.[0] ?? null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (!selectedCategory) return;
    handleFileChange(e.dataTransfer.files?.[0] ?? null);
  };

  const handleUpload = async () => {
    if (!selectedCategory || !selectedFile) return;
    setUploading(true);
    try {
      await onUpload(selectedFile, selectedCategory);
      handleClose();
    } finally {
      setUploading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const step = !selectedCategory ? 1 : !selectedFile ? 2 : 3;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">Upload Evidence Document</DialogTitle>
          <p className="text-xs text-muted-foreground">Supporting documents for {sectionLabel}</p>
        </DialogHeader>

        {/* ── Step Indicator ── */}
        <div className="flex items-center gap-2 text-[10px] font-medium">
          {['Select Category', 'Choose File', 'Confirm'].map((label, i) => (
            <React.Fragment key={label}>
              <div className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-full border transition-colors',
                step > i + 1
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                  : step === i + 1
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'border-border/50 text-muted-foreground'
              )}>
                {step > i + 1 ? <CheckCircle2 className="h-2.5 w-2.5" /> : <span>{i + 1}</span>}
                {label}
              </div>
              {i < 2 && <div className="flex-1 h-px bg-border/50" />}
            </React.Fragment>
          ))}
        </div>

        {/* ── Step 1: Category Selection ── */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Step 1 — Select the document category you want to upload
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium border transition-all',
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'border-border/60 hover:border-primary/50 hover:bg-primary/5 text-foreground'
                )}
              >
                {cat}
                {selectedCategory === cat && <CheckCircle2 className="inline h-3 w-3 ml-1.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* ── Step 2: File Picker (shown only after category selected) ── */}
        {selectedCategory && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Step 2 — Choose the file for&nbsp;
              <span className="text-foreground font-semibold">"{selectedCategory}"</span>
            </p>

            {!selectedFile ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                  dragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-border/50 hover:border-primary/40 hover:bg-muted/30'
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES}
                  onChange={handleInputChange}
                  className="hidden"
                />
                <FolderOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs font-medium">Drag & drop or click to browse</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  PDF, JPG, PNG, DOCX, ZIP — Max {MAX_SIZE_MB}MB
                </p>
              </div>
            ) : (
              /* ── Selected File Preview ── */
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                <FileText className="h-8 w-8 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{selectedFile.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatBytes(selectedFile.size)} · {selectedCategory}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleUpload}
            disabled={!selectedCategory || !selectedFile || uploading}
            className="gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" />
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

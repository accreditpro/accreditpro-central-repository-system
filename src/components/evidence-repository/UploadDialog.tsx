import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, X, CloudUpload } from 'lucide-react';
import { EvidenceDocument } from './types';

interface UploadDialogProps {
  document: EvidenceDocument | null;
  open: boolean;
  onClose: () => void;
}

const ACCEPTED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/png', 'image/jpeg'];
const ACCEPTED_EXTENSIONS = '.pdf,.docx,.xlsx,.png,.jpg,.jpeg';

export function UploadDialog({ document, open, onClose }: UploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [comments, setComments] = useState('');
  const [versionNotes, setVersionNotes] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const isReplace = document && document.status !== 'not_uploaded';

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && ACCEPTED_TYPES.includes(droppedFile.type)) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    // In a real app, this would upload to the server
    onClose();
    setFile(null);
    setComments('');
    setVersionNotes('');
  };

  const handleClose = () => {
    onClose();
    setFile(null);
    setComments('');
    setVersionNotes('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {isReplace ? 'Replace Document' : 'Upload Document'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Document Info */}
          {document && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <FileText className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">{document.name}</p>
                <div className="flex gap-1 mt-0.5">
                  {document.frameworks.map(fw => (
                    <Badge key={fw} variant="secondary" className="text-[9px] px-1 py-0">
                      {fw}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : file
                  ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-900/10'
                  : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-8 w-8 text-emerald-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <CloudUpload className="h-10 w-10 mx-auto text-muted-foreground/50" />
                <div>
                  <p className="text-sm font-medium">
                    Drag & drop your file here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or click to browse
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Supported: PDF, DOCX, XLSX, PNG, JPG (Max 25MB)
                </p>
                <Input
                  type="file"
                  accept={ACCEPTED_EXTENSIONS}
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Version Notes */}
          <div className="space-y-2">
            <Label htmlFor="version-notes" className="text-sm">
              Version Notes {isReplace && <span className="text-muted-foreground">(What changed?)</span>}
            </Label>
            <Input
              id="version-notes"
              placeholder={isReplace ? 'e.g., Updated approval letter for 2025-26' : 'e.g., Initial upload'}
              value={versionNotes}
              onChange={e => setVersionNotes(e.target.value)}
            />
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments" className="text-sm">
              Comments <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="comments"
              placeholder="Add any additional notes..."
              value={comments}
              onChange={e => setComments(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!file}>
            <Upload className="h-4 w-4 mr-2" />
            {isReplace ? 'Replace & Create New Version' : 'Upload Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
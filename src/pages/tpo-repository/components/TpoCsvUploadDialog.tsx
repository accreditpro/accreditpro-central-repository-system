import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Upload,
  FileSpreadsheet,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { tpoRepositoryService, TpoCsvImportResult } from '@/services/tpo.service';

interface TpoCsvUploadDialogProps {
  open: boolean;
  onClose: () => void;
  sectionId: string;
  sectionLabel: string;
  departmentId: number;
  academicYear: string;
  onImported?: () => void;
}

export function TpoCsvUploadDialog({
  open,
  onClose,
  sectionId,
  sectionLabel,
  departmentId,
  academicYear,
  onImported,
}: TpoCsvUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TpoCsvImportResult | null>(null);

  const reset = () => {
    setSelectedFile(null);
    setError(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setError(null);
    setResult(null);
  };

  const handleDownloadTemplate = () => {
    tpoRepositoryService
      .downloadSectionTemplate(sectionId)
      .catch(() => setError('Failed to download template. Please try again.'));
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please choose a CSV file first.');
      return;
    }
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const res = await tpoRepositoryService.uploadSectionCsv(
        sectionId,
        selectedFile,
        departmentId,
        academicYear
      );
      setResult(res);
      onImported?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed. Please check the file and try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            CSV Import — {sectionLabel}
          </DialogTitle>
          <DialogDescription>
            Upload a CSV to bulk-import {sectionLabel.toLowerCase()} records. Valid rows are
            imported immediately; invalid rows are reported below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Academic Year <span className="font-medium text-foreground">{academicYear}</span>
            </p>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleDownloadTemplate}>
              <Download className="h-3.5 w-3.5" />
              Download Template
            </Button>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'w-full rounded-lg border-2 border-dashed p-5 cursor-pointer transition-colors',
              selectedFile
                ? 'border-emerald-500/40 bg-emerald-500/5'
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex flex-col items-center gap-1.5">
                <FileSpreadsheet className="h-6 w-6 text-emerald-500" />
                <p className="text-xs font-medium">{selectedFile.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <FileSpreadsheet className="h-6 w-6 text-muted-foreground" />
                <p className="text-xs font-medium">Click to choose a CSV file</p>
                <p className="text-[10px] text-muted-foreground">.csv format, first row must be headers</p>
              </div>
            )}
          </button>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
              <XCircle className="h-4 w-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-emerald-700">
                    {result.successfulRecords} record{result.successfulRecords !== 1 ? 's' : ''} imported
                  </p>
                </div>
                <Badge variant={result.failedRecords > 0 ? 'destructive' : 'secondary'} className="text-[10px]">
                  {result.failedRecords} failed
                </Badge>
              </div>

              {result.errors.length > 0 && (
                <div className="rounded-lg border border-border/50 max-h-48 overflow-y-auto">
                  <p className="text-[10px] font-medium text-muted-foreground px-3 py-2 border-b">
                    Validation errors
                  </p>
                  <div className="divide-y divide-border/50">
                    {result.errors.map((err, idx) => (
                      <div key={idx} className="flex items-start gap-2 px-3 py-1.5">
                        <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-medium">Row {err.row}</p>
                          <p className="text-[10px] text-muted-foreground break-words">{err.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={reset} disabled={uploading}>
              Reset
            </Button>
            <Button size="sm" onClick={handleUpload} disabled={uploading || !selectedFile}>
              {uploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Importing...
                </>
              ) : (
                'Upload & Import'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { FinanceTabConfig } from '../finance-configs';
import { financeRepositoryService, CsvValidationResponse } from '@/services/finance-repository.service';
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Send,
  Download,
  XCircle,
  Loader2,
} from 'lucide-react';

interface FinanceCsvUploadDialogProps {
  open: boolean;
  onClose: () => void;
  tabConfig: FinanceTabConfig;
  onUploadComplete?: () => void;
}

type Step = 'upload' | 'validate' | 'preview' | 'confirm';

export const FinanceCsvUploadDialog = ({ open, onClose, tabConfig, onUploadComplete }: FinanceCsvUploadDialogProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<CsvValidationResponse | null>(null);
  const [validating, setValidating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ importedCount: number; skippedCount: number } | null>(null);

  const reset = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setValidation(null);
    setServerError(null);
    setConfirming(false);
    setConfirmed(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setServerError(null);
    setCurrentStep('validate');
    validate(file);
  };

  const validate = async (file: File) => {
    setValidating(true);
    setServerError(null);
    try {
      const res = await financeRepositoryService.validateCsvUpload(tabConfig.id, file);
      setValidation(res);
      setCurrentStep('preview');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'CSV validation failed');
      setCurrentStep('upload');
    } finally {
      setValidating(false);
    }
  };

  const handleConfirm = async () => {
    if (!validation) return;
    setConfirming(true);
    setServerError(null);
    try {
      const res = await financeRepositoryService.confirmCsvUpload(tabConfig.id, validation.uploadId);
      setConfirmed({ importedCount: res.importedCount, skippedCount: res.skippedCount });
      setCurrentStep('confirm');
      onUploadComplete?.();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to confirm CSV import');
    } finally {
      setConfirming(false);
    }
  };

  const steps: { id: Step; label: string }[] = [
    { id: 'upload', label: 'Upload' },
    { id: 'validate', label: 'Validate' },
    { id: 'preview', label: 'Preview' },
    { id: 'confirm', label: 'Submit' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const errorCount = validation?.errors.filter(e => e.severity === 'error').length ?? 0;
  const warningCount = validation?.errors.filter(e => e.severity === 'warning').length ?? 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            CSV Upload — {tabConfig.label}
          </DialogTitle>
          <DialogDescription>
            Upload a CSV matching the {tabConfig.label} template. Valid rows are imported only after confirmation.
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-1 shrink-0 px-1">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-1 flex-1">
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    'h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors',
                    i <= currentStepIndex
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {i < currentStepIndex || (currentStep === 'confirm' && step.id === 'confirm') ? '✓' : i + 1}
                </div>
                <span className={cn('text-[10px] font-medium', i <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground')}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && <div className={cn('h-px flex-1', i < currentStepIndex ? 'bg-primary' : 'bg-border')} />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {serverError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
              <span className="text-xs text-red-600">{serverError}</span>
            </div>
          )}

          {currentStep === 'upload' && (
            <div className="space-y-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => financeRepositoryService.downloadSectionTemplate(tabConfig.id).catch(() => undefined)}
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
                <span className="text-[10px] text-muted-foreground">
                  Use the template to get the exact column names
                </span>
              </div>

              <label
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer text-center transition-all',
                  'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
                <Upload className="h-6 w-6 text-muted-foreground" />
                <p className="text-xs font-medium">Click to choose a CSV file</p>
                <p className="text-[10px] text-muted-foreground">Headers must match the template's column names</p>
              </label>
            </div>
          )}

          {currentStep === 'validate' && (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Validating {selectedFile?.name}...</span>
            </div>
          )}

          {currentStep === 'preview' && validation && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{validation.totalRows} total rows</Badge>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> {validation.validRows} valid
                </Badge>
                {errorCount > 0 && (
                  <Badge variant="outline" className="bg-red-500/10 text-red-700">
                    <XCircle className="h-3 w-3 mr-1" /> {errorCount} errors
                  </Badge>
                )}
                {warningCount > 0 && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-700">
                    <AlertTriangle className="h-3 w-3 mr-1" /> {warningCount} warnings
                  </Badge>
                )}
              </div>

              {(validation.errors || []).length > 0 && (
                <div className="rounded-lg border border-border/60 overflow-hidden">
                  <p className="px-3 py-2 bg-muted/50 text-[10px] font-semibold text-muted-foreground">
                    Row-level issues
                  </p>
                  <div className="max-h-40 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-[10px]">Row</TableHead>
                          <TableHead className="text-[10px]">Column</TableHead>
                          <TableHead className="text-[10px]">Value</TableHead>
                          <TableHead className="text-[10px]">Message</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(validation.errors || []).slice(0, 30).map((err, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-[11px]">{err.row}</TableCell>
                            <TableCell className="text-[11px]">{err.column}</TableCell>
                            <TableCell className="text-[11px] max-w-[120px] truncate">{err.value}</TableCell>
                            <TableCell className={cn('text-[11px] max-w-[240px]', err.severity === 'error' ? 'text-red-600' : 'text-amber-600')}>
                              {err.message}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {(validation.previewRows || []).length > 0 && (
                <div className="rounded-lg border border-border/60 overflow-hidden">
                  <p className="px-3 py-2 bg-muted/50 text-[10px] font-semibold text-muted-foreground">
                    First valid rows (preview)
                  </p>
                  <div className="max-h-52 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {tabConfig.fields.slice(0, 6).map(f => (
                            <TableHead key={f.key} className="text-[10px] whitespace-nowrap">{f.label}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(validation.previewRows || []).filter(p => p.validationStatus === 'valid').slice(0, 8).map((row, i) => (
                          <TableRow key={i}>
                            {tabConfig.fields.slice(0, 6).map(f => (
                              <TableCell key={f.key} className="text-[11px] whitespace-nowrap max-w-[160px] truncate">
                                {String(row.data[f.key] ?? '-')}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 'confirm' && confirmed && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="rounded-full bg-emerald-500/10 p-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="text-base font-semibold">CSV imported successfully</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{confirmed.importedCount} rows imported</Badge>
                {confirmed.skippedCount > 0 && (
                  <Badge variant="outline">{confirmed.skippedCount} skipped</Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t shrink-0">
          {currentStep === 'preview' && (
            <>
              <Button variant="outline" size="sm" onClick={() => setCurrentStep('upload')}>
                Choose another file
              </Button>
              <Button size="sm" className="gap-2" onClick={handleConfirm} disabled={confirming || (validation?.validRows ?? 0) === 0}>
                {confirming ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Importing...</>
                ) : (
                  <><Send className="h-3.5 w-3.5" /> Confirm Import</>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                Cancel
              </Button>
            </>
          )}
          {(currentStep === 'confirm' || currentStep === 'upload' || currentStep === 'validate') && (
            <Button size="sm" onClick={handleClose}>
              {currentStep === 'confirm' ? 'Done' : 'Cancel'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

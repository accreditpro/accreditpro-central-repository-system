import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ModuleConfig } from '../types';
import { CsvModuleConfig } from './csv-module-config';
import { examinationRepositoryService } from '@/services/examination-repository.service';
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  ArrowLeft,
  Eye,
  Send,
  RefreshCw,
  Download,
  Loader2,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================
// Types
// ============================================================

type UploadPhase = 'upload' | 'preview' | 'result';

interface ValidationError {
  row: number;
  column: string;
  value: string;
  message: string;
  severity: 'error' | 'warning';
}

interface ParsedRow {
  /** 1-based line number in the CSV file (header is line 1). */
  rowNumber: number;
  values: Record<string, string>;
  errors: ValidationError[];
}

interface CsvUploadDialogProps {
  open: boolean;
  onClose: () => void;
  /** Module config (used for the dialog title / label). */
  config: ModuleConfig;
  /** Column + validation descriptor for this module. */
  csvConfig: CsvModuleConfig;
  academicYear: string;
  /** Configured institution programs — used for non-blocking reference warnings. */
  programOptions?: string[];
  /** Configured institution departments — used for non-blocking reference warnings. */
  departmentOptions?: string[];
  onUploaded?: () => void;
}

// ============================================================
// CSV parsing helpers
// ============================================================

/** Parse a single CSV line, honouring double-quoted fields. */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function normalizeHeader(header: string): string {
  return header.replace(/^\uFEFF/, '').trim().replace(/\s+/g, ' ');
}

/** Extract the backend ApiResponse message from an Axios-style error. */
function extractErrorMessage(err: unknown): string {
  const response = (err as { response?: { data?: { message?: string } } })?.response;
  if (response?.data?.message) return response.data.message;
  return err instanceof Error ? err.message : 'Failed to upload CSV';
}

// ============================================================
// Component
// ============================================================

export function CsvUploadDialog({
  open,
  onClose,
  config,
  csvConfig,
  academicYear,
  programOptions = [],
  departmentOptions = [],
  onUploaded,
}: CsvUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<UploadPhase>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileLevelErrors, setFileLevelErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    totalRows: number;
    importedCount: number;
    failedCount: number;
    duplicatesCount?: number;
    errors: string[];
    duplicateMessages?: string[];
  } | null>(null);

  const columns = useMemo(() => csvConfig.fields.map((f) => f.header), [csvConfig]);
  const requiredColumns = useMemo(
    () => csvConfig.fields.filter((f) => f.required).map((f) => f.header),
    [csvConfig]
  );

  const handleClose = useCallback(() => {
    onClose();
    // Reset state for the next open
    setPhase('upload');
    setSelectedFile(null);
    setRows([]);
    setFileLevelErrors([]);
    setIsSubmitting(false);
    setUploadResult(null);
  }, [onClose]);

  const handleFile = useCallback(
    (file: File) => {
      if (!file) return;
      setSelectedFile(file);
      setUploadResult(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = String(e.target?.result ?? '');
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setFileLevelErrors(['CSV file must contain a header row and at least one data row']);
          setRows([]);
          setPhase('preview');
          return;
        }

        const rawHeaders = parseCsvLine(lines[0]);
        const normalizedToOriginal = new Map<string, string>();
        rawHeaders.forEach((h) => {
          const normalized = normalizeHeader(h);
          if (normalized && !normalizedToOriginal.has(normalized.toLowerCase())) {
            normalizedToOriginal.set(normalized.toLowerCase(), normalized);
          }
        });
        // File-level: missing required columns
        const missing = requiredColumns.filter(
          (col) => !normalizedToOriginal.has(col.toLowerCase())
        );
        if (missing.length > 0) {
          setFileLevelErrors([
            `CSV is missing required column(s): ${missing.join(', ')}`,
          ]);
          setRows([]);
          setPhase('preview');
          return;
        }
        setFileLevelErrors([]);

        const parsedRows: ParsedRow[] = lines.slice(1).map((line, idx) => {
          const tokens = parseCsvLine(line);
          const values: Record<string, string> = {};
          columns.forEach((col) => {
            const normalized = col.toLowerCase();
            const original = normalizedToOriginal.get(normalized);
            if (!original) return;
            const tokenIdx = rawHeaders.findIndex(
              (h) => normalizeHeader(h).toLowerCase() === normalized
            );
            values[col] = (tokenIdx >= 0 ? tokens[tokenIdx] : '')
              .replace(/^"(.*)"$/, '$1')
              .replace(/""/g, '"')
              .trim();
          });
          return {
            rowNumber: idx + 2,
            values,
            errors: [],
          };
        });

        // Per-row validation (mirrors the backend upload rules)
        const seenKeys = new Map<string, number>();
        const ctx = { academicYear, programOptions, departmentOptions };

        for (const row of parsedRows) {
          const errors: ValidationError[] = [];
          const push = (column: string, message: string, severity: 'error' | 'warning' = 'error') => {
            errors.push({ row: row.rowNumber, column, value: row.values[column] ?? '', message, severity });
          };

          csvConfig.validateRow(row.values, row.rowNumber, ctx, push);

          // In-file duplicate detection
          if (csvConfig.duplicateKey) {
            const key = csvConfig.duplicateKey(row.values);
            if (key) {
              const prevRow = seenKeys.get(key);
              if (prevRow) {
                push(
                  csvConfig.duplicateColumn ?? 'Program',
                  csvConfig.duplicateMessage
                    ? csvConfig.duplicateMessage(prevRow)
                    : `Duplicate within file: same record appears at row ${prevRow}`,
                  csvConfig.duplicateSeverity ?? 'warning'
                );
              } else {
                seenKeys.set(key, row.rowNumber);
              }
            }
          }

          row.errors = errors;
        }

        setRows(parsedRows);
        setPhase('preview');
      };
      reader.readAsText(file);
    },
    [academicYear, programOptions, departmentOptions, columns, requiredColumns, csvConfig]
  );

  const stats = useMemo(() => {
    const errors = rows.flatMap((r) => r.errors.filter((e) => e.severity === 'error'));
    const warnings = rows.flatMap((r) => r.errors.filter((e) => e.severity === 'warning'));
    const invalidRows = new Set(errors.map((e) => e.row)).size;
    return {
      totalRows: rows.length,
      validRows: rows.length - invalidRows,
      invalidRows,
      errorCount: errors.length,
      warningCount: warnings.length,
      errors,
      warnings,
    };
  }, [rows]);

  const canSubmit = phase === 'preview' && stats.validRows > 0 && stats.errorCount === 0;

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setIsSubmitting(true);
    try {
      const result = await examinationRepositoryService.uploadModuleCsv(
        csvConfig.moduleId,
        selectedFile,
        academicYear
      );
      setUploadResult(result);
      setPhase('result');
      if (result.failedCount > 0) {
        toast.error(`${result.importedCount} record(s) imported, ${result.failedCount} failed`);
      } else {
        toast.success(`${result.importedCount} record(s) imported successfully`);
      }
      onUploaded?.();
    } catch (err) {
      const message = extractErrorMessage(err);
      toast.error(message);
      setUploadResult({
        totalRows: 1,
        importedCount: 0,
        failedCount: 1,
        errors: [message],
      });
      setPhase('result');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForAnother = () => {
    setPhase('upload');
    setSelectedFile(null);
    setRows([]);
    setFileLevelErrors([]);
    setUploadResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden !flex !flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-base">
            Upload CSV — {config.label}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Preview and validate your file before submitting. All records are stored in the database.
          </DialogDescription>
        </DialogHeader>

        {/* Phase indicator */}
        <div className="flex items-center gap-2 px-1 pb-3 shrink-0">
          {(
            [
              { id: 'upload', label: 'Upload', icon: Upload },
              { id: 'preview', label: 'Validate & Preview', icon: Eye },
              { id: 'result', label: 'Result', icon: Send },
            ] as const
          ).map((step, index) => {
            const StepIcon = step.icon;
            const order = phase === 'result' ? 2 : phase === 'preview' ? 1 : 0;
            const isActive = order === index;
            const isCompleted = index < order;
            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-medium transition-all',
                      isCompleted && 'bg-primary border-primary text-primary-foreground',
                      isActive && 'border-primary text-primary bg-primary/10',
                      !isActive && !isCompleted && 'border-muted-foreground/30 text-muted-foreground/50'
                    )}
                  >
                    {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <StepIcon className="h-3 w-3" />}
                  </div>
                  <span className={cn('text-[10px] font-medium', isActive ? 'text-primary' : 'text-muted-foreground')}>
                    {step.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={cn('flex-1 h-0.5 mx-2 rounded-full', index < order ? 'bg-primary' : 'bg-muted-foreground/20')} />
                )}
              </div>
            );
          })}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-0.5 py-2">
          {phase === 'upload' && (
            <div className="space-y-4">
              <div
                className={cn(
                  'block p-10 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all',
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/40'
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFile(file);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                    e.target.value = '';
                  }}
                />
                {selectedFile ? (
                  <>
                    <FileSpreadsheet className="h-12 w-12 mx-auto text-emerald-500 mb-3" />
                    <p className="text-sm font-medium text-emerald-600">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click to choose a different file
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm font-medium">Drop your CSV file here or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">CSV format • Max 10MB</p>
                  </>
                )}
              </div>

              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                      Validation Rules
                    </p>
                    <ul className="text-[10px] text-muted-foreground mt-1 space-y-0.5 list-disc pl-4">
                      {csvConfig.validationNotes.map((rule, i) => (
                        <li key={i}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-muted/40 border">
                <p className="text-[10px] text-muted-foreground">
                  Download the official template to fill in your data:
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 h-7 gap-1.5 text-[11px]"
                  onClick={() =>
                    examinationRepositoryService.downloadModuleTemplate(csvConfig.moduleId)
                  }
                >
                  <Download className="h-3 w-3" />
                  Download Template
                </Button>
              </div>
            </div>
          )}

          {phase === 'preview' && (
            <div className="space-y-4">
              {/* File-level errors */}
              {fileLevelErrors.length > 0 && (
                <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                  {fileLevelErrors.map((err, i) => (
                    <p key={i} className="text-xs text-red-600 flex items-center gap-1.5">
                      <XCircle className="h-3.5 w-3.5 shrink-0" />
                      {err}
                    </p>
                  ))}
                </div>
              )}

              {rows.length > 0 && (
                <>
                  {/* Summary cards */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="p-2.5 rounded-lg bg-muted/50 text-center">
                      <p className="text-lg font-bold">{stats.totalRows}</p>
                      <p className="text-[9px] text-muted-foreground">Total Rows</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center">
                      <p className="text-lg font-bold text-emerald-600">{stats.validRows}</p>
                      <p className="text-[9px] text-muted-foreground">Valid</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/20 text-center">
                      <p className="text-lg font-bold text-red-600">{stats.invalidRows}</p>
                      <p className="text-[9px] text-muted-foreground">Invalid</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-center">
                      <p className="text-lg font-bold text-amber-600">{stats.warningCount}</p>
                      <p className="text-[9px] text-muted-foreground">Warnings</p>
                    </div>
                  </div>

                  {/* Error list */}
                  {stats.errorCount > 0 && (
                    <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 max-h-[140px] overflow-y-auto space-y-1">
                      <p className="text-xs font-medium text-red-600 flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" />
                        {stats.errorCount} error{stats.errorCount > 1 ? 's' : ''} found — fix the CSV and re-upload before submitting
                      </p>
                      {stats.errors.slice(0, 12).map((err, i) => (
                        <p key={i} className="text-[11px] text-muted-foreground">
                          <span className="text-red-500 font-mono">Row {err.row}:</span> {err.message}
                          {err.value ? <span className="text-red-400"> ({err.value})</span> : null}
                        </p>
                      ))}
                      {stats.errorCount > 12 && (
                        <p className="text-[10px] text-red-400 italic">
                          ...and {stats.errorCount - 12} more error{stats.errorCount - 12 > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Warning list */}
                  {stats.warningCount > 0 && (
                    <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 max-h-[100px] overflow-y-auto space-y-1">
                      <p className="text-xs font-medium text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {stats.warningCount} warning{stats.warningCount > 1 ? 's' : ''}
                      </p>
                      {stats.warnings.slice(0, 8).map((err, i) => (
                        <p key={i} className="text-[11px] text-muted-foreground">
                          <span className="text-amber-500 font-mono">Row {err.row}:</span> {err.message}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Data preview table */}
                  <div className="rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto max-h-[280px] overflow-y-auto">
                      <table className="w-full border-collapse text-[10px]">
                        <thead className="sticky top-0 bg-muted/95 z-10">
                          <tr className="border-b">
                            <th className="text-left font-semibold p-2 w-10 text-center">#</th>
                            {columns.map((col) => (
                              <th key={col} className="text-left font-semibold p-2 min-w-[90px] whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row) => {
                            const hasErrors = row.errors.some((e) => e.severity === 'error');
                            const hasWarnings = !hasErrors && row.errors.length > 0;
                            return (
                              <tr
                                key={row.rowNumber}
                                className={cn(
                                  'border-b hover:bg-muted/50',
                                  hasErrors && 'bg-red-500/5',
                                  hasWarnings && 'bg-amber-500/5'
                                )}
                              >
                                <td className="p-2 text-center text-muted-foreground font-mono">
                                  {row.rowNumber}
                                </td>
                                {columns.map((col) => {
                                  const cellError = row.errors.find((e) => e.column === col);
                                  return (
                                    <td
                                      key={col}
                                      className={cn(
                                        'p-2 max-w-[160px] truncate',
                                        cellError?.severity === 'error' && 'text-red-600 font-medium'
                                      )}
                                      title={cellError ? cellError.message : undefined}
                                    >
                                      {row.values[col] || <span className="text-muted-foreground">-</span>}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {stats.validRows > 0 && stats.errorCount === 0 ? (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="text-xs text-emerald-700 dark:text-emerald-300">
                        All {stats.validRows} record{stats.validRows > 1 ? 's' : ''} passed validation — you can submit now.
                      </span>
                    </div>
                  ) : stats.validRows === 0 && stats.totalRows > 0 ? (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/5 border border-red-500/20">
                      <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                      <span className="text-xs text-red-700 dark:text-red-300">
                        No valid records. Please fix the errors in your CSV and re-upload.
                      </span>
                    </div>
                  ) : stats.validRows > 0 ? (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="text-xs text-amber-700 dark:text-amber-300">
                        {stats.invalidRows} row{stats.invalidRows > 1 ? 's' : ''} have errors. Fix them to enable submission.
                      </span>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          )}

          {phase === 'result' && uploadResult && (
            <div className="space-y-4 text-center py-4">
              {uploadResult.failedCount === 0 ? (
                <CheckCircle2 className="h-14 w-14 mx-auto text-emerald-500" />
              ) : (
                <AlertTriangle className="h-14 w-14 mx-auto text-amber-500" />
              )}
              <div>
                <h4 className="text-base font-semibold">
                  {uploadResult.failedCount === 0 ? 'Upload Successful!' : 'Upload Completed with Errors'}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {uploadResult.importedCount} of {uploadResult.totalRows || uploadResult.importedCount + uploadResult.failedCount} record(s) stored in the database
                  {(uploadResult.duplicatesCount ?? 0) > 0 && (
                    <span className="text-amber-600">
                      {' '}· {uploadResult.duplicatesCount} duplicate record(s) found and ignored
                    </span>
                  )}
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                <div className="p-2.5 rounded-lg bg-muted/50">
                  <p className="text-base font-bold">{uploadResult.totalRows}</p>
                  <p className="text-[9px] text-muted-foreground">Total Rows</p>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-base font-bold text-emerald-600">{uploadResult.importedCount}</p>
                  <p className="text-[9px] text-muted-foreground">Imported</p>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <p className="text-base font-bold text-amber-600">{uploadResult.duplicatesCount ?? 0}</p>
                  <p className="text-[9px] text-muted-foreground">Duplicates</p>
                </div>
                <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/20">
                  <p className="text-base font-bold text-red-600">{uploadResult.failedCount}</p>
                  <p className="text-[9px] text-muted-foreground">Failed</p>
                </div>
              </div>
              {(uploadResult.duplicateMessages ?? []).length > 0 && (
                <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 max-h-[150px] overflow-y-auto space-y-1 text-left">
                  <p className="text-xs font-medium text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Duplicate records found and ignored
                  </p>
                  {(uploadResult.duplicateMessages ?? []).slice(0, 10).map((msg, i) => (
                    <p key={i} className="text-[11px] text-muted-foreground">{msg}</p>
                  ))}
                  {(uploadResult.duplicateMessages?.length ?? 0) > 10 && (
                    <p className="text-[10px] text-amber-500 italic">
                      ...and {(uploadResult.duplicateMessages?.length ?? 0) - 10} more
                    </p>
                  )}
                </div>
              )}
              {uploadResult.errors.length > 0 && (
                <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 max-h-[180px] overflow-y-auto space-y-1 text-left">
                  {uploadResult.errors.slice(0, 15).map((err, i) => (
                    <p key={i} className="text-[11px] text-red-600">{err}</p>
                  ))}
                  {uploadResult.errors.length > 15 && (
                    <p className="text-[10px] text-red-400 italic">
                      ...and {uploadResult.errors.length - 15} more
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t shrink-0">
          {phase === 'upload' ? (
            <>
              <Button variant="ghost" size="sm" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!selectedFile}
                onClick={() => selectedFile && handleFile(selectedFile)}
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                Validate & Preview
              </Button>
            </>
          ) : phase === 'preview' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPhase('upload')}
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Re-upload
              </Button>
              {rows.length > 0 && fileLevelErrors.length === 0 && (
                <Button size="sm" disabled={!canSubmit || isSubmitting} onClick={handleSubmit}>
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5 mr-1" />
                  )}
                  {isSubmitting
                    ? 'Submitting...'
                    : `Submit ${stats.validRows} Record${stats.validRows === 1 ? '' : 's'}`}
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleClose}>
                Close
              </Button>
              <Button size="sm" onClick={resetForAnother}>
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Upload Another
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

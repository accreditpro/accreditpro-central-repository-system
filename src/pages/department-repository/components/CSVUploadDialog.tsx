import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { RepositoryTabConfig } from '../types';
import { masterData } from '../repository-configs';
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  Columns,
  Eye,
  Send,
  Paperclip,
  XCircle,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CSVUploadDialogProps {
  open: boolean;
  onClose: () => void;
  tabConfig: RepositoryTabConfig;
  existingData: Record<string, string>[];
  onUploadComplete?: (data: Record<string, string>[], file?: File | null) => Promise<void> | void;
  onUploadFile?: (file: File, validData?: Record<string, string>[]) => Promise<any>;
}

type UploadStep = 'upload' | 'mapping' | 'validate' | 'preview' | 'evidence' | 'submit';

interface ColumnMappingItem {
  csvColumn: string;
  mappedField: string;
  confidence: number;
  status: 'auto' | 'manual' | 'unmapped';
}

interface ValidationError {
  row: number;
  column: string;
  value: string;
  message: string;
  severity: 'error' | 'warning';
}

interface ValidationResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  warnings: number;
  errors: ValidationError[];
  validData: Record<string, string>[];
}

const steps: { id: UploadStep; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'mapping', label: 'Mapping', icon: Columns },
  { id: 'validate', label: 'Validate', icon: CheckCircle2 },
  { id: 'preview', label: 'Preview', icon: Eye },
  { id: 'evidence', label: 'Evidence', icon: Paperclip },
  { id: 'submit', label: 'Submit', icon: Send },
];

const UNMAPPED_VALUE = '__unmapped__';

// Fuzzy match helper for column mapping
function computeConfidence(csvCol: string, fieldCol: string): number {
  const a = csvCol.toLowerCase().trim().replace(/[_\s-]+/g, '');
  const b = fieldCol.toLowerCase().trim().replace(/[_\s-]+/g, '');
  if (a === b) return 100;
  if (a.includes(b) || b.includes(a)) return 90;
  const aWords = csvCol.toLowerCase().split(/[\s_-]+/);
  const bWords = fieldCol.toLowerCase().split(/[\s_-]+/);
  const overlap = aWords.filter(w => bWords.includes(w)).length;
  const maxWords = Math.max(aWords.length, bWords.length);
  if (overlap > 0) return Math.round((overlap / maxWords) * 80);
  return 0;
}

// Date normalizer to standard ISO YYYY-MM-DD
export function normalizeDateToISO(dateStr: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  // DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // YYYY/MM/DD or YYYY.MM.DD
  const ymdMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Fallback: try JavaScript Date parse
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return trimmed;
}

// Generate normalized CSV File from rows and expected headers
function generateCSVFileFromRows(
  rows: Record<string, string>[],
  headers: string[],
  fileName: string
): File {
  const escapeCSV = (val: any) => {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const headerLine = headers.map(escapeCSV).join(',');
  const dataLines = rows.map(row => headers.map(h => escapeCSV(row[h] ?? '')).join(','));
  const csvContent = [headerLine, ...dataLines].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  return new File([blob], fileName || 'upload.csv', { type: 'text/csv' });
}

// Parse a single CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
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

export const CSVUploadDialog = ({ open, onClose, tabConfig, existingData, onUploadComplete, onUploadFile }: CSVUploadDialogProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<UploadStep>('upload');
  const [parsedData, setParsedData] = useState<Record<string, string>[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [columnMappings, setColumnMappings] = useState<ColumnMappingItem[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) return;

      const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, ''));
      setCsvHeaders(headers);

      const rows: Record<string, string>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row: Record<string, string> = {};
        headers.forEach((header, idx) => {
          row[header] = (values[idx] || '').replace(/^"|"$/g, '');
        });
        rows.push(row);
      }
      setParsedData(rows);

      // Auto-generate column mappings
      const mappings: ColumnMappingItem[] = tabConfig.fields.map(field => {
        let bestMatch = '';
        let bestConfidence = 0;
        headers.forEach(h => {
          const conf = computeConfidence(h, field.csvColumn);
          if (conf > bestConfidence) {
            bestConfidence = conf;
            bestMatch = h;
          }
        });
        return {
          csvColumn: bestConfidence >= 50 ? bestMatch : '',
          mappedField: field.csvColumn,
          confidence: bestConfidence,
          status: bestConfidence >= 80 ? 'auto' as const : bestConfidence >= 50 ? 'manual' as const : 'unmapped' as const,
        };
      });
      setColumnMappings(mappings);
    };
    reader.readAsText(file);
  };

  // Get duplicate key based on tab type
  const getDuplicateKey = (tabId: string, row: Record<string, string>): string | null => {
    switch (tabId) {
      case 'curriculum':
        return row['Program'] ? `${row['Program']}|${row['Academic Regulation'] || ''}` : null;
      case 'courses':
        return row['Course Code'] || null;
      case 'academic-calendar':
        return row['Academic Year'] && row['Semester'] ? `${row['Academic Year']}|${row['Semester']}` : null;
      case 'value-added-courses':
        return row['Course Name'] && row['Academic Year'] ? `${row['Course Name']}|${row['Academic Year']}` : null;
      case 'moocs':
        return row['Platform Name'] && row['Course Name'] && row['Academic Year']
          ? `${row['Platform Name']}|${row['Course Name']}|${row['Academic Year']}` : null;
      case 'faculty-profiles':
        return row['Employee ID'] || null;
      case 'qualifications':
        return row['Employee ID'] && row['Degree'] ? `${row['Employee ID']}|${row['Degree']}` : null;
      case 'certifications':
      case 'student-profile':
        return row['Student Registration Number'] || row['Registration Number'] || row['registrationNumber'] || null;
      case 'admission-info': {
        const reg = row['Student Registration Number'] || row['Registration Number'] || row['registrationNumber'];
        const yr = row['Admission Year'] || row['admissionYear'];
        return reg && yr ? `${reg}|${yr}` : reg || null;
      }
      case 'student-diversity':
        return row['Student Registration Number'] || row['Registration Number'] || row['registrationNumber'] || null;
      case 'academic-performance': {
        const reg = row['Student Registration Number'] || row['Registration Number'] || row['registrationNumber'];
        const sem = row['Semester'] || row['semester'];
        return reg && sem ? `${reg}|${sem}` : reg || null;
      }
      case 'student-progression': {
        const reg = row['Student Registration Number'] || row['Registration Number'] || row['registrationNumber'];
        const yr = row['Academic Year'] || row['academicYear'];
        return reg && yr ? `${reg}|${yr}` : reg || null;
      }
      case 'scholarship-freeship': {
        const reg = row['Student Registration Number'] || row['Registration Number'] || row['registrationNumber'];
        const sch = row['Scholarship Name'] || row['scholarshipName'];
        return reg && sch ? `${reg}|${sch}` : reg || null;
      }
      case 'mooc-online-certifications': {
        const reg = row['Student Registration Number'] || row['Registration Number'] || row['registrationNumber'];
        const crs = row['Course Name'] || row['courseName'];
        return reg && crs ? `${reg}|${crs}` : reg || null;
      }
      case 'student-achievements': {
        const reg = row['Student Registration Number'] || row['Registration Number'] || row['registrationNumber'];
        const ach = row['Achievement Name'] || row['achievementName'];
        return reg && ach ? `${reg}|${ach}` : reg || null;
      }
      case 'publications':
        return row['Publication Title'] || row['title'] || null;
      case 'patents':
        return row['Application Number'] || row['applicationNumber'] || null;
      default: {
        const firstField = Object.keys(row)[0];
        return firstField ? row[firstField] : null;
      }
    }
  };

  const getDuplicateKeyColumn = (tabId: string): string => {
    switch (tabId) {
      case 'curriculum': return 'Program + Regulation';
      case 'courses': return 'Course Code';
      case 'academic-calendar': return 'Academic Year + Semester';
      case 'value-added-courses': return 'Course Name + Academic Year';
      case 'moocs': return 'Platform + Course + Year';
      case 'faculty-profiles': return 'Employee ID';
      case 'qualifications': return 'Employee ID + Degree';
      case 'certifications': return 'Employee ID + Certification';
      case 'student-profile': return 'Student Registration Number';
      case 'admission-info': return 'Registration Number + Admission Year';
      case 'student-diversity': return 'Student Registration Number';
      case 'academic-performance': return 'Registration Number + Semester';
      case 'student-progression': return 'Registration Number + Academic Year';
      case 'scholarship-freeship': return 'Registration Number + Scholarship Name';
      case 'mooc-online-certifications': return 'Registration Number + Course Name';
      case 'student-achievements': return 'Registration Number + Achievement';
      case 'publications': return 'Publication Title';
      case 'patents': return 'Application Number';
      default: return 'Primary Key';
    }
  };

  // Perform validation on mapped data
  const performValidation = (): ValidationResult => {
    const errors: ValidationError[] = [];
    const validData: Record<string, string>[] = [];
    const invalidRowIndices = new Set<number>();

    // Map CSV data to expected columns using column mappings
    const mappedData = parsedData.map(row => {
      const mappedRow: Record<string, string> = {};
      columnMappings.forEach(mapping => {
        if (mapping.csvColumn && mapping.status !== 'unmapped') {
          let val = row[mapping.csvColumn] || '';
          const fieldDef = tabConfig.fields.find(f => f.csvColumn === mapping.mappedField);
          if (fieldDef?.type === 'date' && val) {
            val = normalizeDateToISO(val);
          }
          if (fieldDef?.key === 'aadhaarNumber' && val && val.length > 10) {
            val = val.slice(0, 10);
          }
          mappedRow[mapping.mappedField] = val;
        } else {
          mappedRow[mapping.mappedField] = '';
        }
      });
      return mappedRow;
    });

    mappedData.forEach((row, rowIndex) => {
      let rowHasError = false;

      // Check required fields
      tabConfig.fields.forEach(field => {
        if (field.required) {
          const value = row[field.csvColumn]?.trim() || '';
          if (!value) {
            errors.push({
              row: rowIndex + 1,
              column: field.csvColumn,
              value: '(empty)',
              message: `Required field "${field.csvColumn}" is missing`,
              severity: 'error',
            });
            rowHasError = true;
          }
        }
      });

      // Validate master data fields
      tabConfig.fields.forEach(field => {
        if (field.masterDataSource) {
          const value = row[field.csvColumn]?.trim() || '';
          if (value) {
            const validValues = (masterData[field.masterDataSource as keyof typeof masterData] as string[]) || [];
            const isValid = validValues.some(v => v.trim().toLowerCase() === value.toLowerCase());
            if (!isValid) {
              errors.push({
                row: rowIndex + 1,
                column: field.csvColumn,
                value,
                message: `"${value}" not found in master data for ${field.csvColumn}`,
                severity: 'error',
              });
              rowHasError = true;
            }
          }
        }
      });

      // Validate numeric fields
      tabConfig.fields.forEach(field => {
        if (field.type === 'number') {
          const value = row[field.csvColumn]?.trim() || '';
          if (value && isNaN(Number(value))) {
            errors.push({
              row: rowIndex + 1,
              column: field.csvColumn,
              value,
              message: `Expected numeric value for "${field.csvColumn}"`,
              severity: 'error',
            });
            rowHasError = true;
          }
        }
      });

      // Check for duplicates against existing data
      const duplicateKey = getDuplicateKey(tabConfig.id, row);
      if (duplicateKey) {
        const existingDuplicate = existingData.find(existing => {
          const existingKey = getDuplicateKey(tabConfig.id, existing);
          return existingKey === duplicateKey;
        });
        if (existingDuplicate) {
          errors.push({
            row: rowIndex + 1,
            column: getDuplicateKeyColumn(tabConfig.id),
            value: duplicateKey,
            message: `Duplicate: "${duplicateKey}" already exists in the system`,
            severity: 'error',
          });
          rowHasError = true;
        }
      }

      // Check for duplicates within the uploaded file itself
      if (duplicateKey) {
        const withinFileDuplicate = mappedData.slice(0, rowIndex).find(prevRow => {
          const prevKey = getDuplicateKey(tabConfig.id, prevRow);
          return prevKey && prevKey === duplicateKey;
        });
        if (withinFileDuplicate) {
          errors.push({
            row: rowIndex + 1,
            column: getDuplicateKeyColumn(tabConfig.id),
            value: duplicateKey,
            message: `Duplicate within file: "${duplicateKey}" appears multiple times`,
            severity: 'warning',
          });
        }
      }

      // Validate date fields
      tabConfig.fields.forEach(field => {
        if (field.type === 'date') {
          const value = row[field.csvColumn]?.trim() || '';
          if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            errors.push({
              row: rowIndex + 1,
              column: field.csvColumn,
              value,
              message: `Invalid date format for "${field.csvColumn}". Expected YYYY-MM-DD`,
              severity: 'error',
            });
            rowHasError = true;
          }
        }
      });

      // Validate boolean fields
      tabConfig.fields.forEach(field => {
        if (field.type === 'boolean') {
          const value = row[field.csvColumn]?.trim() || '';
          if (value && !['Yes', 'No', 'yes', 'no', 'YES', 'NO', 'true', 'false', 'True', 'False'].includes(value)) {
            errors.push({
              row: rowIndex + 1,
              column: field.csvColumn,
              value,
              message: `Expected Yes/No for "${field.csvColumn}"`,
              severity: 'warning',
            });
          }
        }
      });

      if (rowHasError) {
        invalidRowIndices.add(rowIndex);
      } else {
        validData.push(row);
      }
    });

    const warningCount = errors.filter(e => e.severity === 'warning').length;

    return {
      totalRows: mappedData.length,
      validRows: mappedData.length - invalidRowIndices.size,
      invalidRows: invalidRowIndices.size,
      warnings: warningCount,
      errors,
      validData,
    };
  };

  const handleMappingChange = (fieldIndex: number, selectedValue: string) => {
    const csvColumn = selectedValue === UNMAPPED_VALUE ? '' : selectedValue;
    setColumnMappings(prev => {
      const updated = [...prev];
      updated[fieldIndex] = {
        ...updated[fieldIndex],
        csvColumn,
        confidence: csvColumn ? computeConfidence(csvColumn, updated[fieldIndex].mappedField) : 0,
        status: csvColumn ? 'manual' : 'unmapped',
      };
      return updated;
    });
  };

  const handleNext = async () => {
    if (currentStep === 'mapping') {
      const result = performValidation();
      setValidationResult(result);
    }

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    } else {
      // Submit - execute upload
      setIsSubmitting(true);
      try {
        const expectedHeaders = tabConfig.fields.map(f => f.csvColumn);
        const rowsToUpload = validationResult?.validData && validationResult.validData.length > 0
          ? validationResult.validData
          : parsedData;

        // Build a normalized CSV file where all dates are ISO YYYY-MM-DD and headers match expected tab fields
        const normalizedFile = generateCSVFileFromRows(
          rowsToUpload,
          expectedHeaders,
          uploadedFileName || `${tabConfig.id}_data.csv`
        );

        if (onUploadFile) {
          await onUploadFile(normalizedFile, rowsToUpload);
        } else if (onUploadComplete) {
          await onUploadComplete(rowsToUpload, normalizedFile);
        }
        handleClose();
      } catch (err: any) {
        toast({
          title: 'Upload Failed',
          description: err?.message || 'Failed to upload CSV file.',
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const handleClose = () => {
    onClose();
    setCurrentStep('upload');
    setParsedData([]);
    setCsvHeaders([]);
    setUploadedFile(null);
    setUploadedFileName('');
    setColumnMappings([]);
    setValidationResult(null);
    setIsSubmitting(false);
  };

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 'upload':
        return parsedData.length > 0;
      case 'mapping':
        return columnMappings.some(m => m.status !== 'unmapped');
      case 'validate':
        return validationResult !== null && validationResult.validRows > 0;
      case 'preview':
        return true;
      case 'evidence':
        return true;
      case 'submit':
        return true;
      default:
        return true;
    }
  }, [currentStep, parsedData, columnMappings, validationResult]);

  // ============ RENDER STEP CONTENT ============

  const renderUploadStep = () => (
    <div className="space-y-4">
      <label className="block p-8 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors bg-muted/20 text-center cursor-pointer">
        <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
        {uploadedFileName ? (
          <>
            <FileSpreadsheet className="h-12 w-12 mx-auto text-emerald-500 mb-3" />
            <p className="text-sm font-medium text-emerald-600">{uploadedFileName}</p>
            <p className="text-xs text-muted-foreground mt-1">{parsedData.length} records detected • {csvHeaders.length} columns</p>
            <p className="text-[10px] text-muted-foreground mt-1">Click to replace file</p>
          </>
        ) : (
          <>
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">Drop your CSV file here</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
            <p className="text-[10px] text-muted-foreground mt-2">Supports .csv files up to 10MB</p>
          </>
        )}
      </label>
      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Validation Rules</p>
            <ul className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
              {tabConfig.validationRules.map((rule, i) => (
                <li key={i}>• {rule}</li>
              ))}
              <li>• Date format: YYYY-MM-DD (e.g. 2004-08-15) — automatically converted from DD-MM-YYYY</li>
              <li>• All mandatory fields must be filled</li>
              <li>• No duplicate records allowed</li>
            </ul>
          </div>
        </div>
      </div>
      {parsedData.length > 0 && (
        <div className="p-3 rounded-lg bg-muted/30 border">
          <p className="text-xs font-medium mb-2">Detected Columns:</p>
          <div className="flex flex-wrap gap-1">
            {csvHeaders.map(h => (
              <Badge key={h} variant="outline" className="text-[9px]">{h}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderMappingStep = () => (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Map your CSV columns to the expected fields. Auto-detected mappings are shown below:</p>
      <div className="rounded-lg border overflow-hidden max-h-[280px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-[10px] font-medium w-[35%]">Expected Field</TableHead>
              <TableHead className="text-[10px] font-medium w-[35%]">CSV Column</TableHead>
              <TableHead className="text-[10px] font-medium w-[15%]">Match</TableHead>
              <TableHead className="text-[10px] font-medium w-[15%]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tabConfig.fields.map((field, idx) => {
              const mapping = columnMappings[idx];
              const selectValue = mapping?.csvColumn || UNMAPPED_VALUE;
              return (
                <TableRow key={field.key} className="hover:bg-muted/50">
                  <TableCell className="p-2">
                    <span className="text-xs font-medium">{field.csvColumn}</span>
                    {field.required && <span className="text-red-500 ml-0.5 text-[9px]">*</span>}
                  </TableCell>
                  <TableCell className="p-2">
                    <Select
                      value={selectValue}
                      onValueChange={(v) => handleMappingChange(idx, v)}
                    >
                      <SelectTrigger className="h-7 text-[10px]">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UNMAPPED_VALUE} className="text-[10px] text-muted-foreground">-- Unmapped --</SelectItem>
                        {csvHeaders.map(h => (
                          <SelectItem key={h} value={h} className="text-[10px]">{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-2">
                    {mapping && mapping.confidence > 0 && (
                      <div className="flex items-center gap-1">
                        <Progress value={mapping.confidence} className="h-1.5 w-10" />
                        <span className="text-[9px]">{mapping.confidence}%</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="p-2">
                    {mapping && (
                      <Badge variant="secondary" className={cn('text-[8px]',
                        mapping.status === 'auto' && 'bg-emerald-500/10 text-emerald-600',
                        mapping.status === 'manual' && 'bg-blue-500/10 text-blue-600',
                        mapping.status === 'unmapped' && 'bg-red-500/10 text-red-600',
                      )}>
                        {mapping.status}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {columnMappings.filter(m => m.status === 'unmapped').length > 0 && (
        <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <p className="text-[10px] text-amber-600">
            <AlertTriangle className="h-3 w-3 inline mr-1" />
            {columnMappings.filter(m => m.status === 'unmapped').length} field(s) unmapped. Unmapped required fields will cause validation errors.
          </p>
        </div>
      )}
    </div>
  );

  const renderValidateStep = () => {
    if (!validationResult) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <AlertTriangle className="h-10 w-10 mx-auto opacity-40 mb-2" />
          <p className="text-xs">Validation not yet performed. Go back and re-map columns.</p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-lg font-bold">{validationResult.totalRows}</p>
            <p className="text-[9px] text-muted-foreground">Total</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/5 text-center">
            <p className="text-lg font-bold text-emerald-600">{validationResult.validRows}</p>
            <p className="text-[9px] text-muted-foreground">Valid</p>
          </div>
          <div className="p-3 rounded-lg bg-red-500/5 text-center">
            <p className="text-lg font-bold text-red-600">{validationResult.invalidRows}</p>
            <p className="text-[9px] text-muted-foreground">Invalid</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/5 text-center">
            <p className="text-lg font-bold text-amber-600">{validationResult.warnings}</p>
            <p className="text-[9px] text-muted-foreground">Warnings</p>
          </div>
        </div>

        {validationResult.errors.filter(e => e.severity === 'error').length > 0 && (
          <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 max-h-[120px] overflow-y-auto">
            <p className="text-xs font-medium text-red-600 mb-2 flex items-center gap-1">
              <XCircle className="h-3.5 w-3.5" /> Errors ({validationResult.errors.filter(e => e.severity === 'error').length}):
            </p>
            <ul className="text-[10px] text-muted-foreground space-y-1">
              {validationResult.errors.filter(e => e.severity === 'error').slice(0, 15).map((err, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-red-500 font-mono shrink-0">Row {err.row}:</span>
                  <span>{err.message} {err.value !== '(empty)' && <span className="text-red-400">("{err.value}")</span>}</span>
                </li>
              ))}
              {validationResult.errors.filter(e => e.severity === 'error').length > 15 && (
                <li className="text-red-400 italic">...and {validationResult.errors.filter(e => e.severity === 'error').length - 15} more errors</li>
              )}
            </ul>
          </div>
        )}

        {validationResult.errors.filter(e => e.severity === 'warning').length > 0 && (
          <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 max-h-[100px] overflow-y-auto">
            <p className="text-xs font-medium text-amber-600 mb-2 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Warnings ({validationResult.warnings}):
            </p>
            <ul className="text-[10px] text-muted-foreground space-y-1">
              {validationResult.errors.filter(e => e.severity === 'warning').slice(0, 10).map((err, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-amber-500 font-mono shrink-0">Row {err.row}:</span>
                  <span>{err.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {validationResult.validRows > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-emerald-700 dark:text-emerald-300">
              {validationResult.validRows} record(s) passed validation and ready for submission
            </span>
          </div>
        )}

        {validationResult.validRows === 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/20">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-xs text-red-700 dark:text-red-300">
              No valid records. Please fix the errors in your CSV and re-upload.
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderPreviewStep = () => {
    if (!validationResult || validationResult.validData.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <FileSpreadsheet className="h-10 w-10 mx-auto opacity-40 mb-2" />
          <p className="text-xs">No valid data to preview</p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Preview of {validationResult.validData.length} validated records:
          </p>
          <Badge variant="secondary" className="text-[9px]">
            {validationResult.validData.length} records
          </Badge>
        </div>
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
            <table className="w-full border-collapse text-[10px]">
              <thead className="sticky top-0 bg-muted/95 z-10">
                <tr className="border-b">
                  <th className="text-left font-semibold p-2 w-8 text-center">#</th>
                  {tabConfig.fields.map(f => (
                    <th key={f.key} className="text-left font-semibold p-2 min-w-[80px] whitespace-nowrap">
                      {f.csvColumn}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {validationResult.validData.slice(0, 20).map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="p-2 text-center text-muted-foreground font-mono">{idx + 1}</td>
                    {tabConfig.fields.map(f => (
                      <td key={f.key} className="p-2 max-w-[150px] truncate">
                        {row[f.csvColumn] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {validationResult.validData.length > 20 && (
          <p className="text-[10px] text-muted-foreground text-center">
            Showing first 20 of {validationResult.validData.length} records
          </p>
        )}
      </div>
    );
  };

  const renderEvidenceStep = () => (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Upload supporting evidence documents for this submission:</p>
      <div className="space-y-2">
        {tabConfig.requiredEvidence.map((evidence) => (
          <div key={evidence} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">{evidence}</span>
            </div>
            <Button variant="outline" size="sm" className="text-[10px] h-6 px-2">
              <Upload className="h-3 w-3 mr-1" /> Upload
            </Button>
          </div>
        ))}
      </div>
      <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
        <p className="text-[10px] text-muted-foreground">
          <span className="font-medium text-indigo-600">Tip:</span> Evidence documents support PDF, DOCX, XLSX, and ZIP formats up to 25MB each.
        </p>
      </div>
    </div>
  );

  const renderSubmitStep = () => (
    <div className="space-y-4 text-center py-4">
      <CheckCircle2 className="h-16 w-16 mx-auto text-emerald-500" />
      <div>
        <h4 className="text-base font-semibold">Ready to Submit!</h4>
        <p className="text-xs text-muted-foreground mt-1">
          {validationResult?.validRows || 0} valid records will be submitted for review.
        </p>
        {validationResult && validationResult.invalidRows > 0 && (
          <p className="text-[10px] text-amber-600 mt-1">
            {validationResult.invalidRows} invalid records will be skipped.
          </p>
        )}
      </div>
      <div className="p-3 rounded-lg bg-muted/50 text-left">
        <p className="text-[10px] text-muted-foreground">Workflow Status:</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-[9px] bg-indigo-500/10 text-indigo-600">Submitted</Badge>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Awaiting HOD Review</span>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'upload':
        return renderUploadStep();
      case 'mapping':
        return renderMappingStep();
      case 'validate':
        return renderValidateStep();
      case 'preview':
        return renderPreviewStep();
      case 'evidence':
        return renderEvidenceStep();
      case 'submit':
        return renderSubmitStep();
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden !flex !flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-base">CSV Upload - {tabConfig.label}</DialogTitle>
          <DialogDescription className="text-xs">
            Upload and validate data with duplicate detection and field validation
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-1 py-3 shrink-0">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all',
                    isCompleted && 'bg-emerald-500 border-emerald-500 text-white',
                    isActive && 'border-primary bg-primary/10 text-primary',
                    !isActive && !isCompleted && 'border-muted-foreground/30 text-muted-foreground/40',
                  )}>
                    {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3 w-3" />}
                  </div>
                  <span className={cn('text-[8px] mt-1 font-medium',
                    isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn('h-0.5 w-3 mx-0.5 rounded-full', isCompleted ? 'bg-emerald-500' : 'bg-muted-foreground/20')} />
                )}
              </div>
            );
          })}
        </div>

        {/* Scrollable Step Content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-1 py-2">
          {renderStepContent()}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t shrink-0">
          <Button variant="ghost" size="sm" className="text-xs" onClick={handleBack} disabled={currentStepIndex === 0}>
            Back
          </Button>
          <Button
            size="sm"
            className="text-xs"
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Submitting...
              </>
            ) : currentStep === 'submit' ? (
              'Submit & Close'
            ) : (
              'Next'
            )}
            {!isSubmitting && currentStep !== 'submit' && <ArrowRight className="h-3 w-3 ml-1" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
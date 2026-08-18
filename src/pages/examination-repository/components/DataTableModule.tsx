import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Download,
  Eye,
  ArrowUpDown,
  FileText,
  Paperclip,
  RefreshCw,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Lock,
  FileUp,
  FileDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { FieldConfig, ModuleConfig } from '../types';
import { cn } from '@/lib/utils';
import { useReadOnly } from '@/hooks/useReadOnly';
import { institutionAdminService } from '@/services/institution-admin.service';
import {
  examinationRepositoryService,
  ExaminationEvidenceFile,
} from '@/services/examination-repository.service';
import {
  ExaminationEvidenceDialog,
  MODULE_EVIDENCE_SECTIONS,
} from './ExaminationEvidenceDialog';
import { CsvUploadDialog } from './CsvUploadDialog';
import {
  scheduleCsvConfig,
  circularCsvConfig,
  resultPublicationCsvConfig,
  supplementaryExaminationCsvConfig,
} from './csv-module-config';

interface DataTableModuleProps {
  config: ModuleConfig;
  academicYear: string;
}

/** Modules that support evidence upload */
const EVIDENCE_ENABLED_MODULES = new Set([
  'examination-schedules',
  'examination-circulars',
  'result-publications',
  'supplementary-examinations',
]);

/** Modules that support CSV template download + bulk upload. */
const CSV_UPLOAD_ENABLED_MODULES = new Set([
  'examination-schedules',
  'examination-circulars',
  'result-publications',
  'supplementary-examinations',
]);

const PER_PAGE = 10;

/** Sentinel used for the "Not specified" option in optional autofetched selects. */
const NO_SELECTION = '__none__';

type Row = Record<string, string | number>;

/**
 * Resolve a search term to an examination type value when the term is the
 * exact display value of an examination type or a unique prefix of one
 * (e.g. "End Semester" → "End Semester Examination").
 *
 * The backend also matches examination type in its generic `search` clause;
 * routing unambiguous terms to the exact `examinationType` filter keeps the
 * same behaviour while staying efficient.
 */
function resolveExaminationTypeSearch(
  term: string,
  options: string[]
): string | undefined {
  const normalized = term.trim().toLowerCase();
  if (!normalized || options.length === 0) return undefined;
  const matches = options.filter((option) =>
    option.toLowerCase().startsWith(normalized)
  );
  return matches.length === 1 ? matches[0] : undefined;
}

/** Normalize a backend time value ("09:00:00" or "09:00") to HH:mm for display. */
function formatTime(value: string): string {
  if (!value) return '';
  return value.split(':').slice(0, 2).join(':');
}

/**
 * Small color-coded progress bar for percentage values in the list
 * (green ≥ 75, amber ≥ 50, red < 50).
 */
function ProgressValue({ value }: { value: string | number }) {
  if (value === '' || value === null || value === undefined) {
    return <span className="text-xs text-muted-foreground">-</span>;
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return <span className="text-xs text-muted-foreground">{String(value)}</span>;
  }
  const clamped = Math.min(Math.max(num, 0), 100);
  // Keep the displayed value tidy even if the backend sends long decimals.
  const display = Math.round(num * 100) / 100;
  const tone = display >= 75 ? 'emerald' : display >= 50 ? 'amber' : 'red';
  const barClass =
    tone === 'emerald' ? 'bg-emerald-500' : tone === 'amber' ? 'bg-amber-500' : 'bg-red-500';
  const textClass =
    tone === 'emerald'
      ? 'text-emerald-600'
      : tone === 'amber'
      ? 'text-amber-600'
      : 'text-red-600';
  return (
    <div className="flex items-center justify-end gap-1.5">
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full', barClass)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className={cn('text-xs font-medium', textClass)}>{display}</span>
    </div>
  );
}

export function DataTableModule({ config, academicYear }: DataTableModuleProps) {
  const isReadOnly = useReadOnly();

  // ── List state (server-driven) ──
  const [records, setRecords] = useState<Row[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Search / sort ──
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // ── Evidence (server-backed, module scope) ──
  const [moduleEvidence, setModuleEvidence] = useState<ExaminationEvidenceFile[]>([]);

  // ── Institution reference data (autofetched for fields with `autofetch`) ──
  const [programOptions, setProgramOptions] = useState<string[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);

  useEffect(() => {
    const needsPrograms = config.fields.some((f) => f.autofetch === 'programs');
    const needsDepartments = config.fields.some(
      (f) => f.autofetch === 'departments'
    );
    if (needsPrograms) {
      institutionAdminService
        .getPrograms()
        .then((list) =>
          setProgramOptions(
            list
              .filter((p) => p.status === 'ACTIVE')
              .map((p) => p.name)
              .sort((a, b) => a.localeCompare(b))
          )
        )
        .catch(() => setProgramOptions([]));
    }
    if (needsDepartments) {
      institutionAdminService
        .getDepartments()
        .then((list) =>
          setDepartmentOptions(
            list
              .filter((d) => d.status === 'ACTIVE')
              .map((d) => d.name)
              .sort((a, b) => a.localeCompare(b))
          )
        )
        .catch(() => setDepartmentOptions([]));
    }
  }, [config]);

  // ── Dialogs ──
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Row | null>(null);
  const [viewingRow, setViewingRow] = useState<Row | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  const [evidenceTargetRecord, setEvidenceTargetRecord] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // ── CSV upload (preview + validate dialog) ──
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);

  // ── Form validation ──
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  /**
   * Live date/time relationship errors. Re-computed on every render so they
   * appear as soon as an invalid combination is entered and clear the moment
   * the user fixes the values.
   */
  const getLiveDateErrors = useCallback((row: Row | null): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!row) return errors;
    const startDate = String(row.startDate || '');
    const endDate = String(row.endDate || '');
    const startTime = String(row.startTime || '');
    const endTime = String(row.endTime || '');
    // ISO dates (yyyy-MM-dd) and 24h times (HH:mm) compare correctly as strings
    if (startDate && endDate && startDate > endDate) {
      errors.endDate = 'End Date cannot be before Start Date';
    }
    if (
      startDate &&
      endDate &&
      startDate === endDate &&
      startTime &&
      endTime &&
      startTime >= endTime
    ) {
      errors.endTime = 'End Time must be after Start Time on the same day';
    }
    return errors;
  }, []);

  /** Update a form field and clear its validation error (if any). */
  const updateRowField = useCallback(
    (key: string, value: string | number) => {
      setEditingRow((prev) => {
        if (!prev) return null;
        const next = { ...prev, [key]: value };
        // Recalculate read-only derived fields (e.g. passPercentage =
        // totalStudentsPassed / totalStudentsAppeared * 100) whenever one of
        // their source fields changes.
        const derived = config.fields.find(
          (f) => f.autoCalculateFrom && f.autoCalculateFrom.includes(key)
        );
        if (derived && derived.autoCalculateFrom) {
          const [numeratorKey, denominatorKey] = derived.autoCalculateFrom;
          const numerator = Number(next[numeratorKey]);
          const denominator = Number(next[denominatorKey]);
          next[derived.key] =
            denominator > 0 && Number.isFinite(numerator)
              ? Math.round((numerator / denominator) * 10000) / 100
              : '';
        }
        return next;
      });
      setFormErrors((prev) => {
        if (!(key in prev)) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [config.fields]
  );

  const evidenceEnabled = EVIDENCE_ENABLED_MODULES.has(config.id);
  // Examination Circulars renders a compact document icon inside the Actions
  // column instead of a dedicated Documents table column.
  const isCircularsModule = config.id === 'examination-circulars';
  const showDocumentAction = evidenceEnabled && isCircularsModule;
  const showEvidenceColumn = evidenceEnabled && !showDocumentAction;
  const csvUploadEnabled = CSV_UPLOAD_ENABLED_MODULES.has(config.id);
  // CSV upload descriptor for this module (columns + validation rules).
  const csvConfig =
    config.id === 'examination-circulars'
      ? circularCsvConfig
      : config.id === 'result-publications'
      ? resultPublicationCsvConfig
      : config.id === 'supplementary-examinations'
      ? supplementaryExaminationCsvConfig
      : scheduleCsvConfig;
  // Table columns come from the module config when provided, otherwise fall
  // back to the first few fields. A time field rendered under its matching
  // date field (startTime under startDate) is resolved here.
  const visibleFields = useMemo(() => {
    if (config.tableFields && config.tableFields.length > 0) {
      return config.tableFields
        .map((key) => config.fields.find((f) => f.key === key))
        .filter((f): f is NonNullable<typeof f> => Boolean(f));
    }
    return config.fields.slice(0, 5);
  }, [config]);
  const formFields = config.fields.filter((f) => f.type !== 'file');

  /** Find the sibling *Time field for a date field (startDate → startTime). */
  const getTimeSibling = useCallback(
    (fieldKey: string) =>
      config.fields.find(
        (f) => f.type === 'time' && f.key === `${fieldKey.replace(/Date$/, '')}Time`
      ),
    [config.fields]
  );

  /**
   * Resolve the option list for a field: autofetched institution reference
   * data (programs / departments) or the field's static options.
   */
  const getFieldOptions = useCallback(
    (field: FieldConfig): string[] => {
      if (field.autofetch === 'programs') return programOptions;
      if (field.autofetch === 'departments') return departmentOptions;
      return field.options ?? [];
    },
    [programOptions, departmentOptions]
  );

  /** Convert a backend record into the row shape the table renders */
  const toRow = useCallback(
    (rec: Record<string, unknown>): Row => {
      const row: Row = { id: String(rec.id ?? '') };
      config.fields.forEach((f) => {
        const v = rec[f.key];
        row[f.key] = (v as string | number) ?? '';
      });
      return row;
    },
    [config.fields]
  );

  // ── Debounce search input ──
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortField, sortDir, academicYear]);

  // ── Fetch records ──
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const params: Record<string, unknown> = {
        academicYear,
        page: currentPage - 1,
        size: PER_PAGE,
      };
      if (debouncedSearch) {
        const examinationTypeField = config.fields.find(
          (f) => f.key === 'examinationType'
        );
        const examinationType = resolveExaminationTypeSearch(
          debouncedSearch,
          examinationTypeField?.options ?? []
        );
        if (examinationType) {
          params.examinationType = examinationType;
        } else {
          params.search = debouncedSearch;
        }
      }
      if (sortField) {
        params.sortBy = sortField;
        params.sortDirection = sortDir.toUpperCase();
      }
      const data = await examinationRepositoryService.getModuleRecords<Record<string, unknown>>(
        config.id,
        params as never
      );
      setRecords(data.content.map(toRow));
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
      if (data.totalPages > 0 && currentPage > data.totalPages) {
        setCurrentPage(data.totalPages);
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load records');
      setRecords([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [config.id, academicYear, currentPage, debouncedSearch, sortField, sortDir, toRow]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // ── Fetch module evidence (used for the Documents column and the compact
  // ── document action on Examination Circulars) ──
  const fetchModuleEvidence = useCallback(async () => {
    if (!evidenceEnabled) return;
    try {
      const data = await examinationRepositoryService.getEvidence({
        moduleId: config.id,
        academicYear,
        page: 0,
        size: 500,
      });
      setModuleEvidence(data.content);
    } catch {
      // Evidence is secondary — never block the table on it
      setModuleEvidence([]);
    }
  }, [config.id, academicYear, evidenceEnabled]);

  useEffect(() => {
    fetchModuleEvidence();
  }, [fetchModuleEvidence]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleAddNew = () => {
    const emptyRow: Row = { id: '' };
    config.fields.forEach((f) => {
      // Derived (auto-calculated) fields start empty instead of 0.
      emptyRow[f.key] =
        f.autoCalculateFrom ? '' : f.type === 'number' ? 0 : '';
    });
    emptyRow['academicYear'] = academicYear;
    setEditingRow(emptyRow);
    setIsNewRecord(true);
    setFormErrors({});
    setEditDialogOpen(true);
  };

  const handleEdit = (row: Row) => {
    setEditingRow({ ...row });
    setIsNewRecord(false);
    setFormErrors({});
    setEditDialogOpen(true);
  };

  const handleView = (row: Row) => {
    setViewingRow(row);
    setViewDialogOpen(true);
  };

  const handleDelete = async (row: Row) => {
    const id = String(row.id);
    if (!id) return;
    if (
      !window.confirm(
        `Delete this ${config.label.replace(/s$/, '').toLowerCase()} record? This cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await examinationRepositoryService.deleteModuleRecord(config.id, id);
      toast.success('Record deleted successfully');
      if (records.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        fetchRecords();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete record');
    }
  };

  const handleSave = async () => {
    if (!editingRow) return;

    // ── Client-side validation (required fields + date/time relationships) ──
    const errors: Record<string, string> = {};
    formFields.forEach((f) => {
      if (f.required && !String(editingRow[f.key] ?? '').trim()) {
        errors[f.key] = `${f.label} is required`;
      }
    });
    Object.assign(errors, getLiveDateErrors(editingRow));
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error(Object.values(errors)[0]);
      return;
    }

    const payload: Record<string, unknown> = {};
    formFields.forEach((f) => {
      const v = editingRow[f.key];
      payload[f.key] = v;
    });
    // NOTE: startTime/endTime and the autofetched program/department names are
    // sent as-is; the backend validates the period and resolves the reference
    // columns from the institution's configured entities.
    try {
      if (isNewRecord) {
        await examinationRepositoryService.createModuleRecord(config.id, payload);
        toast.success(`${config.label.replace(/s$/, '')} created successfully`);
        setCurrentPage(1);
      } else {
        const id = String(editingRow.id);
        if (!id) throw new Error('Record id is missing');
        await examinationRepositoryService.updateModuleRecord(config.id, id, payload);
        toast.success(`${config.label.replace(/s$/, '')} updated successfully`);
      }
      setEditDialogOpen(false);
      setEditingRow(null);
      fetchRecords();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save record');
    }
  };

  const handleExportCSV = async () => {
    try {
      const exportParams: Record<string, unknown> = { academicYear };
      if (debouncedSearch) {
        const examinationTypeField = config.fields.find(
          (f) => f.key === 'examinationType'
        );
        const examinationType = resolveExaminationTypeSearch(
          debouncedSearch,
          examinationTypeField?.options ?? []
        );
        if (examinationType) {
          exportParams.examinationType = examinationType;
        } else {
          exportParams.search = debouncedSearch;
        }
      }
      await examinationRepositoryService.exportModuleCsv(config.id, exportParams);
      toast.success('CSV export started — check your downloads');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to export CSV');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      // Filename comes from the backend Content-Disposition header.
      await examinationRepositoryService.downloadModuleTemplate(config.id);
      toast.success('Template downloaded — check your downloads');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to download template');
    }
  };

  // Get the record title for display / evidence attribution
  const getRecordTitle = (row: Row): string => {
    return String(
      row.title ||
        row.examinationName ||
        row.circularNumber ||
        row.subjectName ||
        Object.values(row).find((v) => typeof v === 'string' && String(v).length > 10) ||
        'Record'
    );
  };

  // Get evidence files for a specific record (from server-backed module scope)
  const getEvidenceForRow = (row: Row): ExaminationEvidenceFile[] => {
    const id = String(row.id);
    if (!id) return [];
    return moduleEvidence.filter((f) => f.recordId === id);
  };

  const getSectionCounts = (row: Row) => {
    const sectionConfigs = MODULE_EVIDENCE_SECTIONS[config.id];
    if (!sectionConfigs) return [];
    const rowEvidence = getEvidenceForRow(row);
    return sectionConfigs.map((s) => ({
      id: s.id,
      count: rowEvidence.filter((f) => f.sectionId === s.id).length,
    }));
  };

  const openEvidenceDialog = (row: Row) => {
    const id = String(row.id);
    if (!id) return;
    setEvidenceTargetRecord({ id, title: getRecordTitle(row) });
    setEvidenceDialogOpen(true);
  };

  /** Delete uploaded document(s) for a record (used by the compact document action). */
  const handleDeleteEvidence = async (files: ExaminationEvidenceFile[]) => {
    if (files.length === 0) return;
    const label =
      files.length === 1 ? `"${files[0].name}"` : `${files.length} documents`;
    if (
      !window.confirm(
        `Delete ${label} for this ${config.label
          .replace(/s$/, '')
          .toLowerCase()}? This cannot be undone.`
      )
    ) {
      return;
    }
    try {
      for (const f of files) {
        await examinationRepositoryService.deleteEvidence(f.id);
      }
      toast.success(
        files.length === 1 ? 'Document deleted successfully' : 'Documents deleted successfully'
      );
      await fetchModuleEvidence();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete document');
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'published') return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 text-[10px]">Published</Badge>;
    if (s === 'draft') return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px]">Draft</Badge>;
    if (s === 'archived') return <Badge variant="secondary" className="text-[10px]">Archived</Badge>;
    return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
  };

  const tableStart = totalElements === 0 ? 0 : (currentPage - 1) * PER_PAGE + 1;
  const tableEnd = Math.min(currentPage * PER_PAGE, totalElements);

  // Live date/time relationship errors shown inline as the user edits
  const liveDateErrors = getLiveDateErrors(editingRow);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{config.label}</h3>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV} disabled={loading}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          {csvUploadEnabled && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleDownloadTemplate}
              >
                <FileDown className="h-4 w-4" />
                Template
              </Button>
              {!isReadOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setCsvDialogOpen(true)}
                >
                  <FileUp className="h-4 w-4" />
                  Upload CSV
                </Button>
              )}
            </>
          )}
          {!isReadOnly && (
            <Button size="sm" className="gap-2" onClick={handleAddNew}>
              <Plus className="h-4 w-4" />
              Add Record
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={`Search ${config.label.toLowerCase()}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Error banner */}
      {loadError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-xs text-destructive flex-1">{loadError}</p>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={fetchRecords}>
            Retry
          </Button>
        </div>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{config.label} Records</CardTitle>
            <div className="flex items-center gap-2">
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
              <Badge variant="secondary">{totalElements} records</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleFields.map((field) => (
                    <TableHead
                      key={field.key}
                      className={cn(
                        'whitespace-nowrap text-xs cursor-pointer hover:text-foreground',
                        field.type === 'number' && 'text-right'
                      )}
                      onClick={() => handleSort(field.key)}
                    >
                      <div
                        className={cn(
                          'flex items-center gap-1',
                          field.type === 'number' && 'justify-end'
                        )}
                      >
                        {field.tableLabel ?? field.label}
                        {sortField === field.key && (
                          <ArrowUpDown className={cn(
                            'h-3 w-3',
                            sortDir === 'asc' ? 'rotate-0' : 'rotate-180'
                          )} />
                        )}
                      </div>
                    </TableHead>
                  ))}
                  {showEvidenceColumn && (
                    <TableHead className="whitespace-nowrap text-xs text-center">
                      Documents
                    </TableHead>
                  )}
                  <TableHead className="text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && records.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={visibleFields.length + (showEvidenceColumn ? 1 : 0) + 1}
                      className="text-center py-10"
                    >
                      <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Loading records...</p>
                    </TableCell>
                  </TableRow>
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={visibleFields.length + (showEvidenceColumn ? 1 : 0) + 1}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {loadError ? 'Unable to load records' : 'No records found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((row, idx) => {
                    const rowEvidence = getEvidenceForRow(row);
                    const sectionCounts = getSectionCounts(row);
                    const totalFiles = rowEvidence.length;

                    return (
                      <TableRow key={String(row.id) || idx} className="hover:bg-muted/50">
                        {visibleFields.map((field) => {
                          const timeSibling =
                            field.type === 'date'
                              ? getTimeSibling(field.key)
                              : undefined;
                          const siblingTime = timeSibling
                            ? String(row[timeSibling.key] || '')
                            : '';
                          return (
                            <TableCell
                              key={field.key}
                              className={cn(
                                'text-sm whitespace-nowrap max-w-[200px] truncate',
                                field.type === 'number' && 'text-right'
                              )}
                            >
                              {field.key === 'status' ? (
                                getStatusBadge(String(row[field.key] || ''))
                              ) : field.type === 'textarea' ? (
                                <span className="text-xs text-muted-foreground truncate block max-w-[180px]">
                                  {String(row[field.key] || '-')}
                                </span>
                              ) : timeSibling && siblingTime ? (
                                <div className="flex flex-col leading-tight">
                                  <span>{String(row[field.key] || '-')}</span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {formatTime(siblingTime)}
                                  </span>
                                </div>
                              ) : field.type === 'time' ? (
                                formatTime(String(row[field.key] || '')) || '-'
                              ) : field.progress ? (
                                <ProgressValue value={row[field.key]} />
                              ) : (
                                row[field.key] === 0
                                  ? '0'
                                  : String(row[field.key] || '-')
                              )}
                            </TableCell>
                          );
                        })}
                        {showEvidenceColumn && (
                          <TableCell className="text-center">
                            {totalFiles > 0 ? (
                              <Badge
                                variant="secondary"
                                className="gap-1 text-[10px] cursor-pointer"
                                onClick={() => openEvidenceDialog(row)}
                                title="Manage documents"
                              >
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                {totalFiles} file{totalFiles > 1 ? 's' : ''}
                              </Badge>
                            ) : isReadOnly ? (
                              <span className="text-[10px] text-muted-foreground italic">None</span>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                                onClick={() => openEvidenceDialog(row)}
                              >
                                <Paperclip className="h-3 w-3" />
                                Upload
                              </Button>
                            )}
                          </TableCell>
                        )}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {showDocumentAction &&
                              (rowEvidence.length === 0 ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-primary"
                                  onClick={() => openEvidenceDialog(row)}
                                  title="Upload document"
                                  disabled={isReadOnly}
                                >
                                  <Paperclip className="h-3.5 w-3.5" />
                                </Button>
                              ) : (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="relative h-7 w-7 text-emerald-600"
                                      title="Manage document"
                                    >
                                      <Paperclip className="h-3.5 w-3.5" />
                                      {rowEvidence.length > 1 && (
                                        <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-white">
                                          {rowEvidence.length}
                                        </span>
                                      )}
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel className="text-[11px] text-muted-foreground">
                                      Uploaded Document
                                    </DropdownMenuLabel>
                                    {rowEvidence.map((f) => (
                                      <DropdownMenuItem
                                        key={f.id}
                                        className="gap-2 text-xs"
                                        onClick={() =>
                                          examinationRepositoryService.downloadEvidence(f.id, f.name)
                                        }
                                      >
                                        <Download className="h-3.5 w-3.5" />
                                        <span className="truncate">{f.name}</span>
                                      </DropdownMenuItem>
                                    ))}
                                    {!isReadOnly && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="gap-2 text-xs"
                                          onClick={() => openEvidenceDialog(row)}
                                        >
                                          <RefreshCw className="h-3.5 w-3.5" />
                                          Replace
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="gap-2 text-xs text-destructive focus:text-destructive"
                                          onClick={() => handleDeleteEvidence(rowEvidence)}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                          Delete
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              ))}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleView(row)}
                              title="View details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {!isReadOnly && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleEdit(row)}
                                  title="Edit"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => handleDelete(row)}
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted-foreground">
                Showing {tableStart} to {tableEnd} of {totalElements} records
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 w-7 text-xs p-0"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{config.label} Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {config.fields
              .filter((f) => !(isCircularsModule && f.type === 'file'))
              .map((field) => (
                <div key={field.key} className="flex items-start gap-3">
                  <span className="text-xs font-medium text-muted-foreground w-36 shrink-0">
                    {field.label}
                  </span>
                  <span className="text-sm">
                    {field.key === 'status'
                      ? getStatusBadge(String(viewingRow?.[field.key] || ''))
                      : field.type === 'time'
                      ? formatTime(String(viewingRow?.[field.key] || '')) || '-'
                      : field.type === 'textarea'
                      ? String(viewingRow?.[field.key] || '-')
                      : String(viewingRow?.[field.key] || '-')}
                  </span>
                </div>
              ))}
            {/* Document management section in view dialog */}
            {evidenceEnabled && viewingRow && (
              <div key="evidence-section" className="flex items-start gap-3 pt-2 border-t">
                <span className="text-xs font-medium text-muted-foreground w-36 shrink-0">
                  {isCircularsModule ? 'Document' : 'Evidence Files'}
                </span>
                {(() => {
                  const evidence = getEvidenceForRow(viewingRow);
                  if (evidence.length === 0) {
                    // Other modules keep their original behaviour (nothing to
                    // show); circulars surface the upload action here.
                    if (!isCircularsModule) return null;
                    return (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          No document uploaded
                        </span>
                        {!isReadOnly && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            onClick={() => openEvidenceDialog(viewingRow)}
                          >
                            <Upload className="h-3 w-3" />
                            Upload
                          </Button>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div className="flex-1 space-y-1.5 min-w-0">
                      {evidence.map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center gap-2 rounded-lg border border-border/50 px-2.5 py-1.5"
                        >
                          <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-xs truncate flex-1" title={f.name}>
                            {f.name}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            title="Download"
                            onClick={() =>
                              examinationRepositoryService.downloadEvidence(f.id, f.name)
                            }
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          {!isReadOnly && isCircularsModule && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                title="Replace"
                                onClick={() => openEvidenceDialog(viewingRow)}
                              >
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                title="Delete"
                                onClick={() => handleDeleteEvidence(evidence)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      ))}
                      {!isReadOnly && isCircularsModule && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1 text-xs"
                          onClick={() => openEvidenceDialog(viewingRow)}
                        >
                          <Paperclip className="h-3 w-3" />
                          Manage Document
                        </Button>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Add Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isNewRecord ? `New ${config.label}` : `Edit ${config.label}`}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {formFields.map((field) => {
              const fieldError = formErrors[field.key] || liveDateErrors[field.key];
              return (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {field.label}
                    {field.required && <span className="text-destructive ml-0.5">*</span>}
                  </Label>
                  {field.type === 'select' ||
                  (field.autofetch && getFieldOptions(field).length > 0) ? (
                    <Select
                      value={String(editingRow?.[field.key] || '')}
                      onValueChange={(val) =>
                        updateRowField(field.key, val === NO_SELECTION ? '' : val)
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder={`Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.autofetch && !field.required && (
                          <SelectItem value={NO_SELECTION}>Not specified</SelectItem>
                        )}
                        {getFieldOptions(field).map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === 'textarea' ? (
                    <Textarea
                      value={String(editingRow?.[field.key] || '')}
                      onChange={(e) => updateRowField(field.key, e.target.value)}
                      placeholder={field.placeholder || `Enter ${field.label}`}
                      className="min-h-[80px] text-sm"
                    />
                  ) : field.type === 'date' ? (
                    <DatePicker
                      value={String(editingRow?.[field.key] || '')}
                      onChange={(val) => updateRowField(field.key, val)}
                      placeholder={`Select ${field.label}`}
                      className="h-9 text-sm"
                    />
                  ) : field.type === 'time' ? (
                    <TimePicker
                      value={formatTime(String(editingRow?.[field.key] || ''))}
                      onChange={(val) => updateRowField(field.key, val)}
                      placeholder={`Select ${field.label}`}
                      className="h-9 text-sm"
                    />
                  ) : (
                    <div className="relative">
                      <Input
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={String(editingRow?.[field.key] || '')}
                        disabled={field.readOnly}
                        onChange={(e) =>
                          updateRowField(
                            field.key,
                            field.type === 'number' ? Number(e.target.value) : e.target.value
                          )
                        }
                        placeholder={field.placeholder || `Enter ${field.label}`}
                        className={cn(
                          'h-9',
                          field.readOnly &&
                            'bg-muted/50 cursor-not-allowed opacity-100 pr-8'
                        )}
                      />
                      {field.readOnly && (
                        <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                      )}
                    </div>
                  )}
                  {fieldError && (
                    <p className="text-[11px] text-destructive">{fieldError}</p>
                  )}
                  {field.readOnly && !fieldError && (
                    <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Lock className="h-2.5 w-2.5" />
                      {field.readOnlyHint ?? 'Fixed to the selected academic year'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Document management section (Examination Circulars) */}
          {showDocumentAction && editingRow && (
            <div className="border-t pt-4 pb-2 space-y-3">
              <div>
                <Label className="text-xs font-medium">Document</Label>
                <p className="text-[10px] text-muted-foreground">
                  Attach, replace or delete the official circular document
                </p>
              </div>
              {isNewRecord ? (
                <p className="text-xs text-muted-foreground">
                  Save the circular first, then you can attach a document.
                </p>
              ) : (() => {
                const editEvidence = getEvidenceForRow(editingRow);
                if (editEvidence.length === 0) {
                  return (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">No document uploaded</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        onClick={() => openEvidenceDialog(editingRow)}
                      >
                        <Upload className="h-3 w-3" />
                        Upload Document
                      </Button>
                    </div>
                  );
                }
                return (
                  <div className="space-y-1.5">
                    {editEvidence.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center gap-2 rounded-lg border border-border/50 px-2.5 py-1.5"
                      >
                        <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-xs truncate flex-1" title={f.name}>
                          {f.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          title="Download"
                          onClick={() =>
                            examinationRepositoryService.downloadEvidence(f.id, f.name)
                          }
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        {!isReadOnly && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              title="Replace"
                              onClick={() => openEvidenceDialog(editingRow)}
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              title="Delete"
                              onClick={() => handleDeleteEvidence(editEvidence)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isNewRecord ? 'Add Record' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Upload Dialog (preview + client-side validation) */}
      {csvUploadEnabled && (
        <CsvUploadDialog
          open={csvDialogOpen}
          onClose={() => setCsvDialogOpen(false)}
          config={config}
          csvConfig={csvConfig}
          academicYear={academicYear}
          programOptions={programOptions}
          departmentOptions={departmentOptions}
          onUploaded={fetchRecords}
        />
      )}

      {/* Evidence Dialog (server-backed upload / download / delete) */}
      {evidenceTargetRecord && (
        <ExaminationEvidenceDialog
          recordId={evidenceTargetRecord.id}
          recordTitle={evidenceTargetRecord.title}
          moduleId={config.id}
          moduleLabel={config.label}
          academicYear={academicYear}
          open={evidenceDialogOpen}
          onClose={() => {
            setEvidenceDialogOpen(false);
            setEvidenceTargetRecord(null);
          }}
          existingFiles={getEvidenceForRow(
            records.find((r) => String(r.id) === evidenceTargetRecord.id) || {}
          )}
          onChanged={fetchModuleEvidence}
        />
      )}
    </div>
  );
}

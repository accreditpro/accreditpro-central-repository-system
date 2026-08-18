import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { useReadOnly } from '@/hooks/useReadOnly';
import { TPOTabConfig } from '../tpo-configs';
import { TPOEvidenceDialog, TPOEvidence, EvidenceBadge, TPOEvidenceSectionConfig } from './TPOEvidenceDialog';
import { TpoCsvUploadDialog } from './TpoCsvUploadDialog';
import { tpoRepositoryService } from '@/services/tpo.service';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Download,
  FileText,
  CheckCircle2,
  Building2,
  Paperclip,
  FileCheck,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

type DataRow = Record<string, string | number>;

// ============================================================
// PROPS
// ============================================================

interface TPOSectionViewProps {
  tabConfig: TPOTabConfig;
  departmentId: number;
  academicYear: string;
  getRecordTitle: (row: DataRow) => string;
  getIcon?: (row: DataRow) => React.ReactNode;
  evidenceSectionConfigs?: TPOEvidenceSectionConfig[];
  statsConfig?: {
    icon: React.ReactNode;
    label: string;
    color: string;
    bgClass: string;
    getValue: (stats: { total: number; withDocs: number; totalFiles: number }) => string | number;
  }[];
}

const PAGE_SIZE = 10;

// ============================================================
// SECTION VIEW COMPONENT
// ============================================================

export function TPOSectionView({
  tabConfig,
  departmentId,
  academicYear,
  getRecordTitle,
  getIcon,
  statsConfig,
  evidenceSectionConfigs,
}: TPOSectionViewProps) {
  const isReadOnly = useReadOnly();
  const [records, setRecords] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sectionStats, setSectionStats] = useState<{ total: number; withDocs: number; totalFiles: number }>({
    total: 0,
    withDocs: 0,
    totalFiles: 0,
  });
  // Per-record evidence, keyed by String(record.id).
  const [evidenceMap, setEvidenceMap] = useState<Record<string, TPOEvidence | null>>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<DataRow | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<{ id: number; name: string } | null>(null);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const searchTimer = useRef<number | null>(null);

  const fields = tabConfig.fields;
  const visibleFields = fields.slice(0, 6);

  const flatten = useCallback((row: { id: number; recordData?: Record<string, unknown> }): DataRow => {
    const flat: DataRow = { id: row.id };
    Object.entries(row.recordData || {}).forEach(([key, value]) => {
      flat[key] = typeof value === 'number' ? value : String(value ?? '');
    });
    return flat;
  }, []);

  const fetchRecords = useCallback(
    async (query: string, targetPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await tpoRepositoryService.getSectionRecords(tabConfig.id, {
          departmentId,
          academicYear,
          search: query || undefined,
          page: targetPage,
          size: PAGE_SIZE,
        });
        setRecords(res.content.map(flatten));
        setTotalElements(res.totalElements || 0);
        setTotalPages(res.totalPages || 0);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load records');
        setRecords([]);
        setTotalElements(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    [tabConfig.id, departmentId, academicYear, flatten]
  );

  const fetchStats = useCallback(async () => {
    try {
      const res = await tpoRepositoryService.getSectionStats(tabConfig.id, departmentId, academicYear);
      const get = (key: string) => res.cards.find((c) => c.key === key)?.value ?? 0;
      setSectionStats({ total: get('totalRecords'), withDocs: get('withDocuments'), totalFiles: get('totalFiles') });
    } catch {
      // stats are supplementary — keep the last known values
    }
  }, [tabConfig.id, departmentId, academicYear]);

  const fetchEvidence = useCallback(async () => {
    try {
      const res = await tpoRepositoryService.getDocuments({
        departmentId,
        academicYear,
        sectionName: tabConfig.id,
        page: 0,
        size: 500,
      });
      const map: Record<string, TPOEvidence | null> = {};
      res.content.forEach((doc) => {
        const key = String(doc.recordId ?? '');
        if (!key) return;
        const existing = map[key] || { recordId: key, sections: {} };
        const type = doc.documentType || 'documents';
        existing.sections[type] = [
          ...(existing.sections[type] || []),
          { id: String(doc.id), name: doc.documentName, size: doc.size || 0, type: 'application/octet-stream', uploadedAt: doc.uploadedAt || '' },
        ];
        map[key] = existing;
      });
      setEvidenceMap(map);
    } catch {
      // evidence badges are supplementary
    }
  }, [departmentId, academicYear, tabConfig.id]);

  useEffect(() => {
    fetchRecords(debouncedSearch, page);
    fetchStats();
    fetchEvidence();
  }, [fetchRecords, fetchStats, fetchEvidence, debouncedSearch, page]);

  useEffect(() => {
    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      setDebouncedSearch(value);
      setPage(0);
    }, 400);
  };

  // Filtered records (server-side search already applies; keep a client filter
  // for instant feedback on the loaded page).
  const filteredRecords = useMemo(() => {
    if (!debouncedSearch) return records;
    const q = debouncedSearch.toLowerCase();
    return records.filter((r) =>
      Object.entries(r).some(([key, val]) => key !== 'id' && String(val).toLowerCase().includes(q))
    );
  }, [records, debouncedSearch]);

  // Default stats if not provided
  const defaultStats = [
    {
      icon: <Building2 className="h-4 w-4" />,
      label: `Total ${tabConfig.label}`,
      color: 'text-indigo-600',
      bgClass: 'bg-indigo-500/10',
      getValue: (s: typeof sectionStats) => s.total,
    },
    {
      icon: <FileCheck className="h-4 w-4" />,
      label: 'With Documents',
      color: 'text-emerald-600',
      bgClass: 'bg-emerald-500/10',
      getValue: (s: typeof sectionStats) => s.withDocs,
    },
    {
      icon: <Paperclip className="h-4 w-4" />,
      label: 'Total Files',
      color: 'text-amber-600',
      bgClass: 'bg-amber-500/10',
      getValue: (s: typeof sectionStats) => s.totalFiles,
    },
  ];

  const displayStats = statsConfig || defaultStats;

  // ============ CRUD Handlers ============

  const handleAddNew = () => {
    const emptyRow: DataRow = {};
    fields.forEach((f) => {
      emptyRow[f.key] = '';
    });
    setEditingRow(emptyRow);
    setEditingId(null);
    setIsNewRecord(true);
    setEditDialogOpen(true);
  };

  const handleEdit = (row: DataRow) => {
    setEditingRow({ ...row });
    setEditingId(Number(row.id));
    setIsNewRecord(false);
    setEditDialogOpen(true);
  };

  const handleDelete = async (row: DataRow) => {
    setError(null);
    try {
      await tpoRepositoryService.deleteSectionRecord(tabConfig.id, Number(row.id), departmentId, academicYear);
      const remaining = records.length - 1;
      if (remaining === 0 && page > 0) {
        setPage(page - 1);
      } else {
        fetchRecords(debouncedSearch, page);
      }
      fetchStats();
      setSuccessMsg('Record removed successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete record');
    }
  };

  const handleSave = async () => {
    if (!editingRow) return;
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, string | number | null> = {};
      fields.forEach((f) => {
        const value = editingRow[f.key];
        if (value === undefined) return;
        if (value === '') {
          if (!isNewRecord) payload[f.key] = null;
        } else {
          payload[f.key] = value;
        }
      });
      if (isNewRecord) {
        await tpoRepositoryService.createSectionRecord(tabConfig.id, payload, departmentId, academicYear);
      } else if (editingId !== null) {
        await tpoRepositoryService.updateSectionRecord(tabConfig.id, editingId, payload, departmentId, academicYear);
      }
      setEditDialogOpen(false);
      setEditingRow(null);
      setEditingId(null);
      fetchRecords(debouncedSearch, page);
      fetchStats();
      setSuccessMsg(isNewRecord ? 'Record added successfully' : 'Record updated successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    tpoRepositoryService
      .exportSectionCsv(tabConfig.id, departmentId, academicYear, debouncedSearch || undefined)
      .catch(() => setError('Failed to export CSV'));
  };

  // ============ Evidence Handlers ============

  const handleOpenEvidence = (row: DataRow) => {
    const id = Number(row.id);
    setSelectedRecord({ id, name: getRecordTitle(row) });
    setEvidenceDialogOpen(true);
  };

  const handleEvidenceChange = (recordId: string, evidence: TPOEvidence) => {
    setEvidenceMap((prev) => ({ ...prev, [recordId]: evidence }));
    fetchStats();
  };

  // ============ Render ============

  const formatCellValue = (field: typeof fields[0], value: string | number): string => {
    if (value === '' || value === undefined || value === null) return '-';
    if (field.type === 'currency') {
      return `₹${Number(value).toLocaleString('en-IN')}`;
    }
    if (field.type === 'percentage') {
      return `${value}%`;
    }
    return String(value);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-600" />
            {tabConfig.label}
          </h3>
          <p className="text-sm text-muted-foreground">{tabConfig.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          {!isReadOnly && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setCsvDialogOpen(true)}
              >
                <Upload className="h-4 w-4" />
                CSV Upload
              </Button>
              <Button size="sm" className="gap-2" onClick={handleAddNew}>
                <Plus className="h-4 w-4" />
                Add Record
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        {displayStats.map((stat, idx) => (
          <Card key={idx} className="border-border/50">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`h-8 w-8 rounded-lg ${stat.bgClass} flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <p className={`text-lg font-bold ${stat.color}`}>
                  {stat.getValue(sectionStats)}
                </p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-xs font-medium text-emerald-700">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={`Search ${tabConfig.label.toLowerCase()}...`}
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Data Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              {tabConfig.label} Records
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              {loading ? '...' : totalElements} record{totalElements !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading records...</span>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No records found</p>
              {!isReadOnly && (
                <p className="text-xs text-muted-foreground mt-1">
                  Click "Add Record" to add a new entry
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-8">#</TableHead>
                    {visibleFields.map((field) => (
                      <TableHead key={field.key} className="whitespace-nowrap text-xs">
                        {field.label}
                      </TableHead>
                    ))}
                    <TableHead className="text-xs text-center">Documents</TableHead>
                    <TableHead className="text-right text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((row, idx) => {
                    const evidence = evidenceMap[String(row.id)] || null;
                    return (
                      <TableRow key={row.id} className="group">
                        <TableCell className="text-xs text-muted-foreground">{page * PAGE_SIZE + idx + 1}</TableCell>
                        {visibleFields.map((field) => (
                          <TableCell
                            key={field.key}
                            className="text-sm whitespace-nowrap max-w-[200px] truncate"
                          >
                            {getIcon ? (
                              <span className="flex items-center gap-2">
                                {getIcon(row)}
                                {formatCellValue(field, row[field.key])}
                              </span>
                            ) : (
                              formatCellValue(field, row[field.key])
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="text-center">
                          <button onClick={() => handleOpenEvidence(row)} className="inline-flex items-center gap-1">
                            <EvidenceBadge evidence={evidence} />
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {isReadOnly ? (
                              <span className="text-[10px] text-muted-foreground italic">Read-only</span>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleOpenEvidence(row)}
                                  title="Upload Documents"
                                >
                                  <Upload className="h-3.5 w-3.5 text-amber-500" />
                                </Button>
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
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {totalPages > 1 && (
          <CardContent className="p-3 pt-0">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={page === 0 || loading}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={page >= totalPages - 1 || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Edit/Add Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isNewRecord ? `Add New ${tabConfig.label.slice(0, -1)}` : 'Edit Record'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-xs font-medium">
                  {field.label}
                  {field.required && <span className="text-destructive ml-0.5">*</span>}
                </Label>
                {field.type === 'select' ? (
                  <Select
                    value={String(editingRow?.[field.key] || '')}
                    onValueChange={(val) =>
                      setEditingRow((prev) => (prev ? { ...prev, [field.key]: val } : null))
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={
                      field.type === 'number' || field.type === 'currency' || field.type === 'percentage'
                        ? 'number'
                        : field.type === 'date'
                        ? 'date'
                        : 'text'
                    }
                    value={String(editingRow?.[field.key] || '')}
                    onChange={(e) =>
                      setEditingRow((prev) =>
                        prev
                          ? {
                              ...prev,
                              [field.key]:
                                field.type === 'number' || field.type === 'currency' || field.type === 'percentage'
                                  ? Number(e.target.value)
                                  : e.target.value,
                            }
                          : null
                      )
                    }
                    placeholder={field.placeholder || `Enter ${field.label}`}
                    className="h-9"
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : isNewRecord ? `Add ${tabConfig.label.slice(0, -1)}` : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Upload Dialog */}
      <TpoCsvUploadDialog
        open={csvDialogOpen}
        onClose={() => setCsvDialogOpen(false)}
        sectionId={tabConfig.id}
        sectionLabel={tabConfig.label}
        departmentId={departmentId}
        academicYear={academicYear}
        onImported={() => {
          fetchRecords(debouncedSearch, page);
          fetchStats();
        }}
      />

      {/* Evidence Upload Dialog */}
      {selectedRecord && (
        <TPOEvidenceDialog
          recordId={selectedRecord.id}
          recordName={selectedRecord.name}
          sectionTitle={`Supporting Documents — ${tabConfig.label}`}
          open={evidenceDialogOpen}
          onClose={() => {
            setEvidenceDialogOpen(false);
            setSelectedRecord(null);
          }}
          onEvidenceChange={handleEvidenceChange}
          sectionConfigs={evidenceSectionConfigs}
          departmentId={departmentId}
          academicYear={academicYear}
          sectionName={tabConfig.id}
        />
      )}
    </div>
  );
}
